from fastapi import APIRouter, HTTPException
from models import usulan
from pydantic import BaseModel
from datetime import date

router = APIRouter(prefix="/usulan", tags=["Usulan"])

class UsulanPanen(BaseModel):
    nama_pengusul: str
    tahun: int 
    id_kecamatan: int
    id_komoditas: int
    total_produksi: float
    satuan: str

@router.post("/")
def buat_usulan(data: UsulanPanen):
    try:
        usulan.insert_usulan(data.dict())
        return {"message": "Usulan panen berhasil ditambahkan."}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
