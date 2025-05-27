import { DownloadFiles } from '@/features/download-files';

import { Button, CloseIcon, Input, Modal, Radio, Selector, useModal } from '@/shared/ui';

import s from './mail-modal.module.scss';

export const MailModal = () => {
	const { close, isOpen } = useModal();

	const handleCloseModal = () => {
		close();
	};

	return (
		<Modal isOpen={isOpen('mail')} className={s.mailModal} close={handleCloseModal}>
			<div className={s.modalContent} onClick={e => e.stopPropagation()}>
				<Button className={s.closeBtn} onClick={() => handleCloseModal()}>
					<CloseIcon />
				</Button>
				<DownloadFiles
					title='Скачать список'
					text='Загружаемый файл будет содержать все станции видимые на карте.'
					btnText='Скачать список'
					download={false}
				/>

				{/* <form onSubmit={handleSubmit(onSubmit)}>
					<h5 className={s.title}>Отправить список по E-mail</h5>
					<p className={s.description}>
						Загружаемый файл будет содержать все станции видимые на карте.
					</p>
					<div className={s.inputs}>
						<div className={s.inputRow}>
							<Controller
								control={control}
								name='radio'
								render={({ field: { onChange } }) => (
									<Radio
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
								<Radio label='Excel' name='download' onChange={() => onChange('exel')} />
							)}
						/>
						<Controller
							control={control}
							name='mail'
							render={({ field: { onChange } }) => (
								<Input isStyled placeholder='E-mail (несколько - через запятую)' />
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
				</form> */}
			</div>
		</Modal>
	);
};
