import React, { useState } from 'react';

function parseJWT(token) {
  try {
    const parts = token.split('.');
    return {
      header: JSON.parse(atob(parts[0])),
      payload: JSON.parse(atob(parts[1])),
      signature: parts[2],
      raw: { header: parts[0], payload: parts[1], signature: parts[2] }
    };
  } catch { return null; }
}

export default function TokenInfo() {
  const token = localStorage.getItem('token');
  const parsed = parseJWT(token);
  const [showRaw, setShowRaw] = useState(false);
  const [showSig, setShowSig] = useState(false);

  if (!parsed) return (
    <div style={styles.page}><p style={{color:'#6b7280'}}>Токен не найден</p></div>
  );

  const exp = new Date(parsed.payload.exp * 1000);
  const iat = new Date(parsed.payload.iat * 1000);
  const isExpired = exp < new Date();
  const remaining = Math.max(0, Math.round((exp - new Date()) / 60000));

  return (
    <div style={styles.page}>
      <div style={styles.topBar}>
        <div>
          <h2 style={styles.heading}>Сессия</h2>
          <p style={styles.sub}>Информация об авторизации текущего пользователя</p>
        </div>
        <div style={isExpired ? styles.badgeDanger : styles.badgeOk}>
          {isExpired ? 'Истёк' : `Активен · ещё ${remaining} мин`}
        </div>
      </div>

      <div style={styles.grid}>
        <div style={styles.block}>
          <div style={styles.blockLabel}>Пользователь</div>
          <div style={styles.blockValue}>{parsed.payload.sub}</div>
          <div style={styles.blockLabel} >Email</div>
          <div style={styles.blockValue}>{parsed.payload.email}</div>
          <div style={styles.blockLabel}>Выдан</div>
          <div style={styles.blockValue}>{iat.toLocaleString()}</div>
          <div style={styles.blockLabel}>Истекает</div>
          <div style={styles.blockValue}>{exp.toLocaleString()}</div>
          <div style={styles.blockLabel}>Алгоритм</div>
          <div style={styles.blockValue}>{parsed.header.alg}</div>
          <div style={styles.blockLabel}>Issuer</div>
          <div style={styles.blockValue}>{parsed.payload.iss}</div>
        </div>

        <div style={styles.block}>
          <div style={styles.blockLabel}>Как работает JWT</div>
          <p style={styles.text}>
            JWT состоит из трёх частей разделённых точкой: <span style={{color:'#f87171'}}>header</span>.<span style={{color:'#4f8ef7'}}>payload</span>.<span style={{color:'#34d399'}}>signature</span>
          </p>
          <p style={styles.text}>
            <b style={{color:'#e2e8f0'}}>Header</b> — алгоритм подписи.<br/>
            <b style={{color:'#e2e8f0'}}>Payload</b> — данные пользователя. Не зашифрованы — просто Base64.<br/>
            <b style={{color:'#e2e8f0'}}>Signature</b> — HMAC(header+payload, SECRET_KEY). Только сервер может проверить.
          </p>
          <p style={styles.warn}>
            ⚠️ Payload можно прочитать без ключа — не храни в токене пароли или чувствительные данные.
          </p>
        </div>
      </div>

      <div style={styles.rawSection}>
        <button onClick={() => setShowRaw(v => !v)} style={styles.toggleBtn}>
          {showRaw ? 'Скрыть токен' : 'Показать raw токен'}
        </button>
        {showRaw && (
          <div style={styles.rawBox}>
            <span style={{color:'#f87171'}}>{parsed.raw.header}</span>
            <span style={{color:'#4b5563'}}>.</span>
            <span style={{color:'#4f8ef7'}}>{parsed.raw.payload}</span>
            <span style={{color:'#4b5563'}}>.</span>
            <button onClick={() => setShowSig(v => !v)} style={styles.sigBtn}>
              {showSig
                ? <span style={{color:'#34d399'}}>{parsed.raw.signature}</span>
                : <span style={{color:'#34d399', opacity:0.5}}>[подпись скрыта — показать]</span>
              }
            </button>
          </div>
        )}
        {showRaw && (
          <p style={styles.hint}>Скопируй и вставь на <a href="https://jwt.io" target="_blank"
            rel="noreferrer" style={{color:'#4f8ef7'}}>jwt.io</a> чтобы разобрать вручную</p>
        )}
      </div>
    </div>
  );
}

const styles = {
  page: { padding: '32px', background: '#0d0f14',
    minHeight: 'calc(100vh - 56px)', color: '#fff' },
  topBar: { display: 'flex', justifyContent: 'space-between',
    alignItems: 'flex-start', marginBottom: '28px' },
  heading: { color: '#f1f5f9', fontSize: '1.3rem', fontWeight: '600', marginBottom: '4px' },
  sub: { color: '#4b5563', fontSize: '0.85rem' },
  badgeOk: { background: '#052e16', color: '#34d399', border: '1px solid #14532d',
    padding: '6px 14px', borderRadius: '20px', fontSize: '0.82rem' },
  badgeDanger: { background: '#2d0a0a', color: '#f87171', border: '1px solid #7f1d1d',
    padding: '6px 14px', borderRadius: '20px', fontSize: '0.82rem' },
  grid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' },
  block: { background: '#111318', border: '1px solid #1e2130',
    borderRadius: '10px', padding: '20px', display: 'flex', flexDirection: 'column', gap: '6px' },
  blockLabel: { color: '#4b5563', fontSize: '0.75rem', textTransform: 'uppercase',
    letterSpacing: '0.05em', marginTop: '8px' },
  blockValue: { color: '#e2e8f0', fontSize: '0.9rem' },
  text: { color: '#6b7280', fontSize: '0.875rem', lineHeight: '1.6', margin: '4px 0' },
  warn: { background: '#1c1400', border: '1px solid #2d2000',
    color: '#d97706', padding: '10px 14px', borderRadius: '7px',
    fontSize: '0.82rem', lineHeight: '1.5', marginTop: '8px' },
  rawSection: { background: '#111318', border: '1px solid #1e2130',
    borderRadius: '10px', padding: '20px' },
  toggleBtn: { background: 'transparent', border: '1px solid #2d3748',
    color: '#6b7280', padding: '7px 16px', borderRadius: '7px',
    cursor: 'pointer', fontSize: '0.85rem', marginBottom: '16px' },
  rawBox: { fontFamily: 'monospace', fontSize: '0.78rem',
    wordBreak: 'break-all', lineHeight: '1.7',
    background: '#0d0f14', padding: '16px', borderRadius: '8px', marginBottom: '12px' },
  sigBtn: { background: 'none', border: 'none', cursor: 'pointer',
    fontFamily: 'monospace', fontSize: '0.78rem', padding: 0 },
  hint: { color: '#374151', fontSize: '0.8rem' },
};
