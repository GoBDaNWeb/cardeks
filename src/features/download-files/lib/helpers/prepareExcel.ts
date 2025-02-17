import * as XLSX from 'xlsx';

export const prepareExcel = (
	tableRef: React.MutableRefObject<HTMLTableElement | null>
): Blob | null => {
	if (!tableRef.current) {
		console.error('Ошибка: tableRef.current равен null.');
		return null;
	}

	try {
		const worksheet = XLSX.utils.table_to_book(tableRef.current); // Преобразуем таблицу в книгу
		const excelBuffer = XLSX.write(worksheet, { bookType: 'xlsx', type: 'array' });

		return new Blob([new Uint8Array(excelBuffer)], {
			type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
		});
	} catch (error) {
		console.error('Ошибка при создании Excel-файла:', error);
		return null;
	}
};
