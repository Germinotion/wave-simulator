import { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';

export default function AudioWaveVisualization() {
  const containerRef = useRef(null);
  const [isListening, setIsListening] = useState(false);
  const [error, setError] = useState(null);
  const [mode, setMode] = useState('ocean'); // ocean, vortex, mountain
  const [colorScheme, setColorScheme] = useState(0);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const dataArrayRef = useRef(null);
  const sceneRef = useRef(null);
  const rendererRef = useRef(null);
  const cameraRef = useRef(null);
  const meshRef = useRef(null);
  const frameRef = useRef(null);
  const timeRef = useRef(0);
  const composerRef = useRef(null);
  const bloomPassRef = useRef(null);
  const mouseRef = useRef({ x: 0, y: 0, clicked: false });
  const rippleRef = useRef([]);
  const beatRef = useRef({ lastBeat: 0, threshold: 0.6, energy: 0, isBeat: false });
  const ringsRef = useRef([]);
  const shakeRef = useRef({ intensity: 0, decay: 0.95 });
  const modeRef = useRef('ocean');
  const colorSchemeRef = useRef(0);

  const colorSchemes = [
    { a: 0x0066ff, b: 0x00ffcc, c: 0xff0066, name: 'Neon Dreams' },
    { a: 0xff6600, b: 0xffcc00, c: 0xff0044, name: 'Solar Flare' },
    { a: 0x9900ff, b: 0x00ffff, c: 0xff00ff, name: 'Cyberpunk' },
    { a: 0x00ff88, b: 0x00ffcc, c: 0x88ff00, name: 'Matrix' },
    { a: 0xff0055, b: 0xff8800, c: 0xffff00, name: 'Inferno' },
  ];

  // Update refs when state changes
  useEffect(() => {
    modeRef.current = mode;
  }, [mode]);

  useEffect(() => {
    colorSchemeRef.current = colorScheme;
  }, [colorScheme]);

  const startListening = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
      analyserRef.current = audioContextRef.current.createAnalyser();
      analyserRef.current.fftSize = 512;
      analyserRef.current.smoothingTimeConstant = 0.75;

      const source = audioContextRef.current.createMediaStreamSource(stream);
      source.connect(analyserRef.current);

      const bufferLength = analyserRef.current.frequencyBinCount;
      dataArrayRef.current = new Uint8Array(bufferLength);

      setIsListening(true);
      setError(null);
    } catch (err) {
      setError('Microphone access denied. Please allow microphone access to use this visualization.');
    }
  };

  const handleMouseMove = useCallback((e) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    mouseRef.current.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    mouseRef.current.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
  }, []);

  const handleClick = useCallback((e) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    const y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

    // Add ripple at click position
    rippleRef.current.push({
      x: x * 100,
      z: y * 100,
      time: timeRef.current,
      strength: 1.0
    });

    // Keep only last 5 ripples
    if (rippleRef.current.length > 5) {
      rippleRef.current.shift();
    }
  }, []);

  useEffect(() => {
    if (!containerRef.current) return;

    // Scene setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x000008);
    scene.fog = new THREE.FogExp2(0x000008, 0.008);
    sceneRef.current = scene;

    // Camera
    const camera = new THREE.PerspectiveCamera(
      60,
      containerRef.current.clientWidth / containerRef.current.clientHeight,
      0.1,
      1000
    );
    camera.position.set(0, 50, 100);
    camera.lookAt(0, 0, 0);
    cameraRef.current = camera;

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 0.9;
    containerRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Post-processing with bloom
    const composer = new EffectComposer(renderer);
    const renderPass = new RenderPass(scene, camera);
    composer.addPass(renderPass);

    const bloomPass = new UnrealBloomPass(
      new THREE.Vector2(containerRef.current.clientWidth, containerRef.current.clientHeight),
      0.6, // strength - reduced for better visibility
      0.3, // radius
      0.7 // threshold - higher means less bloom
    );
    composer.addPass(bloomPass);
    composerRef.current = composer;
    bloomPassRef.current = bloomPass;

    // Create wave geometry with more detail
    const segments = 200;
    const geometry = new THREE.PlaneGeometry(250, 250, segments, segments);
    geometry.rotateX(-Math.PI / 2);

    // Custom shader material for epic waves
    const material = new THREE.ShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
        uAmplitude: { value: 0 },
        uFrequency: { value: 1 },
        uBass: { value: 0 },
        uMid: { value: 0 },
        uTreble: { value: 0 },
        uBeat: { value: 0 },
        uColorA: { value: new THREE.Color(colorSchemes[0].a) },
        uColorB: { value: new THREE.Color(colorSchemes[0].b) },
        uColorC: { value: new THREE.Color(colorSchemes[0].c) },
        uMouse: { value: new THREE.Vector2(0, 0) },
        uRipples: { value: new Array(5).fill(null).map(() => new THREE.Vector4(0, 0, -1000, 0)) },
        uMode: { value: 0 },
      },
      vertexShader: `
        uniform float uTime;
        uniform float uAmplitude;
        uniform float uFrequency;
        uniform float uBass;
        uniform float uMid;
        uniform float uTreble;
        uniform float uBeat;
        uniform vec2 uMouse;
        uniform vec4 uRipples[5];
        uniform float uMode;

        varying vec2 vUv;
        varying float vElevation;
        varying float vDistanceFromCenter;
        varying vec3 vNormal;
        varying vec3 vPosition;

        // Improved noise functions
        vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
        vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
        vec4 permute(vec4 x) { return mod289(((x*34.0)+1.0)*x); }
        vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }

        float snoise(vec3 v) {
          const vec2 C = vec2(1.0/6.0, 1.0/3.0);
          const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);

          vec3 i  = floor(v + dot(v, C.yyy));
          vec3 x0 = v - i + dot(i, C.xxx);

          vec3 g = step(x0.yzx, x0.xyz);
          vec3 l = 1.0 - g;
          vec3 i1 = min(g.xyz, l.zxy);
          vec3 i2 = max(g.xyz, l.zxy);

          vec3 x1 = x0 - i1 + C.xxx;
          vec3 x2 = x0 - i2 + C.yyy;
          vec3 x3 = x0 - D.yyy;

          i = mod289(i);
          vec4 p = permute(permute(permute(
                    i.z + vec4(0.0, i1.z, i2.z, 1.0))
                  + i.y + vec4(0.0, i1.y, i2.y, 1.0))
                  + i.x + vec4(0.0, i1.x, i2.x, 1.0));

          float n_ = 0.142857142857;
          vec3 ns = n_ * D.wyz - D.xzx;

          vec4 j = p - 49.0 * floor(p * ns.z * ns.z);

          vec4 x_ = floor(j * ns.z);
          vec4 y_ = floor(j - 7.0 * x_);

          vec4 x = x_ *ns.x + ns.yyyy;
          vec4 y = y_ *ns.x + ns.yyyy;
          vec4 h = 1.0 - abs(x) - abs(y);

          vec4 b0 = vec4(x.xy, y.xy);
          vec4 b1 = vec4(x.zw, y.zw);

          vec4 s0 = floor(b0)*2.0 + 1.0;
          vec4 s1 = floor(b1)*2.0 + 1.0;
          vec4 sh = -step(h, vec4(0.0));

          vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy;
          vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww;

          vec3 p0 = vec3(a0.xy, h.x);
          vec3 p1 = vec3(a0.zw, h.y);
          vec3 p2 = vec3(a1.xy, h.z);
          vec3 p3 = vec3(a1.zw, h.w);

          vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2,p2), dot(p3,p3)));
          p0 *= norm.x;
          p1 *= norm.y;
          p2 *= norm.z;
          p3 *= norm.w;

          vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
          m = m * m;
          return 42.0 * dot(m*m, vec4(dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3)));
        }

        void main() {
          vUv = uv;
          vec3 pos = position;

          float distFromCenter = length(pos.xz) / 125.0;
          vDistanceFromCenter = distFromCenter;

          float waveFreq = 0.02 + uFrequency * 0.04;
          float t = uTime;

          // Mode-specific wave patterns
          float elevation = 0.0;

          if (uMode < 0.5) {
            // Ocean mode - flowing waves
            float wave1 = snoise(vec3(pos.x * waveFreq + t * 0.5, pos.z * waveFreq + t * 0.3, t * 0.1));
            float wave2 = snoise(vec3(pos.x * waveFreq * 2.0 - t * 0.4, pos.z * waveFreq * 2.0 + t * 0.2, t * 0.15)) * 0.5;
            float wave3 = snoise(vec3(pos.x * waveFreq * 4.0 + t * 0.6, pos.z * waveFreq * 4.0 - t * 0.4, t * 0.2)) * 0.25;
            float wave4 = snoise(vec3(pos.x * waveFreq * 8.0 - t * 0.8, pos.z * waveFreq * 8.0 + t * 0.6, t * 0.25)) * 0.125;

            elevation = (wave1 + wave2 + wave3 + wave4) * (5.0 + uAmplitude * 30.0);
          } else if (uMode < 1.5) {
            // Vortex mode - spinning spiral
            float angle = atan(pos.z, pos.x);
            float radius = length(pos.xz);
            float spiral = sin(angle * 5.0 + radius * 0.05 - t * 3.0);
            float radialWave = sin(radius * 0.1 - t * 2.0);

            elevation = (spiral * radialWave) * (8.0 + uAmplitude * 25.0);
            elevation += snoise(vec3(pos.x * 0.02 + t, pos.z * 0.02, t * 0.2)) * 5.0 * (1.0 + uAmplitude);
          } else {
            // Mountain mode - terrain-like
            float terrain = snoise(vec3(pos.x * 0.01 + t * 0.1, pos.z * 0.01 + t * 0.1, 0.0)) * 20.0;
            terrain += snoise(vec3(pos.x * 0.03 + t * 0.2, pos.z * 0.03 + t * 0.15, 1.0)) * 10.0;
            terrain += snoise(vec3(pos.x * 0.06 + t * 0.3, pos.z * 0.06 + t * 0.25, 2.0)) * 5.0;

            elevation = terrain * (0.5 + uAmplitude * 2.0);
          }

          // Bass creates massive swells
          float bassWave = sin(pos.x * 0.015 + t * 0.5) * sin(pos.z * 0.015 + t * 0.3);
          bassWave *= uBass * 25.0;

          // Mid frequencies add detail
          float midWave = snoise(vec3(pos.x * 0.04 + t, pos.z * 0.04, t * 0.3)) * uMid * 15.0;

          // Treble creates fine ripples
          float trebleWave = snoise(vec3(pos.x * 0.15 + t * 2.5, pos.z * 0.15 + t * 2.0, t)) * uTreble * 8.0;

          // Beat pulse - ripple from center
          float beatPulse = sin(distFromCenter * 15.0 - uBeat * 10.0) * uBeat * 10.0 * (1.0 - distFromCenter);

          // Click ripples
          float rippleEffect = 0.0;
          for (int i = 0; i < 5; i++) {
            vec4 ripple = uRipples[i];
            if (ripple.w > 0.0) {
              float dist = distance(pos.xz, ripple.xy);
              float age = (uTime - ripple.z) * 3.0;
              float rippleWave = sin(dist * 0.5 - age * 5.0) * exp(-age * 0.5) * exp(-dist * 0.02);
              rippleEffect += rippleWave * ripple.w * 15.0;
            }
          }

          // Mouse interaction - subtle pull toward mouse
          float mouseDist = distance(pos.xz, uMouse * 100.0);
          float mouseInfluence = exp(-mouseDist * 0.02) * 5.0 * (1.0 + uAmplitude);

          pos.y = elevation + bassWave + midWave + trebleWave + beatPulse + rippleEffect + mouseInfluence;

          // Edge fade
          float edgeFade = 1.0 - smoothstep(0.7, 1.0, distFromCenter);
          pos.y *= edgeFade;

          vElevation = pos.y;
          vPosition = pos;

          // Calculate normal for lighting
          vec3 tangent = vec3(1.0, 0.0, 0.0);
          vec3 bitangent = vec3(0.0, 0.0, 1.0);
          vNormal = normalize(cross(tangent, bitangent));

          gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
        }
      `,
      fragmentShader: `
        uniform vec3 uColorA;
        uniform vec3 uColorB;
        uniform vec3 uColorC;
        uniform float uAmplitude;
        uniform float uTime;
        uniform float uBeat;
        uniform float uBass;

        varying vec2 vUv;
        varying float vElevation;
        varying float vDistanceFromCenter;
        varying vec3 vPosition;

        void main() {
          // Dynamic color based on elevation and audio
          float normalizedElevation = (vElevation + 30.0) / 60.0;
          normalizedElevation = clamp(normalizedElevation, 0.0, 1.0);

          // Darker base colors for valleys, brighter for peaks
          vec3 valleyColor = uColorA * 0.15; // Very dark in valleys
          vec3 midColor = uColorB * 0.5;
          vec3 peakColor = uColorC * 0.8;

          vec3 color;
          if (normalizedElevation < 0.4) {
            color = mix(valleyColor, midColor, normalizedElevation * 2.5);
          } else if (normalizedElevation < 0.7) {
            color = mix(midColor, peakColor, (normalizedElevation - 0.4) * 3.33);
          } else {
            color = mix(peakColor, uColorC, (normalizedElevation - 0.7) * 3.33);
          }

          // Subtle beat glow - only on peaks
          float beatGlow = uBeat * 0.3 * normalizedElevation;
          color += vec3(beatGlow * 0.2, beatGlow * 0.3, beatGlow * 0.4);

          // Very subtle bass undertone
          color += vec3(uBass * 0.1, uBass * 0.05, 0.0) * normalizedElevation;

          // Reduced ambient glow
          float glow = uAmplitude * 0.2;
          color += vec3(glow * 0.1, glow * 0.15, glow * 0.2) * normalizedElevation;

          // Subtle sparkle only at highest peaks
          float sparkle = smoothstep(0.85, 1.0, normalizedElevation);
          color += vec3(sparkle * 0.5);

          float alpha = 1.0 - smoothstep(0.8, 1.0, vDistanceFromCenter);

          gl_FragColor = vec4(color, alpha);
        }
      `,
      transparent: true,
      side: THREE.DoubleSide,
    });

    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);
    meshRef.current = mesh;

    // Glowing wireframe overlay
    const wireframeMaterial = new THREE.ShaderMaterial({
      uniforms: material.uniforms,
      vertexShader: material.vertexShader,
      fragmentShader: `
        uniform float uAmplitude;
        uniform float uBeat;
        uniform vec3 uColorB;
        varying float vElevation;
        varying float vDistanceFromCenter;

        void main() {
          float alpha = (0.02 + uAmplitude * 0.08 + uBeat * 0.1) * (1.0 - smoothstep(0.7, 1.0, vDistanceFromCenter));
          vec3 color = uColorB * 0.4;
          gl_FragColor = vec4(color, alpha);
        }
      `,
      transparent: true,
      wireframe: true,
    });

    const wireframeMesh = new THREE.Mesh(geometry.clone(), wireframeMaterial);
    wireframeMesh.position.y = 0.05;
    scene.add(wireframeMesh);

    // Enhanced particles that react to audio
    const particleCount = 3000;
    const particleGeometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const velocities = new Float32Array(particleCount * 3);
    const sizes = new Float32Array(particleCount);

    for (let i = 0; i < particleCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 300;
      positions[i * 3 + 1] = Math.random() * 80;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 300;
      velocities[i * 3] = (Math.random() - 0.5) * 0.1;
      velocities[i * 3 + 1] = Math.random() * 0.1;
      velocities[i * 3 + 2] = (Math.random() - 0.5) * 0.1;
      sizes[i] = Math.random() * 2 + 0.5;
    }

    particleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    particleGeometry.setAttribute('velocity', new THREE.BufferAttribute(velocities, 3));
    particleGeometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

    const particleMaterial = new THREE.ShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
        uAmplitude: { value: 0 },
        uBeat: { value: 0 },
        uColor: { value: new THREE.Color(colorSchemes[0].b) },
      },
      vertexShader: `
        attribute float size;
        attribute vec3 velocity;
        uniform float uTime;
        uniform float uAmplitude;
        uniform float uBeat;

        varying float vAlpha;

        void main() {
          vec3 pos = position;

          // Floating motion
          pos.y += sin(uTime + position.x * 0.01) * 2.0;
          pos.x += sin(uTime * 0.5 + position.z * 0.01) * 2.0;

          // React to audio - expand outward on beats
          float dist = length(pos.xz);
          pos.xz *= 1.0 + uBeat * 0.3 * (1.0 - dist / 150.0);
          pos.y += uAmplitude * 10.0 * sin(dist * 0.05 + uTime);

          vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);

          float dynamicSize = size * (1.0 + uAmplitude * 2.0 + uBeat * 3.0);
          gl_PointSize = dynamicSize * (200.0 / -mvPosition.z);
          gl_Position = projectionMatrix * mvPosition;

          vAlpha = 0.4 + uAmplitude * 0.4 + uBeat * 0.2;
        }
      `,
      fragmentShader: `
        uniform vec3 uColor;
        varying float vAlpha;

        void main() {
          float dist = length(gl_PointCoord - vec2(0.5));
          if (dist > 0.5) discard;

          float alpha = vAlpha * 0.5 * (1.0 - dist * 2.0);
          vec3 color = uColor * 0.6 * (1.0 - dist * 0.5);

          gl_FragColor = vec4(color, alpha);
        }
      `,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });

    const particles = new THREE.Points(particleGeometry, particleMaterial);
    scene.add(particles);

    // Ring explosion group for bass drops
    const ringGroup = new THREE.Group();
    scene.add(ringGroup);

    // Create ring geometry for bass drops
    const createRing = (intensity) => {
      const ringGeometry = new THREE.RingGeometry(0.1, 2, 64);
      const ringMaterial = new THREE.MeshBasicMaterial({
        color: colorSchemes[colorSchemeRef.current].c,
        transparent: true,
        opacity: intensity,
        side: THREE.DoubleSide,
      });
      const ring = new THREE.Mesh(ringGeometry, ringMaterial);
      ring.rotation.x = -Math.PI / 2;
      ring.position.y = 1;
      ring.userData = { scale: 1, opacity: intensity, speed: 2 + Math.random() };
      return ring;
    };

    // Animation
    const animate = () => {
      frameRef.current = requestAnimationFrame(animate);
      const delta = 0.016;
      timeRef.current += delta;

      const time = timeRef.current;

      // Update uniforms
      material.uniforms.uTime.value = time;
      wireframeMaterial.uniforms.uTime.value = time;
      particleMaterial.uniforms.uTime.value = time;

      // Update mode
      const modeValue = modeRef.current === 'ocean' ? 0 : modeRef.current === 'vortex' ? 1 : 2;
      material.uniforms.uMode.value += (modeValue - material.uniforms.uMode.value) * 0.05;

      // Update colors
      const scheme = colorSchemes[colorSchemeRef.current];
      material.uniforms.uColorA.value.lerp(new THREE.Color(scheme.a), 0.05);
      material.uniforms.uColorB.value.lerp(new THREE.Color(scheme.b), 0.05);
      material.uniforms.uColorC.value.lerp(new THREE.Color(scheme.c), 0.05);
      particleMaterial.uniforms.uColor.value.lerp(new THREE.Color(scheme.b), 0.05);

      // Update mouse uniform
      material.uniforms.uMouse.value.set(mouseRef.current.x, mouseRef.current.y);

      // Update ripples uniform
      const rippleData = rippleRef.current.map(r => new THREE.Vector4(r.x, r.z, r.time, r.strength));
      while (rippleData.length < 5) {
        rippleData.push(new THREE.Vector4(0, 0, -1000, 0));
      }
      material.uniforms.uRipples.value = rippleData;

      // Get audio data
      let amplitude = 0, bass = 0, mid = 0, treble = 0;

      if (analyserRef.current && dataArrayRef.current) {
        analyserRef.current.getByteFrequencyData(dataArrayRef.current);

        const data = dataArrayRef.current;
        const bufferLength = data.length;

        const bassEnd = Math.floor(bufferLength * 0.1);
        const midEnd = Math.floor(bufferLength * 0.5);

        let bassSum = 0, midSum = 0, trebleSum = 0, totalSum = 0;

        for (let i = 0; i < bufferLength; i++) {
          const value = data[i] / 255;
          totalSum += value;

          if (i < bassEnd) bassSum += value;
          else if (i < midEnd) midSum += value;
          else trebleSum += value;
        }

        bass = bassSum / bassEnd;
        mid = midSum / (midEnd - bassEnd);
        treble = trebleSum / (bufferLength - midEnd);
        amplitude = totalSum / bufferLength;

        // Beat detection
        const currentEnergy = bass * 0.6 + mid * 0.3 + amplitude * 0.1;
        const energyDelta = currentEnergy - beatRef.current.energy;

        if (energyDelta > 0.15 && currentEnergy > 0.4 && time - beatRef.current.lastBeat > 0.2) {
          beatRef.current.isBeat = true;
          beatRef.current.lastBeat = time;

          // Spawn ring on strong beats
          if (bass > 0.6) {
            const ring = createRing(bass);
            ringGroup.add(ring);
            ringsRef.current.push(ring);

            // Screen shake on bass drops
            shakeRef.current.intensity = bass * 5;
          }

          // Subtle bloom increase on beats
          if (bloomPassRef.current) {
            bloomPassRef.current.strength = 1.0;
          }
        } else {
          beatRef.current.isBeat = false;
        }

        beatRef.current.energy = currentEnergy;

        // Smooth transitions
        const smoothing = 0.12;
        material.uniforms.uAmplitude.value += (amplitude - material.uniforms.uAmplitude.value) * smoothing;
        material.uniforms.uBass.value += (bass - material.uniforms.uBass.value) * smoothing;
        material.uniforms.uMid.value += (mid - material.uniforms.uMid.value) * smoothing;
        material.uniforms.uTreble.value += (treble - material.uniforms.uTreble.value) * smoothing;

        // Beat decay
        const beatValue = beatRef.current.isBeat ? 1.0 : material.uniforms.uBeat.value * 0.9;
        material.uniforms.uBeat.value = beatValue;

        wireframeMaterial.uniforms.uAmplitude.value = material.uniforms.uAmplitude.value;
        wireframeMaterial.uniforms.uBass.value = material.uniforms.uBass.value;
        wireframeMaterial.uniforms.uMid.value = material.uniforms.uMid.value;
        wireframeMaterial.uniforms.uTreble.value = material.uniforms.uTreble.value;
        wireframeMaterial.uniforms.uBeat.value = material.uniforms.uBeat.value;

        particleMaterial.uniforms.uAmplitude.value = material.uniforms.uAmplitude.value;
        particleMaterial.uniforms.uBeat.value = material.uniforms.uBeat.value;

        // Frequency affects wave spacing
        const dominantFreq = data.indexOf(Math.max(...data)) / bufferLength;
        material.uniforms.uFrequency.value += ((1 - dominantFreq) * 2 - material.uniforms.uFrequency.value) * smoothing;
      }

      // Decay bloom back to base level
      if (bloomPassRef.current) {
        bloomPassRef.current.strength += (0.6 - bloomPassRef.current.strength) * 0.08;
      }

      // Update rings
      for (let i = ringsRef.current.length - 1; i >= 0; i--) {
        const ring = ringsRef.current[i];
        ring.userData.scale += ring.userData.speed;
        ring.userData.opacity *= 0.96;
        ring.scale.set(ring.userData.scale, ring.userData.scale, 1);
        ring.material.opacity = ring.userData.opacity;

        if (ring.userData.opacity < 0.01) {
          ringGroup.remove(ring);
          ring.geometry.dispose();
          ring.material.dispose();
          ringsRef.current.splice(i, 1);
        }
      }

      // Rotate particles
      particles.rotation.y += 0.001 + amplitude * 0.005;

      // Camera movement with shake
      const shakeX = (Math.random() - 0.5) * shakeRef.current.intensity;
      const shakeY = (Math.random() - 0.5) * shakeRef.current.intensity;
      shakeRef.current.intensity *= shakeRef.current.decay;

      const cameraRadius = 100 + Math.sin(time * 0.1) * 20;
      const cameraAngle = time * 0.05;

      camera.position.x = Math.sin(cameraAngle) * cameraRadius * 0.3 + shakeX;
      camera.position.z = cameraRadius + Math.cos(time * 0.08) * 20;
      camera.position.y = 50 + Math.sin(time * 0.12) * 10 + shakeY;
      camera.lookAt(shakeX * 2, shakeY * 2, 0);

      composer.render();
    };

    animate();

    // Event listeners
    const handleResize = () => {
      if (!containerRef.current) return;
      const width = containerRef.current.clientWidth;
      const height = containerRef.current.clientHeight;

      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
      composer.setSize(width, height);
    };

    window.addEventListener('resize', handleResize);
    containerRef.current.addEventListener('mousemove', handleMouseMove);
    containerRef.current.addEventListener('click', handleClick);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (containerRef.current) {
        containerRef.current.removeEventListener('mousemove', handleMouseMove);
        containerRef.current.removeEventListener('click', handleClick);
      }
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
      if (rendererRef.current && containerRef.current) {
        containerRef.current.removeChild(rendererRef.current.domElement);
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, [handleMouseMove, handleClick]);

  return (
    <div className="w-full h-screen bg-black relative overflow-hidden">
      <div ref={containerRef} className="w-full h-full cursor-crosshair" />

      {/* UI Overlay */}
      <div className="absolute top-0 left-0 right-0 p-6 pointer-events-none">
        <div className="max-w-md mx-auto text-center">
          <h1 className="text-4xl font-black text-white mb-2 tracking-widest"
              style={{
                textShadow: '0 0 30px rgba(0, 200, 255, 0.9), 0 0 60px rgba(255, 0, 100, 0.5)',
                letterSpacing: '0.3em'
              }}>
            AUDIO WAVE
          </h1>
          <p className="text-cyan-300 text-sm opacity-80 tracking-wider">
            IMMERSIVE 3D SOUND VISUALIZATION
          </p>
        </div>
      </div>

      {/* Mode selector */}
      <div className="absolute top-24 left-1/2 transform -translate-x-1/2 flex gap-2 pointer-events-auto">
        {['ocean', 'vortex', 'mountain'].map((m) => (
          <button
            key={m}
            onClick={() => setMode(m)}
            className={`px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-all duration-300 ${
              mode === m
                ? 'bg-cyan-500 text-black shadow-lg shadow-cyan-500/50'
                : 'bg-white/10 text-white/70 hover:bg-white/20'
            }`}
          >
            {m}
          </button>
        ))}
      </div>

      {/* Color scheme selector */}
      <div className="absolute top-36 left-1/2 transform -translate-x-1/2 flex gap-2 pointer-events-auto">
        {colorSchemes.map((scheme, i) => (
          <button
            key={i}
            onClick={() => setColorScheme(i)}
            className={`w-8 h-8 rounded-full transition-all duration-300 ${
              colorScheme === i ? 'ring-2 ring-white ring-offset-2 ring-offset-black scale-110' : 'hover:scale-105'
            }`}
            style={{
              background: `linear-gradient(135deg, #${scheme.a.toString(16).padStart(6, '0')}, #${scheme.b.toString(16).padStart(6, '0')}, #${scheme.c.toString(16).padStart(6, '0')})`,
              boxShadow: colorScheme === i ? `0 0 20px #${scheme.b.toString(16).padStart(6, '0')}` : 'none'
            }}
            title={scheme.name}
          />
        ))}
      </div>

      {/* Controls */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 pointer-events-auto">
        {!isListening ? (
          <button
            onClick={startListening}
            className="group px-10 py-5 bg-gradient-to-r from-cyan-600 via-blue-600 to-purple-600 text-white font-bold rounded-full
                       shadow-2xl transition-all duration-500 hover:scale-110 hover:shadow-cyan-500/50
                       flex items-center gap-4 relative overflow-hidden"
            style={{ boxShadow: '0 0 40px rgba(0, 200, 255, 0.5), 0 0 80px rgba(150, 0, 255, 0.3)' }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent
                            translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
            <svg className="w-7 h-7 relative z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
            </svg>
            <span className="relative z-10 tracking-wider">ENABLE MICROPHONE</span>
          </button>
        ) : (
          <div className="flex flex-col items-center gap-4">
            <div className="flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-green-500/30 to-cyan-500/30
                            border border-green-400/50 rounded-full backdrop-blur-sm">
              <div className="w-4 h-4 bg-green-400 rounded-full animate-pulse shadow-lg shadow-green-400/50" />
              <span className="text-green-300 font-bold tracking-wider">LISTENING</span>
              <div className="flex gap-1">
                {[...Array(5)].map((_, i) => (
                  <div
                    key={i}
                    className="w-1 bg-green-400 rounded-full animate-pulse"
                    style={{
                      height: `${10 + Math.random() * 15}px`,
                      animationDelay: `${i * 0.1}s`
                    }}
                  />
                ))}
              </div>
            </div>
            <p className="text-cyan-300/80 text-sm tracking-wide">Click anywhere for ripples!</p>
          </div>
        )}
      </div>

      {/* Error message */}
      {error && (
        <div className="absolute top-48 left-1/2 transform -translate-x-1/2
                        px-6 py-3 bg-red-500/20 border border-red-400/50 rounded-lg backdrop-blur-sm">
          <p className="text-red-400 text-sm">{error}</p>
        </div>
      )}

      {/* Info panel */}
      <div className="absolute bottom-8 right-8 text-right text-xs text-gray-400 pointer-events-none space-y-1">
        <p className="flex items-center justify-end gap-2">
          <span className="w-2 h-2 bg-cyan-400 rounded-full" /> Volume = Wave Height
        </p>
        <p className="flex items-center justify-end gap-2">
          <span className="w-2 h-2 bg-purple-400 rounded-full" /> Bass = Deep Swells
        </p>
        <p className="flex items-center justify-end gap-2">
          <span className="w-2 h-2 bg-pink-400 rounded-full" /> Treble = Fine Ripples
        </p>
        <p className="flex items-center justify-end gap-2">
          <span className="w-2 h-2 bg-green-400 rounded-full" /> Beats = Ring Explosions
        </p>
      </div>

      {/* Credits */}
      <div className="absolute bottom-8 left-8 text-xs text-gray-500 pointer-events-none">
        <p>Move mouse to influence waves</p>
      </div>
    </div>
  );
}
