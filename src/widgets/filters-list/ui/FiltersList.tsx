import { FC, FormEvent, useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';

import clsx from 'clsx';

import {
	setAddServices,
	setBrandTitle,
	setFuelFilters,
	setGateHeight,
	setOpenFilters
} from '@/widgets/filters';

import { useDebounce, useTypedSelector } from '@/shared/lib';
import { IList } from '@/shared/types';
import { ArrowTopIcon, Button, Chip, CloseIcon, Input } from '@/shared/ui';

import {
	addServicesAzsList,
	addServicesTireList,
	addServicesWashingList,
	fuelList,
	gateHeightList
} from '../config';

import s from './filters-list.module.scss';

interface IFilters {
	withoutServices?: boolean;
}

const WashFilters: FC<IFilters> = ({ withoutServices }) => {
	const [services, setServices] = useState<string[]>([]);
	const [gateHeights, setGateHeights] = useState<number | null>(null);

	const dispatch = useDispatch();
	const { filtersIsOpen } = useTypedSelector(store => store.filters);

	const handleAddServices = (service: string) => {
		setServices(prevServices => {
			const isSet = prevServices.some(item => item === service);
			const newServices = isSet
				? prevServices.filter(item => item !== service)
				: [...prevServices, service];
			return newServices;
		});
	};

	const handleAddGate = (height: number) => {
		if (gateHeights === height) {
			setGateHeights(null);
		} else {
			setGateHeights(height);
		}
	};

	useEffect(() => {
		if (!withoutServices) {
			if (services.length > 0) {
				dispatch(setAddServices([...services, 'washing']));
			} else {
				dispatch(setAddServices([]));
			}
		}
	}, [services, dispatch]);
	useEffect(() => {
		if (gateHeights) {
			dispatch(setGateHeight(gateHeights));
		} else {
			dispatch(setGateHeight(null));
		}
	}, [gateHeights, dispatch]);

	useEffect(() => {
		dispatch(setAddServices([]));
		dispatch(setGateHeight(null));
		setServices([]);
	}, [filtersIsOpen]);

	return (
		<div className={s.filtersContent}>
			<div className={s.filterRow}>
				<p>Вмещает машины</p>
				<div className={s.inputList}>
					{gateHeightList.map(gate => (
						<Chip
							isActive={gateHeights === gate.value}
							onClick={() => handleAddGate(gate.value)}
							key={gate.title}
						>
							{gate.title}
						</Chip>
					))}
				</div>
			</div>
			{/* <div className={s.filterRow}>
				<p>Параметры мойки</p>
				<div className={s.inputList}>
					<Chip onClick={() => {}}>Химчистка</Chip>
					<Chip onClick={() => {}}>Полировка</Chip>
					<Chip onClick={() => {}}>Мойка двигателя</Chip>
					<Chip onClick={() => {}}>Омыватель</Chip>
				</div>
			</div>

			<div className={s.filterRow}>
				<p>Выделить категории</p>
				<div className={s.inputList}>
					<Chip onClick={() => {}}>А</Chip>
					<Chip onClick={() => {}}>B</Chip>
					<Chip onClick={() => {}}>C</Chip>
				</div>
			</div> */}

			{withoutServices ? null : (
				<>
					<div className={s.filterRow}>
						<p>Дополнительные услуги</p>
						<div className={s.inputList}>
							{addServicesWashingList.map(service => (
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
					{services.includes('azs') ? <AZSFilters withoutServices /> : null}
					{services.includes('tire') ? <TireFilters withoutServices /> : null}
				</>
			)}
		</div>
	);
};
const TireFilters: FC<IFilters> = ({ withoutServices }) => {
	const [services, setServices] = useState<string[]>([]);

	const dispatch = useDispatch();
	const { filtersIsOpen } = useTypedSelector(store => store.filters);

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
		if (!withoutServices) {
			if (services.length > 0) {
				dispatch(setAddServices([...services, 'tire']));
			} else {
				dispatch(setAddServices([]));
			}
		}
	}, [services, dispatch]);

	useEffect(() => {
		dispatch(setAddServices([]));
		dispatch(setGateHeight(null));

		setServices([]);
	}, [filtersIsOpen]);

	return (
		<div className={s.filtersContent}>
			{/* <div className={s.filterRow}>
				<p>Параметры </p>
				<div className={s.inputList}>
					<Chip onClick={() => {}}>Легковой</Chip>
					<Chip onClick={() => {}}>Грузовой</Chip>
					<Chip onClick={() => {}}>Спецтехника</Chip>
				</div>
			</div> */}
			{/* <div className={s.filterRow}>
				<p>Услуги</p>
				<Chip onClick={() => {}}>Сезонное хранение шин</Chip>
			</div>
			<div className={s.filterRow}>
				<p>Выделить категории</p>
				<div className={s.inputList}>
					<Chip onClick={() => {}}>А</Chip>
					<Chip onClick={() => {}}>B</Chip>
					<Chip onClick={() => {}}>C</Chip>
				</div>
			</div> */}
			{withoutServices ? null : (
				<>
					<div className={s.filterRow}>
						<p>Дополнительные услуги</p>
						<div className={s.inputList}>
							{addServicesTireList.map(service => (
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
					{services.includes('azs') ? <AZSFilters withoutServices /> : null}
					{services.includes('washing') ? <WashFilters withoutServices /> : null}
				</>
			)}
		</div>
	);
};
const AZSFilters: FC<IFilters> = ({ withoutServices }) => {
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

const filters = [
	{
		title: 'АЗС / АГЗС',
		content: <AZSFilters />
	},
	{ title: 'Шиномонтаж', content: <TireFilters /> },
	{ title: 'Мойка', content: <WashFilters /> }
];

export const FiltersList = () => {
	const dispatch = useDispatch();

	const { selectedFilter, filtersIsOpen } = useTypedSelector(store => store.filters);
	const { activeMenu } = useTypedSelector(state => state.menu);

	const handleCloseFiltersList = () => {
		dispatch(setOpenFilters(false));
	};

	const filterListClass = clsx(s.filtersList, {
		[s.left]: activeMenu,
		[s.active]: filtersIsOpen
	});

	return (
		<div className={filterListClass}>
			<div className={s.filterListTop}>
				<h5>{filters[selectedFilter].title}</h5>
				<Button onClick={() => handleCloseFiltersList()} className={s.closeBtn}>
					<CloseIcon />
				</Button>
			</div>
			<div className={s.filterContentWrapper}>{filters[selectedFilter].content}</div>
			<div className={s.filterListBottom}>
				<Button onClick={() => handleCloseFiltersList()} className={s.closeBtn}>
					<ArrowTopIcon />
					<p>Свернуть</p>
				</Button>
			</div>
		</div>
	);
};
