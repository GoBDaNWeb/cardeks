import { useState } from 'react';
import { useDispatch } from 'react-redux';

import clsx from 'clsx';

import { handleOpenModal as openReviewModal } from '@/features/review-modal';

import { handleOpenModal as openGuideModal } from '@/entities/guide-modal';

import { Button, ChatIcon, DocumentIcon, MenuIcon } from '@/shared/ui';

import s from './modals-menu.module.scss';

export const ModalsMenu = () => {
	const [isActive, setActive] = useState(false);

	const dispatch = useDispatch();

	const handeOpenReviewModal = () => {
		dispatch(openReviewModal(true));
	};
	const handeOpenGuideModal = () => {
		dispatch(openGuideModal(true));
	};

	const handleShowModalBtns = () => {
		setActive(!isActive);
	};

	const modalsMenuClass = clsx(s.modalsMenu, { [s.active]: isActive });
	const menuBtnCLass = clsx(s.menuBtn, { [s.active]: isActive });

	return (
		<div className={modalsMenuClass}>
			<Button className={menuBtnCLass} onClick={() => handleShowModalBtns()}>
				<MenuIcon />
			</Button>
			<div className={s.modalsMenuContent}>
				<Button onClick={() => handeOpenGuideModal()} className={s.guideModalBtn}>
					<DocumentIcon />
				</Button>
				<Button onClick={() => handeOpenReviewModal()} className={s.reviewModalBtn}>
					<ChatIcon />
				</Button>
			</div>
		</div>
	);
};
