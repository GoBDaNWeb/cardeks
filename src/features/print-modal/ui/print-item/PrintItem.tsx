import { FC } from 'react';

import { Feature, IList } from '@/shared/types';

interface IPrintItem {
	point: Feature;
	filteredFuelList: IList[];
}

export const PrintItem: FC<IPrintItem> = ({ point, filteredFuelList }) => {
	return (
		<tr className='print-item'>
			<td className='col-1'>
				<div className='title'>АЗС</div>
				<div className='name'>
					<p>{point.title}</p>
				</div>
				<div className='address'>{point.address}</div>
			</td>
			<td className='col-2'>
				<div className='title'>Топливо</div>
				<div className='fuelList'>
					{filteredFuelList.map(fuel => (
						<p key={fuel.value}>{fuel.title}</p>
					))}
				</div>
			</td>
			<td className='col-3'>
				<div className='title'>Карты</div>
				<div className='card'>
					{point.title.toLowerCase().includes('лукойл') ||
					point.title.toLowerCase().includes('тебоил')
						? 'Лукойл'
						: 'Кардекс'}
				</div>
			</td>
		</tr>
	);
};
