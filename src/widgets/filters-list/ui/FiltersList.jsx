import { useDispatch, useSelector } from 'react-redux';

import clsx from 'clsx';

import { setOpenFilters } from '@/widgets/filters';

// import { AZSFilters } from '@/features/azs-filters';
// import { TireFilters } from '@/features/tire-filters';
// import { WashFilters } from '@/features/wash-filters';
import { ArrowTopIcon, Button, Chip, CloseIcon, Input } from '@/shared/ui';

import { fuelList } from '../config';

import s from './filters-list.module.scss';

const WashFilters = () => {
	return (
		<div className={s.filtersContent}>
			<div className={s.filterRow}>
				<p>Вмещает машины</p>
				<div className={s.inputList}>
					<Chip>Легковые</Chip>
					<Chip>Фургоны от 3 м</Chip>
					<Chip>Грузовые от 4 м</Chip>
				</div>
			</div>
			<div className={s.filterRow}>
				<p>Параметры мойки</p>
				<div className={s.inputList}>
					<Chip>Химчистка</Chip>
					<Chip>Полировка</Chip>
					<Chip>Мойка двигателя</Chip>
					<Chip>Омыватель</Chip>
				</div>
			</div>

			<div className={s.filterRow}>
				<p>Выделить категории</p>
				<div className={s.inputList}>
					<Chip>А</Chip>
					<Chip>B</Chip>
					<Chip>C</Chip>
				</div>
			</div>

			<div className={s.filterRow}>
				<p>Дополнительные услуги</p>
				<div className={s.inputList}>
					<Chip>Мойка</Chip>
					<Chip>АЗС / АГЗС</Chip>
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
				<Chip>Сбросить счетчик PIN кода</Chip>
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
					<Chip>А</Chip>
					<Chip>B</Chip>
					<Chip>C</Chip>
				</div>
			</div>
			<div className={s.filterRow}>
				<p>Топливо</p>
				<div className={s.inputList}>
					{fuelList.map(fuel => (
						<Chip key={fuel}>{fuel}</Chip>
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
					<Chip>Мойка</Chip>
					<Chip>Шиномонтаж</Chip>
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
					<Chip>Легковой</Chip>
					<Chip>Грузовой</Chip>
					<Chip>Спецтехника</Chip>
				</div>
			</div>
			<div className={s.filterRow}>
				<p>Услуги</p>
				<Chip>Сезонное хранение шин</Chip>
			</div>

			<div className={s.filterRow}>
				<p>Дополнительные услуги</p>
				<div className={s.inputList}>
					<Chip>АЗС / АГЗС</Chip>
					<Chip>Мойка</Chip>
				</div>
			</div>
			<div className={s.filterRow}>
				<p>Выделить категории</p>
				<div className={s.inputList}>
					<Chip>А</Chip>
					<Chip>B</Chip>
					<Chip>C</Chip>
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

	const { selectedFilter, filtersIsOpen } = useSelector(store => store.filters);
	const { activeMenu } = useSelector(state => state.menu);

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
