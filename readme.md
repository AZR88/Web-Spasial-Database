# 🌾 Backend Sistem Informasi Hasil Panen

Backend aplikasi untuk menampilkan data hasil panen dan rekomendasi tanaman berbasis tren produksi, dibangun dengan **FastAPI** dan **PostgreSQL + PostGIS**.

---

## 🚀 Menjalankan Backend

1. **Install dependencies**

```bash
pip install -r requirements.txt
```

2. **Edit koneksi database di** `database.py`

```python
DATABASE_URL = "postgresql://username:password@localhost:5432/nama_database"
```

3. **Jalankan server**

```bash
uvicorn main:app --reload
```

---

## 📌 Endpoint

### 1. Data Panen

`GET /panen/?komoditas_id=6&tahun=2024`
→ Menampilkan hasil panen per kecamatan berdasarkan komoditas & tahun.

### 2. Tren Produksi

`GET /tren/?komoditas_id=6`
→ Menampilkan tren produksi komoditas dari tahun ke tahun untuk tiap kecamatan.

### 3. Rekomendasi Tanaman

`GET /rekomendasi`
→ Menampilkan **1 rekomendasi tanaman per kecamatan** berdasarkan kenaikan produksi tertinggi dari tahun sebelumnya.

---

📍 Semua endpoint bisa diakses di:
**[http://127.0.0.1:8000](http://127.0.0.1:8000)**

🧪 Dokumentasi otomatis Swagger:
**[http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)**

---

