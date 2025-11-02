import {
	Billboard,
	type BillboardProps,
	Image,
	ScrollControls,
	Text,
	useScroll,
} from "@react-three/drei";
import {
	extend,
	type RootState,
	type ThreeElements,
	type ThreeEvent,
	useFrame,
} from "@react-three/fiber";
export default function Tree() {
	return (
		<group>
			<mesh>
				<sphereGeometry args={[0.1, 20, 20]} />
				<meshPhongMaterial />
			</mesh>
			<ambientLight intensity={0.5}  color="blue"/>
		</group>
	);
}
