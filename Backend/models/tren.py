from sqlalchemy.sql import text
from database import engine

def get_kecamatan_by_komoditas(komoditas_id: int):
    query = text("""
        SELECT DISTINCT
            k.id_kecamatan,
            k.nama_kecamatan,
            ST_AsGeoJSON(k.geom) AS geom_geojson
        FROM kecamatan k
        JOIN hasil_panen hp ON k.id_kecamatan = hp.id_kecamatan
        WHERE hp.id_komoditas = :komoditas_id
    """)
    with engine.connect() as conn:
        result = conn.execute(query, {"komoditas_id": komoditas_id})
        return result.mappings().all()
