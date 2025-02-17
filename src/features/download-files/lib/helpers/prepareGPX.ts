import { IGPX } from '@/shared/types';

export const prepareGPX = (gpxData: IGPX[]): Blob => {
	const gpxContent = `<?xml version="1.0" encoding="UTF-8"?>
    <gpx version="1.1" creator="React App">
      ${gpxData.map(point => `<wpt lat="${point.lat}" lon="${point.lon}"><name>${point.name}</name></wpt>`).join('')}
    </gpx>`;
	return new Blob([gpxContent], { type: 'application/gpx+xml;charset=utf-8;' });
};
