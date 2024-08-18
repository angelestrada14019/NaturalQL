#environment variables
import os
from dotenv import load_dotenv, find_dotenv
_ = load_dotenv(find_dotenv())

def openai_api_key():
    return  os.environ["OPENAI_API_KEY"]

def modelGPT():
    return os.environ["MODEL"]