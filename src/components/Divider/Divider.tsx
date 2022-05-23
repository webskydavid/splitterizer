import { FC } from 'react';
import { DIRECTION } from '../Group/Group';

import classes from './Divider.module.css';

const Divider: FC<any> = ({
	children,
	setRef,
	onMouseDown,
	onFold,
	drag,
	direction,
}) => {
	return (
		<>
			{direction === DIRECTION.Column ? (
				<div ref={setRef} className={classes.root}>
					{drag ? (
						<div className={classes.hDrag} onMouseDown={onMouseDown}></div>
					) : (
						<div></div>
					)}
					{children}
					{/* <div className={classes.title}>{children}</div>
					{drag ? (
						<div className={classes.drag} onMouseDown={onMouseDown}></div>
					) : (
						<div className={classes.emptyDrag}></div>
					)} */}
				</div>
			) : drag ? (
				<div ref={setRef} onMouseDown={onMouseDown} className={classes.vDrag}></div>
			) : (
				<div ref={setRef}></div>
			)}
		</>
	);
};

export default Divider;
