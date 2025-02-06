import { FC, FormEvent, useCallback, useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';

import clsx from 'clsx';

import {
	setAddServices,
	setBrandTitles,
	setFeatures,
	setFuelFilters,
	setGateHeight
} from '@/widgets/filters';

import { azsMainFilters, fuelList } from '@/shared/config';
import { useIndexedDB, useTypedSelector } from '@/shared/lib';
import { IList } from '@/shared/types';
import { Chip, Dropdown, Input } from '@/shared/ui';

import { addServicesAzsList } from '../../config';
import s from '../filters-list.module.scss';
import { TireFilters } from '../tire-filters';
import { WashFilters } from '../wash-filters';

interface IFilters {
	withoutServices?: boolean;
	resetFilters?: boolean;
}

export const AZSFilters: FC<IFilters> = ({ withoutServices, resetFilters }) => {
	const [inputBrandValue, setInputBrandValue] = useState('');
	const [fuels, setFuels] = useState<IList[]>([]);
	const [features, setMainFeatures] = useState<IList[]>([]);
	const [services, setServices] = useState<string[]>([]);
	const [currentBrands, setCurrentBrands] = useState<string[]>([]);
	const [dataBrands, setDataBrands] = useState<string[]>([]);
	const [filteredBrands, setFilteredBrands] = useState<string[]>([]);
	const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
	const [activeBrand, setActiveBrand] = useState(0);
	const [dropdownActive, setDropdownActive] = useState(false);
	const { filtersIsOpen } = useTypedSelector(store => store.filters);

	const dispatch = useDispatch();
	const { getBrands } = useIndexedDB();

	const handleGetBradns = useCallback(async () => {
		const brands = await getBrands();
		setDataBrands(brands);
	}, [getBrands]);

	useEffect(() => {
		handleGetBradns();
	}, [filtersIsOpen]);

	// Обработчик выбора топлива
	const handleSetFuels = (fuel: IList) => {
		setFuels(prevFuels => {
			const isSet = prevFuels.some(item => item.value === fuel.value);
			const newFuels = isSet
				? prevFuels.filter(item => item.value !== fuel.value)
				: [...prevFuels, fuel];
			return newFuels;
		});
	};

	// Обработчик выбора основных фильтров
	const handleSetFeatures = (feature: IList) => {
		setMainFeatures(prevFeatures => {
			const isSet = prevFeatures.some(item => item.value === feature.value);
			const newFeatures = isSet
				? prevFeatures.filter(item => item.value !== feature.value)
				: [...prevFeatures, feature];
			return newFeatures;
		});
	};

	// Обработчик изменения значения в поле ввода бренда
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

	// Обработчик добавления/удаления услуги
	const handleAddServices = (service: string) => {
		setServices(prevServices => {
			const isSet = prevServices.some(item => item === service);
			const newFuels = isSet
				? prevServices.filter(item => item !== service)
				: [...prevServices, service];
			return newFuels;
		});
	};

	useEffect(() => {
		setInputBrandValue('');
		setFuels([]);
		setMainFeatures([]);

		setServices([]);
		setCurrentBrands([]);
		setFilteredBrands([]);
		setSelectedBrands([]);
		setActiveBrand(0);
		setDropdownActive(false);
	}, [resetFilters]);

	// Инициализация брендов при загрузке данных
	useEffect(() => {
		if (dataBrands) {
			setFilteredBrands(dataBrands);
			setCurrentBrands(dataBrands);
		}
	}, [dataBrands]);

	// Обновление фильтров в Redux
	useEffect(() => {
		dispatch(setFeatures(features));
	}, [features, dispatch]);

	// Обновление фильтров в Redux
	useEffect(() => {
		dispatch(setFuelFilters(fuels));
	}, [fuels, dispatch]);

	useEffect(() => {
		if (!withoutServices) {
			if (services.length > 0) {
				dispatch(setAddServices([...services, 'azs']));
			} else {
				dispatch(setAddServices([]));
			}
		}
	}, [services, dispatch]);

	// Сброс фильтров при открытии/закрытии
	useEffect(() => {
		setFuels([]);
		setMainFeatures([]);
		setInputBrandValue('');
		if (dataBrands) {
			setFilteredBrands(dataBrands);
			setCurrentBrands(dataBrands);
		}
		dispatch(setFeatures([]));

		dispatch(setBrandTitles([]));
		dispatch(setFuelFilters([]));
		dispatch(setAddServices([]));
		dispatch(setGateHeight(null));
		setSelectedBrands([]);
		setServices([]);
	}, [filtersIsOpen]);

	useEffect(() => {
		dispatch(setBrandTitles(selectedBrands));
	}, [selectedBrands]);

	// Закрытие dropdown при потере фокуса
	const handleBlur = () => {
		setTimeout(() => {
			setDropdownActive(false);
		}, 150);
	};

	const dropdownClass = clsx(s.dropdown, { [s.active]: dropdownActive });

	return (
		<div className={s.filtersContent}>
			<div className={s.filterRow}>
				<p>Основное</p>
				<div className={s.inputList}>
					{azsMainFilters.map(filter => (
						<Chip
							onClick={() => handleSetFeatures(filter)}
							key={filter.title}
							isActive={features.some(f => f.value === filter.value)}
						>
							{filter.title}
						</Chip>
					))}
				</div>
			</div>
			{/* <div className={s.filterRow}>
				<p>Карта</p>
				<Input isStyled placeholder='Номер или название' />
			</div> */}
			<div className={s.filterRow}>
				<p>Бренд</p>
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
			{/* <div className={s.filterRow}>
				<p>Выделить категории</p>
				<div className={s.inputList}>
					{['А', 'B', 'C'].map(category => (
						<Chip key={category} onClick={() => {}}>
							{category}
						</Chip>
					))}
				</div>
			</div> */}
			<div className={s.filterRow}>
				<p>Топливо</p>
				<div className={s.inputList}>
					{fuelList.map(fuel => (
						<Chip
							onClick={() => handleSetFuels(fuel)}
							key={fuel.title}
							isActive={fuels.some(f => f.value === fuel.value)}
						>
							{fuel.title}
						</Chip>
					))}
				</div>
			</div>
			{/* <div className={s.filterRow}>
				<p>Цена топлива, ₽</p>
				<div className={s.inputGrid}>
					<Input isStyled placeholder='От' />
					<Input isStyled placeholder='До' />
				</div>
			</div> */}
			{withoutServices ? null : (
				<>
					<div className={s.filterRow}>
						<p>Дополнительные услуги</p>
						<div className={s.inputList}>
							{addServicesAzsList.map(service => (
								<Chip
									key={service.value}
									isActive={services.includes(service.value)}
									onClick={() => handleAddServices(service.value)}
								>
									{service.title}
								</Chip>
							))}
						</div>
					</div>
					{services.includes('washing') ? <WashFilters withoutServices /> : null}
					{services.includes('tire') ? <TireFilters withoutServices /> : null}
				</>
			)}
		</div>
	);
};
