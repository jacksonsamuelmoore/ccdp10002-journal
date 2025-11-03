import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';

// Helper to convert arrays to Vector3
const vec3 = (arr) => new THREE.Vector3(...arr);

function Branch({ start, end, depth, maxDepth }) {
  // Use TubeGeometry for better visual thickness
  const points = [vec3(start), vec3(end)];
  const curve = new THREE.CatmullRomCurve3(points);

  // Calculate branch properties based on depth
  const thickness = 0.02 * (1 - depth / maxDepth);
  const color = depth < maxDepth ? new THREE.Color('#8B4513') : new THREE.Color('green'); // Change color for 'leaves'

  // Generate child branches
  const branches = [];
  if (depth < maxDepth) {
    const branchCount = 3;
    // Base spread angle (can be adjusted)
    const baseSpreadAngle = Math.PI / 4;

    // Direction vector of the current branch
    const direction = vec3(end).clone().sub(vec3(start)).normalize();
    const branchLength = vec3(end).distanceTo(vec3(start)) * 0.6;

    // Use a reference vector (e.g., world up) to find a perpendicular axis for rotation
    const up = new THREE.Vector3(0, 1, 0);
    // Find an axis perpendicular to the current branch's direction
    let axis = new THREE.Vector3().crossVectors(direction, up).normalize();

    // If direction is collinear with up (e.g., vertical branch), use another axis
    if (axis.lengthSq() < 1e-6) {
      axis = new THREE.Vector3(1, 0, 0);
      axis.cross(direction).normalize();
    }

    // Quaternion to rotate the direction vector
    const quaternion = new THREE.Quaternion();

    for (let i = 0; i < branchCount; i++) {
      // Calculate rotation angle around the axis
      const angle = (i - (branchCount - 1) / 2) * baseSpreadAngle;

      // Create a rotation quaternion
      quaternion.setFromAxisAngle(axis, angle);

      // Rotate the direction vector
      const newDirection = direction.clone().applyQuaternion(quaternion).normalize();

      // Calculate new end point
      const newEnd = vec3(end).clone().add(newDirection.multiplyScalar(branchLength));

      branches.push(
        <Branch
          key={i}
          start={end}
          end={newEnd.toArray()}
          depth={depth + 1}
          maxDepth={maxDepth}
        />
      );
    }
  }

  return (
    <group>
      {/* Branch Tube (better than line) */}
      <mesh>
        <tubeGeometry args={[curve, 20, thickness, 8, false]} />
        <meshPhongMaterial color={color} />
      </mesh>

      {/* Joint sphere at end of branch */}
      <mesh position={end}>
        {/* Reduce thickness for the joint sphere */}
        <sphereGeometry args={[thickness * 1.5, 8, 8]} />
        <meshPhongMaterial color="#654321" />
      </mesh>

      {/* Recursive child branches */}
      {branches}
    </group>
  );
}

export default function App() {
  return (
    <Canvas camera={{ position: [0, 2, 5], fov: 60 }}>
        <Tree />
        <OrbitControls enableDamping dampingFactor={0.05} />
    </Canvas>
  );
}

function Tree() {
  const groupRef = useRef();

  useFrame((state) => {
    if (groupRef.current) {
      // Gentle rotation for effect
      groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.3) * 0.2;
    }
  });

  return (
    <group ref={groupRef} position={[0, -0.5, 0]}> {/* Lower the whole tree a bit */}
      {/* Root sphere */}
      <mesh position={[0, 0, 0]}>
        <sphereGeometry args={[0.08, 8, 8]} />
        <meshPhongMaterial color="#654321" />
      </mesh>

      {/* Main trunk and branches */}
      <Branch
        start={[0, 0, 0]}
        end={[0, 1.2, 0]} // Initial trunk is longer
        depth={0} // Start depth at 0 for full fractal behavior
        maxDepth={6}
      />

      <ambientLight intensity={1} color="#c0c0c0" />
      <directionalLight position={[5, 5, 5]} intensity={2} color="white" />
      <directionalLight position={[-5, 5, -5]} intensity={1} color="lightblue" />
    </group>
  );
}
