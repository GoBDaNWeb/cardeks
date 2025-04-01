import { FormEvent, useCallback, useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';

import clsx from 'clsx';

import { setBrandTitles } from '@/features/route-form';
import { setAzsTypes } from '@/features/route-form';

import { useIndexedDB, useTypedSelector } from '@/shared/lib';
import { IList } from '@/shared/types';
import { Chip, Dropdown, Input } from '@/shared/ui';

import { addChipsList } from '../../config';

import s from './route-filters.module.scss';

export const RouteFilters = () => {
	const [inputBrandValue, setInputBrandValue] = useState('');
	const [azsType, setAzsType] = useState<IList[]>([]);
	const [currentBrands, setCurrentBrands] = useState<string[]>([]);
	const [filteredBrands, setFilteredBrands] = useState<string[]>([]);
	const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
	const [activeBrand, setActiveBrand] = useState(0);
	const [dropdownActive, setDropdownActive] = useState(false);
	const [dataBrands, setDataBrands] = useState<string[]>([]);

	const { filterActive } = useTypedSelector(store => store.routeForm);
	const { activeMenu } = useTypedSelector(store => store.menu);
	const dispatch = useDispatch();

	const { getBrands } = useIndexedDB();

	const handleGetBradns = useCallback(async () => {
		const brands = await getBrands();
		setDataBrands(brands);
	}, [getBrands]);

	useEffect(() => {
		handleGetBradns();
	}, [filterActive]);

	const handleChangeInputValue = (e: FormEvent<HTMLInputElement>) => {
		const value = (e.target as HTMLInputElement).value;
		setInputBrandValue(value);
		setActiveBrand(0);
		if (value.length === 0) {
			setCurrentBrands(filteredBrands);
		} else {
			const filterBrands = filteredBrands.filter((brand: string) => {
				return brand.toLowerCase().trim().includes(value.toLowerCase());
			});
			setCurrentBrands(filterBrands);
		}
	};

	// Обработчик добавления бренда в выбранные
	const handleSearchBrands = (brand: string) => {
		setSelectedBrands((prevBrands: string[]) => [...prevBrands, brand]);
		setFilteredBrands((prevBrands: string[]) => prevBrands.filter(b => b !== brand));
		setInputBrandValue(''); // Очищаем поле ввода
		setDropdownActive(false); // Закрываем dropdown
		if (dataBrands) {
			setCurrentBrands(() => dataBrands.filter(b => b !== brand));
		}
	};

	// Обработчик удаления бренда из выбранных
	const handleRemoveBrand = (brand: string) => {
		setSelectedBrands((prevBrands: string[]) => prevBrands.filter(b => b !== brand));
		setFilteredBrands((prevBrands: string[]) => [...prevBrands, brand]);
		setCurrentBrands((prevBrands: string[]) => [...prevBrands, brand]);
	};

	const handleChangeChipActive = (type: IList) => {
		setAzsType(prevTypes => {
			const isSet = prevTypes.some(item => item.value === type.value);
			const newTyes = isSet
				? prevTypes.filter(item => item.value !== type.value)
				: [...prevTypes, type];
			return newTyes;
		});
	};
	const handleBlur = () => {
		setTimeout(() => {
			setDropdownActive(false);
		}, 150);
	};

	useEffect(() => {
		dispatch(setAzsTypes(azsType));
	}, [azsType, dispatch]);

	// Сброс фильтров при открытии/закрытии
	useEffect(() => {
		setInputBrandValue('');
		if (dataBrands) {
			setFilteredBrands(dataBrands);
			setCurrentBrands(dataBrands);
		}
		dispatch(setBrandTitles([]));
		setSelectedBrands([]);
	}, [activeMenu]);

	// Инициализация брендов при загрузке данных
	useEffect(() => {
		if (dataBrands) {
			setFilteredBrands(dataBrands);
			setCurrentBrands(dataBrands);
		}
	}, [dataBrands]);

	// useEffect(() => {
	// 	dispatch(setBrandTitles(selectedBrands));
	// }, [selectedBrands]);

	const dropdownClass = clsx(s.dropdown, { [s.active]: dropdownActive });
	const routeFiltersClass = clsx(s.routeFilters, { [s.active]: dropdownActive });

	return (
		<div className={routeFiltersClass}>
			<div className={s.filterRow}>
				<p className={s.title}>Бренд</p>
				<div className={s.brandWrapper}>
					<div className={s.chips}>
						{selectedBrands.map((brand: string) => (
							<Chip key={brand} onClick={() => handleRemoveBrand(brand)} isActive>
								{brand}
							</Chip>
						))}
					</div>
					<Input
						onChange={handleChangeInputValue}
						value={inputBrandValue}
						isStyled
						placeholder='Номер или название'
						onFocus={() => setDropdownActive(true)}
						onBlur={() => handleBlur()}
					/>

					<Dropdown className={dropdownClass}>
						{currentBrands.length > 0
							? currentBrands.map((brand: string, index: number) => (
									<div
										onMouseEnter={() => setActiveBrand(index)}
										className={`${s.brand} ${index === activeBrand ? s.active : ''}`}
										key={brand}
										onClick={() => handleSearchBrands(brand)}
									>
										{brand}
									</div>
								))
							: null}
					</Dropdown>
				</div>
			</div>
			<div className={s.filterRow}>
				<p className={s.title}>Дополнительные настройки</p>
				<div className={s.content}>
					{addChipsList.map(chip => (
						<Chip
							key={chip.title}
							onClick={() => handleChangeChipActive(chip)}
							isActive={azsType.some(f => f.value === chip.value)}
						>
							{chip.title}
						</Chip>
					))}
				</div>
			</div>
		</div>
	);
};
