import { atom, useAtom, useAtomValue } from 'jotai';
import { FC, ReactElement, useEffect, useRef, useState } from 'react';
import Box from './components/Box/Box';
import classes from './App.module.css';
import Group, { Direction } from './components/Group/Group';

const ITMES = 300;

function App() {
	const list = (length: number) => {
		return Array(length)
			.fill('Item')
			.map((i, key) => (
				<div key={key}>
					{i} {key}
				</div>
			));
	};
	return (
		<div className={classes.root}>
			<Group direction={Direction.Row} scope="1">
				<Box>
					<Group direction={Direction.Column} scope="2">
						<Box>{list(ITMES)}</Box>
						<Box>{list(ITMES)}</Box>
						<Box>{list(ITMES)}</Box>
						<Box>{list(ITMES)}</Box>
					</Group>
				</Box>
				<Box>
					<Group direction={Direction.Column} scope="3">
						<Box>{list(ITMES)}</Box>
						<Box>
							<Group direction={Direction.Row} scope="4">
								<Box>{list(ITMES)}</Box>
								<Box>{list(ITMES)}</Box>
							</Group>
						</Box>
					</Group>
				</Box>
			</Group>
		</div>
	);
}

export default App;
