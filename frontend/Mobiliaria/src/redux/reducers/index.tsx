import { configureStore } from '@reduxjs/toolkit'
import thunk from 'redux-thunk'
import createSensitiveStorage from 'redux-persist-sensitive-storage'
import autoMergeLevel2 from 'redux-persist/lib/stateReconciler/autoMergeLevel2'
import { persistReducer, persistStore } from 'redux-persist'
import { combineReducers } from 'redux'
import user from './user'
import theme from './theme'

const middlewares = [
    thunk
]

const storage = createSensitiveStorage({
    keychainService: 'com.mobiliaria.app.jmuja',
    sharedPreferencesName: 'com.mobiliaria.app.jmuja'
})

const persistConfig = {
    key: 'root',
    storage: storage,
    stateReconciler: autoMergeLevel2,
    blacklist: [
    ]
}
const cReducers = combineReducers({
    user,
    theme
})
const persistedReducer = persistReducer(persistConfig, cReducers)

const store = configureStore({
    reducer: persistedReducer,
    middleware: middlewares
})

// Infer the `RootState` and `AppDispatch` types from the store itself
// export type RootState = ReturnType<typeof store.getState>
// Inferred type: {posts: PostsState, comments: CommentsState, users: UsersState}
// export type AppDispatch = typeof store.dispatch

export type RootState = ReturnType<typeof cReducers>

export default store

export const persistor = persistStore(store)
