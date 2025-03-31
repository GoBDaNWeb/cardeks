import { FC, useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';

import { setRelatedProducts as handleSetRelatedProducts, setAddServices } from '@/widgets/filters';

import { useTypedSelector } from '@/shared/lib';
import { Chip } from '@/shared/ui';

import { addServicesTireList } from '../../config';
import { AZSFilters } from '../azs-filters';
import s from '../filters-list.module.scss';
import { WashFilters } from '../wash-filters';

interface IFilters {
	withoutServices?: boolean;
	resetFilters?: boolean;
	selectedFilter?: number;
	handleAddServices?: (service: string) => void;
	services?: string[];
}

export const TireFilters: FC<IFilters> = ({ withoutServices, handleAddServices, services }) => {
	const { filters } = useTypedSelector(store => store.filters);
	const [relatedProduct, setRelatedProducts] = useState<boolean>(filters.relatedProducts || false);

	const dispatch = useDispatch();
	const hadleSetRelatedProducts = () => {
		setRelatedProducts(prev => !prev);
	};
	useEffect(() => {
		dispatch(handleSetRelatedProducts(relatedProduct));
	}, [relatedProduct, dispatch]);
	useEffect(() => {
		if (services) {
			if (services.length > 0) {
				dispatch(setAddServices([...services, 'tire']));
			} else {
				dispatch(setAddServices([...services]));
			}
		}
	}, [services, dispatch]);

	return (
		<div className={s.filtersContent}>
			{withoutServices ? null : (
				<>
					<div className={s.filterRow}>
						<p>Дополнительные услуги</p>
						<div className={s.inputList}>
							{addServicesTireList.map(service => (
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
					{services?.includes('washing') ? <WashFilters withoutServices /> : null}
				</>
			)}
		</div>
	);
};
