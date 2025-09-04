"use client"
import Image from "next/image";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/nav/navbar";
import ImageScale from "@/components/image-scale/image-scale";
import TestComp from "@/components/test-comp/test";
import CursorTrail from "@/components/cursor-trail/cursor-trail";


export default function Home() {
  const router = useRouter();
  const [mounted,setMounted] = useState(false)

  useEffect(()=>{
    setMounted(true)
    if(!mounted){
      setMounted(true)
    }
  })
  
  return (
    <div className="min-h-screen home-screen">
     <ImageScale/>
    </div>
  );
}
