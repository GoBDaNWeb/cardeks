export const filterObj = (obj: any, filterArray: any) => {
	for (const key in obj) {
		if (filterArray.includes(key)) {
			if (obj[key] !== true) {
				return false;
			}
		} else {
			if (obj[key] !== false) {
				return false;
			}
		}
	}
	return true;
};
