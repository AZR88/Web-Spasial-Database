from sqlalchemy.sql import text
from database import engine

def insert_usulan(data: dict):
    query = text("""
       INSERT INTO usulan_panen (
    nama_pengusul,
    tahun,
    id_kecamatan,
    id_komoditas,
    total_produksi,
    satuan
) VALUES (
    :nama_pengusul,
    :tahun,
    :id_kecamatan,
    :id_komoditas,
    :total_produksi,
    :satuan
);


    """)
    with engine.begin() as conn:
        conn.execute(query, data)
