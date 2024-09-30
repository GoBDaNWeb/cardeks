import clsx from 'clsx';

import s from './badge.module.scss';

export const Badge = ({ children, className }) => {
	const badgeClass = clsx(s.badge, className);

	return <div className={badgeClass}>{children}</div>;
};
