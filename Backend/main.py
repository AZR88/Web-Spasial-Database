from fastapi import FastAPI
from routers import panen, tren, rekomendasi, usulan

app = FastAPI()

app.include_router(panen.router)
app.include_router(tren.router)
app.include_router(rekomendasi.router)
app.include_router(usulan.router)
@app.get("/")
def home():
    return {"message": "API Hasil Panen & Rekomendasi Tanaman"}
