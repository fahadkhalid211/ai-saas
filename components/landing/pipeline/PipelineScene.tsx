'use client';

import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { PipelineStageInfo } from './types';
import { PipelineFallbackSvg } from './PipelineFallbackSvg';

interface PipelineSceneProps {
  stages: PipelineStageInfo[];
  activeStageIndex: number;
  theme?: 'light' | 'dark';
}

export default function PipelineScene({
  stages,
  activeStageIndex,
  theme = 'dark',
}: PipelineSceneProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [webglFailed, setWebglFailed] = useState(false);
  const isLight = theme === 'light';

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Check WebGL availability
    const canvasTest = document.createElement('canvas');
    const gl =
      canvasTest.getContext('webgl') || canvasTest.getContext('experimental-webgl');
    if (!gl) {
      setWebglFailed(true);
      return;
    }

    const prefersReducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches;

    // Scene, Camera, Renderer
    const scene = new THREE.Scene();
    const width = container.clientWidth || 800;
    const height = container.clientHeight || 220;

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(0, 0, 18);

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
    const glowCanvas = document.createElement('canvas');
    glowCanvas.width = 64;
    glowCanvas.height = 64;
    const glowCtx = glowCanvas.getContext('2d');
    if (glowCtx) {
      const grad = glowCtx.createRadialGradient(32, 32, 0, 32, 32, 32);
      grad.addColorStop(0, 'rgba(255, 255, 255, 1)');
      grad.addColorStop(0.3, isLight ? 'rgba(56, 189, 248, 0.8)' : 'rgba(56, 189, 248, 0.9)');
      grad.addColorStop(0.7, isLight ? 'rgba(99, 102, 241, 0.3)' : 'rgba(99, 102, 241, 0.4)');
      grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      glowCtx.fillStyle = grad;
      glowCtx.fillRect(0, 0, 64, 64);
    }
    const glowTexture = new THREE.CanvasTexture(glowCanvas);

    // Build Node Chain Coordinates along X axis (-10 to +10)
    const nodeCount = stages.length;
    const nodePositions: THREE.Vector3[] = [];
    const span = 18;
    const startX = -span / 2;

    for (let i = 0; i < nodeCount; i++) {
      const x = startX + (i / (nodeCount - 1)) * span;
      // Slight smooth vertical wave for organic curve
      const y = Math.sin((i / (nodeCount - 1)) * Math.PI) * 0.5;
      nodePositions.push(new THREE.Vector3(x, y, 0));
    }

    // Connecting Curve
    const curve = new THREE.CatmullRomCurve3(nodePositions);
    const curvePoints = curve.getPoints(100);
    const curveGeometry = new THREE.BufferGeometry().setFromPoints(curvePoints);
    const curveMaterial = new THREE.LineBasicMaterial({
      color: isLight ? 0x94a3b8 : 0x1e293b,
      transparent: true,
      opacity: 0.6,
      linewidth: 1.5,
    });
    const curveLine = new THREE.Line(curveGeometry, curveMaterial);
    scene.add(curveLine);

    // Glowing Node Meshes
    const nodeMeshes: Array<{
      group: THREE.Group;
      core: THREE.Mesh;
      ring: THREE.Mesh;
      sprite: THREE.Sprite;
    }> = [];

    const ringGeometry = new THREE.TorusGeometry(0.75, 0.04, 16, 32);
    const sphereGeometry = new THREE.SphereGeometry(0.3, 16, 16);

    for (let i = 0; i < nodeCount; i++) {
      const group = new THREE.Group();
      group.position.copy(nodePositions[i]);

      const ringMaterial = new THREE.MeshBasicMaterial({
        color: i === activeStageIndex ? (isLight ? 0x0284c7 : 0x38bdf8) : (isLight ? 0xcbd5e1 : 0x334155),
        transparent: true,
        opacity: 0.85,
      });
      const ring = new THREE.Mesh(ringGeometry, ringMaterial);

      const coreMaterial = new THREE.MeshBasicMaterial({
        color: i === activeStageIndex ? (isLight ? 0x0284c7 : 0x38bdf8) : (isLight ? 0x94a3b8 : 0x475569),
      });
      const core = new THREE.Mesh(sphereGeometry, coreMaterial);

      const spriteMaterial = new THREE.SpriteMaterial({
        map: glowTexture,
        color: i === activeStageIndex ? 0x38bdf8 : 0x64748b,
        transparent: true,
        opacity: i === activeStageIndex ? 0.9 : 0.25,
        blending: THREE.AdditiveBlending,
      });
      const sprite = new THREE.Sprite(spriteMaterial);
      sprite.scale.set(3, 3, 1);

      group.add(ring);
      group.add(core);
      group.add(sprite);

      scene.add(group);
      nodeMeshes.push({ group, core, ring, sprite });
    }

    // Instanced Particles along Curve (Low-power path for mobile)
    const isMobile = width < 640;
    const particleCount = isMobile ? 18 : 45;
    const particleGeometry = new THREE.SphereGeometry(0.08, 8, 8);
    const particleMaterial = new THREE.MeshBasicMaterial({
      color: isLight ? 0x0284c7 : 0x38bdf8,
      transparent: true,
      opacity: 0.85,
    });
    const instancedParticles = new THREE.InstancedMesh(
      particleGeometry,
      particleMaterial,
      particleCount
    );

    const dummy = new THREE.Object3D();
    const particleOffsets: number[] = [];
    for (let i = 0; i < particleCount; i++) {
      particleOffsets.push(i / particleCount);
    }
    scene.add(instancedParticles);

    // Pointer Parallax
    let targetCameraX = 0;
    let targetCameraY = 0;
    const handlePointerMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      targetCameraX = x * 1.5;
      targetCameraY = -y * 0.8;
    };
    window.addEventListener('mousemove', handlePointerMove, { passive: true });

    // Resize handling
    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const newW = entry.contentRect.width;
        const newH = entry.contentRect.height;
        if (newW > 0 && newH > 0) {
          camera.aspect = newW / newH;
          camera.updateProjectionMatrix();
          renderer.setSize(newW, newH);
        }
      }
    });
    resizeObserver.observe(container);

    // Animation Loop Control (Offscreen & Tab visibility pausing)
    let isVisible = true;
    let isIntersecting = true;
    let animId: number;
    let clock = new THREE.Clock();

    const intersectionObserver = new IntersectionObserver(
      (entries) => {
        isIntersecting = entries[0].isIntersecting;
      },
      { threshold: 0.05 }
    );
    intersectionObserver.observe(container);

    const handleVisibilityChange = () => {
      isVisible = document.visibilityState === 'visible';
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Static frame render if reduced motion
    if (prefersReducedMotion) {
      for (let i = 0; i < particleCount; i++) {
        const pt = curve.getPointAt(particleOffsets[i]);
        dummy.position.copy(pt);
        dummy.updateMatrix();
        instancedParticles.setMatrixAt(i, dummy.matrix);
      }
      instancedParticles.instanceMatrix.needsUpdate = true;
      renderer.render(scene, camera);
      return () => {
        resizeObserver.disconnect();
        intersectionObserver.disconnect();
        document.removeEventListener('visibilitychange', handleVisibilityChange);
        window.removeEventListener('mousemove', handlePointerMove);
        renderer.dispose();
      };
    }

    // 60 FPS Render Loop
    let particleProgress = 0;
    const animate = () => {
      animId = requestAnimationFrame(animate);

      if (!isVisible || !isIntersecting) return;

      const delta = clock.getDelta();
      particleProgress += delta * 0.12;

      // Update Camera Parallax
      camera.position.x += (targetCameraX - camera.position.x) * 0.05;
      camera.position.y += (targetCameraY - camera.position.y) * 0.05;
      camera.lookAt(0, 0, 0);

      // Rotate Stage Rings
      nodeMeshes.forEach((mesh, idx) => {
        const isActive = idx === activeStageIndex;
        mesh.ring.rotation.z += delta * (isActive ? 1.5 : 0.3);
        mesh.ring.rotation.x += delta * 0.2;

        const targetScale = isActive ? 1.15 : 1.0;
        mesh.group.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), 0.1);
      });

      // Update Particles Along Curve
      for (let i = 0; i < particleCount; i++) {
        const t = (particleOffsets[i] + particleProgress) % 1;
        const pt = curve.getPointAt(t);
        dummy.position.copy(pt);

        // Subtly scale particle as it passes through active stage
        const activeStageT = activeStageIndex / (nodeCount - 1);
        const dist = Math.abs(t - activeStageT);
        const scale = dist < 0.1 ? 1.4 : 1.0;
        dummy.scale.set(scale, scale, scale);

        dummy.updateMatrix();
        instancedParticles.setMatrixAt(i, dummy.matrix);
      }
      instancedParticles.instanceMatrix.needsUpdate = true;

      renderer.render(scene, camera);
    };

    animate();

    // Cleanup & WebGL Memory Disposal on unmount
    return () => {
      cancelAnimationFrame(animId);
      resizeObserver.disconnect();
      intersectionObserver.disconnect();
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('mousemove', handlePointerMove);

      // Dispose Three.js objects
      curveGeometry.dispose();
      curveMaterial.dispose();
      ringGeometry.dispose();
      sphereGeometry.dispose();
      particleGeometry.dispose();
      particleMaterial.dispose();
      glowTexture.dispose();

      nodeMeshes.forEach((m) => {
        (m.core.material as THREE.Material).dispose();
        (m.ring.material as THREE.Material).dispose();
        m.sprite.material.dispose();
      });

      renderer.dispose();
      if (renderer.domElement && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [activeStageIndex, isLight, stages.length]);

  if (webglFailed) {
    return (
      <PipelineFallbackSvg
        stages={stages}
        activeStageIndex={activeStageIndex}
        theme={theme}
      />
    );
  }

  return (
    <div
      ref={containerRef}
      className="w-full h-48 sm:h-56 relative overflow-hidden flex items-center justify-center cursor-default"
      aria-label="Interactive Three.js WebGL systems pipeline rendering active data flow across stages"
    />
  );
}
