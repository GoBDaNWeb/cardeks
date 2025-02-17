export const sendFileToEmail = async (
	emails: string[],
	fileBlob: Blob,
	fileType: 'excel' | 'csv' | 'gpx'
) => {
	const formData = new FormData();
	formData.append('emails', emails.join(','));
	formData.append('file', fileBlob, `file.${fileType === 'excel' ? 'xlsx' : fileType}`);

	try {
		const response = await fetch('/send.php', {
			method: 'POST',
			body: formData
		});
		const result = await response.json();
		alert(result.success ? 'Файл успешно отправлен!' : 'Ошибка при отправке.');
	} catch (error) {
		console.error('Ошибка при отправке:', error);
		alert('Не удалось отправить файл.');
	}
};
