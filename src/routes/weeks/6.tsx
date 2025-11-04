import { createFileRoute } from "@tanstack/react-router";
import React, { useMemo, useRef } from "react";
import * as THREE from "three";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import ReturnLink from "@/components/ReturnLink";
import { Move } from "lucide-react";

// --- Constants (Increased size for true GPU test) ---
const GRID_SIZE = 256; // Use a power of 2 for optimal GPU texture handling (256x256 = 65,536 pendulums)
const PENDULUM_COUNT = GRID_SIZE * GRID_SIZE;
const SIZE = 0.01; // Smaller pixel size for massive grid
const G = 1.0;
const DT = 0.1;
const MAX_VELOCITY = 5.0;

// --- GPGPU Setup ---

// Vertex shader to pass texture coordinates
const passThroughVertexShader = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position, 1.0);
  }
`;

// --- 2. Simulation Shader (Fragment Shader) ---
// This is where the physics calculation (the .update() method) now lives.
const physicsFragmentShader = `
  uniform sampler2D tCurrent; // Texture containing the current state
  uniform float u_dt;
  uniform float u_g;
  uniform float u_max_vel;

  varying vec2 vUv;

  // The double pendulum equations ported to GLSL
  void main() {
    // Read the current state from the texture pixel at vUv
    // R: angle1, G: angleV1, B: angle2, A: angleV2
    vec4 current = texture2D(tCurrent, vUv);
    float angle1 = current.r;
    float angleV1 = current.g;
    float angle2 = current.b;
    float angleV2 = current.a;

    // Constants (m1=1, m2=1, L1=1, L2=1 for simplicity in the shader)
    float m1 = 1.0;
    float m2 = 1.0;
    float l1 = 1.0;
    float l2 = 1.0;

    // Calculate angular accelerations (angleA1, angleA2)

    float delta = angle1 - angle2;
    float sin_delta = sin(delta);
    float cos_delta = cos(delta);

    float den1 = l1 * (2.0 * m1 + m2 - m2 * cos(2.0 * delta));
    float den2 = l2 * (2.0 * m1 + m2 - m2 * cos(2.0 * delta));

    // Numerator for A1
    float numA1_1 = -u_g * (2.0 * m1 + m2) * sin(angle1);
    float numA1_2 = -m2 * u_g * sin(angle1 - 2.0 * angle2);
    float numA1_3 = -2.0 * sin_delta * m2;
    float numA1_4 = (angleV2 * angleV2 * l2 + angleV1 * angleV1 * l1 * cos_delta);
    float angleA1 = (numA1_1 + numA1_2 + numA1_3 * numA1_4) / den1;

    // Numerator for A2
    float numA2_1 = angleV1 * angleV1 * l1 * (m1 + m2);
    float numA2_2 = u_g * (m1 + m2) * cos(angle1);
    float numA2_3 = angleV2 * angleV2 * l2 * m2 * cos_delta;
    float angleA2 = (2.0 * sin_delta) * (numA2_1 + numA2_2 + numA2_3) / den2;

    // Apply integration (Euler)
    float newAngleV1 = angleV1 + angleA1 * u_dt;
    float newAngleV2 = angleV2 + angleA2 * u_dt;

    // Simple clamp for velocity (constrain)
    newAngleV1 = clamp(newAngleV1, -u_max_vel, u_max_vel);
    newAngleV2 = clamp(newAngleV2, -u_max_vel, u_max_vel);

    float newAngle1 = angle1 + newAngleV1 * u_dt;
    float newAngle2 = angle2 + newAngleV2 * u_dt;

    // Write the new state to the output texture
    gl_FragColor = vec4(newAngle1, newAngleV1, newAngle2, newAngleV2);
  }
`;

// --- 3. Rendering Vertex Shader ---
// This shader determines the final color and position of the mesh.
const renderVertexShader = `
  // Three.js built-in uniforms and attributes
  attribute float instanceId;
  uniform sampler2D tCurrent;

  varying vec3 vColor;

  void main() {
    // 1. Map instanceId to texture coordinates (vUv)
    float x_coord = mod(instanceId, float(${GRID_SIZE}));
    float y_coord = floor(instanceId / float(${GRID_SIZE}));
    vec2 vUv = vec2(x_coord / float(${GRID_SIZE}), y_coord / float(${GRID_SIZE}));

    // 2. Read calculated state (angles) from the texture
    vec4 state = texture2D(tCurrent, vUv);
    float angle1 = state.r;
    float angle2 = state.b;

    // 3. Calculate Color from Angles (same logic as before)
    // Map sin(angle) from [-1, 1] to [0, 1]
    float r = (sin(angle1) + 1.0) / 2.0;
    float g = (sin(angle2) + 1.0) / 2.0;
    // Blue channel is fixed to 1.0
    vColor = vec3(r, g, 1.0);

    // 4. Calculate Position from Index (constant, since the grid doesn't move)
    float offsetX = (float(${GRID_SIZE}) * ${SIZE}) / 2.0 - ${SIZE} / 2.0;
    float position_x = x_coord * ${SIZE} - offsetX;
    float position_y = y_coord * ${SIZE} - offsetX;

    vec3 final_position = position;
    final_position.x += position_x;
    final_position.y += position_y;

    // Set the output position
    gl_Position = projectionMatrix * modelViewMatrix * vec4(final_position, 1.0);
  }
`;

// --- 4. Rendering Fragment Shader ---
const renderFragmentShader = `
  varying vec3 vColor;
  void main() {
    gl_FragColor = vec4(vColor, 1.0);
  }
`;

// --- Main R3F Component ---
function GPGPUPendulumGrid() {
	const meshRef = useRef<THREE.Mesh>(null!);
	const renderer = useThree((s) => s.gl);
	let [rt1, rt2, scene, camera, material] = useMemo(() => {
		// --- Setup Initial State Texture (CPU Data) ---
		const data = new Float32Array(PENDULUM_COUNT * 4);
		const PI = Math.PI;

		for (let i = 0; i < PENDULUM_COUNT; i++) {
			const i_grid = i % GRID_SIZE;
			const j_grid = Math.floor(i / GRID_SIZE);

			const angle1 = (i_grid / GRID_SIZE) * (2 * PI) - PI;
			const angle2 = (j_grid / GRID_SIZE) * (2 * PI) - PI;

			// R: angle1, G: angleV1 (0), B: angle2, A: angleV2 (0)
			data[i * 4 + 0] = angle1;
			data[i * 4 + 1] = 0;
			data[i * 4 + 2] = angle2;
			data[i * 4 + 3] = 0;
		}

		const initialTexture = new THREE.DataTexture(
			data,
			GRID_SIZE,
			GRID_SIZE,
			THREE.RGBAFormat,
			THREE.FloatType,
		);
		initialTexture.needsUpdate = true;

		// --- Setup Frame Buffers (Render Targets) for Ping-Pong ---
		const rtOptions = {
			minFilter: THREE.NearestFilter,
			magFilter: THREE.NearestFilter,
			format: THREE.RGBAFormat,
			type: THREE.FloatType,
			depthBuffer: false,
		};
		const rt1 = new THREE.WebGLRenderTarget(GRID_SIZE, GRID_SIZE, rtOptions);
		const rt2 = new THREE.WebGLRenderTarget(GRID_SIZE, GRID_SIZE, rtOptions);

		// --- GPGPU Scene Setup ---
		const scene = new THREE.Scene();
		const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
		const geometry = new THREE.PlaneGeometry(2, 2);

		// 🎯 1. Temporary Material to Render Initial Data
		const initialMaterial = new THREE.ShaderMaterial({
			uniforms: { tInitial: { value: initialTexture } },
			vertexShader: passThroughVertexShader,
			// A simple fragment shader that just outputs the data from the texture
			fragmentShader: `
                uniform sampler2D tInitial;
                varying vec2 vUv;
                void main() {
                    gl_FragColor = texture2D(tInitial, vUv);
                }
            `,
		});
		const mesh = new THREE.Mesh(geometry, initialMaterial);
		scene.add(mesh);

		// 🎯 2. Render Initial Data into RT1
		renderer.setRenderTarget(rt1);
		renderer.render(scene, camera);

		// Remove the temporary mesh before proceeding with the physics material
		scene.remove(mesh);

		// --- Setup Physics Material (Ping-Pong Material) ---
		const physicsMaterial = new THREE.ShaderMaterial({
			uniforms: {
				tCurrent: { value: null },
				u_dt: { value: DT },
				u_g: { value: G },
				u_max_vel: { value: MAX_VELOCITY },
			},
			vertexShader: passThroughVertexShader,
			fragmentShader: physicsFragmentShader,
		});
		scene.add(new THREE.Mesh(geometry, physicsMaterial));

		return [rt1, rt2, scene, camera, physicsMaterial]; // Return the physics material
	}, [renderer]); // Dependency on renderer to ensure it's available

	// --- 5. Animation Loop (The GPGPU simulation step) ---
	useFrame(() => {
		// 1. PING: Set input texture and render to RT2
		material.uniforms.tCurrent.value = rt1.texture;
		renderer.setRenderTarget(rt2);
		renderer.render(scene, camera);

		// 2. PONG: Set input texture and render to RT1
		material.uniforms.tCurrent.value = rt2.texture;
		renderer.setRenderTarget(rt1);
		renderer.render(scene, camera);

		// 3. Final Step: Reset render target to screen and update render material
		renderer.setRenderTarget(null);
		if (meshRef.current) {
			(
				meshRef.current.material as THREE.ShaderMaterial
			).uniforms.tCurrent.value = rt1.texture;
		}

		// Swap targets for the next frame
		[rt1, rt2] = [rt2, rt1];
	});

	// --- 6. Render the Instanced Mesh (Using the Render Shader) ---
	const geometry = useMemo(() => {
		const geom = new THREE.PlaneGeometry(SIZE, SIZE); // A single square geometry
		const idArray = new Float32Array(PENDULUM_COUNT);
		for (let i = 0; i < PENDULUM_COUNT; i++) {
			idArray[i] = i; // Store the unique ID for each instance
		}
		geom.setAttribute(
			"instanceId",
			new THREE.InstancedBufferAttribute(idArray, 1),
		);
		return geom;
	}, []);

	return (
		<instancedMesh ref={meshRef} args={[geometry, undefined, PENDULUM_COUNT]}>
			<shaderMaterial
				uniforms={{
					tCurrent: { value: rt1.texture },
					u_size: { value: SIZE },
				}}
				vertexShader={renderVertexShader}
				fragmentShader={renderFragmentShader}
			/>
		</instancedMesh>
	);
}

// --- Main Route Component ---
function WebGLVisualizer() {
	const cameraZ = GRID_SIZE * SIZE;

	return (
		<div className="w-full h-screen bg-black">
			<Canvas camera={{ position: [0, 0, cameraZ], fov: 50 }} dpr={[1, 2]}>
				<OrbitControls
					enablePan={false}
					enableZoom={true}
					enableRotate={true}
				/>
				<GPGPUPendulumGrid />
			</Canvas>
		</div>
	);
}

function RouteComponent() {
	return (
		<div>
			<div className="absolute top-20 left-20 z-1">
				<div className="flex flex-col p-4 bg-black text-white rounded-2xl max-w-lg">
					<h1 className="text-3xl font-bold mb-4">Chaoticn't</h1>
					<ReturnLink />
					<p className="">
						This weeks piece is based off the work by{" "}
						<a
							href="https://www.youtube.com/watch?v=dtjb2OhEQcU"
							className="underline"
						>
							2swap
						</a>
						. The image you see is a grid of double pendulums simulated live,
						and we are mapping the changes in angle computed to their neighbors.
						I think this is the perfect visual representation of the new
						theories of chaos that we began discussing.
						<br />
						<br />
						Some pendulums spin off into chaos. Some don't. Some are inbetween.
						The visualisation shows how even this simple system contains both
						order and chaos, and that they're intertwined.
						<br />
						<br />I think that once we start to appreciate the chaoticn't nature
						of things, that we're able to start to see the interconnectness of
						the world and learn better how to interact and understand it.
					</p>
					<div className="mt-4 flex flex-row items-center gap-2">
						<Move absoluteStrokeWidth />
						Click and drag to orbit.
					</div>
				</div>
			</div>

			<WebGLVisualizer />
		</div>
	);
}

export const Route = createFileRoute("/weeks/6")({
	component: RouteComponent,
});
