import { createSlice } from '@reduxjs/toolkit';

interface IMenuState {
	objectId: string | null;
}
const initialState: IMenuState = {
	objectId: null
};

const objectInfoSlice = createSlice({
	name: 'objectInfoSlice',
	initialState,
	reducers: {
		setActiveObject(state, action) {
			state.objectId = action.payload;
		}
	}
});

export const { setActiveObject } = objectInfoSlice.actions;
export default objectInfoSlice.reducer;
