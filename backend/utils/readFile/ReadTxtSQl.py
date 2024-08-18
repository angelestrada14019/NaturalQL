import chardet

class ReadTXT:
    def __init__(self, file_path):
        self.file_path = file_path
    
    def detectar_codificacion(self):
        with open(self.file_path, 'rb') as f:
            return chardet.detect(f.read())['encoding']
    
    def extraer_create_table(self):
        with open(self.file_path, 'r', encoding=self.detectar_codificacion()) as archivo:
            lineas = archivo.readlines()
        
        dentro_de_create_table = False
        create_tables = []
        create_table_actual = ""

        for linea in lineas:
            if 'CREATE TABLE ' in linea:
                dentro_de_create_table = True
                create_table_actual += linea
            elif dentro_de_create_table:
                create_table_actual += linea
                if ');' in linea:
                    create_tables.append(create_table_actual.strip())
                    create_table_actual = ""
                    dentro_de_create_table = False

        return create_tables