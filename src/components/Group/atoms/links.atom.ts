import { atom } from 'jotai';
import { Link } from '../models/Link.model';

export const linksAtom = atom<Link[]>([]);
