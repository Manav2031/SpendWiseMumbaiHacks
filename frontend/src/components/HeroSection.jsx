import React, { Suspense } from "react";
import { Link } from "react-router-dom";
import { Float, Stage } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";

function FinanceModel() {
  return (
    <Float speed={1.5} rotationIntensity={1.2} floatIntensity={1.5}>
      <mesh castShadow receiveShadow>
        <boxGeometry args={[3.2, 2, 0.15]} />
        <meshStandardMaterial
          color={"#8b5cf6"}
          emissive={"#6d28d9"}
          emissiveIntensity={0.3}
          metalness={0.6}
          roughness={0.25}
        />
      </mesh>

      <mesh position={[-1.0, 0.5, 0.08]}>
        <boxGeometry args={[0.45, 0.3, 0.05]} />
        <meshStandardMaterial color={"#fbbf24"} metalness={1} roughness={0.2} />
      </mesh>

      {Array.from({ length: 4 }).map((_, i) => (
        <mesh key={i} position={[-0.9 + i * 0.7, 0.0, 0.08]}>
          <boxGeometry args={[0.55, 0.05, 0.02]} />
          <meshStandardMaterial color={"#ffffff"} />
        </mesh>
      ))}

      <mesh position={[-0.9, -0.5, 0.08]}>
        <boxGeometry args={[1.0, 0.08, 0.02]} />
        <meshStandardMaterial color={"#ffffff"} />
      </mesh>

      <mesh position={[0.6, -0.5, 0.08]}>
        <boxGeometry args={[0.4, 0.08, 0.02]} />
        <meshStandardMaterial color={"#ffffff"} />
      </mesh>

      <mesh position={[1.2, 0.7, 0.08]}>
        <circleGeometry args={[0.15, 32]} />
        <meshStandardMaterial color={"#fbbf24"} />
      </mesh>

      <mesh position={[-1.2, 0.7, 0.08]}>
        <boxGeometry args={[0.7, 0.03, 0.01]} />
        <meshStandardMaterial color={"#ffffff"} opacity={0.5} transparent />
      </mesh>

      <mesh position={[0, 0.7, -0.07]}>
        <boxGeometry args={[3.0, 0.25, 0.02]} />
        <meshStandardMaterial color={"#111111"} />
      </mesh>

      <mesh position={[-0.3, 0.35, -0.07]}>
        <boxGeometry args={[1.0, 0.12, 0.01]} />
        <meshStandardMaterial color={"#ffffff"} />
      </mesh>

      <mesh position={[0.85, 0.35, -0.07]}>
        {" "}
        <boxGeometry args={[0.3, 0.08, 0.01]} />
        <meshStandardMaterial color={"#dddddd"} />
      </mesh>
    </Float>
  );
}

export function HeroSection() {
  return (
    <section
      className="
        relative overflow-hidden
        bg-gradient-to-b
        from-purple-50 to-purple-100
        dark:from-[#0a0f1f] dark:to-[#1a1f35]
        pt-32 pb-40 md:pt-40 md:pb-48
      "
    >
      <div
        className="absolute inset-0 opacity-[0.25] dark:opacity-[0.15]"
        style={{
          backgroundImage:
            "linear-gradient(#e5e7eb 1px, transparent 1px), linear-gradient(90deg, #e5e7eb 1px, transparent 1px)",
          backgroundSize: "60px 60px",
          mixBlendMode: "overlay",
        }}
      />

      <div className="relative max-w-6xl mx-auto px-6 z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 items-center gap-10">
          <div>
            <h1
              className="text-[52px] md:text-[72px] font-extrabold leading-[1.1]
                       text-[#0A0E27] dark:text-white"
            >
              SpendWise
            </h1>

            <p className="mt-6 text-xl text-gray-600 dark:text-gray-300 max-w-xl">
              Understand your spending, analyze your habits, and build smarter
              savings with AI designed to help you stay on track.
            </p>

            <Link
              to="/auth"
              className="
            mt-10 inline-block px-10 py-4 rounded-full text-white font-semibold text-lg
            bg-purple-600 hover:bg-purple-700
            dark:bg-purple-500 dark:hover:bg-purple-600
            transition shadow-lg
          "
            >
              Get Started
            </Link>

            <div className="mt-20"></div>
          </div>

          <div className="hidden md:flex justify-center items-center h-[350px] md:h-[420px]">
            <Canvas camera={{ position: [4, 3, 5], fov: 40 }}>
              <Suspense fallback={null}>
                <Stage
                  intensity={1.5}
                  environment={null}
                  shadows={{ type: "contact", opacity: 0.4, blur: 2 }}
                >
                  <FinanceModel />
                </Stage>

                <OrbitControls
                  enableZoom={false}
                  autoRotate
                  autoRotateSpeed={4}
                />
              </Suspense>
            </Canvas>
          </div>
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 pointer-events-none">
        <svg viewBox="0 0 2000 500" className="w-full">
          <path
            className="dark:hidden"
            fill="#a855f7"
            fillOpacity="0.45"
            d="
              M0,300
              C250,260 380,360 600,290
              C820,220 1000,350 1250,240
              C1500,150 1650,330 1850,180
              C2000,120 2150,360 2350,60
              C2500,-40 2600,260 2800,20
              V500 H0 Z
            "
          />
          <path
            className="hidden dark:block"
            fill="#6d28d9"
            fillOpacity="0.35"
            d="
              M0,300
              C250,260 380,360 600,290
              C820,220 1000,350 1250,240
              C1500,150 1650,330 1850,180
              C2000,120 2150,360 2350,60
              C2500,-40 2600,260 2800,20
              V500 H0 Z
            "
          />

          <path
            className="dark:hidden"
            fill="#8b5cf6"
            fillOpacity="0.85"
            d="
              M0,340
              C280,300 450,400 700,310
              C950,220 1150,380 1450,250
              C1700,120 1900,370 2200,150
              C2450,-20 2650,380 2950,-40
              C3100,-120 3300,320 3500,-80
              V500 H0 Z
            "
          />
          <path
            className="hidden dark:block"
            fill="#7c3aed"
            fillOpacity="0.7"
            d="
              M0,340
              C280,300 450,400 700,310
              C950,220 1150,380 1450,250
              C1700,120 1900,370 2200,150
              C2450,-20 2650,380 2950,-40
              C3100,-120 3300,320 3500,-80
              V500 H0 Z
            "
          />
        </svg>
      </div>
    </section>
  );
}
