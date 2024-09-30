import clsx from 'clsx';

import { Button } from '@/shared/ui';

import s from './accordion.module.scss';

export const Accordion = ({ isShow, onClick, title, content }) => {
	const accordionClass = clsx(s.accordion, { [s.active]: isShow });
	const contentClass = clsx(s.content, { [s.show]: isShow });

	return (
		<div className={accordionClass}>
			{onClick ? (
				<Button className={s.title} onClick={onClick}>
					{title}
				</Button>
			) : (
				<div className={s.title}>{title}</div>
			)}

			<div className={contentClass}>{content}</div>
		</div>
	);
};
