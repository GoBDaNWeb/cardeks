import { FC, PropsWithChildren } from 'react';

import clsx from 'clsx';

import { Button } from '@/shared/ui';

import s from './chip.module.scss';

interface IChip {
	isActive?: boolean;
	onClick: () => void;
	title?: string;
}

export const Chip: FC<PropsWithChildren<IChip>> = ({ children, isActive, onClick, title }) => {
	const chipClass = clsx(s.chip, { [s.active]: isActive });

	return (
		<Button onClick={onClick} className={chipClass} title={title}>
			{children}
		</Button>
	);
};
