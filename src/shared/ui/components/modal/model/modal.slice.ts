import { IModal } from '@/shared/types';

import { createSlice } from '@reduxjs/toolkit';

const initialState: IModal = {
	currentModal: null,
	props: {}
};

const modalSlice = createSlice({
	name: 'modalSlice',
	initialState,
	reducers: {
		openModal(state, action) {
			state.currentModal = action.payload.name;
			state.props = action.payload.props || {};
		},
		closeModal(state) {
			state.currentModal = null;
			state.props = {};
		},
		updateModalProps: (state, action) => {
			state.props = { ...state.props, ...action.payload };
		}
	}
});

export { modalSlice };
export default modalSlice.reducer;
