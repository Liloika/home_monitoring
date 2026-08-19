import React, { useEffect, useState } from 'react';
import axios from 'axios';

const API = process.env.REACT_APP_API_URL || '';

export default function Orders() {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    axios.get(`${API}/api/orders/`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    }).then(r => setOrders(r.data));
  }, []);

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <h2 style={styles.heading}>Мои заказы</h2>
        <span style={styles.count}>{orders.length} заказа</span>
      </div>

      {!orders.length ? (
        <div style={styles.empty}>
          <div style={styles.emptyIcon}>📦</div>
          <p>Заказов пока нет</p>
        </div>
      ) : orders.map(o => (
        <div key={o.id} style={styles.order}>
          <div style={styles.orderHead}>
            <span style={styles.orderId}>Заказ #{o.id}</span>
            <span style={styles.orderTotal}>{o.total.toLocaleString()} ₽</span>
          </div>
          <div style={styles.items}>
            {o.items.map((item, i) => (
              <div key={i} style={styles.item}>
                <span style={styles.itemName}>Товар #{item.product_id}</span>
                <span style={styles.itemQty}>{item.quantity} × {item.price.toLocaleString()} ₽</span>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

const styles = {
  page: { padding: '32px', background: '#0d0f14',
    minHeight: 'calc(100vh - 56px)', color: '#fff' },
  header: { display: 'flex', alignItems: 'baseline', gap: '12px', marginBottom: '24px' },
  heading: { color: '#f1f5f9', fontSize: '1.3rem', fontWeight: '600' },
  count: { color: '#4b5563', fontSize: '0.85rem' },
  empty: { textAlign: 'center', color: '#4b5563', marginTop: '80px' },
  emptyIcon: { fontSize: '3rem', marginBottom: '12px' },
  order: { background: '#111318', border: '1px solid #1e2130',
    borderRadius: '10px', padding: '20px', marginBottom: '12px' },
  orderHead: { display: 'flex', justifyContent: 'space-between',
    marginBottom: '12px', paddingBottom: '12px', borderBottom: '1px solid #1e2130' },
  orderId: { color: '#9ca3af', fontSize: '0.875rem' },
  orderTotal: { color: '#4f8ef7', fontWeight: '600' },
  items: { display: 'flex', flexDirection: 'column', gap: '8px' },
  item: { display: 'flex', justifyContent: 'space-between' },
  itemName: { color: '#6b7280', fontSize: '0.875rem' },
  itemQty: { color: '#9ca3af', fontSize: '0.875rem' },
};
