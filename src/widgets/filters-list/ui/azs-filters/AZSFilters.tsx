import { FC, FormEvent, useCallback, useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';

import clsx from 'clsx';

import {
	setAddServices,
	setBrandTitles,
	setFeatures,
	setFuelFilters,
	setGateHeight,
	setSelectedFilter
} from '@/widgets/filters';

import { azsMainFilters, fuelList } from '@/shared/config';
import { getQueryParams, useIndexedDB, useTypedSelector } from '@/shared/lib';
import { IList } from '@/shared/types';
import { Chip, Dropdown, Input } from '@/shared/ui';

import { addServicesAzsList } from '../../config';
import s from '../filters-list.module.scss';
import { TireFilters } from '../tire-filters';
import { WashFilters } from '../wash-filters';

interface IFilters {
	withoutServices?: boolean;
	resetFilters?: boolean;
	selectedFilter?: number;
	handleAddServices?: (service: string) => void;
	services?: string[];
}

export const AZSFilters: FC<IFilters> = ({
	withoutServices,
	resetFilters,
	selectedFilter,
	handleAddServices,
	services
}) => {
	const { filters, filtersIsOpen, clearFilters } = useTypedSelector(store => store.filters);

	// const { addServicesParam, selectedFilterParam } = getQueryParams();
	// const [inputBrandValue, setInputBrandValue] = useState('');
	const [fuels, setFuels] = useState<IList[]>(filters.fuelFilters);
	const [features, setMainFeatures] = useState<IList[]>(filters.features);
	// const [services, setServices] = useState<string[]>(addServicesParam ? addServicesParam : []);
	// const [currentBrands, setCurrentBrands] = useState<string[]>([]);
	const [dataBrands, setDataBrands] = useState<string[]>([]);
	// const [filteredBrands, setFilteredBrands] = useState<string[]>([]);
	// const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
	// const [activeBrand, setActiveBrand] = useState(0);
	const [dropdownActive, setDropdownActive] = useState(false);
	const dispatch = useDispatch();

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

	// Обработчик добавления/удаления услуги
	// const handleAddServices = (service: string) => {
	// 	setServices(prevServices => {
	// 		const isSet = prevServices.some(item => item === service);
	// 		const newFuels = isSet
	// 			? prevServices.filter(item => item !== service)
	// 			: [...prevServices, service];
	// 		return newFuels;
	// 	});
	// };

	useEffect(() => {
		if (clearFilters) {
			// setInputBrandValue('');
			setFuels([]);
			setMainFeatures([]);
			// setServices([]);
			// setCurrentBrands([]);
			// setFilteredBrands([]);
			// // setSelectedBrands([]);
			// setActiveBrand(0);
			setDropdownActive(false);
		}
	}, [clearFilters]);

	useEffect(() => {
		dispatch(setFeatures(features));
	}, [features, dispatch]);

	useEffect(() => {
		dispatch(setFuelFilters(fuels));
	}, [fuels, dispatch]);

	useEffect(() => {
		if (services) {
			if (services.length > 0) {
				dispatch(setAddServices([...services, 'azs']));
			} else {
				dispatch(setAddServices([...services]));
			}
		}
	}, [services, dispatch]);

	// useEffect(() => {
	// 	dispatch(setBrandTitles(selectedBrands));
	// }, [selectedBrands]);

	// useEffect(() => {
	// 	if (filtersIsOpen) {
	// 		dispatch(setAddServices([]));
	// 		setServices([]);
	// 	}
	// }, [selectedFilter, filtersIsOpen]);

	// useEffect(() => {
	// 	setInputBrandValue('');
	// 	if (dataBrands) {
	// 		setFilteredBrands(dataBrands);
	// 		setCurrentBrands(dataBrands);
	// 	}
	// }, [filtersIsOpen]);

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
									isActive={services?.includes(service.value)}
									onClick={() => handleAddServices?.(service.value)}
								>
									{service.title}
								</Chip>
							))}
						</div>
					</div>
					{services?.includes('washing') ? <WashFilters withoutServices /> : null}
					{services?.includes('tire') ? <TireFilters withoutServices /> : null}
				</>
			)}
		</div>
	);
};
