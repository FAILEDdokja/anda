// Anda — Purchase entry modal (PRD §23: quantity + total cost).

import { useState } from 'react';
import { theme } from '../lib/anda/theme';
import type { AndaStore } from '../lib/anda/store';
import { s } from '../ui';

interface Props {
  store: AndaStore;
  onBack: () => void;
}

export function PurchaseEntry({ store, onBack }: Props) {
  const [qty, setQty] = useState(12);
  const [priceMode, setPriceMode] = useState<'total' | 'perEgg'>('total');
  const [totalCost, setTotalCost] = useState('');
  const [pricePerEgg, setPricePerEgg] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const submit = async () => {
    const enteredPrice = parseFloat(priceMode === 'total' ? totalCost : pricePerEgg);
    const c = priceMode === 'total' ? enteredPrice : enteredPrice * qty;
    if (busy || qty < 1 || Number.isNaN(c) || c < 0) return;
    setBusy(true);
    setError(null);
    try {
      await store.recordPurchase(qty, c);
      setDone(true);
      setTimeout(onBack, 800);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
      setBusy(false);
    }
  };

  if (done) {
    return (
      <div style={{ ...s.root, textAlign: 'center', paddingTop: 100 }}>
        <div style={{ fontSize: 48, marginBottom: 8 }}>📦</div>
        <p style={{ fontWeight: 700, fontSize: 18 }}>
          {qty} eggs added
        </p>
      </div>
    );
  }

  const enteredPrice = parseFloat(priceMode === 'total' ? totalCost : pricePerEgg);
  const total = priceMode === 'total' ? enteredPrice : enteredPrice * qty;
  const perEgg = qty > 0 && !Number.isNaN(total) && total >= 0
    ? (total / qty).toFixed(2)
    : null;

  return (
    <div style={s.root}>
      <button
        onClick={onBack}
        style={{ border: 'none', background: 'none', cursor: 'pointer', fontSize: 22, color: theme.text, padding: 0, marginBottom: 20 }}
      >
        ‹ Back
      </button>
      <h2 style={{ fontSize: 22, fontWeight: 700, margin: '0 0 20px' }}>Add eggs</h2>
      {error && (
        <div style={{ background: theme.dangerBg, border: `1px solid ${theme.danger}`, borderRadius: 10, padding: 12, marginBottom: 12, color: theme.danger, fontSize: 14 }}>
          {error}
        </div>
      )}

      <div style={s.card}>
        <label style={{ display: 'block', fontSize: 14, fontWeight: 600, marginBottom: 6 }}>Quantity</label>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, justifyContent: 'center', marginBottom: 16 }}>
          <button onClick={() => setQty(Math.max(1, qty - 1))} style={stepperBtn} disabled={busy}>−</button>
          <input
            type="number"
            inputMode="numeric"
            min={1}
            step={1}
            value={qty}
            onChange={(e) => setQty(Math.max(1, Math.floor(Number(e.target.value) || 1)))}
            disabled={busy}
            style={{ ...field, width: 88, textAlign: 'center', fontSize: 24, fontWeight: 700 }}
            aria-label="Quantity"
          />
          <button onClick={() => setQty(qty + 1)} style={stepperBtn} disabled={busy}>+</button>
        </div>

        <div style={{ display: 'flex', marginBottom: 8 }}>
          <button
            onClick={() => setPriceMode('total')}
            disabled={busy}
            style={{ ...priceModeBtn, ...(priceMode === 'total' ? priceModeBtnActive : {}) }}
          >
            Total cost
          </button>
          <button
            onClick={() => setPriceMode('perEgg')}
            disabled={busy}
            style={{ ...priceModeBtn, ...(priceMode === 'perEgg' ? priceModeBtnActive : {}) }}
          >
            Price per egg
          </button>
        </div>
        <label style={{ display: 'block', fontSize: 14, fontWeight: 600, marginBottom: 6 }}>
          {priceMode === 'total' ? 'Total cost (₹)' : 'Price per egg (₹)'}
        </label>
        <input
          type="number"
          inputMode="decimal"
          min={0}
          step="0.01"
          value={priceMode === 'total' ? totalCost : pricePerEgg}
          onChange={(e) => priceMode === 'total' ? setTotalCost(e.target.value) : setPricePerEgg(e.target.value)}
          placeholder={priceMode === 'total' ? 'e.g. 96' : 'e.g. 8'}
          disabled={busy}
          style={field}
        />
        {perEgg !== null && (
          <p style={{ fontSize: 13, color: theme.muted, margin: '8px 0 0' }}>
            ≈ ₹{perEgg} per egg
          </p>
        )}
      </div>

      <button
        onClick={submit}
        disabled={busy || qty < 1 || Number.isNaN(enteredPrice) || enteredPrice < 0}
        style={{ ...s.btn, opacity: busy || qty < 1 || Number.isNaN(enteredPrice) || enteredPrice < 0 ? 0.5 : 1 }}
      >
        {busy ? 'Adding…' : `Add ${qty} eggs`}
      </button>
    </div>
  );
}

const stepperBtn: React.CSSProperties = {
  width: 48,
  height: 48,
  borderRadius: '50%',
  border: `1px solid ${theme.border}`,
  background: '#fff',
  fontSize: 22,
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
};

const field: React.CSSProperties = {
  width: '100%',
  padding: '12px 14px',
  border: `1px solid ${theme.border}`,
  borderRadius: 10,
  fontSize: 16,
  outline: 'none',
  boxSizing: 'border-box',
  background: theme.bg,
  color: theme.text,
};

const priceModeBtn: React.CSSProperties = {
  flex: 1,
  padding: '9px 8px',
  border: `1px solid ${theme.border}`,
  background: theme.bg,
  color: theme.muted,
  cursor: 'pointer',
  fontSize: 14,
  fontWeight: 600,
};

const priceModeBtnActive: React.CSSProperties = {
  background: theme.accentBg,
  borderColor: theme.accent,
  color: theme.accent,
};
