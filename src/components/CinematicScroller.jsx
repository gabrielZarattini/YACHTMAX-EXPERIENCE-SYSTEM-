import React, { useEffect, useRef } from 'react';
import { YachtmaxMotionSystem } from '../utils/motion-system';

/**
 * CinematicScroller Component
 * Implements a high-fidelity scroll container showing a video scrubbing canvas
 * layered with a Three.js 3D WebGL scene, topped with editorial content.
 */
export default function CinematicScroller() {
  const containerRef = useRef(null);
  const videoCanvasRef = useRef(null);
  const webglCanvasRef = useRef(null);

  useEffect(() => {
    // Generate 60 placeholder frame URLs for demonstration.
    // In production, these should be high-quality WebP images pre-rendered with ffmpeg.
    // Command: ffmpeg -i golden_hour_yacht.mp4 -vf scale=1920:-1 -q:v 2 frame_%03d.webp
    const frameUrls = Array.from({ length: 60 }, (_, i) => {
      const frameNum = String(i + 1).padStart(3, '0');
      // For demo purposes, we point to placeholder gradient patterns
      return `https://placehold.co/1920x1080/07111c/c7a97e?text=Golden+Hour+Frame+${frameNum}`;
    });

    if (videoCanvasRef.current && webglCanvasRef.current && containerRef.current) {
      const motionEngine = new YachtmaxMotionSystem({
        videoCanvas: videoCanvasRef.current,
        webglCanvas: webglCanvasRef.current,
        frameUrls: frameUrls,
        triggerElement: containerRef.current
      });

      // Cleanup logic on unmount
      return () => {
        window.removeEventListener('resize', motionEngine.setupResizeHandler);
      };
    }
  }, []);

  return (
    <div 
      ref={containerRef} 
      style={{ position: 'relative', width: '100%', minHeight: '300vh' }}
    >
      {/* Visual Canvas Layers Container */}
      <div 
        style={{
          position: 'sticky',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          overflow: 'hidden',
          zIndex: 1
        }}
      >
        {/* Layer 1: Video Frame Scrubbing Canvas */}
        <canvas
          ref={videoCanvasRef}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            zIndex: 1
          }}
        />

        {/* Layer 2: WebGL 3D Overlay Canvas */}
        <canvas
          ref={webglCanvasRef}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            zIndex: 2,
            pointerEvents: 'none' // Allows clicking elements through it
          }}
        />
        
        {/* Silent luxury gradient shadow */}
        <div 
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            width: '100%',
            height: '30vh',
            background: 'linear-gradient(to top, #07111c, transparent)',
            zIndex: 3,
            pointerEvents: 'none'
          }}
        />
      </div>

      {/* Layer 3: Editorial Content Overlay */}
      <div 
        style={{
          position: 'relative',
          zIndex: 4,
          marginTop: '-100vh'
        }}
      >
        {/* Panel 1: Headline */}
        <section 
          style={{
            height: '100vh',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            padding: '0 20px',
            textAlign: 'center'
          }}
        >
          <div className="glass-panel" style={{ padding: '60px', maxWidth: '800px' }}>
            <span className="text-mono">YACHTMAX EXPERIENCE SYSTEM</span>
            <h2 style={{ fontSize: '56px', margin: '20px 0', color: 'var(--color-pearl-white)' }}>
              Não é o barco. <br />
              <span style={{ color: 'var(--color-champagne-metal)', fontStyle: 'italic' }}>É a jornada.</span>
            </h2>
            <p style={{ color: 'var(--color-sandstone)', fontSize: '18px', lineHeight: '1.6' }}>
              Experimente o oceano em seu nível mais extraordinário através de tecnologias imersivas integradas.
            </p>
          </div>
        </section>

        {/* Panel 2: WebGL 3D Feature */}
        <section 
          style={{
            height: '100vh',
            display: 'flex',
            justifyContent: 'flex-start',
            alignItems: 'center',
            padding: '0 8%'
          }}
        >
          <div className="glass-panel" style={{ padding: '48px', maxWidth: '500px' }}>
            <span className="text-mono">INTERACTIVE 3D</span>
            <h3 style={{ fontSize: '36px', margin: '16px 0' }}>Exploração de Convés</h3>
            <p style={{ color: 'var(--color-sandstone)', fontSize: '15px', lineHeight: '1.6', marginBottom: '24px' }}>
              Navegue pelos detalhes do iate em 3D interativo sem sair do seu dispositivo. Desenvolvido com dados CAD fornecidos pela infraestrutura OKEAN.
            </p>
            <button className="btn-yachtmax">Abrir Tour 3D</button>
          </div>
        </section>

        {/* Panel 3: Call to Action */}
        <section 
          style={{
            height: '100vh',
            display: 'flex',
            justifyContent: 'flex-end',
            alignItems: 'center',
            padding: '0 8%'
          }}
        >
          <div className="glass-panel" style={{ padding: '48px', maxWidth: '500px' }}>
            <span className="text-mono">LNX-CORE INTEGRATION</span>
            <h3 style={{ fontSize: '36px', margin: '16px 0' }}>Atendimento Singular</h3>
            <p style={{ color: 'var(--color-sandstone)', fontSize: '15px', lineHeight: '1.6', marginBottom: '24px' }}>
              Entre em contato direto com nossos conselheiros de luxo e agende sua visita privada na marina.
            </p>
            <button className="btn-yachtmax">Agendar Café</button>
          </div>
        </section>
      </div>
    </div>
  );
}
