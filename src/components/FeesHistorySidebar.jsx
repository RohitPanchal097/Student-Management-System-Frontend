import { useState, useEffect } from "react";

function FeesHistorySidebar({ courses, batches }) {
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [courseId, setCourseId] = useState("");
  const [batchId, setBatchId] = useState("");
  const [year, setYear] = useState("");
  const [semester, setSemester] = useState("");
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(false);

  const filterBatches = courseId ? batches.filter(b => b.course_id === parseInt(courseId)) : batches;

  const fetchPayments = async () => {
    setLoading(true);
    const params = [];
    if (from) params.push(`from=${from}`);
    if (to) params.push(`to=${to}`);
    if (courseId) params.push(`course_id=${courseId}`);
    if (batchId) params.push(`batch_id=${batchId}`);
    if (year) params.push(`year=${encodeURIComponent(year)}`);
    if (semester) params.push(`semester=${encodeURIComponent(semester)}`);
    const url = `http://localhost:5000/api/fees_payments${params.length ? '?' + params.join('&') : ''}`;
    const res = await fetch(url);
    const data = await res.json();
    setPayments(data);
    setLoading(false);
  };

  useEffect(() => { fetchPayments(); }, []); // initial load

  return (
    <div className="card shadow rounded-4 p-3 mb-4" style={{ minWidth: 350, maxWidth: 500 }}>
      <h5 className="mb-3">Fees History / Collection</h5>
      <form className="row g-2 mb-2" onSubmit={e => { e.preventDefault(); fetchPayments(); }}>
        <div className="col-6">
          <label className="form-label">From</label>
          <input type="date" className="form-control" value={from} onChange={e => setFrom(e.target.value)} />
        </div>
        <div className="col-6">
          <label className="form-label">To</label>
          <input type="date" className="form-control" value={to} onChange={e => setTo(e.target.value)} />
        </div>
        <div className="col-6">
          <label className="form-label">Course</label>
          <select className="form-select" value={courseId} onChange={e => setCourseId(e.target.value)}>
            <option value="">All</option>
            {courses.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
        <div className="col-6">
          <label className="form-label">Batch</label>
          <select className="form-select" value={batchId} onChange={e => setBatchId(e.target.value)}>
            <option value="">All</option>
            {filterBatches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
          </select>
        </div>
        <div className="col-6">
          <label className="form-label">Year</label>
          <select className="form-select" value={year} onChange={e => setYear(e.target.value)}>
            <option value="">All</option>
            <option value="1st Year">1st Year</option>
            <option value="2nd Year">2nd Year</option>
            <option value="3rd Year">3rd Year</option>
            <option value="4th Year">4th Year</option>
          </select>
        </div>
        <div className="col-6">
          <label className="form-label">Semester</label>
          <select className="form-select" value={semester} onChange={e => setSemester(e.target.value)}>
            <option value="">All</option>
            <option value="1st Semester">1st Semester</option>
            <option value="2nd Semester">2nd Semester</option>
            <option value="3rd Semester">3rd Semester</option>
            <option value="4th Semester">4th Semester</option>
            <option value="5th Semester">5th Semester</option>
            <option value="6th Semester">6th Semester</option>
            <option value="7th Semester">7th Semester</option>
            <option value="8th Semester">8th Semester</option>
          </select>
        </div>
        <div className="col-12 d-grid">
          <button className="btn btn-primary" type="submit">Apply Filters</button>
        </div>
      </form>
      <div className="table-responsive" style={{ maxHeight: 300, overflowY: 'auto' }}>
        <table className="table table-bordered table-sm">
          <thead>
            <tr>
              <th>Date</th>
              <th>Student</th>
              <th>Course</th>
              <th>Batch</th>
              <th>Year</th>
              <th>Amount</th>
              <th>Mode</th>
              <th>Note</th>
            </tr>
          </thead>
          <tbody>
            {loading ? <tr><td colSpan={8}>Loading...</td></tr> :
              payments.length === 0 ? <tr><td colSpan={8}>No records</td></tr> :
              payments.map((p, i) => (
                <tr key={p.id || i}>
                  <td>{p.date}</td>
                  <td>{p.student_name}</td>
                  <td>{p.course}</td>
                  <td>{p.batch}</td>
                  <td>{p.year}</td>
                  <td>{p.amount}</td>
                  <td>{p.mode}</td>
                  <td>{p.note}</td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default FeesHistorySidebar; 