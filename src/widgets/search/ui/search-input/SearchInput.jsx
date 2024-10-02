import { Button, EnterIcon, Input, SearchIcon } from '@/shared/ui';

import s from './search-input.module.scss';

export const SearchInput = ({
	onChange,
	value,
	handleSearchAddress,
	handleBuildRoute,
	handleFocus,
	handleBlur
}) => {
	return (
		<div className={s.searchInput}>
			<Input
				placeholder='Регион, город, улица, трасса'
				onChange={onChange}
				value={value}
				onFocus={() => handleFocus()}
				onBlur={() => handleBlur()}
			/>
			<div className={s.icons}>
				<Button onClick={handleSearchAddress}>
					<SearchIcon />
				</Button>
				<Button onClick={handleBuildRoute}>
					<EnterIcon />
				</Button>
			</div>
		</div>
	);
};
