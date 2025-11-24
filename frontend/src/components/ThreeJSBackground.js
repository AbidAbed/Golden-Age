import React, { useRef, useEffect, useCallback } from 'react';
import * as THREE from 'three';
import styled from 'styled-components';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass';

const CanvasContainer = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  z-index: -2; /* Below everything else */
  pointer-events: none; /* Allow clicks to pass through */
  opacity: 0.9; /* Increased opacity for better visibility */
`;

const ThreeJSBackground = () => {
  const mountRef = useRef(null);
  const animationFrameId = useRef(null);

  const createScene = useCallback(() => {
    const currentMount = mountRef.current;
    if (!currentMount) return;

    // Scene
    const scene = new THREE.Scene();

    // Camera
    const camera = new THREE.PerspectiveCamera(
      75,
      currentMount.clientWidth / currentMount.clientHeight,
      0.1,
      1000
    );
    camera.position.z = 5;

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(currentMount.clientWidth, currentMount.clientHeight);
    currentMount.appendChild(renderer.domElement);

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    const pointLight = new THREE.PointLight(0xffd700, 1); // Golden light
    pointLight.position.set(0, 0, 5);
    scene.add(pointLight);

    // Particles
    const particleCount = 2000;
    const particlesGeometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const velocities = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);

    const color1 = new THREE.Color(0xffd700); // Gold
    const color2 = new THREE.Color(0xffed4e); // Lighter Gold
    const color3 = new THREE.Color(0xdaa520); // Darker Gold

    for (let i = 0; i < particleCount; i++) {
      // Position
      positions[i * 3] = (Math.random() - 0.5) * 20;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 20;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 20;

      // Velocity for movement
      velocities[i * 3] = (Math.random() - 0.5) * 0.005;
      velocities[i * 3 + 1] = (Math.random() - 0.5) * 0.005;
      velocities[i * 3 + 2] = (Math.random() - 0.5) * 0.005;

      // Color
      const rand = Math.random();
      if (rand < 0.33) color1.toArray(colors, i * 3);
      else if (rand < 0.66) color2.toArray(colors, i * 3);
      else color3.toArray(colors, i * 3);
    }

    particlesGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    particlesGeometry.setAttribute('velocity', new THREE.BufferAttribute(velocities, 3));
    particlesGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const particlesMaterial = new THREE.PointsMaterial({
      size: 0.15, // Increased particle size
      vertexColors: true,
      transparent: true,
      opacity: 0.9, // Increased opacity
      blending: THREE.AdditiveBlending,
      sizeAttenuation: false // Particles maintain consistent size
    });

    const particles = new THREE.Points(particlesGeometry, particlesMaterial);
    scene.add(particles);

    // Post-processing for bloom effect
    const renderScene = new RenderPass(scene, camera);
    const bloomPass = new UnrealBloomPass(
      new THREE.Vector2(currentMount.clientWidth, currentMount.clientHeight),
      0.8, // strength
      0.4, // radius
      0.85 // threshold
    );
    const composer = new EffectComposer(renderer);
    composer.addPass(renderScene);
    composer.addPass(bloomPass);

    // Animation
    const animate = () => {
      animationFrameId.current = requestAnimationFrame(animate);

      // Update particle positions
      const positions = particles.geometry.attributes.position.array;
      const velocities = particles.geometry.attributes.velocity.array;

      for (let i = 0; i < particleCount; i++) {
        positions[i * 3] += velocities[i * 3];
        positions[i * 3 + 1] += velocities[i * 3 + 1];
        positions[i * 3 + 2] += velocities[i * 3 + 2];

        // Wrap particles around the scene
        if (positions[i * 3] > 10 || positions[i * 3] < -10) velocities[i * 3] *= -1;
        if (positions[i * 3 + 1] > 10 || positions[i * 3 + 1] < -10) velocities[i * 3 + 1] *= -1;
        if (positions[i * 3 + 2] > 10 || positions[i * 3 + 2] < -10) velocities[i * 3 + 2] *= -1;
      }
      particles.geometry.attributes.position.needsUpdate = true;

      particles.rotation.x += 0.0002;
      particles.rotation.y += 0.0003;

      composer.render(); // Render with composer
    };

    animate();

    // Handle resize
    const handleResize = () => {
      camera.aspect = currentMount.clientWidth / currentMount.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(currentMount.clientWidth, currentMount.clientHeight);
      composer.setSize(currentMount.clientWidth, currentMount.clientHeight);
    };
    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId.current);
      currentMount.removeChild(renderer.domElement);
      particlesGeometry.dispose();
      particlesMaterial.dispose();
      renderer.dispose();
      composer.dispose();
    };
  }, []);

  useEffect(() => {
    const cleanup = createScene();
    return cleanup;
  }, [createScene]);

  return <CanvasContainer ref={mountRef} />;
};

export default ThreeJSBackground;
