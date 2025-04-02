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
	setTerminal
} from '@/widgets/filters';

import { getQueryParams, useIndexedDB, useTypedSelector } from '@/shared/lib';
import { ArrowTopIcon, Button, Chip, CloseIcon, Dropdown, Input } from '@/shared/ui';

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

	const {
		selectedFilter,
		filtersIsOpen,
		clearFilters,
		filters: { brandTitles, terminal, card }
	} = useTypedSelector(store => store.filters);

	const [inputTerminalValue, setInputTerminalValue] = useState(terminal);
	const [dropdownActive, setDropdownActive] = useState(false);
	const [dropdownCardActive, setDropdownCardActive] = useState(false);

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
	const { getBrands, isDbReady, getAllData } = useIndexedDB();

	const updateBrandState = (newState: Partial<typeof brandState>) => {
		setBrandState(prev => ({ ...prev, ...newState }));
	};
	const updateCardState = (newState: Partial<typeof cardState>) => {
		setCardState(prev => ({ ...prev, ...newState }));
	};

	const handleGetBradns = useCallback(async () => {
		if (isDbReady && filtersIsOpen) {
			const brands = await getBrands();
			const data = await getAllData();
			if (brandTitles) {
				const filterBrands = brands.filter(brand => {
					return !brandTitles.includes(brand);
				});
				updateBrandState({ dataBrands: filterBrands });

				return;
			} else {
				updateBrandState({ dataBrands: brands });
			}
		}
	}, [getBrands, isDbReady, filtersIsOpen]);

	const handleGetCards = useCallback(async () => {
		const cards = cardsList;
		updateCardState({ dataCards: cards });
	}, []);

	const { activeMenu } = useTypedSelector(state => state.menu);
	const { objectId } = useTypedSelector(store => store.objectInfo);

	const handleCloseFiltersList = () => {
		dispatch(setOpenFilters(false));
	};

	const handleChangeTerminalInputValue = (e: FormEvent<HTMLInputElement>) => {
		const value = (e.target as HTMLInputElement).value;
		setInputTerminalValue(value);
		dispatch(setTerminal(value));
	};

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
		setDropdownCardActive(false);
		if (cardState.dataCards) {
			const filter = cardState.dataCards.filter(b => b !== card);
			updateCardState({ currentCards: filter });
		}
	};
	const handleSearchBrands = (brand: string) => {
		updateBrandState({ selectedBrands: [...brandState.selectedBrands, brand] });
		updateBrandState({ filteredBrands: brandState.filteredBrands.filter(b => b !== brand) });
		updateBrandState({ inputBrandValue: '' });
		setDropdownActive(false);
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

	const handleBlur = () => {
		setTimeout(() => {
			setDropdownActive(false);
		}, 150);
	};
	const handleBlurCard = () => {
		setTimeout(() => {
			setDropdownCardActive(false);
		}, 150);
	};

	useEffect(() => {
		if (filtersIsOpen && selectedFilter !== prevSelectedFilter.current) {
			dispatch(setFeatures([]));
			dispatch(setFuelFilters([]));
			dispatch(setAddServices([]));
			dispatch(setGateHeight(null));
			setServices([]);
		}
		prevSelectedFilter.current = selectedFilter;
	}, [selectedFilter, filtersIsOpen]);

	useEffect(() => {
		if (isDbReady) {
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
			updateCardState({ currentCards: [] });
			updateCardState({ activeCard: 0 });
			setInputTerminalValue('');

			dispatch(setBrandTitles([]));
			dispatch(setCard(''));
			dispatch(setTerminal(''));
			dispatch(setFuelFilters([]));
			dispatch(setAddServices([]));
			dispatch(setGateHeight(null));
			dispatch(setFeatures([]));
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
		updateCardState({ inputCardValue: '' });
		if (brandState.dataBrands) {
			updateBrandState({ filteredBrands: brandState.dataBrands });
			updateBrandState({ currentBrands: brandState.dataBrands });
		}
		if (cardState.dataCards) {
			updateCardState({ filteredCards: cardState.dataCards });
			updateCardState({ currentCards: cardState.dataCards });
		}
	}, [filtersIsOpen]);

	const filterListClass = clsx(s.filtersList, {
		[s.left]: activeMenu,
		[s.active]: filtersIsOpen
	});

	const terminalClass = clsx(s.filterRow, s.terminalWrapper);
	const dropdownClass = clsx(s.dropdown, { [s.active]: dropdownActive });
	const dropdownCardClass = clsx(s.dropdown, {
		[s.active]: dropdownCardActive
	});

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
							<Input
								onChange={handleChangeInputCardValue}
								value={cardState.inputCardValue}
								isStyled
								placeholder='Название'
								onFocus={() => setDropdownCardActive(true)}
								onBlur={() => handleBlurCard()}
							/>
							{cardState.inputCardValue.length ? (
								<Button className={s.clearIcon} onClick={handleClearCardInput}>
									<CloseIcon />
								</Button>
							) : null}
						</div>

						<Dropdown className={dropdownCardClass}>
							{cardState.currentCards.length > 0
								? cardState.currentCards.map((card: string, index: number) => (
										<div
											onMouseEnter={() => updateCardState({ activeCard: index })}
											className={`${s.brand} ${index === cardState.activeCard ? s.active : ''}`}
											key={index}
											onClick={() => handleSearchCards(card)}
										>
											{card}
										</div>
									))
								: null}
						</Dropdown>
					</div>
				</div>
				<div className={s.filterRow}>
					<p>Бренд</p>
					<div className={s.brandWrapper}>
						<div className={s.chips}>
							{brandState.selectedBrands.length > 0
								? brandState.selectedBrands.map((brand: string, index: number) => (
										<Chip key={index} isActive>
											{brand}
											<div className={s.closeBtn} onClick={() => handleRemoveBrand(brand)}>
												<CloseIcon />
											</div>
										</Chip>
									))
								: null}
						</div>
						<Input
							onChange={handleChangeInputBrandValue}
							value={brandState.inputBrandValue}
							isStyled
							placeholder='Название'
							onFocus={() => setDropdownActive(true)}
							onBlur={() => handleBlur()}
						/>

						<Dropdown className={dropdownClass}>
							{brandState.currentBrands.length > 0
								? brandState.currentBrands.map((brand: string, index: number) => (
										<div
											onMouseEnter={() => updateBrandState({ activeBrand: index })}
											className={`${s.brand} ${index === brandState.activeBrand ? s.active : ''}`}
											key={index}
											onClick={() => handleSearchBrands(brand)}
										>
											{brand}
										</div>
									))
								: null}
						</Dropdown>
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
