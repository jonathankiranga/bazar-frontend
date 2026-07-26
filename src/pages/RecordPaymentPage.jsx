import { useState, useEffect } from 'react';
import { getSchools, recordPayment } from '../utils/api';

export default function RecordPaymentPage({ user }) {
  const schoolId = user?.school_id;
  const [schools, setSchools] = useState([]);
  const [selectedSchool, setSelectedSchool] = useState(schoolId || '');
  const [form, setForm] = useState({ student_id: '', amount: '', payment_method: 'Cash', notes: '', term: 'Term 1', academic_year: new Date().getFullYear() });
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');

  useEffect(() => {
    getSchools().then(setSchools).catch(console.error);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedSchool) return alert('Select a school');
    setSaving(true);
    setMsg('');
    try {
      const resp = await recordPayment({ ...form, school_id: parseInt(selectedSchool), amount: parseFloat(form.amount) });
      setMsg(`Payment recorded! Ref: ${resp.reference}`);
      setForm({ ...form, student_id: '', amount: '', notes: '' });
    } catch (err) {
      setMsg(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="page">
      <h2>Record Payment</h2>
      <form className="pay-form" onSubmit={handleSubmit}>
        {!schoolId && (
          <select value={selectedSchool} onChange={e => setSelectedSchool(e.target.value)} required>
            <option value="">Select School</option>
            {schools.map(s => <option key={s.school_id} value={s.school_id}>{s.name}</option>)}
          </select>
        )}
        <input type="text" placeholder="Student ID" value={form.student_id} onChange={e => setForm({ ...form, student_id: e.target.value })} required />
        <input type="number" step="0.01" placeholder="Amount (KSh)" value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })} required />
        <select value={form.payment_method} onChange={e => setForm({ ...form, payment_method: e.target.value })}>
          <option>Cash</option>
          <option>Bank Transfer</option>
          <option>Cheque</option>
        </select>
        <select value={form.term} onChange={e => setForm({ ...form, term: e.target.value })}>
          <option>Term 1</option>
          <option>Term 2</option>
          <option>Term 3</option>
        </select>
        <input type="number" placeholder="Year" value={form.academic_year} onChange={e => setForm({ ...form, academic_year: e.target.value })} />
        <textarea placeholder="Notes (optional)" value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} rows={2} />
        <button type="submit" disabled={saving}>{saving ? 'Recording…' : 'Record Payment'}</button>
      </form>
      {msg && <p className="form-msg">{msg}</p>}
    </div>
  );
}
