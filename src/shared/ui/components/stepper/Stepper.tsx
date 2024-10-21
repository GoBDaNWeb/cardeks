import { FC } from 'react';

import { Button, MinusIcon, PlusIcon } from '@/shared/ui';

import s from './stepper.module.scss';

interface IStepper {
	incZoom: () => void;
	decZoom: () => void;
}

export const Stepper: FC<IStepper> = ({ incZoom, decZoom }) => {
	return (
		<div className={s.stepper}>
			<Button onClick={incZoom} variant='icon'>
				<PlusIcon />
			</Button>
			<div className={s.line}></div>
			<Button onClick={decZoom} variant='icon'>
				<MinusIcon />
			</Button>
		</div>
	);
};
