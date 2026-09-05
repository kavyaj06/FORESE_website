import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import * as THREE from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass.js';

interface CinematicIntroProps {
  /** Called once the intro is over, or the moment it cannot run. */
  onDone: () => void;
}

/** The beat sheet, in seconds. Every tween is placed against it. */
const T = {
  emerge: 0.15,
  form: 1.0,
  reveal: 2.5,
  collapse: 3.2,
  end: 4.0,
} as const;

/**
 * Nothing may leave the reader on a black screen.
 *
 * The intro covers the whole site, so every way it can fail is a way the site
 * becomes unreachable: no WebGL, artwork that never arrives, a context lost on
 * a backgrounded tab. This is the outer bound — if `onDone` has not been
 * called by then, it is called anyway.
 */
const FAILSAFE_MS = 6500;

/** Resolution the logo is rasterised at. Comfortably above any display use. */
const MASK_WIDTH = 2048;

const particleCount = (width: number) => (width < 700 ? 3500 : 9000);

function readColor(name: string, fallback: string) {
  const raw = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  return new THREE.Color(raw || fallback);
}

/**
 * The logo, rasterised from its own SVG into an alpha mask.
 *
 * **Not `SVGLoader` and `ShapeGeometry`.** That was the first approach and it
 * does not survive this artwork: the mark is a single `evenodd` path of nine
 * subpaths, and triangulating it produced NaN vertices and then, once those
 * were filtered out, a scatter of white shards rather than the lockup. A mask
 * has no triangulation to get wrong — the shape is exactly what the browser's
 * own SVG renderer draws, which is what every other copy of the logo on the
 * site already is.
 *
 * It also gives the particles somewhere accurate to land: their targets are
 * sampled from opaque pixels, so they settle on the mark rather than on an
 * approximation of it.
 *
 * `currentColor` is replaced before rasterising, because an SVG loaded into an
 * `<img>` has no CSS context to inherit a colour from and would come back
 * blank. Only the alpha channel is read, so which colour hardly matters — it
 * just has to be one.
 */
async function loadLogoMask(url: string) {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`logo ${response.status}`);
  const svg = (await response.text()).replace(/currentColor/g, '#ffffff');

  const objectUrl = URL.createObjectURL(new Blob([svg], { type: 'image/svg+xml' }));
  try {
    const image = new Image();
    image.decoding = 'async';
    await new Promise<void>((resolve, reject) => {
      image.onload = () => resolve();
      image.onerror = () => reject(new Error('logo failed to decode'));
      image.src = objectUrl;
    });

    const aspect = image.naturalWidth / image.naturalHeight || 1027 / 559;
    const width = MASK_WIDTH;
    const height = Math.max(1, Math.round(width / aspect));

    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const context = canvas.getContext('2d', { willReadFrequently: true });
    if (!context) throw new Error('no 2d context');
    context.drawImage(image, 0, 0, width, height);

    return { canvas, context, width, height, aspect };
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}

/**
 * Particle targets, drawn from the mask's opaque pixels.
 *
 * Uniform over the ink rather than over the box, so the field describes the
 * mark: sampling the whole rectangle would put most of the points in the empty
 * space around the letters and the shape would never resolve.
 *
 * Returned in unit-plane space — x and y within ±0.5 — for the caller to
 * scale, so this knows nothing about how large the logo ends up on screen.
 */
function sampleMask(
  context: CanvasRenderingContext2D,
  width: number,
  height: number,
  count: number,
) {
  const { data } = context.getImageData(0, 0, width, height);

  const opaque: number[] = [];
  for (let i = 0; i < width * height; i += 1) {
    if (data[i * 4 + 3] > 128) opaque.push(i);
  }
  if (opaque.length === 0) throw new Error('logo mask is empty');

  const out = new Float32Array(count * 3);
  for (let i = 0; i < count; i += 1) {
    const pixel = opaque[(Math.random() * opaque.length) | 0];
    // A pixel of jitter, so the field does not band on the raster grid.
    const x = (pixel % width) + Math.random();
    const y = ((pixel / width) | 0) + Math.random();
    out[i * 3] = x / width - 0.5;
    out[i * 3 + 1] = -(y / height - 0.5); // canvas y runs down, world y runs up
    out[i * 3 + 2] = 0;
  }
  return out;
}

const PARTICLE_VERT = /* glsl */ `
  uniform float uProgress;
  uniform float uCollapse;
  uniform float uTime;
  uniform float uSize;
  uniform float uPixelRatio;

  attribute vec3 aStart;
  attribute float aSeed;

  varying float vAlpha;
  varying float vSeed;

  void main() {
    // Each particle runs its own window inside the formation, so the shape
    // resolves progressively instead of every point landing on one frame.
    float stagger = aSeed * 0.4;
    float t = clamp((uProgress - stagger) / (1.0 - stagger * 0.5), 0.0, 1.0);
    float eased = t * t * (3.0 - 2.0 * t);

    vec3 pos = mix(aStart, position, eased);

    // Curl while it travels, gone by the time it arrives. This is what makes
    // the field read as energy finding the shape rather than points sliding
    // down straight lines.
    float swirl = (1.0 - eased) * 0.55;
    float angle = aSeed * 6.2831853 + uTime * 1.1;
    pos.x += sin(angle) * swirl;
    pos.y += cos(angle * 1.37) * swirl;
    pos.z += sin(angle * 0.71) * swirl * 0.6;

    // The collapse pulls everything back through the centre it came from.
    pos = mix(pos, vec3(0.0), uCollapse * uCollapse);

    vec4 mv = modelViewMatrix * vec4(pos, 1.0);
    gl_Position = projectionMatrix * mv;
    gl_PointSize = uSize * uPixelRatio * (0.45 + aSeed * 0.9) * (1.0 / max(-mv.z, 0.001));

    vAlpha = (0.25 + eased * 0.75) * (1.0 - uCollapse);
    vSeed = aSeed;
  }
`;

const PARTICLE_FRAG = /* glsl */ `
  uniform vec3 uBlue;
  uniform vec3 uCyan;

  varying float vAlpha;
  varying float vSeed;

  void main() {
    // Round and soft-edged. A square point sprite is the single thing that
    // makes a particle field look cheap.
    float d = length(gl_PointCoord - 0.5);
    float mask = smoothstep(0.5, 0.0, d);
    vec3 tint = mix(uBlue, uCyan, vSeed);
    // 0.3, not 1.0: thousands of additive sprites overlapping at full strength
    // saturate to white long before they read as a shape.
    gl_FragColor = vec4(tint, mask * mask * vAlpha * 0.3);
  }
`;

const LOGO_VERT = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const LOGO_FRAG = /* glsl */ `
  uniform sampler2D uMask;
  uniform float uReveal;
  uniform float uSweep;
  uniform vec3 uCyan;

  varying vec2 vUv;

  void main() {
    float ink = texture2D(uMask, vUv).a;
    if (ink < 0.01) discard;

    // A band crossing the mark's own width, so the highlight tracks the shape
    // rather than the screen.
    float band = smoothstep(0.30, 0.0, abs(vUv.x - uSweep));

    vec3 base = vec3(0.82, 0.89, 0.98);
    gl_FragColor = vec4(base + uCyan * band * 0.9, ink * uReveal);
  }
`;

/**
 * The site's opening: a WebGL title sequence that hands over to the page.
 *
 * Four seconds on one GSAP timeline, and every visual is a uniform on that
 * timeline rather than an animation of its own — a spark, a field of particles
 * that finds the shape of the logo, the mark resolving out of them under a
 * cyan sweep, then everything collapsing back through the centre as the page
 * arrives underneath.
 *
 * The logo is the club's real artwork, rasterised from `forese-logo.svg` — see
 * `loadLogoMask` for why it is a mask rather than geometry.
 *
 * Loaded through `React.lazy`, and that is not an optimisation detail: `three`
 * and `gsap` together are about as large as everything else the site ships,
 * for one component that most visits never render. The render loop starts
 * before the artwork arrives so the spark covers that latency, rather than the
 * reader watching a black screen while the chunk downloads.
 *
 * **It fails open.** Every failure path calls `onDone` immediately and a
 * failsafe timer calls it regardless, because each of them would otherwise
 * leave the site stuck behind an animation that never finishes. A reader can
 * also skip with a click or a key — there is no button, since the brief asks
 * for no UI, but taking four seconds of someone's attention with no way out is
 * not a thing to do on purpose.
 */
export default function CinematicIntro({ onDone }: CinematicIntroProps) {
  const mountRef = useRef<HTMLDivElement>(null);
  const doneRef = useRef(onDone);
  doneRef.current = onDone;

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    let finished = false;
    let cancelled = false;
    const finish = () => {
      if (finished) return;
      finished = true;
      doneRef.current();
    };

    const failsafe = window.setTimeout(finish, FAILSAFE_MS);

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        antialias: false,
        alpha: true,
        powerPreference: 'high-performance',
      });
    } catch {
      window.clearTimeout(failsafe);
      finish();
      return;
    }

    const width = () => mount.clientWidth || window.innerWidth;
    const height = () => mount.clientHeight || window.innerHeight;
    const dpr = () => Math.min(window.devicePixelRatio || 1, width() < 700 ? 1.5 : 2);

    renderer.setPixelRatio(dpr());
    renderer.setSize(width(), height());
    renderer.setClearColor(0x000000, 0);
    mount.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, width() / height(), 0.1, 100);
    camera.position.z = 6;

    const blue = readColor('--color-intro-blue', '#1e63ff');
    const cyan = readColor('--color-intro-cyan', '#35e8ff');

    // Composer at half resolution: bloom is the most expensive thing here and
    // the least harmed by being soft — soft is what bloom is.
    const composer = new EffectComposer(renderer);
    composer.setPixelRatio(dpr() * 0.5);
    composer.setSize(width(), height());
    composer.addPass(new RenderPass(scene, camera));
    // Threshold high, strength low. Bloom that catches everything turns an
    // additive field into one white mass on a teal ground — measured, at a
    // threshold of 0.15 the whole frame lifted off black.
    composer.addPass(new UnrealBloomPass(new THREE.Vector2(width(), height()), 0.45, 0.4, 0.5));
    composer.addPass(new OutputPass());

    const group = new THREE.Group();
    scene.add(group);

    const sparkMat = new THREE.SpriteMaterial({
      color: cyan,
      transparent: true,
      opacity: 0,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const spark = new THREE.Sprite(sparkMat);
    spark.scale.setScalar(0.35);
    group.add(spark);

    const clock = new THREE.Clock();
    let frame = 0;
    let timeline: gsap.core.Timeline | undefined;
    let particleTime: { value: number } | null = null;
    let maskTexture: THREE.CanvasTexture | undefined;

    /**
     * The loop starts now, not when the artwork arrives.
     *
     * The intro is code-split and then fetches its own logo, so there is real
     * latency before there is anything to form. Starting the loop inside the
     * load callback meant that whole time was a black screen with nothing on
     * it. The spark needs none of it, so it opens immediately and the rest
     * joins it.
     */
    const render = () => {
      frame = requestAnimationFrame(render);
      if (particleTime) particleTime.value = clock.getElapsedTime();
      composer.render();
    };
    render();

    const sparkIn = gsap
      .timeline()
      .to(sparkMat, { opacity: 0.55, duration: 0.35, ease: 'power2.out' }, 0)
      .to(spark.scale, { x: 1.1, y: 1.1, z: 1.1, duration: 0.6, ease: 'power3.out' }, 0);

    const onContextLost = (event: Event) => {
      event.preventDefault();
      window.clearTimeout(failsafe);
      finish();
    };
    renderer.domElement.addEventListener('webglcontextlost', onContextLost);

    loadLogoMask('/forese-logo.svg')
      .then(({ canvas, context, width: maskW, height: maskH, aspect }) => {
        if (cancelled || finished) return;

        maskTexture = new THREE.CanvasTexture(canvas);
        maskTexture.colorSpace = THREE.SRGBColorSpace;
        maskTexture.minFilter = THREE.LinearFilter;
        maskTexture.generateMipmaps = false;

        // World size at the logo's plane, so the mark takes a fixed share of
        // the viewport at any size rather than a fixed number of units.
        const viewHeight = 2 * Math.tan((camera.fov * Math.PI) / 360) * camera.position.z;
        const viewWidth = viewHeight * camera.aspect;
        const planeWidth = Math.min(viewWidth * 0.54, viewHeight * 0.34 * aspect);
        const planeHeight = planeWidth / aspect;

        const logoMat = new THREE.ShaderMaterial({
          vertexShader: LOGO_VERT,
          fragmentShader: LOGO_FRAG,
          transparent: true,
          depthWrite: false,
          uniforms: {
            uMask: { value: maskTexture },
            uReveal: { value: 0 },
            uSweep: { value: -0.35 },
            uCyan: { value: cyan },
          },
        });
        group.add(new THREE.Mesh(new THREE.PlaneGeometry(planeWidth, planeHeight), logoMat));

        const count = particleCount(width());
        const unit = sampleMask(context, maskW, maskH, count);
        const targets = new Float32Array(count * 3);
        const starts = new Float32Array(count * 3);
        const seeds = new Float32Array(count);

        for (let i = 0; i < count; i += 1) {
          targets[i * 3] = unit[i * 3] * planeWidth;
          targets[i * 3 + 1] = unit[i * 3 + 1] * planeHeight;
          targets[i * 3 + 2] = 0;

          // Start on a shell around the centre, so the field arrives from
          // everywhere at once rather than from one edge of the frame.
          const theta = Math.random() * Math.PI * 2;
          const phi = Math.acos(2 * Math.random() - 1);
          const radius = 2.2 + Math.random() * 3.4;
          starts[i * 3] = Math.sin(phi) * Math.cos(theta) * radius;
          starts[i * 3 + 1] = Math.sin(phi) * Math.sin(theta) * radius * 0.7;
          starts[i * 3 + 2] = Math.cos(phi) * radius * 0.5;
          seeds[i] = Math.random();
        }

        const points = new THREE.BufferGeometry();
        points.setAttribute('position', new THREE.BufferAttribute(targets, 3));
        points.setAttribute('aStart', new THREE.BufferAttribute(starts, 3));
        points.setAttribute('aSeed', new THREE.BufferAttribute(seeds, 1));

        const particleMat = new THREE.ShaderMaterial({
          vertexShader: PARTICLE_VERT,
          fragmentShader: PARTICLE_FRAG,
          transparent: true,
          depthWrite: false,
          blending: THREE.AdditiveBlending,
          uniforms: {
            uProgress: { value: 0 },
            uCollapse: { value: 0 },
            uTime: { value: 0 },
            uSize: { value: width() < 700 ? 16 : 22 },
            uPixelRatio: { value: dpr() },
            uBlue: { value: blue },
            uCyan: { value: cyan },
          },
        });
        group.add(new THREE.Points(points, particleMat));

        particleTime = particleMat.uniforms.uTime;
        sparkIn.kill();

        timeline = gsap.timeline({ onComplete: finish });
        timeline
          .to(
            particleMat.uniforms.uProgress,
            { value: 0.18, duration: T.form - T.emerge, ease: 'power1.in' },
            T.emerge,
          )
          .to(sparkMat, { opacity: 0.14, duration: 0.6, ease: 'power2.inOut' }, T.form - 0.2)
          // Formation. `expo.out` front-loads the travel, so the shape is
          // legible early and the last stretch is a settle rather than a slide.
          .to(
            particleMat.uniforms.uProgress,
            { value: 1, duration: T.reveal - T.form, ease: 'expo.out' },
            T.form,
          )
          .to(
            logoMat.uniforms.uReveal,
            { value: 1, duration: 0.55, ease: 'power2.inOut' },
            T.reveal - 0.15,
          )
          .to(sparkMat, { opacity: 0, duration: 0.4 }, T.reveal)
          .to(
            logoMat.uniforms.uSweep,
            { value: 1.35, duration: 0.8, ease: 'power2.inOut' },
            T.reveal - 0.05,
          )
          // Collapse: the field falls back through the centre while the mark
          // scales down into the page underneath.
          .to(
            particleMat.uniforms.uCollapse,
            { value: 1, duration: T.end - T.collapse, ease: 'power3.in' },
            T.collapse,
          )
          .to(
            group.scale,
            { x: 0.82, y: 0.82, z: 0.82, duration: 0.8, ease: 'power2.in' },
            T.collapse,
          )
          .to(mount, { opacity: 0, duration: 0.45, ease: 'power2.in' }, T.end - 0.45);
      })
      .catch(() => {
        // The artwork is the whole point; without it there is nothing to form.
        window.clearTimeout(failsafe);
        finish();
      });

    const onResize = () => {
      camera.aspect = width() / height();
      camera.updateProjectionMatrix();
      renderer.setPixelRatio(dpr());
      renderer.setSize(width(), height());
      composer.setPixelRatio(dpr() * 0.5);
      composer.setSize(width(), height());
    };
    window.addEventListener('resize', onResize);

    const skip = () => {
      timeline?.progress(1);
      finish();
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape' || event.key === 'Enter' || event.key === ' ') skip();
    };
    window.addEventListener('keydown', onKey);
    mount.addEventListener('pointerdown', skip);

    return () => {
      cancelled = true;
      window.clearTimeout(failsafe);
      cancelAnimationFrame(frame);
      sparkIn.kill();
      timeline?.kill();
      window.removeEventListener('resize', onResize);
      window.removeEventListener('keydown', onKey);
      mount.removeEventListener('pointerdown', skip);
      renderer.domElement.removeEventListener('webglcontextlost', onContextLost);
      scene.traverse((object) => {
        if (object instanceof THREE.Mesh || object instanceof THREE.Points) {
          object.geometry.dispose();
          (object.material as THREE.Material).dispose();
        }
      });
      maskTexture?.dispose();
      sparkMat.dispose();
      composer.dispose();
      renderer.dispose();
      renderer.domElement.remove();
    };
  }, []);

  return (
    <div
      ref={mountRef}
      // `bg-black` rather than a token: this is the inside of a title
      // sequence, not a surface of the site, and it stays black whatever the
      // page behind it is doing.
      className="fixed inset-0 z-[100] bg-black"
      aria-hidden="true"
    />
  );
}
