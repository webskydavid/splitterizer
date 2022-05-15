const calculatePercent = (size: number, offset: number, totalSize: number) => {
	return ((size - offset) / totalSize) * 100;
};

export default calculatePercent;
