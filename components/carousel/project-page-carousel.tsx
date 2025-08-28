"use client";

import "./styles.css";
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
  currentX: 0,
  targetX: 0,
  sliderWidth: 390,
  slides: [],
  isDragging: false,
  startX: 0,
  lastX: 0,
  lastMouseX: 0,
  lastScrollTime: Date.now(),
  isMoving: false,
  velocity: 0,
  lastCurrentX: 0,
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
    slide.className = "slide";

    if (state.isMobile) {
      slide.style.width = "300px";
    }

    const imageContainer = document.createElement("div");
    imageContainer.className = "slide-image";
    imageContainer.style.aspectRatio = "4/5";
    imageContainer.style.overflow = "hidden";

    const img = document.createElement("img");
    const dataIndex = index % totalSlides;
    img.src = ProjectThumbNails[dataIndex].image;
    img.alt = ProjectThumbNails[dataIndex].name;

    const overlay = document.createElement("div");
    overlay.className = "slide-overlay";

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

    state.sliderWidth = state.isMobile ? 316 : 528;

    const copies = 12;
    const totalSlideCount = totalSlides * copies;

    for (let i = 0; i < totalSlideCount; i++) {
      const slide = createSlideElement(i);
      trackRef.current.appendChild(slide);
      //@ts-ignore
      state.slides.push(slide);
    }

    const startOffset = -(totalSlideCount * state.sliderWidth * 2);
    state.currentX = startOffset;
    state.targetX = startOffset;
    state.isInitialized = true;
  };

  const updateSlidePos = () => {
    if (!trackRef.current || !state.isInitialized) return;

    const sequenceWidth = state.sliderWidth * totalSlides;

    if (state.currentX > -sequenceWidth * 2) {
      state.currentX -= sequenceWidth;
      state.targetX -= sequenceWidth;
    } else if (state.currentX < -sequenceWidth * 4) {
      state.currentX += sequenceWidth;
      state.targetX += sequenceWidth;
    }

    trackRef.current.style.transform = `translate3d(${state.currentX}px, 0, 0)`;
  };

  const updateParallax = () => {
    if (!state.isInitialized) return;

    const viewportCenter = window.innerWidth / 2;

    state.slides.forEach((slide: HTMLElement) => {
      const img = slide.querySelector("img");
      if (!img) return;

      const slideRect = slide.getBoundingClientRect();

      if (slideRect.right < -500 || slideRect.left > window.innerWidth + 500) {
        return;
      }

      const slideCenter = slideRect.left + slideRect.width / 2;
      const distanceFromCenter = slideCenter - viewportCenter;
      const parallaxOffset = distanceFromCenter * -0.25;

      img.style.transform = `translateX(${parallaxOffset}px) scale(1.2)`;
    });
  };

  const updateMovingState = () => {
    if (!state.isInitialized) return;

    state.velocity = Math.abs(state.currentX - state.lastCurrentX);
    state.lastCurrentX = state.currentX;

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

    state.currentX += (state.targetX - state.currentX) * config.LERP_FACTOR;

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
    if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) {
      return;
    }

    e.preventDefault();
    state.lastScrollTime = Date.now();

    const scrollDelta = e.deltaY * config.SCROLL_SPEED;

    state.targetX -= Math.max(
      Math.min(scrollDelta, config.MAX_VELOCITY),
      -config.MAX_VELOCITY
    );
  };

  const handleTouchStart = (e: TouchEvent) => {
    state.isDragging = true;
    state.startX = e.touches[0].clientX;
    state.lastX = state.targetX;
    state.dragDistance = 0;
    state.hasActuallyDragged = false;
    state.lastScrollTime = Date.now();
  };

  const handleTouchMove = (e: TouchEvent) => {
    if (!state.isDragging) return;

    const deltaX = (e.touches[0].clientX - state.startX) * 1.5;
    state.targetX = state.lastX + deltaX;
    state.dragDistance = Math.abs(deltaX);

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
    state.startX = e.clientX;
    state.lastMouseX = e.clientX;
    state.lastX = state.targetX;
    state.dragDistance = 0;
    state.hasActuallyDragged = false;
    state.lastScrollTime = Date.now();
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!state.isDragging) return;

    e.preventDefault();

    const deltaX = (e.clientX - state.lastMouseX) * 2;
    state.targetX += deltaX;
    state.lastMouseX = e.clientX;
    state.dragDistance += Math.abs(deltaX);

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
    <div ref={sliderRef} className="slider gap-12">
      <div className="project-carousel-info">
        <h1 className="text-6xl">wOrks</h1>
        <p className="tracking-wide text-sm">
          A curated collection of projects that reflect my journey as a
          developer. Each piece highlights a blend of design, functionality, and
          problem-solving—ranging from experimental builds to real-world
          applications. Explore the work to see how ideas transform into
          interactive experiences.
        </p>
      </div>
      <div ref={trackRef} className="slide-track gap-4"></div>
    </div>
  );
}
