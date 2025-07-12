import { useState, useEffect } from "react";
import { useSelector, useDispatch } from 'react-redux';
import { fetchCourses } from '../slices/coursesSlice';
import { fetchAllBatches } from '../slices/batchesSlice';
import { fetchStudents } from '../slices/studentsSlice';

function PromotionManager() {
  const dispatch = useDispatch();
  const { items: courses, status: coursesStatus } = useSelector(state => state.courses);
  const { items: batches, status: batchesStatus } = useSelector(state => state.batches);

  // Local state for form
  const [selectedCourse, setSelectedCourse] = useState("");
  const [selectedBatch, setSelectedBatch] = useState("");
  const [selectedToBatch, setSelectedToBatch] = useState("");
  const [currentYear, setCurrentYear] = useState("");
  const [nextYear, setNextYear] = useState("");
  const [currentSemester, setCurrentSemester] = useState("");
  const [nextSemester, setNextSemester] = useState("");
  const [message, setMessage] = useState("");
  const [passoutBatch, setPassoutBatch] = useState("");
  const [passoutYear, setPassoutYear] = useState("");
  const [passoutSemester, setPassoutSemester] = useState("");

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

  // Promote batch
  const handlePromote = async (e) => {
    e.preventDefault();
    setMessage("");
    if (!selectedBatch || !selectedToBatch || !currentYear || !nextYear || !currentSemester || !nextSemester) {
      setMessage("Please fill all fields.");
      return;
    }
    const res = await fetch("http://localhost:5000/api/promote_batch", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        from_batch_id: selectedBatch,
        from_year: currentYear,
        from_semester: currentSemester,
        to_batch_id: selectedToBatch,
        to_year: nextYear,
        to_semester: nextSemester,
      }),
    });
    if (res.ok) {
      const data = await res.json();
      setMessage(`Promoted ${data.promoted || data.success ? data.promoted : 0} students to ${nextYear} (${nextSemester})`);
      dispatch(fetchStudents());
    } else {
      setMessage("Error promoting batch.");
    }
  };

  // Passout students
  const handlePassout = async (e) => {
    e.preventDefault();
    setMessage("");
    if (!passoutBatch || !passoutYear || !passoutSemester) {
      setMessage("Please fill all passout fields.");
      return;
    }
    if (!window.confirm("Are you sure you want to delete all students in this batch/year/semester as passout? This cannot be undone.")) return;
    const res = await fetch("http://localhost:5000/api/passout_students", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        batch_id: passoutBatch,
        year: passoutYear,
        semester: passoutSemester,
      }),
    });
    if (res.ok) {
      const data = await res.json();
      setMessage(`Deleted ${data.deleted || 0} passout students.`);
      dispatch(fetchStudents());
    } else {
      setMessage("Error deleting passout students.");
    }
  };

  // Promote all students (bulk auto-promotion)
  const handlePromoteAllWithFilters = async () => {
    if (!window.confirm("Are you sure you want to promote all eligible students and passout final year students? This cannot be undone.")) return;
    setMessage("");
    const res = await fetch("http://localhost:5000/api/promote_all", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        course_id: selectedCourse,
        batch_id: selectedBatch,
        to_batch_id: selectedToBatch,
        current_year: currentYear,
        current_semester: currentSemester,
        next_year: nextYear,
        next_semester: nextSemester,
      }),
    });
    if (res.ok) {
      const data = await res.json();
      setMessage(`Promoted ${data.promoted || 0} students, passout (deleted) ${data.passout || 0} students.`);
      dispatch(fetchStudents());
    } else {
      setMessage("Error in bulk promotion.");
    }
  };

  return (
    <div className="card shadow rounded-4 p-4 mb-4">
      <div className="card-body p-0">
        <h2 className="mb-4 display-6 fw-bold">Batch Promotion</h2>
        
        <form className="row g-3 align-items-end" onSubmit={e => e.preventDefault()}>
          <div className="col-md-3">
            <label className="form-label">Course</label>
            <select 
              className="form-select" 
              value={selectedCourse} 
              onChange={e => {
                setSelectedCourse(e.target.value);
                setSelectedBatch("");
              }} 
              required
            >
              <option value="">Select Course</option>
              {courses.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
          <div className="col-md-3">
            <label className="form-label">Batch</label>
            <select 
              className="form-select" 
              value={selectedBatch} 
              onChange={e => setSelectedBatch(e.target.value)} 
              required
              disabled={!selectedCourse}
            >
              <option value="">Select Batch</option>
              {courseBatches.map((b) => (
                <option key={b.id} value={b.id}>{b.name}</option>
              ))}
            </select>
          </div>
          <div className="col-md-3">
            <label className="form-label">To Batch</label>
            <select
              className="form-select"
              value={selectedToBatch}
              onChange={e => setSelectedToBatch(e.target.value)}
              required
              disabled={!selectedCourse}
            >
              <option value="">Select To Batch</option>
              {batches.filter(b => b.course_id === parseInt(selectedCourse)).map((b) => (
                <option key={b.id} value={b.id}>{b.name}</option>
              ))}
            </select>
          </div>
          <div className="col-md-3">
            <label className="form-label">Current Year</label>
            <select 
              className="form-select" 
              value={currentYear} 
              onChange={e => setCurrentYear(e.target.value)} 
              required
            >
              <option value="">Select Year</option>
              <option value="1st Year">1st Year</option>
              <option value="2nd Year">2nd Year</option>
              <option value="3rd Year">3rd Year</option>
              <option value="4th Year">4th Year</option>
            </select>
          </div>
          <div className="col-md-3">
            <label className="form-label">Next Year</label>
            <select 
              className="form-select" 
              value={nextYear} 
              onChange={e => setNextYear(e.target.value)} 
              required
            >
              <option value="">Select Year</option>
              <option value="1st Year">1st Year</option>
              <option value="2nd Year">2nd Year</option>
              <option value="3rd Year">3rd Year</option>
              <option value="4th Year">4th Year</option>
            </select>
          </div>
          <div className="col-md-3">
            <label className="form-label">Current Semester</label>
            <select 
              className="form-select" 
              value={currentSemester} 
              onChange={e => setCurrentSemester(e.target.value)} 
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
          <div className="col-md-3">
            <label className="form-label">Next Semester</label>
            <select 
              className="form-select" 
              value={nextSemester} 
              onChange={e => setNextSemester(e.target.value)} 
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
          <div className="col-12">
            <button
              className="btn btn-warning btn-lg"
              type="button"
              onClick={() => {
                // Call promote all with filters
                if (!selectedCourse || !selectedBatch || !selectedToBatch || !currentYear || !nextYear || !currentSemester || !nextSemester) {
                  setMessage("Please fill all fields.");
                  return;
                }
                handlePromoteAllWithFilters();
              }}
              disabled={!(selectedCourse && selectedBatch && selectedToBatch && currentYear && nextYear && currentSemester && nextSemester)}
            >
              Promote All
            </button>
          </div>
        </form>
        {message && <div className="alert alert-success mt-2 mb-3">{message}</div>}
        
        <hr className="my-4" />
        <h4 className="mb-3">Passout Students (Delete Final Year)</h4>
        <form className="row g-3 align-items-end" onSubmit={handlePassout}>
          <div className="col-md-4">
            <label className="form-label">Batch</label>
            <select
              className="form-select"
              value={passoutBatch}
              onChange={e => setPassoutBatch(e.target.value)}
              required
            >
              <option value="">Select Batch</option>
              {batches.map((b) => (
                <option key={b.id} value={b.id}>{b.name}</option>
              ))}
            </select>
          </div>
          <div className="col-md-4">
            <label className="form-label">Year</label>
            <select
              className="form-select"
              value={passoutYear}
              onChange={e => setPassoutYear(e.target.value)}
              required
            >
              <option value="">Select Year</option>
              <option value="1st Year">1st Year</option>
              <option value="2nd Year">2nd Year</option>
              <option value="3rd Year">3rd Year</option>
              <option value="4th Year">4th Year</option>
            </select>
          </div>
          <div className="col-md-4">
            <label className="form-label">Semester</label>
            <select
              className="form-select"
              value={passoutSemester}
              onChange={e => setPassoutSemester(e.target.value)}
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
          <div className="col-12">
            <button className="btn btn-danger btn-lg" type="submit">Passout (Delete Students)</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default PromotionManager; 