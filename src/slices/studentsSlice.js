import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

export const fetchStudents = createAsyncThunk('students/fetchStudents', async () => {
  const res = await fetch('http://localhost:5000/api/students');
  return await res.json();
});

export const addStudent = createAsyncThunk('students/addStudent', async (studentData) => {
  const res = await fetch('http://localhost:5000/api/students', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(studentData)
  });
  if (!res.ok) throw new Error('Failed to add student');
  return await res.json();
});

export const updateStudent = createAsyncThunk('students/updateStudent', async ({ id, data }) => {
  const res = await fetch(`http://localhost:5000/api/students/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  if (!res.ok) throw new Error('Failed to update student');
  return await res.json();
});

export const deleteStudent = createAsyncThunk('students/deleteStudent', async (id) => {
  const res = await fetch(`http://localhost:5000/api/students/${id}`, { method: 'DELETE' });
  if (!res.ok) throw new Error('Failed to delete student');
  return id;
});

const studentsSlice = createSlice({
  name: 'students',
  initialState: {
    items: [],
    status: 'idle',
    error: null
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchStudents.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchStudents.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.items = action.payload;
      })
      .addCase(fetchStudents.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message;
      })
      .addCase(addStudent.fulfilled, (state, action) => {
        state.items.push(action.payload);
      })
      .addCase(updateStudent.fulfilled, (state, action) => {
        const idx = state.items.findIndex(s => s.id === action.payload.id);
        if (idx !== -1) state.items[idx] = action.payload;
      })
      .addCase(deleteStudent.fulfilled, (state, action) => {
        state.items = state.items.filter(s => s.id !== action.payload);
      });
  }
});

export default studentsSlice.reducer; 