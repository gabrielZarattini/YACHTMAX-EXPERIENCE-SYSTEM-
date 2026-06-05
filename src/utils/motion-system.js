/**
 * ==========================================================================
 * YACHTMAX EXPERIENCE SYSTEM™ — MOTION SYSTEM ENGINE
 * Coordinates GSAP, WebGL (Three.js), and Cinematic Canvas Video Scrubbing.
 * ==========================================================================
 */

import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import * as THREE from 'three';

gsap.registerPlugin(ScrollTrigger);

/**
 * Class representing the unified motion system.
 * Connects high-fidelity canvas video scroll with 3D WebGL scenes via GSAP.
 */
export class YachtmaxMotionSystem {
  /**
   * @param {Object} options
   * @param {HTMLCanvasElement} options.videoCanvas - Canvas element for video frame rendering.
   * @param {HTMLCanvasElement} options.webglCanvas - Canvas element for Three.js 3D rendering.
   * @param {string[]} options.frameUrls - Array of URLs for preloaded image frames.
   * @param {string} options.triggerElement - Selector or element that triggers the scroll animation.
   */
  constructor(options) {
    this.videoCanvas = options.videoCanvas;
    this.webglCanvas = options.webglCanvas;
    this.frameUrls = options.frameUrls;
    this.triggerElement = options.triggerElement;
    
    this.images = [];
    this.videoSequence = { frame: 0 };
    this.totalFrames = this.frameUrls.length;
    this.videoCtx = this.videoCanvas.getContext('2d');
    
    // WebGL properties
    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.model3D = null;
    
    this.init();
  }

  /**
   * Initializes the engine components.
   */
  async init() {
    this.setupResizeHandler();
    this.setupWebGL();
    
    try {
      await this.preloadImages();
      this.setupScrollAnimation();
      this.animateWebGL();
    } catch (error) {
      console.error('Failed to initialize Yachtmax Motion System:', error);
    }
  }

  /**
   * Preloads all image frames into memory to ensure 60fps stutter-free scrolling.
   */
  preloadImages() {
    return new Promise((resolve, reject) => {
      let loadedCount = 0;
      
      this.frameUrls.forEach((url, index) => {
        const img = new Image();
        img.src = url;
        img.onload = () => {
          this.images[index] = img;
          loadedCount++;
          if (loadedCount === this.totalFrames) {
            // Draw first frame immediately
            this.renderVideoFrame(0);
            resolve();
          }
        };
        img.onerror = () => {
          reject(new Error(`Failed to load frame: ${url}`));
        };
      });
    });
  }

  /**
   * Fits the image to the canvas maintaining aspect ratio (object-fit: cover behavior).
   * @param {number} frameIndex
   */
  renderVideoFrame(frameIndex) {
    const img = this.images[frameIndex];
    if (!img) return;

    const canvasWidth = this.videoCanvas.width;
    const canvasHeight = this.videoCanvas.height;
    
    const imageWidth = img.width;
    const imageHeight = img.height;
    
    const ratio = Math.max(canvasWidth / imageWidth, canvasHeight / imageHeight);
    
    const newWidth = imageWidth * ratio;
    const newHeight = imageHeight * ratio;
    
    const x = (canvasWidth - newWidth) / 2;
    const y = (canvasHeight - newHeight) / 2;
    
    this.videoCtx.clearRect(0, 0, canvasWidth, canvasHeight);
    this.videoCtx.drawImage(img, x, y, newWidth, newHeight);
  }

  /**
   * Sets up the Three.js WebGL context.
   */
  setupWebGL() {
    this.scene = new THREE.Scene();
    
    // Perspective camera
    this.camera = new THREE.PerspectiveCamera(
      45,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    this.camera.position.set(0, 0, 5);

    // Renderer
    this.renderer = new THREE.WebGLRenderer({
      canvas: this.webglCanvas,
      alpha: true, // Transparent to overlay above the video canvas
      antialias: true
    });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    // Basic luxury lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    this.scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xc7a97e, 1.5); // Champagne Gold tint
    directionalLight.position.set(5, 5, 5);
    this.scene.add(directionalLight);

    // Placeholder Luxury Mesh (e.g., representation of yacht hull or structural element)
    const geometry = new THREE.TorusKnotGeometry(1, 0.3, 100, 16);
    const material = new THREE.MeshStandardMaterial({
      color: 0xc7a97e, // Champagne Gold
      roughness: 0.1,
      metalness: 0.8
    });
    this.model3D = new THREE.Mesh(geometry, material);
    this.scene.add(this.model3D);
  }

  /**
   * Sets up the GSAP ScrollTrigger Timeline.
   * Entangles the video frame sequence scrubbing and 3D camera animations.
   */
  setupScrollAnimation() {
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: this.triggerElement,
        start: 'top top',
        end: 'bottom bottom',
        scrub: 1, // Smooth scrub delay (1s inertia)
        pin: true, // Pins the canvases in place during scroll
        anticipatePin: 1
      }
    });

    // 1. Scrub video sequence
    tl.to(this.videoSequence, {
      frame: this.totalFrames - 1,
      snap: 'frame',
      ease: 'none',
      onUpdate: () => {
        this.renderVideoFrame(Math.floor(this.videoSequence.frame));
      }
    }, 0);

    // 2. Animate 3D WebGL Camera position linked to scroll
    tl.to(this.camera.position, {
      z: 3,
      x: 1.5,
      ease: 'power2.inOut'
    }, 0);

    // 3. Rotate the 3D model
    tl.to(this.model3D.rotation, {
      y: Math.PI * 2,
      x: Math.PI / 2,
      ease: 'none'
    }, 0);
  }

  /**
   * Render loop for the WebGL scene.
   */
  animateWebGL = () => {
    requestAnimationFrame(this.animateWebGL);
    
    // Slow drift movement (idle water effect)
    if (this.model3D) {
      this.model3D.position.y = Math.sin(Date.now() * 0.001) * 0.05;
    }
    
    this.renderer.render(this.scene, this.camera);
  };

  /**
   * Handles resizing of both canvases to fit the viewport.
   */
  setupResizeHandler() {
    const handleResize = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      
      // Resize Video Canvas
      this.videoCanvas.width = w;
      this.videoCanvas.height = h;
      if (this.images[Math.floor(this.videoSequence.frame)]) {
        this.renderVideoFrame(Math.floor(this.videoSequence.frame));
      }
      
      // Resize WebGL Canvas
      if (this.camera && this.renderer) {
        this.camera.aspect = w / h;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(w, h);
      }
    };
    
    window.addEventListener('resize', handleResize);
    handleResize(); // Trigger immediately
  }
}
