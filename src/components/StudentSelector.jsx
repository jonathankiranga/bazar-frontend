import { useState, useEffect, useMemo } from 'react';
import { getStudentBalances, getClasses } from '../utils/api';

function formatCurrency(val) {
  return (val || 0).toLocaleString();
}

export default function StudentSelector({ 
  schoolId, 
  term, 
  year, 
  onSelect, 
  initialClassId = '',
  initialTerm = 'Term 1',
  initialYear = new Date().getFullYear()
}) {
  const [classes, setClasses] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [classFilter, setClassFilter] = useState(initialClassId);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentTerm, setCurrentTerm] = useState(initialTerm);
  const [currentYear, setCurrentYear] = useState(initialYear);

  // Load classes on mount
  useEffect(() => {
    if (!schoolId) return;
    getClasses(schoolId).then(r => setClasses(r.classes || [])).catch(console.error);
  }, [schoolId]);

  // Load students when filters change
  const loadStudents = async () => {
    if (!schoolId) return;
    setLoading(true);
    try {
      const r = await getStudentBalances(schoolId, currentTerm, currentYear, classFilter || undefined);
      setStudents(r.students || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadStudents(); }, [schoolId, currentTerm, currentYear, classFilter]);

  // Client-side name search
  const filteredStudents = useMemo(() => {
    if (!searchQuery.trim()) return students;
    const q = searchQuery.toLowerCase();
    return students.filter(s => 
      s.full_name.toLowerCase().includes(q) || 
      s.student_id.toLowerCase().includes(q)
    );
  }, [students, searchQuery]);

  const handleSelect = (student) => {
    onSelect(student);
  };

  const formatCurrency = (val) => (val || 0).toLocaleString();

  return (
    <div className="page">
      <h2>Select Student</h2>

      {/* Filters */}
      <div className="filter-bar">
        <select value={currentTerm} onChange={e => setCurrentTerm(e.target.value)} className="select-sm">
          <option value="Term 1">Term 1</option>
          <option value="Term 2">Term 2</option>
          <option value="Term 3">Term 3</option>
        </select>
        <select value={currentYear} onChange={e => setCurrentYear(parseInt(e.target.value))} className="select-sm">
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

      {/* Student Table */}
      <div className="table-wrap">
        <table className="data-table">
          <thead>
            <tr>
              <th>Class</th>
              <th>Student</th>
              <th>Due</th>
              <th>Paid</th>
              <th>Balance</th>
              <th style={{ width: 80 }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6} className="text-center">Loading...</td></tr>
            ) : filteredStudents.length === 0 ? (
              <tr><td colSpan={6} className="text-center">No students found</td></tr>
            ) : (
              filteredStudents.map(s => (
                <tr key={s.student_id} onClick={() => handleSelect(s)} style={{ cursor: 'pointer' }}>
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
    </div>
  );
}