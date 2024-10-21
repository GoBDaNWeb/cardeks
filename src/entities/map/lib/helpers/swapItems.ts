export const swapItems = (tempArray: any[], swapArr: number[]) => {
	return ([tempArray[swapArr[0]], tempArray[swapArr[1]]] = [
		tempArray[swapArr[1]],
		tempArray[swapArr[0]]
	]);
};
