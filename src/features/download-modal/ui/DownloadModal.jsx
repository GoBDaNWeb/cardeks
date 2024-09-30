import { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';

import { Button, CloseIcon, Modal, Radio, Selector } from '@/shared/ui';

import { selectorOptions } from '../config';
import { handleOpenModal } from '../model';

import s from './download-modal.module.scss';

export const DownloadModal = () => {
	const [selectDisabled, setSeletDisabled] = useState(true);
	const [buttonDisabled, setButtonDisabled] = useState(true);

	const { isOpen } = useSelector(store => store.downloadModal);
	const dispatch = useDispatch();

	const { handleSubmit, control, getValues, watch } = useForm({
		defaultValues: {
			radio: null,
			selector: null
		}
	});

	const watchRaio = watch('radio');
	const watchSelector = watch('selector');

	const onSubmit = data => {
		console.log(data);
	};

	const handleCloseModal = () => {
		console.log('))');
		dispatch(handleOpenModal(false));
	};

	useEffect(() => {
		if (getValues('radio') === 'exel' || (getValues('radio') === 'poi' && getValues('selector'))) {
			setButtonDisabled(false);
		} else {
			setButtonDisabled(true);
		}
		getValues('radio') === 'poi' ? setSeletDisabled(false) : setSeletDisabled(true);
	}, [watchRaio, watchSelector]);

	return (
		<Modal isOpen={isOpen} className={s.downloadModal} close={handleCloseModal}>
			<div className={s.modalContent} onClick={e => e.stopPropagation()}>
				<Button className={s.closeBtn} onClick={() => handleCloseModal()}>
					<CloseIcon />
				</Button>
				<form onSubmit={handleSubmit(onSubmit)}>
					<h5 className={s.title}>Скачать список</h5>
					<div className={s.inputs}>
						<div className={s.inputRow}>
							<Controller
								control={control}
								name='radio'
								render={({ field: { onChange } }) => (
									<Radio
										id='poi'
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
								<Radio id='exel' label='Excel' name='download' onChange={() => onChange('exel')} />
							)}
						/>
					</div>
					<div className={s.formBottom}>
						<Button
							variant='primary'
							onClick={handleSubmit(onSubmit)}
							className={s.submitBtn}
							type='submit'
							isDisabled={buttonDisabled}
						>
							Скачать список
						</Button>
					</div>
				</form>
			</div>
		</Modal>
	);
};
