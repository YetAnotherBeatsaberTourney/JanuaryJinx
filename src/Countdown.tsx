import React, { useEffect, useState } from "react";
import "./Countdown.css";

function Countdown() {
	const [timeLeft, setTimeLeft] = useState(900); // Default to 15 minutes in seconds
	
	useEffect(() => {
		const urlParams = new URLSearchParams(window.location.search);
		const minutes = parseInt(urlParams.get("minutes") || "15", 10);
		setTimeLeft(minutes * 60);
		
		const interval = setInterval(() => {
			setTimeLeft((prevTime) => {
				if (prevTime <= 1) {
					clearInterval(interval);
					return 0;
				}
				return prevTime - 1;
			});
		}, 1000);
		
		return () => clearInterval(interval);
	}, []);
	
	const formatTime = (seconds: number) => {
		const minutes = Math.floor(seconds / 60);
		const remainingSeconds = seconds % 60;
		return `${minutes}:${remainingSeconds < 10 ? "0" : ""}${remainingSeconds}`;
	};
	
	return (
		<div className={"background"}>
			<h1 className={"countDownClock"}>{formatTime(timeLeft)}</h1>
		</div>
	);
}

export default Countdown;