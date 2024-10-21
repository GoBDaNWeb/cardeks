import { FC } from 'react';

import { IAddresses } from '@/shared/types';
import { Dropdown } from '@/shared/ui';

import s from './search-dropdown.module.scss';

interface ISearchDropdown {
	list?: IAddresses;
	handleSeletAddress: (address: string, subtitle: string) => void;
}

export const SearchDropdown: FC<ISearchDropdown> = ({ list, handleSeletAddress }) => {
	return (
		<Dropdown>
			{list?.results ? (
				<>
					{list.results.map((item, index) => (
						<div
							key={index}
							className={s.searchItem}
							onClick={() =>
								handleSeletAddress(item.title.text, item.subtitle ? item.subtitle.text : '')
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
