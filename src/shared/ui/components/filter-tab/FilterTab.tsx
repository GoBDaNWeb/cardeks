import { FC, ReactElement } from 'react';

import clsx from 'clsx';

import { Button } from '@/shared/ui';

import s from './filter-tab.module.scss';

interface IFilterTab {
	onClick: () => void;
	title: string;
	viewCount: string;
	totalCount: string;
	icon: ReactElement;
	isActive?: boolean;
}

export const FilterTab: FC<IFilterTab> = ({
	onClick,
	title,
	viewCount,
	totalCount,
	icon,
	isActive
}) => {
	const filterTabClass = clsx(s.filterTab, { [s.active]: isActive });

	return (
		<Button onClick={onClick} className={filterTabClass}>
			<div className={s.content}>
				<p className={s.title}>{title}</p>
				<p className={s.count}>
					{viewCount} <span>({totalCount})</span>
				</p>
			</div>
			<div className={s.icon}>{icon}</div>
		</Button>
	);
};
