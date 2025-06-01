from fastapi import APIRouter, Query
from models.tren import get_kecamatan_by_komoditas

router = APIRouter(prefix="/tren", tags=["Tren"])

@router.get("/")
def tren(komoditas_id: int = Query(...)):
    data = get_kecamatan_by_komoditas(komoditas_id)
    return data  # sudah berupa list of dict

