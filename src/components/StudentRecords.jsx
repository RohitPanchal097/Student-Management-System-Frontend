import { useState, useEffect } from "react";
import { useSelector, useDispatch } from 'react-redux';
import { fetchCourses } from '../slices/coursesSlice';
import { fetchAllBatches, fetchBatches } from '../slices/batchesSlice';
import { fetchStudents, updateStudent, deleteStudent } from '../slices/studentsSlice';

// Helper to fetch total paid and history for a student
const fetchFeesSummary = async (studentId) => {
  const res = await fetch(`http://localhost:5000/api/students/${studentId}/fees_history`);
  const history = await res.json();
  const totalPaid = history.reduce((sum, h) => sum + Number(h.amount || 0), 0);
  return { totalPaid, history };
};

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

function StudentRecords() {
  const dispatch = useDispatch();
  const { items: courses, status: coursesStatus } = useSelector(state => state.courses);
  const { items: students, status: studentsStatus } = useSelector(state => state.students);
  const { items: batches, status: batchesStatus } = useSelector(state => state.batches);

  // Local state for filtering and UI
  const [filterCourse, setFilterCourse] = useState("");
  const [filterBatch, setFilterBatch] = useState("");
  const [filterYear, setFilterYear] = useState("");
  const [filterSemester, setFilterSemester] = useState("");
  const [searchName, setSearchName] = useState("");
  const [displayed, setDisplayed] = useState([]);
  const [editStudent, setEditStudent] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [showConfirm, setShowConfirm] = useState({ show: false, id: null });
  const [message, setMessage] = useState("");

  // Fees modals state
  const [feesModal, setFeesModal] = useState({ show: false, student: null });
  const [historyModal, setHistoryModal] = useState({ show: false, student: null, history: [] });
  const [feesForm, setFeesForm] = useState({ amount: '', mode: '', date: '', note: '' });
  const [feesSummary, setFeesSummary] = useState({}); // { [studentId]: { totalPaid, due } }

  // Add a function to reset all filters
  const resetFilters = () => {
    setFilterCourse("");
    setFilterBatch("");
    setFilterYear("");
    setFilterSemester("");
    setSearchName("");
  };

  // Fetch data on mount
  useEffect(() => {
    if (coursesStatus === 'idle') {
      dispatch(fetchCourses());
    }
    if (studentsStatus === 'idle') {
      dispatch(fetchStudents());
    }
    if (batchesStatus === 'idle') {
      dispatch(fetchAllBatches());
    }
  }, [dispatch, coursesStatus, studentsStatus, batchesStatus]);

  // Get batches for selected course in filter
  const filterBatches = filterCourse ? batches.filter(b => b.course_id === parseInt(filterCourse)) : [];

  // Update displayed students when data changes
  useEffect(() => {
    setDisplayed(students);
  }, [students]);

  // Auto-filter students whenever filters change
  useEffect(() => {
    let result = students;
    if (filterCourse) {
      result = result.filter((s) => String(s.course_id) === String(filterCourse));
    }
    if (filterBatch) {
      result = result.filter((s) => String(s.batch_id) === String(filterBatch));
    }
    if (filterYear) {
      result = result.filter((s) => String(s.year) === String(filterYear));
    }
    if (filterSemester) {
      result = result.filter((s) => String(s.semester) === String(filterSemester));
    }
    if (searchName.trim()) {
      result = result.filter((s) => s.name.toLowerCase().includes(searchName.toLowerCase()));
    }
    setDisplayed(result);
  }, [students, filterCourse, filterBatch, filterYear, filterSemester, searchName]);

  // Reset to all students if all filters are cleared
  useEffect(() => {
    if (!filterCourse && !filterBatch && !searchName) {
      setDisplayed(students);
    }
  }, [filterCourse, filterBatch, searchName, students]);

  // Fetch fees summary for displayed students
  useEffect(() => {
    const fetchAll = async () => {
      const summary = {};
      for (const s of displayed) {
        const { totalPaid } = await fetchFeesSummary(s.id);
        summary[s.id] = {
          totalPaid,
          due: Number(s.fees_total || 0) - totalPaid,
        };
      }
      setFeesSummary(summary);
    };
    if (displayed.length) fetchAll();
  }, [displayed]);

  // Edit logic
  const openEdit = (student) => {
    setEditStudent(student);
    setEditForm({
      name: student.name || "",
      father_name: student.father_name || "",
      dob: student.dob || "",
      mobile: student.mobile || "",
      email: student.email || "",
      gender: student.gender || "",
      admission_date: student.admission_date || "",
      year: student.year || "",
      semester: student.semester || "",
      course_id: student.course_id ? String(student.course_id) : "",
      batch_id: student.batch_id ? String(student.batch_id) : "",
      fees_total: student.fees_total !== undefined && student.fees_total !== null ? String(student.fees_total) : "",
    });
  };

  // Fetch batches for the selected course when edit modal opens or course changes in edit form
  useEffect(() => {
    if (editStudent && editForm.course_id) {
      dispatch(fetchBatches(editForm.course_id));
    }
  }, [editStudent, editForm.course_id, dispatch]);

  const handleEditChange = (e) => {
    setEditForm({ ...editForm, [e.target.name]: e.target.value });
    if (e.target.name === "course_id") {
      setEditForm(f => ({ ...f, batch_id: "" }));
    }
  };

  // Document upload logic
  const [uploadStatus, setUploadStatus] = useState({});
  const handleDocumentUpload = async (e, docType) => {
    const file = e.target.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('doc_type', docType);
    formData.append('file', file);
    setUploadStatus(s => ({ ...s, [docType]: 'Uploading...' }));
    try {
      const res = await fetch(`http://localhost:5000/api/students/${editStudent.id}/upload_document`, {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (data.success) {
        setUploadStatus(s => ({ ...s, [docType]: data.filename }));
      } else {
        setUploadStatus(s => ({ ...s, [docType]: 'Error' }));
      }
    } catch {
      setUploadStatus(s => ({ ...s, [docType]: 'Error' }));
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      // Only send the required fields to the backend
      const payload = {
        name: editForm.name,
        father_name: editForm.father_name, // Ensure this is included
        dob: editForm.dob,
        mobile: editForm.mobile,
        email: editForm.email,
        gender: editForm.gender,
        admission_date: editForm.admission_date,
        year: editForm.year,
        semester: editForm.semester,
        course_id: editForm.course_id,
        batch_id: editForm.batch_id,
        fees_total: editForm.fees_total,
      };
      await dispatch(updateStudent({ id: editStudent.id, data: payload })).unwrap();
      await dispatch(fetchStudents()); // Ensure table refreshes with latest data
      setEditStudent(null);
      setMessage("Student updated successfully!");
    } catch (error) {
      setMessage("Error: " + error.message);
    }
  };

  const handleDelete = async (id) => {
    setShowConfirm({ show: false, id: null });
    try {
      await dispatch(deleteStudent(id)).unwrap();
      setMessage("Student deleted successfully!");
    } catch (error) {
      setMessage("Error: " + error.message);
    }
  };

  // Handle update fees
  const openFeesModal = (student) => {
    setFeesForm({ amount: '', mode: '', date: '', note: '' });
    setFeesModal({ show: true, student });
  };
  const handleFeesFormChange = (e) => {
    setFeesForm({ ...feesForm, [e.target.name]: e.target.value });
  };
  const handleFeesSubmit = async (e) => {
    e.preventDefault();
    await fetch(`http://localhost:5000/api/students/${feesModal.student.id}/add_fees_payment`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(feesForm),
    });
    setFeesModal({ show: false, student: null });
    // Refresh summary
    const { totalPaid } = await fetchFeesSummary(feesModal.student.id);
    setFeesSummary(s => ({ ...s, [feesModal.student.id]: { totalPaid, due: Number(feesModal.student.fees_total || 0) - totalPaid } }));
  };

  // Handle view history
  const openHistoryModal = async (student) => {
    const { history } = await fetchFeesSummary(student.id);
    setHistoryModal({ show: true, student, history });
  };
  const closeHistoryModal = () => setHistoryModal({ show: false, student: null, history: [] });

  // Delete payment from history
  const handleDeletePayment = async (paymentId, studentId) => {
    await fetch(`http://localhost:5000/api/fees_payments/${paymentId}`, { method: 'DELETE' });
    // Refresh history and summary
    const { history, totalPaid } = await fetchFeesSummary(studentId);
    setHistoryModal(hm => ({ ...hm, history }));
    setFeesSummary(s => ({ ...s, [studentId]: { totalPaid, due: Number(displayed.find(stu => stu.id === studentId)?.fees_total || 0) - totalPaid } }));
    await dispatch(fetchStudents()); // Also refresh students list for table
  };

  // Export to CSV
  const exportCSV = () => {
    const headers = ["Name", "Course", "Batch", "Year", "Semester", "Mobile", "Email"];
    const rows = displayed.map(s => [s.name, s.course, s.batch, s.year, s.semester, s.mobile, s.email]);
    let csvContent = "\uFEFF" + headers.join(",") + "\n" + rows.map(r => r.map(x => `"${x}"`).join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "student_records.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Print table
  const printTable = () => {
    const printContent = document.getElementById("student-records-table").outerHTML;
    const win = window.open("", "", "width=900,height=700");
    win.document.write(`
      <html><head><title>Print Student Records</title>
      <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootswatch@5.3.2/dist/darkly/bootstrap.min.css" />
      </head><body>${printContent}</body></html>
    `);
    win.document.close();
    win.focus();
    win.print();
    win.close();
  };

  return (
    <div className="card shadow rounded-4 p-4 mb-4">
      <div className="card-body p-0">
        <h2 className="mb-4 display-6 fw-bold">Student Records</h2>
        {message && <div className="alert alert-success mt-2 mb-3">{message}</div>}
        
        {/* Search/Filter Form */}
        <form className="row g-3 align-items-end mb-3" onSubmit={e => e.preventDefault()}>
          <div className="col-md-3">
            <label className="form-label">Course</label>
            <select 
              className="form-select" 
              value={filterCourse} 
              onChange={e => setFilterCourse(e.target.value)}
            >
              <option value="">All Courses</option>
              {courses.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
          <div className="col-md-3">
            <label className="form-label">Batch</label>
            <select 
              className="form-select" 
              value={filterBatch} 
              onChange={e => setFilterBatch(e.target.value)}
              disabled={!filterCourse}
            >
              <option value="">All Batches</option>
              {filterBatches.map((b) => (
                <option key={b.id} value={b.id}>{b.name}</option>
              ))}
            </select>
          </div>
          <div className="col-md-2">
            <label className="form-label">Year</label>
            <select
              className="form-select"
              value={filterYear}
              onChange={e => setFilterYear(e.target.value)}
            >
              <option value="">All Years</option>
              <option value="1st Year">1st Year</option>
              <option value="2nd Year">2nd Year</option>
              <option value="3rd Year">3rd Year</option>
              <option value="4th Year">4th Year</option>
            </select>
          </div>
          <div className="col-md-2">
            <label className="form-label">Semester</label>
            <select
              className="form-select"
              value={filterSemester}
              onChange={e => setFilterSemester(e.target.value)}
            >
              <option value="">All Semesters</option>
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
          <div className="col-md-4">
            <label className="form-label">Student Name</label>
            <input 
              className="form-control" 
              placeholder="Search by name" 
              value={searchName} 
              onChange={e => setSearchName(e.target.value)} 
            />
          </div>
          <div className="col-md-2 d-grid">
            <button className="btn btn-info mb-2" type="submit" disabled>Find / Search</button>
            <button className="btn btn-secondary" type="button" onClick={resetFilters}>
              Reset Filters
            </button>
          </div>
        </form>

        {/* Action Buttons */}
        <div className="mb-3 d-flex gap-2">
          <button className="btn btn-outline-success" onClick={exportCSV} type="button">
            Export CSV
          </button>
          <button className="btn btn-outline-primary" onClick={printTable} type="button">
            Print Table
          </button>
        </div>

        {/* Students Table */}
        <div className="table-responsive">
          <table className="table table-bordered table-hover align-middle" id="student-records-table">
            <thead className="table-light">
              <tr>
                <th>Name</th>
                <th>Father Name</th>
                <th>Course</th>
                <th>Batch</th>
                <th>Year</th>
                <th>Semester</th>
                <th>Mobile</th>
                <th>Email</th>
                <th>Fees Total</th>
                <th>Paid</th>
                <th>Due</th>
                <th>Fees Actions</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {displayed.map((s) => (
                <tr key={s.id}>
                  <td>{s.name}</td>
                  <td>{s.father_name}</td>
                  <td>{s.course}</td>
                  <td>{s.batch}</td>
                  <td>{s.year}</td>
                  <td>{s.semester}</td>
                  <td>{s.mobile}</td>
                  <td>{s.email}</td>
                  <td>{s.fees_total ? Number(s.fees_total) : 0}</td>
                  <td>{feesSummary[s.id]?.totalPaid ?? '...'}</td>
                  <td>{feesSummary[s.id]?.due ?? '...'}</td>
                  <td>
                    <button className="btn btn-sm btn-outline-success me-1" onClick={() => openFeesModal(s)}>Update Fees</button>
                    <button className="btn btn-sm btn-outline-info" onClick={() => openHistoryModal(s)}>View History</button>
                  </td>
                  <td>
                    <div className="btn-group btn-group-sm">
                      <button 
                        className="btn btn-outline-primary" 
                        onClick={() => openEdit(s)}
                      >
                        Edit
                      </button>
                      <button 
                        className="btn btn-outline-danger" 
                        onClick={() => setShowConfirm({ show: true, id: s.id })}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Edit Modal */}
        {editStudent && (
          <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
            <div className="modal-dialog modal-lg">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">Edit Student</h5>
                  <button 
                    type="button" 
                    className="btn-close" 
                    onClick={() => setEditStudent(null)}
                  ></button>
                </div>
                <form onSubmit={handleEditSubmit}>
                  <div className="modal-body">
                    <div className="row g-3">
                      <div className="col-md-6">
                        <label className="form-label">Father Name</label>
                        <input
                          className="form-control"
                          name="father_name"
                          value={editForm.father_name}
                          onChange={handleEditChange}
                          required
                        />
                      </div>
                      <div className="col-md-6">
                        <label className="form-label">Course</label>
                        <select 
                          className="form-select" 
                          name="course_id" 
                          value={editForm.course_id} 
                          onChange={handleEditChange} 
                          required
                        >
                          {courses.map((c) => (
                            <option key={c.id} value={String(c.id)}>{c.name}</option>
                          ))}
                        </select>
                      </div>
                      <div className="col-md-6">
                        <label className="form-label">Batch</label>
                        <select 
                          className="form-select" 
                          name="batch_id" 
                          value={editForm.batch_id}
                          onChange={handleEditChange} 
                          required
                        >
                          {batches.map((b) => (
                            <option key={b.id} value={String(b.id)}>{b.name}</option>
                          ))}
                        </select>
                      </div>
                      <div className="col-md-6">
                        <label className="form-label">Name</label>
                        <input 
                          className="form-control" 
                          name="name" 
                          value={editForm.name} 
                          onChange={handleEditChange} 
                          required 
                        />
                      </div>
                      <div className="col-md-6">
                        <label className="form-label">Mobile</label>
                        <input 
                          className="form-control" 
                          name="mobile" 
                          value={editForm.mobile} 
                          onChange={handleEditChange} 
                          required 
                        />
                      </div>
                      <div className="col-md-6">
                        <label className="form-label">Email</label>
                        <input 
                          type="email" 
                          className="form-control" 
                          name="email" 
                          value={editForm.email} 
                          onChange={handleEditChange} 
                          required 
                        />
                      </div>
                      <div className="col-md-6">
                        <label className="form-label">Date of Birth</label>
                        <input
                          type="date"
                          className="form-control"
                          name="dob"
                          value={editForm.dob}
                          onChange={handleEditChange}
                          required
                        />
                      </div>
                      <div className="col-md-6">
                        <label className="form-label">Gender</label>
                        <select
                          className="form-select"
                          name="gender"
                          value={editForm.gender}
                          onChange={handleEditChange}
                          required
                        >
                          <option value="">Select Gender</option>
                          <option value="Male">Male</option>
                          <option value="Female">Female</option>
                          <option value="Other">Other</option>
                        </select>
                      </div>
                      <div className="col-md-6">
                        <label className="form-label">Admission Date</label>
                        <input
                          type="date"
                          className="form-control"
                          name="admission_date"
                          value={editForm.admission_date}
                          onChange={handleEditChange}
                          required
                        />
                      </div>
                      <div className="col-md-6">
                        <label className="form-label">Year</label>
                        <select 
                          className="form-select" 
                          name="year" 
                          value={editForm.year} 
                          onChange={handleEditChange} 
                          required
                        >
                          <option value="">Select Year</option>
                          <option value="1st Year">1st Year</option>
                          <option value="2nd Year">2nd Year</option>
                          <option value="3rd Year">3rd Year</option>
                          <option value="4th Year">4th Year</option>
                        </select>
                      </div>
                      <div className="col-md-6">
                        <label className="form-label">Semester</label>
                        <select 
                          className="form-select" 
                          name="semester" 
                          value={editForm.semester} 
                          onChange={handleEditChange} 
                          required
                        >
                          <option value="">Select Semester</option>
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
                      <div className="col-md-6">
                        <label className="form-label">Per Year Fees (₹)</label>
                        <input
                          className="form-control"
                          name="fees_total"
                          type="number"
                          min="0"
                          value={editForm.fees_total}
                          onChange={handleEditChange}
                          required
                        />
                      </div>
                    </div>
                    <div className="col-12 mt-3">
                      <h6>Upload Documents</h6>
                      <div className="row g-2">
                        {[
                          { label: '10th Marksheet', type: '10th_marksheet' },
                          { label: '12th Marksheet', type: '12th_marksheet' },
                          { label: 'Passport Photo', type: 'photo' },
                          { label: 'Signature', type: 'signature' },
                          { label: 'Aadhar Card', type: 'aadhar' },
                          { label: 'Other Certificate', type: 'other' },
                        ].map(doc => (
                          <div className="col-md-4" key={doc.type}>
                            <label className="form-label">{doc.label}</label>
                            <input
                              className="form-control"
                              type="file"
                              accept=".pdf,.jpg,.jpeg,.png"
                              onChange={e => handleDocumentUpload(e, doc.type)}
                            />
                            {uploadStatus[doc.type] && (
                              <small className="text-success">{uploadStatus[doc.type]}</small>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="modal-footer">
                    <button 
                      type="button" 
                      className="btn btn-secondary" 
                      onClick={() => setEditStudent(null)}
                    >
                      Cancel
                    </button>
                    <button type="submit" className="btn btn-primary">Update Student</button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {showConfirm.show && (
          <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
            <div className="modal-dialog">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">Confirm Delete</h5>
                  <button 
                    type="button" 
                    className="btn-close" 
                    onClick={() => setShowConfirm({ show: false, id: null })}
                  ></button>
                </div>
                <div className="modal-body">
                  Are you sure you want to delete this student?
                </div>
                <div className="modal-footer">
                  <button 
                    type="button" 
                    className="btn btn-secondary" 
                    onClick={() => setShowConfirm({ show: false, id: null })}
                  >
                    Cancel
                  </button>
                  <button 
                    type="button" 
                    className="btn btn-danger" 
                    onClick={() => handleDelete(showConfirm.id)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Update Fees Modal */}
        {feesModal.show && (
          <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
            <div className="modal-dialog">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">Update Fees for {feesModal.student.name}</h5>
                  <button type="button" className="btn-close" onClick={() => setFeesModal({ show: false, student: null })}></button>
                </div>
                <form onSubmit={handleFeesSubmit}>
                  <div className="modal-body">
                    <div className="mb-2">
                      <label className="form-label">Amount (₹)</label>
                      <input className="form-control" name="amount" type="number" min="0" value={feesForm.amount} onChange={handleFeesFormChange} required />
                    </div>
                    <div className="mb-2">
                      <label className="form-label">Mode</label>
                      <select className="form-select" name="mode" value={feesForm.mode} onChange={handleFeesFormChange} required>
                        <option value="">Select Mode</option>
                        <option value="Cash">Cash</option>
                        <option value="UPI">UPI</option>
                        <option value="Cheque">Cheque</option>
                        <option value="Card">Card</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                    <div className="mb-2">
                      <label className="form-label">Date</label>
                      <input className="form-control" name="date" type="date" value={feesForm.date} onChange={handleFeesFormChange} required />
                    </div>
                    <div className="mb-2">
                      <label className="form-label">Note</label>
                      <input className="form-control" name="note" value={feesForm.note} onChange={handleFeesFormChange} />
                    </div>
                  </div>
                  <div className="modal-footer">
                    <button type="button" className="btn btn-secondary" onClick={() => setFeesModal({ show: false, student: null })}>Cancel</button>
                    <button type="submit" className="btn btn-success">Save Payment</button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Fees History Modal */}
        {historyModal.show && (
          <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
            <div className="modal-dialog">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">Fees History for {historyModal.student.name}</h5>
                  <button type="button" className="btn-close" onClick={closeHistoryModal}></button>
                </div>
                <div className="modal-body">
                  <table className="table table-bordered table-sm">
                    <thead>
                      <tr>
                        <th>Date</th>
                        <th>Amount</th>
                        <th>Mode</th>
                        <th>Note</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {historyModal.history.map((h, i) => (
                        <tr key={i}>
                          <td>{h.date}</td>
                          <td>{h.amount}</td>
                          <td>{h.mode}</td>
                          <td>{h.note}</td>
                          <td>
                            <button className="btn btn-danger btn-sm" onClick={() => handleDeletePayment(h.id, historyModal.student.id)}>Delete</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={closeHistoryModal}>Close</button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default StudentRecords; 