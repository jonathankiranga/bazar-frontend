import { useState, useEffect } from 'react';
import { getPayments, reversePayment } from '../utils/api';

const PAGE_SIZE = 50;

export default function PaymentsPage({ user }) {
  const schoolId = user?.school_id;
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);

  // Filters the user edits
  const [searchInput, setSearchInput] = useState('');
  const [method, setMethod] = useState('');
  const [term, setTerm] = useState('');
  const [year, setYear] = useState('');

  // Debounced values that actually trigger fetches
  const [search, setSearch] = useState('');
  const [debouncedFilters, setDebouncedFilters] = useState(null);

  useEffect(() => {
    const t = setTimeout(() => setSearch(searchInput.trim()), 400);
    return () => clearTimeout(t);
  }, [searchInput]);

  useEffect(() => {
    setPage(1);
    setDebouncedFilters({ search, method, term, year });
  }, [search, method, term, year]);

  const load = () => {
    if (!schoolId) return;
    setLoading(true);
    const params = { page, limit: PAGE_SIZE };
    if (debouncedFilters) {
      if (debouncedFilters.search) params.search = debouncedFilters.search;
      if (debouncedFilters.method) params.method = debouncedFilters.method;
      if (debouncedFilters.term) params.term = debouncedFilters.term;
      if (debouncedFilters.year) params.year = debouncedFilters.year;
    }
    getPayments(schoolId, params).then(d => {
      setPayments(d.payments || []);
      const pg = d.pagination || {};
      setTotalRecords(pg.total ?? d.total ?? 0);
      setTotalPages(Math.max(1, pg.pages ?? Math.ceil((pg.total ?? d.total ?? 0) / PAGE_SIZE)));
    }).catch(console.error).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [schoolId, page, debouncedFilters]);

  const handleReverse = async (ref) => {
    if (!window.confirm('Reverse this payment?')) return;
    try {
      await reversePayment({ transaction_reference: ref, reversed_by: user?.email || 'admin' });
      load();
    } catch (err) {
      alert(err.response?.data?.error || err.message);
    }
  };

  const years = [];
  for (let y = new Date().getFullYear() + 1; y >= 2024; y--) years.push(y);
  const activeFilterCount = [search, method, term, year].filter(Boolean).length;

  if (!schoolId) return <div className="page"><p>School not found for this account</p></div>;

  return (
    <div className="page">
      <h2>Payment History</h2>

      <div className="filter-bar">
        <input
          type="text"
          className="search-input"
          placeholder="Search reference, student name, phone or exact amount..."
          value={searchInput}
          onChange={e => setSearchInput(e.target.value)}
        />
        <select value={method} onChange={e => setMethod(e.target.value)} className="select-sm">
          <option value="">All Methods</option>
          <option>Cash</option>
          <option>Bank Transfer</option>
          <option>Cheque</option>
          <option>M-Pesa</option>
        </select>
        <select value={term} onChange={e => setTerm(e.target.value)} className="select-sm">
          <option value="">All Terms</option>
          <option>Term 1</option>
          <option>Term 2</option>
          <option>Term 3</option>
        </select>
        <select value={year} onChange={e => setYear(e.target.value)} className="select-sm">
          <option value="">All Years</option>
          {years.map(y => <option key={y} value={y}>{y}</option>)}
        </select>
        {activeFilterCount > 0 && (
          <button
            className="btn-small btn-secondary"
            onClick={() => { setSearchInput(''); setSearch(''); setMethod(''); setTerm(''); setYear(''); }}
          >
            Clear ({activeFilterCount})
          </button>
        )}
      </div>

      <p className="result-count">
        {loading ? 'Searching...' : `${Number(totalRecords).toLocaleString()} transaction${totalRecords === 1 ? '' : 's'} found`}
      </p>

      <div className="table-wrap">
        <table className="data-table">
          <thead>
            <tr>
              <th>Ref</th>
              <th>Student</th>
              <th>Amount</th>
              <th>Method</th>
              <th>Date</th>
              <th>Status</th>
              <th style={{ width: 90 }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={7} className="text-center">Loading...</td></tr>
            ) : payments.length === 0 ? (
              <tr><td colSpan={7} className="text-center">No transactions match your filters</td></tr>
            ) : (
              payments.map(p => (
                <tr key={p.id} style={p.reversed_at ? { opacity: 0.55 } : undefined}>
                  <td className="currency">{p.transaction_reference}</td>
                  <td className="student-name">{p.student_name || p.parent_phone || '-'}</td>
                  <td className="currency">KSh {p.amount?.toLocaleString()}</td>
                  <td>{p.payment_method}</td>
                  <td>{p.logged_at ? new Date(p.logged_at).toLocaleDateString() : '-'}</td>
                  <td>{p.reversed_at ? 'Reversed' : 'Active'}</td>
                  <td>
                    {!p.reversed_at && (
                      <button className="btn-small btn-danger" onClick={() => handleReverse(p.transaction_reference)}>Reverse</button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="pagination">
        <button disabled={page <= 1} onClick={() => setPage(1)}>First</button>
        <button disabled={page <= 1} onClick={() => setPage(p => p - 1)}>Prev</button>
        <span>Page {page} of {totalPages.toLocaleString()}</span>
        <button disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}>Next</button>
        <button disabled={page >= totalPages} onClick={() => setPage(totalPages)}>Last</button>
      </div>
    </div>
  );
}
