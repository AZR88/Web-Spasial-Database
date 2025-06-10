from fastapi import APIRouter, HTTPException
from models import usulan
from pydantic import BaseModel
from datetime import date

router = APIRouter(prefix="/usulan", tags=["Usulan"])

class UsulanPanen(BaseModel):
    id_usulan: str
    nama_pengusul: str
    tahun_usulan: int
    status_validasi: str
    status_validasi_1: str  
    tanggal_usulan: date
    id_kecamatan: str
    id_komoditas: str

@router.post("/")
def buat_usulan(data: UsulanPanen):
    try:
        usulan.insert_usulan(data.dict())
        return {"message": "Usulan panen berhasil ditambahkan."}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
