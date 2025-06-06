import { FC, FormEvent } from 'react';

import { Button, CloseIcon, EnterIcon, Input, SearchIcon } from '@/shared/ui';

import s from './search-input.module.scss';

interface ISearchInput {
	onChange: (e: FormEvent<HTMLInputElement>) => void;
	value: string;
	handleSearchAddress: () => void;
	handleBuildRoute: () => void;
	handleClearValue: () => void;
	handleFocus: () => void;
	handleBlur: () => void;
}

export const SearchInput: FC<ISearchInput> = ({
	onChange,
	value,
	handleSearchAddress,
	handleClearValue,
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
				{value.length > 0 ? (
					<Button onClick={handleClearValue}>
						<CloseIcon />
					</Button>
				) : null}

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
