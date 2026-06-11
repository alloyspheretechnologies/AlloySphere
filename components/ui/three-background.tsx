"use client";

import { useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Points, PointMaterial } from '@react-three/drei';
import * as THREE from 'three';

function ParticleNetwork() {
  const ref = useRef<THREE.Points>(null);

  // Generate random points in a sphere
  const [positions] = useState(() => {
    const count = 3000;
    const posArray = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const r = 20 * Math.cbrt(Math.random());
      const theta = Math.random() * 2 * Math.PI;
      const phi = Math.acos(2 * Math.random() - 1);
      
      posArray[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      posArray[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      posArray[i * 3 + 2] = r * Math.cos(phi);
    }
    return posArray;
  });

  useFrame((state, delta) => {
    if (ref.current) {
      ref.current.rotation.x -= delta / 20;
      ref.current.rotation.y -= delta / 30;
    }
  });

  return (
    <group rotation={[0, 0, Math.PI / 4]}>
      <Points ref={ref} positions={positions} stride={3} frustumCulled={false}>
        <PointMaterial
          transparent
          color="#ffffff"
          size={0.05}
          sizeAttenuation={true}
          depthWrite={false}
          opacity={0.3}
        />
      </Points>
    </group>
  );
}

export function ThreeBackground() {
  return (
    <div className="fixed inset-0 z-[-1] pointer-events-none bg-black">
      <Canvas 
        camera={{ position: [0, 0, 15], fov: 60 }} 
        dpr={[1, 2]} 
        gl={{ powerPreference: 'high-performance', antialias: false }}
        onCreated={(state) => {
          // Explicit cleanup handler on unmount
          state.gl.setClearColor('#000000');
        }}
      >
        <fog attach="fog" args={['#000000', 5, 25]} />
        <ParticleNetwork />
      </Canvas>
      
      {/* Subtle radial gradient overlay to fade out edges */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_transparent_20%,_#000000_100%)]"></div>
    </div>
  );
}
