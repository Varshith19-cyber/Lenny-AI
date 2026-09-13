'use client';

import { useEffect, useRef } from 'react';

/**
 * Full-screen animated background inspired by the Aegis Bento design.
 * Renders two WebGL layers via Three.js:
 *   1. A rotating constellation/sphere of connected dots (top-left quadrant glow)
 *   2. An animated halftone dot grid that pulses outward from the centre
 */
export function AegisBackground() {
  const halftoneRef = useRef<HTMLCanvasElement>(null);
  const linesRef = useRef<HTMLCanvasElement>(null);
  const cleanupRef = useRef<(() => void)[]>([]);

  useEffect(() => {
    let cancelled = false;

    async function init() {
      const THREE = await import('three');

      // ── Halftone dots (full-screen, dark background) ──────────────────────
      const htCanvas = halftoneRef.current;
      if (!htCanvas || cancelled) return;

      const htRenderer = new THREE.WebGLRenderer({ canvas: htCanvas, alpha: false, antialias: false });
      htRenderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      htRenderer.setClearColor(0x090d16, 1);

      const htScene = new THREE.Scene();
      const htCamera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 10);
      htCamera.position.z = 1;

      const resizeHT = () => {
        const w = window.innerWidth;
        const h = window.innerHeight;
        htRenderer.setSize(w, h, false);
        const aspect = w / h;
        htCamera.left = -aspect;
        htCamera.right = aspect;
        htCamera.updateProjectionMatrix();
      };
      window.addEventListener('resize', resizeHT);
      resizeHT();

      // Build dot grid
      const gridSize = 28;
      const htPositions: number[] = [];
      const htScales: number[] = [];
      for (let x = -gridSize; x <= gridSize; x++) {
        for (let y = -gridSize; y <= gridSize; y++) {
          htPositions.push(x * 0.12, y * 0.12, 0);
          htScales.push(1);
        }
      }
      const htGeo = new THREE.BufferGeometry();
      htGeo.setAttribute('position', new THREE.Float32BufferAttribute(htPositions, 3));
      htGeo.setAttribute('scale', new THREE.Float32BufferAttribute(htScales, 1));

      const htMat = new THREE.ShaderMaterial({
        uniforms: {
          time:  { value: 0 },
          color1: { value: new THREE.Color(0x0ea5e9) }, // sky-500
          color2: { value: new THREE.Color(0x6366f1) }, // indigo-500
        },
        vertexShader: `
          attribute float scale;
          varying vec2 vPos;
          varying float vScale;
          uniform float time;
          void main() {
            vPos = position.xy;
            float dist = length(position.xy);
            float s = scale * (sin(dist * 5.0 - time * 2.0) * 0.5 + 0.5);
            vScale = s;
            gl_PointSize = s * 4.5;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }
        `,
        fragmentShader: `
          uniform vec3 color1;
          uniform vec3 color2;
          varying vec2 vPos;
          varying float vScale;
          void main() {
            vec2 coord = gl_PointCoord - vec2(0.5);
            if (length(coord) > 0.5) discard;
            float t = clamp((vPos.y + 1.5) / 3.0, 0.0, 1.0);
            vec3 col = mix(color1, color2, t);
            gl_FragColor = vec4(col, vScale * 0.55);
          }
        `,
        transparent: true,
      });

      const htPoints = new THREE.Points(htGeo, htMat);
      htScene.add(htPoints);

      // ── Connection-sphere lines (top-right corner overlay) ─────────────────
      const lnCanvas = linesRef.current;
      if (!lnCanvas || cancelled) return;

      const lnRenderer = new THREE.WebGLRenderer({ canvas: lnCanvas, alpha: true, antialias: true });
      lnRenderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      lnRenderer.setClearColor(0x000000, 0);

      const lnScene = new THREE.Scene();
      const lnCamera = new THREE.PerspectiveCamera(60, 1, 0.1, 100);
      lnCamera.position.z = 4.5;

      const resizeLN = () => {
        const el = lnCanvas.parentElement!;
        lnRenderer.setSize(el.clientWidth, el.clientHeight);
        lnCamera.aspect = el.clientWidth / el.clientHeight;
        lnCamera.updateProjectionMatrix();
      };
      window.addEventListener('resize', resizeLN);
      resizeLN();

      const count = 180;
      const pts = new Float32Array(count * 3);
      for (let i = 0; i < count; i++) {
        const r = 2.2;
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos(Math.random() * 2 - 1);
        pts[i * 3]     = r * Math.sin(phi) * Math.cos(theta);
        pts[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
        pts[i * 3 + 2] = r * Math.cos(phi);
      }

      const lnGeo = new THREE.BufferGeometry();
      lnGeo.setAttribute('position', new THREE.BufferAttribute(pts, 3));

      const edges: number[] = [];
      for (let i = 0; i < count; i++) {
        for (let j = i + 1; j < count; j++) {
          const dx = pts[i*3] - pts[j*3];
          const dy = pts[i*3+1] - pts[j*3+1];
          const dz = pts[i*3+2] - pts[j*3+2];
          if (dx*dx + dy*dy + dz*dz < 1.4) edges.push(i, j);
        }
      }
      lnGeo.setIndex(edges);

      const lnMat = new THREE.LineBasicMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.18 });
      const lnMesh = new THREE.LineSegments(lnGeo, lnMat);
      lnScene.add(lnMesh);

      // ── Animation loop ─────────────────────────────────────────────────────
      const clock = new THREE.Clock();
      let rafId: number;

      const animate = () => {
        if (cancelled) return;
        rafId = requestAnimationFrame(animate);
        const t = clock.getElapsedTime();
        htMat.uniforms.time.value = t;
        htRenderer.render(htScene, htCamera);
        lnMesh.rotation.y = t * 0.15;
        lnMesh.rotation.x = t * 0.08;
        lnRenderer.render(lnScene, lnCamera);
      };
      animate();

      cleanupRef.current.push(() => {
        cancelled = true;
        cancelAnimationFrame(rafId);
        window.removeEventListener('resize', resizeHT);
        window.removeEventListener('resize', resizeLN);
        htRenderer.dispose();
        lnRenderer.dispose();
      });
    }

    init();

    return () => {
      cancelled = true;
      cleanupRef.current.forEach(fn => fn());
      cleanupRef.current = [];
    };
  }, []);

  return (
    <div className="fixed inset-0 -z-10 pointer-events-none overflow-hidden">
      {/* Halftone dot grid — full viewport */}
      <canvas ref={halftoneRef} className="absolute inset-0 w-full h-full" />

      {/* Connection sphere — top-right accent */}
      <div className="absolute top-0 right-0 w-[420px] h-[420px] opacity-70">
        <canvas ref={linesRef} className="w-full h-full" />
      </div>

      {/* Subtle radial vignette to darken edges */}
      <div
        className="absolute inset-0"
        style={{ background: 'radial-gradient(ellipse 80% 80% at 50% 50%, transparent 40%, rgba(9,13,22,0.85) 100%)' }}
      />
    </div>
  );
}
