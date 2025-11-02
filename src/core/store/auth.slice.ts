import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';

export interface IAuthState {
	accessToken: string;
	refreshToken: string;
}

const initialState: IAuthState = {
	accessToken: '',
	refreshToken: '',
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
		clearAuth: (state) => {
			state.accessToken = '';
			state.refreshToken = '';
		},
	},
});

// Action creators are generated for each case reducer function
export const { setAccessToken, setRefreshToken, clearAuth } = authSlice.actions;

export default authSlice.reducer;
