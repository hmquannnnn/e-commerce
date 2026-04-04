export const SLICE_NAMES = {
	auth: 'auth',
	checkoutDraft: 'checkoutDraft',
} as const;

export type SliceName = (typeof SLICE_NAMES)[keyof typeof SLICE_NAMES];
