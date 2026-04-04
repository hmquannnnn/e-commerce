import { configureStore, combineReducers } from '@reduxjs/toolkit';
import { persistReducer, persistStore, FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import authReducer from './auth.slice';
import checkoutDraftReducer from './checkout-draft.slice';
import { SLICE_NAMES } from './slice-names';

const rootReducer = combineReducers({
	[SLICE_NAMES.auth]: authReducer,
	[SLICE_NAMES.checkoutDraft]: checkoutDraftReducer,
});

import type { PersistConfig } from 'redux-persist';
import { useDispatch, useSelector, TypedUseSelectorHook } from 'react-redux';

const persistConfig: PersistConfig<ReturnType<typeof rootReducer>> = {
	key: 'root',
	storage,
	whitelist: [SLICE_NAMES.auth],
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
	reducer: persistedReducer,
	middleware: (getDefaultMiddleware) =>
		getDefaultMiddleware({
			serializableCheck: {
				ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
			},
		}),
});

export const persistor = persistStore(store);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
