import { Button, MinusIcon, PlusIcon } from '@/shared/ui';

import s from './stepper.module.scss';

export const Stepper = ({ incZoom, decZoom }) => {
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
