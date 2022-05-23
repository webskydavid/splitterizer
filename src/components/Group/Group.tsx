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
	components?: ReactNode[];
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
	initSizes,
	components = [],
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
			sectionSizes: number[] | undefined
		) => {
			const isColumn = direction === DIRECTION.Column;
			const sizes = direction === DIRECTION.Column ? 'height' : 'width';

			elements.forEach((child, index) => {
				const divider = dividers[index];
				const dividerSize = divider.getBoundingClientRect()[sizes];
				let calc = `calc(${100 / elements.length}% - ${dividerSize}px)`;

				if (sectionSizes && sectionSizes.length) {
					const size = sectionSizes[index];
					if (size !== null) {
						calc = `calc(${+size}% - ${dividerSize}px)`;
					}
				}

				if (isColumn) {
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
		document.getElementsByTagName('body')[0].style.cursor = 'row-resize';
		console.log('Log: [divider]', dividerRef.current[dividerIndex], e.clientY);
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
				const currentdividerSize = link.dividerSize;
				const offset = (isColumn ? e.clientY : e.clientX) - link.start;

				if (prevLink.size + offset + currentdividerSize <= -1) {
					return;
				}
				if (link.size - offset - currentdividerSize <= 0) {
					return;
				}

				const prevPercent = calculatePercent(
					prevLink.size + currentdividerSize,
					-offset,
					groupSize
				);
				const percent = calculatePercent(
					link.size - currentdividerSize,
					offset,
					groupSize
				);

				requestAnimationFrame(() => {
					if (direction === DIRECTION.Column) {
						prevLink.ref.style.height = `calc(${prevPercent}%)`;
						link.ref.style.height = `calc(${percent}%)`;
					} else {
						prevLink.ref.style.width = `calc(${prevPercent}% - 4px)`;
						link.ref.style.width = `calc(${percent}% - 4px)`;
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
			document.body.style.cursor = 'row-resize';
			console.log(links);
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
								{components[index]}
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
