import { useState, useEffect, useRef } from "react";
import { useSelector, useDispatch } from 'react-redux';
import { fetchCourses, addCourse } from '../slices/coursesSlice';
import { fetchAllBatches, addBatch } from '../slices/batchesSlice';
import { addStudent } from '../slices/studentsSlice';
import { Button, Card, CardContent, Typography, Box, Grid, Alert } from '@mui/material';

function StudentAdmission() {
  const dispatch = useDispatch();
  const { items: courses, status: coursesStatus } = useSelector(state => state.courses);
  const { items: batches, status: batchesStatus } = useSelector(state => state.batches);

  // Local state for forms
  const [newCourse, setNewCourse] = useState("");
  const [newBatch, setNewBatch] = useState("");
  const [selectedCourse, setSelectedCourse] = useState("");
  const [selectedBatch, setSelectedBatch] = useState("");
  const [message, setMessage] = useState("");
  const [bulkStatus, setBulkStatus] = useState("");
  const [bulkResult, setBulkResult] = useState(null);
  const fileInputRef = useRef();

  // CSV Template columns
  const csvHeaders = [
    'name', 'father_name', 'dob', 'mobile', 'email', 'gender', 'admission_date', 'year', 'semester', 'course_name', 'batch_name', 'fees_total'
  ];

  // Student form state
  const [form, setForm] = useState({
    name: "",
    father_name: "",
    dob: "",
    mobile: "",
    email: "",
    gender: "",
    admission_date: "",
    year: "",
    semester: "",
    course_id: "",
    batch_id: "",
    fees_total: "",
  });

  // Initial payment state
  const [initPayment, setInitPayment] = useState({
    amount: "",
    mode: "",
    date: "",
    note: "",
  });

  // Fetch courses and batches on mount
  useEffect(() => {
    if (coursesStatus === 'idle') {
      dispatch(fetchCourses());
    }
    if (batchesStatus === 'idle') {
      dispatch(fetchAllBatches());
    }
  }, [dispatch, coursesStatus, batchesStatus]);

  // Get batches for selected course
  const courseBatches = selectedCourse ? batches.filter(b => b.course_id === parseInt(selectedCourse)) : [];

  // Add course
  const handleAddCourse = async (e) => {
    e.preventDefault();
    if (!newCourse.trim()) return;
    
    try {
      await dispatch(addCourse(newCourse)).unwrap();
      setNewCourse("");
      setMessage("Course added successfully!");
    } catch (error) {
      setMessage("Error: " + error.message);
    }
  };

  // Add batch
  const handleAddBatch = async (e) => {
    e.preventDefault();
    if (!newBatch.trim() || !selectedCourse) return;
    
    try {
      await dispatch(addBatch({ name: newBatch, course_id: selectedCourse })).unwrap();
      setNewBatch("");
      setMessage("Batch added successfully!");
      // Refresh all batches to update the list
      dispatch(fetchAllBatches());
    } catch (error) {
      setMessage("Error: " + error.message);
    }
  };

  // Download CSV template
  const handleDownloadTemplate = () => {
    const csvContent = csvHeaders.join(",") + "\n";
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "student_bulk_template.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Handle file select and upload
  const handleBulkFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setBulkStatus("Uploading...");
    setBulkResult(null);
    const formData = new FormData();
    formData.append('file', file);
    try {
      const res = await fetch('http://localhost:5000/api/students/bulk_upload', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (data.success) {
        setBulkStatus(`Upload complete: ${data.success_count} added, ${data.error_count} errors.`);
        setBulkResult(data);
      } else {
        setBulkStatus(data.error || 'Upload failed.');
        setBulkResult(null);
      }
    } catch (err) {
      setBulkStatus('Upload failed: ' + err.message);
      setBulkResult(null);
    }
  };

  // Student form handlers
  const handleFormChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleInitPaymentChange = (e) => {
    setInitPayment({ ...initPayment, [e.target.name]: e.target.value });
  };

  const handleCourseChange = (e) => {
    const courseId = e.target.value;
    setSelectedCourse(courseId);
    setForm({ ...form, course_id: courseId, batch_id: "" });
    setSelectedBatch("");
  };

  const handleBatchChange = (e) => {
    const batchId = e.target.value;
    setSelectedBatch(batchId);
    setForm({ ...form, batch_id: batchId });
  };

  const handleStudentSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    
    try {
      // Add student with fees_total
      const studentRes = await dispatch(addStudent(form)).unwrap();
      let msg = "Student admitted successfully!";
      // Add initial payment if provided
      if (initPayment.amount && initPayment.mode && initPayment.date) {
        await fetch(`http://localhost:5000/api/students/${studentRes.id}/add_fees_payment`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(initPayment),
        });
        msg += " Initial payment recorded.";
      }
      setMessage(msg);
      setForm({
        name: "",
        father_name: "",
        dob: "",
        mobile: "",
        email: "",
        gender: "",
        admission_date: "",
        year: "",
        semester: "",
        course_id: selectedCourse,
        batch_id: selectedBatch,
        fees_total: "",
      });
      setInitPayment({ amount: "", mode: "", date: "", note: "" });
    } catch (error) {
      setMessage("Error: " + error.message);
    }
  };

  return (
    <div>
      {/* Add Course & Batch */}
      <div className="row g-3 mb-4">
        <div className="col-md-4">
          <form className="d-flex" onSubmit={handleAddCourse}>
            <input 
              className="form-control me-2" 
              placeholder="Add new course" 
              value={newCourse} 
              onChange={e => setNewCourse(e.target.value)} 
            />
            <button className="btn btn-primary" type="submit">Add Course</button>
          </form>
        </div>
        <div className="col-md-6">
          <form className="d-flex" onSubmit={handleAddBatch}>
            <select 
              className="form-select me-2" 
              value={selectedCourse} 
              onChange={e => setSelectedCourse(e.target.value)}
            >
              <option value="">Select Course</option>
              {courses.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
            <input 
              className="form-control me-2" 
              placeholder="Add new batch" 
              value={newBatch} 
              onChange={e => setNewBatch(e.target.value)} 
            />
            <button className="btn btn-primary" type="submit">Add Batch</button>
          </form>
        </div>
      </div>

      {/* Student Admission Form */}
      <div className="card shadow rounded-4 p-4 mb-4">
        <div className="card-body p-0">
          <h2 className="card-title mb-4 display-6 fw-bold">Student Admission</h2>
          {message && <div className="alert alert-success mt-2 mb-3">{message}</div>}
          <form className="row g-3" onSubmit={handleStudentSubmit}>
            <div className="col-md-6">
              <label className="form-label">Course</label>
              <select 
                className="form-select" 
                name="course_id" 
                value={form.course_id} 
                onChange={handleCourseChange} 
                required
              >
                <option value="">Select Course</option>
                {courses.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
            <div className="col-md-6">
              <label className="form-label">Batch</label>
              <select 
                className="form-select" 
                name="batch_id" 
                value={form.batch_id} 
                onChange={handleBatchChange} 
                required
                disabled={!form.course_id}
              >
                <option value="">Select Batch</option>
                {courseBatches.map((b) => (
                  <option key={b.id} value={b.id}>{b.name}</option>
                ))}
              </select>
            </div>
            <div className="col-md-6">
              <label className="form-label">Name</label>
              <input 
                className="form-control" 
                name="name" 
                value={form.name} 
                onChange={handleFormChange} 
                required 
              />
            </div>
            <div className="col-md-6">
              <label className="form-label">Father Name</label>
              <input
                className="form-control"
                name="father_name"
                value={form.father_name}
                onChange={handleFormChange}
                required
              />
            </div>
            <div className="col-md-6">
              <label className="form-label">Date of Birth</label>
              <input 
                type="date" 
                className="form-control" 
                name="dob" 
                value={form.dob} 
                onChange={handleFormChange} 
                required 
              />
            </div>
            <div className="col-md-6">
              <label className="form-label">Mobile</label>
              <input 
                className="form-control" 
                name="mobile" 
                value={form.mobile} 
                onChange={handleFormChange} 
                required 
              />
            </div>
            <div className="col-md-6">
              <label className="form-label">Email</label>
              <input 
                type="email" 
                className="form-control" 
                name="email" 
                value={form.email} 
                onChange={handleFormChange} 
                required 
              />
            </div>
            <div className="col-md-6">
              <label className="form-label">Gender</label>
              <select 
                className="form-select" 
                name="gender" 
                value={form.gender} 
                onChange={handleFormChange} 
                required
              >
                <option value="">Select</option>
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
                value={form.admission_date} 
                onChange={handleFormChange} 
                required 
              />
            </div>
            <div className="col-md-6">
              <label className="form-label">Year</label>
              <select 
                className="form-select" 
                name="year" 
                value={form.year} 
                onChange={handleFormChange} 
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
                value={form.semester} 
                onChange={handleFormChange} 
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
            <div className="col-md-4">
              <label className="form-label">Per Year Fees (₹)</label>
              <input
                className="form-control"
                name="fees_total"
                type="number"
                min="0"
                value={form.fees_total}
                onChange={handleFormChange}
                required
              />
            </div>
            <div className="col-12">
              <h6>Initial Payment (optional)</h6>
            </div>
            <div className="col-md-3">
              <label className="form-label">Amount Paid (₹)</label>
              <input
                className="form-control"
                name="amount"
                type="number"
                min="0"
                value={initPayment.amount}
                onChange={handleInitPaymentChange}
              />
            </div>
            <div className="col-md-3">
              <label className="form-label">Payment Mode</label>
              <select
                className="form-select"
                name="mode"
                value={initPayment.mode}
                onChange={handleInitPaymentChange}
              >
                <option value="">Select Mode</option>
                <option value="Cash">Cash</option>
                <option value="UPI">UPI</option>
                <option value="Cheque">Cheque</option>
                <option value="Card">Card</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div className="col-md-3">
              <label className="form-label">Payment Date</label>
              <input
                className="form-control"
                name="date"
                type="date"
                value={initPayment.date}
                onChange={handleInitPaymentChange}
              />
            </div>
            <div className="col-md-3">
              <label className="form-label">Note</label>
              <input
                className="form-control"
                name="note"
                value={initPayment.note}
                onChange={handleInitPaymentChange}
              />
            </div>
            <div className="col-12">
              <button className="btn btn-success btn-lg" type="submit">
                Admit Student
              </button>
            </div>
          </form>
        </div>
      </div>
      <Box mt={4}>
        <Card sx={{ background: '#232323', color: '#fff', borderRadius: 3, boxShadow: 3, mb: 4 }}>
          <CardContent>
            <Typography variant="h5" fontWeight={700} mb={2} color="#fff">Bulk Upload Students</Typography>
            <Typography variant="body2" mb={2} color="#fff">
              Download the CSV template, fill student data, and upload to add multiple students at once.
            </Typography>
            <Grid container spacing={2} alignItems="center">
              <Grid item>
                <Button variant="contained" color="secondary" onClick={handleDownloadTemplate} sx={{ borderRadius: 2, fontWeight: 700 }}>
                  Download Template
                </Button>
              </Grid>
              <Grid item>
                <Button variant="contained" component="label" color="primary" sx={{ borderRadius: 2, fontWeight: 700 }}>
                  Upload CSV
                  <input type="file" accept=".csv" hidden ref={fileInputRef} onChange={handleBulkFileChange} />
                </Button>
              </Grid>
              {bulkStatus && (
                <Grid item xs={12} mt={2}>
                  <Alert severity="info">{bulkStatus}</Alert>
                </Grid>
              )}
            </Grid>
            {bulkResult && (
              <Box mt={3}>
                <Typography variant="subtitle1" color="#fff" fontWeight={600} mb={1}>Upload Summary</Typography>
                <Typography variant="body2" color="#fff" mb={1}>
                  Total: {bulkResult.total} &nbsp; | &nbsp; Success: {bulkResult.success_count} &nbsp; | &nbsp; Errors: {bulkResult.error_count}
                </Typography>
                {bulkResult.details && bulkResult.details.length > 0 && (
                  <Box sx={{ maxHeight: 200, overflowY: 'auto', background: '#181818', borderRadius: 2, p: 2, mt: 1 }}>
                    {bulkResult.details.map((row, idx) => (
                      <Typography key={idx} variant="body2" color={row.status === 'success' ? 'success.main' : 'error.main'}>
                        Row {row.row}: {row.status === 'success' ? 'Added' : `Error - ${row.error}`}
                      </Typography>
                    ))}
                  </Box>
                )}
              </Box>
            )}
          </CardContent>
        </Card>
      </Box>
    </div>
  );
}

export default StudentAdmission; 