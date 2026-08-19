import React, { useEffect, useState } from 'react';
import axios from 'axios';

const API = process.env.REACT_APP_API_URL || '';
const authHeader = () => ({ Authorization: `Bearer ${localStorage.getItem('token')}` });

export default function Shop() {
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState({});
  const [message, setMessage] = useState('');

  useEffect(() => {
    axios.get(`${API}/api/products/`, { withCredentials: true })
      .then(r => setProducts(r.data))
      .catch(() => setMessage('Ошибка загрузки'));
  }, []);

  const addToCart = (id) => setCart(c => ({ ...c, [id]: (c[id] || 0) + 1 }));
  const removeFromCart = (id) => setCart(c => {
    const n = { ...c };
    if (n[id] > 1) n[id]--; else delete n[id];
    return n;
  });

  async function placeOrder() {
    const items = Object.entries(cart).map(([product_id, quantity]) => ({
      product_id: Number(product_id), quantity
    }));
    if (!items.length) return;
    try {
      const res = await axios.post(`${API}/api/orders/`, { items }, { withCredentials: true });
      setMessage(`Заказ #${res.data.id} оформлен — ${res.data.total.toLocaleString()} ₽`);
      setCart({});
      const r = await axios.get(`${API}/api/products/`, { withCredentials: true });
      setProducts(r.data);
    } catch (err) {
      setMessage(err.response?.data?.detail || 'Ошибка');
    }
  }

  const cartCount = Object.values(cart).reduce((a, b) => a + b, 0);
  const cartTotal = products.reduce((s, p) => s + (cart[p.id] || 0) * p.price, 0);

  return (
    <div style={styles.page}>
      {message && (
        <div style={styles.toast} onClick={() => setMessage('')}>{message}</div>
      )}
      <div style={styles.header}>
        <h2 style={styles.heading}>Каталог</h2>
        <span style={styles.count}>{products.length} товаров</span>
      </div>

      <div style={styles.grid}>
        {products.map(p => (
          <div key={p.id} style={styles.card}>
            <div style={styles.imgBox}>{p.image_url}</div>
            <div style={styles.info}>
              <div style={styles.name}>{p.name}</div>
              <div style={styles.desc}>{p.description}</div>
            </div>
            <div style={styles.bottom}>
              <div style={styles.price}>{p.price.toLocaleString()} ₽</div>
              <div style={styles.stock}>{p.stock} шт.</div>
            </div>
            <div style={styles.cartRow}>
              {cart[p.id] ? (
                <div style={styles.qtyRow}>
                  <button onClick={() => removeFromCart(p.id)} style={styles.qBtn}>−</button>
                  <span style={styles.qty}>{cart[p.id]}</span>
                  <button onClick={() => addToCart(p.id)} style={styles.qBtn}
                    disabled={cart[p.id] >= p.stock}>+</button>
                </div>
              ) : (
                <button onClick={() => addToCart(p.id)} style={styles.addBtn}
                  disabled={p.stock === 0}>
                  {p.stock === 0 ? 'Нет в наличии' : '+ В корзину'}
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {cartCount > 0 && (
        <div style={styles.cartBar}>
          <span style={styles.cartInfo}>{cartCount} товара</span>
          <span style={styles.cartTotal}>{cartTotal.toLocaleString()} ₽</span>
          <button onClick={placeOrder} style={styles.orderBtn}>Оформить заказ</button>
        </div>
      )}
    </div>
  );
}

const styles = {
  page: { padding: '32px', background: '#0d0f14',
    minHeight: 'calc(100vh - 56px)', color: '#fff' },
  toast: { position: 'fixed', top: '72px', right: '24px',
    background: '#1e2130', border: '1px solid #2d3748',
    color: '#e2e8f0', padding: '12px 20px', borderRadius: '8px',
    fontSize: '0.875rem', cursor: 'pointer', zIndex: 100 },
  header: { display: 'flex', alignItems: 'baseline',
    gap: '12px', marginBottom: '24px' },
  heading: { color: '#f1f5f9', fontSize: '1.3rem', fontWeight: '600' },
  count: { color: '#4b5563', fontSize: '0.85rem' },
  grid: { display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '16px' },
  card: { background: '#111318', border: '1px solid #1e2130',
    borderRadius: '10px', padding: '20px',
    display: 'flex', flexDirection: 'column', gap: '12px' },
  imgBox: { fontSize: '2.2rem', textAlign: 'center',
    background: '#0d0f14', borderRadius: '8px', padding: '16px' },
  info: { flex: 1 },
  name: { color: '#e2e8f0', fontWeight: '500', marginBottom: '4px' },
  desc: { color: '#4b5563', fontSize: '0.82rem' },
  bottom: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  price: { color: '#4f8ef7', fontWeight: '600' },
  stock: { color: '#374151', fontSize: '0.78rem' },
  cartRow: {},
  qtyRow: { display: 'flex', alignItems: 'center', gap: '12px' },
  addBtn: { width: '100%', padding: '8px', background: '#1e2d4a',
    color: '#4f8ef7', border: '1px solid #2d4a7a',
    borderRadius: '7px', cursor: 'pointer', fontSize: '0.875rem' },
  qBtn: { width: '30px', height: '30px', background: '#1e2130',
    color: '#9ca3af', border: '1px solid #2d3748',
    borderRadius: '6px', cursor: 'pointer' },
  qty: { color: '#fff', fontWeight: '500', minWidth: '20px', textAlign: 'center' },
  cartBar: { position: 'fixed', bottom: 0, left: 0, right: 0,
    background: '#111318', borderTop: '1px solid #1e2130',
    padding: '16px 32px', display: 'flex', alignItems: 'center', gap: '16px' },
  cartInfo: { color: '#6b7280', fontSize: '0.875rem', flex: 1 },
  cartTotal: { color: '#4f8ef7', fontWeight: '600', fontSize: '1.05rem' },
  orderBtn: { padding: '9px 24px', background: '#4f8ef7',
    color: '#fff', border: 'none', borderRadius: '8px',
    cursor: 'pointer', fontWeight: '500' },
};
