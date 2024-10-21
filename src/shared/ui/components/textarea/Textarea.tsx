import { FC } from 'react';

import clsx from 'clsx';

import s from './textarea.module.scss';

interface ITextarea {
	placeholder: string;
	className?: string;
}

export const Textarea: FC<ITextarea> = ({ placeholder, className }) => {
	const textareaClass = clsx(s.textarea, className);

	return <textarea className={textareaClass} placeholder={placeholder}></textarea>;
};
