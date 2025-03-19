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
import { setActiveMenu } from '@/widgets/menu-list';

import { setActiveMenu as setActiveMenuMob } from '@/entities/mobile-menu';

import { getQueryParams, useDebounce, useIndexedDB, useTypedSelector } from '@/shared/lib';
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
		filters: { terminal, card, brandTitles }
	} = useTypedSelector(store => store.filters);

	const [inputTerminalValue, setInputTerminalValue] = useState(terminal);
	const [dropdownActive, setDropdownActive] = useState(false);
	const [dropdownCardActive, setDropdownCardActive] = useState(false);
	const [brandValue, setBrandValue] = useState(brandTitles);

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
	const { isDbReady } = useIndexedDB();
	const debounced = useDebounce(brandValue);

	const updateCardState = (newState: Partial<typeof cardState>) => {
		setCardState(prev => ({ ...prev, ...newState }));
	};

	useEffect(() => {
		dispatch(setBrandTitles(brandValue));
	}, [debounced]);

	const handleGetCards = useCallback(async () => {
		const cards = cardsList;
		updateCardState({ dataCards: cards });
	}, []);

	const { activeMenu: mobileActiveMenu } = useTypedSelector(store => store.mobileMenu);

	const handleCloseFiltersList = () => {
		dispatch(setOpenFilters(false));
		// dispatch(setActiveMenuMob(null));
	};

	const handleChangeTerminalInputValue = (e: FormEvent<HTMLInputElement>) => {
		const value = (e.target as HTMLInputElement).value;
		setInputTerminalValue(value);
		dispatch(setTerminal(value));
	};

	const handleChangeInputBrandValue = (e: FormEvent<HTMLInputElement>) => {
		const value = (e.target as HTMLInputElement).value;
		setBrandValue(value);
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
			handleGetCards();
		}
	}, [filtersIsOpen, isDbReady]);

	useEffect(() => {
		dispatch(setCard(cardState.selectedCard));
	}, [cardState.selectedCard]);

	useEffect(() => {
		if (clearFilters) {
			updateCardState({ filteredCards: [] });
			updateCardState({ selectedCard: '' });
			updateCardState({ inputCardValue: '' });
			updateCardState({ currentCards: [] });
			updateCardState({ activeCard: 0 });
			setInputTerminalValue('');
			setBrandValue('');
			dispatch(setBrandTitles(''));
			dispatch(setCard(''));
			dispatch(setTerminal(''));
			dispatch(setFuelFilters([]));
			dispatch(setAddServices([]));
			dispatch(setGateHeight(null));
			dispatch(setFeatures([]));
		}
	}, [clearFilters]);

	useEffect(() => {
		if (cardState.dataCards) {
			updateCardState({ filteredCards: cardState.dataCards });
			updateCardState({ currentCards: cardState.dataCards });
		}
	}, [cardState.dataCards]);

	useEffect(() => {
		updateCardState({ inputCardValue: '' });
		if (cardState.dataCards) {
			updateCardState({ filteredCards: cardState.dataCards });
			updateCardState({ currentCards: cardState.dataCards });
		}
	}, [filtersIsOpen]);

	const filterListClass = clsx(s.filtersList, {
		// [s.left]: activeMenu,
		[s.active]: filtersIsOpen,
		[s.top]: mobileActiveMenu === 'route'
	});

	const terminalClass = clsx(s.filterRow, s.terminalWrapper);
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
						<Input
							onChange={handleChangeInputBrandValue}
							value={brandValue}
							isStyled
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
