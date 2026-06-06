import { useState, useEffect, useRef, useMemo } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import * as THREE from 'three';
import LeadCaptureModal from './LeadCaptureModal';
import {
  initAnalytics,
  trackScrollDepth,
  trackSlideEnter,
  trackSlideLeave,
  trackHotspotClick,
  trackCTAClick
} from '../services/analytics';

gsap.registerPlugin(ScrollTrigger);

// Technical Specs Data for the Anatomy HUD
const markersData = [
  { 
    id: 'proa', 
    label: '01_PROA_HIDRO', 
    title: 'Design de Proa OKEAN', 
    desc: 'Casco semi-deslocante otimizado para hidrodinâmica eficiente, garantindo navegação suave e estabilidade em mar aberto.', 
    x: 0, 
    y: 0.15, 
    z: 1.1 
  },
  { 
    id: 'cabine', 
    label: '02_CABIN_ENG', 
    title: 'Superestrutura de Carbono', 
    desc: 'Cabine reforçada com fibra de carbono integrada direto ao DNA Ferretti, oferecendo centro de gravidade rebaixado.', 
    x: 0, 
    y: 0.38, 
    z: 0.15 
  },
  { 
    id: 'estabilizadores', 
    label: '03_NAV_ORBIT', 
    title: 'Estabilização Giroscópica', 
    desc: 'Sistema Seakeeper 18 integrado ao barramento digital LNX-Core, mitigando até 95% do balanço em repouso e movimento.', 
    x: 0, 
    y: -0.22, 
    z: -0.3 
  },
  { 
    id: 'balconies', 
    label: '04_BEACH_CLUB', 
    title: 'Plataformas Retráteis', 
    desc: 'Sistemas eletro-hidráulicos nas laterais da popa que se expandem para formar um beach club integrado à natureza.', 
    x: 0.28, 
    y: -0.05, 
    z: -0.7 
  }
];

/**
 * CinematicScroller Component
 * Implements a premium mobile-first scroll-teller using official Yachtmax website images,
 * Three.js 3D WebGL overlay (Detailed Abstract Yacht Sculpture), a sophisticated Anatomy Boat HUD,
 * and a responsive stacked layout with interactive hotspots.
 */
export default function CinematicScroller() {
  const containerRef = useRef(null);
  const webglCanvasRef = useRef(null);
  
  // Slide refs for background crossfades
  const bg1Ref = useRef(null);
  const bg2Ref = useRef(null);
  const bg3Ref = useRef(null);

  // Content panel wrappers (Stacked positioned)
  const text1Ref = useRef(null);
  const text2Ref = useRef(null);
  const text3Ref = useRef(null);

  // Inner glass panels to control pointerEvents without blocking screen
  const panel1Ref = useRef(null);
  const panel2Ref = useRef(null);
  const panel3Ref = useRef(null);

  // Anatomy Boat HUD ref
  const hudRef = useRef(null);
  const hotspotsContainerRef = useRef(null);

  // Individual Hotspot and SVG Line Refs to prevent React re-renders in WebGL loop
  const proaDotRef = useRef(null);
  const cabineDotRef = useRef(null);
  const estabilizadoresDotRef = useRef(null);
  const balconiesDotRef = useRef(null);

  const proaLineRef = useRef(null);
  const cabineLineRef = useRef(null);
  const estabilizadoresLineRef = useRef(null);
  const balconiesLineRef = useRef(null);

  const hotspotRefs = useMemo(() => ({
    proa: proaDotRef,
    cabine: cabineDotRef,
    estabilizadores: estabilizadoresDotRef,
    balconies: balconiesDotRef
  }), []);

  const svgLineRefs = useMemo(() => ({
    proa: proaLineRef,
    cabine: cabineLineRef,
    estabilizadores: estabilizadoresLineRef,
    balconies: balconiesLineRef
  }), []);

  // State variables for mobile-first rendering
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [activeHotspot, setActiveHotspot] = useState('proa');

  // Active section state for navbar and sidebar tracking
  const [activeSection, setActiveSection] = useState('alliance'); // 'alliance' | 'specs' | 'contact'
  const activeSectionRef = useRef('alliance');

  // Lead modal and Zoom state variables
  const [showLeadModal, setShowLeadModal] = useState(false);
  const [leadModalType, setLeadModalType] = useState('broker'); // 'broker' | 'cafe'
  const [isZoomed, setIsZoomed] = useState(false);

  // Custom smooth scroll helper without ScrollToPlugin
  const scrollToSection = (progress) => {
    const trigger = ScrollTrigger.getAll()[0];
    if (trigger) {
      const start = trigger.start;
      const end = trigger.end;
      const targetScroll = start + (end - start) * progress;
      
      const scrollObj = { y: window.scrollY };
      gsap.killTweensOf(scrollObj);
      gsap.to(scrollObj, {
        y: targetScroll,
        duration: 1.2,
        ease: 'power2.inOut',
        onUpdate: () => {
          window.scrollTo(0, scrollObj.y);
        }
      });
    }
  };

  // Zoom and camera target refs
  const isZoomedRef = useRef(false);
  const cameraTargetRef = useRef(new THREE.Vector3(0, 0, 0));
  const triggerZoomRef = useRef(null);
  const triggerZoomBackRef = useRef(null);
  const scrollProgressRef = useRef(0);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    // Initialize Scroll Depth Analytics Engine
    initAnalytics();

    // -------------------------------------------------------------
    // 1. WebGL Three.js Setup (Abstract Yacht Sculpture)
    // -------------------------------------------------------------
    const scene = new THREE.Scene();
    
    const camera = new THREE.PerspectiveCamera(
      45,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    camera.position.set(0, 0, 3.5);

    const renderer = new THREE.WebGLRenderer({
      canvas: webglCanvasRef.current,
      alpha: true,
      antialias: true
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    // Enable ACES Filmic Tone Mapping + sRGB Output
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.25;

    // Generate PMREM procedural environment map
    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    pmremGenerator.compileEquirectangularShader();

    const envScene = new THREE.Scene();
    envScene.background = new THREE.Color('#07111c');

    const envHemiLight = new THREE.HemisphereLight(0x0d2236, 0xc7a97e, 1.5);
    envScene.add(envHemiLight);

    const envOverheadGeo = new THREE.BoxGeometry(10, 0.5, 10);
    const envOverheadMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const envOverhead = new THREE.Mesh(envOverheadGeo, envOverheadMat);
    envOverhead.position.set(0, 8, 0);
    envScene.add(envOverhead);

    const envWarmGeo = new THREE.SphereGeometry(3, 16, 16);
    const envWarmMat = new THREE.MeshBasicMaterial({ color: 0xc7a97e });
    const envWarm = new THREE.Mesh(envWarmGeo, envWarmMat);
    envWarm.position.set(6, 2, 5);
    envScene.add(envWarm);

    const envCoolGeo = new THREE.SphereGeometry(3, 16, 16);
    const envCoolMat = new THREE.MeshBasicMaterial({ color: 0x18344e });
    const envCool = new THREE.Mesh(envCoolGeo, envCoolMat);
    envCool.position.set(-6, 2, -5);
    envScene.add(envCool);

    const envTarget = pmremGenerator.fromScene(envScene);
    scene.environment = envTarget.texture;
    pmremGenerator.dispose();

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
    scene.add(ambientLight);

    const directionalLight1 = new THREE.DirectionalLight(0xc7a97e, 3.0); // Champagne Gold highlight
    directionalLight1.position.set(5, 5, 5);
    scene.add(directionalLight1);

    const directionalLight2 = new THREE.DirectionalLight(0xffffff, 1.5); // Pure white fill light
    directionalLight2.position.set(-5, 3, 2);
    scene.add(directionalLight2);

    // Warm PointLight for golden hour fill (stern popa)
    const warmBounceLight = new THREE.PointLight(0xffb070, 3.5, 10);
    warmBounceLight.position.set(1.5, -0.2, -1.5);
    scene.add(warmBounceLight);

    // Create Rig Group (for scroll tweens) and Child Group (for wave sways)
    const sculptureRig = new THREE.Group();
    const yachtSculpture = new THREE.Group();
    sculptureRig.add(yachtSculpture);

    // Material 1: Polished Gold Refined
    const goldMaterial = new THREE.MeshPhysicalMaterial({
      color: 0xc7a97e,
      roughness: 0.08,
      metalness: 0.95,
      clearcoat: 1.0,
      clearcoatRoughness: 0.04,
      reflectivity: 1.0,
      envMapIntensity: 1.5,
      sheen: 0.4,
      sheenColor: new THREE.Color(0xffd700),
      sheenRoughness: 0.1
    });

    // Material 2: Polished Platinum/Chrome Refined
    const chromeMaterial = new THREE.MeshPhysicalMaterial({
      color: 0xeae6df,
      roughness: 0.05,
      metalness: 1.0,
      clearcoat: 1.0,
      clearcoatRoughness: 0.02,
      reflectivity: 1.0,
      envMapIntensity: 2.0,
      iridescence: 0.4,
      iridescenceIOR: 1.3
    });

    // Material 3: Carbon Fiber / Matte Black
    const carbonMaterial = new THREE.MeshStandardMaterial({
      color: 0x1d1d1d,
      roughness: 0.6,
      metalness: 0.2
    });

    // Material 4: Dark Windshield Glass
    const glassMaterial = new THREE.MeshPhysicalMaterial({
      color: 0x07111c,
      transparent: true,
      opacity: 0.75,
      roughness: 0.05,
      transmission: 0.9,
      thickness: 0.3
    });

    // A. Stylized Extruded Hull (Sleek aerodynamic shape)
    const hullShape = new THREE.Shape();
    hullShape.moveTo(0, 1.3);
    hullShape.quadraticCurveTo(0.28, 0.4, 0.22, -1.2);
    hullShape.lineTo(-0.22, -1.2);
    hullShape.quadraticCurveTo(-0.28, 0.4, 0, 1.3);

    const extrudeSettings = {
      steps: 2,
      depth: 0.16,
      bevelEnabled: true,
      bevelThickness: 0.04,
      bevelSize: 0.03,
      bevelSegments: 5
    };

    const hullGeometry = new THREE.ExtrudeGeometry(hullShape, extrudeSettings);
    const hullMesh = new THREE.Mesh(hullGeometry, goldMaterial);
    hullMesh.rotation.x = Math.PI / 2; // Lie flat
    hullMesh.position.y = -0.15;
    yachtSculpture.add(hullMesh);

    // A.1 Teak/Carbon Deck Plate
    const deckPlateShape = new THREE.Shape();
    deckPlateShape.moveTo(0, 1.25);
    deckPlateShape.quadraticCurveTo(0.26, 0.38, 0.21, -1.15);
    deckPlateShape.lineTo(-0.21, -1.15);
    deckPlateShape.quadraticCurveTo(-0.26, 0.38, 0, 1.25);

    const deckPlateGeo = new THREE.ExtrudeGeometry(deckPlateShape, {
      steps: 1,
      depth: 0.015,
      bevelEnabled: false
    });
    const deckPlateMat = new THREE.MeshPhysicalMaterial({
      color: 0x1a1a1a, // Dark slate teak/carbon
      roughness: 0.65,
      metalness: 0.2,
      clearcoat: 0.1
    });
    const deckPlate = new THREE.Mesh(deckPlateGeo, deckPlateMat);
    deckPlate.rotation.x = Math.PI / 2;
    deckPlate.position.y = 0.02; // slightly above hull top
    yachtSculpture.add(deckPlate);

    // A.2 Symmetrical Side Railings (Chrome rods along deck edge)
    const railingGeo = new THREE.CylinderGeometry(0.005, 0.005, 1.9, 8);
    const leftRailing = new THREE.Mesh(railingGeo, chromeMaterial);
    leftRailing.position.set(-0.22, 0.04, 0.05);
    leftRailing.rotation.x = Math.PI / 2;
    yachtSculpture.add(leftRailing);

    const rightRailing = new THREE.Mesh(railingGeo, chromeMaterial);
    rightRailing.position.set(0.22, 0.04, 0.05);
    rightRailing.rotation.x = Math.PI / 2;
    yachtSculpture.add(rightRailing);

    // A.3 Tilted Mast & Radar Dome (Stern popa)
    const mastGeo = new THREE.CylinderGeometry(0.008, 0.014, 0.35, 8);
    const mastMesh = new THREE.Mesh(mastGeo, chromeMaterial);
    mastMesh.position.set(0, 0.12, -0.85);
    mastMesh.rotation.x = -Math.PI / 6; // tilted back
    yachtSculpture.add(mastMesh);

    const domeGeo = new THREE.CylinderGeometry(0.05, 0.05, 0.025, 16);
    const domeMesh = new THREE.Mesh(domeGeo, carbonMaterial);
    domeMesh.position.set(0, 0.28, -0.92);
    yachtSculpture.add(domeMesh);

    // B. Balconies (Fold-out side platforms - signature OKEAN design)
    const balconyGeo = new THREE.BoxGeometry(0.12, 0.02, 0.45);
    
    // Right balcony
    const rightBalcony = new THREE.Mesh(balconyGeo, goldMaterial);
    rightBalcony.position.set(0.25, -0.05, -0.7);
    rightBalcony.rotation.y = -Math.PI / 16; // Rotated slightly out
    yachtSculpture.add(rightBalcony);
    
    // Left balcony
    const leftBalcony = new THREE.Mesh(balconyGeo, goldMaterial);
    leftBalcony.position.set(-0.25, -0.05, -0.7);
    leftBalcony.rotation.y = Math.PI / 16; // Rotated slightly out
    yachtSculpture.add(leftBalcony);

    // C. Deck & Cabin Structure
    const cabinShape = new THREE.Shape();
    cabinShape.moveTo(0, 0.5);
    cabinShape.lineTo(0.13, -0.5);
    cabinShape.lineTo(-0.13, -0.5);
    cabinShape.closePath();

    const cabinGeometry = new THREE.ExtrudeGeometry(cabinShape, {
      steps: 1,
      depth: 0.12,
      bevelEnabled: true,
      bevelThickness: 0.03,
      bevelSize: 0.02,
      bevelSegments: 3
    });
    const cabinMesh = new THREE.Mesh(cabinGeometry, chromeMaterial);
    cabinMesh.rotation.x = Math.PI / 2;
    cabinMesh.position.set(0, 0.06, 0.15);
    yachtSculpture.add(cabinMesh);

    // D. Flybridge Hardtop (Carbon style)
    const hardtopGeo = new THREE.BoxGeometry(0.18, 0.02, 0.5);
    const hardtopMesh = new THREE.Mesh(hardtopGeo, carbonMaterial);
    hardtopMesh.position.set(0, 0.28, -0.1);
    yachtSculpture.add(hardtopMesh);

    // E. Windshield Glass
    const windshieldGeo = new THREE.BoxGeometry(0.2, 0.12, 0.3);
    const windshieldMesh = new THREE.Mesh(windshieldGeo, glassMaterial);
    windshieldMesh.position.set(0, 0.18, 0.35);
    windshieldMesh.rotation.x = -Math.PI / 6; // slanted forward
    yachtSculpture.add(windshieldMesh);

    // F. Symmetrical Propulsion Jet Pipes (Stern)
    const jetGeo = new THREE.CylinderGeometry(0.025, 0.025, 0.1, 16);
    
    const leftJet = new THREE.Mesh(jetGeo, chromeMaterial);
    leftJet.position.set(-0.1, -0.1, -1.25);
    leftJet.rotation.x = Math.PI / 2;
    yachtSculpture.add(leftJet);

    const rightJet = new THREE.Mesh(jetGeo, chromeMaterial);
    rightJet.position.set(0.1, -0.1, -1.25);
    rightJet.rotation.x = Math.PI / 2;
    yachtSculpture.add(rightJet);

    // G. Concentric Navigation Orbits
    const orbit1Geometry = new THREE.TorusGeometry(1.6, 0.015, 16, 100);
    const orbit1Mesh = new THREE.Mesh(orbit1Geometry, goldMaterial);
    orbit1Mesh.rotation.x = Math.PI / 2.2;
    yachtSculpture.add(orbit1Mesh);

    const orbit2Geometry = new THREE.TorusGeometry(1.8, 0.01, 16, 100);
    const orbit2Mesh = new THREE.Mesh(orbit2Geometry, chromeMaterial);
    orbit2Mesh.rotation.y = Math.PI / 3;
    yachtSculpture.add(orbit2Mesh);

    // H. Technical 3D Hotspot Markers
    const glowingMarkerMaterial = new THREE.MeshBasicMaterial({
      color: 0xc7a97e,
      transparent: true,
      opacity: 0.9
    });

    const markers = [];
    markersData.forEach(data => {
      // Small sphere indicator
      const sphereGeom = new THREE.SphereGeometry(0.035, 16, 16);
      const sphereMesh = new THREE.Mesh(sphereGeom, glowingMarkerMaterial);
      sphereMesh.position.set(data.x, data.y, data.z);
      
      // Horizontal ring around the sphere
      const ringGeom = new THREE.RingGeometry(0.05, 0.07, 32);
      const ringMat = new THREE.MeshBasicMaterial({
        color: 0xe3c48a,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.6
      });
      const ringMesh = new THREE.Mesh(ringGeom, ringMat);
      ringMesh.rotation.x = Math.PI / 2;
      sphereMesh.add(ringMesh);
      
      yachtSculpture.add(sphereMesh);
      markers.push({ id: data.id, mesh: sphereMesh, ring: ringMesh });
    });

    // Shiny, reflective ocean surface disk (stays flat, scales with rig)
    const diskGeo = new THREE.RingGeometry(0, 3, 64);
    const diskMat = new THREE.MeshPhysicalMaterial({
      color: 0x07111c,
      roughness: 0.12,
      metalness: 0.9,
      clearcoat: 1.0,
      clearcoatRoughness: 0.08,
      transparent: true,
      opacity: 0.75,
      side: THREE.DoubleSide
    });
    const diskMesh = new THREE.Mesh(diskGeo, diskMat);
    diskMesh.rotation.x = -Math.PI / 2;
    diskMesh.position.y = -0.55;
    sculptureRig.add(diskMesh);

    // Waving digital ocean wireframe grid (fades towards edges via vertex colors)
    const gridSegments = 40;
    const gridGeom = new THREE.PlaneGeometry(8, 8, gridSegments, gridSegments);
    
    // Add vertex colors for fading out towards boundaries
    const gridColors = [];
    const gridPosAttr = gridGeom.attributes.position;
    for (let i = 0; i < gridPosAttr.count; i++) {
      const gx = gridPosAttr.getX(i);
      const gy = gridPosAttr.getY(i);
      const dist = Math.sqrt(gx * gx + gy * gy);
      // fade out color values based on distance from center (max radius 3.8)
      const alpha = Math.max(0, 1 - dist / 3.8);
      const baseColor = new THREE.Color(0xc7a97e); // Champagne Gold accent
      gridColors.push(baseColor.r * alpha, baseColor.g * alpha, baseColor.b * alpha);
    }
    gridGeom.setAttribute('color', new THREE.Float32BufferAttribute(gridColors, 3));

    const gridMat = new THREE.MeshBasicMaterial({
      vertexColors: true,
      wireframe: true,
      transparent: true,
      opacity: 0.35,
      side: THREE.DoubleSide,
      depthWrite: false
    });
    const gridMesh = new THREE.Mesh(gridGeom, gridMat);
    gridMesh.rotation.x = -Math.PI / 2;
    gridMesh.position.y = -0.53; // Slightly above disk
    sculptureRig.add(gridMesh);

    // Volumetric sunbeam (semi-transparent open-ended cone) representing sun flare
    const coneGeo = new THREE.ConeGeometry(1.8, 5.5, 32, 1, true);
    const coneMat = new THREE.MeshBasicMaterial({
      color: 0xc7a97e, // Champagne gold beam
      transparent: true,
      opacity: 0.05,
      blending: THREE.AdditiveBlending,
      side: THREE.DoubleSide,
      depthWrite: false
    });
    const sunbeam = new THREE.Mesh(coneGeo, coneMat);
    // Point it down and forward onto the boat
    sunbeam.position.set(1.5, 2.0, -0.5);
    sunbeam.rotation.z = -Math.PI / 5;
    sculptureRig.add(sunbeam);

    // Background golden glow aura sprite
    const canvasGlow = document.createElement('canvas');
    canvasGlow.width = 128;
    canvasGlow.height = 128;
    const ctxGlow = canvasGlow.getContext('2d');
    const gradGlow = ctxGlow.createRadialGradient(64, 64, 0, 64, 64, 64);
    gradGlow.addColorStop(0, 'rgba(199, 169, 126, 0.22)'); // warm champagne
    gradGlow.addColorStop(0.5, 'rgba(199, 169, 126, 0.08)');
    gradGlow.addColorStop(1, 'rgba(199, 169, 126, 0)');
    ctxGlow.fillStyle = gradGlow;
    ctxGlow.fillRect(0, 0, 128, 128);

    const glowTexture = new THREE.CanvasTexture(canvasGlow);
    const glowMaterial = new THREE.SpriteMaterial({
      map: glowTexture,
      blending: THREE.AdditiveBlending,
      transparent: true,
      opacity: 0.75
    });
    const glowSprite = new THREE.Sprite(glowMaterial);
    glowSprite.position.set(0, 0, -1.2);
    glowSprite.scale.set(4.5, 4.5, 1);
    sculptureRig.add(glowSprite);

    scene.add(sculptureRig);

    // I. Sparkle Particle Field (Champagne Dust)
    const particleCount = 180;
    const particleGeometry = new THREE.BufferGeometry();
    const particlePositions = new Float32Array(particleCount * 3);
    const particleSpeeds = [];

    for (let i = 0; i < particleCount; i++) {
      particlePositions[i * 3] = (Math.random() - 0.5) * 8; // X
      particlePositions[i * 3 + 1] = (Math.random() - 0.5) * 4; // Y
      particlePositions[i * 3 + 2] = (Math.random() - 0.5) * 6; // Z
      
      particleSpeeds.push({
        x: (Math.random() - 0.5) * 0.0015,
        y: Math.random() * 0.002 + 0.001, // upward drift
        z: (Math.random() - 0.5) * 0.0015,
        phase: Math.random() * Math.PI * 2
      });
    }

    particleGeometry.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));

    // Create a beautiful round glow particle texture procedurally
    const canvasParticle = document.createElement('canvas');
    canvasParticle.width = 16;
    canvasParticle.height = 16;
    const ctx = canvasParticle.getContext('2d');
    const grad = ctx.createRadialGradient(8, 8, 0, 8, 8, 8);
    grad.addColorStop(0, 'rgba(255, 235, 180, 1)'); // bright warm white/gold
    grad.addColorStop(0.3, 'rgba(199, 169, 126, 0.6)'); // champagne
    grad.addColorStop(1, 'rgba(199, 169, 126, 0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 16, 16);

    const particleTexture = new THREE.CanvasTexture(canvasParticle);

    const particleMaterial = new THREE.PointsMaterial({
      size: 0.15,
      map: particleTexture,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      opacity: 0.85
    });

    const particles = new THREE.Points(particleGeometry, particleMaterial);
    scene.add(particles);

    // -------------------------------------------------------------
    // Responsive Layout & Viewport Adapters
    // -------------------------------------------------------------
    let isMob = window.innerWidth < 768;

    const adjustLayout = () => {
      const w = window.innerWidth;
      
      isMob = w < 768;
      const isTab = w >= 768 && w < 1024;
      
      if (isMob) {
        // Mobile layout: model shifted upwards, scaled down
        sculptureRig.position.set(0, 0.35, 0);
        sculptureRig.scale.setScalar(0.7);
        camera.position.set(0, 0, 4.3);
      } else if (isTab) {
        // Tablet layout: centered, slightly scaled down
        sculptureRig.position.set(0, 0.1, 0);
        sculptureRig.scale.setScalar(0.85);
        camera.position.set(0, 0, 3.8);
      } else {
        // Desktop layout: shifted right to make space for left side text
        sculptureRig.position.set(0.5, -0.05, 0);
        sculptureRig.scale.setScalar(0.95);
        camera.position.set(0, 0, 3.3);
      }
    };

    // Set initial size and layout
    adjustLayout();

    // -------------------------------------------------------------
    // 2. GSAP ScrollTrigger & Scroll-Teller Animation
    // -------------------------------------------------------------
    let activeSlide = 'panel1';
    trackSlideEnter('panel1');

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: containerRef.current,
        start: 'top top',
        end: 'bottom bottom',
        scrub: 1.2,
        pin: true,
        anticipatePin: 1,
        onUpdate: (self) => {
          const progress = self.progress;
          scrollProgressRef.current = progress;

          // Scroll depth milestones tracking
          const progressPct = Math.round(progress * 100);
          if (progressPct >= 25) trackScrollDepth(25);
          if (progressPct >= 50) trackScrollDepth(50);
          if (progressPct >= 75) trackScrollDepth(75);
          if (progressPct >= 100) trackScrollDepth(100);

          // Slide timings enter/leave tracking
          let currentSlide = 'panel1';
          if (progress >= 0.2 && progress < 1.0) {
            currentSlide = 'panel2';
          } else if (progress >= 1.0) {
            currentSlide = 'panel3';
          }

          if (currentSlide !== activeSlide) {
            trackSlideLeave(activeSlide);
            trackSlideEnter(currentSlide);
            activeSlide = currentSlide;
          }

          // Active Section React State Tracking
          let section = 'alliance';
          if (progress >= 0.25 && progress < 0.8) {
            section = 'specs';
          } else if (progress >= 0.8) {
            section = 'contact';
          }

          if (section !== activeSectionRef.current) {
            activeSectionRef.current = section;
            setActiveSection(section);
          }
        }
      }
    });

    // --- INITIAL STATES ---
    // Make only active glass panels interactive to avoid overlay blocking
    gsap.set(panel1Ref.current, { opacity: 1, pointerEvents: 'auto' });
    gsap.set(panel2Ref.current, { opacity: 0, y: 50, pointerEvents: 'none' });
    gsap.set(panel3Ref.current, { opacity: 0, y: 50, pointerEvents: 'none' });
    
    gsap.set(hudRef.current, { opacity: 0, scale: 0.95, pointerEvents: 'none' });
    gsap.set(hotspotsContainerRef.current, { opacity: 0, pointerEvents: 'none' });

    // --- TIMELINE STEP 1: Slide 1 -> Slide 2 (Middle) ---
    // Background crossfade (BG1 -> BG2)
    tl.to(bg1Ref.current, { opacity: 0, ease: 'power2.inOut' }, 0);
    tl.to(bg2Ref.current, { opacity: 1, ease: 'power2.inOut' }, 0);
    tl.to(bg1Ref.current, { scale: 1.05, ease: 'none' }, 0);
    tl.to(bg2Ref.current, { scale: 1.05, ease: 'none' }, 0);

    // Panel 1 Fades Out
    tl.to(panel1Ref.current, { opacity: 0, y: -50, ease: 'power2.inOut' }, 0);
    tl.set(panel1Ref.current, { pointerEvents: 'none' }, 0.2);

    // Panel 2 Fades In
    tl.to(panel2Ref.current, { opacity: 1, y: 0, ease: 'power2.inOut' }, 0.2);
    tl.set(panel2Ref.current, { pointerEvents: 'auto' }, 0.2);
    
    // Anatomy HUD & Hotspots Fade In during Slide 2
    tl.to(hudRef.current, { opacity: 1, scale: 1, pointerEvents: 'auto', ease: 'power2.inOut' }, 0.3);
    tl.to(hotspotsContainerRef.current, { opacity: 1, pointerEvents: 'auto', ease: 'power2.inOut' }, 0.3);

    // Camera move & Rig Rotation
    tl.to(camera.position, { x: 0, y: 0, z: 3.2, ease: 'power2.inOut' }, 0);
    tl.to(sculptureRig.rotation, { y: Math.PI / 3, x: Math.PI / 8, ease: 'power2.inOut' }, 0);

    // --- TIMELINE STEP 2: Slide 2 -> Slide 3 (Bottom) ---
    // Background crossfade (BG2 -> BG3)
    tl.to(bg2Ref.current, { opacity: 0, ease: 'power2.inOut' }, 1);
    tl.to(bg3Ref.current, { opacity: 1, ease: 'power2.inOut' }, 1);
    tl.to(bg3Ref.current, { scale: 1.08, ease: 'none' }, 1);

    // Panel 2 Fades Out
    tl.to(panel2Ref.current, { opacity: 0, y: -50, ease: 'power2.inOut' }, 1);
    tl.set(panel2Ref.current, { pointerEvents: 'none' }, 1.0);
    
    // Anatomy HUD & Hotspots Fade Out
    tl.to(hudRef.current, { opacity: 0, scale: 0.95, pointerEvents: 'none', ease: 'power2.inOut' }, 1);
    tl.to(hotspotsContainerRef.current, { opacity: 0, pointerEvents: 'none', ease: 'power2.inOut' }, 1);

    // Panel 3 Fades In
    tl.to(panel3Ref.current, { opacity: 1, y: 0, ease: 'power2.inOut' }, 1.2);
    tl.set(panel3Ref.current, { pointerEvents: 'auto' }, 1.2);

    // Camera Center & Model Spin
    tl.to(camera.position, { x: 0, z: 3.0, ease: 'power2.inOut' }, 1);
    tl.to(sculptureRig.rotation, { y: Math.PI * 2.3, x: Math.PI / 5, ease: 'power2.inOut' }, 1);

    // --- Camera Target & Zoom Tweens ---
    const savedCameraPos = new THREE.Vector3();
    const cameraTarget = new THREE.Vector3(0, 0, 0);
    cameraTargetRef.current = cameraTarget;

    triggerZoomRef.current = (markerId) => {
      const marker = markers.find(m => m.id === markerId);
      if (!marker) return;

      // Track click in analytics
      trackHotspotClick(markerId);

      // Save pre-zoom camera position
      if (!isZoomedRef.current) {
        savedCameraPos.copy(camera.position);
        isZoomedRef.current = true;
        setIsZoomed(true);
        document.body.style.overflow = 'hidden';
      }

      // Calculate world coordinates of the marker
      const targetWorldPos = new THREE.Vector3();
      marker.mesh.getWorldPosition(targetWorldPos);

      // Calculate target camera position (0.8 units offset along target line)
      const direction = new THREE.Vector3().subVectors(camera.position, targetWorldPos).normalize();
      const targetCamPos = targetWorldPos.clone().addScaledVector(direction, 0.8);

      // Kill any active camera tweens
      gsap.killTweensOf(camera.position);
      gsap.killTweensOf(cameraTarget);

      // Tween to zoom
      gsap.to(camera.position, {
        x: targetCamPos.x,
        y: targetCamPos.y,
        z: targetCamPos.z,
        duration: 1.2,
        ease: 'power2.inOut'
      });

      gsap.to(cameraTarget, {
        x: targetWorldPos.x,
        y: targetWorldPos.y,
        z: targetWorldPos.z,
        duration: 1.2,
        ease: 'power2.inOut'
      });
    };

    triggerZoomBackRef.current = () => {
      if (!isZoomedRef.current) return;

      gsap.killTweensOf(camera.position);
      gsap.killTweensOf(cameraTarget);

      gsap.to(camera.position, {
        x: savedCameraPos.x,
        y: savedCameraPos.y,
        z: savedCameraPos.z,
        duration: 1.2,
        ease: 'power2.inOut',
        onComplete: () => {
          isZoomedRef.current = false;
          setIsZoomed(false);
          document.body.style.overflow = '';
        }
      });

      gsap.to(cameraTarget, {
        x: 0,
        y: 0,
        z: 0,
        duration: 1.2,
        ease: 'power2.inOut'
      });
    };

    // Viewport Raycasting Click Listener
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const handleViewportClick = (event) => {
      // Only process when HUD slide is visible and modal is closed
      if (!hudRef.current) return;
      const hudStyle = window.getComputedStyle(hudRef.current);
      if (parseFloat(hudStyle.opacity) < 0.5) return;
      if (showLeadModal) return;

      // Skip if clicked on UI elements
      if (
        event.target.tagName === 'BUTTON' ||
        event.target.tagName === 'INPUT' ||
        event.target.tagName === 'SELECT' ||
        event.target.closest('.hud-spec-item')
      ) return;

      // Mouse normalized coordinates
      mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
      mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const markerMeshes = markers.map(m => m.mesh);
      const intersects = raycaster.intersectObjects(markerMeshes, true);

      if (intersects.length > 0) {
        const clickedMesh = intersects[0].object;
        const hit = markers.find(m => m.mesh === clickedMesh || m.mesh.children.includes(clickedMesh));
        if (hit) {
          setActiveHotspot(hit.id);
          triggerZoomRef.current(hit.id);
        }
      }
    };

    window.addEventListener('click', handleViewportClick);

    // Render loop
    let animationId;
    const animate = () => {
      animationId = requestAnimationFrame(animate);
      
      // Floating wave animation (Water Drift & Tilt) - Paused during Zoom
      const driftY = Math.sin(Date.now() * 0.001) * 0.04;
      const driftRotY = Math.sin(Date.now() * 0.0008) * 0.02;
      const driftRotX = Math.cos(Date.now() * 0.0006) * 0.01;
      
      if (!isZoomedRef.current) {
        yachtSculpture.position.y = driftY;
        yachtSculpture.rotation.y = driftRotY;
        yachtSculpture.rotation.x = driftRotX;
      } else {
        // Reset/dampen drift when zoomed in so markers don't wobble away from connecting SVG lines
        yachtSculpture.position.y = 0;
        yachtSculpture.rotation.set(0, 0, 0);
      }
      
      // Secondary independent rotations of orbits
      orbit1Mesh.rotation.z += 0.0015;
      orbit2Mesh.rotation.x += 0.002;

      // Animate digital ocean grid waves
      const timeVal = Date.now() * 0.001;
      const gPosAttr = gridGeom.attributes.position;
      for (let i = 0; i < gPosAttr.count; i++) {
        const gx = gPosAttr.getX(i);
        const gy = gPosAttr.getY(i);
        // Calculate vertical swell height using sinusoidal interference patterns
        const gz = Math.sin(gx * 0.9 + timeVal) * 0.12 + Math.cos(gy * 0.8 + timeVal * 1.1) * 0.08;
        gPosAttr.setZ(i, gz);
      }
      gPosAttr.needsUpdate = true;

      // Pulse background golden glow sprite
      const glowPulse = 1.0 + Math.sin(Date.now() * 0.0006) * 0.06;
      glowSprite.scale.set(4.5 * glowPulse, 4.5 * glowPulse, 1);
      glowSprite.material.opacity = 0.65 + Math.sin(Date.now() * 0.0008) * 0.1;

      // Pulse volumetric sunbeam opacity to simulate floating dust scattering
      sunbeam.material.opacity = 0.045 + Math.sin(Date.now() * 0.0004) * 0.015;

      // Pulse markers
      markers.forEach(m => {
        const pulse = 1.0 + Math.sin(Date.now() * 0.005) * 0.15;
        m.mesh.scale.setScalar(pulse);
        m.ring.rotation.z += 0.008;
      });

      // Project 3D coordinate anchors to 2D Screen Space
      const tempV = new THREE.Vector3();
      markers.forEach(m => {
        m.mesh.getWorldPosition(tempV);
        tempV.project(camera);
        
        const x = (tempV.x * 0.5 + 0.5) * window.innerWidth;
        const y = -(tempV.y * 0.5 - 0.5) * window.innerHeight;
        
        // Direct DOM Update of Hotspot Dot Position (no React re-renders)
        const dot = hotspotRefs[m.id].current;
        if (dot) {
          dot.style.left = `${x}px`;
          dot.style.top = `${y}px`;
        }
        
        // Direct DOM Update of SVG Connecting Line (Desktop Only)
        const line = svgLineRefs[m.id].current;
        if (line) {
          line.setAttribute('x1', String(x));
          line.setAttribute('y1', String(y));
          
          const targetBox = document.getElementById(`hud-spec-target-${m.id}`);
          if (targetBox) {
            const rect = targetBox.getBoundingClientRect();
            const y2 = rect.top + rect.height / 2;
            const x2 = rect.left;
            
            line.setAttribute('x2', String(x2));
            line.setAttribute('y2', String(y2));
            
            // Sync line opacity with the parent HUD opacity
            if (hudRef.current) {
              line.style.opacity = window.getComputedStyle(hudRef.current).opacity;
            }
          }
        }
      });
      
      // Animate particle drift with cinematic spiral winds
      const positions = particleGeometry.attributes.position.array;
      for (let i = 0; i < particleCount; i++) {
        const heightY = positions[i * 3 + 1];
        positions[i * 3] += particleSpeeds[i].x;
        positions[i * 3 + 1] += particleSpeeds[i].y;
        positions[i * 3 + 2] += particleSpeeds[i].z;

        // Wind eddies (horizontal swirls relative to height)
        positions[i * 3] += Math.sin(Date.now() * 0.0008 + heightY * 2.0 + particleSpeeds[i].phase) * 0.0025;
        positions[i * 3 + 2] += Math.cos(Date.now() * 0.0008 + heightY * 2.0 + particleSpeeds[i].phase) * 0.0025;

        // Reset particles out of bounds
        if (positions[i * 3 + 1] > 3) {
          positions[i * 3 + 1] = -3;
          positions[i * 3] = (Math.random() - 0.5) * 8;
          positions[i * 3 + 2] = (Math.random() - 0.5) * 6;
        }
      }
      particleGeometry.attributes.position.needsUpdate = true;

      // Rotate particle field based on scroll
      particles.rotation.y = scrollProgressRef.current * Math.PI * 0.5;
      
      camera.lookAt(cameraTargetRef.current);
      renderer.render(scene, camera);
    };
    animate();

    // Resize handler
    const handleResize = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
      adjustLayout();
    };
    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('click', handleViewportClick);
      ScrollTrigger.getAll().forEach(t => t.kill());
      trackSlideLeave(activeSlide);
      // Ensure body overflow is restored
      document.body.style.overflow = '';
    };
  }, [showLeadModal, hotspotRefs, svgLineRefs]);

  return (
    <>
      {/* Brand Header */}
      <header className="cinematic-header">
        <a href="#home" className="cinematic-header-logo" onClick={(e) => { e.preventDefault(); scrollToSection(0); }}>
          YACHTMAX <span className="text-mono">EXPERIENCE SYSTEM</span>
        </a>
        <nav className="cinematic-header-nav">
          <button 
            onClick={() => scrollToSection(0)} 
            className={`cinematic-header-nav-link ${activeSection === 'alliance' ? 'active' : ''}`}
            style={{ background: 'transparent', border: 'none' }}
          >
            01 Aliança
          </button>
          <button 
            onClick={() => scrollToSection(0.5)} 
            className={`cinematic-header-nav-link ${activeSection === 'specs' ? 'active' : ''}`}
            style={{ background: 'transparent', border: 'none' }}
          >
            02 Especificações
          </button>
          <button 
            onClick={() => scrollToSection(1.0)} 
            className={`cinematic-header-nav-link ${activeSection === 'contact' ? 'active' : ''}`}
            style={{ background: 'transparent', border: 'none' }}
          >
            03 Contato
          </button>
          <span className="cinematic-header-badge">OKEAN • FERRETTI GROUP</span>
        </nav>
      </header>

      {/* Sidebar Slide Tracker Indicator */}
      <div className="sidebar-nav-container">
        <button 
          onClick={() => scrollToSection(0)} 
          className={`sidebar-nav-dot-wrapper ${activeSection === 'alliance' ? 'active' : ''}`}
        >
          <span className="sidebar-nav-dot" />
          <span className="sidebar-nav-label">01 ALIANÇA</span>
        </button>
        <div className="sidebar-nav-line">
          <div 
            className="sidebar-nav-line-progress" 
            style={{ 
              height: `${activeSection === 'alliance' ? 0 : activeSection === 'specs' ? 50 : 100}%` 
            }} 
          />
        </div>
        <button 
          onClick={() => scrollToSection(0.5)} 
          className={`sidebar-nav-dot-wrapper ${activeSection === 'specs' ? 'active' : ''}`}
        >
          <span className="sidebar-nav-dot" />
          <span className="sidebar-nav-label">02 SPECS</span>
        </button>
        <div className="sidebar-nav-line">
          <div 
            className="sidebar-nav-line-progress" 
            style={{ 
              height: `${activeSection === 'alliance' ? 0 : activeSection === 'specs' ? 0 : 100}%` 
            }} 
          />
        </div>
        <button 
          onClick={() => scrollToSection(1.0)} 
          className={`sidebar-nav-dot-wrapper ${activeSection === 'contact' ? 'active' : ''}`}
        >
          <span className="sidebar-nav-dot" />
          <span className="sidebar-nav-label">03 CONTATO</span>
        </button>
      </div>

      {/* Scroll Down Prompt (Slide 1 Only) */}
      <div 
        className="scroll-prompt" 
        style={{ 
          opacity: activeSection === 'alliance' ? 0.8 : 0,
          pointerEvents: 'none'
        }}
      >
        <span className="scroll-prompt-text">Scroll para explorar</span>
        <div className="scroll-prompt-line" />
      </div>

      <div 
        ref={containerRef} 
        style={{ position: 'relative', width: '100%', minHeight: '300vh' }}
      >

      <style>{`
        @keyframes hud-pulse {
          0% { transform: scale(0.6); opacity: 1; }
          100% { transform: scale(1.6); opacity: 0; }
        }
        .hud-spec-item {
          transition: all 0.3s ease;
          cursor: pointer;
          padding: 8px var(--space-2);
          border-radius: var(--radius-soft);
          border-left: 3px solid transparent;
        }
        .hud-spec-item:hover, .hud-spec-item.active {
          background: rgba(199, 169, 126, 0.12);
          border-left: 3px solid var(--color-champagne-metal);
        }
        .hud-hotspot {
          transition: background 0.3s, transform 0.2s;
        }
        .hud-hotspot:hover {
          transform: translate(-50%, -50%) scale(1.2);
        }
      `}</style>

      {/* =============================================================
          Visual Canvas & Background Stacking Layers (Absolute Positioned)
          ============================================================= */}
      <div 
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          overflow: 'hidden',
          backgroundColor: '#07111c',
          zIndex: 1
        }}
      >
        {/* BG 1: OKEAN RJ Boatshow */}
        <div
          ref={bg1Ref}
          style={{
            position: 'absolute',
            width: '100%',
            height: '100%',
            backgroundImage: "url('/yachtmax_official_3.png')",
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            filter: 'brightness(0.35) contrast(1.15)',
            zIndex: 1,
            opacity: 1
          }}
        />

        {/* BG 2: Yachtmax Hero */}
        <div
          ref={bg2Ref}
          style={{
            position: 'absolute',
            width: '100%',
            height: '100%',
            backgroundImage: "url('/yachtmax_official_2.png')",
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            filter: 'brightness(0.3) contrast(1.15)',
            zIndex: 2,
            opacity: 0
          }}
        />

        {/* BG 3: Dark Radial Gradient */}
        <div
          ref={bg3Ref}
          style={{
            position: 'absolute',
            width: '100%',
            height: '100%',
            background: 'radial-gradient(circle, #0d2236 0%, #07111c 100%)',
            zIndex: 3,
            opacity: 0
          }}
        />

        {/* Three.js Canvas */}
        <canvas
          ref={webglCanvasRef}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            zIndex: 4,
            pointerEvents: 'none'
          }}
        />

        {/* Zoom UI Back Button */}
        {isZoomed && (
          <button 
            className="zoom-back-btn"
            onClick={(e) => {
              e.stopPropagation();
              if (triggerZoomBackRef.current) {
                triggerZoomBackRef.current();
              }
            }}
            style={{ zIndex: 50 }}
          >
            ← Voltar
          </button>
        )}

        {/* Dynamic Connecting Lines for Anatomy HUD (Desktop Only) */}
        <svg
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            zIndex: 5,
            pointerEvents: 'none',
            display: isMobile ? 'none' : 'block'
          }}
        >
          {markersData.map(item => (
            <line
              key={item.id}
              ref={svgLineRefs[item.id]}
              stroke="var(--color-champagne-metal)"
              strokeWidth="1.5"
              strokeDasharray="4,4"
              style={{ opacity: 0 }}
            />
          ))}
        </svg>

        {/* Interactive HTML Hotspot Anchors Overlay */}
        <div
          ref={hotspotsContainerRef}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            zIndex: 6,
            pointerEvents: 'none',
            opacity: 0
          }}
        >
          {markersData.map(item => (
            <button
              key={item.id}
              ref={hotspotRefs[item.id]}
              onClick={(e) => {
                e.stopPropagation();
                setActiveHotspot(item.id);
                if (triggerZoomRef.current) {
                  triggerZoomRef.current(item.id);
                }
              }}
              style={{
                position: 'absolute',
                width: isMobile ? '32px' : '24px', // Bigger touch target on mobile
                height: isMobile ? '32px' : '24px',
                borderRadius: '50%',
                background: activeHotspot === item.id ? 'var(--color-aurora-gold)' : 'rgba(199, 169, 126, 0.4)',
                border: '2px solid var(--color-pearl-white)',
                boxShadow: '0 0 15px rgba(227, 196, 138, 0.8)',
                cursor: 'pointer',
                pointerEvents: 'auto', // Enable pointer events for hotspot taps
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                outline: 'none',
                transform: 'translate(-50%, -50%)',
              }}
              className="hud-hotspot"
              title={item.title}
            >
              <span
                style={{
                  position: 'absolute',
                  width: isMobile ? '48px' : '36px',
                  height: isMobile ? '48px' : '36px',
                  borderRadius: '50%',
                  border: '1px solid var(--color-aurora-gold)',
                  animation: 'hud-pulse 2s infinite',
                  pointerEvents: 'none'
                }}
              />
            </button>
          ))}
        </div>

        {/* Sophisticated Specs Sheet (Desktop Spec Matrix / Mobile Drawer) */}
        <div
          ref={hudRef}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            zIndex: 8,
            pointerEvents: 'none',
            opacity: 0
          }}
        >
          {/* Desktop Matrix Panel */}
          {!isMobile && (
            <div 
              className="glass-panel" 
              style={{ 
                position: 'absolute', 
                bottom: '8%', 
                right: '5%', 
                padding: '24px', 
                width: '380px', 
                border: '1px solid rgba(199, 169, 126, 0.3)',
                pointerEvents: 'auto',
                display: 'flex',
                flexDirection: 'column',
                gap: '16px'
              }}
            >
              <div>
                <span className="text-mono" style={{ display: 'block', marginBottom: '8px' }}>SPECIFICATIONS MATRIX</span>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '4px', fontSize: '11px', fontFamily: 'IBM Plex Mono, monospace' }}>
                  <span>COMPRIMENTO:</span>
                  <span style={{ color: 'var(--color-aurora-gold)' }}>24.0m (78ft)</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '4px', fontSize: '11px', fontFamily: 'IBM Plex Mono, monospace', marginTop: '6px' }}>
                  <span>VELOCIDADE MÁX:</span>
                  <span style={{ color: 'var(--color-aurora-gold)' }}>32 knots</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '4px', fontSize: '11px', fontFamily: 'IBM Plex Mono, monospace', marginTop: '6px' }}>
                  <span>PROPULSÃO:</span>
                  <span style={{ color: 'var(--color-aurora-gold)' }}>Twin Diesel-Elec</span>
                </div>
              </div>

              <div style={{ borderTop: '1px solid rgba(199,169,126,0.2)', paddingTop: '12px' }}>
                <span className="text-mono" style={{ display: 'block', marginBottom: '8px' }}>ANATOMIA DO BARCO</span>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  {markersData.map(item => (
                    <div 
                      key={item.id}
                      id={`hud-spec-target-${item.id}`}
                      className={`hud-spec-item ${activeHotspot === item.id ? 'active' : ''}`}
                      onMouseEnter={() => setActiveHotspot(item.id)}
                      onClick={() => {
                        if (triggerZoomRef.current) {
                          triggerZoomRef.current(item.id);
                        }
                      }}
                      style={{ fontSize: '12px' }}
                    >
                      <div style={{ fontWeight: '600', color: activeHotspot === item.id ? 'var(--color-aurora-gold)' : 'var(--color-pearl-white)' }}>
                        <span className="hud-spec-tag">{item.label}</span> {item.title}
                      </div>
                      {activeHotspot === item.id && (
                        <div style={{ color: 'var(--color-sandstone)', fontSize: '11px', marginTop: '4px', lineHeight: '1.4' }}>
                          {item.desc}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Mobile Bottom Specs Sheet Drawer */}
          {isMobile && activeHotspot && (
            <div 
              className="glass-panel" 
              style={{ 
                position: 'absolute', 
                bottom: '16px', 
                left: '16px', 
                right: '16px', 
                padding: '20px', 
                pointerEvents: 'auto',
                border: '1px solid rgba(199, 169, 126, 0.4)',
                boxShadow: '0 10px 30px rgba(0,0,0,0.6)'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <span className="text-mono" style={{ color: 'var(--color-aurora-gold)', fontSize: '11px' }}>
                  {markersData.find(m => m.id === activeHotspot)?.label}
                </span>
                <button 
                  onClick={() => setActiveHotspot(null)}
                  style={{ 
                    background: 'transparent', 
                    border: 'none', 
                    color: 'var(--color-sandstone)', 
                    fontSize: '20px', 
                    cursor: 'pointer',
                    width: '32px',
                    height: '32px'
                  }}
                >
                  ×
                </button>
              </div>
              <h4 style={{ fontSize: '18px', fontFamily: 'Playfair Display, serif', color: 'var(--color-pearl-white)', marginBottom: '8px' }}>
                {markersData.find(m => m.id === activeHotspot)?.title}
              </h4>
              <p style={{ fontSize: '13px', color: 'var(--color-sandstone)', lineHeight: '1.6', marginBottom: '14px' }}>
                {markersData.find(m => m.id === activeHotspot)?.desc}
              </p>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <button 
                  className="btn-yachtmax" 
                  onClick={() => {
                    const idx = markersData.findIndex(m => m.id === activeHotspot);
                    const nextIdx = (idx + 1) % markersData.length;
                    const nextId = markersData[nextIdx].id;
                    setActiveHotspot(nextId);
                    if (triggerZoomRef.current) {
                      triggerZoomRef.current(nextId);
                    }
                  }}
                  style={{ padding: '8px 16px', fontSize: '11px', minHeight: '44px' }}
                >
                  Próximo Detalhe →
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Bottom vignette shadow */}
        <div 
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            width: '100%',
            height: '30vh',
            background: 'linear-gradient(to top, #07111c, transparent)',
            zIndex: 6,
            pointerEvents: 'none'
          }}
        />
      </div>

      {/* =============================================================
          Absolute Text Panel Container (Ensures perfect crossfading)
          ============================================================= */}
      <div 
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100vh',
          zIndex: 7,
          pointerEvents: 'none'
        }}
      >
        {/* Panel 1: OKEAN & YACHTMAX Alliance */}
        <div 
          ref={text1Ref}
          style={{
            position: 'absolute',
            width: '100%',
            height: '100%',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            padding: '0 20px',
            textAlign: 'center',
            pointerEvents: 'none' // Always pass events through
          }}
        >
          <div ref={panel1Ref} className="glass-panel" style={{ padding: isMobile ? '30px 20px' : '60px', maxWidth: '850px', pointerEvents: 'auto' }}>
            <span className="text-mono" style={{ fontSize: isMobile ? '11px' : '13px' }}>YACHTMAX & OKEAN ALLIANCE</span>
            <h2 style={{ fontSize: isMobile ? '30px' : '56px', margin: '20px 0', lineHeight: '1.1', color: 'var(--color-pearl-white)' }}>
              A Força que Movimenta o <br />
              <span style={{ color: 'var(--color-champagne-metal)', fontStyle: 'italic' }}>Luxo Náutico Mundial</span>
            </h2>
            <p style={{ color: 'var(--color-sandstone)', fontSize: isMobile ? '13px' : '18px', lineHeight: '1.6', maxWidth: '680px', margin: '0 auto' }}>
              Ao unir a solidez industrial da <strong>OKEAN</strong> e a curadoria exclusiva da <strong>YACHTMAX</strong>, tornamos a marca <strong>Ferretti</strong> uma realidade consolidada no Brasil e no mundo.
            </p>
          </div>
        </div>

        {/* Panel 2: The Curated Experience & HUD Narrative */}
        <div 
          ref={text2Ref}
          style={{
            position: 'absolute',
            width: '100%',
            height: '100%',
            display: 'flex',
            flexDirection: isMobile ? 'column' : 'row',
            justifyContent: isMobile ? 'flex-start' : 'flex-start',
            alignItems: isMobile ? 'center' : 'center',
            padding: isMobile ? '40px 16px' : '0 5%',
            textAlign: isMobile ? 'center' : 'left',
            pointerEvents: 'none' // Always pass events through
          }}
        >
          <div 
            ref={panel2Ref}
            className="glass-panel" 
            style={{ 
              padding: isMobile ? '24px' : '48px', 
              maxWidth: isMobile ? '100%' : '460px', 
              pointerEvents: 'none', // Controlled dynamically by GSAP (starts at none)
              marginTop: isMobile ? '10px' : '0'
            }}
          >
            <span className="text-mono" style={{ fontSize: isMobile ? '11px' : '13px' }}>EXPERIENCE SYSTEM</span>
            <h3 style={{ fontSize: isMobile ? '26px' : '38px', margin: '16px 0', lineHeight: '1.2' }}>Curadoria &amp; Autoridade</h3>
            <p style={{ color: 'var(--color-sandstone)', fontSize: isMobile ? '13px' : '15px', lineHeight: '1.7', marginBottom: '24px' }}>
              Não vendemos apenas barcos. Entregamos a engenharia do tempo e da liberdade. Com acesso exclusivo ao inventário premium e suporte de engenharia naval de ponta.
            </p>
            <button 
              className="btn-yachtmax" 
              onClick={() => {
                trackCTAClick('catalog_explore');
              }}
              style={{ minHeight: isMobile ? '44px' : 'auto', padding: isMobile ? '8px 24px' : '16px 32px', fontSize: isMobile ? '12px' : '14px', pointerEvents: 'auto' }}
            >
              Explorar Catálogo
            </button>
          </div>
        </div>

        {/* Panel 3: Riva / Ferretti Badge & CTA */}
        <div 
          ref={text3Ref}
          style={{
            position: 'absolute',
            width: '100%',
            height: '100%',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            padding: '0 20px',
            textAlign: 'center',
            pointerEvents: 'none' // Always pass events through
          }}
        >
          <div ref={panel3Ref} className="glass-panel" style={{ padding: isMobile ? '30px 16px' : '60px', maxWidth: '800px', display: 'flex', flexDirection: 'column', alignItems: 'center', pointerEvents: 'none' }}>
            <div style={{ marginBottom: '20px' }}>
              <img 
                src="/yachtmax_official_1.png" 
                alt="Riva Exclusive" 
                style={{ height: isMobile ? '50px' : '80px', width: 'auto', filter: 'drop-shadow(0 5px 15px rgba(0,0,0,0.5))' }}
              />
            </div>
            
            <span className="text-mono" style={{ fontSize: isMobile ? '11px' : '13px' }}>POCKET LISTINGS & OFF-MARKET</span>
            <h2 style={{ fontSize: isMobile ? '28px' : '48px', margin: '16px 0', lineHeight: '1.2' }}>
              O Horizonte é Apenas o Começo
            </h2>
            <p style={{ color: 'var(--color-sandstone)', fontSize: isMobile ? '13px' : '16px', lineHeight: '1.7', marginBottom: '24px', maxWidth: '580px' }}>
              Conecte-se com nossos conselheiros de luxo através da plataforma integrada <strong>LNX-Core</strong> e agende seu Sea Trial privado no maior estaleiro do Brasil.
            </p>
            <div style={{ display: 'flex', gap: '12px', flexDirection: isMobile ? 'column' : 'row', width: isMobile ? '100%' : 'auto', justifyContent: 'center' }}>
              <button 
                className="btn-yachtmax" 
                onClick={() => {
                  trackCTAClick('broker_contact_click');
                  setLeadModalType('broker');
                  setShowLeadModal(true);
                }}
                style={{ background: 'var(--color-champagne-metal)', color: 'var(--color-midnight-ocean)', width: isMobile ? '100%' : 'auto', minHeight: isMobile ? '44px' : 'auto', pointerEvents: 'auto' }}
              >
                Falar com Broker
              </button>
              <button 
                className="btn-yachtmax" 
                onClick={() => {
                  trackCTAClick('cafe_reserve_click');
                  setLeadModalType('cafe');
                  setShowLeadModal(true);
                }}
                style={{ width: isMobile ? '100%' : 'auto', minHeight: isMobile ? '44px' : 'auto', pointerEvents: 'auto' }}
              >
                Agendar Café
              </button>
            </div>
          </div>
        </div>
      </div>

      </div>

      <LeadCaptureModal 
        isOpen={showLeadModal} 
        onClose={() => setShowLeadModal(false)} 
        type={leadModalType}
      />
    </>
  );
}
