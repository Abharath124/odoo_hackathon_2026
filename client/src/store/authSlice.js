import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import api from '../utils/api'

const token = localStorage.getItem('token')

export const fetchMe = createAsyncThunk('auth/fetchMe', async (_, { rejectWithValue }) => {
  try {
    const res = await api.get('/auth/me')
    return res.data.user
  } catch (err) {
    return rejectWithValue({ status: err.response?.status, message: err.response?.data?.message })
  }
})

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: null,
    token: token || null,
    isAuthenticated: !!token,
    loading: !!token,
    initialized: !token, // true immediately if no token, false if token exists (wait for fetchMe)
  },
  reducers: {
    setCredentials: (state, action) => {
      state.user = action.payload.user
      state.token = action.payload.token
      state.isAuthenticated = true
      state.loading = false
      state.initialized = true
      localStorage.setItem('token', action.payload.token)
    },
    logout: (state) => {
      state.user = null
      state.token = null
      state.isAuthenticated = false
      state.loading = false
      state.initialized = true
      localStorage.removeItem('token')
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchMe.pending, (state) => {
        state.loading = true
      })
      .addCase(fetchMe.fulfilled, (state, action) => {
        state.user = action.payload
        state.isAuthenticated = true
        state.loading = false
        state.initialized = true
      })
      .addCase(fetchMe.rejected, (state, action) => {
        state.loading = false
        state.initialized = true
        if (action.payload?.status === 401) {
          state.user = null
          state.token = null
          state.isAuthenticated = false
          localStorage.removeItem('token')
        }
      })
  },
})

export const { setCredentials, logout } = authSlice.actions
export default authSlice.reducer
