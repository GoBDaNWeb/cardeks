import { enLetter } from '@/shared/config';

export const getImage = index => {
	return `/images/points/point${enLetter.split('')[index].toUpperCase()}.png`;
};
