import './App.css';

const Comp = () => {
	return <div>Component</div>;
};

const Group = () => {
	return (
		<div>
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
