import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import { clearAuth } from './auth.slice';

export interface ICheckoutDraftLine {
	product_id: string;
	quantity: number;
}

export interface ICheckoutDraftState {
	/** Snapshot từ giỏ khi bấm "Đặt hàng"; checkout chỉ đọc, không sửa. */
	lines: ICheckoutDraftLine[] | null;
}

const initialState: ICheckoutDraftState = {
	lines: null,
};

export const checkoutDraftSlice = createSlice({
	name: 'checkoutDraft',
	initialState,
	reducers: {
		setCheckoutDraft: (state, action: PayloadAction<ICheckoutDraftLine[]>) => {
			state.lines = action.payload.length > 0 ? action.payload : null;
		},
		clearCheckoutDraft: (state) => {
			state.lines = null;
		},
	},
	extraReducers: (builder) => {
		builder.addCase(clearAuth, (state) => {
			state.lines = null;
		});
	},
});

export const { setCheckoutDraft, clearCheckoutDraft } = checkoutDraftSlice.actions;

export default checkoutDraftSlice.reducer;
