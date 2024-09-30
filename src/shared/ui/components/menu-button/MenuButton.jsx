import clsx from 'clsx';

import { Button } from '@/shared/ui';

import s from './menu-button.module.scss';

export const MenuButton = ({ onClick, icon, text, count, isActive }) => {
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
