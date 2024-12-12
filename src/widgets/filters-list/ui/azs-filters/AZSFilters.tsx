import { FC, FormEvent, useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';

import { setAddServices, setBrandTitle, setFuelFilters, setGateHeight } from '@/widgets/filters';

import { useDebounce, useTypedSelector } from '@/shared/lib';
import { IList } from '@/shared/types';
import { Chip, Input } from '@/shared/ui';

import { addServicesAzsList, fuelList } from '../../config';
import s from '../filters-list.module.scss';
import { TireFilters } from '../tire-filters';
import { WashFilters } from '../wash-filters';

interface IFilters {
	withoutServices?: boolean;
}

export const AZSFilters: FC<IFilters> = ({ withoutServices }) => {
	const [inputBrandValue, setInputBrandValue] = useState('');
	const [fuels, setFuels] = useState<IList[]>([]);
	const [services, setServices] = useState<string[]>([]);
	const { filtersIsOpen } = useTypedSelector(store => store.filters);

	const dispatch = useDispatch();
	const debounced = useDebounce(inputBrandValue);

	const handleSetFuels = (fuel: IList) => {
		setFuels(prevFuels => {
			const isSet = prevFuels.some(item => item.value === fuel.value);
			const newFuels = isSet
				? prevFuels.filter(item => item.value !== fuel.value)
				: [...prevFuels, fuel];
			return newFuels;
		});
	};
	const handleChangeInputValue = (e: FormEvent<HTMLInputElement>) => {
		setInputBrandValue((e.target as HTMLTextAreaElement).value);
	};

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
		dispatch(setBrandTitle(inputBrandValue));
	}, [debounced]);

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

	useEffect(() => {
		setFuels([]);
		setInputBrandValue('');
		dispatch(setBrandTitle(''));
		dispatch(setFuelFilters([]));
		dispatch(setAddServices([]));
		dispatch(setGateHeight(null));

		setServices([]);
	}, [filtersIsOpen]);

	return (
		<div className={s.filtersContent}>
			{/* <div className={s.filterRow}>
				<p>Основное</p>
				<Chip onClick={() => {}}>Сбросить счетчик PIN кода</Chip>
			</div> */}
			{/* <div className={s.filterRow}>
				<p>Карта</p>
				<Input isStyled placeholder='Номер или название' />
			</div> */}
			<div className={s.filterRow}>
				<p>Бренд</p>
				<Input
					onChange={handleChangeInputValue}
					value={inputBrandValue}
					isStyled
					placeholder='Номер или название'
				/>
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
