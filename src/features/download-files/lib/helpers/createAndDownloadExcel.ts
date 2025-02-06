import * as XLSX from 'xlsx';

export const createAndDownloadExcel = (tableRef: React.MutableRefObject<null>) => {
	const worksheet = XLSX.utils.table_to_book(tableRef);
	XLSX.writeFile(worksheet, 'AZSList.xlsx');
};
