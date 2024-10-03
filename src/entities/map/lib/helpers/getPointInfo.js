export const getPointInfo = (point, type) => {
	if (type === 'index') {
		return point.properties.get('id').split('.')[1];
	} else if (type === 'id') {
		return point.properties.get('id');
	}
};
