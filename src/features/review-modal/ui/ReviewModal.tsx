import { useDispatch } from 'react-redux';

import { useTypedSelector } from '@/shared/lib';
import { Button, CloseIcon, Input, Modal, PlusIcon, Textarea } from '@/shared/ui';

import { handleOpenModal } from '../model';

import s from './review-modal.module.scss';

export const ReviewModal = () => {
	const { isOpen } = useTypedSelector(store => store.reviewModal);
	const dispatch = useDispatch();

	const handleCloseModal = () => {
		dispatch(handleOpenModal(false));
	};

	return (
		<Modal isOpen={isOpen} className={s.reviewModal} close={handleCloseModal}>
			<div className={s.modalContent} onClick={e => e.stopPropagation()}>
				<Button className={s.closeBtn} onClick={() => handleCloseModal()}>
					<CloseIcon />
				</Button>
				<form>
					<h5 className={s.title}>Отзыв</h5>
					<div className={s.inputs}>
						<div className={s.inputWrapper}>
							<p>Имя</p>
							<Input isStyled placeholder='Введите' />
						</div>
						<div className={s.inputWrapper}>
							<p>Телефон или e-mail</p>
							<Input isStyled placeholder='Введите' />
						</div>
						<div className={s.inputWrapper}>
							<p>Номер карты</p>
							<Input isStyled placeholder='Введите' />
						</div>
						<div className={s.inputWrapper}>
							<p>Номер карты</p>
							<Textarea placeholder='Введите' />
						</div>
					</div>
					<div className={s.formBottom}>
						<Button onClick={() => {}} variant='primary' className={s.submitBtn} type='submit'>
							Отправить
						</Button>
						<Button onClick={() => {}} className={s.fileBtn}>
							<PlusIcon />
							<p>Прикрепить файлы</p>
						</Button>
					</div>
				</form>
			</div>
		</Modal>
	);
};
