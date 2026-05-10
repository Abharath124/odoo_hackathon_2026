import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import api from '../utils/api'

export const fetchUsers = createAsyncThunk('users/fetchAll', async (_, { rejectWithValue }) => {
  try {
    const res = await api.get('/admin/users')
    return res.data.users
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to fetch users')
  }
})

export const editUser = createAsyncThunk('users/edit', async ({ id, data }, { rejectWithValue }) => {
  try {
    const res = await api.put(`/admin/users/${id}`, data)
    return res.data.user
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to update user')
  }
})

export const resetUserPassword = createAsyncThunk('users/resetPassword', async ({ id, password }, { rejectWithValue }) => {
  try {
    await api.put(`/admin/users/${id}/reset-password`, { password })
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to reset password')
  }
})

const usersSlice = createSlice({
  name: 'users',
  initialState: {
    list: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchUsers.pending, (state) => { state.loading = true; state.error = null })
      .addCase(fetchUsers.fulfilled, (state, action) => { state.loading = false; state.list = action.payload })
      .addCase(fetchUsers.rejected, (state, action) => { state.loading = false; state.error = action.payload })
      .addCase(editUser.fulfilled, (state, action) => {
        const index = state.list.findIndex(u => u.id === action.payload.id)
        if (index !== -1) state.list[index] = action.payload
      })
  },
})

export default usersSlice.reducer
