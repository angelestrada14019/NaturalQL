from vanna.openai.openai_chat import OpenAI_Chat
from vanna.chromadb.chromadb_vector import ChromaDB_VectorStore
class MyVanna(ChromaDB_VectorStore, OpenAI_Chat):
    _instance = None  # Verifica si la instancia ya está inicializada

    def __new__(cls, *args, **kwargs):
        if cls._instance is None:
            cls._instance = super(MyVanna, cls).__new__(cls)
        return cls._instance

    def __init__(self, config=None):
        if not hasattr(self, '_initialized'):  # Establece este atributo para prevenir reinicialización
            ChromaDB_VectorStore.__init__(self, config=config)
            OpenAI_Chat.__init__(self, config=config)
            self._initialized = True 



# pathDefault = './data'
# #read atabase, llms model and vector databse
# vn = MyVanna(config={'api_key': var.openai_api_key(), 'model': var.modelGPT(),'path':pathDefault})
# vn.connect_to_mssql(odbc_conn_str='DRIVER={ODBC Driver 17 for SQL Server};SERVER=testservertb.database.windows.net;DATABASE=dev2dbcotizador;UID=testadmindb;PWD=admin123**')
# # The information schema query may need some tweaking depending on your database. This is a good starting point.
# # df_information_schema = vn.run_sql("SELECT * FROM INFORMATION_SCHEMA.COLUMNS")

# # # # This will break up the information schema into bite-sized chunks that can be referenced by the LLM
# # plan = vn.get_training_plan_generic(df_information_schema)


# # # If you like the plan, then uncomment this and run it to train
# # vn.train(plan=plan)
# file_path = "./dataDocumentation/DiccionarioDatos.pdf"
# pdf_reader = ReadPDF(file_path)
# pdf_text = pdf_reader.read_pdf()

# vn.train(documentation=pdf_text)


