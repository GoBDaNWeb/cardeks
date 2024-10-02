export const containsArray = (arrayOfArrays, targetArray, newArray) => {
	const index = arrayOfArrays.findIndex(
		arr =>
			arr.length === targetArray.length && arr.every((value, index) => value === targetArray[index])
	);

	// Если совпадающий массив найден, удалить его и вставить новый массив на его место
	if (index !== -1) {
		arrayOfArrays.splice(index, 1, newArray);
	}

	return arrayOfArrays;
};
