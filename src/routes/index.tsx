import Tree from "@/components/Tree";
import {
	Billboard,
	type BillboardProps,
	Image,
	ScrollControls,
	Text,
	useScroll,
} from "@react-three/drei";
import {
	Canvas,
	extend,
	type RootState,
	type ThreeElements,
	type ThreeEvent,
	useFrame,
} from "@react-three/fiber";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { easing, geometry } from "maath";
import { generate } from "random-words";
import { type JSX, useLayoutEffect, useMemo, useRef, useState } from "react";
import { suspend } from "suspend-react";
import colors from "tailwindcss/colors";
import * as THREE from "three";

export const Route = createFileRoute("/")({
	component: App,
});

extend(geometry);
const inter = import("@pmndrs/assets/fonts/inter_regular.woff");

function App(): JSX.Element {
	return (
		<div className="w-[100vw] h-[100vh] bg-slate-900">
			<Canvas dpr={[1, 1.5]}>
				<ScrollControls pages={4} infinite>
					<Scene position={[0, 1.5, 0]} />
				</ScrollControls>
			</Canvas>
		</div>
	);
}

// Scene component props extend R3F's GroupProps
function Scene(props: ThreeElements["group"]) {
	const ref = useRef<THREE.Group>(null);
	const scroll = useScroll();
	const [hovered, hover] = useState<number | null>(null);

	useFrame((state: RootState, delta: number) => {
		if (ref.current) {
			ref.current.rotation.y = -scroll.offset * (Math.PI * 2); // Rotate contents
		}
		state.events.update(); // Raycasts every frame rather than on pointer-move
		easing.damp3(
			state.camera.position,
			[-state.pointer.x * 2, state.pointer.y * 2 + 4.5, 9],
			0.3,
			delta,
		);
		state.camera.lookAt(0, 0, 0);
	});

	return (
		<>
			<group>
				<Text
					font={suspend(inter).default}
					fontSize={0.4}
					position={[-10, 7, -10]}
					anchorX="left"
					color={colors.slate[200]}
				>
					The tree of knowledge{`\n`}Scroll and click to explore
				</Text>
			</group>
			<group ref={ref} {...props}>
				<Cards
					category="weeks"
					from={0}
					len={Math.PI * 2}
					amount={12}
					radius={5.25}
					rotation={scroll.offset * (Math.PI * 2)}
					onPointerOver={hover}
					onPointerOut={hover}
				/>
				<ActiveCard hovered={hovered} />
				<Tree></Tree>
			</group>
		</>
	);
}

// Props interface for the Cards component
interface CardsProps extends Omit<ThreeElements["group"], "children"> {
	category: string;
	from?: number;
	len?: number;
	amount: number;
	radius?: number;
	rotation?: number;
	onPointerOver: (index: number | null) => void;
	onPointerOut: (index: number | null) => void;
}

function Cards({
	category,
	from = 0,
	len = Math.PI * 2,
	radius = 5.25,
	amount,
	rotation = 0,
	onPointerOver,
	onPointerOut,
	...props
}: CardsProps) {
	const [hovered, hover] = useState<number | null>(null);
	const textPosition = from + (amount / 2 / amount) * len;
	const [currentRotation, setCurrentRotation] = useState(rotation);
	const scroll = useScroll();
	const cardTolerance = len / (2 * amount);
	const navigate = useNavigate();
	useFrame(() => {
		// Calculate the rotation based on scroll, same as what was passed from Scene
		const newRotation = scroll.offset * (Math.PI * 2);

		// This check avoids infinite re-renders if the value is the same.
		// For the focused calculation, a small tolerance might be needed.
		if (Math.abs(newRotation - currentRotation) > 0.0001) {
			setCurrentRotation(newRotation);
		}
	});
	return (
		<group {...props}>
			<Billboard
				position={[
					Math.sin(textPosition) * radius * 1.4,
					0.5,
					Math.cos(textPosition) * radius * 1.4,
				]}
			>
				<Text
					font={suspend(inter).default}
					fontSize={0.25}
					anchorX="center"
					color={colors.slate[200]}
				>
					{category}
				</Text>
			</Billboard>
			{Array.from({ length: amount }, (_, i) => {
				const angle = from + (i / amount) * len;
				return (
					<Card
						key={angle}
						onPointerOver={(e: ThreeEvent<PointerEvent>) => (
							e.stopPropagation(), hover(i), onPointerOver(i)
						)}
						onPointerOut={() => (hover(null), onPointerOut(null))}
						position={[Math.sin(angle) * radius, 0, Math.cos(angle) * radius]}
						rotation={[0, Math.PI / 2 + angle, 0]}
						active={hovered !== null}
						hovered={hovered === i}
						// focused when rotation between angle - len/(2*amount) and angle +
						// len/(2*amount)
						focused={
							currentRotation >= angle - cardTolerance &&
							currentRotation <= angle + cardTolerance
						}
						url={`/img${Math.floor(i % 10) + 1}.jpg`}
						onClick={() => navigate({ to: `/weeks/${i + 1}` })}
					/>
				);
			})}
		</group>
	);
}

type GroupProps = ThreeElements["group"];

// Props interface for the Card component
interface CardProps extends GroupProps {
	url: string;
	active: boolean;
	hovered: boolean;
	focused: boolean;
}

function Card({ url, active, hovered, focused, ...props }: CardProps) {
	const ref = useRef<THREE.Mesh>(null); // Ref to the <Image> component (which is a Mesh)

	useFrame((state: RootState, delta: number) => {
		if (ref.current) {
			const f = hovered ? 1.4 : active ? 1.25 : 1;
			// rotate to face the front if hovered
			const targetRotationY = focused ? 0.5 * Math.PI : 0;
			easing.damp(ref.current.rotation, "y", targetRotationY, 0.1, delta);
			easing.damp3(
				ref.current.position,
				[0, hovered ? 0.25 : 0, 0],
				0.1,
				delta,
			);
			easing.damp3(ref.current.scale, [1.618 * f, 1 * f, 1], 0.15, delta);
		}
	});

	return (
		<group {...props}>
			<Image
				ref={ref}
				transparent
				radius={0.075}
				url={url}
				scale={[1.618, 1, 1]}
				side={THREE.DoubleSide}
			/>
		</group>
	);
}

// Define the type for the <Image> material properties we animate
type ImageMaterialType = THREE.ShaderMaterial & {
	zoom: number;
	opacity: number;
};

// Props interface for the ActiveCard component
interface ActiveCardProps extends BillboardProps {
	hovered: number | null;
}

function ActiveCard({ hovered, ...props }: ActiveCardProps) {
	const ref = useRef<THREE.Mesh<THREE.BufferGeometry, ImageMaterialType>>(null);
	const name = useMemo(() => generate({ exactly: 2 }).join(" "), [hovered]);

	useLayoutEffect(() => {
		if (ref.current) {
			ref.current.material.zoom = 0.8;
		}
	}, [hovered]);

	useFrame((state: RootState, delta: number) => {
		if (ref.current) {
			easing.damp(ref.current.material, "zoom", 1, 0.5, delta);
			easing.damp(
				ref.current.material,
				"opacity",
				hovered !== null ? 1 : 0,
				0.3,
				delta,
			);
		}
	});

	return (
		<Billboard {...props}>
			<Text
				font={suspend(inter).default}
				fontSize={0.5}
				position={[2.15, 3.85, 0]}
				anchorX="left"
				color={colors.slate[50]}
			>
				{hovered !== null && `${name}\n${hovered + 1}`}
			</Text>
			<Image
				ref={ref}
				transparent
				radius={0.3}
				position={[0, 1.5, 0]}
				scale={[3.5, 1.618 * 3.5, 0.2, 1]}
				url={`/img${Math.floor((hovered ?? 0) % 10) + 1}.jpg`}
			/>
		</Billboard>
	);
}
