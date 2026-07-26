import { useState, useEffect } from 'react';
import { getReport } from '../utils/api';

export default function ReportPage({ user }) {
  const schoolId = user?.school_id;
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [term, setTerm] = useState('Term 1');
  const [year, setYear] = useState(new Date().getFullYear());

  useEffect(() => {
    if (!schoolId) return;
    setLoading(true);
    getReport(schoolId, term, year).then(setData).catch(console.error).finally(() => setLoading(false));
  }, [schoolId, term, year]);

  return (
    <div className="page">
      <h2>Collection Report</h2>
      <div className="filters">
        <select value={term} onChange={e => setTerm(e.target.value)}>
          <option>Term 1</option><option>Term 2</option><option>Term 3</option>
        </select>
        <input type="number" value={year} onChange={e => setYear(e.target.value)} style={{ width: 80 }} />
      </div>
      {loading ? <p>Loading…</p> : (
        <>
          <h3>Per Class Collection</h3>
          <table className="table">
            <thead>
              <tr><th>Class</th><th>Students</th><th>Due (KSh)</th><th>Paid (KSh)</th><th>Balance (KSh)</th><th>Rate</th></tr>
            </thead>
            <tbody>
              {data?.class_report?.map(r => (
                <tr key={r.class_name}>
                  <td>{r.class_name}</td>
                  <td>{r.student_count}</td>
                  <td>{r.total_due?.toLocaleString()}</td>
                  <td>{r.total_paid?.toLocaleString()}</td>
                  <td>{(r.total_due - r.total_paid)?.toLocaleString()}</td>
                  <td>{r.total_due > 0 ? (r.total_paid / r.total_due * 100).toFixed(1) : 0}%</td>
                </tr>
              ))}
            </tbody>
          </table>

          <h3>Daily Collections (Last 30 Days)</h3>
          <table className="table">
            <thead>
              <tr><th>Date</th><th>Count</th><th>Amount (KSh)</th></tr>
            </thead>
            <tbody>
              {data?.daily_collections?.map(d => (
                <tr key={d.date}>
                  <td>{d.date}</td>
                  <td>{d.count}</td>
                  <td>{d.total?.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}
    </div>
  );
}
