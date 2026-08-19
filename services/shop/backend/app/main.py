from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .database import engine, Base
from .models import Product
from .routers import auth, products, orders
from sqlalchemy.orm import Session

app = FastAPI(title="Home Shop API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(products.router)
app.include_router(orders.router)

@app.on_event("startup")
def startup():
    Base.metadata.create_all(bind=engine)
    db = Session(engine)
    if db.query(Product).count() == 0:
        db.add_all([
            Product(name="Механическая клавиатура", description="Cherry MX Blue, RGB подсветка", price=8900, stock=5, image_url="⌨️"),
            Product(name="Мышь игровая", description="16000 DPI, беспроводная", price=4500, stock=10, image_url="🖱️"),
            Product(name="Монитор 27\"", description="2K IPS, 144Hz", price=32000, stock=3, image_url="🖥️"),
            Product(name="SSD 1TB", description="NVMe M.2, 7000MB/s", price=6200, stock=8, image_url="💾"),
            Product(name="Наушники", description="Беспроводные, ANC", price=12000, stock=6, image_url="🎧"),
        ])
        db.commit()
    db.close()

@app.get("/api/health")
def health():
    return {"status": "ok"}
