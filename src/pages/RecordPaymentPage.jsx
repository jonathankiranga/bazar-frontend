import { useState, useEffect, useMemo } from 'react';
import { getStudentBalances, recordPayment, getClasses } from '../utils/api';
import StudentSelector from '../components/StudentSelector';

function formatCurrency(val) {
  return (val || 0).toLocaleString();
}

function PaymentModal({ student, schoolId, term, year, user, onClose, onSaved }) {
  const [paymentForm, setPaymentForm] = useState({
    amount: '',
    payment_method: 'Cash',
    notes: ''
  });
  const [saving, setSaving] = useState(false);
  const [modalError, setModalError] = useState('');

  function formatCurrency(val) {
    return (val || 0).toLocaleString();
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!paymentForm.amount || parseFloat(paymentForm.amount) <= 0) {
      setModalError('Enter a valid amount');
      return;
    }
    setSaving(true);
    setModalError('');
    try {
      const resp = await recordPayment({
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
      setModalError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(0,0,0,0.4)' }}>
      <div className="bg-white rounded-card shadow-xl p-6 w-full max-w-lg max-h-[80vh] overflow-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold" style={{ color: '#333' }}>Record Payment</h2>
          <button onClick={onClose} className="text-sm" style={{ color: '#888' }}>✕</button>
        </div>
        <div className="student-summary">
          <strong>{student.full_name}</strong>
          <span className="student-meta">{student.class_name} - ID: {student.student_id}</span>
          <div className="balance-due">
            Balance Due: <strong>KSh {formatCurrency(student.balance)}</strong>
          </div>
        </div>
        <form onSubmit={async (e) => { e.preventDefault(); }}>
          {modalError && <p className="form-msg error">{modalError}</p>}
          <div className="form-group">
            <label>Amount (KSh) *</label>
            <input
              type="number"
              step="0.01"
              placeholder="Enter amount"
              value={form.amount}
              onChange={e => setForm({ ...form, amount: e.target.value })}
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
          <div className="form-row">
            <div className="form-group">
              <label>Term</label>
              <select value={form.term} onChange={e => setForm({ ...form, term: e.target.value })}>
                <option value="Term 1">Term 1</option>
                <option value="Term 2">Term 2</option>
                <option value="Term 3">Term 3</option>
              </select>
            </div>
            <div className="form-group">
              <label>Year</label>
              <input
                type="number"
                value={form.year}
                onChange={e => setForm({ ...form, year: parseInt(e.target.value) })}
                min={2020}
                max={2030}
              />
            </div>
          </div>
          <div className="form-group">
            <label>Notes (optional)</label>
            <textarea
              value={paymentForm.notes}
              onChange={e => setForm({ ...paymentForm, notes: e.target.value })}
              rows={2}
              placeholder="Reference, cheque no., etc."
            />
          </div>
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
  const [classes, setClasses] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [classFilter, setClassFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [term, setTerm] = useState('Term 1');
  const [year, setYear] = useState(new Date().getFullYear());
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [msg, setMsg] = useState('');

  useEffect(() => {
    if (!schoolId) return;
    getClasses(schoolId).then(r => setClasses(r.classes || [])).catch(console.error);
  }, [schoolId]);

  const loadStudents = async () => {
    if (!schoolId) return;
    setLoading(true);
    try {
      const r = await getStudentBalances(schoolId, term, year, classFilter || undefined);
      setStudents(r.students || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadStudents(); }, [schoolId, term, year, classFilter]);

  const filteredStudents = useMemo(() => {
    if (!searchQuery.trim()) return students;
    const q = searchQuery.toLowerCase();
    return students.filter(s => 
      s.full_name.toLowerCase().includes(q) || 
      s.student_id.toLowerCase().includes(q)
    );
  }, [students, searchQuery]);

  const [showModal, setShowModal] = useState(false);
  const [modalStudent, setModalStudent] = useState(null);

  const openModal = (student) => {
    setModalStudent(student);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setModalStudent(null);
  };

  const handleStudentSelect = (student) => {
    setModalStudent(student);
    setShowModal(true);
  };

  if (!schoolId) return <div className="page"><p>School not found for this account</p></div>;

  return (
    <div className="page">
      <h2>Record Payment</h2>

      <div className="filter-bar">
        <select value={term} onChange={e => setTerm(e.target.value)} className="select-sm">
          <option value="Term 1">Term 1</option>
          <option value="Term 2">Term 2</option>
          <option value="Term 3">Term 3</option>
        </select>
        <select value={year} onChange={e => setYear(e.target.value)} className="select-sm">
          {[2024, 2025, 2026, 2027].map(y => <option key={y} value={y}>{y}</option>)}
        </select>
        <select value={classFilter} onChange={e => setClassFilter(e.target.value)} className="select-sm">
          <option value="">All Classes</option>
          {classes.map(c => <option key={c.class_id} value={c.class_id}>{c.class_name}</option>)}
        </select>
        <input
          type="text"
          placeholder="Search student name..."
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          className="search-input"
        />
      </div>

      {msg && <p className="form-msg success">{msg}</p>}

      <div className="table-wrap">
        <table className="data-table">
          <thead>
            <tr>
              <th>Class</th>
              <th>Student</th>
              <th>Due</th>
              <th>Paid</th>
              <th>Balance</th>
              <th style={{ width: 60 }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6} className="text-center">Loading...</td></tr>
            ) : filteredStudents.length === 0 ? (
              <tr><td colSpan={6} className="text-center">No students found</td></tr>
            ) : (
              filteredStudents.map(s => (
                <tr key={s.student_id} onClick={() => openModal(s)} style={{ cursor: 'pointer' }}>
                  <td>{s.class_name || '-'}</td>
                  <td className="student-name">{s.full_name}</td>
                  <td className="currency">KSh {formatCurrency(s.total_due)}</td>
                  <td className="currency paid">KSh {formatCurrency(s.total_paid)}</td>
                  <td className="currency balance">{s.balance > 0 ? 'KSh ' + formatCurrency(s.balance) : 'Cleared'}</td>
                  <td className="action-btn">Select</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {showModal && modalStudent && (
        <PaymentModal
          student={modalStudent}
          schoolId={schoolId}
          term={term}
          year={year}
          onClose={() => setShowModal(false)}
          onSaved={() => { loadStudents(); setMsg('Payment recorded!'); }}
        />
      )}

      {msg && <p className="form-msg success">{msg}</p>}
    </div>
  );
}
