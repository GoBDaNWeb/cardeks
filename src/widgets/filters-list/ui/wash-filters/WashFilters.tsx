import { FC, useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';

import {
	setRelatedProducts as handleSetRelatedProducts,
	setAddServices,
	setGateHeight
} from '@/widgets/filters';

import { useTypedSelector } from '@/shared/lib';
import { Chip } from '@/shared/ui';

import { addServicesWashingList, gateHeightList } from '../../config';
import { AZSFilters } from '../azs-filters';
import s from '../filters-list.module.scss';
import { TireFilters } from '../tire-filters';

interface IFilters {
	withoutServices?: boolean;
	resetFilters?: boolean;
	selectedFilter?: number;
	handleAddServices?: (service: string) => void;
	services?: string[];
}
export const WashFilters: FC<IFilters> = ({ withoutServices, handleAddServices, services }) => {
	const { clearFilters, filters } = useTypedSelector(store => store.filters);
	const [gateHeights, setGateHeights] = useState<number | null>(filters.gateHeight);
	const [relatedProduct, setRelatedProducts] = useState<boolean>(filters.relatedProducts || false);

	const dispatch = useDispatch();

	const handleAddGate = (height: number) => {
		if (gateHeights === height) {
			setGateHeights(null);
		} else {
			setGateHeights(height);
		}
	};

	const hadleSetRelatedProducts = () => {
		setRelatedProducts(prev => !prev);
	};
	useEffect(() => {
		dispatch(handleSetRelatedProducts(relatedProduct));
	}, [relatedProduct, dispatch]);

	useEffect(() => {
		if (services) {
			if (services.length > 0) {
				dispatch(setAddServices([...services, 'washing']));
			} else {
				dispatch(setAddServices([...services]));
			}
		}
	}, [services, dispatch]);
	useEffect(() => {
		dispatch(setGateHeight(gateHeights));
	}, [gateHeights, dispatch]);

	useEffect(() => {
		if (clearFilters) {
			dispatch(setAddServices([]));
			dispatch(setGateHeight(null));
		}
	}, [clearFilters]);

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

			{withoutServices ? null : (
				<>
					<div className={s.filterRow}>
						<p>Дополнительные услуги</p>
						<div className={s.inputList}>
							{addServicesWashingList.map(service => (
								<Chip
									key={service.value}
									isActive={services?.includes(service.value)}
									onClick={() => handleAddServices?.(service.value)}
								>
									{service.title}
								</Chip>
							))}
							<Chip isActive={relatedProduct} onClick={() => hadleSetRelatedProducts()}>
								Сопутствующие товары
							</Chip>
						</div>
					</div>
					{services?.includes('azs') ? <AZSFilters withoutServices /> : null}
					{services?.includes('tire') ? <TireFilters withoutServices /> : null}
				</>
			)}
		</div>
	);
};
