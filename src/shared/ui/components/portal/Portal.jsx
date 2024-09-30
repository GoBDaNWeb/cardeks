import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

export const Portal = ({ rootId, children }) => {
	const [mounted, setMounted] = useState(false);
	const containerRef = useRef(null);

	useEffect(() => {
		setMounted(true);
		containerRef.current = document.querySelector(`${rootId}`);
		return () => setMounted(false);
	}, []);

	return mounted && Boolean(containerRef.current)
		? createPortal(children, containerRef.current)
		: null;
};
