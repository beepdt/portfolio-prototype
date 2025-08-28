"use client";

import "./style.css";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import { useRef } from "react";
import Lenis from "lenis";
import { noSSR } from "next/dynamic";
gsap.registerPlugin(useGSAP, SplitText, ScrollTrigger);

export default function TestComp() {
  const lenis = new Lenis();
  lenis.on("scroll", ScrollTrigger.update);
  gsap.ticker.add((time) => {
    lenis.raf(time * 1000);
  });
  gsap.ticker.lagSmoothing(0);

  const heroRef = useRef(null);
  const imgRef = useRef(null);

  useGSAP(
    () => {
      const herotextElements = gsap.utils.toArray(".hero-text");
      const heroheaderElements = gsap.utils.toArray(".hero-header");

      // SCALING SPEED CONFIGURATION
      // Adjust these values to control scaling speed:
      const INITIAL_SCALE = 0.25; // Starting scale (smaller = more dramatic effect)
      const SCALE_COMPLETION_POINT = 1; // At what scroll progress scaling completes (0.4 = 40% of scroll)
      const FINAL_SCALE = 1.0; // Final scale when scaling is complete

      // TEXT MOVEMENT CONFIGURATION
      const HEADER_MOVEMENT_START = 0.01; // When headers start moving (very early)

      // SCROLL DISTANCE CONFIGURATION
      // Reduce this multiplier for faster scaling with less scroll:
      const SCROLL_DISTANCE_MULTIPLIER = 1.2; // Lower = faster scaling (try 1.5-3.0)

      gsap.set(imgRef.current, {
        scale: INITIAL_SCALE,
        transformOrigin: "center center",
      });

      ScrollTrigger.create({
        trigger: heroRef.current,
        start: "top top",
        end: `+=${window.innerHeight * SCROLL_DISTANCE_MULTIPLIER}px`,
        pin: true,
        pinSpacing: true,
        scrub: true, // Reduced from 2 for more responsive feel
        onUpdate: (self) => {
          const progress = self.progress;

          // FASTER IMAGE SCALING - completes early in the scroll
          let scale;
          if (progress <= SCALE_COMPLETION_POINT) {
            // Scale from INITIAL_SCALE to FINAL_SCALE over first 40% of scroll
            const scaleProgress = progress / SCALE_COMPLETION_POINT;
            // Physics-based easing for more natural feel
            const easedProgress = 1 - Math.pow(1 - scaleProgress, 3); // Ease-out cubic
            scale =
              INITIAL_SCALE + (FINAL_SCALE - INITIAL_SCALE) * easedProgress;
          } else {
            // Scaling is complete, maintain final scale
            scale = FINAL_SCALE;
          }

          gsap.set(imgRef.current, { scale: scale });

          // HERO HEADERS - Start moving very early with subtle movement
          if (progress >= HEADER_MOVEMENT_START) {
            const headerProgress = Math.min(
              (progress - HEADER_MOVEMENT_START) / 0.3,
              1
            );
            const headerDistance = window.innerWidth * 0.08; // Subtle movement
            const easedHeaderProgress = headerProgress * headerProgress; // Ease-in

            //@ts-ignore
            gsap.set(heroheaderElements[0], {
              x: easedHeaderProgress * headerDistance,
            });
            //@ts-ignore
            gsap.set(heroheaderElements[1], {
              x: -easedHeaderProgress * headerDistance,
            });
          }

          // HERO TEXT - Start moving after image reaches 60% of its final scale
          const currentScale = scale / FINAL_SCALE; // Get current scale as percentage

          const heroTextWidth = document
            .querySelector(".hero-text")
            ?.getBoundingClientRect().width;
          const SCALE_THRESHOLD_FOR_TEXT = 0.6; // Start text movement at 60% scale

          if (currentScale >= SCALE_THRESHOLD_FOR_TEXT) {
            const textProgress =
              (currentScale - SCALE_THRESHOLD_FOR_TEXT) /
              (1 - SCALE_THRESHOLD_FOR_TEXT);
            const moveDistance = window.innerWidth * 0.6; // Increased for more dramatic effect
            // Physics-based easing for smooth acceleration
            const easedTextProgress = textProgress * textProgress; // Ease-in quadratic

            //@ts-ignore
            gsap.set(herotextElements[0], {
              x: -easedTextProgress * moveDistance,
            });
            //@ts-ignore
            gsap.set(herotextElements[1], {
              x: easedTextProgress * moveDistance,
            });
          }
        },
      });
    },
    { scope: heroRef }
  );

  return (
    <section ref={heroRef} className="hero-section">
      <div ref={imgRef} className="hero-img-container">
        <div className="img">
          <img src="/img3.png" alt="Hero-img" />
        </div>
      </div>
      <div className="hero-header-container">
        <h2 className="hero-header leading-none">creative.</h2>
        <h2 className="hero-header leading-none">developer.</h2>
      </div>
      <div className="hero-text-container">
        <p className="hero-text">An insanely</p>
        <p className="hero-text">good? (just kidding) </p>
      </div>
    </section>
  );
}

/* 
CUSTOMIZATION GUIDE:

1. TO MAKE SCALING FASTER:
   - Decrease SCROLL_DISTANCE_MULTIPLIER (try 1.5-2.0)
   - Decrease SCALE_COMPLETION_POINT (try 0.2-0.3)

2. TO MAKE SCALING SLOWER:
   - Increase SCROLL_DISTANCE_MULTIPLIER (try 3.0-4.0)
   - Increase SCALE_COMPLETION_POINT (try 0.5-0.7)

3. TO ADJUST TEXT MOVEMENT TIMING:
   - Change TEXT_MOVEMENT_START (0.6 = starts at 60% scale)
   - Change HEADER_MOVEMENT_START for header timing

4. TO ADJUST MOVEMENT DISTANCES:
   - Modify moveDistance multiplier (0.6 = 60% of screen width)
   - Modify headerDistance multiplier (0.08 = 8% of screen width)

5. FOR DIFFERENT EASING EFFECTS:
   - Cubic ease-out: 1 - Math.pow(1 - progress, 3)
   - Cubic ease-in: progress * progress * progress
   - Quadratic: progress * progress
   - Elastic: Math.sin(progress * Math.PI)
*/
