import { useEffect, useState } from "react";

function BatchManager() {
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState("");
  const [batches, setBatches] = useState([]);
  const [newBatch, setNewBatch] = useState("");

  // Fetch courses on mount
  useEffect(() => {
    fetch("http://localhost:5000/api/courses")
      .then((res) => res.json())
      .then((data) => {
        setCourses(data);
        if (data.length > 0) setSelectedCourse(data[0].id);
      });
  }, []);

  // Fetch batches when selectedCourse changes
  useEffect(() => {
    if (!selectedCourse) return;
    fetch(`http://localhost:5000/api/batches?course_id=${selectedCourse}`)
      .then((res) => res.json())
      .then(setBatches);
  }, [selectedCourse]);

  // Add a new batch
  const addBatch = async (e) => {
    e.preventDefault();
    if (!newBatch.trim() || !selectedCourse) return;
    const res = await fetch("http://localhost:5000/api/batches", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newBatch, course_id: selectedCourse }),
    });
    if (res.ok) {
      const batch = await res.json();
      setBatches([...batches, batch]);
      setNewBatch("");
    } else {
      alert("Error adding batch.");
    }
  };

  return (
    <div className="card shadow rounded-4 p-4">
      <div className="card-body p-0">
        <h2 className="card-title mb-4 display-6 fw-bold">Batch Management</h2>
        <form className="row g-3 mb-3" onSubmit={addBatch}>
          <div className="col-md-5">
            <select
              className="form-select form-select-lg"
              value={selectedCourse}
              onChange={(e) => setSelectedCourse(e.target.value)}
            >
              {courses.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
          <div className="col-md-5">
            <input
              className="form-control form-control-lg"
              value={newBatch}
              onChange={(e) => setNewBatch(e.target.value)}
              placeholder="New batch name (e.g. 2024-25)"
            />
          </div>
          <div className="col-md-2 d-grid">
            <button type="submit" className="btn btn-primary btn-lg">Add Batch</button>
          </div>
        </form>
        <ul className="list-group list-group-flush">
          {batches.map((b) => (
            <li key={b.id} className="list-group-item fs-5">
              {b.name}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default BatchManager; 