import s from './radio.module.scss';

export const Radio = ({ name, label, onChange, field }) => {
	return (
		<label className={s.radio}>
			<input type='radio' name={name} onChange={onChange} {...field} />
			<p>{label}</p>
		</label>
	);
};
