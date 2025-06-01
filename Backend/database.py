from sqlalchemy import create_engine

DB_URL = "postgresql://postgres:1234@localhost/visualisasi_panen"
engine = create_engine(DB_URL)
