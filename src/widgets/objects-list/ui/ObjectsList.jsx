import { useDispatch, useSelector } from 'react-redux';

import clsx from 'clsx';

import { clearActiveMenu } from '@/widgets/menu-list';

import { setActiveMenu } from '@/entities/mobile-menu';
import { ObjectItem } from '@/entities/object-item';

import { Button, CloseIcon, DownloadIcon, MailIcon, PrintIcon } from '@/shared/ui';

import s from './objects-list.module.scss';

export const ObjectsList = () => {
	const dispatch = useDispatch();
	const { activeMenu } = useSelector(store => store.menu);
	const { activeMenu: mobileActiveMenu } = useSelector(store => store.mobileMenu);

	const handleClose = () => {
		dispatch(clearActiveMenu());
		dispatch(setActiveMenu(null));
	};

	const objectsListClass = clsx(s.objectsList, {
		[s.active]: activeMenu === 'objects-list' || mobileActiveMenu === 'objects'
	});

	return (
		<div className={objectsListClass}>
			<div className={s.objectListTop}>
				<div className={s.left}>
					<p>20 838 отфильтровано / 5 на карте</p>
				</div>
				<div className={s.right}>
					<div className={s.features}>
						<Button>
							<DownloadIcon />
						</Button>
						<Button>
							<PrintIcon />
						</Button>
						<Button>
							<MailIcon />
						</Button>
					</div>
					<Button onClick={() => handleClose()}>
						<CloseIcon />
					</Button>
				</div>
			</div>
			<div className={s.objectListContent}>
				<ObjectItem />
				<ObjectItem />
				<ObjectItem />
				<ObjectItem />
				<ObjectItem />
				<ObjectItem />
				<ObjectItem />
				<ObjectItem />
				<ObjectItem />
				<ObjectItem />
				<ObjectItem />
				<ObjectItem />
			</div>
		</div>
	);
};
