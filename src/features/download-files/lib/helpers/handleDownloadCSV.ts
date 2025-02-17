export const handleDownloadCSV = (csvData: any) => {
	// Преобразуем массив данных в CSV-строку
	const csvContent = csvData.map((row: any) => row.join(',')).join('\n');

	// Создаем Blob из CSV-строки
	const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });

	// Создаем ссылку для скачивания
	const url = URL.createObjectURL(blob);
	const link = document.createElement('a');
	link.setAttribute('href', url);
	link.setAttribute('download', 'AZSList.csv');
	document.body.appendChild(link);
	link.click();

	// Очищаем ссылку после скачивания
	document.body.removeChild(link);
	URL.revokeObjectURL(url);
	return Buffer.from(csvContent, 'utf-8').toString('base64');
};
