"use client";

import MobileProjectCarousel from "@/components/mobile-carousel/mobile-carousel";
import ProjectCarousel from "@/components/carousel/project-page-carousel";
import { useEffect, useState } from "react";

export default function ProjectPage() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 1000);

    checkMobile(); // run once
    window.addEventListener("resize", checkMobile);

    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  return (
    <div className="overflow-hidden  project-page gap-12">
      <div className="project-page-title ">
        <div className="title-box">
          <h1 className="text-8xl">wOrks</h1>
          <p className="">
            A curated collection of projects that reflect my journey as a
            developer. Each piece highlights a blend of design, functionality,
            and problem-solving—ranging from experimental builds to real-world
            applications. Explore the work to see how ideas transform into
            interactive experiences.
          </p>
        </div>
      </div>
      {isMobile ? <MobileProjectCarousel /> : <ProjectCarousel />}
    </div>
  );
}
