import { FC, ReactNode } from 'react';

import classes from './Box.module.css';

const Box: FC = () => {
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

export default Box;
