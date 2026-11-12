import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import {
  Sun,
  CloudRain,
  CloudSun,
  Moon,
  Droplet,
  Layers,
  Sparkles,
  Maximize2,
  RefreshCw,
  Eye
} from 'lucide-react';

export type WeatherMode = 'SUNNY' | 'CLOUDY' | 'RAINY' | 'NIGHT';

interface FarmScene3DProps {
  soilMoisture: number; // e.g. 24 (%)
  fieldCapacity: number; // e.g. 32 (%)
  wiltingPoint: number; // e.g. 14 (%)
  cropType?: string; // e.g. 'Wheat', 'Maize', etc.
  weatherCondition?: string; // from API or simulation
  isIrrigating?: boolean; // triggers active water flow
  onZoneSelect?: (zoneName: string) => void;
  className?: string;
}

export const FarmScene3D: React.FC<FarmScene3DProps> = ({
  soilMoisture = 24,
  fieldCapacity = 32,
  wiltingPoint = 14,
  cropType = 'Wheat',
  weatherCondition = 'Sunny',
  isIrrigating = false,
  onZoneSelect,
  className = ''
}) => {
  const mountRef = useRef<HTMLDivElement>(null);

  // User environmental overrides (allows student/reviewer to test all weather & day/night modes!)
  const [weatherMode, setWeatherMode] = useState<WeatherMode>('SUNNY');
  const [activeZone, setActiveZone] = useState<'A' | 'B' | 'C'>('A');
  const [isWaterFlowing, setIsWaterFlowing] = useState<boolean>(isIrrigating);
  const [webGLSupported, setWebGLSupported] = useState<boolean>(true);

  // Sync prop changes
  useEffect(() => {
    setIsWaterFlowing(isIrrigating);
  }, [isIrrigating]);

  // Sync automatic weather condition if user hasn't manually overridden
  useEffect(() => {
    const w = (weatherCondition || '').toLowerCase();
    if (w.includes('rain')) setWeatherMode('RAINY');
    else if (w.includes('cloud') || w.includes('overcast')) setWeatherMode('CLOUDY');
    else if (w.includes('night')) setWeatherMode('NIGHT');
    else setWeatherMode('SUNNY');
  }, [weatherCondition]);

  // Refs for 3D state & animation loop
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const animFrameId = useRef<number | null>(null);

  // Dynamic mesh references for animated updates
  const cropsGroupRef = useRef<THREE.Group | null>(null);
  const cloudsRef = useRef<THREE.Mesh[]>([]);
  const birdsRef = useRef<{ mesh: THREE.Group; speed: number; radius: number; angle: number; y: number }[]>([]);
  const waterCanalsRef = useRef<THREE.Mesh[]>([]);
  const waterMaterialRef = useRef<THREE.MeshStandardMaterial | null>(null);
  const rainParticlesRef = useRef<THREE.Points | null>(null);
  const sunLightRef = useRef<THREE.DirectionalLight | null>(null);
  const ambientLightRef = useRef<THREE.AmbientLight | null>(null);
  const skyMeshRef = useRef<THREE.Mesh | null>(null);
  const soilMaterialRef = useRef<THREE.MeshStandardMaterial | null>(null);

  // Target camera positions for smooth zone transitions
  const targetCamPos = useRef<THREE.Vector3>(new THREE.Vector3(0, 14, 28));
  const targetCamLook = useRef<THREE.Vector3>(new THREE.Vector3(0, 2, 0));
  const currentCamLook = useRef<THREE.Vector3>(new THREE.Vector3(0, 2, 0));

  // Determine soil health status
  const isOptimal = soilMoisture >= 20;
  const isStressed = soilMoisture <= wiltingPoint;

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // Check WebGL availability
    try {
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
      if (!gl) {
        setWebGLSupported(false);
        return;
      }
    } catch {
      setWebGLSupported(false);
      return;
    }

    // 1. SCENE SETUP
    const width = container.clientWidth || 800;
    const height = container.clientHeight || 480;

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0xd1fae5, 0.015);
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.5, 300);
    camera.position.set(0, 16, 30);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.1;
    rendererRef.current = renderer;

    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // 2. LIGHTING SETUP
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
    scene.add(ambientLight);
    ambientLightRef.current = ambientLight;

    const sunLight = new THREE.DirectionalLight(0xfff7ed, 1.6);
    sunLight.position.set(25, 40, 20);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = 1024;
    sunLight.shadow.mapSize.height = 1024;
    sunLight.shadow.camera.near = 1;
    sunLight.shadow.camera.far = 120;
    sunLight.shadow.camera.left = -30;
    sunLight.shadow.camera.right = 30;
    sunLight.shadow.camera.top = 30;
    sunLight.shadow.camera.bottom = -30;
    sunLight.shadow.bias = -0.001;
    scene.add(sunLight);
    sunLightRef.current = sunLight;

    // Hemisphere sky/ground bounce light
    const hemiLight = new THREE.HemisphereLight(0xbae6fd, 0x14532d, 0.5);
    scene.add(hemiLight);

    // 3. SKY DOME
    const skyGeo = new THREE.SphereGeometry(150, 32, 16);
    const skyMat = new THREE.MeshBasicMaterial({
      color: 0x60a5fa,
      side: THREE.BackSide,
    });
    const skyMesh = new THREE.Mesh(skyGeo, skyMat);
    scene.add(skyMesh);
    skyMeshRef.current = skyMesh;

    // Sun Visual Sphere
    const sunGeo = new THREE.SphereGeometry(4, 16, 16);
    const sunMat = new THREE.MeshBasicMaterial({ color: 0xfef08a });
    const sunMesh = new THREE.Mesh(sunGeo, sunMat);
    sunMesh.position.set(30, 45, 20);
    scene.add(sunMesh);

    // 4. TERRAIN & CROP ROWS
    // Ground base
    const terrainGeo = new THREE.PlaneGeometry(80, 80, 40, 40);
    terrainGeo.rotateX(-Math.PI / 2);

    // Add subtle procedural undulation to ground
    const posAttr = terrainGeo.attributes.position;
    for (let i = 0; i < posAttr.count; i++) {
      const x = posAttr.getX(i);
      const z = posAttr.getZ(i);
      // Gentle slope towards hills in the back
      const hillWave = Math.sin(x * 0.1) * Math.cos(z * 0.1) * 0.8 + (z < -20 ? Math.pow((z + 20) * 0.15, 2) : 0);
      posAttr.setY(i, hillWave);
    }
    terrainGeo.computeVertexNormals();

    const soilMat = new THREE.MeshStandardMaterial({
      color: 0x45271a, // rich loam
      roughness: 0.85,
      metalness: 0.05,
      flatShading: false,
    });
    soilMaterialRef.current = soilMat;

    const terrainMesh = new THREE.Mesh(terrainGeo, soilMat);
    terrainMesh.receiveShadow = true;
    scene.add(terrainMesh);

    // 5. CROPS GENERATION (Rows of wheat / maize with instancing)
    const cropsGroup = new THREE.Group();
    scene.add(cropsGroup);
    cropsGroupRef.current = cropsGroup;

    // Single crop stalk geometry (composed of stem + leafy blades + golden grain head)
    const stalkGeo = new THREE.CylinderGeometry(0.04, 0.06, 1.4, 5);
    stalkGeo.translate(0, 0.7, 0);

    const leafGeo = new THREE.ConeGeometry(0.12, 0.6, 4);
    leafGeo.rotateZ(0.4);
    leafGeo.translate(0.1, 0.8, 0);

    const headGeo = new THREE.CylinderGeometry(0.08, 0.07, 0.5, 6);
    headGeo.translate(0, 1.5, 0);

    const stalkMat = new THREE.MeshStandardMaterial({ color: 0x15803d, roughness: 0.6 });
    const headMat = new THREE.MeshStandardMaterial({ color: 0xeab308, roughness: 0.5 }); // golden wheat tip

    // Generate 7 long rows of crops
    const numRows = 7;
    const plantsPerRow = 28;
    const rowSpacing = 3.2;
    const plantSpacing = 1.3;

    // Use InstancedMesh for maximum 60fps performance
    const totalPlants = numRows * plantsPerRow;
    const instancedStalks = new THREE.InstancedMesh(stalkGeo, stalkMat, totalPlants);
    const instancedHeads = new THREE.InstancedMesh(headGeo, headMat, totalPlants);
    instancedStalks.castShadow = true;
    instancedStalks.receiveShadow = true;
    instancedHeads.castShadow = true;

    const dummy = new THREE.Object3D();
    let plantIdx = 0;

    for (let r = 0; r < numRows; r++) {
      const zPos = (r - (numRows - 1) / 2) * rowSpacing;

      for (let p = 0; p < plantsPerRow; p++) {
        const xPos = (p - (plantsPerRow - 1) / 2) * plantSpacing + (Math.random() - 0.5) * 0.2;
        const scale = 0.85 + Math.random() * 0.35;
        const rotY = Math.random() * Math.PI * 2;

        dummy.position.set(xPos, 0, zPos);
        dummy.rotation.set(0, rotY, (Math.random() - 0.5) * 0.1);
        dummy.scale.set(scale, scale, scale);
        dummy.updateMatrix();

        instancedStalks.setMatrixAt(plantIdx, dummy.matrix);
        instancedHeads.setMatrixAt(plantIdx, dummy.matrix);
        plantIdx++;
      }
    }
    instancedStalks.instanceMatrix.needsUpdate = true;
    instancedHeads.instanceMatrix.needsUpdate = true;
    cropsGroup.add(instancedStalks);
    cropsGroup.add(instancedHeads);

    // 6. IRRIGATION CHANNELS & WATER PIPELINES
    const waterMat = new THREE.MeshStandardMaterial({
      color: 0x38bdf8,
      roughness: 0.1,
      metalness: 0.8,
      transparent: true,
      opacity: 0.85,
    });
    waterMaterialRef.current = waterMat;

    // Channels running alongside crop rows
    const canalGeo = new THREE.BoxGeometry(38, 0.1, 0.45);
    const canals: THREE.Mesh[] = [];

    for (let r = 0; r < numRows - 1; r++) {
      const zPos = (r - (numRows - 1) / 2) * rowSpacing + rowSpacing / 2;
      const canalMesh = new THREE.Mesh(canalGeo, waterMat);
      canalMesh.position.set(0, 0.04, zPos);
      canalMesh.receiveShadow = true;
      scene.add(canalMesh);
      canals.push(canalMesh);
    }
    waterCanalsRef.current = canals;

    // 7. TREES & COUNTRYSIDE HORIZON (Background depth)
    const treeGeo = new THREE.ConeGeometry(1.8, 4.5, 6);
    const trunkGeo = new THREE.CylinderGeometry(0.3, 0.4, 1.5, 5);
    const foliageMat = new THREE.MeshStandardMaterial({ color: 0x166534, roughness: 0.8 });
    const trunkMat = new THREE.MeshStandardMaterial({ color: 0x78350f, roughness: 0.9 });

    const treePositions = [
      [-26, 0, -22], [-22, 0, -25], [-18, 0, -28], [15, 0, -26], [22, 0, -23], [26, 0, -25],
      [-28, 0, 5], [-29, 0, 14], [28, 0, 8], [29, 0, 16],
    ];

    treePositions.forEach(([tx, ty, tz]) => {
      const treeGroup = new THREE.Group();
      const trunk = new THREE.Mesh(trunkGeo, trunkMat);
      trunk.position.y = 0.75;
      trunk.castShadow = true;
      treeGroup.add(trunk);

      const foliage = new THREE.Mesh(treeGeo, foliageMat);
      foliage.position.y = 3.2;
      foliage.castShadow = true;
      treeGroup.add(foliage);

      const s = 0.8 + Math.random() * 0.5;
      treeGroup.scale.set(s, s, s);
      treeGroup.position.set(tx, ty, tz);
      scene.add(treeGroup);
    });

    // 8. CLOUDS (Procedural soft white puff clusters)
    const cloudGeo = new THREE.DodecahedronGeometry(2.5, 1);
    const cloudMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      roughness: 0.9,
      transparent: true,
      opacity: 0.85,
    });

    const clouds: THREE.Mesh[] = [];
    for (let c = 0; c < 5; c++) {
      const cloudGroup = new THREE.Mesh(cloudGeo, cloudMat);
      cloudGroup.position.set((c - 2) * 20 + Math.random() * 5, 26 + Math.random() * 6, -10 + (Math.random() - 0.5) * 30);
      cloudGroup.scale.set(3 + Math.random() * 2, 1.2, 1.8 + Math.random());
      scene.add(cloudGroup);
      clouds.push(cloudGroup);
    }
    cloudsRef.current = clouds;

    // 9. ANIMATED BIRDS
    const birds: { mesh: THREE.Group; speed: number; radius: number; angle: number; y: number }[] = [];
    const birdGeo = new THREE.BufferGeometry();
    // V-shaped wing vertices
    const vertices = new Float32Array([
      0, 0, 0,   -0.5, 0.2, -0.3,   0, 0, 0.4,
      0, 0, 0,    0.5, 0.2, -0.3,   0, 0, 0.4
    ]);
    birdGeo.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
    const birdMat = new THREE.MeshBasicMaterial({ color: 0x1e293b, side: THREE.DoubleSide });

    for (let b = 0; b < 4; b++) {
      const bGroup = new THREE.Group();
      const bMesh = new THREE.Mesh(birdGeo, birdMat);
      bGroup.add(bMesh);
      bGroup.scale.set(0.6, 0.6, 0.6);
      scene.add(bGroup);

      birds.push({
        mesh: bGroup,
        speed: 0.008 + Math.random() * 0.005,
        radius: 20 + Math.random() * 15,
        angle: (b * Math.PI) / 2,
        y: 18 + Math.random() * 6,
      });
    }
    birdsRef.current = birds;

    // 10. RAIN PARTICLE SYSTEM (Active during rainy weather)
    const rainCount = 1200;
    const rainGeo = new THREE.BufferGeometry();
    const rainPositions = new Float32Array(rainCount * 3);

    for (let i = 0; i < rainCount * 3; i += 3) {
      rainPositions[i] = (Math.random() - 0.5) * 60;
      rainPositions[i + 1] = Math.random() * 35;
      rainPositions[i + 2] = (Math.random() - 0.5) * 60;
    }
    rainGeo.setAttribute('position', new THREE.BufferAttribute(rainPositions, 3));

    const rainMat = new THREE.PointsMaterial({
      color: 0x93c5fd,
      size: 0.25,
      transparent: true,
      opacity: 0.7,
    });
    const rainPoints = new THREE.Points(rainGeo, rainMat);
    rainPoints.visible = false;
    scene.add(rainPoints);
    rainParticlesRef.current = rainPoints;

    // 11. ANIMATION LOOP WITH WIND SWAYING & SMOOTH CAMERA
    let clock = new THREE.Clock();

    const animate = () => {
      animFrameId.current = requestAnimationFrame(animate);

      const delta = clock.getDelta();
      const time = clock.getElapsedTime();

      // Wind swaying effect on crops
      if (cropsGroupRef.current) {
        cropsGroupRef.current.rotation.z = Math.sin(time * 2.2) * 0.025;
        cropsGroupRef.current.rotation.x = Math.cos(time * 1.8) * 0.015;
      }

      // Clouds gentle drift across the sky
      clouds.forEach((cl, i) => {
        cl.position.x += delta * (1.2 + i * 0.3);
        if (cl.position.x > 45) cl.position.x = -45;
      });

      // Birds flight animation in elliptical loops
      birds.forEach((bird) => {
        bird.angle += bird.speed;
        bird.mesh.position.x = Math.cos(bird.angle) * bird.radius;
        bird.mesh.position.z = Math.sin(bird.angle) * (bird.radius * 0.7) - 5;
        bird.mesh.position.y = bird.y + Math.sin(time * 3 + bird.angle) * 0.8;
        bird.mesh.rotation.y = -bird.angle + Math.PI / 2;
      });

      // Water flowing ripple pulse when irrigation active
      if (waterMaterialRef.current) {
        if (isWaterFlowing) {
          waterMaterialRef.current.opacity = 0.85 + Math.sin(time * 4) * 0.12;
          waterMaterialRef.current.color.setHex(0x38bdf8); // vibrant flowing cyan
        } else {
          waterMaterialRef.current.opacity = 0.15; // dry channel bed
          waterMaterialRef.current.color.setHex(0x64748b);
        }
      }

      // Rain animation loop
      if (rainParticlesRef.current && rainParticlesRef.current.visible) {
        const positions = rainParticlesRef.current.geometry.attributes.position.array as Float32Array;
        for (let i = 1; i < positions.length; i += 3) {
          positions[i] -= delta * 35; // fall speed
          if (positions[i] < 0) positions[i] = 35;
        }
        rainParticlesRef.current.geometry.attributes.position.needsUpdate = true;
      }

      // Smooth camera interpolation towards active zone
      camera.position.lerp(targetCamPos.current, 0.035);
      currentCamLook.current.lerp(targetCamLook.current, 0.035);
      camera.lookAt(currentCamLook.current);

      renderer.render(scene, camera);
    };

    animate();

    // Resize handler
    const handleResize = () => {
      if (!container || !camera || !renderer) return;
      const newWidth = container.clientWidth;
      const newHeight = container.clientHeight;
      camera.aspect = newWidth / newHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(newWidth, newHeight);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (animFrameId.current) cancelAnimationFrame(animFrameId.current);
      renderer.dispose();
      if (container) container.innerHTML = '';
    };
  }, []);

  // Update environmental lighting, sky & weather particles
  useEffect(() => {
    if (!sceneRef.current || !sunLightRef.current || !ambientLightRef.current || !skyMeshRef.current) return;

    const sun = sunLightRef.current;
    const ambient = ambientLightRef.current;
    const sky = skyMeshRef.current;
    const rain = rainParticlesRef.current;
    const fog = sceneRef.current.fog as THREE.FogExp2;

    switch (weatherMode) {
      case 'SUNNY':
        sun.intensity = 1.7;
        sun.color.setHex(0xfff7ed);
        ambient.intensity = 0.75;
        ambient.color.setHex(0xffffff);
        (sky.material as THREE.MeshBasicMaterial).color.setHex(0x38bdf8); // bright blue
        if (fog) fog.color.setHex(0xd1fae5);
        if (rain) rain.visible = false;
        break;

      case 'CLOUDY':
        sun.intensity = 0.8;
        sun.color.setHex(0xe2e8f0);
        ambient.intensity = 0.6;
        ambient.color.setHex(0xcbd5e1);
        (sky.material as THREE.MeshBasicMaterial).color.setHex(0x94a3b8); // soft overcast slate
        if (fog) fog.color.setHex(0xcbd5e1);
        if (rain) rain.visible = false;
        break;

      case 'RAINY':
        sun.intensity = 0.4;
        sun.color.setHex(0x64748b);
        ambient.intensity = 0.45;
        ambient.color.setHex(0x94a3b8);
        (sky.material as THREE.MeshBasicMaterial).color.setHex(0x475569); // dark storm sky
        if (fog) fog.color.setHex(0x64748b);
        if (rain) rain.visible = true;
        break;

      case 'NIGHT':
        sun.intensity = 0.15;
        sun.color.setHex(0x38bdf8); // moonlight tint
        ambient.intensity = 0.2;
        ambient.color.setHex(0x1e293b);
        (sky.material as THREE.MeshBasicMaterial).color.setHex(0x0f172a); // deep midnight
        if (fog) fog.color.setHex(0x0f172a);
        if (rain) rain.visible = false;
        break;
    }
  }, [weatherMode]);

  // Update soil color according to actual soil moisture percentage
  useEffect(() => {
    if (!soilMaterialRef.current) return;

    if (soilMoisture < wiltingPoint) {
      // Parched dry soil
      soilMaterialRef.current.color.setHex(0x8d6e63);
      soilMaterialRef.current.roughness = 0.95;
    } else if (soilMoisture > 30) {
      // Dark saturated wet earth
      soilMaterialRef.current.color.setHex(0x271913);
      soilMaterialRef.current.roughness = 0.6;
    } else {
      // Optimal fertile loam
      soilMaterialRef.current.color.setHex(0x45271a);
      soilMaterialRef.current.roughness = 0.85;
    }
  }, [soilMoisture, wiltingPoint]);

  // Zone focus camera positions
  const handleZoneChange = (zone: 'A' | 'B' | 'C') => {
    setActiveZone(zone);
    if (onZoneSelect) onZoneSelect(zone === 'A' ? 'Sector Alpha (North)' : zone === 'B' ? 'Sector Beta (Central)' : 'Sector Gamma (South)');

    if (zone === 'A') {
      targetCamPos.current.set(-10, 9, 14);
      targetCamLook.current.set(-6, 1, 0);
    } else if (zone === 'B') {
      targetCamPos.current.set(0, 14, 25);
      targetCamLook.current.set(0, 1, 0);
    } else {
      targetCamPos.current.set(12, 10, 15);
      targetCamLook.current.set(6, 1, 0);
    }
  };

  const resetCamera = () => {
    targetCamPos.current.set(0, 16, 30);
    targetCamLook.current.set(0, 2, 0);
  };

  return (
    <div className={`relative overflow-hidden rounded-3xl border border-white/60 shadow-xl select-none ${className}`}>
      {/* 3D WebGL Canvas */}
      <div ref={mountRef} className="w-full h-full min-h-[440px] lg:min-h-[500px] bg-gradient-to-b from-sky-300 via-sky-100 to-emerald-100 cursor-grab active:cursor-grabbing" />

      {/* Fallback if WebGL is disabled */}
      {!webGLSupported && (
        <div className="absolute inset-0 bg-gradient-to-b from-sky-400 to-emerald-700 flex flex-col items-center justify-center p-6 text-white text-center">
          <Sparkles className="w-12 h-12 mb-3 text-amber-300 animate-pulse" />
          <h3 className="text-xl font-bold">Interactive Farm View</h3>
          <p className="text-xs text-sky-100 max-w-md mt-1">
            Displaying high-performance agricultural telemetry canvas. WebGL hardware acceleration disabled.
          </p>
        </div>
      )}

      {/* Floating Zone Selection Controls (Top Left) */}
      <div className="absolute top-4 left-4 z-10 flex items-center space-x-1.5 bg-white/80 backdrop-blur-md px-3 py-1.5 rounded-2xl border border-white/60 shadow-sm text-xs">
        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 pr-1 flex items-center space-x-1">
          <Layers className="w-3.5 h-3.5 text-emerald-700" />
          <span>Zone:</span>
        </span>
        {(['A', 'B', 'C'] as const).map((z) => (
          <button
            key={z}
            onClick={() => handleZoneChange(z)}
            className={`px-2.5 py-1 rounded-xl text-xs font-semibold transition-all ${
              activeZone === z
                ? 'bg-emerald-700 text-white shadow-xs'
                : 'text-slate-700 hover:bg-white/90'
            }`}
          >
            {z === 'A' ? 'North' : z === 'B' ? 'Center' : 'South'}
          </button>
        ))}
        <button
          onClick={resetCamera}
          className="p-1 rounded-lg text-slate-500 hover:text-slate-800 transition-colors ml-1"
          title="Reset Camera View"
        >
          <Maximize2 className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Environmental & Weather Mode Override (Top Right) */}
      <div className="absolute top-4 right-4 z-10 flex items-center space-x-1.5 bg-white/80 backdrop-blur-md p-1.5 rounded-2xl border border-white/60 shadow-sm text-xs">
        <button
          onClick={() => setWeatherMode('SUNNY')}
          className={`p-1.5 rounded-xl transition-all ${
            weatherMode === 'SUNNY' ? 'bg-amber-400 text-slate-900 shadow-xs' : 'text-slate-600 hover:bg-white/80'
          }`}
          title="Sunny Daylight Environment"
        >
          <Sun className="w-4 h-4" />
        </button>
        <button
          onClick={() => setWeatherMode('CLOUDY')}
          className={`p-1.5 rounded-xl transition-all ${
            weatherMode === 'CLOUDY' ? 'bg-slate-300 text-slate-900 shadow-xs' : 'text-slate-600 hover:bg-white/80'
          }`}
          title="Cloudy Overcast Sky"
        >
          <CloudSun className="w-4 h-4" />
        </button>
        <button
          onClick={() => setWeatherMode('RAINY')}
          className={`p-1.5 rounded-xl transition-all ${
            weatherMode === 'RAINY' ? 'bg-blue-500 text-white shadow-xs' : 'text-slate-600 hover:bg-white/80'
          }`}
          title="Animated Rainfall"
        >
          <CloudRain className="w-4 h-4" />
        </button>
        <button
          onClick={() => setWeatherMode('NIGHT')}
          className={`p-1.5 rounded-xl transition-all ${
            weatherMode === 'NIGHT' ? 'bg-slate-900 text-sky-300 shadow-xs' : 'text-slate-600 hover:bg-white/80'
          }`}
          title="Night Mode with Moonlight"
        >
          <Moon className="w-4 h-4" />
        </button>

        {/* Water Sprinkler / Irrigation Toggle */}
        <button
          onClick={() => setIsWaterFlowing(!isWaterFlowing)}
          className={`ml-1 flex items-center space-x-1 px-2.5 py-1 rounded-xl text-[11px] font-bold transition-all ${
            isWaterFlowing
              ? 'bg-sky-500 text-white shadow-xs animate-pulse'
              : 'bg-white/90 text-slate-700 hover:bg-white'
          }`}
          title="Toggle flowing irrigation water"
        >
          <Droplet className="w-3 h-3 fill-current" />
          <span>{isWaterFlowing ? 'Irrigating' : 'Irrigate'}</span>
        </button>
      </div>

      {/* Floating Field Health Pill (Bottom Center) */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 flex items-center space-x-3 bg-white/85 backdrop-blur-md px-5 py-2.5 rounded-2xl border border-white/70 shadow-md text-xs text-slate-800">
        <div className="flex items-center space-x-1.5">
          <span
            className={`w-2.5 h-2.5 rounded-full ${
              isOptimal ? 'bg-emerald-500 animate-pulse' : isStressed ? 'bg-rose-500' : 'bg-amber-500'
            }`}
          />
          <span className="font-semibold">
            Field Status: <span className="text-emerald-700 font-bold">{isOptimal ? 'Healthy' : isStressed ? 'Water Stress Alert' : 'Moisture Declining'}</span>
          </span>
        </div>
        <span className="text-slate-300">|</span>
        <div className="flex items-center space-x-1 font-mono font-bold text-slate-900">
          <Droplet className="w-3.5 h-3.5 text-sky-600" />
          <span>{soilMoisture}% Soil Moisture</span>
        </div>
        <span className="text-slate-300 hidden sm:inline">|</span>
        <span className="hidden sm:inline text-slate-600 font-medium">
          Crop: <strong className="text-slate-900">{cropType}</strong>
        </span>
      </div>
    </div>
  );
};
