let throttleTimer = false;

const throttle = (callback: any, time: number) => {
	if (throttleTimer) return;
	throttleTimer = true;
	setTimeout(() => {
		callback();
		throttleTimer = false;
	}, time);
};

export default throttle;
