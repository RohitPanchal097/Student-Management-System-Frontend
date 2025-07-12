function Navigation({ current, setCurrent }) {
  const items = [
    { key: "courses", label: "Courses" },
    { key: "batches", label: "Batches" },
    { key: "admission", label: "Student Admission" },
    { key: "exam", label: "Exam Form" },
    { key: "promotion", label: "Promotion" },
    { key: "search", label: "Search & Update" },
    { key: "backup", label: "Backup" },
  ];
  return (
    <nav className="navbar navbar-expand-lg navbar-light bg-white shadow-sm sticky-top w-100" style={{zIndex: 100}}>
      <div className="container-fluid">
        <span className="navbar-brand fw-bold">Student Management</span>
        <ul className="navbar-nav me-auto mb-2 mb-lg-0">
          {items.map((item) => (
            <li className="nav-item" key={item.key}>
              <button
                className={`nav-link btn btn-link${current === item.key ? " active fw-bold text-primary" : ""}`}
                style={{ cursor: "pointer" }}
                onClick={() => setCurrent(item.key)}
              >
                {item.label}
              </button>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
}

export default Navigation; 