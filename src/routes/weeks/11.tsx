import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/weeks/11")({
	component: RouteComponent,
});

import combined from "@/../public/sfx/combined.mp3";
function RouteComponent() {
	const [played, setPlayed] = useState(false);
	useEffect(() => {
		setPlayed(true);
		const audio = new Audio(combined);
		audio.play().catch((error) => {
			// Handle potential autoplay policy restrictions
			console.log("Autoplay prevented:", error);
			setPlayed(false);
		});

		return () => {
			audio.pause();
			audio.currentTime = 0;
		};
	}, []);

	function playSound() {
		if (played) return;
		const audio = new Audio(combined);
		audio.play().catch((error) => {
			console.log("Play prevented:", error);
		});

		setPlayed(true);
	}

	return (
		<div
			className="w-[100vw] h-[100vh] bg-slate-900 relative"
			onClick={playSound}
		>
			<div className="absolute left-4 top-4 bg-slate-50 rounded-2xl z-10 p-2 drop-shadow-2xl">
				<Volume2 />
			</div>
			<div className="absolute w-screen h-screen flex flex-col items-center justify-center z-10">
				<div className="bg-slate-50 p-4 rounded-2xl max-w-2xl">
					<ReturnLink />
					<h1 className="text-4xl mb-4">
						The second mouse does NOT get the cheese!
					</h1>
					<p>
						Today we're taking a break from the more fosused learning to cover
						something that was only said really in passing.
						<br />
						<br />
						<b className="font-mono">[DAVID]</b>, please, the second mouse does
						NOT get the cheese! The blockchain and cryptocurrency are not all
						they've claimed to be. I know you have friends who are into it and I
						know that it sounds like a good idea - technological solutions to
						societal problems sound really appealing. But it's a trap! We're
						falling for the 20th century ideology all over again! Listen to the
						ideas behind the Ethereum chain alone: they've called it 'an
						infinite machine' and 'the world's computer'. This is exactly what
						we thought in the 20th century, when we thought with better science
						and smarter machines we could control the world.
						<br />
						<br />
						The ideas that drive these technologies are not ones that support
						the vast network of information that we already naturally
						consturucted over decades, they instead seek to tear it apart,
						financializing bit by bit till every packet is accompanied by
						dollars. Because fundamentally that's what these tools are being
						used for - control. Tools for those who missed out playing God in
						the 20th century to convince us to let them in the 21st. Don't be
						the bigger fool.
						<br />
						<br />
						Also, while it's not like this tech has zero uses,{" "}
						<i>
							medial records? On the blockchain? A public, immutable, append
							only ledger?
						</i>{" "}
						I cannot think of a worse use case. The privacy implications alone
						are enough to dismiss this case. I do not my next surgery details to
						be viewable by my boss and nor I think do you.
						<br />
						<br />
						Anyway, rant over. Apologies for the tone and such, the internet is
						a topic I'm paruticularly passionate about. I built this from
						scratch as my journal after all! If you have time, please watch the
						great documentary{" "}
						<a
							href="https://www.youtube.com/watch?v=YQ_xWvX1n9g"
							className="underline text-blue-400"
						>
							Line Goes Up.
						</a>{" "}
						It's a fantastic deep dive into the history of cryptocurreny and the
						people and idologies behind it.
					</p>
				</div>
			</div>

			<Canvas
				gl={{ alpha: false }}
				shadows={true}
				camera={{
					near: 0.01,
					far: 110,
					fov: 75,
				}}
			>
				<Experience count={200} />
			</Canvas>
		</div>
	);
}

import { Text } from "@react-three/drei";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Physics, RigidBody } from "@react-three/rapier";
import { type FC, Suspense, useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { Volume2 } from "lucide-react";
import ReturnLink from "@/components/ReturnLink";

interface IProps {
	count?: number;
}

const coinGeometry = new THREE.CylinderGeometry(1, 1, 0.25, 32);

function Box({ z }: { z: number }) {
	// const { nodes, materials } = useGLTF("/coin.glb");

	// const { viewport, camera } = useThree();
	// const { width, height } = viewport.getCurrentViewport(camera, [0, 0, z]);

	const [data] = useState({
		// x: THREE.MathUtils.randFloatSpread(2),
		x: (Math.random() - 0.5) * 10,
		// y: THREE.MathUtils.randFloatSpread(height),
		y: 6 * z * 0.8 + 0.5,
		z: (Math.random() - 0.5) * 10,
		rX: Math.random() * Math.PI,
		rY: Math.random() * Math.PI,
		rZ: Math.random() * Math.PI,
	});

	const coin = useRef<THREE.Group<THREE.Object3DEventMap>>(null);

	const coinMaterial = new THREE.MeshStandardMaterial({
		color: "#d97706",
		metalness: 0.7,
		roughness: 0.5,
	});

	return (
		<RigidBody colliders="hull" mass={1} restitution={0.8} canSleep>
			<mesh
				castShadow
				position={[data.x, data.y, data.z]}
				rotation={[data.rX, data.rY, data.rZ]}
				geometry={coinGeometry}
				material={coinMaterial}
			/>
		</RigidBody>
	);
}

const Experience: FC<IProps> = ({ count = 0 }) => {
	const directionalLightRef = useRef<THREE.DirectionalLight>(null);

	const { camera } = useThree();

	useEffect(() => {
		camera.lookAt(new THREE.Vector3(0, 0, 0));
	}, []);

	return (
		<>
			<color attach="background" args={["#0f172a"]} />
			<ambientLight color={"white"} intensity={2} />
			<directionalLight
				ref={directionalLightRef}
				position={[10, 10, 10]}
				intensity={4}
				castShadow
				shadow-mapSize={[1024, 1024]}
				shadow-camera-near={1}
				shadow-camera-far={35}
				shadow-camera-top={20}
				shadow-camera-right={20}
				shadow-camera-bottom={-20}
				shadow-camera-left={-20}
			/>
			<Suspense>
				<Physics debug={false} gravity={[0, -1.62, 0]}>
					{Array.from({ length: count }, (_, i) => (
						<Box key={i} z={i} />
					))}

					<RigidBody type="fixed" friction={4}>
						<mesh position-y={-3}>
							<boxGeometry args={[70, 0.5, 70]} />
							<meshStandardMaterial transparent={true} opacity={0.0} />
						</mesh>
					</RigidBody>
				</Physics>
			</Suspense>
		</>
	);
};
