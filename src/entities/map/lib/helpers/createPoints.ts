export const createPoints = (arr: any) => {
	const azsArr = arr.map((item: any) => {
		const options = [
			item[2],
			item[3],
			item[4],
			item[5],
			item[6],
			item[7],
			item[8],
			item[9],
			item[10],
			item[11],
			item[12]
		];
		const azs = options.filter(option => {
			return option === 1;
		});
		const newObj = {
			type: 'Feature',
			id: item[0],
			geometry: { type: 'Point', coordinates: [item[17], item[18]] },
			title: item[1],
			properties: {
				// balloonContent: 'Содержимое балуна',
				// clusterCaption: 'Еще одна метка',
				hintContent: `<div class='my-hint'>${item[1]}</div>
				<div>${azs.length > 0 ? 'АЗС' : ''}  ${item[13] === 0 ? '' : 'Мойка  '} ${item[14] === 0 ? '' : 'Шиномонтаж'}</div>`
			},
			types: {
				washing: item[13] === 0 ? false : true,
				tire: item[14] === 0 ? false : true,
				azs: azs.length > 0
			},
			options: {
				washing: item[13] === 0 ? false : true,
				tire: item[14] === 0 ? false : true,
				DT: item[2] === 0 ? false : true,
				DTP: item[3] === 0 ? false : true,
				Ai92: item[4] === 0 ? false : true,
				Ai92P: item[5] === 0 ? false : true,
				Ai95: item[6] === 0 ? false : true,
				Ai95P: item[7] === 0 ? false : true,
				Ai98: item[8] === 0 ? false : true,
				Ai100: item[9] === 0 ? false : true,
				AdBlue: item[10] === 0 ? false : true,
				Gaz: item[11] === 0 ? false : true,
				Metan: item[12] === 0 ? false : true,
				gateHeight: item[19]
			}
		};
		return newObj;
	});
	return azsArr;
};
