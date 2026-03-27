"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Root() {
  const router = useRouter();
  
  useEffect(() => {
    // Transparently gateway users directly into the shared holistic experience
    localStorage.setItem("legani_name", "Eli");
    localStorage.setItem("legani_nusach", "Ari");
    localStorage.setItem("legani_chassidus", "Chabad");
    localStorage.setItem("legani_language", "English & Hebrew");
    
    router.push("/home");
  }, [router]);
  
  return <div style={{ background: "var(--bg-primary)", minHeight: "100vh" }} />;
}
