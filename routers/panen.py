from fastapi import APIRouter
from models.panen import get_hasil_panen

router = APIRouter(prefix="/panen", tags=["Panen"])

@router.get("/")
def hasil_panen(komoditas_id: int, tahun: int):
    data = get_hasil_panen(komoditas_id, tahun)
    return [dict(row) for row in data]  # sekarang row sudah mapping (dict-like)
