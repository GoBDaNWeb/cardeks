import { useEffect, useRef, useState } from 'react';
import { useDispatch } from 'react-redux';
import { useReactToPrint } from 'react-to-print';

import { Map as MapType } from 'yandex-maps';

import { fuelList } from '@/shared/config';
import { useTypedSelector } from '@/shared/lib';
import { Feature } from '@/shared/types';
import { Button, CardeksLogo, CloseIcon, Modal } from '@/shared/ui';

import { handleOpenModal, handleSuccess } from '../model';

import { PrintItem } from './print-item';
import s from './print-modal.module.scss';
import './print-modal.scss';

export const PrintModal = () => {
	const ymaps = window.ymaps;
	const [map, setMap] = useState<null | MapType>(null);

	const dispatch = useDispatch();
	const { isOpen } = useTypedSelector(store => store.printModal);
	const { filters } = useTypedSelector(store => store.routeForm);

	const {
		mapInfo: { mapType },
		routeInfo: { pointsOnRoute, routeCoords }
	} = useTypedSelector(store => store.map);
	const contentRef = useRef<HTMLDivElement>(null);
	const reactToPrintFn = useReactToPrint({ contentRef });

	const init = () => {
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
			gridSize: 128,
			clusterOpenBalloonOnClick: true
		});

		// e.get('newCenter')
		let map = new ymaps.Map('print_map', {
			center: [55.686736, 37.440496],
			zoom: 15
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
		map.controls.add('rulerControl', {
			float: 'none',
			position: {
				top: '80px',
				left: '73px'
			}
		});
	};

	useEffect(() => {
		ymaps.ready(init);
	}, [isOpen]);

	useEffect(() => {
		if (map) {
			map.setType(mapType);
		}
	}, [mapType, map]);

	const handleCloseModal = () => {
		dispatch(handleOpenModal(false));
	};

	return (
		<Modal isOpen={isOpen} className={s.newRouteModal} close={handleCloseModal}>
			<div className={s.modalContent} onClick={e => e.stopPropagation()}>
				<Button onClick={() => handleCloseModal()} className={s.closeBtn}>
					<CloseIcon />
				</Button>
				<div className={s.printModalTop}>
					<div className={s.text}>
						<h5>Распечатать список</h5>
						<p>
							АЗС: {pointsOnRoute.length}, фильтров:
							{filters.brandTitles.length + filters.azsTypes.length}
						</p>
					</div>
					<CardeksLogo />
				</div>
				<div className={s.printModalContent} ref={contentRef}>
					<div
						id='print_map'
						className={s.printMap}
						style={{ width: '100%', height: '250px' }}
					></div>
					<div className={s.azsList}>
						{pointsOnRoute.map((point: Feature) => {
							const filteredFuelList = fuelList.filter(item => point.fuels[item.value] === true);
							return <PrintItem point={point} filteredFuelList={filteredFuelList} key={point.id} />;
						})}
					</div>
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
