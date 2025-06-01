from fastapi import APIRouter
from models.rekomendasi import get_rekomendasi_komoditas_per_kecamatan

router = APIRouter()

@router.get("/rekomendasi")
async def rekomendasi():
    data = get_rekomendasi_komoditas_per_kecamatan()
    return data
