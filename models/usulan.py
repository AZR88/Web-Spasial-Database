from sqlalchemy.sql import text
from database import engine

def insert_usulan(data: dict):
    query = text("""
        INSERT INTO usulan_panen (
            id_usulan,
            nama_pengusul,
            tahun_usulan,
            status_validasi,
            status_validasi_1,
            tanggal_usulan,
            id_kecamatan,
            id_komoditas
        ) VALUES (
            :id_usulan,
            :nama_pengusul,
            :tahun_usulan,
            :status_validasi,
            :status_validasi_1,
            :tanggal_usulan,
            :id_kecamatan,
            :id_komoditas
        )
    """)
    with engine.begin() as conn:
        conn.execute(query, data)
