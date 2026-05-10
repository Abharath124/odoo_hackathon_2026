import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import api from '../utils/api'

export const fetchSettings = createAsyncThunk('settings/fetch', async (_, { rejectWithValue }) => {
  try {
    const res = await api.get('/admin/settings')
    return res.data.settings
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to fetch settings')
  }
})

export const saveSettings = createAsyncThunk('settings/save', async (data, { rejectWithValue }) => {
  try {
    await api.put('/admin/settings', data)
    return data
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to save settings')
  }
})

const settingsSlice = createSlice({
  name: 'settings',
  initialState: {
    data: {},
    loading: false,
    saving: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchSettings.pending, (state) => { state.loading = true; state.error = null })
      .addCase(fetchSettings.fulfilled, (state, action) => { state.loading = false; state.data = action.payload })
      .addCase(fetchSettings.rejected, (state, action) => { state.loading = false; state.error = action.payload })
      .addCase(saveSettings.pending, (state) => { state.saving = true })
      .addCase(saveSettings.fulfilled, (state, action) => { state.saving = false; state.data = { ...state.data, ...action.payload } })
      .addCase(saveSettings.rejected, (state) => { state.saving = false })
  },
})

export default settingsSlice.reducer
