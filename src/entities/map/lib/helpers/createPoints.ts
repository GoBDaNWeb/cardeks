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
		const pin = () => {
			if (item[1].toLowerCase().includes('лукойл')) {
				return '/images/pins/8.png';
			} else if (item[1].toLowerCase().includes('газпром')) {
				return '/images/pins/3.png';
			} else if (item[1].toLowerCase().includes('башнефть')) {
				return '/images/pins/4.png';
			} else if (item[1].toLowerCase().includes('русснефть')) {
				return '/images/pins/6.png';
			} else if (item[1].toLowerCase().includes('Нефтьмагистраль')) {
				return '/images/pins/7.png';
			} else if (item[1].toLowerCase().includes('крайснефть')) {
				return '/images/pins/10.png';
			} else if (item[1].toLowerCase().includes('тнк')) {
				return '/images/pins/14.png';
			} else if (item[1].toLowerCase().includes('татнефть')) {
				return '/images/pins/15.png';
			} else if (item[1].toLowerCase().includes('бекар')) {
				return '/images/pins/16.png';
			} else if (item[1].toLowerCase().includes('Роснефть')) {
				return '/images/pins/19.png';
			} else if (item[1].toLowerCase().includes('птк')) {
				return '/images/pins/17.png';
			} else if (azs.length > 0) {
				return '/images/pins/2.png';
			} else if (item[13] === 1) {
				return '/images/pins/19.png';
			}
		};
		const newObj = {
			type: 'Feature',
			id: item[0],
			geometry: { type: 'Point', coordinates: [item[18], item[19]] },
			title: item[1],
			address: item[21],
			terminals: item[22],
			properties: {
				hintContent: `<div class='my-hint'>${item[1]}</div>
				<div>${azs.length > 0 ? 'АЗС' : ''}  ${item[13] === 0 ? '' : 'Мойка  '} ${item[14] === 0 ? '' : 'Шиномонтаж'}</div>`
			},
			types: {
				washing: item[13] === 0 ? false : true,
				tire: item[14] === 0 ? false : true,
				azs: azs.length > 0
			},

			options: {
				iconLayout: 'default#image',
				iconImageHref: pin(),
				iconImageSize: [25, 34],
				iconImageOffset: [-16, -38]
			},
			fuels: {
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
				Metan: item[12] === 0 ? false : true
			},
			filters: {
				tire: item[14] === 0 ? false : true,
				washing: item[13] === 0 ? false : true,
				gateHeight: item[20]
			},
			features: {
				abilityPPay: item[15] === 0 ? false : true,
				canManageCards: item[16] === 0 ? false : true,
				ppayBarcode: item[17] === 0 ? false : true
			}
		};
		return newObj;
	});
	return azsArr;
};
