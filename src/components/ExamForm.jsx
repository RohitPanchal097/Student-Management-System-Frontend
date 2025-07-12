import { useState, useEffect } from "react";
import { useSelector, useDispatch } from 'react-redux';
import { fetchCourses } from '../slices/coursesSlice';
import { fetchAllBatches } from '../slices/batchesSlice';
import { fetchStudents } from '../slices/studentsSlice';

function ExamForm() {
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
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [message, setMessage] = useState("");
  const [examForms, setExamForms] = useState([]);
  const [examFormUploadStatus, setExamFormUploadStatus] = useState("");
  const [examFormFile, setExamFormFile] = useState(null);
  const [examFormUploadedFiles, setExamFormUploadedFiles] = useState([]);

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

  // Update filtered students when data changes
  useEffect(() => {
    setFilteredStudents(students);
  }, [students]);

  // Filter/search students
  const handleFindStudents = (e) => {
    e && e.preventDefault();
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
    setFilteredStudents(result);
  };

  // Reset to all students if all filters are cleared
  useEffect(() => {
    if (!filterCourse && !filterBatch && !filterYear && !filterSemester && !searchName) {
      setFilteredStudents(students);
    }
  }, [filterCourse, filterBatch, filterYear, filterSemester, searchName, students]);

  // Fetch exam forms for selected student
  useEffect(() => {
    if (!selectedStudent) {
      setExamForms([]);
      return;
    }
    fetch(`http://localhost:5000/api/exam_forms?student_id=${selectedStudent.id}`)
      .then((res) => res.json())
      .then(setExamForms);
  }, [selectedStudent]);

  // Check for uploaded exam form when student is selected
  useEffect(() => {
    if (!selectedStudent) {
      setExamFormUploadedFiles([]);
      return;
    }
    fetch(`http://localhost:5000/api/students/${selectedStudent.id}/exam_form_status`)
      .then(res => res.json())
      .then(data => {
        setExamFormUploadedFiles(data.filenames || []);
      });
  }, [selectedStudent]);

  // Exam form upload logic (now on submit)
  const handleExamFormFileChange = (e) => {
    setExamFormFile(e.target.files[0] || null);
  };

  const handleExamFormSubmit = async (e) => {
    e.preventDefault();
    if (!examFormFile || !selectedStudent) {
      setExamFormUploadStatus('Please select a file and student.');
      return;
    }
    const formData = new FormData();
    formData.append('file', examFormFile);
    setExamFormUploadStatus('Uploading...');
    try {
      const res = await fetch(`http://localhost:5000/api/students/${selectedStudent.id}/upload_exam_form`, {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (data.success) {
        setExamFormUploadStatus(`Uploaded: ${data.filename}`);
        setExamFormFile(null);
        setExamFormUploadedFiles([data.filename]);
        setTimeout(() => {
          setExamFormUploadStatus("");
          setSelectedStudent(null);
          setFilterCourse("");
          setFilterBatch("");
          setFilterYear("");
          setFilterSemester("");
          setSearchName("");
        }, 1200);
      } else {
        setExamFormUploadStatus('Error uploading file');
      }
    } catch {
      setExamFormUploadStatus('Error uploading file');
    }
  };

  return (
    <div className="card shadow rounded-4 p-4 mb-4">
      <div className="card-body p-0">
        <h2 className="mb-4 display-6 fw-bold">Exam Form</h2>
        {message && <div className="alert alert-success mt-2 mb-3">{message}</div>}
        
        {/* Student selection */}
        <form className="row g-3 align-items-end mb-3" onSubmit={handleFindStudents}>
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
            <button className="btn btn-info" type="submit">Find / Search</button>
          </div>
        </form>

        {/* Student selection table */}
        <div className="table-responsive mb-4">
          <table className="table table-bordered table-hover align-middle">
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
                <th>Select</th>
              </tr>
            </thead>
            <tbody>
              {filteredStudents.map((s) => (
                <tr key={s.id}>
                  <td>{s.name}</td>
                  <td>{s.father_name}</td>
                  <td>{s.course}</td>
                  <td>{s.batch}</td>
                  <td>{s.year}</td>
                  <td>{s.semester}</td>
                  <td>{s.mobile}</td>
                  <td>{s.email}</td>
                  <td>
                    <button 
                      className="btn btn-sm btn-primary" 
                      onClick={() => setSelectedStudent(s)} 
                      disabled={selectedStudent && selectedStudent.id === s.id}
                    >
                      {selectedStudent && selectedStudent.id === s.id ? "Selected" : "Select"}
                    </button>
                  </td>
                </tr>
              ))}
              {filteredStudents.length === 0 && (
                <tr>
                  <td colSpan={9} className="text-center">No students found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Exam form upload for selected student */}
        {selectedStudent && (
          <form className="mb-4" onSubmit={handleExamFormSubmit}>
            <label className="form-label">Upload University Exam Form (PDF/JPG/PNG)</label>
            <div className="input-group">
              <input
                className="form-control"
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={handleExamFormFileChange}
              />
              <button className="btn btn-success" type="submit" disabled={!examFormFile}>Submit</button>
            </div>
            {examFormUploadedFiles.length > 0 && (
              <div className="mt-2">
                <small className="text-success">Uploaded: {examFormUploadedFiles.join(', ')}</small>
              </div>
            )}
            {examFormUploadStatus && (
              <small className="text-success ms-2">{examFormUploadStatus}</small>
            )}
          </form>
        )}
      </div>
    </div>
  );
}

export default ExamForm; 