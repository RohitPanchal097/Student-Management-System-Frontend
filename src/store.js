import { configureStore } from '@reduxjs/toolkit';
import coursesReducer from './slices/coursesSlice';
import batchesReducer from './slices/batchesSlice';
import studentsReducer from './slices/studentsSlice';

export const store = configureStore({
  reducer: {
    courses: coursesReducer,
    batches: batchesReducer,
    students: studentsReducer,
  },
}); 