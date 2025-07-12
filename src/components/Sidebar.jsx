import { FaTachometerAlt, FaUserGraduate, FaChalkboardTeacher, FaUserTie, FaCog, FaTable, FaArrowUp, FaBook } from 'react-icons/fa';

const navItems = [
  { key: 'dashboard', label: 'Dashboard', icon: <FaTachometerAlt /> },
  { key: 'admission', label: 'Student Admission', icon: <FaUserGraduate /> },
  { key: 'records', label: 'Student Records', icon: <FaTable /> },
  { key: 'exam', label: 'Exam Form', icon: <FaTable /> },
  { key: 'promotion', label: 'Promotion', icon: <FaArrowUp /> },
  { key: 'courses', label: 'Course & Batch Mgmt', icon: <FaBook /> },
  { key: 'teachers', label: 'Teachers', icon: <FaChalkboardTeacher /> },
  { key: 'settings', label: 'Settings', icon: <FaCog /> },
];

function Sidebar({ current, setCurrent }) {
  return (
    <div className="d-flex flex-column flex-shrink-0 p-3 text-bg-dark" style={{ width: 240, minHeight: '100vh', position: 'fixed', left: 0, top: 0, zIndex: 1040 }}>
      <a href="#" className="d-flex align-items-center mb-3 mb-md-0 me-md-auto text-white text-decoration-none">
        <span className="fs-4 fw-bold">SMS Dashboard</span>
      </a>
      <hr />
      <ul className="nav nav-pills flex-column mb-auto">
        {navItems.map((item) => (
          <li className="nav-item" key={item.key}>
            <button
              className={`nav-link text-start w-100 d-flex align-items-center${current === item.key ? ' active' : ''}`}
              style={{ background: 'none', border: 'none', color: 'inherit', fontSize: '1.1rem' }}
              onClick={() => setCurrent(item.key)}
            >
              <span className="me-2" style={{ fontSize: '1.3em' }}>{item.icon}</span>
              {item.label}
            </button>
          </li>
        ))}
      </ul>
      <hr />
      <div className="text-white-50 small">&copy; 2024 College SMS</div>
    </div>
  );
}

export default Sidebar; 