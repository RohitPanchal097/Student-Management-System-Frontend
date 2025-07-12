import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

// Fetch all batches (for all courses)
export const fetchAllBatches = createAsyncThunk('batches/fetchAllBatches', async () => {
  const res = await fetch('http://localhost:5000/api/batches');
  return await res.json();
});

// Fetch batches for specific course
export const fetchBatches = createAsyncThunk('batches/fetchBatches', async (courseId) => {
  const res = await fetch(`http://localhost:5000/api/batches?course_id=${courseId}`);
  return await res.json();
});

export const addBatch = createAsyncThunk('batches/addBatch', async ({ name, course_id }) => {
  const res = await fetch('http://localhost:5000/api/batches', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, course_id })
  });
  if (!res.ok) throw new Error('Failed to add batch');
  return await res.json();
});

export const updateBatch = createAsyncThunk('batches/updateBatch', async ({ id, data }) => {
  const res = await fetch(`http://localhost:5000/api/batches/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  if (!res.ok) throw new Error('Failed to update batch');
  return await res.json();
});

export const deleteBatch = createAsyncThunk('batches/deleteBatch', async (id) => {
  const res = await fetch(`http://localhost:5000/api/batches/${id}`, { method: 'DELETE' });
  if (!res.ok) throw new Error('Failed to delete batch');
  return id;
});

const batchesSlice = createSlice({
  name: 'batches',
  initialState: {
    items: [],
    status: 'idle',
    error: null
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchAllBatches.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchAllBatches.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.items = action.payload;
      })
      .addCase(fetchAllBatches.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message;
      })
      .addCase(fetchBatches.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchBatches.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.items = action.payload;
      })
      .addCase(fetchBatches.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message;
      })
      .addCase(addBatch.fulfilled, (state, action) => {
        state.items.push(action.payload);
      })
      .addCase(updateBatch.fulfilled, (state, action) => {
        const idx = state.items.findIndex(b => b.id === action.payload.id);
        if (idx !== -1) state.items[idx] = action.payload;
      })
      .addCase(deleteBatch.fulfilled, (state, action) => {
        state.items = state.items.filter(b => b.id !== action.payload);
      });
  }
});

export default batchesSlice.reducer; 