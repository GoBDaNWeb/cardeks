import { FC, PropsWithChildren } from 'react';

import clsx from 'clsx';

import s from './badge.module.scss';

interface IBadge {
	className: string;
}

export const Badge: FC<PropsWithChildren<IBadge>> = ({ children, className }) => {
	const badgeClass = clsx(s.badge, className);

	return <div className={badgeClass}>{children}</div>;
};
