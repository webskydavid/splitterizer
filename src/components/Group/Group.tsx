import { atom, Provider, useAtom } from 'jotai';
import { useAtomValue } from 'jotai/utils';
import React, {
	FC,
	Fragment,
	ReactNode,
	useCallback,
	useEffect,
	useLayoutEffect,
	useRef,
	useState,
} from 'react';
import Divider from '../Divider/Divider';
import { calculateSizesAtom } from './atoms/calculateLinksSizes.atom';
import { generateLinksAtom } from './atoms/generateLinks.atom';
import { linksAtom } from './atoms/links.atom';
import { DIRECTION } from './constants/direction';

import classes from './Group.module.css';
import { Direction } from './models/Direction.model';
import calculatePercent from './utils/calculatePercent.util';

interface Props {
	children: ReactNode | ReactNode[];
	direction?: Direction;
	initSizes?: number[];
	components?: ReactNode[];
	scope: any;
}

const Group: FC<Props> = ({
	children,
	direction = DIRECTION.Column,
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

	const changeDragCursor = (
		cursor: 'default' | 'drag',
		direction: Direction
	) => {
		if (cursor === 'drag') {
			document.body.style.cursor =
				direction === DIRECTION.Column ? 'row-resize' : 'col-resize';
		} else {
			document.body.style.cursor = 'default';
		}
	};

	// MOUSE DOWN ON DIVIDER
	const handleDividerMouseDown = (e: React.MouseEvent, index: number) => {
		e.preventDefault();
		if (index === 0) return;
		calculateSizes({ direction, index });
		startDrag(index);
		changeDragCursor('drag', direction);
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
						prevLink.ref.style.width = `calc(${prevPercent}%)`;
						link.ref.style.width = `calc(${percent}%)`;
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
		const event = (e: MouseEvent) => {
			if (!dragging) return;
			stopDrag();
			calculateSizes({ direction, index: dividerIndex });
			changeDragCursor('default', direction);
		};

		window.addEventListener('mouseup', event);

		return () => {
			window.removeEventListener('mouseup', event);
		};
	}, [dragging]);

	// INITIAL RUN
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
