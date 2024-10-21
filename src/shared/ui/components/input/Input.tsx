import { FormEvent, ReactElement } from 'react';
import { FieldValues, Path, UseFormRegister } from 'react-hook-form';

import clsx from 'clsx';

import { FieldType } from '@/shared/types';

import s from './input.module.scss';

interface IInput<T extends FieldValues> {
	placeholder: string;
	value?: string;
	field?: FieldType & { id: string };
	register?: UseFormRegister<T>;
	id?: Path<T>;
	onChange?: (e: FormEvent<HTMLInputElement>) => void;
	isStyled?: boolean;
	onFocus?: () => void;
	onBlur?: () => void;
}

export const Input = <T extends FieldValues>({
	placeholder,
	value,
	field,
	register,
	id,
	onChange,
	isStyled,
	onFocus,
	onBlur
}: IInput<T>): ReactElement => {
	const inputClass = clsx(s.input, { [s.styled]: isStyled });

	return (
		<>
			{field ? (
				<input
					type='text'
					className={inputClass}
					placeholder={placeholder}
					name={field.name}
					value={field.value}
					onChange={field.onChange}
					onBlur={field.onBlur}
				/>
			) : register && id ? (
				<input
					type='text'
					className={inputClass}
					placeholder={placeholder}
					value={value}
					{...register(id)} // This is now correct as id is of type Path<T>
					onChange={onChange}
					onFocus={onFocus}
					onBlur={onBlur}
				/>
			) : (
				<input
					type='text'
					className={inputClass}
					placeholder={placeholder}
					onChange={onChange}
					value={value}
					onFocus={onFocus}
					onBlur={onBlur}
				/>
			)}
		</>
	);
};
