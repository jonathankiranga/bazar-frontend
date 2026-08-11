import { useState, useEffect } from 'react';
import { getParentSubscriptions, paySelectedSubscriptions, payBulkSubscriptions } from '../utils/api';

export default function ParentSubscriptionsPage({ user }) {
  const schoolId = user?.school_id;
  const [term, setTerm] = useState('Term 1');
  const [year, setYear] = useState(new Date().getFullYear());
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState({});
  const [schoolPhone, setSchoolPhone] = useState(user?.phone || '');
  const [paying, setPaying] = useState(false);
  const [msg, setMsg] = useState('');

  useEffect(() => {
    if (!schoolId) return;
    setLoading(true);
    setMsg('');
    getParentSubscriptions(schoolId, term, year)
      .then(d => { setData(d); setSelected({}); })
      .catch(err => setMsg(err.message))
      .finally(() => setLoading(false));
  }, [schoolId, term, year]);

  const toggle = (phone) => setSelected(s => ({ ...s, [phone]: !s[phone] }));

  const selectedPhones = data?.parents?.filter(p => selected[p.parent_phone]) || [];
  const selectedTotal = selectedPhones.reduce((sum, p) => sum + p.amount_due, 0);

  const handlePay = async () => {
    if (selectedPhones.length < 1) {
      setMsg('Select at least one unpaid parent to send the school office M-Pesa STK prompt.');
      return;
    }
    if (!schoolPhone) {
      setMsg('Enter the school office phone number that will receive the STK push.');
      return;
    }
    if (!window.confirm(`Send M-Pesa STK push to school office phone ${schoolPhone} for ${selectedPhones.length} selected parent(s) with a total amount of KSh ${selectedTotal.toLocaleString()}?`)) return;
    setPaying(true);
    setMsg('');
    try {
      // Creates STK_PENDING rows and initiates one STK push to the school office phone for the total amount.
      const r = await paySelectedSubscriptions({
        school_id: schoolId,
        term,
        year,
        parent_phones: selectedPhones.map(p => p.parent_phone),
        school_phone: schoolPhone,
        recorded_by: user?.email || 'BAZAR'
      });
      setMsg(r.message || r.status || `Bulk STK initiated — ref ${r.transaction_reference} — waiting for Daraja callback`);
    } catch (err) {
      setMsg(`Failed: ${err.message}`);
    }
    setPaying(false);
  };

  return (
    <div className="page">
      <h2>Parent Subscriptions</h2>
      <div className="filters">
        <select value={term} onChange={e => setTerm(e.target.value)}>
          <option>Term 1</option><option>Term 2</option><option>Term 3</option>
        </select>
        <input type="number" value={year} onChange={e => setYear(e.target.value)} style={{ width: 80 }} />
      </div>

      {msg && <div className="form-msg">{msg}</div>}

      {loading ? <p>Loading…</p> : data && (
        <>
          <div className="kpi-grid">
            <div className="kpi-card">
              <span className="kpi-value">{data.summary?.total_parents ?? 0}</span>
              <span className="kpi-label">Total Parents</span>
            </div>
            <div className="kpi-card">
              <span className="kpi-value">{data.summary?.active ?? 0}</span>
              <span className="kpi-label">Active</span>
            </div>
            <div className="kpi-card">
              <span className="kpi-value">{data.summary?.cashback_candidates ?? 0}</span>
              <span className="kpi-label">Fees Paid, No Premium</span>
            </div>
            <div className="kpi-card">
              <span className="kpi-value">KSh {(data.summary?.total_outstanding ?? 0).toLocaleString()}</span>
              <span className="kpi-label">Outstanding</span>
            </div>
          </div>

          <table className="table">
            <thead>
              <tr>
                <th>Pay</th><th>Parent</th><th>Phone</th><th>Children</th><th>Count</th><th>Status</th><th>Fees Paid?</th><th>Due (KSh)</th>
              </tr>
            </thead>
            <tbody>
              {data.parents?.map((p, i) => (
                <tr key={p.parent_phone} className={p.cashback_candidate ? 'cashback-row' : (!p.is_active ? 'unpaid-row' : '')}>
                  <td>
                    {!p.is_active && (
                      <input
                        type="checkbox"
                        checked={!!selected[p.parent_phone]}
                        onChange={() => toggle(p.parent_phone)}
                      />
                    )}
                  </td>
                  <td>{p.parent_name}</td>
                  <td>{p.parent_phone}</td>
                  <td>{p.children_names}</td>
                  <td>{p.child_count}</td>
                  <td>
                    {p.is_active
                      ? <span style={{ color: '#2e7d32', fontWeight: 600 }}>Active{p.premium_expires_at ? ` · ${new Date(p.premium_expires_at).toLocaleDateString()}` : ''}</span>
                      : <span style={{ color: '#d32f2f', fontWeight: 600 }}>Unpaid</span>}
                    {p.cashback_candidate && (
                      <span style={{ display: 'inline-block', marginLeft: 6, background: '#FFF8E1', color: '#E65100', fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 99 }}>Cashback</span>
                    )}
                  </td>
                  <td>{p.fees_paid ? '✓ Paid' : '—'}</td>
                  <td>{p.amount_due?.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr>
                <td colSpan="7">Selected: {selectedPhones.length} parent(s)</td>
                <td>{selectedTotal.toLocaleString()}</td>
              </tr>
            </tfoot>
          </table>

          <div className="filters" style={{ marginTop: 16, alignItems: 'center', gap: 12 }}>
            <label style={{ display: 'flex', flexDirection: 'column', flex: 1, fontSize: 14 }}>
              School office M-Pesa phone
              <input
                type="tel"
                value={schoolPhone}
                onChange={e => setSchoolPhone(e.target.value)}
                placeholder="Enter school office phone to receive STK push"
                style={{ marginTop: 6, padding: '8px 10px', fontSize: 14 }}
              />
            </label>
            <button className="btn-small btn-danger" style={{ padding: '8px 18px', fontSize: 14 }} disabled={paying || selectedPhones.length !== 1} onClick={handlePay}>
              {paying ? 'Sending M-Pesa…' : `Activate Premium (KSh ${selectedTotal.toLocaleString()})`}
            </button>
          </div>

          <div style={{ marginTop: 12, display: 'flex', gap: 12, alignItems: 'center' }}>
            <button className="btn-small" style={{ padding: '8px 18px', fontSize: 14 }} disabled={paying || (data && data.summary?.unpaid === 0) || !schoolPhone} onClick={async () => {
              if (!schoolPhone) { setMsg('Enter school office phone for bulk STK push'); return; }
              if (!window.confirm(`Send a single STK push to ${schoolPhone} covering all unpaid parents (KSh ${(data?.summary?.total_outstanding || 0).toLocaleString()})?`)) return;
              setPaying(true); setMsg('');
              try {
                const r = await payBulkSubscriptions({ school_id: schoolId, term, year, school_phone: schoolPhone, recorded_by: user?.email || 'BAZAR' });
                setMsg(r.message || `Bulk STK initiated — ref ${r.transaction_reference} — waiting for Daraja callback`);
              } catch (err) { setMsg(`Failed: ${err.message}`); }
              setPaying(false);
            }}>
              {paying ? 'Sending bulk STK…' : `Pay All Unpaid (KSh ${(data?.summary?.total_outstanding || 0).toLocaleString()})`}
            </button>
            <span style={{ color: '#666', fontSize: 13 }}>Bulk STK: one push to the school office phone for all unpaid parents; callbacks will activate each subscription.</span>
          </div>

          <p style={{ marginTop: 8, color: '#555', fontSize: 14 }}>
            The M-Pesa STK push goes to the school office phone and pays the premium directly. Parents whose school fees already included premium are flagged as cashback candidates. Select exactly one unpaid parent for a single STK, or use "Pay All Unpaid" for everyone via one push.
          </p>
        </>
      )}
    </div>
  );
}
