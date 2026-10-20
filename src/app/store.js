import {configureStore} from '@reduxjs/toolkit';
import partsReducer from '../features/parts/partsSlice.js';
export const store=configureStore({reducer:{parts:partsReducer}});
