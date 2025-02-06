import { FC, useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';

import { setAddServices, setGateHeight } from '@/widgets/filters';

import { useTypedSelector } from '@/shared/lib';
import { Chip } from '@/shared/ui';

import { addServicesTireList } from '../../config';
import { AZSFilters } from '../azs-filters';
import s from '../filters-list.module.scss';
import { WashFilters } from '../wash-filters';

interface IFilters {
	withoutServices?: boolean;
	resetFilters?: boolean;
}

export const TireFilters: FC<IFilters> = ({ withoutServices, resetFilters }) => {
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
		setServices([]);
	}, [resetFilters]);

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
