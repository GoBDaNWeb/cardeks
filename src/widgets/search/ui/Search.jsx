import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { setActiveMenu } from '@/widgets/menu-list';

import {
	setAddress,
	setBuildSearch,
	setCurrentPointId,
	setSearch,
	setSearchValue
} from '@/entities/map';

import { useGetAddressesQuery } from '@/shared/api';
import { useDebounce } from '@/shared/lib';

import { SearchDropdown } from './search-dropdown';
import { SearchInput } from './search-input';
import s from './search.module.scss';

export const Search = () => {
	const [searchData, setSearchData] = useState('');
	const [selectedAddress, setSelectedAddress] = useState('');
	const [dropdownOpen, setDropdownOpen] = useState(true);
	const [inputValue, setInvputValue] = useState('');

	const dispatch = useDispatch();
	const debounced = useDebounce(inputValue);
	const { activeMenu } = useSelector(store => store.menu);
	const { data } = useGetAddressesQuery(searchData);

	const handleFocus = () => {
		setTimeout(() => {
			setDropdownOpen(true);
		}, 200);
	};
	const handleBlur = () => {
		setTimeout(() => {
			setDropdownOpen(false);
		}, 200);
	};

	const handleSeletAddress = (address, subtitle) => {
		subtitle ? setSelectedAddress(`${address} ${subtitle}`) : setSelectedAddress(address);
		setDropdownOpen(false);
	};

	const handleChangeInputValue = e => {
		setInvputValue(e.target.value);
		setDropdownOpen(true);
	};

	const handleSearchAddress = () => {
		if (inputValue.length > 0) {
			dispatch(setSearch(true));
			dispatch(setSearchValue(inputValue));
		}
		setTimeout(() => {
			dispatch(setSearch(false));
		}, 300);
	};

	const handleBuildRouteWithSearch = () => {
		dispatch(setActiveMenu('route'));
		if (inputValue.length > 0 && activeMenu !== 'route') {
			dispatch(setSearchValue(inputValue));
			dispatch(setBuildSearch(true));
			dispatch(setCurrentPointId('points.1.inputText'));
			dispatch(setAddress(inputValue));
			setTimeout(() => {
				dispatch(setBuildSearch(false));
			}, 300);
		}
	};

	useEffect(() => {
		setInvputValue(selectedAddress);
	}, [selectedAddress]);

	useEffect(() => {
		setSearchData(inputValue);
	}, [debounced]);

	return (
		<div className={s.searchWrapper}>
			<SearchInput
				onChange={handleChangeInputValue}
				value={inputValue}
				handleSearchAddress={() => handleSearchAddress()}
				handleBuildRoute={() => handleBuildRouteWithSearch()}
				handleFocus={handleFocus}
				handleBlur={handleBlur}
			/>
			{data?.results && dropdownOpen ? (
				<SearchDropdown list={data} handleSeletAddress={handleSeletAddress} />
			) : null}
		</div>
	);
};
