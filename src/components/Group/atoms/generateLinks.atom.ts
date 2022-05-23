import { atom } from 'jotai';
import { DIRECTION } from '../constants/direction';
import { Link } from '../models/Link.model';
import { linksAtom } from './links.atom';

export const generateLinksAtom = atom(null, (get, set, update: any) => {
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
