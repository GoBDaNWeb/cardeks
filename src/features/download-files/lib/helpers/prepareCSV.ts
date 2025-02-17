export const prepareCSV = (csvData: any): Blob => {
	const csvContent = csvData.map((row: any) => row.join(',')).join('\n');
	return new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
};
