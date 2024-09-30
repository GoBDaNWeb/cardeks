import clsx from 'clsx';

import { Button } from '@/shared/ui';

import s from './chip.module.scss';

export const Chip = ({ children, isActive, onClick }) => {
	const chipClass = clsx(s.chip, { [s.active]: isActive });

	return (
		<Button onClick={onClick} className={chipClass}>
			{children}
		</Button>
	);
};
