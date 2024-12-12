import { useState } from 'react';
import { FC } from 'react';

import s from './checkbox.module.scss';

interface ICheckbox {
	label?: string;
	isChecked?: boolean;
	onChange?: () => void;
}

export const Checkbox: FC<ICheckbox> = ({ onChange, label, isChecked = false }) => {
	const [isActive, setActive] = useState(isChecked);

	const handleChange = () => {
		if (isChecked) {
			setActive(prevActive => !prevActive);
		}
	};

	return (
		<>
			{label ? (
				<label className={s.checkboxWrapper}>
					<input
						checked={isChecked}
						onChange={onChange ? onChange : handleChange}
						className={s.checkbox}
						type='checkbox'
					/>
					<p>{label}</p>
				</label>
			) : (
				<input checked={isChecked} onChange={handleChange} className={s.checkbox} type='checkbox' />
			)}
		</>
	);
};
