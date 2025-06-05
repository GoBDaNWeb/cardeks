export const containsArray = (
	arrayOfArrays: number[][],
	targetArray: number[] | null,
	newArray: number[]
) => {
	if (targetArray && arrayOfArrays) {
		const index = arrayOfArrays.findIndex(
			arr =>
				arr.length === targetArray.length &&
				arr.every((value, index) => value === targetArray[index])
		);

		if (index !== -1) {
			arrayOfArrays.splice(index, 1, newArray);
		}

		return arrayOfArrays;
	}
};
