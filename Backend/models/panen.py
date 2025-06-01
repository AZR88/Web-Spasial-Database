from sqlalchemy.sql import text
from database import engine

def get_hasil_panen(komoditas_id: int, tahun: int):
    query = text("""
        SELECT 
            kecamatan.nama_kecamatan,
            hasil_panen.total_produksi,
            hasil_panen.satuan,
            kecamatan.geom
        FROM hasil_panen
        JOIN kecamatan ON hasil_panen.id_kecamatan = kecamatan.id_kecamatan
        WHERE hasil_panen.id_komoditas = :komoditas_id AND hasil_panen.tahun = :tahun;
    """)
    with engine.connect() as conn:
        result = conn.execute(query, {"komoditas_id": komoditas_id, "tahun": tahun})
        # Gunakan .mappings() agar hasil berupa dict-like
        return result.mappings().all()
