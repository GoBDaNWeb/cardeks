import { FC } from 'react';

import { FieldType } from '@/shared/types';

import s from './radio.module.scss';

interface IRadio {
	name: string;
	label: string;
	onChange: () => void;
	field?: FieldType & { id: string };
}

export const Radio: FC<IRadio> = ({ name, label, onChange, field }) => {
	return (
		<label className={s.radio}>
			<input type='radio' {...field} name={name} onChange={onChange} />
			<p>{label}</p>
		</label>
	);
};
