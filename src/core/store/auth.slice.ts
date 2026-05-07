import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { IUserInfo } from '@/src/features/auth/interfaces';

export interface IAuthState {
	accessToken: string;
	refreshToken: string;
	user: IUserInfo | null;
}

const initialState: IAuthState = {
	accessToken: '',
	refreshToken: '',
	user: null,
};

export const authSlice = createSlice({
	name: 'auth',
	initialState,
	reducers: {
		setAccessToken: (state, action: PayloadAction<string>) => {
			state.accessToken = action.payload;
		},
		setRefreshToken: (state, action: PayloadAction<string>) => {
			state.refreshToken = action.payload;
		},
		setUser: (state, action: PayloadAction<IUserInfo>) => {
			state.user = action.payload;
		},
		clearAuth: (state) => {
			state.accessToken = '';
			state.refreshToken = '';
			state.user = null;
		},
	},
});

export const { setAccessToken, setRefreshToken, setUser, clearAuth } = authSlice.actions;

export default authSlice.reducer;
