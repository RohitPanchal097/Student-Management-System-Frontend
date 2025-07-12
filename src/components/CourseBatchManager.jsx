import { useState, useEffect } from "react";
import { useSelector, useDispatch } from 'react-redux';
import { fetchCourses, addCourse, updateCourse, deleteCourse } from '../slices/coursesSlice';
import { fetchAllBatches, addBatch, updateBatch, deleteBatch } from '../slices/batchesSlice';

function CourseBatchManager() {
  const dispatch = useDispatch();
  const { items: courses, status: coursesStatus } = useSelector(state => state.courses);
  const { items: batches, status: batchesStatus } = useSelector(state => state.batches);

  // Local state
  const [message, setMessage] = useState("");
  const [newCourse, setNewCourse] = useState("");
  const [newBatch, setNewBatch] = useState("");
  const [selectedCourse, setSelectedCourse] = useState("");
  const [editCourse, setEditCourse] = useState(null);
  const [editBatch, setEditBatch] = useState(null);
  const [editCourseForm, setEditCourseForm] = useState({});
  const [editBatchForm, setEditBatchForm] = useState({});
  const [showConfirm, setShowConfirm] = useState({ show: false, type: '', id: null });

  // Fetch data on mount
  useEffect(() => {
    if (coursesStatus === 'idle') {
      dispatch(fetchCourses());
    }
    if (batchesStatus === 'idle') {
      dispatch(fetchAllBatches());
    }
  }, [dispatch, coursesStatus, batchesStatus]);

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
      dispatch(fetchAllBatches());
    } catch (error) {
      setMessage("Error: " + error.message);
    }
  };

  // Edit course
  const openEditCourse = (course) => {
    setEditCourse(course);
    setEditCourseForm({ name: course.name });
  };

  const handleEditCourse = async (e) => {
    e.preventDefault();
    try {
      await dispatch(updateCourse({ id: editCourse.id, data: editCourseForm })).unwrap();
      setEditCourse(null);
      setMessage("Course updated successfully!");
    } catch (error) {
      setMessage("Error: " + error.message);
    }
  };

  // Edit batch
  const openEditBatch = (batch) => {
    setEditBatch(batch);
    setEditBatchForm({ name: batch.name, course_id: batch.course_id });
  };

  const handleEditBatch = async (e) => {
    e.preventDefault();
    try {
      await dispatch(updateBatch({ id: editBatch.id, data: editBatchForm })).unwrap();
      setEditBatch(null);
      setMessage("Batch updated successfully!");
      dispatch(fetchAllBatches());
    } catch (error) {
      setMessage("Error: " + error.message);
    }
  };

  // Delete course
  const handleDeleteCourse = async (id) => {
    setShowConfirm({ show: false, type: '', id: null });
    try {
      await dispatch(deleteCourse(id)).unwrap();
      setMessage("Course deleted successfully!");
      dispatch(fetchAllBatches()); // Refresh batches
    } catch (error) {
      setMessage("Error: " + error.message);
    }
  };

  // Delete batch
  const handleDeleteBatch = async (id) => {
    setShowConfirm({ show: false, type: '', id: null });
    try {
      await dispatch(deleteBatch(id)).unwrap();
      setMessage("Batch deleted successfully!");
    } catch (error) {
      setMessage("Error: " + error.message);
    }
  };

  return (
    <div>
      <h2 className="mb-4 display-6 fw-bold">Course & Batch Management</h2>
      {message && <div className="alert alert-success mt-2 mb-3">{message}</div>}

      {/* Add Course & Batch Forms */}
      <div className="row g-4 mb-4">
        <div className="col-md-6">
          <div className="card shadow">
            <div className="card-header">
              <h5 className="mb-0">Add New Course</h5>
            </div>
            <div className="card-body">
              <form onSubmit={handleAddCourse}>
                <div className="input-group">
                  <input 
                    type="text" 
                    className="form-control" 
                    placeholder="Course name" 
                    value={newCourse} 
                    onChange={e => setNewCourse(e.target.value)} 
                    required 
                  />
                  <button className="btn btn-primary" type="submit">Add Course</button>
                </div>
              </form>
            </div>
          </div>
        </div>

        <div className="col-md-6">
          <div className="card shadow">
            <div className="card-header">
              <h5 className="mb-0">Add New Batch</h5>
            </div>
            <div className="card-body">
              <form onSubmit={handleAddBatch}>
                <div className="row g-2">
                  <div className="col-md-6">
                    <select 
                      className="form-select" 
                      value={selectedCourse} 
                      onChange={e => setSelectedCourse(e.target.value)}
                      required
                    >
                      <option value="">Select Course</option>
                      {courses.map((c) => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="col-md-4">
                    <input 
                      type="text" 
                      className="form-control" 
                      placeholder="Batch name" 
                      value={newBatch} 
                      onChange={e => setNewBatch(e.target.value)} 
                      required 
                    />
                  </div>
                  <div className="col-md-2">
                    <button className="btn btn-primary w-100" type="submit">Add</button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* Courses and Batches Overview */}
      <div className="row g-4">
        {courses.map((course) => {
          const courseBatches = batches.filter(b => b.course_id === course.id);
          return (
            <div key={course.id} className="col-md-6">
              <div className="card shadow h-100">
                <div className="card-header d-flex justify-content-between align-items-center">
                  <h5 className="mb-0">{course.name}</h5>
                  <div className="btn-group btn-group-sm">
                    <button 
                      className="btn btn-outline-primary" 
                      onClick={() => openEditCourse(course)}
                    >
                      Edit
                    </button>
                    <button 
                      className="btn btn-outline-danger" 
                      onClick={() => setShowConfirm({ show: true, type: 'course', id: course.id })}
                    >
                      Delete
                    </button>
                  </div>
                </div>
                <div className="card-body">
                  <h6 className="text-muted mb-3">Batches ({courseBatches.length})</h6>
                  {courseBatches.length > 0 ? (
                    <div className="list-group list-group-flush">
                      {courseBatches.map((batch) => (
                        <div key={batch.id} className="list-group-item d-flex justify-content-between align-items-center">
                          <span>{batch.name}</span>
                          <div className="btn-group btn-group-sm">
                            <button 
                              className="btn btn-outline-primary btn-sm" 
                              onClick={() => openEditBatch(batch)}
                            >
                              Edit
                            </button>
                            <button 
                              className="btn btn-outline-danger btn-sm" 
                              onClick={() => setShowConfirm({ show: true, type: 'batch', id: batch.id })}
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted">No batches created yet</p>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Edit Course Modal */}
      {editCourse && (
        <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Edit Course</h5>
                <button 
                  type="button" 
                  className="btn-close" 
                  onClick={() => setEditCourse(null)}
                ></button>
              </div>
              <form onSubmit={handleEditCourse}>
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label">Course Name</label>
                    <input 
                      type="text" 
                      className="form-control" 
                      value={editCourseForm.name} 
                      onChange={e => setEditCourseForm({ name: e.target.value })} 
                      required 
                    />
                  </div>
                </div>
                <div className="modal-footer">
                  <button 
                    type="button" 
                    className="btn btn-secondary" 
                    onClick={() => setEditCourse(null)}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary">Update Course</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Edit Batch Modal */}
      {editBatch && (
        <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Edit Batch</h5>
                <button 
                  type="button" 
                  className="btn-close" 
                  onClick={() => setEditBatch(null)}
                ></button>
              </div>
              <form onSubmit={handleEditBatch}>
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label">Batch Name</label>
                    <input 
                      type="text" 
                      className="form-control" 
                      value={editBatchForm.name} 
                      onChange={e => setEditBatchForm({ ...editBatchForm, name: e.target.value })} 
                      required 
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Course</label>
                    <select 
                      className="form-select" 
                      value={editBatchForm.course_id} 
                      onChange={e => setEditBatchForm({ ...editBatchForm, course_id: e.target.value })} 
                      required
                    >
                      {courses.map((c) => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="modal-footer">
                  <button 
                    type="button" 
                    className="btn btn-secondary" 
                    onClick={() => setEditBatch(null)}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary">Update Batch</button>
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
                  onClick={() => setShowConfirm({ show: false, type: '', id: null })}
                ></button>
              </div>
              <div className="modal-body">
                Are you sure you want to delete this {showConfirm.type}?
              </div>
              <div className="modal-footer">
                <button 
                  type="button" 
                  className="btn btn-secondary" 
                  onClick={() => setShowConfirm({ show: false, type: '', id: null })}
                >
                  Cancel
                </button>
                <button 
                  type="button" 
                  className="btn btn-danger" 
                  onClick={() => {
                    if (showConfirm.type === 'course') {
                      handleDeleteCourse(showConfirm.id);
                    } else {
                      handleDeleteBatch(showConfirm.id);
                    }
                  }}
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default CourseBatchManager; 