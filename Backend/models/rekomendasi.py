from sqlalchemy.sql import text
from database import engine

def get_rekomendasi_komoditas_per_kecamatan():
    query = text("""
        SELECT 
            hp1.id_kecamatan,
            k.nama_kecamatan,
            hp1.id_komoditas,
            kom.nama_komoditas,
            ST_AsGeoJSON(k.geom) AS geom,
            hp1.tahun AS tahun_sekarang,
            hp2.tahun AS tahun_sebelumnya,
            hp1.total_produksi AS produksi_sekarang,
            hp2.total_produksi AS produksi_sebelumnya,
            (hp1.total_produksi - hp2.total_produksi) AS selisih
        FROM hasil_panen hp1
        JOIN hasil_panen hp2 ON 
            hp1.id_kecamatan = hp2.id_kecamatan AND
            hp1.id_komoditas = hp2.id_komoditas AND
            hp1.tahun = hp2.tahun + 1
        JOIN kecamatan k ON hp1.id_kecamatan = k.id_kecamatan
        JOIN komoditas kom ON hp1.id_komoditas = kom.id_komoditas
    """)

    with engine.connect() as conn:
        result = conn.execute(query)
        rows = result.mappings().all()

    rekomendasi_per_kecamatan = {}
    for row in rows:
        kid = row["id_kecamatan"]
        if kid not in rekomendasi_per_kecamatan or row["selisih"] > rekomendasi_per_kecamatan[kid]["selisih"]:
            rekomendasi_per_kecamatan[kid] = {
                "id_kecamatan": kid,
                "nama_kecamatan": row["nama_kecamatan"],
                "geom": row["geom"],
                "id_komoditas": row["id_komoditas"],
                "nama_komoditas": row["nama_komoditas"],
                "produksi_sekarang": row["produksi_sekarang"],
                "produksi_sebelumnya": row["produksi_sebelumnya"],
                "selisih": row["selisih"],
                "tahun_sekarang": row["tahun_sekarang"],
                "tahun_sebelumnya": row["tahun_sebelumnya"]
            }

    return list(rekomendasi_per_kecamatan.values())
