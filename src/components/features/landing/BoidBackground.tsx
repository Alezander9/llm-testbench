import { useEffect, useRef } from "react";
import * as THREE from "three";
import { GPUComputationRenderer } from "three/addons/misc/GPUComputationRenderer.js";
import {
  fragmentShaderPosition,
  fragmentShaderVelocity,
  boidVS,
  boidFS,
} from "./boid-shaders";
import TheoIcon from "../../../assets/TheoIcon256.png";

const WIDTH = 16; //originally 32
const BIRDS = WIDTH * WIDTH;
const BOUNDS = 800;
const BOUNDS_HALF = BOUNDS / 2;

interface BoidBackgroundProps {
  separationDistance?: number;
  alignmentDistance?: number;
  cohesionDistance?: number;
  centerAttractionStrength?: number;
  predatorRepulsionStrength?: number;
  predatorRepulsionRadius?: number;
  speedLimit?: number;
  cameraZoom?: number;
}

class BoidGeometry extends THREE.BufferGeometry {
  constructor() {
    super();

    const trianglesPerBoid = 2;
    const triangles = BIRDS * trianglesPerBoid;
    const points = triangles * 3;

    const vertices = new THREE.BufferAttribute(new Float32Array(points * 3), 3);
    const boidColors = new THREE.BufferAttribute(
      new Float32Array(points * 3),
      3
    );
    const references = new THREE.BufferAttribute(
      new Float32Array(points * 2),
      2
    );
    const boidVertex = new THREE.BufferAttribute(new Float32Array(points), 1);

    this.setAttribute("position", vertices);
    this.setAttribute("boidColor", boidColors);
    this.setAttribute("reference", references);
    this.setAttribute("boidVertex", boidVertex);

    let v = 0;

    function verts_push(...args: number[]) {
      for (let i = 0; i < args.length; i++) {
        vertices.array[v++] = args[i];
      }
    }

    for (let f = 0; f < BIRDS; f++) {
      // Triangle 1 of quad
      verts_push(
        -0.5,
        -0.5,
        0, // bottom left
        0.5,
        -0.5,
        0, // bottom right
        0.5,
        0.5,
        0
      ); // top right

      // Triangle 2 of quad
      verts_push(
        -0.5,
        -0.5,
        0, // bottom left
        0.5,
        0.5,
        0, // top right
        -0.5,
        0.5,
        0
      ); // top left
    }

    for (let v = 0; v < triangles * 3; v++) {
      const triangleIndex = ~~(v / 3);
      const boidIndex = ~~(triangleIndex / trianglesPerBoid);
      const x = (boidIndex % WIDTH) / WIDTH;
      const y = ~~(boidIndex / WIDTH) / WIDTH;

      const c = new THREE.Color(0x666666 + (~~(v / 9) / BIRDS) * 0x666666);

      boidColors.array[v * 3 + 0] = c.r;
      boidColors.array[v * 3 + 1] = c.g;
      boidColors.array[v * 3 + 2] = c.b;

      references.array[v * 2] = x;
      references.array[v * 2 + 1] = y;

      // Add UV coordinates for the texture
      const isSecondTri = triangleIndex % 2;
      const vertexInTri = v % 3;

      if (!isSecondTri) {
        // First triangle: bottom-left, bottom-right, top-right
        boidVertex.array[v] = vertexInTri === 0 ? 0 : vertexInTri === 1 ? 1 : 2;
      } else {
        // Second triangle: bottom-left, top-right, top-left
        boidVertex.array[v] = vertexInTri === 0 ? 0 : vertexInTri === 1 ? 2 : 3;
      }
    }

    this.scale(10, 10, 1);
  }
}

export default function BoidBackground({
  separationDistance = 20.0,
  alignmentDistance = 20.0,
  cohesionDistance = 20.0,
  centerAttractionStrength = 1.0,
  predatorRepulsionStrength = 100.0,
  predatorRepulsionRadius = 100.0,
  speedLimit = 9.0,
  cameraZoom = 1.0,
}: BoidBackgroundProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const velocityUniformsRef = useRef<any>(null);
  const cameraRef = useRef<THREE.OrthographicCamera>();

  useEffect(() => {
    if (!containerRef.current) return;

    // Three.js variables
    let camera: THREE.OrthographicCamera;
    let scene: THREE.Scene;
    let renderer: THREE.WebGLRenderer;
    let gpuCompute: GPUComputationRenderer;
    let velocityVariable: any;
    let positionVariable: any;
    let positionUniforms: any;
    let velocityUniforms: any;
    let boidUniforms: any;

    // Mouse variables
    let mouseX = 0;
    let mouseY = 0;
    let windowHalfX = window.innerWidth / 2;
    let windowHalfY = window.innerHeight / 2;

    function initComputeRenderer() {
      gpuCompute = new GPUComputationRenderer(WIDTH, WIDTH, renderer);

      const dtPosition = gpuCompute.createTexture();
      const dtVelocity = gpuCompute.createTexture();

      fillPositionTexture(dtPosition);
      fillVelocityTexture(dtVelocity);

      velocityVariable = gpuCompute.addVariable(
        "textureVelocity",
        fragmentShaderVelocity,
        dtVelocity
      );
      positionVariable = gpuCompute.addVariable(
        "texturePosition",
        fragmentShaderPosition,
        dtPosition
      );

      gpuCompute.setVariableDependencies(velocityVariable, [
        positionVariable,
        velocityVariable,
      ]);
      gpuCompute.setVariableDependencies(positionVariable, [
        positionVariable,
        velocityVariable,
      ]);

      positionUniforms = positionVariable.material.uniforms;
      velocityUniforms = velocityVariable.material.uniforms;
      velocityUniformsRef.current = velocityUniforms; // Store in ref

      positionUniforms["time"] = { value: 0.0 };
      positionUniforms["delta"] = { value: 0.0 };
      velocityUniforms["time"] = { value: 1.0 };
      velocityUniforms["delta"] = { value: 0.0 };
      velocityUniforms["testing"] = { value: 1.0 };
      velocityUniforms["separationDistance"] = { value: separationDistance };
      velocityUniforms["alignmentDistance"] = { value: alignmentDistance };
      velocityUniforms["cohesionDistance"] = { value: cohesionDistance };
      velocityUniforms["centerAttractionStrength"] = {
        value: centerAttractionStrength,
      };
      velocityUniforms["predatorRepulsionStrength"] = {
        value: predatorRepulsionStrength,
      };
      velocityUniforms["predatorRepulsionRadius"] = {
        value: predatorRepulsionRadius,
      };

      velocityUniforms["speedLimit"] = { value: speedLimit };
      velocityUniforms["predator"] = { value: new THREE.Vector3() };
      velocityUniforms["cameraZoom"] = { value: cameraZoom };
      velocityVariable.material.defines.BOUNDS = BOUNDS.toFixed(2);

      velocityVariable.wrapS = THREE.RepeatWrapping;
      velocityVariable.wrapT = THREE.RepeatWrapping;
      positionVariable.wrapS = THREE.RepeatWrapping;
      positionVariable.wrapT = THREE.RepeatWrapping;

      const error = gpuCompute.init();
      if (error !== null) {
        console.error(error);
      }

      // Position compute canvas
      const computeCanvas =
        gpuCompute.getCurrentRenderTarget(positionVariable)?.texture?.image;
      if (computeCanvas instanceof HTMLCanvasElement) {
        computeCanvas.style.position = "absolute";
        computeCanvas.style.top = "0";
        computeCanvas.style.left = "0";
        computeCanvas.style.zIndex = "-1";
      }

      // Add the new windowBounds uniform
      velocityUniforms["windowBounds"] = {
        value: new THREE.Vector2(window.innerWidth, window.innerHeight),
      };
    }

    function fillPositionTexture(texture: THREE.DataTexture) {
      const theArray = texture.image.data;
      for (let k = 0, kl = theArray.length; k < kl; k += 4) {
        const x = Math.random() * BOUNDS - BOUNDS_HALF;
        const y = Math.random() * BOUNDS - BOUNDS_HALF;

        theArray[k + 0] = x;
        theArray[k + 1] = y;
        theArray[k + 2] = 0; // Set z to 0
        theArray[k + 3] = 1;
      }
    }

    function fillVelocityTexture(texture: THREE.DataTexture) {
      const theArray = texture.image.data;
      for (let k = 0, kl = theArray.length; k < kl; k += 4) {
        const x = Math.random() - 0.5;
        const y = Math.random() - 0.5;

        theArray[k + 0] = x * 10;
        theArray[k + 1] = y * 10;
        theArray[k + 2] = 0; // Set z velocity to 0
        theArray[k + 3] = 1;
      }
    }

    function updateBounds() {
      if (!velocityUniforms) return;
      velocityUniforms["windowBounds"].value.set(
        window.innerWidth,
        window.innerHeight
      );
    }

    function init() {
      // Initialize camera with orthographic projection and bounds matching our window size
      camera = new THREE.OrthographicCamera(
        -windowHalfX, // left
        windowHalfX, // right
        windowHalfY, // top
        -windowHalfY, // bottom
        1, // near
        1000 // far
      );
      cameraRef.current = camera;
      camera.position.z = 350; // Keep this the same
      camera.position.y = 0; // Center vertically
      camera.position.x = 0; // Center horizontally

      // Initialize scene
      scene = new THREE.Scene();
      scene.background = new THREE.Color(0xf1ebe5);
      scene.fog = new THREE.Fog(0xf1ebe5, 100, 1000);

      // Initialize renderer
      renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: true,
      });
      renderer.setPixelRatio(window.devicePixelRatio);
      renderer.setSize(window.innerWidth, window.innerHeight);
      if (containerRef.current) {
        renderer.domElement.style.position = "absolute";
        renderer.domElement.style.top = "0";
        renderer.domElement.style.left = "0";
        containerRef.current.appendChild(renderer.domElement);
      }

      // Initialize compute renderer
      initComputeRenderer();

      // Add initial bounds update
      updateBounds();

      // Add event listeners
      if (containerRef.current) {
        containerRef.current.style.touchAction = "none";
        containerRef.current.addEventListener("pointermove", onPointerMove);
      }
      window.addEventListener("resize", onWindowResize);

      // Initialize boids
      initBoids();
    }

    function initBoids() {
      const geometry = new BoidGeometry();

      // Add texture loader and load logo
      const textureLoader = new THREE.TextureLoader();
      const logoTexture = textureLoader.load(TheoIcon);

      boidUniforms = {
        // Remove color uniform and add logoTexture
        logoTexture: { value: logoTexture },
        texturePosition: { value: null },
        textureVelocity: { value: null },
        time: { value: 1.0 },
        delta: { value: 0.0 },
      };

      const material = new THREE.ShaderMaterial({
        uniforms: boidUniforms,
        vertexShader: boidVS,
        fragmentShader: boidFS,
        side: THREE.DoubleSide,
        // Add transparency settings
        transparent: true,
        depthWrite: false,
      });

      const boidMesh = new THREE.Mesh(geometry, material);
      boidMesh.rotation.y = Math.PI / 2;
      boidMesh.matrixAutoUpdate = false;
      boidMesh.updateMatrix();

      scene.add(boidMesh);
    }

    function onWindowResize() {
      windowHalfX = window.innerWidth / 2;
      windowHalfY = window.innerHeight / 2;

      // Update orthographic camera frustum
      camera.left = -windowHalfX;
      camera.right = windowHalfX;
      camera.top = windowHalfY;
      camera.bottom = -windowHalfY;

      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);

      updateBounds(); // Add bounds update on resize
    }

    function onPointerMove(event: PointerEvent) {
      if (event.isPrimary === false) return;

      // shift mouse position from range (0, 1) to range (-0.5, 0.5)
      mouseX = event.clientX - windowHalfX;
      mouseY = event.clientY - windowHalfY;
    }

    let last = performance.now();

    function animate() {
      const now = performance.now();
      let delta = (now - last) / 1000;

      if (delta > 1) delta = 1;
      last = now;

      requestAnimationFrame(animate);
      render(delta);
    }

    function render(delta: number) {
      // Update time uniforms
      positionUniforms["time"].value = performance.now();
      positionUniforms["delta"].value = delta;
      velocityUniforms["time"].value = performance.now();
      velocityUniforms["delta"].value = delta;
      boidUniforms["time"].value = performance.now();
      boidUniforms["delta"].value = delta;

      // Update predator position, will be in range (-1, 1)
      velocityUniforms["predator"].value.set(
        (0.5 * mouseX) / windowHalfX,
        (-0.5 * mouseY) / windowHalfY,
        0
      );

      // Move predator position far away until position updates again
      mouseX = 10000;
      mouseY = 10000;

      // Compute new positions
      gpuCompute.compute();

      // Update boid uniforms with new positions
      boidUniforms["texturePosition"].value =
        gpuCompute.getCurrentRenderTarget(positionVariable).texture;
      boidUniforms["textureVelocity"].value =
        gpuCompute.getCurrentRenderTarget(velocityVariable).texture;

      // Render the scene
      renderer.render(scene, camera);
    }

    // Initialize everything
    init();
    animate();

    // Cleanup
    return () => {
      window.removeEventListener("resize", onWindowResize);
      containerRef.current?.removeEventListener("pointermove", onPointerMove);
      renderer.dispose();
    };
  }, []);

  // New separate effect for uniform updates
  useEffect(() => {
    const uniforms = velocityUniformsRef.current;
    if (!uniforms) return;

    uniforms.separationDistance.value = separationDistance;
    uniforms.alignmentDistance.value = alignmentDistance;
    uniforms.cohesionDistance.value = cohesionDistance;
    uniforms.centerAttractionStrength.value = centerAttractionStrength;
    uniforms.predatorRepulsionStrength.value = predatorRepulsionStrength;
    uniforms.predatorRepulsionRadius.value = predatorRepulsionRadius;
    uniforms.speedLimit.value = speedLimit;
    uniforms.cameraZoom.value = cameraZoom;
  }, [
    separationDistance,
    alignmentDistance,
    cohesionDistance,
    centerAttractionStrength,
    predatorRepulsionStrength,
    speedLimit,
    predatorRepulsionRadius,
    cameraZoom,
  ]);

  // Add new effect for camera zoom
  useEffect(() => {
    const camera = cameraRef.current;
    if (!camera) return;

    camera.zoom = cameraZoom;
    camera.updateProjectionMatrix();
  }, [cameraZoom]);

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 w-full h-full z-10"
      style={{
        touchAction: "none",
        isolation: "isolate",
      }}
    />
  );
}
