import React, { Component, useEffect, useRef, useState, Suspense, useMemo } from 'react';
import { Canvas, extend, useFrame, useThree } from '@react-three/fiber';
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

export default function Lanyard({ position = [0, 0, 14], gravity = [0, -40, 0], fov = 18, transparent = true, visible = true }) {
  const [ready, setReady] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || typeof document === 'undefined') return null;

  return (
    <LanyardErrorBoundary>
      <div 
        className={`relative w-full h-full flex justify-center items-center transition-opacity duration-500 ${ready && visible ? 'opacity-100' : 'opacity-0'}`}
        style={{ width: '100%', height: '100%' }}
      >
        <Canvas
          dpr={[1, 1.5]}
          performance={{ min: 0.5 }}
          frameloop={visible ? "always" : "never"}
          camera={{ position: position, fov: fov }}
          gl={{ alpha: transparent, antialias: false, powerPreference: "high-performance" }}
          style={{ width: '100%', height: '100%', pointerEvents: 'auto' }}
          onCreated={({ gl }) => {
            gl.setClearColor(new THREE.Color(0x000000), transparent ? 0 : 1);
          }}
        >
          <ambientLight intensity={Math.PI} />
          <Physics gravity={gravity} timeStep={1 / 60} paused={!visible}>
            <Suspense fallback={null}>
              <Band visible={visible} onReady={() => setReady(true)} fov={fov} />
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

// Reusable vectors to prevent allocation in hot animation loops
const vec = new THREE.Vector3();
const ang = new THREE.Vector3();
const dir = new THREE.Vector3();

function Band({ maxSpeed = 50, minSpeed = 0, visible = true, onReady, fov = 18 }) {
  const { size } = useThree();
  const band = useRef(), fixed = useRef(), j1 = useRef(), j2 = useRef(), j3 = useRef(), card = useRef();
  const cardMesh = useRef();
  const segmentProps = { type: 'dynamic', canSleep: true, colliders: false, angularDamping: 1, linearDamping: 4 };

  const { nodes, materials } = useGLTF(cardGLB);
  
  // Create dynamic texture for lanyard strap
  const texture = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 750;
    canvas.height = 128;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#111111';
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

  const cardTexture = useTexture(cardTexturePath);
  cardTexture.flipY = false;
  cardTexture.wrapS = cardTexture.wrapT = THREE.ClampToEdgeWrapping;
  cardTexture.colorSpace = THREE.SRGBColorSpace;

  const [curve] = useState(() => new THREE.CatmullRomCurve3([
    new THREE.Vector3(),
    new THREE.Vector3(),
    new THREE.Vector3(),
    new THREE.Vector3()
  ]));

  const [dragged, drag] = useState(false);
  const [, hover] = useState(false);
  const isDraggingRef = useRef(false);
  const lastPointer = useRef({ x: 0, y: 0 });
  const dragVelocity = useRef({ x: 0, y: 0 });
  const pointerDownData = useRef({ x: 0, y: 0, pointX: 0, time: 0 });
  const targetYaw = useRef(0);
  const isFlipping = useRef(false);
  const lastFlipDir = useRef(1);

  // Rope segment length for an optimal drop
  const segLen = 0.48;

  // Calculate top anchor in local canvas coordinates:
  // With camera at [0, 0, 14] and vertical FOV `fov`:
  const vHeight = useMemo(() => 2 * Math.tan((fov * Math.PI / 180) / 2) * 14, [fov]);
  // Anchor starts right at top edge of the canvas (vHeight * 0.5 + 0.05)
  const anchorY = useMemo(() => vHeight * 0.5 + 0.05, [vHeight]);

  // Rope joints setup
  useRopeJoint(fixed, j1, [[0, 0, 0], [0, 0, 0], segLen]);
  useRopeJoint(j1, j2, [[0, 0, 0], [0, 0, 0], segLen]);
  useRopeJoint(j2, j3, [[0, 0, 0], [0, 0, 0], segLen]);
  useSphericalJoint(j3, card, [[0, 0, 0], [0, 1.45, 0]]);

  useEffect(() => {
    if (onReady) {
      const timer = setTimeout(() => onReady(), 50);
      return () => clearTimeout(timer);
    }
  }, [onReady]);

  useFrame((state, delta) => {
    if (!visible) return;

    // Clamp delta to prevent physics explosion during tab switch or lag spikes
    const safeDelta = Math.min(Math.max(delta, 0), 0.033);

    // Kinematic translation when dragged
    if (dragged && card.current && typeof card.current.setNextKinematicTranslation === 'function') {
      vec.set(state.pointer.x, state.pointer.y, 0.5).unproject(state.camera);
      dir.copy(vec).sub(state.camera.position).normalize();
      const distance = -state.camera.position.z / dir.z;
      vec.copy(state.camera.position).add(dir.multiplyScalar(distance));
      
      [card, j1, j2, j3, fixed].forEach((ref) => ref.current?.wakeUp && ref.current.wakeUp());
      card.current.setNextKinematicTranslation({ x: vec.x - dragged.x, y: vec.y - dragged.y, z: vec.z - dragged.z });
      
      dragVelocity.current = {
        x: state.pointer.x - lastPointer.current.x,
        y: state.pointer.y - lastPointer.current.y,
      };
      lastPointer.current = { x: state.pointer.x, y: state.pointer.y };
    }

    // Physics rope interpolation & smooth flipping controller
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
        const dist = ref.current.lerped.distanceTo(ref.current.translation());
        if (dist > 1.2) {
          ref.current.lerped.copy(ref.current.translation());
        } else {
          const clampedDistance = Math.max(0.1, Math.min(1, dist));
          const lerpAlpha = Math.min(1, Math.max(0, safeDelta * (minSpeed + clampedDistance * (maxSpeed - minSpeed))));
          ref.current.lerped.lerp(ref.current.translation(), lerpAlpha);
        }
      });
      curve.points[0].copy(j3.current.translation());
      curve.points[1].copy(j2.current.lerped);
      curve.points[2].copy(j1.current.lerped);
      curve.points[3].copy(fixed.current.translation());
      band.current.geometry.setPoints(curve.getPoints(32));
      
      const currentRot = card.current.rotation(); // { x, y, z, w }
      ang.copy(card.current.angvel());

      if (isFlipping.current) {
        // Compute yaw angle from quaternion
        const currentYaw = 2 * Math.atan2(currentRot.y, currentRot.w);
        let diff = (targetYaw.current - currentYaw) % (Math.PI * 2);
        if (diff > Math.PI) diff -= Math.PI * 2;
        if (diff < -Math.PI) diff += Math.PI * 2;

        if (Math.abs(diff) < 0.04 && Math.abs(ang.y) < 0.25) {
          isFlipping.current = false;
          card.current.setAngvel({
            x: THREE.MathUtils.clamp(ang.x * 0.9 - currentRot.x * 0.1, -10, 10),
            y: 0,
            z: THREE.MathUtils.clamp(ang.z * 0.9 - currentRot.z * 0.1, -10, 10)
          }, true);
        } else {
          const springTorque = diff * 16;
          const damping = -ang.y * 2.4;
          const newAngY = THREE.MathUtils.clamp(ang.y + (springTorque + damping) * safeDelta, -30, 30);
          card.current.setAngvel({
            x: THREE.MathUtils.clamp(ang.x * 0.9 - currentRot.x * 0.1, -10, 10),
            y: newAngY,
            z: THREE.MathUtils.clamp(ang.z * 0.9 - currentRot.z * 0.1, -10, 10)
          }, true);
        }
      } else if (!dragged) {
        // Natural gentle orientation holding: keep card facing front or back cleanly, never sideways
        const currentYaw = 2 * Math.atan2(currentRot.y, currentRot.w);
        let diff = (targetYaw.current - currentYaw) % (Math.PI * 2);
        if (diff > Math.PI) diff -= Math.PI * 2;
        if (diff < -Math.PI) diff += Math.PI * 2;
        const faceRestoreTorque = diff * 4.0;

        card.current.setAngvel({
          x: THREE.MathUtils.clamp(ang.x * 0.92 - currentRot.x * 0.1, -10, 10),
          y: THREE.MathUtils.clamp(ang.y * 0.94 + faceRestoreTorque * safeDelta, -10, 10),
          z: THREE.MathUtils.clamp(ang.z * 0.92 - currentRot.z * 0.1, -10, 10)
        });
      }
    }
  });

  curve.curveType = 'chordal';
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping;

  return (
    <>
      <RigidBody 
        ref={fixed} 
        {...segmentProps} 
        type="fixed" 
        position={[0, anchorY, 0]} 
      />
      <RigidBody 
        position={[0, anchorY - segLen, 0]} 
        ref={j1} 
        {...segmentProps}
      >
        <BallCollider args={[0.08]} />
      </RigidBody>
      <RigidBody 
        position={[0, anchorY - segLen * 2, 0]} 
        ref={j2} 
        {...segmentProps}
      >
        <BallCollider args={[0.08]} />
      </RigidBody>
      <RigidBody 
        position={[0, anchorY - segLen * 3, 0]} 
        ref={j3} 
        {...segmentProps}
      >
        <BallCollider args={[0.08]} />
      </RigidBody>
      <RigidBody 
        position={[0, anchorY - segLen * 3 - 1.45, 0]} 
        ref={card} 
        {...segmentProps} 
        type={dragged ? 'kinematicPosition' : 'dynamic'}
      >
        <CuboidCollider args={[0.8, 1.125, 0.01]} />
        <group
          ref={cardMesh}
          scale={2.25}
          position={[0, -1.2, -0.05]}
          onPointerOver={() => {
            hover(true);
            document.body.style.cursor = isDraggingRef.current ? 'grabbing' : 'grab';
          }}
          onPointerOut={() => {
            if (!isDraggingRef.current) {
              hover(false);
              document.body.style.cursor = 'auto';
            }
          }}
          onPointerDown={(e) => {
            e.stopPropagation();
            e.target.setPointerCapture(e.pointerId);
            isDraggingRef.current = true;
            document.body.style.cursor = 'grabbing';
            isFlipping.current = false;

            pointerDownData.current = {
              x: e.clientX,
              y: e.clientY,
              pointX: e.point.x,
              time: Date.now()
            };

            drag(new THREE.Vector3().copy(e.point).sub(vec.copy(card.current.translation())));
          }}
          onPointerUp={(e) => {
            e.stopPropagation();
            e.target.releasePointerCapture(e.pointerId);
            isDraggingRef.current = false;
            document.body.style.cursor = 'grab';

            const dt = Date.now() - pointerDownData.current.time;
            const dx = e.clientX - pointerDownData.current.x;
            const dy = e.clientY - pointerDownData.current.y;
            const isClick = Math.hypot(dx, dy) < 10 && dt < 400;

            if (isClick && card.current) {
              const cardPos = card.current.translation();
              const relX = pointerDownData.current.pointX - cardPos.x;
              
              let dir = lastFlipDir.current;
              if (relX > 0.05) {
                dir = -1;
              } else if (relX < -0.05) {
                dir = 1;
              } else {
                dir = -dir;
              }
              lastFlipDir.current = dir;

              targetYaw.current += dir * Math.PI;
              isFlipping.current = true;

              const currentAng = card.current.angvel();
              card.current.setAngvel({ x: currentAng.x, y: dir * 16, z: currentAng.z }, true);
            } else if (card.current && typeof card.current.applyTorqueImpulse === 'function') {
              isFlipping.current = false;
              const spinStrength = dragVelocity.current.x * 20;
              const impulse = Math.abs(spinStrength) > 0.5 ? spinStrength : (Math.random() > 0.5 ? 4 : -4);
              card.current.applyTorqueImpulse({ x: 0, y: impulse, z: 0 }, true);
            }

            dragVelocity.current = { x: 0, y: 0 };
            drag(false);
          }}
        >
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
      <mesh ref={band}>
        <meshLineGeometry />
        <meshLineMaterial
          color="white"
          resolution={[size.width, size.height]}
          useMap
          map={texture}
          repeat={[-3.5, 1]}
          lineWidth={0.78}
        />
      </mesh>
    </>
  );
}
