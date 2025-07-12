import { FaUserGraduate, FaChalkboardTeacher, FaUsers, FaUserTie, FaCalendarAlt } from 'react-icons/fa';
import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { fetchCourses } from '../slices/coursesSlice';
import { fetchStudents } from '../slices/studentsSlice';

const events = [
  { date: 'Tue, 6 Feb', title: 'School President Elections', time: '11:00 AM - 12:30 PM', tag: 'Today' },
  { date: 'Fri, 9 Feb', title: 'Special Guest Lecture', time: '11:00 AM - 12:30 PM', tag: 'In 3 days' },
  { date: 'Fri, 9 Feb', title: 'Webinar on Career Trends for Class 11', time: '01:00 PM - 02:30 PM', tag: 'In 3 days' },
];

const tabData = {
  Admissions: [95, 88, 70, 82, 98],
  Fees: [80, 90, 85, 75, 95],
  Results: [92, 85, 78, 88, 96],
};

const tabLabels = Object.keys(tabData);
const classLabels = ['Class A', 'Class B', 'Class C', 'Class D', 'Class E'];

function Dashboard() {
  const dispatch = useDispatch();
  const { items: courses, status: coursesStatus } = useSelector(state => state.courses);
  const { items: students, status: studentsStatus } = useSelector(state => state.students);
  const { items: batches } = useSelector(state => state.batches);
  const [tab, setTab] = useState('Results');

  // Fetch data on component mount
  useEffect(() => {
    if (coursesStatus === 'idle') {
      dispatch(fetchCourses());
    }
    if (studentsStatus === 'idle') {
      dispatch(fetchStudents());
    }
  }, [dispatch, coursesStatus, studentsStatus]);

  // Calculate real statistics
  const stats = [
    { 
      label: 'Students', 
      value: students.length, 
      icon: <FaUserGraduate size={28} />, 
      color: 'primary' 
    },
    { 
      label: 'Courses', 
      value: courses.length, 
      icon: <FaChalkboardTeacher size={28} />, 
      color: 'success' 
    },
    { 
      label: 'Batches', 
      value: batches.length, 
      icon: <FaUsers size={28} />, 
      color: 'info' 
    },
    { 
      label: 'Active', 
      value: students.filter(s => s.status !== 'inactive').length, 
      icon: <FaUserTie size={28} />, 
      color: 'warning' 
    },
  ];

  const loading = coursesStatus === 'loading' || studentsStatus === 'loading';

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '400px' }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Stat cards */}
      <div className="row g-4 mb-4">
        {stats.map((s) => (
          <div className="col-md-3" key={s.label}>
            <div className={`card text-bg-${s.color} shadow h-100`}>
              <div className="card-body d-flex align-items-center gap-3">
                <div className="display-5">{s.icon}</div>
                <div>
                  <div className="fs-4 fw-bold">{s.value}</div>
                  <div className="small text-uppercase">{s.label}</div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Course and Batch Summary */}
      <div className="row g-4 mb-4">
        <div className="col-md-6">
          <div className="card shadow h-100">
            <div className="card-header bg-dark border-bottom-0">
              <h5 className="mb-0">Courses Overview</h5>
            </div>
            <div className="card-body bg-dark">
              {courses.length > 0 ? (
                <div className="list-group list-group-flush bg-transparent">
                  {courses.map((course) => {
                    const courseBatches = batches.filter(b => b.course_id === course.id);
                    const courseStudents = students.filter(s => s.course_id === course.id);
                    return (
                      <div key={course.id} className="list-group-item bg-transparent border-secondary d-flex justify-content-between align-items-center">
                        <div>
                          <div className="fw-bold text-white">{course.name}</div>
                          <div className="small text-secondary">{courseBatches.length} batches</div>
                        </div>
                        <span className="badge bg-primary rounded-pill">{courseStudents.length} students</span>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center text-secondary">
                  <p>No courses added yet</p>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="col-md-6">
          <div className="card shadow h-100">
            <div className="card-header bg-dark border-bottom-0">
              <h5 className="mb-0">Recent Students</h5>
            </div>
            <div className="card-body bg-dark">
              {students.length > 0 ? (
                <div className="list-group list-group-flush bg-transparent">
                  {students.slice(0, 5).map((student) => (
                    <div key={student.id} className="list-group-item bg-transparent border-secondary d-flex justify-content-between align-items-center">
                      <div>
                        <div className="fw-bold text-white">{student.name}</div>
                        <div className="small text-secondary">{student.course} - {student.batch}</div>
                      </div>
                      <span className="badge bg-success rounded-pill">{student.year}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center text-secondary">
                  <p>No students added yet</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Tabs and chart */}
      <div className="card mb-4 shadow">
        <div className="card-header bg-dark border-bottom-0">
          <ul className="nav nav-tabs card-header-tabs">
            {tabLabels.map((t) => (
              <li className="nav-item" key={t}>
                <button className={`nav-link${tab === t ? ' active' : ''}`} onClick={() => setTab(t)}>{t}</button>
              </li>
            ))}
          </ul>
        </div>
        <div className="card-body bg-dark">
          <h5 className="card-title mb-4">Students Performance</h5>
          {/* Simple bar chart using Bootstrap progress bars */}
          <div className="row align-items-end" style={{ minHeight: 180 }}>
            {tabData[tab].map((val, i) => (
              <div className="col text-center" key={i}>
                <div className="mb-2" style={{ height: 120, display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}>
                  <div style={{ width: 32 }}>
                    <div className="bg-primary rounded-top" style={{ height: `${val}px`, minHeight: 10, transition: 'height 0.3s' }}></div>
                  </div>
                </div>
                <div className="fw-bold text-white">{val}%</div>
                <div className="small text-secondary">{classLabels[i]}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Upcoming Events */}
      <div className="card shadow mb-4">
        <div className="card-header bg-dark border-bottom-0">
          <FaCalendarAlt className="me-2" /> Upcoming Events
        </div>
        <div className="card-body bg-dark">
          {events.map((e, i) => (
            <div key={i} className="d-flex align-items-center mb-3">
              <div className="me-3 text-center" style={{ minWidth: 70 }}>
                <div className="fw-bold text-white-50">{e.date}</div>
              </div>
              <div className="flex-grow-1">
                <div className="fw-bold text-white">{e.title}</div>
                <div className="small text-secondary">{e.time}</div>
              </div>
              <span className="badge bg-info ms-2">{e.tag}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Dashboard; 