import { FC, ReactElement } from 'react';

import clsx from 'clsx';

import { Button } from '@/shared/ui';

import s from './menu-button.module.scss';

interface IMenuButton {
	onClick: () => void;
	icon: ReactElement;
	text: string;
	count?: string | number;
	isActive?: boolean;
}

export const MenuButton: FC<IMenuButton> = ({ onClick, icon, text, count, isActive }) => {
	const menuBtnClass = clsx(s.menuButton, { [s.active]: isActive });

	return (
		<Button onClick={onClick} className={menuBtnClass}>
			<div className={s.content}>
				<div className={s.icon}>{icon}</div>
				<p>{text}</p>
			</div>
			{count ? <span>{count}</span> : null}
		</Button>
	);
};
