from sqlalchemy.sql import text
from database import engine

def get_komoditas_by_kecamatan_tahun(nama_kecamatan: str, tahun: int):
    query = text("""
        SELECT DISTINCT
            d.nama_komoditas,
            k.nama_kecamatan,
            hp.total_produksi,
            hp.satuan,
            ST_AsGeoJSON(ST_Transform(ST_SetSRID(k.geom, 32749), 4326)) AS geom_geojson
        FROM hasil_panen hp
        JOIN kecamatan k ON hp.id_kecamatan = k.id_kecamatan
        JOIN komoditas d ON hp.id_komoditas = d.id_komoditas
        WHERE k.nama_kecamatan = :nama_kecamatan
          AND hp.tahun = :tahun
    """)
    with engine.connect() as conn:
        result = conn.execute(query, {
            "nama_kecamatan": nama_kecamatan,
            "tahun": tahun
        })
        return result.mappings().all()
