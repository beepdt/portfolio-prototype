import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { useRef } from "react";
import Lenis from "lenis";
import "./style.css";

gsap.registerPlugin(ScrollTrigger, useGSAP);

export default function ImageScale() {
  const lenis = new Lenis();
  lenis.on("scroll", ScrollTrigger.update);
  gsap.ticker.add((time) => {
    lenis.raf(time * 1000);
  });
  gsap.ticker.lagSmoothing(0);

  const introRef = useRef(null);
  const videoContainerRef = useRef(null);
  const videoTitleElements = useRef(null);

  const breakpoints = [
    { maxWidth: 1024, translateY: -135, movMultiplier: 450 },
    { maxWidth: 1100, translateY: -130, movMultiplier: 500 },
    { maxWidth: 1200, translateY: -125, movMultiplier: 550 },
    { maxWidth: 1300, translateY: -120, movMultiplier: 600 },
    { maxWidth: 1400, translateY: -115, movMultiplier: 650 },
  ];

  const getInitialValues = () => {
    const width = window.innerWidth;

    for (const bp of breakpoints) {
      if (width <= bp.maxWidth) {
        return {
          translateY: bp.translateY,
          movementMultiplier: bp.movMultiplier,
        };
      }
    }
    return {
      translateY: -95,
      movementMultiplier: 650,
    };
  };

  const initialValues = getInitialValues();

  const animationState = {
    scrollProgress: 0,
    initialTranslateY: initialValues.translateY,
    currentTranslateY: initialValues.translateY,
    movementMultiplier: initialValues.movementMultiplier,
    scale: 0.25,
    fontSize: 80,
    gap: 2,
    currentMouseX: 0,
    targetMouseX: 0,
  };

  window.addEventListener("resize", () => {
    const newValues = getInitialValues();
    animationState.initialTranslateY = newValues.translateY;
    animationState.movementMultiplier = newValues.movementMultiplier;

    if (animationState.scrollProgress === 0) {
      animationState.currentTranslateY = newValues.translateY;
    }
  });

  useGSAP(() => {
    gsap.timeline({
      scrollTrigger: {
        trigger: introRef.current,
        start: "top bottom",
        end: "top 10%",
        scrub: true,
        onUpdate: (self) => {
          (animationState.scrollProgress = self.progress),
            (animationState.currentTranslateY = gsap.utils.interpolate(
              animationState.initialTranslateY,
              0,
              animationState.scrollProgress
            ));

          animationState.scale = gsap.utils.interpolate(
            0.25,
            1,
            animationState.scrollProgress
          );

          animationState.gap = gsap.utils.interpolate(
            2,
            1,
            animationState.scrollProgress
          );

          if (animationState.scrollProgress <= 0.4) {
            const firstPartProgress = animationState.scrollProgress / 0.4;
            animationState.fontSize = gsap.utils.interpolate(
              80,
              40,
              firstPartProgress
            );
          } else {
            const secondpartProgress =
              (animationState.scrollProgress - 0.4) / 0.6;
            animationState.fontSize = gsap.utils.interpolate(
              40,
              20,
              secondpartProgress
            );
          }
        },
      },
    });

    document.addEventListener("mousemove", (e) => {
      animationState.targetMouseX = (e.clientX / window.innerWidth - 0.5) * 2;
    });

    const animate = () => {
      const {
        scale,
        targetMouseX,
        currentMouseX,
        currentTranslateY,
        fontSize,
        gap,
        movementMultiplier,
      } = animationState;

      const scaleMovementMultiplier = (1 - scale) * movementMultiplier;
      const maxHorizontalMovement =
        scale < 0.95 ? targetMouseX * scaleMovementMultiplier : 0;
      animationState.currentMouseX = gsap.utils.interpolate(
        currentMouseX,
        maxHorizontalMovement,
        0.05
      );
      //@ts-ignore
      videoContainerRef.current.style.transform = `translateY(${currentTranslateY}%) translateX(${animationState.currentMouseX}px) scale(${scale})`;

      //@ts-ignore
      videoContainerRef.current.gap = `${gap}em`;

      //@ts-ignore
      if (videoTitleElements.current) {
        videoTitleElements.current.forEach((element) => {
          if (element) {
            element.style.fontSize = `${fontSize}px`;
          }
        });
      }

      requestAnimationFrame(animate);
    };
    animate();
  });

  return (
    <>
      <section className="page-hero">
        <div className="hero-copy">
          <h1 className="leading-none text-start">creative</h1>
          <h1 className="leading-none text-end">develOper</h1>
        </div>

        <div className="hero-footer">
          <p>(SCROLL DOWN)</p>
          <p>magic's on the way</p>
        </div>
      </section>
      <section ref={introRef} className="video-intro">
        <div ref={videoContainerRef} className="video-container-desktop">
          <div className="video-preview">
            <div className="video-wrapper">
              <iframe
                src="https://www.youtube.com/embed/hirHe0u-a8k?si=tje4x8A_ZQXFWe-O&autoplay=1&mute=1&loop=1"
                title="YouTube video player"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                referrerPolicy="strict-origin-when-cross-origin"
                allowFullScreen
              ></iframe>
            </div>
          </div>
          <div  className="video-title">
            <p >Show reel</p>
            <p>2025</p>
          </div>
        </div>
        <div className="video-container-mobile">
          <div className="video-preview">
            <div className="video-wrapper">
              <iframe
                src="https://www.youtube.com/embed/hirHe0u-a8k?si=tje4x8A_ZQXFWe-O&autoplay=1&mute=1&loop=1"
                title="YouTube video player"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                referrerPolicy="strict-origin-when-cross-origin"
              ></iframe>
            </div>
          </div>
          <div className="video-title">
            <p>Show reel</p>
            <p>2025</p>
          </div>
        </div>
      </section>
      <section className="h-screen border">
        <div>Footer</div>
      </section>
    </>
  );
}
