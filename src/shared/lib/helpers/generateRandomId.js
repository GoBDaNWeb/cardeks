export const generateRandomId = (length = 10) => {
	const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
	const charactersLength = characters.length;
	let randomId = '';

	for (let i = 0; i < length; i++) {
		randomId += characters.charAt(Math.floor(Math.random() * charactersLength));
	}

	return randomId;
};
