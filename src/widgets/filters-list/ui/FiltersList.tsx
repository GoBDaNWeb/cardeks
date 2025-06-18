import { FormEvent, useCallback, useEffect, useRef, useState } from 'react';
import React from 'react';
import { useDispatch } from 'react-redux';

import clsx from 'clsx';

import {
	setAddServices,
	setBrandTitles,
	setCard,
	setFeatures,
	setFuelFilters,
	setGateHeight,
	setOpenFilters,
	setRelatedProducts,
	setTerminal
} from '@/widgets/filters';
import { setActiveMenu } from '@/widgets/menu-list';

import { setActiveMenu as setActiveMobileMenu } from '@/entities/mobile-menu';

import { getQueryParams, useDebounce, useIndexedDB, useTypedSelector } from '@/shared/lib';
import { ArrowTopIcon, Button, Chip, CloseIcon, Input, SearchableDropdown } from '@/shared/ui';

import { cardsList } from '../config';

import { AZSFilters } from './azs-filters';
import s from './filters-list.module.scss';
import { TireFilters } from './tire-filters';
import { WashFilters } from './wash-filters';

const filters = [
	{
		title: 'АЗС / АГЗС',
		content: <AZSFilters />
	},
	{ title: 'Шиномонтаж', content: <TireFilters /> },
	{ title: 'Мойка', content: <WashFilters /> }
];

export const FiltersList = () => {
	const { addServicesParam } = getQueryParams();
	const { activeMenu: mobileActiveMenu } = useTypedSelector(store => store.mobileMenu);
	const { activeMenu } = useTypedSelector(state => state.menu);

	const {
		selectedFilter,
		filtersIsOpen,
		clearFilters,
		filters: { brandTitles, terminal, card }
	} = useTypedSelector(store => store.filters);

	const [inputTerminalValue, setInputTerminalValue] = useState(terminal);
	const debounced = useDebounce(inputTerminalValue);

	const [brandState, setBrandState] = useState({
		filteredBrands: [] as string[],
		selectedBrands: brandTitles as string[],
		inputBrandValue: '',
		currentBrands: brandTitles as string[],
		activeBrand: 0,
		dataBrands: [] as string[]
	});
	const [cardState, setCardState] = useState({
		filteredCards: [] as string[],
		selectedCard: card as string,
		inputCardValue: card,
		currentCards: [card] as string[],
		activeCard: 0,
		dataCards: [] as string[]
	});
	const [services, setServices] = useState<string[]>(addServicesParam ? addServicesParam : []);
	const prevSelectedFilter = useRef(selectedFilter);
	const dispatch = useDispatch();
	const { getBrands, isDbReady } = useIndexedDB();

	const updateBrandState = (newState: Partial<typeof brandState>) => {
		setBrandState(prev => ({ ...prev, ...newState }));
	};
	const updateCardState = (newState: Partial<typeof cardState>) => {
		setCardState(prev => ({ ...prev, ...newState }));
	};

	const handleGetBradns = useCallback(async () => {
		const brands = await getBrands();
		if (brandTitles) {
			const filterBrands = brands.filter(brand => {
				return !brandTitles.includes(brand);
			});
			updateBrandState({ dataBrands: filterBrands });

			return;
		} else {
			updateBrandState({ dataBrands: brands });
		}
	}, [getBrands]);

	const handleGetCards = useCallback(async () => {
		const cards = cardsList;
		if (card) {
			const filterCards = cards.filter(c => {
				return card !== c;
			});
			const currentCard = cards.find(c => {
				return card === c;
			});
			updateCardState({ filteredCards: filterCards });
			updateCardState({ currentCards: filterCards });
			updateCardState({ selectedCard: currentCard });
			updateCardState({ inputCardValue: currentCard });

			return;
		} else {
			updateCardState({ dataCards: cards });
		}
	}, [filtersIsOpen]);

	const handleCloseFiltersList = () => {
		dispatch(setOpenFilters(false));
		if (window.innerWidth <= 767) {
			if (mobileActiveMenu !== 'route') {
				dispatch(setActiveMenu('filters'));
				dispatch(setActiveMobileMenu('filters'));
			} else {
				dispatch(setActiveMobileMenu('route'));
				dispatch(setActiveMenu('route'));
			}
		}
	};

	const handleChangeTerminalInputValue = (e: FormEvent<HTMLInputElement>) => {
		const value = (e.target as HTMLInputElement).value;
		setInputTerminalValue(value);
	};

	useEffect(() => {
		dispatch(setTerminal(debounced));
	}, [debounced]);

	const handleChangeInputBrandValue = (e: FormEvent<HTMLInputElement>) => {
		const value = (e.target as HTMLInputElement).value;
		updateBrandState({ inputBrandValue: value });
		updateBrandState({ activeBrand: 0 });
		if (value.length === 0) {
			updateBrandState({ currentBrands: brandState.filteredBrands });
		} else {
			const filterBrands = brandState.filteredBrands.filter((brand: string) => {
				return brand.toLowerCase().trim().includes(value.toLowerCase());
			});
			updateBrandState({ currentBrands: filterBrands });
		}
	};
	const handleChangeInputCardValue = (e: FormEvent<HTMLInputElement>) => {
		const value = (e.target as HTMLInputElement).value;
		updateCardState({ inputCardValue: value });
		updateCardState({ activeCard: 0 });
		if (value.length === 0) {
			updateCardState({ currentCards: cardState.filteredCards });
		} else {
			const filterCards = cardState.filteredCards.filter((card: string) => {
				return card.toLowerCase().trim().includes(value.toLowerCase());
			});
			updateCardState({ currentCards: filterCards });
		}
	};

	// Обработчик добавления бренда в выбранные
	const handleSearchCards = (card: string) => {
		updateCardState({ selectedCard: card });
		updateCardState({ filteredCards: cardState.filteredCards.filter(b => b !== card) });
		updateCardState({ inputCardValue: card });
		if (cardState.dataCards) {
			const filter = cardState.dataCards.filter(b => b !== card);
			updateCardState({ currentCards: filter });
		}
	};
	const handleSearchBrands = (brand: string) => {
		updateBrandState({ selectedBrands: [...brandState.selectedBrands, brand] });
		updateBrandState({ filteredBrands: brandState.filteredBrands.filter(b => b !== brand) });
		updateBrandState({ inputBrandValue: '' });
		if (brandState.dataBrands) {
			const filter = brandState.dataBrands.filter(b => b !== brand);
			updateBrandState({ currentBrands: filter });
		}
	};

	const handleRemoveBrand = (brand: string) => {
		updateBrandState({ selectedBrands: brandState.selectedBrands.filter(b => b !== brand) });
		updateBrandState({ currentBrands: [...brandState.currentBrands, brand] });
		updateBrandState({ filteredBrands: [...brandState.filteredBrands, brand] });
	};

	const handleAddServices = (service: string) => {
		setServices(prevServices => {
			const isSet = prevServices.some(item => item === service);
			const newServices = isSet
				? prevServices.filter(item => item !== service)
				: [...prevServices, service];
			return newServices;
		});
	};

	const handleClearCardInput = () => {
		updateCardState({ inputCardValue: '' });
		updateCardState({ selectedCard: '' });
		updateCardState({ currentCards: cardState.dataCards });
		updateCardState({ filteredCards: cardState.dataCards });
	};

	useEffect(() => {
		if (filtersIsOpen && selectedFilter !== prevSelectedFilter.current) {
			dispatch(setFeatures([]));
			dispatch(setAddServices([]));
			dispatch(setGateHeight(null));
			setServices([]);
		}
		prevSelectedFilter.current = selectedFilter;
	}, [selectedFilter, filtersIsOpen]);

	useEffect(() => {
		if (isDbReady && filtersIsOpen) {
			handleGetBradns();
			handleGetCards();
		}
	}, [filtersIsOpen, isDbReady]);

	useEffect(() => {
		dispatch(setBrandTitles(brandState.selectedBrands));
	}, [brandState.selectedBrands]);

	useEffect(() => {
		dispatch(setCard(cardState.selectedCard));
	}, [cardState.selectedCard]);

	useEffect(() => {
		if (clearFilters) {
			updateBrandState({ filteredBrands: [] });
			updateBrandState({ selectedBrands: [] });
			updateBrandState({ currentBrands: [] });
			updateBrandState({ activeBrand: 0 });
			updateCardState({ filteredCards: [] });
			updateCardState({ selectedCard: '' });
			updateCardState({ inputCardValue: '' });
			updateCardState({ currentCards: ['Кардекс', 'Лукойл'] });
			updateCardState({ activeCard: 0 });
			setInputTerminalValue('');

			dispatch(setBrandTitles([]));
			dispatch(setCard(''));
			dispatch(setTerminal(''));
			dispatch(setFuelFilters([]));
			dispatch(setAddServices([]));
			dispatch(setGateHeight(null));
			dispatch(setFeatures([]));
			dispatch(setRelatedProducts(false));
		}
	}, [clearFilters]);

	// Инициализация брендов при загрузке данных
	useEffect(() => {
		if (brandState.dataBrands) {
			updateBrandState({ filteredBrands: brandState.dataBrands });
			updateBrandState({ currentBrands: brandState.dataBrands });
		}
	}, [brandState.dataBrands]);

	useEffect(() => {
		if (cardState.dataCards) {
			updateCardState({ filteredCards: cardState.dataCards });
			updateCardState({ currentCards: cardState.dataCards });
		}
	}, [cardState.dataCards]);

	// Сброс фильтров при открытии/закрытии
	useEffect(() => {
		updateBrandState({ inputBrandValue: '' });
		if (brandState.dataBrands) {
			updateBrandState({ filteredBrands: brandState.dataBrands });
			updateBrandState({ currentBrands: brandState.dataBrands });
		}
		// updateCardState({ inputCardValue: '' });
		// if (brandState.dataBrands) {
		// 	updateCardState({ filteredCards: cardState.dataCards });
		// 	updateCardState({ currentCards: cardState.dataCards });
		// }
	}, [filtersIsOpen]);

	const filterListClass = clsx(s.filtersList, {
		[s.left]:
			window.innerWidth <= 767
				? mobileActiveMenu !== 'filters' && mobileActiveMenu !== 'route'
				: activeMenu,
		[s.active]: filtersIsOpen,
		[s.route]: activeMenu === 'route' && filtersIsOpen
	});

	const terminalClass = clsx(s.filterRow, s.terminalWrapper);

	return (
		<div className={filterListClass}>
			<div className={s.filterListTop}>
				<h5>{selectedFilter !== null && filters[selectedFilter].title}</h5>
				<Button onClick={() => handleCloseFiltersList()} className={s.closeBtn}>
					<CloseIcon />
				</Button>
			</div>
			<div className={s.filterContentWrapper}>
				<div className={s.filterRow}>
					<p>Карта</p>
					<div className={s.brandWrapper}>
						<div className={s.inputWrapper}>
							<SearchableDropdown
								value={cardState.inputCardValue}
								onChange={handleChangeInputCardValue}
								onClear={handleClearCardInput}
								onSelect={handleSearchCards}
								items={cardState.currentCards}
								placeholder='Название'
								className={s.cardDropdown}
							/>
						</div>
					</div>
				</div>
				<div className={s.filterRow}>
					<p>Бренд</p>
					<div className={s.brandWrapper}>
						<div className={s.chips}>
							{brandState.selectedBrands.map((brand: string, index: number) => (
								<Chip key={index} isActive>
									{brand}
									<div className={s.closeBtn} onClick={() => handleRemoveBrand(brand)}>
										<CloseIcon />
									</div>
								</Chip>
							))}
						</div>
						<SearchableDropdown
							value={brandState.inputBrandValue}
							onChange={handleChangeInputBrandValue}
							onSelect={handleSearchBrands}
							items={brandState.currentBrands}
							placeholder='Название'
						/>
					</div>
				</div>
				{selectedFilter !== null &&
					filters[selectedFilter].content &&
					React.cloneElement(filters[selectedFilter].content, {
						handleAddServices,
						services
					})}
				<div className={terminalClass}>
					<p>Введите код объекта</p>
					<div className={s.inputList}>
						<Input
							onChange={handleChangeTerminalInputValue}
							value={inputTerminalValue}
							isStyled
							placeholder='Введите код'
						/>
					</div>
				</div>
			</div>
			<div className={s.filterListBottom}>
				<Button onClick={() => handleCloseFiltersList()} className={s.closeBtn}>
					<ArrowTopIcon />
					<p>Свернуть</p>
				</Button>
			</div>
		</div>
	);
};
