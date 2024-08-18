from PyPDF2 import PdfReader

class ReadPDF:
    def __init__(self, file_path):
        self.file_path = file_path
    
    def read_pdf(self):
        text = ""
        with open(self.file_path, "rb") as file:
            pdf_reader = PdfReader(file)
            print("realizo")
            num_pages = len(pdf_reader.pages)
            for page_num in range(num_pages):
                page = pdf_reader.pages[page_num]
                text += page.extract_text()
        return text