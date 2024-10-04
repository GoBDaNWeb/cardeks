import { getPointId } from '@/shared/lib';

export const changePointImage = (point, index, newImageUrl) => {
	point.properties.set('id', getPointId(index));
	point.properties.set('balloonContent', `index:  ${index}`);
	point.options.set({
		iconImageHref: newImageUrl,
		iconImageSize: [30, 34],
		iconImageOffset: [-16, -38]
	});
};
