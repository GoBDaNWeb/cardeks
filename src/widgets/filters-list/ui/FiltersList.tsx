import { useDispatch } from 'react-redux';

import clsx from 'clsx';

import { setOpenFilters } from '@/widgets/filters';

import { useTypedSelector } from '@/shared/lib';
import { ArrowTopIcon, Button, Chip, CloseIcon, Input } from '@/shared/ui';

import { fuelList } from '../config';

import s from './filters-list.module.scss';

const WashFilters = () => {
	return (
		<div className={s.filtersContent}>
			<div className={s.filterRow}>
				<p>Вмещает машины</p>
				<div className={s.inputList}>
					<Chip onClick={() => {}}>Легковые</Chip>
					<Chip onClick={() => {}}>Фургоны от 3 м</Chip>
					<Chip onClick={() => {}}>Грузовые от 4 м</Chip>
				</div>
			</div>
			<div className={s.filterRow}>
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
			</div>

			<div className={s.filterRow}>
				<p>Дополнительные услуги</p>
				<div className={s.inputList}>
					<Chip onClick={() => {}}>Мойка</Chip>
					<Chip onClick={() => {}}>АЗС / АГЗС</Chip>
				</div>
			</div>
		</div>
	);
};
const AZSFilters = () => {
	return (
		<div className={s.filtersContent}>
			<div className={s.filterRow}>
				<p>Основное</p>
				<Chip onClick={() => {}}>Сбросить счетчик PIN кода</Chip>
			</div>
			<div className={s.filterRow}>
				<p>Карта</p>
				<Input isStyled placeholder='Номер или название' />
			</div>
			<div className={s.filterRow}>
				<p>Бренд</p>
				<Input isStyled placeholder='Номер или название' />
			</div>
			<div className={s.filterRow}>
				<p>Выделить категории</p>
				<div className={s.inputList}>
					<Chip onClick={() => {}}>А</Chip>
					<Chip onClick={() => {}}>B</Chip>
					<Chip onClick={() => {}}>C</Chip>
				</div>
			</div>
			<div className={s.filterRow}>
				<p>Топливо</p>
				<div className={s.inputList}>
					{fuelList.map(fuel => (
						<Chip onClick={() => {}} key={fuel}>
							{fuel}
						</Chip>
					))}
				</div>
			</div>
			<div className={s.filterRow}>
				<p>Цена топлива, ₽</p>
				<div className={s.inputGrid}>
					<Input isStyled placeholder='От' />
					<Input isStyled placeholder='До' />
				</div>
			</div>
			<div className={s.filterRow}>
				<p>Дополнительные услуги</p>
				<div className={s.inputList}>
					<Chip onClick={() => {}}>Мойка</Chip>
					<Chip onClick={() => {}}>Шиномонтаж</Chip>
				</div>
			</div>
		</div>
	);
};

const TireFilters = () => {
	return (
		<div className={s.filtersContent}>
			<div className={s.filterRow}>
				<p>Параметры </p>
				<div className={s.inputList}>
					<Chip onClick={() => {}}>Легковой</Chip>
					<Chip onClick={() => {}}>Грузовой</Chip>
					<Chip onClick={() => {}}>Спецтехника</Chip>
				</div>
			</div>
			<div className={s.filterRow}>
				<p>Услуги</p>
				<Chip onClick={() => {}}>Сезонное хранение шин</Chip>
			</div>

			<div className={s.filterRow}>
				<p>Дополнительные услуги</p>
				<div className={s.inputList}>
					<Chip onClick={() => {}}>АЗС / АГЗС</Chip>
					<Chip onClick={() => {}}>Мойка</Chip>
				</div>
			</div>
			<div className={s.filterRow}>
				<p>Выделить категории</p>
				<div className={s.inputList}>
					<Chip onClick={() => {}}>А</Chip>
					<Chip onClick={() => {}}>B</Chip>
					<Chip onClick={() => {}}>C</Chip>
				</div>
			</div>
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
		[s.left]: activeMenu === 'route',
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

			{filters[selectedFilter].content}
			<div className={s.filterListBottom}>
				<Button onClick={() => handleCloseFiltersList()} className={s.closeBtn}>
					<ArrowTopIcon />
					<p>Свернуть</p>
				</Button>
			</div>
		</div>
	);
};
