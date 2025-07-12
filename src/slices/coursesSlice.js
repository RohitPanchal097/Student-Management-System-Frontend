import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

// Async thunks
export const fetchCourses = createAsyncThunk('courses/fetchCourses', async () => {
  const res = await fetch('http://localhost:5000/api/courses');
  return await res.json();
});

export const addCourse = createAsyncThunk('courses/addCourse', async (name) => {
  const res = await fetch('http://localhost:5000/api/courses', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name })
  });
  if (!res.ok) throw new Error('Failed to add course');
  return await res.json();
});

export const updateCourse = createAsyncThunk('courses/updateCourse', async ({ id, data }) => {
  const res = await fetch(`http://localhost:5000/api/courses/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  if (!res.ok) throw new Error('Failed to update course');
  return await res.json();
});

export const deleteCourse = createAsyncThunk('courses/deleteCourse', async (id) => {
  const res = await fetch(`http://localhost:5000/api/courses/${id}`, { method: 'DELETE' });
  if (!res.ok) throw new Error('Failed to delete course');
  return id;
});

const coursesSlice = createSlice({
  name: 'courses',
  initialState: {
    items: [],
    status: 'idle',
    error: null
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchCourses.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchCourses.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.items = action.payload;
      })
      .addCase(fetchCourses.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message;
      })
      .addCase(addCourse.fulfilled, (state, action) => {
        state.items.push(action.payload);
      })
      .addCase(updateCourse.fulfilled, (state, action) => {
        const idx = state.items.findIndex(c => c.id === action.payload.id);
        if (idx !== -1) state.items[idx] = action.payload;
      })
      .addCase(deleteCourse.fulfilled, (state, action) => {
        state.items = state.items.filter(c => c.id !== action.payload);
      });
  }
});

export default coursesSlice.reducer; 