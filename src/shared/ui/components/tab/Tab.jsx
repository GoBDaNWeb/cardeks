import s from './tab.module.scss';

export const Tab = ({ children, isActive, onClick }) => {
	return <div className={s.tab}>{children}</div>;
};
