import { useEffect, useRef } from "react";
import "./style.css";

const config = {
  imageCount: 6,
  imageLifeSpan: 400,
  removalDelay: 30,
  mouseThreshold: 50,
  scrollThreshold: 50,
  idleCursorInterval: 700,
  inDuration: 750,
  outDuration: 800,
  inEasing: "cubic-bezier(0.7,.5,.5,1)",
  outEasing: "cubic-bezier(.87, 0, .13, 1)",
};

interface TrailItem {
  element: HTMLImageElement;
  rotation: number;
  removeTime: number;
}

declare global {
  interface Window {
    moveTimeout?: NodeJS.Timeout;
    scrollTimeout?: NodeJS.Timeout;
  }
}

export default function CursorTrail() {
  const containerRef = useRef<HTMLDivElement>(null);
  const trailRef = useRef<TrailItem[]>([]);
  const animationRef = useRef<number>();
  const stateRef = useRef({
    mouseX: 0,
    mouseY: 0,
    lastMouseX: 0,
    lastMouseY: 0,
    isMoving: false,
    isCursorInContainer: false,
    lastRemovalTime: 0,
    lastSteadyImage: 0,
    lastScrollTime: 0,
    isScrolling: false,
    scrollTicking: false,
  });

  const images = Array.from(
    { length: config.imageCount },
    (_, i) => `/img${i + 1}.png`
  );

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const state = stateRef.current;
    const trail = trailRef.current;

    const isInContainer = (x: number, y: number) => {
      const rect = containerRef.current?.getBoundingClientRect();
      if (!rect) return false;
      return x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom;
    };

    const hasMovedEnough = () => {
      const distance = Math.sqrt(
        Math.pow(state.mouseX - state.lastMouseX, 2) + 
        Math.pow(state.mouseY - state.lastMouseY, 2)
      );
      return distance > config.mouseThreshold;
    };

    const createImage = () => {
      const img = document.createElement("img");
      img.classList.add("trail-img");
      img.style.position = "absolute";
      img.style.pointerEvents = "none";
      img.style.userSelect = "none";
      img.style.width = "200px";
      img.style.height = "200px";
      img.style.opacity = "1";

      const randomIndex = Math.floor(Math.random() * images.length);
      const rotation = (Math.random() - 0.5) * 50;
      img.src = images[randomIndex];

      const rect = containerRef.current?.getBoundingClientRect();
      if (!rect) return;
      const relativeX = state.mouseX - rect.left;
      const relativeY = state.mouseY - rect.top;
      img.style.left = `${relativeX}px`;
      img.style.top = `${relativeY}px`;

      img.style.transform = `translate(-50%, -50%) rotate(${rotation}deg) scale(0)`;
      img.style.transition = `transform ${config.inDuration}ms ${config.inEasing}`;

      containerRef.current?.appendChild(img);

      setTimeout(() => {
        img.style.transform = `translate(-50%, -50%) rotate(${rotation}deg) scale(1)`;
      }, 10);

      trail.push({
        element: img,
        rotation: rotation,
        removeTime: Date.now() + config.imageLifeSpan,
      });
    };

    const createTrailImage = () => {
      if (!state.isCursorInContainer) return;

      const now = Date.now();

      if (state.isMoving && hasMovedEnough()) {
        state.lastMouseX = state.mouseX;
        state.lastMouseY = state.mouseY;
        createImage();
        return;
      }

      if (!state.isMoving && now - state.lastSteadyImage >= config.idleCursorInterval) {
        state.lastSteadyImage = now;
        createImage();
      }
    };

    const createScrollTrailImage = () => {
      if (!state.isCursorInContainer) return;

      state.lastMouseX += (config.mouseThreshold + 10) * (Math.random() > 0.5 ? 1 : -1);
      state.lastMouseY += (config.mouseThreshold + 10) * (Math.random() > 0.5 ? 1 : -1);

      createImage();
      state.lastMouseX = state.mouseX;
      state.lastMouseY = state.mouseY;
    };

    const removeOldImages = () => {
      const now = Date.now();

      if (now - state.lastRemovalTime < config.removalDelay || trail.length === 0) return;

      const oldestImage = trail[0];
      if (now >= oldestImage.removeTime) {
        const imgToRemove = trail.shift();
        if (!imgToRemove) return;

        imgToRemove.element.style.transition = `transform ${config.outDuration}ms ${config.outEasing}`;
        imgToRemove.element.style.transform = `translate(-50%, -50%) rotate(${imgToRemove.rotation}deg) scale(0)`;

        state.lastRemovalTime = now;

        setTimeout(() => {
          if (imgToRemove.element.parentNode) {
            imgToRemove.element.parentNode.removeChild(imgToRemove.element);
          }
        }, config.outDuration);
      }
    };

    const handleMouseMove = (e: MouseEvent) => {
      state.mouseX = e.clientX;
      state.mouseY = e.clientY;
      state.isCursorInContainer = isInContainer(state.mouseX, state.mouseY);

      if (state.isCursorInContainer) {
        state.isMoving = true;
        clearTimeout(window.moveTimeout);
        window.moveTimeout = setTimeout(() => {
          state.isMoving = false;
        }, 100);
      }
    };

    const handleScroll = () => {
      state.isCursorInContainer = isInContainer(state.mouseX, state.mouseY);

      if (state.isCursorInContainer) {
        state.isMoving = true;
        state.lastMouseX += (Math.random() - 0.5) * 10;

        clearTimeout(window.scrollTimeout);
        window.scrollTimeout = setTimeout(() => {
          state.isMoving = false;
        }, 100);
      }

      const now = Date.now();
      state.isScrolling = true;

      if (now - state.lastScrollTime < config.scrollThreshold) return;

      state.lastScrollTime = now;

      if (!state.scrollTicking) {
        requestAnimationFrame(() => {
          if (state.isScrolling) {
            createScrollTrailImage();
            state.isScrolling = false;
          }
          state.scrollTicking = false;
        });
        state.scrollTicking = true;
      }
    };

    const setInitialMousePosition = (event: MouseEvent) => {
      state.mouseX = event.clientX;
      state.mouseY = event.clientY;
      state.lastMouseX = state.mouseX;
      state.lastMouseY = state.mouseY;
      state.isCursorInContainer = isInContainer(state.mouseX, state.mouseY);
      document.removeEventListener("mouseover", setInitialMousePosition);
    };

    const animate = () => {
      createTrailImage();
      removeOldImages();
      animationRef.current = requestAnimationFrame(animate);
    };

    // Add event listeners
    document.addEventListener("mouseover", setInitialMousePosition, false);
    document.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("scroll", handleScroll, { passive: true });

    // Start animation
    animate();

    // Cleanup
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      document.removeEventListener("mouseover", setInitialMousePosition);
      document.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("scroll", handleScroll);
      clearTimeout(window.moveTimeout);
      clearTimeout(window.scrollTimeout);
      
      // Clean up remaining trail images
      trail.forEach(item => {
        if (item.element.parentNode) {
          item.element.parentNode.removeChild(item.element);
        }
      });
    };
  }, []);

  return (
    <section ref={containerRef} className="cursor-trail-container">
      <p>Move cursor to see animation</p>
    </section>
  );
}
