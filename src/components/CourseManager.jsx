import { useEffect, useState } from "react";

function CourseManager() {
  const [courses, setCourses] = useState([]);
  const [newCourse, setNewCourse] = useState("");

  // Fetch courses from Flask backend
  useEffect(() => {
    fetch("http://localhost:5000/api/courses")
      .then((res) => res.json())
      .then(setCourses)
      .catch(console.error);
  }, []);

  // Add a new course
  const addCourse = async (e) => {
    e.preventDefault();
    if (!newCourse.trim()) return;
    const res = await fetch("http://localhost:5000/api/courses", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newCourse }),
    });
    if (res.ok) {
      const course = await res.json();
      setCourses([...courses, course]);
      setNewCourse("");
    } else {
      alert("Course already exists or error occurred.");
    }
  };

  return (
    <div className="card shadow rounded-4 p-4">
      <div className="card-body p-0">
        <h2 className="card-title mb-4 display-6 fw-bold">Course Management</h2>
        <form className="row g-3 mb-3" onSubmit={addCourse}>
          <div className="col-md-8">
            <input
              className="form-control form-control-lg"
              value={newCourse}
              onChange={(e) => setNewCourse(e.target.value)}
              placeholder="New course name"
            />
          </div>
          <div className="col-md-4 d-grid">
            <button type="submit" className="btn btn-primary btn-lg">Add Course</button>
          </div>
        </form>
        <ul className="list-group list-group-flush">
          {courses.map((c) => (
            <li key={c.id} className="list-group-item fs-5">
              {c.name}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default CourseManager; 