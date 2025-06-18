import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';

export const createAndDownloadExcel = async (tableElement: HTMLTableElement | null) => {
	if (!tableElement) return;

	const workbook = new ExcelJS.Workbook();
	const worksheet = workbook.addWorksheet('АЗС');

	// Фиксируем первые 2 строки
	worksheet.views = [{ state: 'frozen', ySplit: 3 }];

	// Устанавливаем ширину столбцов (6-й столбец самый широкий)
	const columnWidths = [10, 30, 20, 80, 20, 12, 10, 10, 10, 10, 15];
	worksheet.columns = columnWidths.map(width => ({ width }));

	// Извлекаем данные из HTML-таблицы
	const rows = Array.from(tableElement.querySelectorAll('tr')).map(tr =>
		//@ts-ignore
		Array.from(tr.querySelectorAll('th, td')).map(td => td.innerText)
	);
	const headerRow = rows[2] || []; // 3-я строка (индекс 2)
	const lastColumnIndex = headerRow.filter(cell => cell !== '').length; // Количество непустых заголовков
	const lastColumnLetter = String.fromCharCode(64 + lastColumnIndex); // Преобразуем индекс в букву Excel (A-Z)

	// Устанавливаем автофильтр только на заполненные колонки
	if (lastColumnIndex > 0) {
		worksheet.autoFilter = `A3:${lastColumnLetter}3`;
	}
	// Добавляем данные в таблицу
	rows.forEach(row => worksheet.addRow(row));
	// Создаём файл
	const buffer = await workbook.xlsx.writeBuffer();
	const blob = new Blob([buffer], {
		type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
	});

	// Скачиваем файл
	saveAs(blob, 'АЗС_список.xlsx');
};
