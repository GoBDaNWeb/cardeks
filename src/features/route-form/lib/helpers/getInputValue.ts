export const getInputValue = ({ getValues, index }) => {
	return getValues('points')[index].inputText;
};
