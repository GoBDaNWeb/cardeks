import { FC, PropsWithChildren } from 'react';

import clsx from 'clsx';

import { Button } from '@/shared/ui';

import s from './chip.module.scss';

type ChipType = {
	isActive?: boolean;
	onClick: () => void;
};

export const Chip: FC<PropsWithChildren<ChipType>> = ({ children, isActive, onClick }) => {
	const chipClass = clsx(s.chip, { [s.active]: isActive });

	return (
		<Button onClick={onClick} className={chipClass}>
			{children}
		</Button>
	);
};
