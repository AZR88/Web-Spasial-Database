from fastapi import APIRouter, Query
from models.tren import get_komoditas_by_kecamatan_tahun

router = APIRouter(prefix="/get_komoditas_by_kecamatan_tahun", tags=["komoditas"])

@router.get("/")
def get_komoditas(
    nama_kecamatan: str = Query(..., description="Nama kecamatan"),
    tahun: int = Query(..., description="Tahun hasil panen")
):
    data = get_komoditas_by_kecamatan_tahun(nama_kecamatan=nama_kecamatan, tahun=tahun)
    return data
