import Box from './components/Box/Box';
import classes from './App.module.css';
import Group from './components/Group/Group';
import { DIRECTION } from './components/Group/constants/direction';

const ITMES = 1500;
const Divider = ({ title }: { title: string }) => {
	return <div style={{ height: 20 }}>{title}</div>;
};

const DIVIDERS_1 = [
	null,
	<Divider title="Divider 1" />,
	<Divider title="Divider 2" />,
	<Divider title="Divider 3" />,
];

const DIVIDERS_2 = [null, null, <Divider title="Divider 4" />];

function App() {
	const list = (length: number) => {
		return Array(length)
			.fill('Item')
			.map((i, key) => (
				<div key={key} style={{ color: 'gray' }}>
					{i} {key}
				</div>
			));
	};
	return (
		<div className={classes.root}>
			<Group direction={DIRECTION.Row} scope="1" initSizes={[20, 60, 20]}>
				<Box>
					<Group direction={DIRECTION.Column} scope="2" components={DIVIDERS_1}>
						<Box>{list(300)}</Box>
						<Box>{list(300)}</Box>
						<Box>{list(100)}</Box>
						<Box>{list(50)}</Box>
						<Box>{list(30)}</Box>
					</Group>
				</Box>
				<Box>
					<Group
						direction={DIRECTION.Column}
						initSizes={[70, 10, 20]}
						components={DIVIDERS_2}
						scope="3"
					>
						<Box>Something 1</Box>
						<Box>Something 2</Box>
						<div>Others</div>
					</Group>
				</Box>
				<Box>fewf</Box>
			</Group>
		</div>
	);
}

export default App;
