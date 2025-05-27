import { useState } from 'react';

import clsx from 'clsx';

import { Button, ChatIcon, DocumentIcon, MenuIcon, useModal } from '@/shared/ui';

import s from './modals-menu.module.scss';

export const ModalsMenu = () => {
	const [isActive, setActive] = useState(false);

	const { open } = useModal();

	const handleOpenGuideModal = () => {
		open('guide');
	};

	const handeOpenReviewModal = () => {
		open('review');
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
				<Button onClick={handleOpenGuideModal} className={s.guideModalBtn}>
					<DocumentIcon />
				</Button>
				<Button onClick={handeOpenReviewModal} className={s.reviewModalBtn}>
					<ChatIcon />
				</Button>
			</div>
		</div>
	);
};
