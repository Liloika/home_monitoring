from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from pydantic import BaseModel
from ..database import get_db
from ..models import Order, OrderItem, Product
from ..auth import get_current_user

router = APIRouter(prefix="/api/orders", tags=["orders"])

class OrderItemRequest(BaseModel):
    product_id: int
    quantity: int

class OrderRequest(BaseModel):
    items: List[OrderItemRequest]

class OrderItemOut(BaseModel):
    product_id: int
    quantity: int
    price: float

    class Config:
        from_attributes = True

class OrderOut(BaseModel):
    id: int
    total: float
    items: List[OrderItemOut]

    class Config:
        from_attributes = True

@router.post("/", response_model=OrderOut, status_code=201)
def create_order(data: OrderRequest, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    order = Order(user_id=current_user.id)
    db.add(order)
    db.flush()

    total = 0
    for item in data.items:
        product = db.query(Product).filter(Product.id == item.product_id).first()
        if not product:
            raise HTTPException(status_code=404, detail=f"Товар {item.product_id} не найден")
        if product.stock < item.quantity:
            raise HTTPException(status_code=400, detail=f"Недостаточно товара '{product.name}' на складе")

        order_item = OrderItem(
            order_id=order.id,
            product_id=product.id,
            quantity=item.quantity,
            price=product.price,
        )
        product.stock -= item.quantity
        total += product.price * item.quantity
        db.add(order_item)

    order.total = total
    db.commit()
    db.refresh(order)
    return order

@router.get("/", response_model=List[OrderOut])
def get_my_orders(db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    return db.query(Order).filter(Order.user_id == current_user.id).all()
