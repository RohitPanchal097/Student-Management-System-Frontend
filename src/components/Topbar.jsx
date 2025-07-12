import { FaBell, FaUserCircle } from 'react-icons/fa';

function Topbar() {
  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark border-bottom" style={{ minHeight: 64 }}>
      <div className="container-fluid">
        <form className="d-flex flex-grow-1 me-3">
          <input
            className="form-control me-2 bg-dark text-white border-secondary"
            type="search"
            placeholder="Search Students, Staff, Events..."
            aria-label="Search"
            style={{ minWidth: 300 }}
          />
        </form>
        <div className="d-flex align-items-center gap-3">
          <button className="btn btn-link text-white position-relative">
            <FaBell size={22} />
            <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger" style={{ fontSize: 10 }}>
              3
            </span>
          </button>
          <div className="d-flex align-items-center">
            <FaUserCircle size={32} className="me-2" />
            <span className="fw-bold">Admin</span>
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Topbar; 