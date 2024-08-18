from functools import wraps
from flask import Flask, jsonify, Response, request, redirect, url_for
from werkzeug.utils import secure_filename
from cache import MemoryCache
from flask_cors import CORS
import os
from utils.readFile.ReadTxtSQl import ReadTXT
from utils.readFile.ReadPDF import ReadPDF
import pandas as pd
app = Flask(__name__)
CORS(app)
app.config['UPLOAD_FOLDER'] = '/path/uploads/'
# SETUP
cache = MemoryCache()

# from vanna.local import LocalContext_OpenAI
# vn = LocalContext_OpenAI()
from utils.Vanna import MyVanna
import utils.Variables as var
vn = MyVanna(config={'api_key': var.openai_api_key(), 'model': var.modelGPT(),'path':'./data'})
vn.connect_to_mssql(odbc_conn_str='DRIVER={ODBC Driver 17 for SQL Server};SERVER=server.database.windows.net;DATABASE=database;UID=user;PWD=password')


def requires_cache(fields):
    def decorator(f):
        @wraps(f)
        def decorated(*args, **kwargs):
            field_values = {'id':None,'sql':None, 'question':None}
            id = request.args.get('id')
            if id is not None:            
                for field in fields:
                    if cache.get(id=id, field=field) is None:
                        return jsonify({"type": "error", "error": f"No {field} found"})
                
                field_values = {field: cache.get(id=id, field=field) for field in fields}
                field_values['id'] = id

            return f(*args, **field_values, **kwargs)
        return decorated
    return decorator

@app.route('/api/v0/generate_questions', methods=['GET'])
def generate_questions():
    questionList = vn.generate_questions()
    return jsonify({
        "type": "question_list", 
        "questions": questionList[0:5],
        "header": "Aqui tienes algunas preguntas que puedes hacer:"
        })

@app.route('/api/v0/generate_sql', methods=["GET"])
@requires_cache(["sql","question"])
def generate_sql(id: str, sql: str,question: str):
    print('entre')
    newQuestion = request.args.get('question')
    print(newQuestion)
    if newQuestion is None:
        return jsonify({"type": "error", "error": "No question or new question provided"})
    
    if question is not None and sql is not None:
        question = f"Esté es el SQL que he intentado ejecutar: {sql}\n\n Puedes intentar corregir el SQL con la siguiente propuesta:{newQuestion}?"

    else:
        question = newQuestion
        id = cache.generate_id(question=question)
    sql = vn.generate_sql(question=question)
    cache.set(id=id, field='question', value=question)
    cache.set(id=id, field='sql', value=sql)

    cache.add_to_history(id, 'question', question)
    cache.add_to_history(id, 'sql', sql)
    print(question)
    return jsonify(
        {
            "type": "sql", 
            "id": id,
            "text": sql,
            "question": question
        })

def rename_duplicate_columns(df):
    cols = pd.Series(df.columns)
    for dup in cols[cols.duplicated()].unique():
        cols[cols[cols == dup].index.values.tolist()] = [dup + '_' + str(i) if i != 0 else dup for i in range(sum(cols == dup))]
    df.columns = cols
    return df

@app.route('/api/v0/run_sql', methods=['GET'])
@requires_cache(['sql'])
def run_sql(id: str, sql: str):
    print("SQL: ", sql)
    try:
        df = vn.run_sql(sql=sql)
        print('DF: ', df)
        df = rename_duplicate_columns(df)
        cache.set(id=id, field='df', value=df)
        cache.add_to_history(id, 'df', df.to_json(orient='records'))
        return jsonify(
            {
                "type": "df", 
                "id": id,
                "df": df.to_json(orient='records'),
            })

    except Exception as e:
        return jsonify({"type": "error", "error": str(e)})

@app.route('/api/v0/generate_schema', methods=['GET'])
def generate_schema():
    sql = "SELECT TABLE_SCHEMA,TABLE_NAME,COLUMN_NAME,DATA_TYPE FROM INFORMATION_SCHEMA.COLUMNS"
    try:
        df = vn.run_sql(sql=sql)
        print('DF: ', df)
        df_toList = dataframe_to_nested_list(df)
        ##cache.set(id=id, field='df', value=df)
        return jsonify(
            {
                "type": "list",
                "schema": df_toList,
            })

    except Exception as e:
        return jsonify({"type": "error", "error": str(e)})

def dataframe_to_nested_list(df):
    result = []
    for (schema, table), group in df.groupby(['TABLE_SCHEMA', 'TABLE_NAME']):
        # Creamos la estructura de las columnas para cada tabla
        columnas = [{
            'nombre_columna': row['COLUMN_NAME'],
            'tipo_dato': row['DATA_TYPE']
        } for index, row in group.iterrows()]
        esquema_existente = next((item for item in result if item['eschema'] == schema), None)
        if esquema_existente:
            esquema_existente['tabla'].append({
                'nombre_tabla': table,
                'columnas': columnas
            })
        else:
            result.append({
                'eschema': schema,
                'tabla': [{
                    'nombre_tabla': table,
                    'columnas': columnas
                }]
            })

    return result

@app.route("/api/v0/fix_sql", methods=["POST"])
@requires_cache(["question", "sql"])
def fix_sql(id: str, question:str, sql: str):
    error = request.json.get("error")

    if error is None:
        return jsonify({"type": "error", "error": "No error provided"})

    question = f"I have an error: {error}\n\nHere is the SQL I tried to run: {sql}\n\nThis is the question I was trying to answer: {question}\n\nCan you rewrite the SQL to fix the error?"

    fixed_sql = vn.generate_sql(question=question)

    cache.set(id=id, field="sql", value=fixed_sql)

    return jsonify(
        {
            "type": "sql",
            "id": id,
            "text": fixed_sql,
        }
    )


@app.route('/api/v0/update_sql', methods=['POST'])
@requires_cache([])
def update_sql(user: any, id: str):
    sql = request.json.get('sql')

    if sql is None:
        return jsonify({"type": "error", "error": "No sql provided"})

    cache.set(id=id, field='sql', value=sql)

    return jsonify(
        {
            "type": "sql",
            "id": id,
            "text": sql,
        })

@app.route('/api/v0/download_csv', methods=['GET'])
@requires_cache(['df'])
def download_csv(id: str, df):
    csv = df.to_csv()

    return Response(
        csv,
        mimetype="text/csv",
        headers={"Content-disposition":
                 f"attachment; filename={id}.csv"})

@app.route('/api/v0/generate_plotly_figure', methods=['GET'])
@requires_cache(['df', 'question', 'sql'])
def generate_plotly_figure(id: str, df, question, sql):
    chart_instructions = request.args.get('chart_instructions')
    print('question: ' + question)
    if chart_instructions is not None:
        question = f"{question}. Cuando vayas a realizar la grafica en plotly, utiliza las siguientes instrucciones: {chart_instructions}"

    print('question con chart instruction: ' + question)
    try:
        code = vn.generate_plotly_code(
            question=question,
            sql=sql,
            df_metadata=f"Running df.dtypes gives:\n {df.dtypes}",
        )
        fig = vn.get_plotly_figure(plotly_code=code, df=df, dark_mode=False)
        fig_json = fig.to_json()

        cache.set(id=id, field="fig_json", value=fig_json)
        cache.add_to_history(id, 'fig_json', fig_json)
        return jsonify(
            {
                "type": "plotly_figure",
                "id": id,
                "fig": fig_json,
                "code": code
            }
        )
    except Exception as e:
        # Print the stack trace
        import traceback
        traceback.print_exc()
        return jsonify({"type": "error", "error": str(e)})

@app.route('/api/v0/get_training_data', methods=['GET'])
def get_training_data():
    df = vn.get_training_data()

    return jsonify(
    {
        "type": "df", 
        "id": "training_data",
        "df": df.to_json(orient='records'),
    })

@app.route('/api/v0/remove_training_data', methods=['POST'])
def remove_training_data():
    # Get id from the JSON body
    id = request.json.get('id')

    if id is None:
        return jsonify({"type": "error", "error": "No id provided"})

    if vn.remove_training_data(id=id):
        return jsonify({"success": True})
    else:
        return jsonify({"type": "error", "error": "Couldn't remove training data"})


@app.route('/api/v0/train', methods=['POST'])
def add_training_data():
    print("Iniciando entrenamiento")

    # Revisar qué tipos de datos han sido enviados
    ddl_file = request.files.get('ddl')
    documentation_file = request.files.get('documentation')
    question = request.form.get('question', None)
    sql = request.form.get('sql', None)

    if ddl_file and (documentation_file or question or sql):
        return jsonify({"error": "DDL no puede estar presente con SQL, Question o Documentation."}), 400
    if documentation_file and (ddl_file or question or sql):
        return jsonify({"error": "Documentation no puede estar presente con SQL, Question o DDL."}), 400
    if sql and (ddl_file or documentation_file):
        return jsonify({"error": "SQL no puede estar presente con DDL o Documentation."}), 400
    if question and not sql:
        return jsonify({"error": "Question debe estar acompañado por SQL."}), 400

    training_ids = []
    error_messages = []

    # Procesar cada archivo DDL
    if ddl_file:
        ddl_fileL = saveTempFile(ddl_file, expected_type='text')
        print("paso el save")
        for ddl in ddl_fileL:
            try:
                id = vn.train(ddl=ddl)
                training_ids.append(id)
            except Exception as e:
                error_message = f"Error durante el entrenamiento con DDL: {ddl}, Error: {str(e)}"
                error_messages.append(error_message)

    # Procesar cada archivo de documentación
    if documentation_file:
        documentation_fileL = saveTempFile(documentation_file, expected_type='pdf')
        for documentation in documentation_fileL:
            try:
                id = vn.train(documentation=documentation)
                training_ids.append(id)
            except Exception as e:
                error_message = f"Error durante el entrenamiento con Documentation: {documentation}, Error: {str(e)}"
                error_messages.append(error_message)

    # Procesar SQL y Question si están presentes
    if sql:
        try:
            id = vn.train(question=question, sql=sql)  # Question es opcional aquí
            training_ids.append(id)
        except Exception as e:
            error_message = f"Error durante el entrenamiento con SQL: {sql}, Question: {question}, Error: {str(e)}"
            error_messages.append(error_message)

    if error_messages:
        return jsonify({"type": "error", "errors": error_messages, "ids": training_ids}), 400

    return jsonify({"ids": training_ids}), 200

def saveTempFile(file, expected_type):
    safe_file_name = secure_filename(file.filename)
    upload_folder = app.config['UPLOAD_FOLDER']
    if not os.path.exists(upload_folder):
        os.makedirs(upload_folder, exist_ok=True)
    file_path = os.path.join(upload_folder, safe_file_name)
    print('FilePath: ', file_path)
    file.save(file_path)
    text = None

    try:
        if expected_type == 'text' and ('.txt' in file_path or '.sql' in file_path):
            ddl_reader = ReadTXT(file_path) 
            print("crea objeto")
            text = ddl_reader.extraer_create_table()
            print('extrae el create table')
        elif expected_type == 'pdf' and '.pdf' in file_path:
            pdf_reader = ReadPDF(file_path)
            text = pdf_reader.read_pdf()
    except Exception as e:
        print("Error processing file:", e)

    return text


@app.route('/api/v0/generate_followup_questions', methods=['GET'])
@requires_cache(['df', 'question', 'sql'])
def generate_followup_questions(id: str, df, question, sql):
    followup_questions = vn.generate_followup_questions(question=question, sql=sql, df=df)

    cache.set(id=id, field='followup_questions', value=followup_questions)

    return jsonify(
        {
            "type": "question_list", 
            "id": id,
            "questions": followup_questions,
            "header": "Here are some followup questions you can ask:"
        })

@app.route('/api/v0/load_question', methods=['GET'])
@requires_cache(['question', 'sql', 'df', 'fig_json'])
def load_question(id: str, question, sql, df, fig_json):
    try:
        return jsonify(
            {
                "type": "question_cache", 
                "id": id,
                "question": question,
                "sql": sql,
                "df": df.to_json(orient='records'),
                "fig": fig_json,
            })

    except Exception as e:
        return jsonify({"type": "error", "error": str(e)})

@app.route('/api/v0/get_question_history', methods=['GET'])
def get_question_history():
    return jsonify({"type": "question_history", "questions": cache.get_all(field_list=['question']) })

@app.route('/api/v0/get_question_all_data_message', methods=['GET'])
def get_question_all_data_message():
    id = request.args.get('id')
    if not id:
        return jsonify({"type": "error", "error": "No ID provided"})
    history = cache.get_history(id)
    return jsonify({"type": "question_history", "id": id, "history": history})


# @app.route('/')
# def root():
#     return app.send_static_file('index.html')

if __name__ == '__main__':
    app.run(port=9000)
