import { FC, ReactElement } from 'react';

import clsx from 'clsx';

import { Button } from '@/shared/ui';

import s from './accordion.module.scss';

interface IAccordion {
	isShow: boolean;
	onClick?: () => void;
	title: ReactElement;
	content: ReactElement;
}

export const Accordion: FC<IAccordion> = ({ isShow, onClick, title, content }) => {
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
