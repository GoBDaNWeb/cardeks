import { useEffect, useState } from 'react';
import { useFieldArray, useForm } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';

import {
	setAddress,
	setBuildRoute,
	setBuildSearch,
	setCoords,
	setCurrentPointId,
	setDeletePointId,
	setRouteChanged,
	setSearchValue,
	setSelectAddress,
	setSwapPoints
} from '@/entities/map';

import { useGetAddressesQuery } from '@/shared/api';
import { ruLetters } from '@/shared/config';
import { getPointId, getQueryParams, useDebounce } from '@/shared/lib';
import { ArrowsIcon, Button, PlusIcon } from '@/shared/ui';

import s from './route-form.module.scss';
import { RouteInput } from './route-input';
import { RouteSettings } from './route-settings';
import { SearchDropdown } from './search-dropdown';

export const RouteForm = () => {
	const [searchData, setSearchData] = useState('');
	const [isDisabled, setDisabled] = useState(true);
	const [currentInputValue, setCurrentPointValue] = useState('');
	const [currentInputIndex, setCurrentPointIndex] = useState('');
	const [dropdownOpen, setdropdownOpen] = useState(false);

	const dispatch = useDispatch();
	const debounced = useDebounce(currentInputValue);

	const { data } = useGetAddressesQuery(searchData);

	const {
		searchInfo: { searchValue, buildSearch },
		routeInfo: { selectedAddress, currentPointId, changeRoute }
	} = useSelector(store => store.map);
	const { activeMenu } = useSelector(store => store.menu);
	const { isSuccess } = useSelector(state => state.newRouteModal);

	const { control, register, setValue, getValues, watch } = useForm({
		defaultValues: {
			points: [{ inputText: '' }, { inputText: '' }]
		}
	});

	const { fields, append, remove, swap } = useFieldArray({
		control,
		name: 'points'
	});

	const getInputValue = index => {
		return getValues('points')[index].inputText;
	};

	const handleSwap = index => {
		swap(index, index + 1);
		dispatch(setSwapPoints([index, index + 1]));
	};

	const removeQuestion = index => {
		if (getInputValue(index).length > 0) {
			setValue(getPointId(index), '');
			dispatch(setDeletePointId(getPointId(index)));
			setTimeout(() => {
				dispatch(setDeletePointId(null));
			}, 100);
		} else {
			remove(index);
			dispatch(setDeletePointId(getPointId(index)));
			setTimeout(() => {
				dispatch(setDeletePointId(null));
			}, 100);
		}
	};

	const addQuestion = () => {
		append({ inputText: '' });
		setCurrentPointIndex(null);
		setSearchData('');
	};

	const handleSelectPoint = id => {
		dispatch(setSelectAddress(true));
		dispatch(setCurrentPointId(id));
		setSearchData('');
	};
	const handleSelectAddress = (address, subtitle) => {
		subtitle
			? setValue(getPointId(currentInputIndex), `${address} ${subtitle}`)
			: setValue(getPointId(currentInputIndex), address);
		dispatch(setBuildSearch(true));
		dispatch(setSearchValue(getInputValue(currentInputIndex)));
		dispatch(setCurrentPointId(getPointId(currentInputIndex)));
		dispatch(setAddress(getInputValue(currentInputIndex)));
		setTimeout(() => {
			dispatch(setBuildSearch(false));
			setdropdownOpen(false);
			setSearchData('');
		}, 300);
	};

	const handleFocus = () => {
		setTimeout(() => {
			setdropdownOpen(true);
		}, 300);
	};
	const handleBlur = () => {
		setTimeout(() => {
			setdropdownOpen(false);
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
		let tempArr = [];
		fields.forEach((_, index) => {
			if (index === 0 || index === 1) {
				setValue(getPointId(index), '');
				return;
			} else {
				tempArr.push(index);
			}
		});
		setTimeout(() => {
			remove(tempArr);
		}, 0);
	};

	useEffect(() => {
		setSearchData(currentInputValue);
	}, [debounced]);

	useEffect(() => {
		if (buildSearch && currentInputIndex.length === 0) {
			setValue(getPointId(1), searchValue);
		}
	}, [buildSearch]);

	useEffect(() => {
		const queryRoutes = getQueryParams(window.location.href).routes;
		setTimeout(() => {
			if (queryRoutes) {
				const queryRoutesArray = queryRoutes.split(';');
				queryRoutesArray.forEach((route, index) => {
					setValue(getPointId(index), route);
				});
			}
		}, 0);
	}, []);

	useEffect(() => {
		if (activeMenu !== 'route') {
			handleClearInputs();
			setTimeout(() => {
				dispatch(setCoords([]));
			}, 300);
		}
	}, [activeMenu]);

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
			const emptyFields = value.points.filter(point => {
				return point.inputText.length === 0;
			});
			const changeFieldInput = field.name.split('.')[1];
			if (changeFieldInput) {
				setCurrentPointIndex(changeFieldInput);
				const inputText = value.points[changeFieldInput].inputText;
				setCurrentPointValue(inputText);
			}

			if (emptyFields.length > 0) {
				setDisabled(true);
			} else {
				setDisabled(false);
			}
		});
		return () => subscription.unsubscribe();
	}, [watch]);

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
							field={field}
							handleSelectPoint={() => handleSelectPoint(getPointId(index))}
							handleFocus={handleFocus}
							handleBlur={handleBlur}
							value={getInputValue(index)}
						/>
						{data?.results && dropdownOpen ? (
							<SearchDropdown
								isActive={currentInputIndex == index}
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
			<Button variant='link' className={s.addBtn} onClick={() => addQuestion()}>
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
