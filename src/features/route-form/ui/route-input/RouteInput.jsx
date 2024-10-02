import { Button, CloseIcon, EnterIcon, Input, SearchIcon } from '@/shared/ui';

import s from './route-input.module.scss';

export const RouteInput = ({
	letter,
	removeQuestion,
	register,
	id,
	fields,
	handleSelectAddress,
	onChange,
	handleFocus,
	handleBlur
}) => {
	return (
		<div className={s.routeInput}>
			<p className={s.letter}>{letter}</p>
			<Input
				id={id}
				register={register}
				placeholder='Регион, город, улица, трасса'
				onChange={onChange}
				onFocus={() => handleFocus()}
				onBlur={() => handleBlur()}
			/>
			<div className={s.features}>
				{fields.length > 2 ? (
					<Button onClick={removeQuestion}>
						<CloseIcon />
					</Button>
				) : null}

				<Button onClick={handleSelectAddress}>
					<SearchIcon />
				</Button>
				<Button>
					<EnterIcon />
				</Button>
			</div>
		</div>
	);
};
