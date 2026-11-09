import React, { Component, useEffect, useRef, useState, Suspense, useMemo } from 'react';
import { Canvas, extend, useFrame } from '@react-three/fiber';
import { useGLTF, useTexture, Environment, Lightformer } from '@react-three/drei';
import { BallCollider, CuboidCollider, Physics, RigidBody, useRopeJoint, useSphericalJoint } from '@react-three/rapier';
import { MeshLineGeometry, MeshLineMaterial } from 'meshline';
import * as THREE from 'three';
import IdCard from './IdCard';

extend({ MeshLineGeometry, MeshLineMaterial });

const basePath = (import.meta.env.BASE_URL || '/').replace(/\/$/, '');
const cardGLB = `${basePath}/models/card.glb`;
const cardTexturePath = `${basePath}/models/card-texture-modified-v41.png`;

class LanyardErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  componentDidCatch(error) {
    console.warn("3D Lanyard loading error, falling back to CSS 3D ID Card:", error);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="w-full h-full flex items-center justify-center">
          <IdCard />
        </div>
      );
    }
    return this.props.children;
  }
}

export default function Lanyard({ position = [0, 0, 30], gravity = [0, -40, 0], fov = 20, transparent = true, visible = true }) {
  const [ready, setReady] = useState(false);

  return (
    <LanyardErrorBoundary>
      <div className={`relative z-0 w-full h-screen flex justify-center items-center transform scale-100 origin-center overflow-visible transition-opacity duration-700 ${ready ? 'opacity-100' : 'opacity-0'}`}>
        <Canvas
          dpr={[1, 1.5]}
          performance={{ min: 0.5 }}
          frameloop={visible ? "always" : "never"}
          camera={{ position: position, fov: fov }}
          gl={{ alpha: transparent, antialias: false }}
          onCreated={({ gl }) => gl.setClearColor(new THREE.Color(0x000000), transparent ? 0 : 1)}
        >
          <ambientLight intensity={Math.PI} />
          <Physics gravity={gravity} timeStep={1 / 60} paused={!visible}>
            <Suspense fallback={null}>
              <Band visible={visible} onReady={() => setReady(true)} />
            </Suspense>
          </Physics>
          <Environment blur={0.75} resolution={256}>
            <Lightformer intensity={2} color="white" position={[0, -1, 5]} rotation={[0, 0, Math.PI / 3]} scale={[100, 0.1, 1]} />
            <Lightformer intensity={3} color="white" position={[-1, -1, 1]} rotation={[0, 0, Math.PI / 3]} scale={[100, 0.1, 1]} />
            <Lightformer intensity={3} color="white" position={[1, 1, 1]} rotation={[0, 0, Math.PI / 3]} scale={[100, 0.1, 1]} />
            <Lightformer intensity={10} color="white" position={[-10, 0, 14]} rotation={[0, Math.PI / 2, Math.PI / 3]} scale={[100, 10, 1]} />
          </Environment>
        </Canvas>
      </div>
    </LanyardErrorBoundary>
  );
}

// Outside the component to prevent recreating vectors on every render
const vec = new THREE.Vector3();
const ang = new THREE.Vector3();
const rot = new THREE.Vector3();
const dir = new THREE.Vector3();

function Band({ maxSpeed = 50, minSpeed = 0, visible = true, onReady }) {
  const band = useRef(), fixed = useRef(), j1 = useRef(), j2 = useRef(), j3 = useRef(), card = useRef();
  // Lower angularDamping so the card spins freely; linearDamping keeps swinging natural
  const segmentProps = { type: 'dynamic', canSleep: true, colliders: false, angularDamping: 1, linearDamping: 4 };

  const { nodes, materials } = useGLTF(cardGLB);
  
  // Create a dynamic texture with the word "DEVELOPER"
  const texture = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 750;
    canvas.height = 128;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#111111'; // dark background for rope
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = 'white';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = 'bold 90px "Inter", "Arial", sans-serif';
    ctx.fillText('DEVELOPER', canvas.width / 2, canvas.height / 2 + 5);
    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
    tex.anisotropy = 16;
    tex.colorSpace = THREE.SRGBColorSpace;
    return tex;
  }, []);

  // Combined front+back texture — the model's UVs map left half to front, right half to back
  const cardTexture = useTexture(cardTexturePath);
  cardTexture.flipY = false;
  
  const [curve] = useState(() => new THREE.CatmullRomCurve3([new THREE.Vector3(), new THREE.Vector3(), new THREE.Vector3(), new THREE.Vector3()]));
  const [dragged, drag] = useState(false);
  const [hovered, hover] = useState(false);
  const [isSmall, setIsSmall] = useState(() => typeof window !== 'undefined' && window.innerWidth < 1024);
  // Track pointer position to compute drag velocity for spin-on-release
  const lastPointer = useRef({ x: 0, y: 0 });
  const dragVelocity = useRef({ x: 0, y: 0 });

  useRopeJoint(fixed, j1, [[0, 0, 0], [0, 0, 0], 1]);
  useRopeJoint(j1, j2, [[0, 0, 0], [0, 0, 0], 1]);
  useRopeJoint(j2, j3, [[0, 0, 0], [0, 0, 0], 1]);
  useSphericalJoint(j3, card, [[0, 0, 0], [0, 1.50, 0]]);

  useEffect(() => {
    if (hovered) {
      document.body.style.cursor = dragged ? 'grabbing' : 'grab';
      return () => void (document.body.style.cursor = 'auto');
    }
  }, [hovered, dragged]);

  useEffect(() => {
    const handleResize = () => {
      setIsSmall(window.innerWidth < 1024);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  useEffect(() => {
    if (onReady) {
      const timer = setTimeout(() => onReady(), 50);
      return () => clearTimeout(timer);
    }
  }, [onReady]);

  useFrame((state, delta) => {
    if (!visible) return;
    if (dragged && card.current && typeof card.current.setNextKinematicTranslation === 'function') {
      vec.set(state.pointer.x, state.pointer.y, 0.5).unproject(state.camera);
      dir.copy(vec).sub(state.camera.position).normalize();
      vec.copy(state.camera.position).add(dir.multiplyScalar(state.camera.position.length()));
      [card, j1, j2, j3, fixed].forEach((ref) => ref.current?.wakeUp && ref.current.wakeUp());
      card.current.setNextKinematicTranslation({ x: vec.x - dragged.x, y: vec.y - dragged.y, z: vec.z - dragged.z });
      // Track pointer delta each frame while dragging
      dragVelocity.current = {
        x: state.pointer.x - lastPointer.current.x,
        y: state.pointer.y - lastPointer.current.y,
      };
      lastPointer.current = { x: state.pointer.x, y: state.pointer.y };
    }
    if (
      fixed.current &&
      j1.current && typeof j1.current.translation === 'function' &&
      j2.current && typeof j2.current.translation === 'function' &&
      j3.current && typeof j3.current.translation === 'function' &&
      card.current && typeof card.current.translation === 'function' &&
      typeof card.current.angvel === 'function' &&
      typeof card.current.rotation === 'function' &&
      band.current
    ) {
      [j1, j2].forEach((ref) => {
        if (!ref.current.lerped) ref.current.lerped = new THREE.Vector3().copy(ref.current.translation());
        const clampedDistance = Math.max(0.1, Math.min(1, ref.current.lerped.distanceTo(ref.current.translation())));
        ref.current.lerped.lerp(ref.current.translation(), delta * (minSpeed + clampedDistance * (maxSpeed - minSpeed)));
      });
      curve.points[0].copy(j3.current.translation());
      curve.points[1].copy(j2.current.lerped);
      curve.points[2].copy(j1.current.lerped);
      curve.points[3].copy(fixed.current.translation());
      band.current.geometry.setPoints(curve.getPoints(32));
      
      // Let the card swing freely — do NOT cancel Y rotation so it can show both faces
      if (!dragged) {
        ang.copy(card.current.angvel());
        rot.copy(card.current.rotation());
        // Only gently stabilize X & Z tilt; leave Y completely free to spin
        card.current.setAngvel({ x: ang.x - rot.x * 0.03, y: ang.y, z: ang.z - rot.z * 0.03 });
      }
    }
  });

  curve.curveType = 'chordal';
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping;

  return (
    <>
      <group position={[0, 4, 0]}>
        <RigidBody ref={fixed} {...segmentProps} type="fixed" />
        <RigidBody position={[0, -1, 0]} ref={j1} {...segmentProps}>
          <BallCollider args={[0.1]} />
        </RigidBody>
        <RigidBody position={[0, -2, 0]} ref={j2} {...segmentProps}>
          <BallCollider args={[0.1]} />
        </RigidBody>
        <RigidBody position={[0, -3, 0]} ref={j3} {...segmentProps}>
          <BallCollider args={[0.1]} />
        </RigidBody>
        <RigidBody position={[0, -4, 0]} ref={card} {...segmentProps} type={dragged ? 'kinematicPosition' : 'dynamic'}>
          <CuboidCollider args={[0.8, 1.125, 0.01]} />
          <group
            scale={2.25}
            position={[0, -1.2, -0.05]}
            onPointerOver={() => hover(true)}
            onPointerOut={() => hover(false)}
            onPointerUp={(e) => {
              e.target.releasePointerCapture(e.pointerId);
              // Apply a Y-axis torque impulse based on how fast the user was dragging
              if (card.current && typeof card.current.applyTorqueImpulse === 'function') {
                const spinStrength = dragVelocity.current.x * 18;
                // Ensure at least a small spin so the card always flips to show both sides
                const impulse = Math.abs(spinStrength) > 0.5 ? spinStrength : (Math.random() > 0.5 ? 3 : -3);
                card.current.applyTorqueImpulse({ x: 0, y: impulse, z: 0 });
              }
              dragVelocity.current = { x: 0, y: 0 };
              drag(false);
            }}
            onPointerDown={(e) => (e.target.setPointerCapture(e.pointerId), drag(new THREE.Vector3().copy(e.point).sub(vec.copy(card.current.translation()))))}>
            <mesh geometry={nodes.card.geometry}>
              <meshPhysicalMaterial 
                map={cardTexture} 
                map-anisotropy={16} 
                clearcoat={0} 
                roughness={0.85} 
                metalness={0.05} 
                side={THREE.DoubleSide} 
                transparent={true}
              />
            </mesh>
            <mesh geometry={nodes.clip.geometry} material={materials.metal} material-roughness={0.3} />
            <mesh geometry={nodes.clamp.geometry} material={materials.metal} />
          </group>
        </RigidBody>
      </group>
      <mesh ref={band}>
        <meshLineGeometry />
        <meshLineMaterial
          color="white"
          resolution={isSmall ? [1000, 2000] : [1000, 1000]}
          useMap
          map={texture}
          repeat={[-6, 1]}
          lineWidth={1}
        />
      </mesh>
    </>
  );
}
