import React from "react";
import {
  AbsoluteFill,
  interpolate,
  Sequence,
  spring,
  useCurrentFrame,
  useVideoConfig,
  Img,
  staticFile
} from "remotion";

export const YachtmaxPromo: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames, fps } = useVideoConfig();

  // Animation values for transition 1 -> 2 (around frame 90)
  const firstSlideOpacity = interpolate(
    frame,
    [80, 95],
    [1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  // Animation values for transition 2 -> 3 (around frame 180)
  const secondSlideOpacity = interpolate(
    frame,
    [170, 185],
    [1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  // Slow zoom (drift) animations for background images
  const zoomFactor1 = interpolate(frame, [0, 90], [1.0, 1.05], { extrapolateRight: "clamp" });
  const zoomFactor2 = interpolate(frame, [90, 180], [1.0, 1.05], { extrapolateRight: "clamp" });
  const zoomFactor3 = interpolate(frame, [180, 300], [1.0, 1.08], { extrapolateRight: "clamp" });

  // Elegant text springs
  const textSpring1 = spring({
    frame: frame - 15,
    fps,
    config: { damping: 12, stiffness: 100 }
  });
  
  const textSpring2 = spring({
    frame: frame - 105,
    fps,
    config: { damping: 12, stiffness: 100 }
  });

  const textSpring3 = spring({
    frame: frame - 195,
    fps,
    config: { damping: 12, stiffness: 100 }
  });

  const textY1 = interpolate(textSpring1, [0, 1], [40, 0]);
  const textY2 = interpolate(textSpring2, [0, 1], [40, 0]);
  const textY3 = interpolate(textSpring3, [0, 1], [40, 0]);

  return (
    <AbsoluteFill style={{ backgroundColor: "#07111C", color: "#FAF8F4", fontFamily: "Playfair Display, Georgia, serif" }}>
      
      {/* ==========================================
          SLIDE 1: OKEAN & YACHTMAX INTRODUCTION
          ========================================== */}
      <Sequence from={0} durationInFrames={90}>
        <AbsoluteFill style={{ opacity: firstSlideOpacity }}>
          {/* Background image: OKEAN Boat Show */}
          <AbsoluteFill style={{ transform: `scale(${zoomFactor1})` }}>
            <Img 
              src={staticFile("yachtmax_official_3.png")} 
              style={{ width: "100%", height: "100%", objectFit: "cover", filter: "brightness(0.35) contrast(1.1)" }} 
            />
          </AbsoluteFill>
          {/* Text content */}
          <AbsoluteFill style={{ display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", padding: "0 100px", textAlign: "center" }}>
            <span style={{ fontSize: "20px", letterSpacing: "0.2em", textTransform: "uppercase", color: "#C7A97E", marginBottom: "30px", transform: `translateY(${textY1}px)`, opacity: textSpring1 }}>
              OKEAN Estaleiro apresenta
            </span>
            <h1 style={{ fontSize: "80px", fontWeight: "300", letterSpacing: "-0.01em", transform: `translateY(${textY1}px)`, opacity: textSpring1 }}>
              Yachtmax Experience System™
            </h1>
            <div style={{ width: "100px", height: "1px", backgroundColor: "#C7A97E", margin: "40px 0", transform: `scaleX(${textSpring1})` }} />
            <p style={{ fontFamily: "Inter, sans-serif", fontSize: "20px", fontWeight: "300", color: "#D8CCB8", letterSpacing: "0.05em", transform: `translateY(${textY1}px)`, opacity: textSpring1 }}>
              O mar em seu nível mais extraordinário.
            </p>
          </AbsoluteFill>
        </AbsoluteFill>
      </Sequence>

      {/* ==========================================
          SLIDE 2: DESIGN MANIFESTO & EXPERIENCE
          ========================================== */}
      <Sequence from={90} durationInFrames={90}>
        <AbsoluteFill style={{ opacity: secondSlideOpacity }}>
          {/* Background image: Yachtmax Site Call */}
          <AbsoluteFill style={{ transform: `scale(${zoomFactor2})` }}>
            <Img 
              src={staticFile("yachtmax_official_2.png")} 
              style={{ width: "100%", height: "100%", objectFit: "cover", filter: "brightness(0.3) contrast(1.1)" }} 
            />
          </AbsoluteFill>
          <AbsoluteFill style={{ display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "flex-start", padding: "0 10%", textAlign: "left" }}>
            <span style={{ fontSize: "20px", letterSpacing: "0.2em", textTransform: "uppercase", color: "#C7A97E", marginBottom: "30px", transform: `translateY(${textY2}px)`, opacity: textSpring2 }}>
              Design System vNext
            </span>
            <h2 style={{ fontSize: "72px", fontWeight: "300", lineHeight: "1.1", marginBottom: "30px", transform: `translateY(${textY2}px)`, opacity: textSpring2 }}>
              Não é o barco.<br />
              <span style={{ fontStyle: "italic", color: "#C7A97E" }}>É a jornada.</span>
            </h2>
            <p style={{ fontFamily: "Inter, sans-serif", fontSize: "20px", fontWeight: "300", color: "#D8CCB8", maxWidth: "600px", lineHeight: "1.6", transform: `translateY(${textY2}px)`, opacity: textSpring2 }}>
              Interações tridimensionais WebGL e vídeos fotorrealistas desenhados para conectar você à sua próxima conquista.
            </p>
          </AbsoluteFill>
        </AbsoluteFill>
      </Sequence>

      {/* ==========================================
          SLIDE 3: RIVA BADGE & CTA
          ========================================== */}
      <Sequence from={180} durationInFrames={120}>
        <AbsoluteFill>
          {/* Background: Subtle gradient overlay */}
          <AbsoluteFill style={{ background: "radial-gradient(circle, #0d2236 0%, #07111c 100%)", transform: `scale(${zoomFactor3})` }} />
          
          <AbsoluteFill style={{ display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", padding: "0 100px", textAlign: "center" }}>
            {/* RIVA / Yachtmax Official Badge */}
            <div style={{ marginBottom: "40px", transform: `scale(${textSpring3})`, opacity: textSpring3 }}>
              <Img 
                src={staticFile("yachtmax_official_1.png")} 
                style={{ height: "120px", width: "auto", objectFit: "contain", filter: "drop-shadow(0px 10px 20px rgba(0,0,0,0.5))" }} 
              />
            </div>
            
            <h2 style={{ fontSize: "64px", fontWeight: "300", letterSpacing: "-0.01em", marginBottom: "30px", transform: `translateY(${textY3}px)`, opacity: textSpring3 }}>
              O horizonte é apenas o começo.
            </h2>
            
            <p style={{ fontFamily: "Inter, sans-serif", fontSize: "18px", color: "#C7A97E", letterSpacing: "0.2em", textTransform: "uppercase", transform: `translateY(${textY3}px)`, opacity: textSpring3 }}>
              contato@yachtmax.com.br | (11) 2478-3002
            </p>
          </AbsoluteFill>
        </AbsoluteFill>
      </Sequence>

    </AbsoluteFill>
  );
};
