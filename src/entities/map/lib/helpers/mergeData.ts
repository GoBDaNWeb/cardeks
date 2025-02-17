export const mergeData = (data1: any[][], data2: any[][]) => {
	const data2Map = new Map(data2.map(item => [item[0], { address: item[1], list: item[2] }]));

	return data1.map(item => {
		const id = item[0];
		const extraData = data2Map.get(id) || { address: '', list: [] };
		return [...item, extraData.address, extraData.list];
	});
};
