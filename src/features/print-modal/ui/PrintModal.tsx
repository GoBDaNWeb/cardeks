import { useCallback, useEffect, useRef, useState } from 'react';
import { useReactToPrint } from 'react-to-print';

import { Map as MapType } from 'yandex-maps';

import { fuelList } from '@/shared/config';
import { useTypedSelector } from '@/shared/lib';
import { Feature } from '@/shared/types';
import { Button, CardeksLogo, CloseIcon, Modal, useModal } from '@/shared/ui';

import { PrintItem } from './print-item';
import s from './print-modal.module.scss';
import './print-modal.scss';

export const PrintModal = () => {
	const ymaps = window.ymaps;
	const [map, setMap] = useState<null | MapType>(null);

	const { filters } = useTypedSelector(store => store.routeForm);

	const {
		mapInfo: { mapType, fixedCenter, zoom, points },
		routeInfo: { pointsOnRoute, routeCoords, routeIsBuilded }
	} = useTypedSelector(store => store.map);
	const contentRef = useRef<HTMLDivElement>(null);
	const reactToPrintFn = useReactToPrint({ contentRef });

	const { close, isOpen, currentModal } = useModal();

	const init = useCallback(() => {
		let multiRoute = new ymaps.multiRouter.MultiRoute(
			{
				referencePoints: routeCoords,
				params: {
					routingMode: 'auto',
					results: 1
				}
			},
			{
				boundsAutoApply: true,
				routeActiveStrokeWidth: 6,
				wayPointVisible: false,
				routeActiveStrokeShowLabels: false,
				routeActiveStrokeColor: '5DAFEE'
			}
		);
		const objectManager = new ymaps.ObjectManager({
			clusterize: true,
			geoObjectOpenBalloonOnClick: true,
			gridSize: 64,
			clusterOpenBalloonOnClick: true,
			clusterIcons: [
				{
					href: '/images/cluster.svg',
					size: [20, 20],
					offset: [-20, -20]
				}
			],
			clusterIconContentLayout: '',
			clusterIconColor: '#2d9bef'
		});
		let map = new ymaps.Map('print_map', {
			center: fixedCenter.length ? fixedCenter : [55.686736, 37.440496],
			zoom: zoom
		});
		setMap(map);

		map.controls.remove('searchControl');
		map.controls.remove('trafficControl');
		map.controls.remove('typeSelector');
		map.controls.remove('rulerControl');
		map.controls.remove('zoomControl');
		map.behaviors.disable(['drag', 'scrollZoom']);
		map.geoObjects.add(multiRoute);
		map.geoObjects.add(objectManager);
		objectManager.add(pointsOnRoute);
	}, []);

	useEffect(() => {
		if (ymaps && isOpen('print')) {
			ymaps.ready(init);
		}
	}, [ymaps, currentModal]);

	useEffect(() => {
		if (map) {
			map.setType(mapType);
		}
	}, [mapType, map]);

	const handleCloseModal = () => {
		close();
	};
	return (
		<Modal isOpen={isOpen('print')} className={s.newRouteModal} close={handleCloseModal}>
			<div className={s.modalContent} onClick={e => e.stopPropagation()}>
				<Button onClick={() => handleCloseModal()} className={s.closeBtn}>
					<CloseIcon />
				</Button>
				<div className={s.printModalTop}>
					<div className={s.text}>
						<h5>Распечатать список</h5>
						<p>
							АЗС: {routeIsBuilded ? pointsOnRoute.length : points.length}, фильтров:
							{filters.brandTitles.length + filters.azsTypes.length}
						</p>
					</div>
					<CardeksLogo />
				</div>
				<div className={s.printModalContent} ref={contentRef}>
					<div className={s.mapWrapper}>
						<div id='print_map' className={s.printMap}></div>
					</div>
					<table className={s.azsList}>
						<tbody>
							{routeIsBuilded
								? pointsOnRoute.map((point: Feature) => {
										const filteredFuelList = fuelList.filter(
											item => point.fuels[item.value] === true
										);
										return (
											<PrintItem point={point} filteredFuelList={filteredFuelList} key={point.id} />
										);
									})
								: points.map((point: Feature) => {
										const filteredFuelList = fuelList.filter(
											item => point.fuels[item.value] === true
										);
										return (
											<PrintItem point={point} filteredFuelList={filteredFuelList} key={point.id} />
										);
									})}
						</tbody>
					</table>
				</div>
				<div className={s.printModalBottom}>
					<Button variant='primary' onClick={() => reactToPrintFn()}>
						Распечатать список
					</Button>
				</div>
			</div>
		</Modal>
	);
};
