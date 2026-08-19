from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from pydantic import BaseModel
from ..database import get_db
from ..models import Product
from ..auth import get_current_user

router = APIRouter(prefix="/api/products", tags=["products"])

class ProductOut(BaseModel):
    id: int
    name: str
    description: str | None
    price: float
    stock: int
    image_url: str | None

    class Config:
        from_attributes = True

@router.get("/", response_model=List[ProductOut])
def get_products(db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    """Только для авторизованных — проверяет JWT."""
    return db.query(Product).all()

@router.get("/{product_id}", response_model=ProductOut)
def get_product(product_id: int, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Товар не найден")
    return product
