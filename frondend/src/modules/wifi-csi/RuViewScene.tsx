import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { OrbitControls, Grid } from '@react-three/drei';
import * as THREE from 'three';

// An abstract, blocky human figure that glows green
function GlowingFigure() {
  const figureGroup = useRef<THREE.Group>(null);
  
  // Slight floating hover animation for the figure
  useFrame((state) => {
    if (figureGroup.current) {
      figureGroup.current.position.y = Math.sin(state.clock.elapsedTime) * 0.1;
    }
  });

  const bodyMaterial = new THREE.MeshStandardMaterial({
    color: '#4ade80',      // Tailwind green-400
    emissive: '#22c55e',   // Glow color
    emissiveIntensity: 0.8,
    transparent: true,
    opacity: 0.9,
    roughness: 0.2,
    metalness: 0.8
  });

  return (
    <group ref={figureGroup} position={[0, 0, 0]}>
      {/* Head */}
      <mesh position={[0, 3.2, 0]} material={bodyMaterial}>
        <boxGeometry args={[0.6, 0.6, 0.6]} />
      </mesh>
      
      {/* Torso */}
      <mesh position={[0, 1.8, 0]} material={bodyMaterial}>
        <boxGeometry args={[1.2, 1.8, 0.7]} />
      </mesh>
      
      {/* Left Arm */}
      <mesh position={[-0.9, 1.8, 0]} material={bodyMaterial}>
        <boxGeometry args={[0.4, 1.6, 0.4]} />
      </mesh>
      
      {/* Right Arm */}
      <mesh position={[0.9, 1.8, 0]} material={bodyMaterial}>
        <boxGeometry args={[0.4, 1.6, 0.4]} />
      </mesh>
      
      {/* Left Leg */}
      <mesh position={[-0.35, 0.4, 0]} material={bodyMaterial}>
        <boxGeometry args={[0.45, 1.2, 0.45]} />
      </mesh>
      
      {/* Right Leg */}
      <mesh position={[0.35, 0.4, 0]} material={bodyMaterial}>
        <boxGeometry args={[0.45, 1.2, 0.45]} />
      </mesh>
      
      {/* A glowing platform underneath the figure */}
      <mesh position={[0, -0.25, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[2.5, 2.5]} />
        <meshBasicMaterial color="#22c55e" transparent opacity={0.3} />
      </mesh>
    </group>
  );
}

// Emits radiating wireframe spheres to look like wifi radar
function RadarWaves() {
  const wave1 = useRef<THREE.Mesh>(null);
  const wave2 = useRef<THREE.Mesh>(null);
  const wave3 = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    const time = state.clock.elapsedTime * 1.5;
    
    // Scale up and wrap back to 0
    if (wave1.current && wave1.current.material instanceof THREE.MeshBasicMaterial) {
      const s = (time % 3) * 4; 
      wave1.current.scale.set(s, s, s);
      wave1.current.material.opacity = Math.max(0, 1 - (s / 12));
    }
    
    if (wave2.current && wave2.current.material instanceof THREE.MeshBasicMaterial) {
      const s = ((time + 1) % 3) * 4; 
      wave2.current.scale.set(s, s, s);
      wave2.current.material.opacity = Math.max(0, 1 - (s / 12));
    }
    
    if (wave3.current && wave3.current.material instanceof THREE.MeshBasicMaterial) {
      const s = ((time + 2) % 3) * 4; 
      wave3.current.scale.set(s, s, s);
      wave3.current.material.opacity = Math.max(0, 1 - (s / 12));
    }
  });

  const waveMaterial = new THREE.MeshBasicMaterial({
    color: '#3b82f6', // Tailwind blue-500
    wireframe: true,
    transparent: true,
    opacity: 0.5
  });

  return (
    <group position={[0, 1.5, 0]}>
      <mesh ref={wave1} material={waveMaterial} scale={[0,0,0]}>
        <sphereGeometry args={[1, 32, 32]} />
      </mesh>
      <mesh ref={wave2} material={waveMaterial} scale={[0,0,0]}>
        <sphereGeometry args={[1, 32, 32]} />
      </mesh>
      <mesh ref={wave3} material={waveMaterial} scale={[0,0,0]}>
        <sphereGeometry args={[1, 32, 32]} />
      </mesh>
    </group>
  );
}

export function RuViewScene() {
  return (
    <>
      {/* Scene Lighting */}
      <ambientLight intensity={0.2} />
      <pointLight 
        position={[0, 2, 0]} 
        intensity={2} 
        distance={10} 
        color="#22c55e" 
      />
      <directionalLight 
        position={[5, 5, 5]} 
        intensity={0.5} 
        color="#ffffff" 
      />

      {/* Grid Floor */}
      <Grid 
        position={[0, -0.3, 0]} 
        args={[30, 30]} 
        cellSize={1} 
        cellThickness={1} 
        cellColor="#1e293b" 
        sectionSize={5} 
        sectionThickness={1.5} 
        sectionColor="#334155" 
        fadeDistance={25} 
        fadeStrength={1} 
      />

      {/* Primary 3D Elements */}
      <GlowingFigure />
      <RadarWaves />

      {/* Interaction Controls */}
      <OrbitControls 
        makeDefault 
        minPolarAngle={Math.PI / 6} 
        maxPolarAngle={Math.PI / 2 - 0.05} 
        minDistance={5}
        maxDistance={25}
        autoRotate={true}
        autoRotateSpeed={0.5}
      />
    </>
  );
}
