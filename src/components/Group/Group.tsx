import { atom, Provider, useAtom } from 'jotai';
import { useAtomValue } from 'jotai/utils';
import React, {
	FC,
	Fragment,
	ReactNode,
	useCallback,
	useEffect,
	useRef,
} from 'react';
import Divider from '../Divider/Divider';

import classes from './Group.module.css';

export enum Direction {
	Column = 'COLUMN',
	Row = 'ROW',
}

interface Props {
	children: ReactNode[];
	direction?: Direction;
	initSizes?: number[];
	minBoxHeights?: number[];
	minBoxWidths?: number[];
	scope: any;
}

interface Link {
	current: HTMLElement;
	divider: HTMLElement;
	fold: boolean;
	index: number;
	next: HTMLElement;
	parent: HTMLElement;
	prev: HTMLElement;
	_currentPercent: number;
	_dividerSize: number;
	_end: number;
	_prevPercent: number;
	_pairSize: number;
	_start: number;
}

const MIN_SIZE = 10;

const getInnerSize = (direction: Direction, element: HTMLElement) => {
	return direction === Direction.Column
		? element.clientHeight
		: element.clientWidth;
};

const draggingAtom = atom(false);
const dividerIndexAtom = atom(-1);
const linksAtom = atom<Link[]>([]);

const generateLinksAtom = atom(null, (get, set, update: any) => {
	console.log('generateLinksAtom');

	const { direction, children, dividers } = update;
	const parent = children[0].parentNode;

	let array: Link[] = [];

	children.forEach((child: HTMLElement, index: number) => {
		const prev = children[index - 1];
		const divider = dividers[index];
		const current = children[index];
		const next = children[index + 1];

		const dividerSize =
			direction === Direction.Column
				? divider.getBoundingClientRect().height
				: divider.getBoundingClientRect().width;

		const end =
			direction === Direction.Column
				? current.getBoundingClientRect().bottom
				: current.getBoundingClientRect().right;

		const start =
			direction === Direction.Column && prev
				? prev?.getBoundingClientRect().top
				: prev?.getBoundingClientRect().left;

		const size =
			direction === Direction.Column && prev
				? prev?.getBoundingClientRect().height +
				  divider.getBoundingClientRect().height +
				  current.getBoundingClientRect().height
				: prev?.getBoundingClientRect().width +
				  divider.getBoundingClientRect().width +
				  current.getBoundingClientRect().width;

		array.push({
			current,
			divider,
			fold: false,
			index: index,
			next,
			parent,
			prev,
			_currentPercent: 100 / children.length,
			_dividerSize: dividerSize,
			_end: end,
			_prevPercent: prev ? 100 / children.length : undefined,
			_pairSize: prev ? size : undefined,
			_start: start,
		} as Link);
	});
	set(linksAtom, array);
});

const calculateSizesAtom = atom(null, (get, set, update: any) => {
	console.log('calculateSizesAtom');

	const { direction, index } = update;
	const links = get(linksAtom);
	const link = links[index];
	const parentSize = getInnerSize(direction, link.parent);
	const dividerHeight = link.divider.clientHeight;

	let prevPercent;
	let currentPercent;

	if (direction === Direction.Column) {
		console.log('calculateSizes');

		const prevHeight = link.prev?.getBoundingClientRect().height || 0;
		const prevTop = link.prev?.getBoundingClientRect().top || 0;
		prevPercent = ((prevHeight + dividerHeight) / parentSize) * 100;
		link._prevPercent = prevPercent;

		const current = link.current.getBoundingClientRect();
		currentPercent = ((current.height + dividerHeight) / parentSize) * 100;
		link._currentPercent = currentPercent;

		link._start = prevTop;
		link._end = current.bottom;
		link._pairSize = prevHeight + dividerHeight * 2 + current.height;

		// Calculate rest size for last box
	} else {
	}

	links[index] = link;

	console.log('fff', links[index]);

	set(linksAtom, links);
});

const Group: FC<Props> = ({
	children,
	direction = Direction.Column,
	minBoxHeights = [],
	minBoxWidths = [],
	initSizes = [],
	scope: SCOPE,
}) => {
	const links = useAtomValue(linksAtom, SCOPE);
	const [dragging, setDragging] = useAtom(draggingAtom, SCOPE);
	const [dividerIndex, setDividerIndex] = useAtom(dividerIndexAtom, SCOPE);

	const [, generateLinks] = useAtom(generateLinksAtom, SCOPE);
	const [, calculateSizes] = useAtom(calculateSizesAtom, SCOPE);

	const groupRef = useRef<any>();
	const childRef = useRef<HTMLElement[]>([]);
	const dividerRef = useRef<HTMLElement[]>([]);

	console.log('links', links);

	const init = useCallback(
		(
			direction: Direction,
			children: HTMLElement[],
			dividers: HTMLElement[],
			initSizes: number[]
		) => {
			const sizes = direction === Direction.Column ? 'height' : 'width';
			const parent = children[0].parentNode;
			const parentSize = getInnerSize(direction, parent as HTMLElement);

			if (!parentSize) {
				throw new Error('Parent size undefined');
			}

			if (initSizes.length && initSizes.reduce((p, c) => p + c, 0) < 100) {
				throw new Error('Sum of initial sizes is less then 100');
			}

			children.forEach((child, index) => {
				const divider = dividers[index];
				const dividerSize = divider.getBoundingClientRect()[sizes];
				let calc = `calc(${100 / children.length}% - ${dividerSize}px)`;

				if (initSizes.length) {
					calc = `calc(${initSizes[index]}% - ${dividerSize}px)`;
				}

				if (direction === Direction.Column) {
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

	const drag = useCallback(
		(e: React.MouseEvent, direction: Direction, dividerIndex: number) => {
			const link = links[dividerIndex];
			const prevLink = links[dividerIndex - 1];
			if (link.fold || prevLink.fold) return;

			const isColumn = direction === Direction.Column;

			const percent = link._prevPercent + link._currentPercent;
			const dividerSize = link._dividerSize;
			let offset = (isColumn ? e.clientY : e.clientX) - link._start;

			// MIN SIZES
			if (offset < dividerSize + MIN_SIZE) {
				offset = dividerSize + MIN_SIZE;
			}
			if (offset >= link._pairSize - (dividerSize + MIN_SIZE)) {
				offset = link._pairSize - (dividerSize + MIN_SIZE);
			}

			const prevPercent = (offset / link._pairSize) * percent;
			const currentPercent = percent - prevPercent;

			if (direction === Direction.Column) {
				link.prev.style.height = `calc(${prevPercent}% - ${dividerSize}px)`;
				link.current.style.height = `calc(${currentPercent}% - ${dividerSize}px)`;
			} else {
				link.prev.style.width = `calc(${prevPercent}% - ${dividerSize}px)`;
				link.current.style.width = `calc(${currentPercent}% - ${dividerSize}px)`;
			}
		},
		[links]
	);

	const handleDividerMouseDown = (e: React.MouseEvent, index: number) => {
		e.preventDefault();
		if (index === 0) return;
		calculateSizes({ direction, index });
		startDrag(index);
	};

	// MOUSE MOVE
	useEffect(() => {
		const groupHeight = groupRef.current?.clientHeight;
		const event = (e) => {
			if (!dragging) return;

			requestAnimationFrame(() => {
				const link = links[dividerIndex];
				const prevLink = links[dividerIndex - 1];
				const isColumn = direction === Direction.Column;
				const percent = link._prevPercent + link._currentPercent;
				const dividerSize = link._dividerSize;
				let offset = (isColumn ? e.clientY : e.clientX) - link._start;

				// MIN SIZES
				if (offset < dividerSize + MIN_SIZE) {
					offset = dividerSize + MIN_SIZE;
				}
				if (offset >= link._pairSize - (dividerSize + MIN_SIZE)) {
					offset = link._pairSize - (dividerSize + MIN_SIZE);
				}

				const prevPercent = (offset / link._pairSize) * percent;
				const currentPercent = percent - prevPercent;
				requestAnimationFrame(() => {
					if (direction === Direction.Column) {
						link.prev.style.height = `calc(${prevPercent}% - ${dividerSize}px)`;
						link.current.style.height = `calc(${currentPercent}% - ${dividerSize}px)`;
					} else {
						link.prev.style.width = `calc(${prevPercent}% - ${dividerSize}px)`;
						link.current.style.width = `calc(${currentPercent}% - ${dividerSize}px)`;
					}
				});
			});
			//drag(e, direction, dividerIndex);
		};

		window.addEventListener('mousemove', event);

		return () => {
			window.removeEventListener('mousemove', event);
		};
	}, [dragging, drag]);

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
				// ref={groupRef}
				className={classes.root}
				style={{
					flexDirection: direction === Direction.Column ? 'column' : 'row',
				}}
			>
				{children.map((child, index) => {
					return (
						<Fragment key={index}>
							<Divider
								setRef={(el: HTMLDivElement) => addRef(dividerRef, el)}
								onMouseDown={(e: React.MouseEvent) => handleDividerMouseDown(e, index)}
								drag={index > 0}
								direction={direction}
							>
								{links[index]?._currentPercent}
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
