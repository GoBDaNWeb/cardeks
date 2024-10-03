export const containsArray = (arrayOfArrays, targetArray, newArray) => {
	const index = arrayOfArrays.findIndex(
		arr =>
			arr.length === targetArray.length && arr.every((value, index) => value === targetArray[index])
	);

	if (index !== -1) {
		arrayOfArrays.splice(index, 1, newArray);
	}

	return arrayOfArrays;
};
