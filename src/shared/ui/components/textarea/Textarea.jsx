import clsx from 'clsx';

import s from './textarea.module.scss';

export const Textarea = ({ placeholder, className }) => {
	const textareaClass = clsx(s.textarea, className);

	return <textarea className={textareaClass} placeholder={placeholder}></textarea>;
};
