export const getPointInfo = (point: any, type: 'index' | 'id'): string => {
	switch (type) {
		case 'index':
			return point.properties.get('id').split('.')[1];
		case 'id':
			return point.properties.get('id');
	}
};
