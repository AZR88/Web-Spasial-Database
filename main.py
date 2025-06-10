# Backend/main.py
import os
from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse, HTMLResponse
from fastapi.middleware.cors import CORSMiddleware

# Impor router Anda
from routers import panen, tren, rekomendasi, usulan

app = FastAPI()

# Konfigurasi CORS (opsional jika semua disajikan dari origin yang sama di produksi,
# tapi tetap berguna untuk pengembangan atau jika ada klien lain)
origins = [
    "http://localhost",
    "http://localhost:8000", # Port default FastAPI
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

# Prefix untuk semua API endpoint agar terpisah dari route frontend
API_PREFIX = "/api"

app.include_router(panen.router, prefix=API_PREFIX) #
app.include_router(tren.router, prefix=API_PREFIX) #
app.include_router(rekomendasi.router, prefix=API_PREFIX) #
app.include_router(usulan.router, prefix=API_PREFIX) #

# Path ke direktori statis (tempat file frontend Anda sekarang berada)
# Diasumsikan folder 'static' berada di level yang sama dengan 'main.py' (di dalam 'Backend')
STATIC_DIR = os.path.join(os.path.dirname(__file__), "static")

# Route untuk menyajikan landing.html sebagai halaman utama ("/")
@app.get("/", include_in_schema=False)
async def serve_landing_page():
    return FileResponse(os.path.join(STATIC_DIR, "landing.html"))

# Route untuk menyajikan file HTML lainnya (misalnya, /panen.html, /rekomendasi.html)
# Ini harus didefinisikan SEBELUM `app.mount` untuk aset statis umum.
@app.get("/{page_name}.html", include_in_schema=False)
async def serve_other_html_pages(page_name: str):
    file_path = os.path.join(STATIC_DIR, f"{page_name}.html")
    if os.path.exists(file_path):
        return FileResponse(file_path)
    return HTMLResponse(content="<html><body>Halaman tidak ditemukan</body></html>", status_code=404)

# Mount direktori statis untuk menyajikan file CSS, JS, gambar, dll.
# Ini akan menyajikan file apapun dari STATIC_DIR jika tidak ada route lain yang cocok.
# Contoh: permintaan ke /style.css akan menyajikan STATIC_DIR/style.css
# Contoh: permintaan ke /js/main.js akan menyajikan STATIC_DIR/js/main.js
# Ini harus menjadi yang terakhir agar tidak menimpa route HTML spesifik di atas.
app.mount("/", StaticFiles(directory=STATIC_DIR), name="static_assets")