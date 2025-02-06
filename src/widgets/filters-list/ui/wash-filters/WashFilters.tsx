import { FC, useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';

import { setAddServices, setGateHeight } from '@/widgets/filters';

import { useTypedSelector } from '@/shared/lib';
import { Chip } from '@/shared/ui';

import { addServicesWashingList, gateHeightList } from '../../config';
import { AZSFilters } from '../azs-filters';
import s from '../filters-list.module.scss';
import { TireFilters } from '../tire-filters';

interface IFilters {
	withoutServices?: boolean;
	resetFilters?: boolean;
}
export const WashFilters: FC<IFilters> = ({ withoutServices, resetFilters }) => {
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
		setServices([]);
		setGateHeights(null);
	}, [resetFilters]);

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
