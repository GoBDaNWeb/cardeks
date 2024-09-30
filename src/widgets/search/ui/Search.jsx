import { SearchInput } from '@/shared/ui';

import s from './search.module.scss';

export const Search = () => {
	return (
		<div className={s.searchWrapper}>
			<SearchInput />
		</div>
	);
};
