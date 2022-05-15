import { atom, useAtom, useAtomValue } from 'jotai';
import { FC, ReactElement, useEffect, useRef, useState } from 'react';
import './App.css';

const Box = () => {
	const list = (length: number) => {
		return Array(length)
			.fill('Item')
			.map((i, key) => (
				<div key={key} style={{ height: 20, fontSize: 10 }}>
					{i} {key}
				</div>
			));
	};

	return (
		<div
			style={{
				overflowY: 'scroll',
				height: '100%',
				display: 'flex',
				flexDirection: 'column',
			}}
		>
			{list(200)}
		</div>
	);
};

// let throttleTimer;

// const throttle = (callback, time) => {
// 	if (throttleTimer) return;
// 	throttleTimer = true;
// 	setTimeout(() => {
// 		callback();
// 		throttleTimer = false;
// 	}, time);
// };

type Link = {
	ref: HTMLDivElement;
	size: number;
	start: number;
	style: {
		height: string;
		width: string;
	};
};

const Group: FC<{ children: ReactElement[] }> = ({ children }) => {
	const groupRef = useRef<HTMLDivElement>(null);
	const boxesRef = useRef<HTMLDivElement[]>([]);
	const [isDragging, setIsDragging] = useState(false);
	const [currentDivider, setCurrentDivider] = useState<number | null>(null);

	const [links, setLinks] = useState<Link[]>([]);

	const handleMouseDown = (e, index: number) => {
		setIsDragging(true);
		setCurrentDivider(index);
		console.log('start', links);
	};

	// INIT
	useEffect(() => {
		if (!boxesRef.current.length) return;
		const boxes = boxesRef.current;
		const map: Link[] = [];

		boxes.forEach((box, i) => {
			const { height, top } = box.getBoundingClientRect();
			const calcHeight = `calc(${100 / boxes.length}%)`;

			map.push({
				ref: box,
				size: height,
				start: top,
				style: {
					height: calcHeight,
					width: '100%',
				},
			});

			box.style.height = calcHeight;
		});

		setLinks(map);
	}, []);

	// MOUSE MOVE
	useEffect(() => {
		const groupHeight = groupRef.current?.clientHeight;

		const event = (e: MouseEvent) => {
			if (isDragging && currentDivider !== null) {
				requestAnimationFrame(() => {
					const mousePosY = e.clientY;
					const pos = e.pageX;
					const current = links[currentDivider];
					const previous = links[currentDivider - 1];
					const offset = mousePosY - links[currentDivider].start;
					console.log(0, ((previous.size + offset) / groupHeight) * 100);
					console.log(1, ((current.size - offset) / groupHeight) * 100);

					requestAnimationFrame(() => {
						previous.ref.style.height = `calc(${
							((previous.size + offset) / groupHeight) * 100
						}%)`;
						current.ref.style.height = `calc(${
							((current.size - offset) / groupHeight) * 100
						}%)`;

						//links[currentDivider].h = links[currentDivider].h - offset;
					});
				});

				// throttle(() => {
				// 	const height = e.clientY;
				// 	const bounding = refs.current[0].getBoundingClientRect().height;
				// 	console.log(groupHeight / refs.current.length, height, bounding);
				// 	console.log('Log: [run]', 1);
				// 	refs.current[0].style.height = `${height - 100}px`;
				// }, 10);
			}
		};

		window.addEventListener('mousemove', event);

		return () => {
			window.removeEventListener('mousemove', event);
		};
	}, [isDragging]);

	// MOUSE UP
	useEffect(() => {
		const event = (e) => {
			e.preventDefault();
			setIsDragging(false);
			setCurrentDivider(null);

			if (links.length === 0) return;

			setLinks((prev) => {
				const prevBox = prev[currentDivider - 1];
				const currentBox = prev[currentDivider];

				const h1 = prevBox.ref.getBoundingClientRect().height;
				const start1 = prevBox.ref.getBoundingClientRect().top;
				const h2 = currentBox.ref.getBoundingClientRect().height;
				const start2 = currentBox.ref.getBoundingClientRect().top;

				prev[currentDivider - 1] = {
					...prevBox,
					size: h1,
					start: start1,
				};

				prev[currentDivider] = {
					...currentBox,
					size: h2,
					start: start2,
				};

				return prev;
			});

			console.log('stop');
		};
		window.addEventListener('mouseup', event);

		return () => {
			window.removeEventListener('mouseup', event);
		};
	}, [isDragging]);

	const createRefs = (e: HTMLDivElement) => {
		if (e && !boxesRef.current.includes(e)) boxesRef.current.push(e);
	};

	return (
		<div
			ref={groupRef}
			style={{
				display: 'flex',
				flexDirection: 'column',
				top: 0,
				bottom: 0,
				position: 'fixed',
			}}
		>
			{children.map((child, index) => {
				return (
					<div
						ref={createRefs}
						key={index}
						style={{
							height: `calc(${100 / children.length}%)`,
						}}
					>
						<div
							style={{ height: 20, backgroundColor: 'lightgray', fontSize: 12 }}
							onMouseDown={(e) => {
								if (index === 0) return;
								return handleMouseDown(e, index);
							}}
						>
							Divider: {index}
						</div>
						{child}
					</div>
				);
			})}
			<div
				style={{
					position: 'fixed',
					right: 0,
					backgroundColor: 'gray',
					fontSize: 10,
					width: 300,
					color: 'white',
				}}
			>
				<pre>
					{JSON.stringify(
						links.map(({ size, start, style }) => ({
							size,
							start,
							style,
						})),
						null,
						2
					)}
				</pre>{' '}
			</div>
		</div>
	);
};

function App() {
	return (
		<div className="App">
			<Group>
				<Box />
				<Box />
				<Box />
			</Group>
		</div>
	);
}

export default App;
