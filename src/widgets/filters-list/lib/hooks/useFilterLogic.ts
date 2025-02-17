import { FormEvent, useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';

import { setAddServices, setBrandTitles, setFuelFilters, setGateHeight } from '@/widgets/filters';

import { useDebounce, useTypedSelector } from '@/shared/lib';
import { IList } from '@/shared/types';

export const useFiltersLogic = (withoutServices: boolean, type: string) => {
	const dispatch = useDispatch();
	const { filtersIsOpen } = useTypedSelector(store => store.filters);

	const [services, setServices] = useState<string[]>([]);
	const [gateHeights, setGateHeights] = useState<number | null>(null);
	const [inputBrandValue, setInputBrandValue] = useState('');
	const [fuels, setFuels] = useState<IList[]>([]);

	const debounced = useDebounce(inputBrandValue);

	const handleAddServices = (service: string) => {
		setServices(prev => {
			const isSet = prev.includes(service);
			return isSet ? prev.filter(item => item !== service) : [...prev, service];
		});
	};

	const handleAddGate = (height: number) =>
		setGateHeights(prev => (prev === height ? null : height));

	const handleSetFuels = (fuel: IList) => {
		setFuels(prev => {
			const isSet = prev.some(item => item.value === fuel.value);
			return isSet ? prev.filter(item => item.value !== fuel.value) : [...prev, fuel];
		});
	};

	const handleChangeInputValue = (e: FormEvent<HTMLInputElement>) => {
		setInputBrandValue((e.target as HTMLTextAreaElement).value);
	};

	useEffect(() => {
		if (!withoutServices && type === 'washing') {
			dispatch(setAddServices(services.length > 0 ? [...services, 'washing'] : []));
		}
	}, [services, dispatch, withoutServices]);

	useEffect(() => {
		dispatch(setGateHeight(gateHeights));
	}, [gateHeights, dispatch]);

	useEffect(() => {
		dispatch(setBrandTitles(inputBrandValue));
	}, [debounced, dispatch]);

	useEffect(() => {
		dispatch(setFuelFilters(fuels));
	}, [fuels, dispatch]);

	useEffect(() => {
		if (!withoutServices && type === 'azs') {
			dispatch(setAddServices(services.length > 0 ? [...services, 'azs'] : []));
		}
	}, [services, dispatch, withoutServices]);

	useEffect(() => {
		if (!withoutServices && type === 'tire') {
			dispatch(setAddServices(services.length > 0 ? [...services, 'tire'] : []));
		}
	}, [services, dispatch, withoutServices]);

	useEffect(() => {
		if (filtersIsOpen) {
			setServices([]);
			setGateHeights(null);
			setInputBrandValue('');
			setFuels([]);
			// dispatch(setBrandTitles(''));
			dispatch(setFuelFilters([]));
			dispatch(setAddServices([]));
		}
	}, [filtersIsOpen, dispatch]);

	return {
		services,
		gateHeights,
		inputBrandValue,
		fuels,
		handleAddServices,
		handleAddGate,
		handleSetFuels,
		handleChangeInputValue
	};
};
