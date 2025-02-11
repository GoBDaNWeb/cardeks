import { useEffect, useState } from 'react';
import { useFieldArray, useForm } from 'react-hook-form';
import { useDispatch } from 'react-redux';

import {
	setAddress,
	setBuildRoute,
	setCoords,
	setCurrentPointId,
	setDeletePointId,
	setFieldsCount,
	setIsCursorPoint,
	setRouteChanged,
	setSearchValue,
	setSelectAddress,
	setSwapPoints
} from '@/entities/map';

import { useGetAddressesQuery } from '@/shared/api';
import { ruLetters } from '@/shared/config';
import { getPointId, getQueryParams, useDebounce, useTypedSelector } from '@/shared/lib';
import { ArrowsIcon, Button, PlusIcon } from '@/shared/ui';

import s from './route-form.module.scss';
import { RouteInput } from './route-input';
import { RouteSettings } from './route-settings';
import { SearchDropdown } from './search-dropdown';

interface IRouteFormValues {
	points: { inputText: string }[];
}

export const RouteForm: React.FC = () => {
	const [searchData, setSearchData] = useState<string>('');
	const [isDisabled, setDisabled] = useState<boolean>(true);
	const [currentInputValue, setCurrentPointValue] = useState<string>('');
	const [currentInputIndex, setCurrentPointIndex] = useState<string>('');
	const [dropdownOpen, setDropdownOpen] = useState<boolean>(false);

	const dispatch = useDispatch();
	const debounced = useDebounce(currentInputValue);

	const { data } = useGetAddressesQuery(searchData);

	const {
		searchInfo: { searchValue, buildSearch },
		routeInfo: { selectedAddress, currentPointId, changeRoute, isSelectAddress }
	} = useTypedSelector(store => store.map);
	const { activeMenu } = useTypedSelector(store => store.menu);
	const { activeMenu: mobileActiveMenu } = useTypedSelector(store => store.mobileMenu);
	const { isSuccess } = useTypedSelector(state => state.newRouteModal);

	const { control, register, setValue, getValues, watch } = useForm<IRouteFormValues>({
		defaultValues: {
			points: [{ inputText: '' }, { inputText: '' }]
		}
	});

	const { fields, append, remove, swap } = useFieldArray({
		control,
		name: 'points'
	});

	const getInputValue = (index: number) => {
		return getValues('points')[index].inputText;
	};

	const handleSwap = (index: number) => {
		swap(index, index + 1);
		dispatch(setSwapPoints([index, index + 1]));
	};

	const removeQuestion = (index: number) => {
		remove(index);
		dispatch(setDeletePointId(getPointId(index)));
		setTimeout(() => {
			dispatch(setDeletePointId(null));
		}, 100);
		dispatch(setFieldsCount(getValues('points').length));
	};

	const addQuestion = () => {
		append({ inputText: '' });
		setCurrentPointIndex('');
		setSearchData('');
		dispatch(setFieldsCount(getValues('points').length));
	};

	const handleSelectPoint = (id: string) => {
		dispatch(setIsCursorPoint(true));
		dispatch(setSelectAddress(true));
		dispatch(setCurrentPointId(id));
		setSearchData('');
	};

	const handleSelectAddress = (address: string, subtitle: string) => {
		if (currentInputIndex !== null && currentInputIndex !== '') {
			const index = parseInt(currentInputIndex, 10);
			if (!isNaN(index)) {
				const pointId = getPointId(index);
				setValue(pointId, subtitle ? `${address} ${subtitle}` : address);
				// dispatch(setBuildSearch(true));
				dispatch(setSearchValue(getInputValue(index)));
				dispatch(setCurrentPointId(getPointId(index)));

				dispatch(setAddress(getInputValue(index)));

				setTimeout(() => {
					// dispatch(setBuildSearch(false));
					setDropdownOpen(false);
					setSearchData('');
				}, 300);
			}
		}
	};
	const handleFocus = (index: number) => {
		setCurrentPointIndex(getPointId(index));
		dispatch(setIsCursorPoint(false));
		setTimeout(() => {
			setDropdownOpen(true);
			dispatch(setCurrentPointId(getPointId(index)));
		}, 300);
	};

	const handleBlur = () => {
		setTimeout(() => {
			setDropdownOpen(false);
			setSearchData('');
		}, 200);
	};

	const handleBuildRoute = () => {
		if (changeRoute) {
			dispatch(setRouteChanged(true));
		} else {
			dispatch(setBuildRoute(true));
		}
	};

	const handleClearInputs = () => {
		let tempArr: number[] = [];
		fields.forEach((_, index) => {
			if (index === 0 || index === 1) {
				setValue(getPointId(index), '');
				return;
			} else {
				tempArr.push(index);
			}
		});
		dispatch(setFieldsCount(2));

		setTimeout(() => {
			remove(tempArr);
		}, 100);
	};

	useEffect(() => {
		setSearchData(currentInputValue);
		dispatch(setAddress(currentInputValue));
	}, [debounced]);

	useEffect(() => {
		if (buildSearch && currentInputIndex?.length === 0) {
			setValue(getPointId(1), searchValue);
		}
	}, [buildSearch]);

	useEffect(() => {
		const queryRoutes = getQueryParams(window.location.href).routes;
		setTimeout(() => {
			if (queryRoutes) {
				const queryRoutesArray = queryRoutes.split(';');
				queryRoutesArray.forEach((route: string, index: number) => {
					setValue(getPointId(index), route);
				});
			}
		}, 0);
	}, []);

	useEffect(() => {
		if (activeMenu !== 'route' || mobileActiveMenu !== 'route') {
			handleClearInputs();
			dispatch(setFieldsCount(2));
			dispatch(setIsCursorPoint(false));
			setTimeout(() => {
				dispatch(setCoords([]));
			}, 300);
		}
	}, [activeMenu, mobileActiveMenu]);

	useEffect(() => {
		if (isSuccess) {
			handleClearInputs();
		}
	}, [isSuccess]);

	useEffect(() => {
		if (currentPointId) {
			const index = currentPointId.split('.')[1];
			setValue(getPointId(index), selectedAddress);
		}
	}, [selectedAddress]);

	useEffect(() => {
		const subscription = watch((value, field) => {
			if (Array.isArray(value.points)) {
				const emptyFields = value.points.filter(point => {
					return point && point.inputText?.length === 0;
				});

				const changeFieldInput: number | string = field.name ? field.name.split('.')[1] : '';

				if (changeFieldInput) {
					const inputText = value.points[+changeFieldInput]?.inputText;
					setCurrentPointIndex(changeFieldInput);
					setCurrentPointValue(inputText ?? '');
				}

				setDisabled(emptyFields.length > 0);
			} else {
				setDisabled(true);
			}
		});

		return () => subscription.unsubscribe();
	}, [watch]);

	const onChange = (e: any) => {
		const { value } = e.target;
		setCurrentPointValue(value);
	};

	return (
		<div className={s.routeForm}>
			<div className={s.routeInputs}>
				{fields.map((field, index) => (
					<div key={index} className={s.routeInputWrapper}>
						<RouteInput
							letter={ruLetters.split('')[index]}
							id={getPointId(index)}
							removeQuestion={() => removeQuestion(index)}
							register={register}
							fields={fields}
							//@ts-ignore
							field={field}
							onChange={onChange}
							handleSelectPoint={() => handleSelectPoint(getPointId(index))}
							handleFocus={() => handleFocus(index)}
							handleBlur={handleBlur}
							isSelect={currentPointId?.split('.')[1] == index && isSelectAddress}
						/>
						{data?.results && dropdownOpen ? (
							<SearchDropdown
								isActive={currentInputIndex == String(index)}
								list={data}
								handleSelectAddress={handleSelectAddress}
							/>
						) : null}
						{index === fields.length - 1 ? null : (
							<Button className={s.swapBtn} onClick={() => handleSwap(index)}>
								<ArrowsIcon />
							</Button>
						)}
					</div>
				))}
			</div>
			<Button variant='link' className={s.addBtn} onClick={addQuestion}>
				<PlusIcon />
				<p>Добавить точку</p>
			</Button>
			<RouteSettings />
			<div className={s.routeFormBotton}>
				<Button variant='primary' onClick={handleBuildRoute} isDisabled={isDisabled}>
					Построить маршрут
				</Button>
			</div>
		</div>
	);
};
