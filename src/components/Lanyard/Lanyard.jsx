import React, { Component, useEffect, useRef, useState, Suspense, useMemo, useCallback } from 'react';
import { createPortal } from 'react-dom';
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

export default function Lanyard({ containerRef, position = [0, 0, 15], gravity = [0, -40, 0], fov = 18, transparent = true, visible = true }) {
  const [ready, setReady] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || typeof document === 'undefined') return null;

  return createPortal(
    <LanyardErrorBoundary>
      <div 
        className={`fixed inset-0 w-screen h-screen z-30 pointer-events-none transition-opacity duration-700 ${ready && visible ? 'opacity-100' : 'opacity-0'}`}
        style={{ pointerEvents: 'none' }}
      >
        <Canvas
          dpr={[1, 1.5]}
          performance={{ min: 0.5 }}
          frameloop={visible ? "always" : "never"}
          camera={{ position: position, fov: fov }}
          gl={{ alpha: transparent, antialias: false }}
          style={{ pointerEvents: 'none', width: '100%', height: '100%' }}
          onCreated={({ gl }) => {
            gl.setClearColor(new THREE.Color(0x000000), transparent ? 0 : 1);
          }}
        >
          <ambientLight intensity={Math.PI} />
          <Physics gravity={gravity} timeStep={1 / 60} paused={!visible}>
            <Suspense fallback={null}>
              <Band visible={visible} onReady={() => setReady(true)} containerRef={containerRef} />
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
    </LanyardErrorBoundary>,
    document.body
  );
}

// Reusable vectors to prevent allocation in hot animation loops
const vec = new THREE.Vector3();
const ang = new THREE.Vector3();
const dir = new THREE.Vector3();

function Band({ maxSpeed = 50, minSpeed = 0, visible = true, onReady, containerRef }) {
  const { camera, gl } = useThree();
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
  
  const [curve] = useState(() => new THREE.CatmullRomCurve3([new THREE.Vector3(), new THREE.Vector3(), new THREE.Vector3(), new THREE.Vector3()]));
  const [dragged, drag] = useState(false);
  const [hovered, hover] = useState(false);
  const isDraggingRef = useRef(false);

  // Position & Flip Controls
  const lastPointer = useRef({ x: 0, y: 0 });
  const dragVelocity = useRef({ x: 0, y: 0 });
  const pointerDownData = useRef({ x: 0, y: 0, pointX: 0, time: 0 });
  const targetYaw = useRef(0);
  const isFlipping = useRef(false);
  const lastFlipDir = useRef(1);

  // Calculate anchor position based on containerRef in screen space
  const getAnchorPos = useCallback(() => {
    const vHeight = 2 * Math.tan((18 * Math.PI / 180) / 2) * 15;
    const aspect = typeof window !== 'undefined' ? window.innerWidth / window.innerHeight : 16 / 9;
    const vWidth = vHeight * aspect;

    if (containerRef?.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const ndcX = (centerX / window.innerWidth) * 2 - 1;
      const worldX = (ndcX * vWidth) / 2;

      const topY = rect.top;
      const ndcY = -(topY / window.innerHeight) * 2 + 1;
      const worldY = (ndcY * vHeight) / 2 + 0.6;

      return { worldX, worldY };
    }

    return { worldX: vWidth * 0.22, worldY: vHeight * 0.5 + 0.6 };
  }, [containerRef]);

  const initAnchor = useMemo(() => getAnchorPos(), [getAnchorPos]);
  const currentAnchor = useRef(initAnchor);

  // Keep anchor in sync with scroll & window resize
  useEffect(() => {
    const update = () => {
      currentAnchor.current = getAnchorPos();
    };
    update();
    window.addEventListener('resize', update, { passive: true });
    window.addEventListener('scroll', update, { passive: true });
    return () => {
      window.removeEventListener('resize', update);
      window.removeEventListener('scroll', update);
    };
  }, [getAnchorPos]);

  // Rope joints setup
  useRopeJoint(fixed, j1, [[0, 0, 0], [0, 0, 0], 1]);
  useRopeJoint(j1, j2, [[0, 0, 0], [0, 0, 0], 1]);
  useRopeJoint(j2, j3, [[0, 0, 0], [0, 0, 0], 1]);
  useSphericalJoint(j3, card, [[0, 0, 0], [0, 1.50, 0]]);

  // Raycasting to dynamically allow pointer events ONLY when hovering or dragging the 3D card
  useEffect(() => {
    const canvas = gl.domElement;
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const checkHit = (clientX, clientY) => {
      if (!visible || !cardMesh.current) return false;
      mouse.x = (clientX / window.innerWidth) * 2 - 1;
      mouse.y = -(clientY / window.innerHeight) * 2 + 1;
      raycaster.setFromCamera(mouse, camera);
      const hits = raycaster.intersectObjects([cardMesh.current], true);
      return hits.length > 0;
    };

    const handlePointerMove = (e) => {
      if (isDraggingRef.current) {
        canvas.style.pointerEvents = 'auto';
        return;
      }
      const hit = checkHit(e.clientX, e.clientY);
      if (hit) {
        canvas.style.pointerEvents = 'auto';
        document.body.style.cursor = 'grab';
        hover(true);
      } else {
        canvas.style.pointerEvents = 'none';
        document.body.style.cursor = 'auto';
        hover(false);
      }
    };

    const handlePointerDown = (e) => {
      if (isDraggingRef.current) return;
      if (checkHit(e.clientX, e.clientY)) {
        canvas.style.pointerEvents = 'auto';
      }
    };

    window.addEventListener('pointermove', handlePointerMove, { passive: true });
    window.addEventListener('pointerdown', handlePointerDown, { passive: true });

    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerdown', handlePointerDown);
      canvas.style.pointerEvents = 'none';
      document.body.style.cursor = 'auto';
    };
  }, [camera, gl.domElement, visible]);

  useEffect(() => {
    if (onReady) {
      const timer = setTimeout(() => onReady(), 50);
      return () => clearTimeout(timer);
    }
  }, [onReady]);

  useFrame((state, delta) => {
    if (!visible) return;

    // Follow scroll position smoothly for the top fixed anchor
    if (fixed.current && typeof fixed.current.setNextKinematicTranslation === 'function') {
      fixed.current.setNextKinematicTranslation({
        x: currentAnchor.current.worldX,
        y: currentAnchor.current.worldY,
        z: 0
      });
    }

    // Kinematic translation when dragged across the ENTIRE screen
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
        const clampedDistance = Math.max(0.1, Math.min(1, ref.current.lerped.distanceTo(ref.current.translation())));
        ref.current.lerped.lerp(ref.current.translation(), delta * (minSpeed + clampedDistance * (maxSpeed - minSpeed)));
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
          card.current.setAngvel({ x: ang.x - currentRot.x * 0.04, y: 0, z: ang.z - currentRot.z * 0.04 }, true);
        } else {
          const springTorque = diff * 16;
          const damping = -ang.y * 2.4;
          const newAngY = THREE.MathUtils.clamp(ang.y + (springTorque + damping) * delta, -30, 30);
          card.current.setAngvel({
            x: ang.x - currentRot.x * 0.04,
            y: newAngY,
            z: ang.z - currentRot.z * 0.04
          }, true);
        }
      } else if (!dragged) {
        // Gentle tilt stabilization on X & Z; leave Y free
        card.current.setAngvel({
          x: ang.x - currentRot.x * 0.04,
          y: ang.y * 0.99,
          z: ang.z - currentRot.z * 0.04
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
        type="kinematicPosition" 
        position={[initAnchor.worldX, initAnchor.worldY, 0]} 
      />
      <RigidBody 
        position={[initAnchor.worldX, initAnchor.worldY - 0.9, 0]} 
        ref={j1} 
        {...segmentProps}
      >
        <BallCollider args={[0.1]} />
      </RigidBody>
      <RigidBody 
        position={[initAnchor.worldX, initAnchor.worldY - 1.8, 0]} 
        ref={j2} 
        {...segmentProps}
      >
        <BallCollider args={[0.1]} />
      </RigidBody>
      <RigidBody 
        position={[initAnchor.worldX, initAnchor.worldY - 2.7, 0]} 
        ref={j3} 
        {...segmentProps}
      >
        <BallCollider args={[0.1]} />
      </RigidBody>
      <RigidBody 
        position={[initAnchor.worldX, initAnchor.worldY - 3.8, 0]} 
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
              gl.domElement.style.pointerEvents = 'none';
              document.body.style.cursor = 'auto';
            }
          }}
          onPointerDown={(e) => {
            e.stopPropagation();
            e.target.setPointerCapture(e.pointerId);
            isDraggingRef.current = true;
            gl.domElement.style.pointerEvents = 'auto';
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
              // Click detected: flip right or left
              const cardPos = card.current.translation();
              const relX = pointerDownData.current.pointX - cardPos.x;
              
              let dir = lastFlipDir.current;
              if (relX > 0.05) {
                dir = -1; // Clicked right half -> flip left
              } else if (relX < -0.05) {
                dir = 1;  // Clicked left half -> flip right
              } else {
                dir = -dir; // Center click -> alternate flip
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
          resolution={[1000, 1000]}
          useMap
          map={texture}
          repeat={[-6, 1]}
          lineWidth={1}
        />
      </mesh>
    </>
  );
}
