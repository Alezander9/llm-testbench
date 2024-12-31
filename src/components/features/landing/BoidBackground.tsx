import { useEffect, useRef } from "react";
import * as THREE from "three";
import { GPUComputationRenderer } from "three/addons/misc/GPUComputationRenderer.js";
import {
  fragmentShaderPosition,
  fragmentShaderVelocity,
  birdVS,
  birdFS,
} from "./boid-shaders";

const WIDTH = 32;
const BIRDS = WIDTH * WIDTH;
const BOUNDS = 800;
const BOUNDS_HALF = BOUNDS / 2;

class BirdGeometry extends THREE.BufferGeometry {
  constructor() {
    super();

    const trianglesPerBird = 3;
    const triangles = BIRDS * trianglesPerBird;
    const points = triangles * 3;

    const vertices = new THREE.BufferAttribute(new Float32Array(points * 3), 3);
    const birdColors = new THREE.BufferAttribute(
      new Float32Array(points * 3),
      3
    );
    const references = new THREE.BufferAttribute(
      new Float32Array(points * 2),
      2
    );
    const birdVertex = new THREE.BufferAttribute(new Float32Array(points), 1);

    this.setAttribute("position", vertices);
    this.setAttribute("birdColor", birdColors);
    this.setAttribute("reference", references);
    this.setAttribute("birdVertex", birdVertex);

    let v = 0;

    function verts_push(...args: number[]) {
      for (let i = 0; i < args.length; i++) {
        vertices.array[v++] = args[i];
      }
    }

    const wingsSpan = 20;

    for (let f = 0; f < BIRDS; f++) {
      // Body
      verts_push(0, -0, -20, 0, 4, -20, 0, 0, 30);

      // Left Wing
      verts_push(0, 0, -15, -wingsSpan, 0, 0, 0, 0, 15);

      // Right Wing
      verts_push(0, 0, 15, wingsSpan, 0, 0, 0, 0, -15);
    }

    for (let v = 0; v < triangles * 3; v++) {
      const triangleIndex = ~~(v / 3);
      const birdIndex = ~~(triangleIndex / trianglesPerBird);
      const x = (birdIndex % WIDTH) / WIDTH;
      const y = ~~(birdIndex / WIDTH) / WIDTH;

      const c = new THREE.Color(0x666666 + (~~(v / 9) / BIRDS) * 0x666666);

      birdColors.array[v * 3 + 0] = c.r;
      birdColors.array[v * 3 + 1] = c.g;
      birdColors.array[v * 3 + 2] = c.b;

      references.array[v * 2] = x;
      references.array[v * 2 + 1] = y;

      birdVertex.array[v] = v % 9;
    }

    this.scale(0.2, 0.2, 0.2);
  }
}

export default function BoidBackground() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Three.js variables
    let camera: THREE.PerspectiveCamera;
    let scene: THREE.Scene;
    let renderer: THREE.WebGLRenderer;
    let gpuCompute: GPUComputationRenderer;
    let velocityVariable: any;
    let positionVariable: any;
    let positionUniforms: any;
    let velocityUniforms: any;
    let birdUniforms: any;

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

      positionUniforms["time"] = { value: 0.0 };
      positionUniforms["delta"] = { value: 0.0 };
      velocityUniforms["time"] = { value: 1.0 };
      velocityUniforms["delta"] = { value: 0.0 };
      velocityUniforms["testing"] = { value: 1.0 };
      velocityUniforms["separationDistance"] = { value: 1.0 };
      velocityUniforms["alignmentDistance"] = { value: 1.0 };
      velocityUniforms["cohesionDistance"] = { value: 1.0 };
      velocityUniforms["freedomFactor"] = { value: 1.0 };
      velocityUniforms["predator"] = { value: new THREE.Vector3() };
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
    }

    function fillPositionTexture(texture: THREE.DataTexture) {
      const theArray = texture.image.data;
      for (let k = 0, kl = theArray.length; k < kl; k += 4) {
        const x = Math.random() * BOUNDS - BOUNDS_HALF;
        const y = Math.random() * BOUNDS - BOUNDS_HALF;
        const z = Math.random() * BOUNDS - BOUNDS_HALF;

        theArray[k + 0] = x;
        theArray[k + 1] = y;
        theArray[k + 2] = z;
        theArray[k + 3] = 1;
      }
    }

    function fillVelocityTexture(texture: THREE.DataTexture) {
      const theArray = texture.image.data;
      for (let k = 0, kl = theArray.length; k < kl; k += 4) {
        const x = Math.random() - 0.5;
        const y = Math.random() - 0.5;
        const z = Math.random() - 0.5;

        theArray[k + 0] = x * 10;
        theArray[k + 1] = y * 10;
        theArray[k + 2] = z * 10;
        theArray[k + 3] = 1;
      }
    }

    function init() {
      // Initialize camera
      camera = new THREE.PerspectiveCamera(
        75,
        window.innerWidth / window.innerHeight,
        1,
        3000
      );
      camera.position.z = 350;

      // Initialize scene
      scene = new THREE.Scene();
      scene.background = new THREE.Color(0xffffff);
      scene.fog = new THREE.Fog(0xffffff, 100, 1000);

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

      // Add event listeners
      if (containerRef.current) {
        containerRef.current.style.touchAction = "none";
        containerRef.current.addEventListener("pointermove", onPointerMove);
      }
      window.addEventListener("resize", onWindowResize);

      // Initialize birds
      initBirds();
    }

    function initBirds() {
      const geometry = new BirdGeometry();

      // For Vertex and Fragment
      birdUniforms = {
        color: { value: new THREE.Color(0xff2200) },
        texturePosition: { value: null },
        textureVelocity: { value: null },
        time: { value: 1.0 },
        delta: { value: 0.0 },
      };

      const material = new THREE.ShaderMaterial({
        uniforms: birdUniforms,
        vertexShader: birdVS,
        fragmentShader: birdFS,
        side: THREE.DoubleSide,
      });

      const birdMesh = new THREE.Mesh(geometry, material);
      birdMesh.rotation.y = Math.PI / 2;
      birdMesh.matrixAutoUpdate = false;
      birdMesh.updateMatrix();

      scene.add(birdMesh);
    }

    function onWindowResize() {
      windowHalfX = window.innerWidth / 2;
      windowHalfY = window.innerHeight / 2;

      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();

      renderer.setSize(window.innerWidth, window.innerHeight);
    }

    function onPointerMove(event: PointerEvent) {
      if (event.isPrimary === false) return;

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
      birdUniforms["time"].value = performance.now();
      birdUniforms["delta"].value = delta;

      // Update predator position
      velocityUniforms["predator"].value.set(
        (0.5 * mouseX) / windowHalfX,
        (-0.5 * mouseY) / windowHalfY,
        0
      );

      // Compute new positions
      gpuCompute.compute();

      // Update bird uniforms with new positions
      birdUniforms["texturePosition"].value =
        gpuCompute.getCurrentRenderTarget(positionVariable).texture;
      birdUniforms["textureVelocity"].value =
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
