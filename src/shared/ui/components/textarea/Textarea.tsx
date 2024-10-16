import { FC } from 'react';

import clsx from 'clsx';

import s from './textarea.module.scss';

type TextareaType = {
	placeholder: string;
	className?: string;
};

export const Textarea: FC<TextareaType> = ({ placeholder, className }) => {
	const textareaClass = clsx(s.textarea, className);

	return <textarea className={textareaClass} placeholder={placeholder}></textarea>;
};
