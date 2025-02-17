import { FC } from 'react';

import { Feature, IList } from '@/shared/types';

interface IPrintItem {
	point: Feature;
	filteredFuelList: IList[];
}

export const PrintItem: FC<IPrintItem> = ({ point, filteredFuelList }) => {
	return (
		<div>
			<table className='print-table'>
				<thead>
					<tr>
						<th>АЗС</th>
						<th>Топливо</th>
						<th>Карты</th>
					</tr>
				</thead>
				<tbody>
					<tr>
						<td>
							<p>{point.title}</p>
						</td>
						<td>{point.address}</td>
					</tr>
					<tr>
						{filteredFuelList.map(fuel => (
							<td key={fuel.value}>{fuel.title}</td>
						))}
					</tr>

					<tr>
						<td>
							{point.title.toLowerCase().includes('лукойл') ||
							point.title.toLowerCase().includes('тебоил')
								? 'Лукойл'
								: 'Кардекс'}
						</td>
					</tr>
				</tbody>
			</table>
		</div>
	);
};
