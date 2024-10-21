import { FC, PropsWithChildren, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

interface IPortal {
	rootId: string;
}

export const Portal: FC<PropsWithChildren<IPortal>> = ({ rootId, children }) => {
	const [mounted, setMounted] = useState(false);
	const containerRef = useRef<Element | null>(null);

	useEffect(() => {
		setMounted(true);
		containerRef.current = document.querySelector(`${rootId}`);
		return () => setMounted(false);
	}, []);

	return mounted && Boolean(containerRef.current)
		? createPortal(children, containerRef.current!)
		: null;
};
