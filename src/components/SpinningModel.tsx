import React, { useRef, useEffect, useState, useMemo } from "react";
import { Canvas, useFrame, useLoader } from "@react-three/fiber";
import { OBJLoader } from "three/addons/loaders/OBJLoader.js";
import * as THREE from "three";
import colors from "tailwindcss/colors";
interface SpinningModelProps {
	url: string;
}
interface ModelProps extends SpinningModelProps {
	scale: number;
}

export default function SpinningModel({ url, scale }: ModelProps) {
	const meshRef = useRef<THREE.Group>(null);
	const obj = useLoader(OBJLoader, url);
	const currentScale = useRef<number>(scale);
	const targetScale = useRef<number>(scale);
	const wireframeGeometries = useMemo((): THREE.WireframeGeometry[] => {
		const geometries: THREE.WireframeGeometry[] = [];

		obj.traverse((child: THREE.Object3D) => {
			if ((child as THREE.Mesh).isMesh) {
				const geometry = (child as THREE.Mesh).geometry.clone();
				const wireframe = new THREE.WireframeGeometry(geometry);
				geometries.push(wireframe);
			}
		});

		if (geometries.length === 0) {
			console.error(`Could not find geometry in ${url}`);
		}

		return geometries;
	}, [obj, url]);
	useEffect(() => {
		targetScale.current = scale;
	}, [scale]);

	useEffect(() => {
		if (obj && meshRef.current) {
			const box = new THREE.Box3().setFromObject(obj);
			const size = box.getSize(new THREE.Vector3());
			const maxDim = Math.max(size.x, size.y, size.z);

			const normalizedScale = (1 / maxDim) * currentScale.current;
			meshRef.current.scale.setScalar(normalizedScale);

			const center = box.getCenter(new THREE.Vector3());
			meshRef.current.position.set(
				-center.x * normalizedScale,
				-center.y * normalizedScale,
				-center.z * normalizedScale,
			);
		}
	}, [obj]);

	useFrame((state, delta) => {
		if (meshRef.current) {
			meshRef.current.rotation.y += delta * 0.5;

			// Smooth scale animation with easing
			const diff = targetScale.current - currentScale.current;
			if (Math.abs(diff) > 0.001) {
				currentScale.current += diff * delta * 5; // Ease factor

				const box = new THREE.Box3().setFromObject(obj);
				const size = box.getSize(new THREE.Vector3());
				const maxDim = Math.max(size.x, size.y, size.z);
				const normalizedScale = (1 / maxDim) * currentScale.current;

				meshRef.current.scale.setScalar(normalizedScale);

				const center = box.getCenter(new THREE.Vector3());
				meshRef.current.position.set(
					-center.x * normalizedScale,
					-center.y * normalizedScale,
					-center.z * normalizedScale,
				);
			}
		}
	});

	return (
		<group ref={meshRef} visible={currentScale.current > 0.05}>
			{wireframeGeometries.map((geometry, index) => (
				<lineSegments key={index} geometry={geometry}>
					<lineBasicMaterial color="#93c5fd" />
				</lineSegments>
			))}
		</group>
	);
}
