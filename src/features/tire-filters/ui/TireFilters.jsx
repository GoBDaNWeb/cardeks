import { Chip } from '@/shared/ui';

import s from './tire-filters.module.scss';

export const TireFilters = () => {
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
