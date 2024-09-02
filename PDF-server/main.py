from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from pathlib import Path
import json

app = FastAPI()

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Define the model for the PDF configuration
class PDFConfig(BaseModel):
    x: float
    y: float
    fontSize: int
    color: str
    styles: dict

# Define the path to the JSON file
json_file_path = Path(__file__).parent / "static" / "pdf-config.json"

@app.get("/pdf-config")
async def get_pdf_config():
    try:
        with open(json_file_path, "r") as f:
            config = json.load(f)
        return config
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/update-pdf-config")
async def update_pdf_config(config: dict):
    try:
        with open(json_file_path, "w") as f:
            json.dump(config, f, indent=4)
        return {"status": "success"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
