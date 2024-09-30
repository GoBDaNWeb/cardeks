import { Chip } from '@/shared/ui';

import s from './wash-filters.module.scss';

export const WashFilters = () => {
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
