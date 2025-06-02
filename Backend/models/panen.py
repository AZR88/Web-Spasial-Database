from sqlalchemy.sql import text
from database import engine

def get_hasil_panen(komoditas_id: int, tahun: int):
    query = text("""
        SELECT
            k.nama_kecamatan,
            hp.total_produksi,
            hp.satuan,
            ST_AsGeoJSON(k.geom) AS geom
        FROM hasil_panen hp
        JOIN kecamatan k ON hp.id_kecamatan = k.id_kecamatan
        WHERE hp.id_komoditas = :komoditas_id AND hp.tahun = :tahun
    """)
    with engine.connect() as conn:
        result = conn.execute(query, {"komoditas_id": komoditas_id, "tahun": tahun})
        return [dict(row) for row in result.mappings().all()]