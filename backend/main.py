from fastapi import FastAPI

app = FastAPI()

@app.get("/")
def home():
    return {"message": "MedMatch AI API is running"}