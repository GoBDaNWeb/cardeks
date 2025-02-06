import { IGPX } from '@/shared/types';

export const handleDownloadGPX = (gpxData: IGPX[]) => {
	// Создаем XML-строку в формате GPX
	const gpxContent = `<?xml version="1.0" encoding="UTF-8"?>
    <gpx version="1.1" creator="React App">
      ${gpxData
				.map(
					point => `
      <wpt lat="${point.lat}" lon="${point.lon}">
        <name>${point.name}</name>
      </wpt>`
				)
				.join('')}
    </gpx>`;

	// Создаем Blob из GPX-строки
	const blob = new Blob([gpxContent], { type: 'application/gpx+xml;charset=utf-8;' });

	// Создаем ссылку для скачивания
	const url = URL.createObjectURL(blob);
	const link = document.createElement('a');
	link.setAttribute('href', url);
	link.setAttribute('download', 'AZSList.gpx');
	document.body.appendChild(link);
	link.click();

	// Очищаем ссылку после скачивания
	document.body.removeChild(link);
	URL.revokeObjectURL(url);
};
