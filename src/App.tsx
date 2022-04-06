import './App.css';

const Comp = () => {
	return <div>Component</div>;
};

const Group = () => {
	return (
		<div>
			<Comp />
			<Comp />
			<Comp />
			<Comp />
			<Comp />
		</div>
	);
};

function App() {
	return (
		<div className="App">
			<Group></Group>
		</div>
	);
}

export default App;
