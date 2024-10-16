export const swapItems = (tempArray, swapArr) => {
	return ([tempArray[swapArr[0]], tempArray[swapArr[1]]] = [
		tempArray[swapArr[1]],
		tempArray[swapArr[0]]
	]);
};
