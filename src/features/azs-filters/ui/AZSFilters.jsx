import { Chip, Input } from '@/shared/ui';

import { fuelList } from '../config';

import s from './azs-filters.module.scss';

export const AZSFilters = () => {
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
