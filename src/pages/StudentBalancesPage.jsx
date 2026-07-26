import { useState, useEffect } from 'react';
import { getStudentBalances } from '../utils/api';

export default function StudentBalancesPage({ user }) {
  const schoolId = user?.school_id;
  const [balances, setBalances] = useState([]);
  const [loading, setLoading] = useState(true);
  const [term, setTerm] = useState('Term 1');
  const [year, setYear] = useState(new Date().getFullYear());
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (!schoolId) return;
    setLoading(true);
    getStudentBalances(schoolId, term, year).then(d => setBalances(d.students || [])).catch(console.error).finally(() => setLoading(false));
  }, [schoolId, term, year]);

  const filtered = balances.filter(b =>
    !search || b.full_name?.toLowerCase().includes(search.toLowerCase()) || String(b.student_id).includes(search)
  );

  return (
    <div className="page">
      <h2>Student Balances</h2>
      <div className="filters">
        <select value={term} onChange={e => setTerm(e.target.value)}>
          <option>Term 1</option><option>Term 2</option><option>Term 3</option>
        </select>
        <input type="number" value={year} onChange={e => setYear(e.target.value)} style={{ width: 80 }} />
        <input type="text" placeholder="Search student…" value={search} onChange={e => setSearch(e.target.value)} />
      </div>
      {loading ? <p>Loading…</p> : (
        <table className="table">
          <thead>
            <tr><th>ID</th><th>Name</th><th>Class</th><th>Due (KSh)</th><th>Paid (KSh)</th><th>Balance (KSh)</th><th>Status</th></tr>
          </thead>
          <tbody>
            {filtered.map(b => (
              <tr key={b.student_id}>
                <td>{b.student_id}</td>
                <td>{b.student_name}</td>
                <td>{b.class_name || '-'}</td>
                <td>{b.total_due?.toLocaleString()}</td>
                <td>{b.total_paid?.toLocaleString()}</td>
                <td style={{ color: b.balance > 0 ? '#d32f2f' : '#2e7d32', fontWeight: 600 }}>
                  {b.balance?.toLocaleString()}
                </td>
                <td>{b.payment_status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
