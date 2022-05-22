import { atom, useAtom, useAtomValue } from 'jotai';
import { FC, ReactElement, useEffect, useRef, useState } from 'react';
import Box from './components/Box/Box';
import classes from './App.module.css';
import Group, { DIRECTION } from './components/Group/Group';

const ITMES = 1500;

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
			<Group direction={DIRECTION.Row} scope="1">
				<Box>
					<Group direction={DIRECTION.Column} scope="2">
						<Box>{list(300)}</Box>
						<Box>{list(100)}</Box>
						<Box>{list(50)}</Box>
						<Box>{list(30)}</Box>
					</Group>
				</Box>
				<Box>
					<Group direction={DIRECTION.Column} scope="3">
						<Box></Box>
						<Box>
							<Group direction={DIRECTION.Row} scope="4">
								<Box></Box>
							</Group>
						</Box>
					</Group>
				</Box>
				<Box>fewf</Box>
			</Group>
		</div>
	);
}

export default App;
