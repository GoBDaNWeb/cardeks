import { Button, EnterIcon, Input, SearchIcon } from '@/shared/ui';

import s from './search-input.module.scss';

export const SearchInput = () => {
	return (
		<div className={s.searchInput}>
			<Input placeholder='Регион, город, улица, трасса' />
			<div className={s.icons}>
				<Button>
					<SearchIcon />
				</Button>
				<Button>
					<EnterIcon />
				</Button>
			</div>
		</div>
	);
};
