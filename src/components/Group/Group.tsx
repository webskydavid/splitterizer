import { atom, Provider, useAtom } from 'jotai';
import { useAtomValue } from 'jotai/utils';
import throt from 'lodash.throttle';
import React, {
	FC,
	Fragment,
	ReactChildren,
	ReactElement,
	ReactNode,
	useCallback,
	useEffect,
	useLayoutEffect,
	useMemo,
	useRef,
	useState,
} from 'react';
import Divider from '../Divider/Divider';

import classes from './Group.module.css';
import calculatePercent from './utils/calculatePercent.util';
import throttle from './utils/throttle.util';

type Direction = 'COLUMN' | 'ROW';

export const DIRECTION: Record<string, Direction> = {
	Column: 'COLUMN',
	Row: 'ROW',
};

interface Props {
	children: ReactNode | ReactNode[];
	direction?: Direction;
	initSizes?: number[];
	minBoxHeights?: number[];
	minBoxWidths?: number[];
	scope: any;
}

interface Link {
	divider: HTMLElement;
	index: number;
	dividerSize: number;
	start: number;
	size: number;
	end: number;
	ref: HTMLElement;
}

const MIN_SIZE = 10;

const getInnerSize = (direction: Direction, element: HTMLElement) => {
	return direction === DIRECTION.Column
		? element.clientHeight
		: element.clientWidth;
};

const linksAtom = atom<Link[]>([]);

const generateLinksAtom = atom(null, (get, set, update: any) => {
	const { direction, children, dividers } = update;
	let array: Link[] = [];

	children.forEach((child: HTMLElement, index: number) => {
		const divider = dividers[index];
		const current = children[index];
		const dividerBox = divider.getBoundingClientRect();
		const currentBox = current.getBoundingClientRect();

		const dividerSize =
			direction === DIRECTION.Column ? dividerBox.height : dividerBox.width;

		const end =
			direction === DIRECTION.Column ? currentBox.bottom : currentBox.right;

		const newSize =
			direction === DIRECTION.Column
				? dividerBox.height + currentBox.height
				: dividerBox.width + currentBox.width;

		array.push({
			ref: current,
			index: index,
			divider,
			dividerSize,
			size: newSize,
			start: direction === DIRECTION.Column ? currentBox.top : currentBox.left,
			end,
		} as Link);
	});
	set(linksAtom, array);
});

const calculateSizesAtom = atom(null, (get, set, update: any) => {
	const { direction, index } = update;
	const links = get(linksAtom);
	const currentLink = links[index];
	const prevLink = links[index - 1];

	if (direction === DIRECTION.Column) {
		const b1 = prevLink.ref.getBoundingClientRect();
		prevLink.start = b1.top;
		prevLink.size = b1.height;
		prevLink.end = b1.bottom;

		const b2 = currentLink.ref.getBoundingClientRect();
		currentLink.start = b2.top;
		currentLink.size = b2.height;
		currentLink.end = b2.bottom;

		// Calculate rest size for last box
	} else {
		// NEW
		const b1 = prevLink.ref.getBoundingClientRect();
		prevLink.start = b1.left;
		prevLink.size = b1.width;
		prevLink.end = b1.right;

		const b2 = currentLink.ref.getBoundingClientRect();
		currentLink.start = b2.left;
		currentLink.size = b2.width;
		currentLink.end = b2.right;
	}

	links[index] = currentLink;

	set(linksAtom, links);
});

const Group: FC<Props> = ({
	children,
	direction = DIRECTION.Column,
	minBoxHeights = [],
	minBoxWidths = [],
	initSizes = [],
	scope: SCOPE,
}) => {
	const childrenArray = React.Children.toArray(children);
	const links = useAtomValue(linksAtom, SCOPE);
	const [dragging, setDragging] = useState(false);
	const [dividerIndex, setDividerIndex] = useState(-1);

	const [, generateLinks] = useAtom(generateLinksAtom, SCOPE);
	const [, calculateSizes] = useAtom(calculateSizesAtom, SCOPE);

	const groupRef = useRef<any>();
	const childRef = useRef<HTMLElement[]>([]);
	const dividerRef = useRef<HTMLElement[]>([]);

	const init = useCallback(
		(
			direction: Direction,
			elements: HTMLElement[],
			dividers: HTMLElement[],
			initSizes: number[]
		) => {
			const sizes = direction === DIRECTION.Column ? 'height' : 'width';

			if (initSizes.length && initSizes.reduce((p, c) => p + c, 0) < 100) {
				throw new Error('Sum of initial sizes is less then 100');
			}

			elements.forEach((child, index) => {
				const divider = dividers[index];
				const dividerSize = divider.getBoundingClientRect()[sizes];
				let calc = `calc(${100 / elements.length}% - ${dividerSize}px)`;

				if (initSizes.length) {
					calc = `calc(${initSizes[index]}% - ${dividerSize}px)`;
				}

				if (direction === DIRECTION.Column) {
					child.style.height = calc;
					child.style.width = '100%';
				} else {
					child.style.height = '100%';
					child.style.width = calc;
				}
			});
		},
		[]
	);

	const startDrag = useCallback(
		(index: number) => {
			setDragging(true);
			setDividerIndex(index);
		},
		[setDividerIndex, setDragging]
	);

	const stopDrag = useCallback(() => {
		setDragging(false);
	}, [setDragging]);

	const handleDividerMouseDown = (e: React.MouseEvent, index: number) => {
		e.preventDefault();
		if (index === 0) return;
		calculateSizes({ direction, index });
		startDrag(index);
	};

	// MOUSE MOVE
	useLayoutEffect(() => {
		const isColumn = direction === DIRECTION.Column;
		const groupSize = isColumn
			? groupRef.current?.clientHeight
			: groupRef.current?.clientWidth;
		const link = links[dividerIndex];
		const prevLink = links[dividerIndex - 1];

		const event = (e: MouseEvent) => {
			if (!dragging) return;

			requestAnimationFrame(() => {
				const dividerSize = 0;
				const offset = (isColumn ? e.clientY : e.clientX) - link.start;

				if (prevLink.size + offset < dividerSize) {
					return;
				}
				if (link.size - offset < dividerSize) {
					return;
				}

				const prevPercent = calculatePercent(prevLink.size, -offset, groupSize);
				const percent = calculatePercent(link.size, offset, groupSize);

				requestAnimationFrame(() => {
					if (direction === DIRECTION.Column) {
						prevLink.ref.style.height = `calc(${prevPercent}% - ${dividerSize}px)`;
						link.ref.style.height = `calc(${percent}% - ${dividerSize}px)`;
					} else {
						prevLink.ref.style.width = `calc(${prevPercent}% - ${dividerSize}px)`;
						link.ref.style.width = `calc(${percent}% - ${dividerSize}px)`;
					}
				});
			});
		};

		window.addEventListener('mousemove', event);

		return () => {
			window.removeEventListener('mousemove', event);
		};
	}, [dragging]);

	// MOUSE UP
	useEffect(() => {
		const event = (e) => {
			if (!dragging) return;
			stopDrag();
			calculateSizes({ direction, index: dividerIndex });
		};

		window.addEventListener('mouseup', event);

		return () => {
			window.removeEventListener('mouseup', event);
		};
	}, [dragging]);

	useEffect(() => {
		init(direction, childRef.current, dividerRef.current, initSizes);
		generateLinks({
			direction,
			children: childRef.current,
			dividers: dividerRef.current,
		});
	}, []);

	const addRef = (
		refs: typeof childRef | typeof dividerRef,
		element: HTMLElement
	) => {
		if (element && !refs.current.includes(element)) {
			refs.current.push(element);
		}
	};

	return (
		<Provider scope={SCOPE}>
			<div
				ref={groupRef}
				className={classes.root}
				style={{
					flexDirection: direction === DIRECTION.Column ? 'column' : 'row',
				}}
			>
				{React.Children.map(childrenArray, (child, index) => {
					return (
						<Fragment key={index}>
							<Divider
								setRef={(el: HTMLDivElement) => addRef(dividerRef, el)}
								onMouseDown={(e: React.MouseEvent) => handleDividerMouseDown(e, index)}
								drag={index > 0}
								direction={direction}
							>
								{links[index]?.size}
							</Divider>
							<div
								className={classes.wrapper}
								ref={(el: HTMLDivElement) => addRef(childRef, el)}
							>
								{child}
							</div>
						</Fragment>
					);
				})}
			</div>
		</Provider>
	);
};

export default Group;
