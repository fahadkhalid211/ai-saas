'use client';

import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import {
  TopologyNode,
  TopologyWire,
  VectorClusterInfo,
  TOPOLOGY_NODES,
  VECTOR_CLUSTERS,
  TOPOLOGY_WIRES,
  PipelineScenarioData,
} from './types';
import { PipelineFallbackSvg } from './PipelineFallbackSvg';

interface PipelineSceneProps {
  scenario: PipelineScenarioData;
  theme?: 'light' | 'dark';
  selectedNodeId?: string | null;
  onSelectNode?: (nodeId: string) => void;
}

export default function PipelineScene({
  scenario,
  theme = 'dark',
  selectedNodeId,
  onSelectNode,
}: PipelineSceneProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [webglFailed, setWebglFailed] = useState(false);
  const isLight = theme === 'light';

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // WebGL capability check
    const canvasTest = document.createElement('canvas');
    const gl =
      canvasTest.getContext('webgl') || canvasTest.getContext('experimental-webgl');
    if (!gl) {
      setWebglFailed(true);
      return;
    }

    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Scene, Camera, Renderer
    const scene = new THREE.Scene();
    const width = container.clientWidth || 900;
    const height = container.clientHeight || 460;

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(0, 0, 16);

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        alpha: true,
        antialias: true,
        powerPreference: 'high-performance',
      });
    } catch {
      setWebglFailed(true);
      return;
    }

    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    container.appendChild(renderer.domElement);

    // Create Additive Glow Sprite Texture
    const createGlowTexture = () => {
      const canvas = document.createElement('canvas');
      canvas.width = 64;
      canvas.height = 64;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        const grad = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
        grad.addColorStop(0, 'rgba(255, 255, 255, 1)');
        grad.addColorStop(0.25, isLight ? 'rgba(56, 189, 248, 0.9)' : 'rgba(56, 189, 248, 0.95)');
        grad.addColorStop(0.65, isLight ? 'rgba(99, 102, 241, 0.25)' : 'rgba(99, 102, 241, 0.35)');
        grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, 64, 64);
      }
      return new THREE.CanvasTexture(canvas);
    };

    const glowTexture = createGlowTexture();

    // Map Coordinates Lookup
    const coordMap = new Map<string, THREE.Vector3>();
    TOPOLOGY_NODES.forEach((n) => {
      coordMap.set(n.id, new THREE.Vector3(n.x, n.y, n.z || 0));
    });
    VECTOR_CLUSTERS.forEach((vc) => {
      coordMap.set(vc.id, new THREE.Vector3(vc.x, vc.y, vc.z || 0));
    });

    // 1. Construct Freeflow Vector Particle Nebulae
    const particleClouds: Array<{
      points: THREE.Points;
      basePositions: Float32Array;
      clusterId: string;
      phase: number;
    }> = [];

    VECTOR_CLUSTERS.forEach((cluster) => {
      const particleCount = 96;
      const positions = new Float32Array(particleCount * 3);
      const basePositions = new Float32Array(particleCount * 3);
      const colors = new Float32Array(particleCount * 3);

      const baseColor = new THREE.Color(cluster.color);

      for (let i = 0; i < particleCount; i++) {
        // Organic spherical dispersion with clustered density
        const radius = Math.pow(Math.random(), 1.5) * 1.6;
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos(2 * Math.random() - 1);

        const x = cluster.x + radius * Math.sin(phi) * Math.cos(theta);
        const y = cluster.y + radius * Math.sin(phi) * Math.sin(theta) * 0.75;
        const z = cluster.z + radius * Math.cos(phi) * 0.9;

        positions[i * 3] = x;
        positions[i * 3 + 1] = y;
        positions[i * 3 + 2] = z;

        basePositions[i * 3] = x;
        basePositions[i * 3 + 1] = y;
        basePositions[i * 3 + 2] = z;

        // Slight color jitter
        const tint = baseColor.clone().offsetHSL(
          (Math.random() - 0.5) * 0.08,
          0,
          (Math.random() - 0.5) * 0.15
        );
        colors[i * 3] = tint.r;
        colors[i * 3 + 1] = tint.g;
        colors[i * 3 + 2] = tint.b;
      }

      const geometry = new THREE.BufferGeometry();
      geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
      geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

      const material = new THREE.PointsMaterial({
        size: isLight ? 0.35 : 0.42,
        map: glowTexture,
        vertexColors: true,
        transparent: true,
        opacity: isLight ? 0.8 : 0.9,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      });

      const points = new THREE.Points(geometry, material);
      scene.add(points);

      particleClouds.push({
        points,
        basePositions,
        clusterId: cluster.id,
        phase: Math.random() * 10,
      });
    });

    // 2. Build Curved Bus Wires & Splines
    interface WireRuntime {
      wire: TopologyWire;
      curve: THREE.CatmullRomCurve3;
      line: THREE.Line;
      isActive: boolean;
    }

    const wireRuntimes: WireRuntime[] = [];

    TOPOLOGY_WIRES.forEach((w) => {
      const p1 = coordMap.get(w.sourceId);
      const p2 = coordMap.get(w.targetId);
      if (!p1 || !p2) return;

      // Calculate midpoint with smooth vertical and depth arc
      const mid = new THREE.Vector3().addVectors(p1, p2).multiplyScalar(0.5);
      const isToolWire = p1.y < -1.5 || p2.y < -1.5;
      mid.z += 0.4;
      mid.y += isToolWire ? -0.35 : (p1.y > 1.5 && p2.y > 1.5 ? 0.35 : 0.1);

      const curve = new THREE.CatmullRomCurve3([p1, mid, p2]);
      const points = curve.getPoints(36);
      const geom = new THREE.BufferGeometry().setFromPoints(points);

      const isActive =
        scenario.primaryPath.includes(w.sourceId) &&
        scenario.primaryPath.includes(w.targetId);

      const wireColor = w.color || (isActive ? '#38bdf8' : '#334155');

      const mat = new THREE.LineBasicMaterial({
        color: new THREE.Color(wireColor),
        transparent: true,
        opacity: isActive ? (isLight ? 0.75 : 0.85) : isLight ? 0.18 : 0.22,
        linewidth: 1,
      });

      const line = new THREE.Line(geom, mat);
      scene.add(line);

      wireRuntimes.push({
        wire: w,
        curve,
        line,
        isActive,
      });
    });

    // 3. Moving Photon Pulses along Wires
    const activeWires = wireRuntimes.filter((w) => w.isActive);
    const pulseCount = Math.max(activeWires.length * 3, 24);
    const pulsePositions = new Float32Array(pulseCount * 3);
    const pulseColors = new Float32Array(pulseCount * 3);

    for (let i = 0; i < pulseCount; i++) {
      pulsePositions[i * 3] = 0;
      pulsePositions[i * 3 + 1] = 0;
      pulsePositions[i * 3 + 2] = 0;

      pulseColors[i * 3] = 1;
      pulseColors[i * 3 + 1] = 1;
      pulseColors[i * 3 + 2] = 1;
    }

    const pulseGeometry = new THREE.BufferGeometry();
    pulseGeometry.setAttribute('position', new THREE.BufferAttribute(pulsePositions, 3));
    pulseGeometry.setAttribute('color', new THREE.BufferAttribute(pulseColors, 3));

    const pulseMaterial = new THREE.PointsMaterial({
      size: isLight ? 0.65 : 0.8,
      map: glowTexture,
      vertexColors: true,
      transparent: true,
      opacity: 0.95,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });

    const pulsePoints = new THREE.Points(pulseGeometry, pulseMaterial);
    scene.add(pulsePoints);

    // 4. Interactive Node Markers & Halos
    const nodeMeshes: Array<{
      nodeId: string;
      mesh: THREE.Mesh;
      halo: THREE.Mesh;
      baseScale: number;
    }> = [];

    const sphereGeom = new THREE.SphereGeometry(0.24, 16, 16);
    const ringGeom = new THREE.RingGeometry(0.34, 0.44, 24);

    TOPOLOGY_NODES.forEach((node) => {
      const pos = coordMap.get(node.id);
      if (!pos) return;

      const isPathActive = scenario.primaryPath.includes(node.id);
      const isSelected = selectedNodeId === node.id;

      // Inner glowing core
      const sphereMat = new THREE.MeshBasicMaterial({
        color: new THREE.Color(node.color),
      });
      const sphere = new THREE.Mesh(sphereGeom, sphereMat);
      sphere.position.copy(pos);
      scene.add(sphere);

      // Outer concentric halo ring
      const ringMat = new THREE.MeshBasicMaterial({
        color: new THREE.Color(node.color),
        side: THREE.DoubleSide,
        transparent: true,
        opacity: isPathActive || isSelected ? 0.85 : 0.25,
      });
      const ring = new THREE.Mesh(ringGeom, ringMat);
      ring.position.copy(pos);
      scene.add(ring);

      nodeMeshes.push({
        nodeId: node.id,
        mesh: sphere,
        halo: ring,
        baseScale: isPathActive ? 1.2 : 1.0,
      });
    });

    // 5. Central Cognitive Beacon Accent Ring
    const beaconPos = coordMap.get('beacon_intent');
    let beaconAccent: THREE.Mesh | null = null;
    if (beaconPos) {
      const beaconRingGeom = new THREE.RingGeometry(0.7, 0.82, 32);
      const beaconRingMat = new THREE.MeshBasicMaterial({
        color: new THREE.Color('#f59e0b'),
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.6,
      });
      beaconAccent = new THREE.Mesh(beaconRingGeom, beaconRingMat);
      beaconAccent.position.copy(beaconPos);
      scene.add(beaconAccent);
    }

    // 6. Camera Parallax & Mouse Raycasting
    let targetCameraX = 0;
    let targetCameraY = 0;
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2(-1000, -1000);
    let hoveredNodeId: string | null = null;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      const clientX = e.clientX - rect.left;
      const clientY = e.clientY - rect.top;

      mouse.x = (clientX / rect.width) * 2 - 1;
      mouse.y = -(clientY / rect.height) * 2 + 1;

      targetCameraX = mouse.x * 0.8;
      targetCameraY = mouse.y * 0.4;
    };

    const handleClick = () => {
      if (hoveredNodeId && onSelectNode) {
        onSelectNode(hoveredNodeId);
      }
    };

    container.addEventListener('mousemove', handleMouseMove, { passive: true });
    container.addEventListener('click', handleClick);

    // 7. Resize Observer
    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth || 900;
      const h = container.clientHeight || 460;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    const resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(container);

    // 8. Visibility & Intersection Observers
    let isVisible = true;
    let animationFrameId: number | null = null;

    const intersectionObserver = new IntersectionObserver(
      ([entry]) => {
        isVisible = entry.isIntersecting;
        if (isVisible && animationFrameId === null && !prefersReducedMotion) {
          animationFrameId = requestAnimationFrame(animate);
        }
      },
      { threshold: 0.1 }
    );
    intersectionObserver.observe(container);

    const handleVisibilityChange = () => {
      if (document.hidden) {
        isVisible = false;
        if (animationFrameId !== null) {
          cancelAnimationFrame(animationFrameId);
          animationFrameId = null;
        }
      } else {
        isVisible = true;
        if (animationFrameId === null && !prefersReducedMotion) {
          animationFrameId = requestAnimationFrame(animate);
        }
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // 9. Main Animation Loop
    let clock = 0;

    const animate = () => {
      if (!isVisible) return;

      clock += 0.016;

      // Smooth camera interpolation
      camera.position.x += (targetCameraX - camera.position.x) * 0.05;
      camera.position.y += (targetCameraY - camera.position.y) * 0.05;
      camera.lookAt(0, 0, 0);

      // A. Organic Freeflow Drift for Vector Particle Clouds
      particleClouds.forEach(({ points, basePositions, phase }) => {
        const posAttr = points.geometry.getAttribute('position') as THREE.BufferAttribute;
        const arr = posAttr.array as Float32Array;

        for (let i = 0; i < arr.length / 3; i++) {
          const bx = basePositions[i * 3];
          const by = basePositions[i * 3 + 1];
          const bz = basePositions[i * 3 + 2];

          // Harmonic floating drift
          const offset = i * 0.2 + phase;
          arr[i * 3] = bx + Math.sin(clock * 0.8 + offset) * 0.12;
          arr[i * 3 + 1] = by + Math.cos(clock * 0.9 + offset * 1.2) * 0.12;
          arr[i * 3 + 2] = bz + Math.sin(clock * 0.6 + offset * 0.8) * 0.08;
        }

        posAttr.needsUpdate = true;
      });

      // B. Update Moving Photon Pulses along Wires
      if (activeWires.length > 0) {
        const pulseAttr = pulseGeometry.getAttribute('position') as THREE.BufferAttribute;
        const pArr = pulseAttr.array as Float32Array;
        const colAttr = pulseGeometry.getAttribute('color') as THREE.BufferAttribute;
        const cArr = colAttr.array as Float32Array;

        const pulsesPerWire = Math.floor(pulseCount / activeWires.length);

        activeWires.forEach((wireRuntime, wIdx) => {
          const wireColor = new THREE.Color(wireRuntime.wire.color || '#38bdf8');

          for (let p = 0; p < pulsesPerWire; p++) {
            const idx = wIdx * pulsesPerWire + p;
            if (idx >= pulseCount) break;

            // Compute progress along curve
            const speed = 0.28;
            const progress = ((clock * speed + p / pulsesPerWire) % 1.0);

            const pt = wireRuntime.curve.getPointAt(progress);
            pArr[idx * 3] = pt.x;
            pArr[idx * 3 + 1] = pt.y;
            pArr[idx * 3 + 2] = pt.z;

            cArr[idx * 3] = wireColor.r;
            cArr[idx * 3 + 1] = wireColor.g;
            cArr[idx * 3 + 2] = wireColor.b;
          }
        });

        pulseAttr.needsUpdate = true;
        colAttr.needsUpdate = true;
      }

      // C. Rotate and Pulse Concentric Halos
      nodeMeshes.forEach(({ halo, baseScale }, i) => {
        halo.rotation.z += 0.015;
        const pulse = 1 + Math.sin(clock * 3 + i) * 0.08;
        halo.scale.set(baseScale * pulse, baseScale * pulse, 1);
      });

      if (beaconAccent) {
        beaconAccent.rotation.z -= 0.008;
        const beaconPulse = 1 + Math.sin(clock * 2) * 0.06;
        beaconAccent.scale.set(beaconPulse, beaconPulse, 1);
      }

      // D. Raycasting for Node Hover
      raycaster.setFromCamera(mouse, camera);
      const interactiveTargets = nodeMeshes.map((n) => n.mesh);
      const intersects = raycaster.intersectObjects(interactiveTargets);

      if (intersects.length > 0) {
        const hitMesh = intersects[0].object as THREE.Mesh;
        const hit = nodeMeshes.find((n) => n.mesh === hitMesh);
        if (hit) {
          hoveredNodeId = hit.nodeId;
          container.style.cursor = 'pointer';
        }
      } else {
        hoveredNodeId = null;
        container.style.cursor = 'default';
      }

      renderer.render(scene, camera);
      animationFrameId = requestAnimationFrame(animate);
    };

    if (prefersReducedMotion) {
      renderer.render(scene, camera);
    } else {
      animationFrameId = requestAnimationFrame(animate);
    }

    // Cleanup & Disposal
    return () => {
      if (animationFrameId !== null) {
        cancelAnimationFrame(animationFrameId);
      }
      container.removeEventListener('mousemove', handleMouseMove);
      container.removeEventListener('click', handleClick);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      resizeObserver.disconnect();
      intersectionObserver.disconnect();

      // Dispose Three.js objects
      glowTexture.dispose();
      particleClouds.forEach(({ points }) => {
        points.geometry.dispose();
        if (Array.isArray(points.material)) {
          points.material.forEach((m) => m.dispose());
        } else {
          points.material.dispose();
        }
      });

      wireRuntimes.forEach(({ line }) => {
        line.geometry.dispose();
        if (Array.isArray(line.material)) {
          line.material.forEach((m) => m.dispose());
        } else {
          line.material.dispose();
        }
      });

      pulseGeometry.dispose();
      pulseMaterial.dispose();
      sphereGeom.dispose();
      ringGeom.dispose();

      nodeMeshes.forEach(({ mesh, halo }) => {
        mesh.geometry.dispose();
        if (Array.isArray(mesh.material)) {
          mesh.material.forEach((m) => m.dispose());
        } else {
          mesh.material.dispose();
        }
        halo.geometry.dispose();
        if (Array.isArray(halo.material)) {
          halo.material.forEach((m) => m.dispose());
        } else {
          halo.material.dispose();
        }
      });

      if (beaconAccent) {
        beaconAccent.geometry.dispose();
        if (Array.isArray(beaconAccent.material)) {
          beaconAccent.material.forEach((m) => m.dispose());
        } else {
          beaconAccent.material.dispose();
        }
      }

      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [scenario, theme, selectedNodeId, onSelectNode, isLight]);

  if (webglFailed) {
    return <PipelineFallbackSvg scenario={scenario} />;
  }

  return (
    <div
      ref={containerRef}
      className="w-full h-[420px] sm:h-[480px] lg:h-[520px] relative overflow-hidden select-none"
      aria-label="Kortex AI Autonomous Processing Systems Topology Visualizer"
    />
  );
}
