import { enLetter } from '@/shared/config';

export const getImage = (index: number) => {
	return `/images/points/point${enLetter.split('')[+index].toUpperCase()}.png`;
};
