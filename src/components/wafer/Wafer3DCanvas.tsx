import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import {
  Die,
  NotchOrientation,
  ProcessorBin,
  ViewMode,
  VisualizationMode,
  Wafer,
} from '../../types';
import {
  Maximize2,
  Minimize2,
  RotateCcw,
  ZoomIn,
  ZoomOut,
  Layers,
  Compass,
} from 'lucide-react';

interface Wafer3DCanvasProps {
  wafer: Wafer;
  selectedDie: Die | null;
  onSelectDie: (die: Die | null) => void;
  visualizationMode: VisualizationMode;
  viewMode: ViewMode;
  showGridLines: boolean;
  showScribeLanes: boolean;
  showEdgeExclusion: boolean;
  showCrosshair: boolean;
  activeBinFilter: 'All' | ProcessorBin;
}

export function Wafer3DCanvas({
  wafer,
  selectedDie,
  onSelectDie,
  visualizationMode,
  viewMode,
  showGridLines,
  showScribeLanes,
  showEdgeExclusion,
  showCrosshair,
  activeBinFilter,
}: Wafer3DCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [hoveredDie, setHoveredDie] = useState<Die | null>(null);
  const [tooltipPos, setTooltipPos] = useState<{ x: number; y: number } | null>(null);
  const [cameraAngles, setCameraAngles] = useState({ pitch: 45, yaw: 0, roll: 0 });

  // References to three objects
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const diesMeshGroupRef = useRef<THREE.Group | null>(null);
  const waferDiscRef = useRef<THREE.Mesh | null>(null);
  const edgeRingRef = useRef<THREE.LineLoop | null>(null);
  const crosshairGroupRef = useRef<THREE.Group | null>(null);

  // Interaction tracking
  const isDraggingRef = useRef(false);
  const previousMousePositionRef = useRef({ x: 0, y: 0 });
  const mouseRef = useRef(new THREE.Vector2(-10, -10));
  const raycasterRef = useRef(new THREE.Raycaster());

  // Helper to get color for a die depending on visualizationMode
  const getDieColor = (die: Die): number => {
    if (activeBinFilter !== 'All' && die.predictedBin !== activeBinFilter) {
      return 0x1f242d; // dimmed out
    }

    if (die.isExcluded) {
      return 0x27272a; // dark excluded
    }

    switch (visualizationMode) {
      case 'Bin Capability Map': {
        switch (die.predictedBin) {
          case 'i9':
            return 0x06b6d4; // bright cyan
          case 'i7':
            return 0x3b82f6; // blue
          case 'i5':
            return 0x10b981; // emerald
          case 'i3':
            return 0xf59e0b; // amber
          case 'REJ':
          default:
            return 0xef4444; // red
        }
      }

      case 'Total Defect Risk Density Heatmap': {
        // 0% -> green, 20% -> yellow, 50% -> red
        const r = Math.min(1, die.defectRiskPct / 50);
        if (r < 0.3) return 0x10b981;
        if (r < 0.6) return 0xf59e0b;
        if (r < 0.8) return 0xf97316;
        return 0xef4444;
      }

      case 'i9 Super-Bin Probability Gradient': {
        const p = die.binProbabilities.i9;
        if (p > 0.8) return 0x22d3ee; // luminous cyan
        if (p > 0.5) return 0x0284c7;
        if (p > 0.2) return 0x1e3a8a;
        return 0x18181b;
      }

      case 'Lithography CD Error': {
        // error near 0 is green, positive is purple/magenta, negative is teal
        const err = die.cdErrorNm;
        if (Math.abs(err) < 0.08) return 0x10b981;
        if (err > 0) return 0xd946ef;
        return 0x06b6d4;
      }

      case 'Mechanical Stress & Wafer Bowing Tensor': {
        // stress 20MPa - 80MPa
        const s = (die.mechanicalStressMpa - 20) / 60;
        if (s < 0.3) return 0x3b82f6;
        if (s < 0.6) return 0x8b5cf6;
        return 0xec4899;
      }

      case 'Predicted Thermal & Static Leakage': {
        // leakage 10mW - 40mW
        const l = (die.staticLeakageMw - 10) / 30;
        if (l < 0.25) return 0x06b6d4;
        if (l < 0.55) return 0x10b981;
        if (l < 0.8) return 0xf59e0b;
        return 0xef4444;
      }

      case 'Twin Drift vs Lot Reference Base': {
        // sigma 0 to 2
        const sig = die.twinDriftSigma;
        if (sig < 0.6) return 0x10b981;
        if (sig < 1.2) return 0xf59e0b;
        return 0xef4444;
      }

      default:
        return 0x06b6d4;
    }
  };

  // Setup Three.js scene once
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const width = container.clientWidth || 600;
    const height = container.clientHeight || 500;

    // Scene
    const scene = new THREE.Scene();
    sceneRef.current = scene;
    scene.background = new THREE.Color(0x09090b);

    // Camera
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 2000);
    cameraRef.current = camera;
    camera.position.set(0, 220, 260);
    camera.lookAt(0, 0, 0);

    // Ambient & Directional Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.85);
    scene.add(ambientLight);

    const dirLight1 = new THREE.DirectionalLight(0x38bdf8, 1.2);
    dirLight1.position.set(100, 200, 150);
    scene.add(dirLight1);

    const dirLight2 = new THREE.DirectionalLight(0x6366f1, 0.6);
    dirLight2.position.set(-150, -50, -100);
    scene.add(dirLight2);

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    rendererRef.current = renderer;
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.replaceChildren(renderer.domElement);

    // Wafer Disc Base Mesh
    const radius = wafer.diameterMm / 2;
    const discGeo = new THREE.CylinderGeometry(radius, radius, 1.2, 80);
    const discMat = new THREE.MeshStandardMaterial({
      color: 0x18181b,
      metalness: 0.85,
      roughness: 0.25,
    });
    const disc = new THREE.Mesh(discGeo, discMat);
    disc.position.y = -0.7;
    scene.add(disc);
    waferDiscRef.current = disc;

    // Notch marker
    const notchGeo = new THREE.BoxGeometry(3, 2, 4);
    const notchMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8 });
    const notchMesh = new THREE.Mesh(notchGeo, notchMat);
    notchMesh.position.set(0, 0, radius - 1);
    disc.add(notchMesh);

    // 3mm Edge exclusion ring
    const ringRadius = radius - wafer.edgeExclusionMm;
    const ringPoints: THREE.Vector3[] = [];
    for (let i = 0; i <= 64; i++) {
      const theta = (i / 64) * Math.PI * 2;
      ringPoints.push(new THREE.Vector3(Math.cos(theta) * ringRadius, 0.2, Math.sin(theta) * ringRadius));
    }
    const ringGeo = new THREE.BufferGeometry().setFromPoints(ringPoints);
    const ringMat = new THREE.LineBasicMaterial({ color: 0xf59e0b, linewidth: 2 });
    const edgeRing = new THREE.LineLoop(ringGeo, ringMat);
    scene.add(edgeRing);
    edgeRingRef.current = edgeRing;

    // Crosshair Group
    const crosshairGroup = new THREE.Group();
    const lineMat = new THREE.LineBasicMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.45 });
    const hLineGeo = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(-radius, 0.25, 0),
      new THREE.Vector3(radius, 0.25, 0),
    ]);
    const vLineGeo = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(0, 0.25, -radius),
      new THREE.Vector3(0, 0.25, radius),
    ]);
    crosshairGroup.add(new THREE.Line(hLineGeo, lineMat));
    crosshairGroup.add(new THREE.Line(vLineGeo, lineMat));
    scene.add(crosshairGroup);
    crosshairGroupRef.current = crosshairGroup;

    // Group for individual die meshes
    const diesGroup = new THREE.Group();
    scene.add(diesGroup);
    diesMeshGroupRef.current = diesGroup;

    // Resize Handler
    const handleResize = () => {
      if (!container || !camera || !renderer) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener('resize', handleResize);

    // Render loop
    let reqId: number;
    const animate = () => {
      reqId = requestAnimationFrame(animate);
      renderer.render(scene, camera);
    };
    animate();

    return () => {
      cancelAnimationFrame(reqId);
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
      discGeo.dispose();
      discMat.dispose();
    };
  }, [wafer.diameterMm, wafer.edgeExclusionMm]);

  // Update die meshes whenever dies, visualizationMode, or filters change
  useEffect(() => {
    const diesGroup = diesMeshGroupRef.current;
    if (!diesGroup) return;

    // Clear previous dies
    while (diesGroup.children.length > 0) {
      const child = diesGroup.children[0] as THREE.Mesh;
      diesGroup.remove(child);
      if (child.geometry) child.geometry.dispose();
      if (child.material) {
        if (Array.isArray(child.material)) child.material.forEach((m) => m.dispose());
        else child.material.dispose();
      }
    }

    const stepX = wafer.dieSizeX + (showScribeLanes ? 0.35 : 0.05);
    const stepY = wafer.dieSizeY + (showScribeLanes ? 0.35 : 0.05);
    const dieW = wafer.dieSizeX - (showScribeLanes ? 0.2 : 0.02);
    const dieH = wafer.dieSizeY - (showScribeLanes ? 0.2 : 0.02);
    const dieThickness = 0.8;

    const baseDieGeo = new THREE.BoxGeometry(dieW, dieThickness, dieH);

    wafer.dies.forEach((die) => {
      let posX = die.gridX * stepX;
      const posZ = die.gridY * stepY;

      if (wafer.layoutPattern === 'Staggered Hex' && Math.abs(die.gridY) % 2 === 1) {
        posX += stepX * 0.5;
      }

      const colorHex = getDieColor(die);
      const isSelected = selectedDie?.id === die.id;

      const mat = new THREE.MeshStandardMaterial({
        color: colorHex,
        metalness: 0.6,
        roughness: 0.3,
        emissive: isSelected ? 0x22d3ee : 0x000000,
        emissiveIntensity: isSelected ? 0.6 : 0,
      });

      const dieMesh = new THREE.Mesh(baseDieGeo, mat);
      dieMesh.position.set(posX, isSelected ? 0.8 : 0.1, posZ);

      // Attach die metadata for raycasting
      dieMesh.userData = { die };

      diesGroup.add(dieMesh);

      // Optional die border lines
      if (showGridLines) {
        const edges = new THREE.EdgesGeometry(baseDieGeo);
        const lineMat = new THREE.LineBasicMaterial({
          color: isSelected ? 0x38bdf8 : 0x27272a,
          transparent: true,
          opacity: isSelected ? 0.9 : 0.4,
        });
        const wireframe = new THREE.LineSegments(edges, lineMat);
        dieMesh.add(wireframe);
      }
    });
  }, [
    wafer.dies,
    visualizationMode,
    activeBinFilter,
    selectedDie?.id,
    showGridLines,
    showScribeLanes,
    wafer.layoutPattern,
  ]);

  // Update View Mode Camera Orientation
  useEffect(() => {
    const camera = cameraRef.current;
    if (!camera) return;

    if (viewMode === 'Top Flat') {
      camera.position.set(0, 320, 0.01);
      camera.lookAt(0, 0, 0);
      setCameraAngles({ pitch: 90, yaw: 0, roll: 0 });
    } else if (viewMode === 'Side Cut') {
      camera.position.set(0, 25, 290);
      camera.lookAt(0, 0, 0);
      setCameraAngles({ pitch: 5, yaw: 0, roll: 0 });
    } else {
      // 3D Isometric View
      camera.position.set(0, 220, 250);
      camera.lookAt(0, 0, 0);
      setCameraAngles({ pitch: 45, yaw: 0, roll: 0 });
    }
  }, [viewMode]);

  // Edge Exclusion & Crosshair Visibility
  useEffect(() => {
    if (edgeRingRef.current) {
      edgeRingRef.current.visible = showEdgeExclusion;
    }
    if (crosshairGroupRef.current) {
      crosshairGroupRef.current.visible = showCrosshair;
    }
  }, [showEdgeExclusion, showCrosshair]);

  // Mouse Orbit, Pan & Raycast Click Listeners
  const handleMouseDown = (e: React.MouseEvent) => {
    isDraggingRef.current = true;
    previousMousePositionRef.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    const container = containerRef.current;
    if (!container) return;

    const rect = container.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    const y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
    mouseRef.current.set(x, y);

    if (isDraggingRef.current) {
      const deltaX = e.clientX - previousMousePositionRef.current.x;
      const deltaY = e.clientY - previousMousePositionRef.current.y;

      const camera = cameraRef.current;
      if (camera && viewMode === '3D View') {
        const radius = camera.position.length();
        let theta = Math.atan2(camera.position.x, camera.position.z);
        let phi = Math.acos(Math.max(-1, Math.min(1, camera.position.y / radius)));

        theta -= deltaX * 0.008;
        phi = Math.max(0.1, Math.min(Math.PI / 2 - 0.05, phi + deltaY * 0.008));

        camera.position.x = radius * Math.sin(phi) * Math.sin(theta);
        camera.position.y = radius * Math.cos(phi);
        camera.position.z = radius * Math.sin(phi) * Math.cos(theta);
        camera.lookAt(0, 0, 0);

        setCameraAngles({
          pitch: Math.round((phi * 180) / Math.PI),
          yaw: Math.round((theta * 180) / Math.PI) % 360,
          roll: 0,
        });
      }

      previousMousePositionRef.current = { x: e.clientX, y: e.clientY };
    } else {
      // Raycasting for hover tooltip
      const camera = cameraRef.current;
      const scene = sceneRef.current;
      const diesGroup = diesMeshGroupRef.current;
      if (!camera || !scene || !diesGroup) return;

      raycasterRef.current.setFromCamera(mouseRef.current, camera);
      const intersects = raycasterRef.current.intersectObjects(diesGroup.children, true);

      if (intersects.length > 0) {
        let target = intersects[0].object;
        while (target.parent && target.parent !== diesGroup) {
          target = target.parent;
        }
        if (target.userData && target.userData.die) {
          setHoveredDie(target.userData.die);
          setTooltipPos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
          container.style.cursor = 'pointer';
          return;
        }
      }

      setHoveredDie(null);
      container.style.cursor = 'default';
    }
  };

  const handleMouseUp = (e: React.MouseEvent) => {
    // If not dragging significantly, it's a click to select die
    const deltaX = Math.abs(e.clientX - previousMousePositionRef.current.x);
    const deltaY = Math.abs(e.clientY - previousMousePositionRef.current.y);

    if (isDraggingRef.current && deltaX < 4 && deltaY < 4) {
      const camera = cameraRef.current;
      const diesGroup = diesMeshGroupRef.current;
      if (camera && diesGroup) {
        raycasterRef.current.setFromCamera(mouseRef.current, camera);
        const intersects = raycasterRef.current.intersectObjects(diesGroup.children, true);
        if (intersects.length > 0) {
          let target = intersects[0].object;
          while (target.parent && target.parent !== diesGroup) {
            target = target.parent;
          }
          if (target.userData && target.userData.die) {
            onSelectDie(target.userData.die);
          }
        }
      }
    }

    isDraggingRef.current = false;
  };

  const handleWheel = (e: React.WheelEvent) => {
    const camera = cameraRef.current;
    if (!camera) return;

    const zoomSpeed = 0.15;
    const factor = e.deltaY > 0 ? 1 + zoomSpeed : 1 - zoomSpeed;

    camera.position.multiplyScalar(factor);
    // limit bounds
    const dist = camera.position.length();
    if (dist < 80) camera.position.setLength(80);
    if (dist > 700) camera.position.setLength(700);
  };

  const zoomIn = () => {
    const camera = cameraRef.current;
    if (camera) camera.position.multiplyScalar(0.85);
  };

  const zoomOut = () => {
    const camera = cameraRef.current;
    if (camera) camera.position.multiplyScalar(1.15);
  };

  const resetView = () => {
    const camera = cameraRef.current;
    if (camera) {
      camera.position.set(0, 220, 250);
      camera.lookAt(0, 0, 0);
      setCameraAngles({ pitch: 45, yaw: 0, roll: 0 });
    }
  };

  return (
    <div className="relative w-full h-full min-h-[500px] bg-zinc-950 border border-zinc-800 rounded-lg overflow-hidden select-none flex flex-col">
      {/* 3D Canvas Container */}
      <div
        ref={containerRef}
        className="w-full flex-1 relative cursor-grab active:cursor-grabbing"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onWheel={handleWheel}
      />

      {/* Floating Canvas Controls (Top Right) */}
      <div className="absolute top-3 right-3 flex items-center gap-1.5 bg-zinc-900/90 border border-zinc-800 rounded-md p-1 backdrop-blur-sm z-10 shadow-lg">
        <button
          onClick={zoomIn}
          title="Zoom In"
          className="p-1.5 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 rounded"
        >
          <ZoomIn className="w-4 h-4" />
        </button>
        <button
          onClick={zoomOut}
          title="Zoom Out"
          className="p-1.5 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 rounded"
        >
          <ZoomOut className="w-4 h-4" />
        </button>
        <div className="w-px h-4 bg-zinc-800 my-auto" />
        <button
          onClick={resetView}
          title="Reset Camera"
          className="p-1.5 text-zinc-400 hover:text-cyan-400 hover:bg-zinc-800 rounded"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>

      {/* Camera Orientation Gizmo Indicator (Top Left) */}
      <div className="absolute top-3 left-3 bg-zinc-900/90 border border-zinc-800 rounded-md px-2.5 py-1.5 text-[11px] font-mono text-zinc-400 backdrop-blur-sm flex items-center gap-3 z-10">
        <div className="flex items-center gap-1.5 text-cyan-400">
          <Compass className="w-3.5 h-3.5" />
          <span className="font-semibold">3D GIZMO</span>
        </div>
        <span>
          P: <strong className="text-zinc-200">{cameraAngles.pitch}°</strong>
        </span>
        <span>
          Y: <strong className="text-zinc-200">{cameraAngles.yaw}°</strong>
        </span>
        <span>
          Notch: <strong className="text-amber-400">{wafer.notchOrientationDeg}°</strong>
        </span>
      </div>

      {/* Hover Tooltip */}
      {hoveredDie && tooltipPos && (
        <div
          className="absolute pointer-events-none z-20 bg-zinc-950/95 border border-cyan-500/50 rounded p-2.5 shadow-2xl font-mono text-xs text-zinc-200 transform -translate-x-1/2 -translate-y-full -mt-2"
          style={{ left: tooltipPos.x, top: tooltipPos.y }}
        >
          <div className="flex items-center justify-between gap-3 border-b border-zinc-800 pb-1 mb-1.5">
            <span className="font-bold text-cyan-400">{hoveredDie.id}</span>
            <span
              className={`text-[10px] px-1.5 py-0.2 rounded font-bold uppercase ${
                hoveredDie.predictedBin === 'i9'
                  ? 'bg-cyan-950 text-cyan-300 border border-cyan-700'
                  : hoveredDie.predictedBin === 'i7'
                  ? 'bg-blue-950 text-blue-300 border border-blue-700'
                  : hoveredDie.predictedBin === 'i5'
                  ? 'bg-emerald-950 text-emerald-300 border border-emerald-700'
                  : hoveredDie.predictedBin === 'i3'
                  ? 'bg-amber-950 text-amber-300 border border-amber-700'
                  : 'bg-rose-950 text-rose-300 border border-rose-700'
              }`}
            >
              Bin {hoveredDie.predictedBin}
            </span>
          </div>
          <div className="grid grid-cols-2 gap-x-3 gap-y-0.5 text-[11px] text-zinc-400">
            <div>
              Pos: ({hoveredDie.gridX}, {hoveredDie.gridY})
            </div>
            <div>Dist: {hoveredDie.centerDistMm}mm</div>
            <div>Defect Risk: <span className="text-zinc-200">{hoveredDie.defectRiskPct}%</span></div>
            <div>Elec Pass: <span className="text-zinc-200">{hoveredDie.electricalPassProbPct}%</span></div>
            <div>i9 Prob: <span className="text-cyan-300">{(hoveredDie.binProbabilities.i9 * 100).toFixed(0)}%</span></div>
            <div>CD Err: <span className="text-zinc-200">{hoveredDie.cdErrorNm}nm</span></div>
          </div>
        </div>
      )}

      {/* Bottom Bar: Interactive Visualization Legend */}
      <div className="p-2.5 bg-zinc-950/90 border-t border-zinc-800 flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
        <div className="flex items-center gap-2">
          <Layers className="w-3.5 h-3.5 text-cyan-400" />
          <span className="text-zinc-400 text-[11px]">Layer:</span>
          <span className="text-zinc-200 font-semibold text-[11px] truncate max-w-[200px]">
            {visualizationMode}
          </span>
        </div>

        {/* Legend Chips */}
        <div className="flex items-center gap-2 text-[11px]">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-cyan-500 shadow-xs shadow-cyan-400"></span>
            <span className="text-zinc-300">i9 ({wafer.binDistribution.i9})</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-blue-500"></span>
            <span className="text-zinc-300">i7 ({wafer.binDistribution.i7})</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-emerald-500"></span>
            <span className="text-zinc-300">i5 ({wafer.binDistribution.i5})</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-amber-500"></span>
            <span className="text-zinc-300">i3 ({wafer.binDistribution.i3})</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-rose-500"></span>
            <span className="text-zinc-300">Rej ({wafer.binDistribution.reject})</span>
          </div>
        </div>
      </div>
    </div>
  );
}
