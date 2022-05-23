import { atom } from 'jotai';
import { DIRECTION } from '../constants/direction';
import { linksAtom } from './links.atom';

export const calculateSizesAtom = atom(null, (get, set, update: any) => {
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
