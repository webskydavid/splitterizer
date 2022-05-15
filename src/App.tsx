import { atom, useAtom, useAtomValue } from 'jotai';
import { FC, ReactElement, useEffect, useRef, useState } from 'react';
import Box from './components/Box/Box';
import './App.module.css';
import Group from './components/Group/Group';
// let throttleTimer;

// const throttle = (callback, time) => {
// 	if (throttleTimer) return;
// 	throttleTimer = true;
// 	setTimeout(() => {
// 		callback();
// 		throttleTimer = false;
// 	}, time);
// };

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
