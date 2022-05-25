import Box from './components/Box/Box';
import classes from './App.module.css';
import Group from './components/Group/Group';
import { DIRECTION } from './components/Group/constants/direction';

const ITMES = 1500;
const Divider = ({ title }: { title: string }) => {
	return <div style={{ height: 40 }}>{title}</div>;
};

const COMPONENTS1 = [
	null,
	<Divider title="Test 1" />,
	<Divider title="Test 1" />,
	<Divider title="Test 1" />,
];

const COMPONENTS2 = [null, null, <Divider title="Test 1" />];

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
			<Group direction={DIRECTION.Row} scope="1" initSizes={[20, 60, 20]}>
				<Box>
					<Group direction={DIRECTION.Column} scope="2" components={COMPONENTS1}>
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
						components={COMPONENTS2}
						scope="3"
					>
						<Box>fefe</Box>
						<Box>dfe</Box>
						<div>jfoewjfoe</div>
					</Group>
				</Box>
				<Box>fewf</Box>
			</Group>
		</div>
	);
}

export default App;
