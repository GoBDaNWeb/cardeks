import { FC, useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';

import { setAddServices, setFeatures, setFuelFilters } from '@/widgets/filters';

import { azsMainFilters, fuelList } from '@/shared/config';
import { useTypedSelector } from '@/shared/lib';
import { IList } from '@/shared/types';
import { Chip } from '@/shared/ui';

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

export const AZSFilters: FC<IFilters> = ({ withoutServices, handleAddServices, services }) => {
	const { filters, clearFilters } = useTypedSelector(store => store.filters);
	const [fuels, setFuels] = useState<IList[]>(filters.fuelFilters);
	const [features, setMainFeatures] = useState<IList[]>(filters.features);

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

	useEffect(() => {
		if (clearFilters) {
			setFuels([]);
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
							title={
								filter.value === 'canManageCards'
									? 'После сброса PIN-кода через поддержку по телефону или через личный кабинет, держателю карты необходимо предъявить карту на одной из этих точек обслуживания, попросить вставить карту в терминал и снять информационный чек или провести транзакцию. В завершении необходимо ввести корректный PIN-код.'
									: ''
							}
						>
							{filter.title}
						</Chip>
					))}
				</div>
			</div>
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
							<Chip
							// isActive={services?.includes(service.value)}
							// onClick={() => handleAddServices?.(service.value)}
							>
								Сопутствующие товары
							</Chip>
						</div>
					</div>
					{services?.includes('washing') ? <WashFilters withoutServices /> : null}
					{services?.includes('tire') ? <TireFilters withoutServices /> : null}
				</>
			)}
		</div>
	);
};
