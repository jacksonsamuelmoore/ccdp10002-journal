import { createFileRoute } from "@tanstack/react-router";
import { useState, useRef, useEffect } from "react";
import { Camera, AlertCircle, Sparkles, Sliders } from "lucide-react";
import ReturnLink from "@/components/ReturnLink";

export const Route = createFileRoute("/weeks/12")({
	component: RouteComponent,
});

function RouteComponent() {
	const [hasPermission, setHasPermission] = useState(false);
	const [permissionDenied, setPermissionDenied] = useState(false);
	const [isLoading, setIsLoading] = useState(false);
	const [effect] = useState("motion");
	// motionDelay now represents the number of delayed frames (queue size - 1)
	const motionDelay = 3;

	// Two Canvas Refs:
	const normalCanvasRef = useRef(null); // Canvas for the CURRENT (top) frame, with blend mode
	const motionCanvasRef = useRef(null); // Canvas for the DELAYED, INVERTED (bottom) frame

	// Media Stream Refs
	const videoTrackRef = useRef(null);
	const imageCaptureRef = useRef(null);
	const [videoDimensions, setVideoDimensions] = useState({
		width: 0,
		height: 0,
	});

	// Ref to store the sequence of frames (the queue)
	// The queue stores ImageBitmap objects, which must be manually closed.
	const frameQueueRef = useRef([]);

	const requestPermission = async () => {
		setIsLoading(true);
		setPermissionDenied(false);

		try {
			const stream = await navigator.mediaDevices.getUserMedia({
				video: { facingMode: "user" },
				audio: false,
			});

			const [track] = stream.getVideoTracks();
			videoTrackRef.current = track;

			const settings = track.getSettings();
			setVideoDimensions({
				width: settings.width,
				height: settings.height,
			});

			// Use ImageCapture for non-DOM frame grabbing
			imageCaptureRef.current = new ImageCapture(track);

			setHasPermission(true);
		} catch (err) {
			console.error("Error accessing camera:", err);
			setPermissionDenied(true);
			if (videoTrackRef.current) {
				videoTrackRef.current.stop();
				videoTrackRef.current = null;
			}
		} finally {
			setIsLoading(false);
		}
	};

	// Cleanup effect to stop the camera stream when component unmounts
	useEffect(() => {
		return () => {
			if (videoTrackRef.current) {
				videoTrackRef.current.stop();
				videoTrackRef.current = null;
			}
			// Ensure all ImageBitmaps in the queue are closed on unmount
			frameQueueRef.current.forEach((bitmap) => bitmap.close());
			frameQueueRef.current = [];
		};
	}, []);

	useEffect(() => {
		if (!hasPermission || effect !== "motion" || videoDimensions.width === 0)
			return;

		const normalCanvas = normalCanvasRef.current;
		const motionCanvas = motionCanvasRef.current;
		const imageCapture = imageCaptureRef.current;

		if (!normalCanvas || !motionCanvas || !imageCapture) return;

		const { width, height } = videoDimensions;

		// Ensure both canvases have correct dimensions
		[normalCanvas, motionCanvas].forEach((canvas) => {
			if (canvas.width !== width || canvas.height !== height) {
				canvas.width = width;
				canvas.height = height;
			}
		});

		const normalCtx = normalCanvas.getContext("2d");
		const motionCtx = motionCanvas.getContext("2d");

		let animationId;

		const applyEffect = async () => {
			let currentImageBitmap;
			try {
				// 1. Capture the latest frame
				currentImageBitmap = await imageCapture.grabFrame();
			} catch (error) {
				console.warn("Could not grab frame, stopping loop.", error);
				if (animationId) cancelAnimationFrame(animationId);
				return;
			}

			// --- DRAW TO NORMAL/CURRENT CANVAS (TOP LAYER) ---
			// 2. Draw the CURRENT raw frame onto the normal canvas (The source for the blend mode)
			normalCtx.filter = "none";
			normalCtx.drawImage(currentImageBitmap, 0, 0, width, height);

			// 3. Create a clone for storage in the queue and push it
			// ImageBitmap must be cloned/transferred as it cannot be used across multiple frames easily without being closed.
			// transferToImageBitmap is a performance optimization, falling back to using the captured bitmap directly.
			const frameForQueue = currentImageBitmap.transferToImageBitmap
				? currentImageBitmap.transferToImageBitmap()
				: currentImageBitmap;

			frameQueueRef.current.push(frameForQueue);

			// If transferToImageBitmap was used, the original is transferred (no need to close).
			// If it was NOT used, the frameForQueue is a reference to currentImageBitmap, and we must close the original (which is the same object reference).
			// Since we are pushing it to the queue to be managed, we only close the original if transfer was NOT used.
			// However, grabFrame is guaranteed to return a new ImageBitmap, so we only need to close the ones dequeued.
			// Since we draw the original `currentImageBitmap` in step 2, and then push `frameForQueue` which is a clone/transfer, we must close the original one we captured.

			// If transferToImageBitmap is not available or not used, we are using the ImageBitmap reference from grabFrame directly.
			// In either case, we must ensure we close the frame we *captured* once we are done with it.
			// Since we are storing a clone/transfer in the queue, we can safely close the original captured frame now, as the clone/transfer is managed by the queue.
			if (frameForQueue !== currentImageBitmap) {
				currentImageBitmap.close();
			}

			// 4. Maintain Queue Length
			// Max length is the desired delay (motionDelay) + 1 (the current frame)
			const maxLength = motionDelay + 1;

			while (frameQueueRef.current.length > maxLength) {
				// Dequeue the oldest frame (at index 0)
				const oldestFrame = frameQueueRef.current.shift();
				if (oldestFrame) {
					oldestFrame.close(); // IMPORTANT: Close to free memory
				}
			}

			// --- DRAW TO MOTION/DELAYED CANVAS (BOTTOM LAYER) ---
			// The delayed frame is the OLDEST frame in the queue (the one at index 0)
			const delayedFrame = frameQueueRef.current[0];

			if (delayedFrame) {
				// 5. Apply INVERT filter to the delayed frame
				motionCtx.filter = "invert(100%)";

				// 6. Draw the OLDEST, INVERTED frame onto the motion canvas
				motionCtx.drawImage(delayedFrame, 0, 0, width, height);
				motionCtx.filter = "none"; // Reset filter
			} else {
				// Clear canvas until the queue fills up
				motionCtx.clearRect(0, 0, width, height);
			}

			animationId = requestAnimationFrame(applyEffect);
		};

		applyEffect(); // Start the loop

		return () => {
			if (animationId) {
				cancelAnimationFrame(animationId);
			}
			// Cleanup function for the frames still in the queue when the component updates or unmounts
			frameQueueRef.current.forEach((bitmap) => bitmap.close());
			frameQueueRef.current = [];
		};
	}, [hasPermission, motionDelay, videoDimensions]);

	// --- JSX (UI) with Two Canvases ---

	if (!hasPermission) {
		return (
			<div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 flex items-center justify-center p-4">
				<div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full text-center">
					<div className="mb-6 flex justify-center">
						<div className="bg-blue-100 p-4 rounded-full">
							<Camera className="w-12 h-12 text-blue-600" />
						</div>
					</div>
					<h1 className="text-2xl font-bold text-gray-900 mb-3">
						Camera Access Required
					</h1>
					<p className="text-gray-600 mb-6">
						This page needs access to your camera to display the live feed.
					</p>
					{permissionDenied && (
						<div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
							<AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
							<div className="text-left">
								<p className="text-sm text-red-800 font-medium mb-1">
									Camera access was denied
								</p>
								<p className="text-xs text-red-700">
									Please enable camera permissions in your browser settings and
									try again.
								</p>
							</div>
						</div>
					)}
					<button
						onClick={requestPermission}
						disabled={isLoading}
						className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200"
					>
						{isLoading ? "Requesting Access..." : "Enable Camera"}
					</button>
				</div>
			</div>
		);
	}

	return (
		<>
			<div className="w-screen h-screen overflow-hidden absolute z-2 text-white text-lg font-mono flex flex-col items-center">
				<div className="rounded-lg flex items-center  ">
					Reflect on yourself.
				</div>
				<ReturnLink></ReturnLink>
			</div>

			<div className="fixed inset-0 bg-black invert-100">
				<div className="relative w-full h-full brightness-180 contrast-120">
					<canvas
						ref={motionCanvasRef}
						className="absolute w-full h-full object-cover opacity-50"
						style={{ zIndex: 1 }}
					/>

					<canvas
						ref={normalCanvasRef}
						className="absolute w-full h-full object-cover opacity-100"
						style={{ zIndex: 0 }}
					/>
				</div>
			</div>
		</>
	);
}
export default RouteComponent;
