# Backend/main.py
import os
from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse, HTMLResponse
from fastapi.middleware.cors import CORSMiddleware

from routers import panen, tren, rekomendasi, usulan

app = FastAPI()


origins = [
    "http://localhost",
    "http://localhost:8000", 
    "http://127.0.0.1",
    "http://127.0.0.1:8000",
    "http://127.0.0.1:5500",
    "http://localhost:5500",
]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


API_PREFIX = "/api"

app.include_router(panen.router, prefix=API_PREFIX) #
app.include_router(tren.router, prefix=API_PREFIX) #
app.include_router(rekomendasi.router, prefix=API_PREFIX) #
app.include_router(usulan.router, prefix=API_PREFIX) #


STATIC_DIR = os.path.join(os.path.dirname(__file__), "static")


@app.get("/", include_in_schema=False)
async def serve_landing_page():
    return FileResponse(os.path.join(STATIC_DIR, "landing.html"))


@app.get("/{page_name}.html", include_in_schema=False)
async def serve_other_html_pages(page_name: str):
    file_path = os.path.join(STATIC_DIR, f"{page_name}.html")
    if os.path.exists(file_path):
        return FileResponse(file_path)
    return HTMLResponse(content="<html><body>Halaman tidak ditemukan</body></html>", status_code=404)

#
app.mount("/", StaticFiles(directory=STATIC_DIR), name="static_assets")