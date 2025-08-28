"use client";

import "./style.css";
import { ProjectThumbNails } from "@/utils/projects";
import { useRouter } from "next/navigation";
import { useEffect, useLayoutEffect, useRef } from "react";

const config = {
  SCROLL_SPEED: 1.75,
  LERP_FACTOR: 0.05,
  MAX_VELOCITY: 150,
};

const totalSlides = ProjectThumbNails.length;

const state = {
  currentY: 0,
  targetY: 0,
  sliderHeight: 390,
  slides: [],
  isDragging: false,
  startY: 0,
  lastY: 0,
  lastMouseY: 0,
  lastScrollTime: Date.now(),
  isMoving: false,
  velocity: 0,
  lastCurrentY: 0,
  dragDistance: 0,
  hasActuallyDragged: false,
  isMobile: false,
  animationId: null, // Track animation frame ID
  isInitialized: false, // Track initialization state
};

const checkMobile = () => {
  state.isMobile = window.innerWidth < 1000;
};

export default function ProjectCarousel() {
  const router = useRouter();
  const trackRef = useRef<HTMLDivElement>(null);
  const sliderRef = useRef<HTMLDivElement>(null);

  const createSlideElement = (index: any) => {
    const slide = document.createElement("div");
    slide.className = "vertical-slide";

    if (state.isMobile) {
      slide.style.height = "375px";
    }

    const imageContainer = document.createElement("div");
    imageContainer.className = "vertical-slide-image";
    imageContainer.style.aspectRatio = "4/5";
    imageContainer.style.overflow = "hidden";

    const img = document.createElement("img");
    const dataIndex = index % totalSlides;
    img.src = ProjectThumbNails[dataIndex].image;
    img.alt = ProjectThumbNails[dataIndex].name;

    const overlay = document.createElement("div");
    overlay.className = "vertical-slide-overlay";

    const title = document.createElement("h3");
    title.className = "project-title";
    title.textContent = ProjectThumbNails[dataIndex].name;

    const year = document.createElement("p");
    year.textContent = ProjectThumbNails[dataIndex].year.toString();

    slide.addEventListener("click", (e) => {
      e.preventDefault();

      if (state.dragDistance < 10 && !state.hasActuallyDragged) {
        router.push(`/projects/${ProjectThumbNails[dataIndex].id}`);
      }
    });

    overlay.appendChild(title);
    overlay.appendChild(year);
    imageContainer.appendChild(img);
    slide.appendChild(imageContainer);
    slide.appendChild(overlay);

    return slide;
  };

  const initSlides = () => {
    state.slides = [];
    checkMobile();

    if (!trackRef.current) return;

    trackRef.current.innerHTML = "";

    state.sliderHeight = state.isMobile ? 391 : 528;

    const copies = 12;
    const totalSlideCount = totalSlides * copies;

    for (let i = 0; i < totalSlideCount; i++) {
      const slide = createSlideElement(i);
      trackRef.current.appendChild(slide);
      //@ts-ignore
      state.slides.push(slide);
    }

    const startOffset = -(totalSlideCount * state.sliderHeight * 2);
    state.currentY = startOffset;
    state.targetY = startOffset;
    state.isInitialized = true;
  };

  const updateSlidePos = () => {
    if (!trackRef.current || !state.isInitialized) return;

    const sequenceHeight = state.sliderHeight * totalSlides;

    if (state.currentY > -sequenceHeight * 2) {
      state.currentY -= sequenceHeight;
      state.targetY -= sequenceHeight;
    } else if (state.currentY < -sequenceHeight * 4) {
      state.currentY += sequenceHeight;
      state.targetY += sequenceHeight;
    }

    trackRef.current.style.transform = `translate3d(0, ${state.currentY}px, 0)`;
  };

  const updateParallax = () => {
    if (!state.isInitialized) return;

    const viewportCenter = window.innerHeight / 2;

    state.slides.forEach((slide: HTMLElement) => {
      const img = slide.querySelector("img");
      if (!img) return;

      const slideRect = slide.getBoundingClientRect();

      if (slideRect.bottom < -500 || slideRect.top > window.innerHeight + 500) {
        return;
      }

      const slideCenter = slideRect.top + slideRect.height / 2;
      const distanceFromCenter = slideCenter - viewportCenter;
      const parallaxOffset = distanceFromCenter * -0.25;

      img.style.transform = `translateY(${parallaxOffset}px) scale(1.2)`;
    });
  };

  const updateMovingState = () => {
    if (!state.isInitialized) return;

    state.velocity = Math.abs(state.currentY - state.lastCurrentY);
    state.lastCurrentY = state.currentY;

    const isSlowEnough = state.velocity < 0.1;
    const hasBeenStillLongENough = Date.now() - state.lastScrollTime > 200;

    state.isMoving =
      state.hasActuallyDragged || !isSlowEnough || !hasBeenStillLongENough;

    document.documentElement.style.setProperty(
      "--slider-moving",
      state.isMoving ? "1" : "0"
    );
  };

  const animate = () => {
    if (!state.isInitialized) {
      //@ts-expect-error
      state.animationId = requestAnimationFrame(animate);
      return;
    }

    state.currentY += (state.targetY - state.currentY) * config.LERP_FACTOR;

    updateMovingState();
    updateSlidePos();
    updateParallax();
    //@ts-expect-error
    state.animationId = requestAnimationFrame(animate);
  };

  const startAnimation = () => {
    // Cancel any existing animation
    if (state.animationId) {
      cancelAnimationFrame(state.animationId);
    }
    animate();
  };

  const handleWheel = (e: WheelEvent) => {
    if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
      e.preventDefault();
      state.lastScrollTime = Date.now();

      const scrollDelta = e.deltaY * config.SCROLL_SPEED;

      state.targetY -= Math.max(
        Math.min(scrollDelta, config.MAX_VELOCITY),
        -config.MAX_VELOCITY
      );
    }
  };

  const handleTouchStart = (e: TouchEvent) => {
    state.isDragging = true;
    state.startY = e.touches[0].clientY;
    state.lastY = state.targetY;
    state.dragDistance = 0;
    state.hasActuallyDragged = false;
    state.lastScrollTime = Date.now();
  };

  const handleTouchMove = (e: TouchEvent) => {
    if (!state.isDragging) return;

    const deltaY = (e.touches[0].clientY - state.startY) * 1.5;
    state.targetY = state.lastY + deltaY;
    state.dragDistance = Math.abs(deltaY);

    if (state.dragDistance > 5) {
      state.hasActuallyDragged = true;
    }

    state.lastScrollTime = Date.now();
  };

  const handleTouchEnd = (e: TouchEvent) => {
    state.isDragging = false;
    setTimeout(() => {
      state.hasActuallyDragged = false;
    }, 100);
  };

  const handleMouseDown = (e: MouseEvent) => {
    e.preventDefault();
    state.isDragging = true;
    state.startY = e.clientY;
    state.lastMouseY = e.clientY;
    state.lastY = state.targetY;
    state.dragDistance = 0;
    state.hasActuallyDragged = false;
    state.lastScrollTime = Date.now();
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!state.isDragging) return;

    e.preventDefault();

    const deltaY = (e.clientY - state.lastMouseY) * 2;
    state.targetY += deltaY;
    state.lastMouseY = e.clientY;
    state.dragDistance += Math.abs(deltaY);

    if (state.dragDistance > 5) {
      state.hasActuallyDragged = true;
    }

    state.lastScrollTime = Date.now();
  };

  const handleMouseUp = () => {
    state.isDragging = false;
    setTimeout(() => {
      state.hasActuallyDragged = false;
    }, 100);
  };

  const handleResize = () => {
    initSlides();
  };

  const initEventListener = () => {
    if (!sliderRef.current) return;

    // Remove existing listeners to prevent duplicates
    sliderRef.current.removeEventListener("wheel", handleWheel);
    sliderRef.current.removeEventListener("touchstart", handleTouchStart);
    sliderRef.current.removeEventListener("touchmove", handleTouchMove);
    sliderRef.current.removeEventListener("touchend", handleTouchEnd);
    sliderRef.current.removeEventListener("mousedown", handleMouseDown);
    sliderRef.current.removeEventListener("mouseleave", handleMouseUp);

    document.removeEventListener("mousemove", handleMouseMove);
    document.removeEventListener("mouseup", handleMouseUp);
    window.removeEventListener("resize", handleResize);

    // Add fresh listeners
    sliderRef.current.addEventListener("wheel", handleWheel, {
      passive: false,
    });
    sliderRef.current.addEventListener("touchstart", handleTouchStart);
    sliderRef.current.addEventListener("touchmove", handleTouchMove);
    sliderRef.current.addEventListener("touchend", handleTouchEnd);
    sliderRef.current.addEventListener("mousedown", handleMouseDown);
    sliderRef.current.addEventListener("mouseleave", handleMouseUp);
    sliderRef.current.addEventListener("dragstart", (e) => e.preventDefault());

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
    window.addEventListener("resize", handleResize);
  };

  const cleanup = () => {
    if (state.animationId) {
      cancelAnimationFrame(state.animationId);
      state.animationId = null;
    }

    if (sliderRef.current) {
      sliderRef.current.removeEventListener("wheel", handleWheel);
      sliderRef.current.removeEventListener("touchstart", handleTouchStart);
      sliderRef.current.removeEventListener("touchmove", handleTouchMove);
      sliderRef.current.removeEventListener("touchend", handleTouchEnd);
      sliderRef.current.removeEventListener("mousedown", handleMouseDown);
      sliderRef.current.removeEventListener("mouseleave", handleMouseUp);
    }

    document.removeEventListener("mousemove", handleMouseMove);
    document.removeEventListener("mouseup", handleMouseUp);
    window.removeEventListener("resize", handleResize);

    state.isInitialized = false;
  };

  useLayoutEffect(() => {
    // Only start animation after slides are initialized
    if (state.isInitialized) {
      startAnimation();
    }
  }, [state.isInitialized]);

  useEffect(() => {
    initSlides();
    initEventListener();

    // Start animation after initialization
    requestAnimationFrame(() => {
      startAnimation();
    });

    // Cleanup on unmount
    return cleanup;
  }, []);

  return (
    <div ref={sliderRef} className="vertical-carousel gap-12">
      
      <div ref={trackRef} className="vertical-track gap-4"></div>
    </div>
  );
}