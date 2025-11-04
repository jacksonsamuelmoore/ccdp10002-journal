import ReturnLink from "@/components/ReturnLink";
import { createFileRoute } from "@tanstack/react-router";
import React, { useState, useEffect, useRef } from "react";

export const Route = createFileRoute("/weeks/9")({
	component: RouteComponent,
});

const INITIAL_TIME_MS = 60000; // 60 seconds in milliseconds

function RouteComponent() {
	// State for the remaining time in milliseconds
	const [timeRemaining, setTimeRemaining] = useState(INITIAL_TIME_MS);
	// State to control when the button is shown
	const [isFinished, setIsFinished] = useState(false);
	const [isChecked, setIsChecked] = useState(false);

	// Ref to store the interval ID so we can clear it later
	const intervalRef = useRef(null);
	const toggleCheckbox = () => {
		setIsChecked((prev) => !prev);
	};

	// --- Countdown Logic ---
	useEffect(() => {
		// Start the interval only if the timer hasn't finished
		if (timeRemaining > 0) {
			const startTime = Date.now();

			// Set an interval to update the time every 10 milliseconds (for millisecond display)
			intervalRef.current = setInterval(() => {
				const elapsedTime = Date.now() - startTime;
				const newTime = INITIAL_TIME_MS - elapsedTime;

				if (newTime <= 0) {
					// Stop the timer
					clearInterval(intervalRef.current);
					setTimeRemaining(0);
					setIsFinished(true);
				} else {
					setTimeRemaining(newTime);
				}
			}, 10);
		}

		// Cleanup function: Clear the interval when the component unmounts or the effect re-runs
		return () => {
			if (intervalRef.current) {
				clearInterval(intervalRef.current);
			}
		};
	}, []); // Empty dependency array means this effect runs once on mount

	// --- Formatting the Time ---

	// Calculate seconds and milliseconds for display
	const seconds = Math.floor(timeRemaining / 1000);
	// Calculate the remaining milliseconds (the last two digits)
	const milliseconds = Math.floor((timeRemaining % 1000) / 10);

	// Pad the seconds and milliseconds with leading zeros for a clean look
	const formattedSeconds = String(seconds).padStart(2, "0");
	const formattedMilliseconds = String(milliseconds).padStart(2, "0");


	return (
		<div className="w-screen h-screen flex flex-col justify-center items-center bg-slate-800 text-white">
			<h1 className="text-lg">Please remain still and think about nothing for</h1>

			<div style={{ fontSize: "4rem", fontWeight: "bold", margin: "30px 0" }}>
				{formattedSeconds}:{formattedMilliseconds}s
			</div>

			{isFinished && (
				<div
					className="flex items-center space-x-3 cursor-pointer p-4 bg-gray-50 border border-gray-300 rounded-md shadow-sm w-fit"
					onClick={toggleCheckbox}
				>
					{/* Custom Checkbox Area */}
					<div className="relative w-6 h-6 border-2 border-gray-400 bg-white flex items-center justify-center transition-all duration-200 ease-in-out">
						{/* The visual checkmark (only appears when checked) */}
						{isChecked && (
							<svg
								className="w-5 h-5 text-slate-700"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
								xmlns="http://www.w3.org/2000/svg"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={3}
									d="M5 13l4 4L19 7"
								/>
							</svg>
						)}
					</div>

					{/* Captcha Text */}
					<span className="text-gray-700 select-none text-lg font-medium">
						I'm not a robot
					</span>
				</div>
			)}
			{isChecked && (
				<div className="mt-6">
					<ReturnLink />
				</div>
			)}
		</div>
	);
}
