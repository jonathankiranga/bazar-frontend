import { useState } from 'react';
import { recordPayment } from '../utils/api';
import StudentSelector from '../components/StudentSelector';

function formatCurrency(val) {
  return (val || 0).toLocaleString();
}

function PaymentModal({ student, schoolId, term, year, onClose, onSaved }) {
  const [paymentForm, setPaymentForm] = useState({
    amount: '',
    payment_method: 'Cash',
    notes: ''
  });
  const [saving, setSaving] = useState(false);
  const [modalError, setModalError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!paymentForm.amount || parseFloat(paymentForm.amount) <= 0) {
      setModalError('Enter a valid amount');
      return;
    }
    setSaving(true);
    setModalError('');
    try {
      await recordPayment({
        school_id: schoolId,
        student_id: student.student_id,
        amount: parseFloat(paymentForm.amount),
        payment_method: paymentForm.payment_method,
        notes: paymentForm.notes,
        term,
        academic_year: year,
        recorded_by: 'BAZAR'
      });
      if (onSaved) onSaved();
      onClose();
    } catch (err) {
      setModalError(err.response?.data?.error || err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(0,0,0,0.4)' }}>
      <div className="bg-white rounded-card shadow-xl p-6 w-full max-w-lg max-h-[80vh] overflow-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold" style={{ color: '#333' }}>Record Payment</h2>
          <button onClick={onClose} className="text-sm" style={{ color: '#888' }}>X</button>
        </div>
        <div className="student-summary">
          <strong>{student.full_name}</strong>
          <span className="student-meta">{student.class_name} - ID: {student.student_id}</span>
          <div className="balance-due">
            Balance Due: <strong>KSh {formatCurrency(student.balance)}</strong>
          </div>
        </div>
        <form onSubmit={handleSubmit}>
          {modalError && <p className="form-msg error">{modalError}</p>}
          <div className="form-group">
            <label>Amount (KSh) *</label>
            <input
              type="number"
              step="0.01"
              placeholder="Enter amount"
              value={paymentForm.amount}
              onChange={e => setPaymentForm({ ...paymentForm, amount: e.target.value })}
              required
              autoFocus
            />
          </div>
          <div className="form-group">
            <label>Payment Method *</label>
            <select
              value={paymentForm.payment_method}
              onChange={e => setPaymentForm({ ...paymentForm, payment_method: e.target.value })}
            >
              <option value="Cash">Cash</option>
              <option value="Bank Transfer">Bank Transfer</option>
              <option value="Cheque">Cheque</option>
              <option value="M-Pesa">M-Pesa</option>
            </select>
          </div>
          <div className="form-group">
            <label>Notes (optional)</label>
            <textarea
              value={paymentForm.notes}
              onChange={e => setPaymentForm({ ...paymentForm, notes: e.target.value })}
              rows={2}
              placeholder="Reference, cheque no., etc."
            />
          </div>
          <p className="text-xs mb-3" style={{ color: '#888' }}>
            For {term}, {year}
          </p>
          <div className="modal-actions">
            <button type="button" className="btn-secondary" onClick={onClose} disabled={saving}>
              Cancel
            </button>
            <button type="submit" className="btn-primary" disabled={saving}>
              {saving ? 'Recording...' : 'Record Payment'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function RecordPaymentPage({ user }) {
  const schoolId = user?.school_id;
  const [term] = useState('Term 1');
  const [year] = useState(new Date().getFullYear());
  const [modalStudent, setModalStudent] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [msg, setMsg] = useState('');

  if (!schoolId) return <div className="page"><p>School not found for this account</p></div>;

  return (
    <div className="page">
      <h2>Record Payment</h2>

      {msg && <p className="form-msg success">{msg}</p>}

      <StudentSelector
        key={refreshKey}
        schoolId={schoolId}
        initialTerm={term}
        initialYear={year}
        onSelect={(student) => setModalStudent(student)}
      />

      {modalStudent && (
        <PaymentModal
          student={modalStudent}
          schoolId={schoolId}
          term={term}
          year={year}
          onClose={() => setModalStudent(null)}
          onSaved={() => {
            setRefreshKey(k => k + 1);
            setMsg('Payment recorded successfully!');
            setTimeout(() => setMsg(''), 4000);
          }}
        />
      )}
    </div>
  );
}
