import clsx from 'clsx';

import { IAddresses, ResultsType } from '@/shared/types';
import { Dropdown } from '@/shared/ui';

import s from './search-dropdown.module.scss';

interface IListItem {
	title: {
		text: string;
	};
	subtitle?: {
		text: string;
	};
}

interface ISearchDropdownProps {
	list: {
		results: ResultsType[] | undefined;
	};
	handleSelectAddress: (title: string, subtitle: string) => void;
	isActive: boolean;
}

export const SearchDropdown: React.FC<ISearchDropdownProps> = ({
	list,
	handleSelectAddress,
	isActive
}) => {
	const dropdownClass = clsx(s.dropdown, { [s.active]: isActive });

	return (
		<Dropdown className={dropdownClass}>
			{list?.results ? (
				<>
					{list.results.map((item, index) => (
						<div
							key={index}
							className={s.searchItem}
							onClick={() =>
								handleSelectAddress(item.title.text, item.subtitle ? item.subtitle.text : '')
							}
						>
							<p>{item.title.text}</p>
							{item.subtitle ? <span>{item.subtitle.text}</span> : null}
						</div>
					))}
				</>
			) : null}
		</Dropdown>
	);
};
