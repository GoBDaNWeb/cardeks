import { FC, useEffect, useRef, useState } from 'react';
import { Controller, FieldValues, SubmitHandler, useForm } from 'react-hook-form';

import { useTypedSelector } from '@/shared/lib';
import { Feature, IGPX } from '@/shared/types';
import { Button, ExcelTemplate, Input, Radio, Selector } from '@/shared/ui';

import { selectorOptions } from '../config';
import { createAndDownloadExcel, handleDownloadCSV, handleDownloadGPX } from '../lib/helpers';

import s from './download-files.module.scss';

interface IDownloadFiles {
	title: string;
	text?: string;
	btnText: string;
	download?: boolean;
}

export const DownloadFiles: FC<IDownloadFiles> = ({ title, text, btnText, download = true }) => {
	const [selectDisabled, setSeletDisabled] = useState(true);
	const [buttonDisabled, setButtonDisabled] = useState(true);
	const [csvData, setCsvData] = useState([[]]);
	const [gpxData, setGpxData] = useState<IGPX[]>([]);

	const { isOpen } = useTypedSelector(store => store.downloadModal);
	const {
		routeInfo: { pointsOnRoute },
		mapInfo: { points }
	} = useTypedSelector(store => store.map);

	const tableRef = useRef(null);

	const { handleSubmit, control, getValues, watch, setValue } = useForm({
		defaultValues: {
			mail: '',
			radio: 'poi',
			selector: null
		}
	});

	const watchRaio = watch('radio');
	const watchSelector = watch('selector');
	const watchMail = watch('mail');

	const generateCSVFile = (data: string[][]) => {
		const csvContent = data.map(row => row.join(',')).join('\n');
		return csvContent;
	};

	const generateGPXFile = (data: IGPX[]) => {
		let gpxContent = `<?xml version="1.0" encoding="UTF-8"?>
<gpx version="1.1" creator="YourApp">
`;
		data.forEach(point => {
			gpxContent += `<wpt lat="${point.lat}" lon="${point.lon}">
    <name>${point.name}</name>
</wpt>
`;
		});
		gpxContent += '</gpx>';
		return gpxContent;
	};

	const generateExcelFile = async (tableRef: React.RefObject<HTMLTableElement>) => {
		// Используйте библиотеку xlsx для генерации Excel файла
		// Пример:
		const XLSX = await import('xlsx');
		const workbook = XLSX.utils.table_to_book(tableRef.current);
		return XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
	};

	const onSubmit: SubmitHandler<FieldValues> = async data => {
		const { radio, selector, mail } = data;

		if (download) {
			if (radio === 'excel' && tableRef.current) {
				createAndDownloadExcel(tableRef.current);
			}
			if (radio === 'poi' && selector.value === 'CSV') {
				handleDownloadCSV(csvData);
			}
			if (radio === 'poi' && selector.value === 'GPX') {
				handleDownloadGPX(gpxData);
			}
		} else {
			// Отправка данных на сервер
			const formData = new FormData();
			formData.append('emails', mail);
			formData.append('type', radio === 'excel' ? 'excel' : selector.value.toLowerCase());
			formData.append(
				'data',
				JSON.stringify(
					radio === 'excel'
						? tableRef.current
						: radio === 'poi' && selector.value === 'CSV'
							? csvData
							: gpxData
				)
			);

			try {
				const response = await fetch('https://dev5.paradigma-digital.ru/1.php', {
					method: 'POST',
					body: formData
				});

				if (response.ok) {
					alert('Файл успешно отправлен на указанные email-адреса.');
				} else {
					alert('Произошла ошибка при отправке файла.');
				}
			} catch (error) {
				console.error('Ошибка:', error);
				alert('Произошла ошибка при отправке файла.');
			}
		}
	};

	useEffect(() => {
		if (isOpen) {
			if (pointsOnRoute.length > 0) {
				const mappedCVSPoints = pointsOnRoute.map((point: Feature) => {
					return [point.geometry.coordinates, point.address, point.title];
				});
				setCsvData(mappedCVSPoints);
				const mappedGPXoints = pointsOnRoute.map((point: Feature) => {
					return {
						lat: point.geometry.coordinates[0],
						lon: point.geometry.coordinates[1],
						name: point.title
					};
				});
				setGpxData(mappedGPXoints);
			} else {
				const mappedCVSPoints = points.map((point: Feature) => {
					return [point.geometry.coordinates, point.address, point.title];
				});
				setCsvData(mappedCVSPoints);
				const mappedGPXoints = points.map((point: Feature) => {
					return {
						lat: point.geometry.coordinates[0],
						lon: point.geometry.coordinates[1],
						name: point.title
					};
				});
				setGpxData(mappedGPXoints);
			}
		} else {
			setValue('radio', 'poi');
			setValue('selector', null);
		}
	}, [isOpen]);

	useEffect(() => {
		if (download) {
			if (
				getValues('radio') === 'excel' ||
				(getValues('radio') === 'poi' && getValues('selector'))
			) {
				setButtonDisabled(false);
			} else {
				setButtonDisabled(true);
			}
		} else {
			if (
				getValues('radio') === 'excel' ||
				(getValues('radio') === 'poi' && getValues('selector') && getValues('mail').length)
			) {
				setButtonDisabled(false);
			} else {
				setButtonDisabled(true);
			}
		}
		getValues('radio') === 'poi' ? setSeletDisabled(false) : setSeletDisabled(true);
	}, [watchRaio, watchSelector, watchMail]);
	return (
		<>
			<form onSubmit={handleSubmit(onSubmit)} className={s.downloadFiles}>
				<h5 className={s.title}> {title}</h5>
				{text ? <p className={s.description}>{text}</p> : null}

				<div className={s.inputs}>
					<div className={s.inputRow}>
						<Controller
							control={control}
							name='radio'
							render={({ field: { onChange, value } }) => (
								<Radio
									isChecked={value === 'poi'}
									label='POI для навигатора'
									name='download'
									onChange={() => onChange('poi')}
								/>
							)}
						/>
						<Controller
							control={control}
							name='selector'
							render={({ field: { onChange, value } }) => (
								<Selector
									placeholder='Выберите формат'
									//@ts-ignore
									options={selectorOptions}
									isDisabled={selectDisabled}
									onChange={onChange}
									value={value}
								/>
							)}
						/>
					</div>
					<Controller
						control={control}
						name='radio'
						render={({ field: { onChange } }) => (
							<Radio label='Excel' name='download' onChange={() => onChange('excel')} />
						)}
					/>
					{!download ? (
						<Controller
							control={control}
							name='mail'
							render={({ field: { onChange } }) => (
								<Input
									isStyled
									placeholder='E-mail (несколько - через запятую)'
									onChange={onChange}
								/>
							)}
						/>
					) : null}
				</div>
				<div className={s.formBottom}>
					<Button
						variant='primary'
						onClick={handleSubmit(onSubmit)}
						className={s.submitBtn}
						type='submit'
						isDisabled={buttonDisabled}
					>
						{btnText}
					</Button>
				</div>
			</form>
			<ExcelTemplate ref={tableRef} />
		</>
	);
};
