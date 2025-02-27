const feature = {
	address: 'Пермский край, г. Чусовой, ул. Юности, 22',
	features: {
		abilityPPay: false,
		canManageCards: true,
		ppayBarcode: false
	},
	filters: {
		gateHeight: 0,
		tire: false,
		washing: false
	},
	fuels: {
		AdBlue: false,
		Ai100: false,
		Ai92: true,
		Ai92P: true,
		Ai95: true,
		Ai95P: false,
		Ai98: false,
		DT: true,
		DTP: false,
		Gaz: false,
		Metan: false
	},
	fuelTypes: ['Ai92', 'Ai92P', 'DT'],
	featureKeys: ['canManageCards'],
	typeKeys: ['azs'],
	geometry: {
		type: 'Point',
		coordinates: [58.279857, 57.810644]
	},
	id: '0000007018',
	title: 'Нефтехимпром',
	type: 'Features',
	types: {
		azs: true,
		tire: false,
		washing: false
	}
};
const fuels = [{ title: 'ДТ', value: 'DT' }];
const featuresList = [{ title: 'Оплата из машины', value: 'abilityPPay' }];
const terminal = '2005';
const azsTypes = ['washing', 'azs'];
