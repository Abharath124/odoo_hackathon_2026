import { configureStore } from '@reduxjs/toolkit'
import authReducer from './authSlice'
import usersReducer from './usersSlice'
import settingsReducer from './settingsSlice'
import siteReducer from './siteSlice'

export const store = configureStore({
  reducer: {
    auth: authReducer,
    users: usersReducer,
    settings: settingsReducer,
    site: siteReducer,
  },
})
