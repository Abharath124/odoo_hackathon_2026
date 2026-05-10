import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import api from '../utils/api'

export const fetchSiteSettings = createAsyncThunk('site/fetchSettings', async (_, { rejectWithValue }) => {
  try {
    const res = await api.get('/admin/settings/public')
    return res.data
  } catch (err) {
    return rejectWithValue(err.response?.data?.message)
  }
})

const siteSlice = createSlice({
  name: 'site',
  initialState: {
    site_name: 'Travel Loop',
    site_tagline: 'Personalized Travel Planning Made Easy',
    primary_color: '#18181b',
    secondary_color: '#71717a',
    logo: '',
  },
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(fetchSiteSettings.fulfilled, (state, action) => {
      return { ...state, ...action.payload }
    })
  },
})

export default siteSlice.reducer
