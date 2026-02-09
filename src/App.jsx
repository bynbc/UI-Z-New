import { useCallback, useMemo, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { MeshTransmissionMaterial, Sparkles } from "@react-three/drei";
import { AnimatePresence, motion } from "framer-motion";
import * as THREE from "three";

function LiquidKnot({ entered, onPassThrough }) {
  const knotRef = useRef(null);
  const { camera } = useThree();
  const target = useMemo(
    () => new THREE.Vector3(0, 0, entered ? -5 : 6),
    [entered]
  );
  const hasPassed = useRef(false);

  useFrame((state, delta) => {
    if (knotRef.current) {
      knotRef.current.rotation.x += delta * 0.2;
      knotRef.current.rotation.y += delta * 0.35;
    }

    camera.position.lerp(target, 0.06);
    camera.lookAt(0, 0, 0);

    if (!hasPassed.current && entered && camera.position.z < 0.5) {
      hasPassed.current = true;
      onPassThrough();
    }
  });

  return (
    <mesh ref={knotRef} position={[0, 0, 0]}>
      <torusKnotGeometry args={[2.2, 0.65, 256, 32]} />
      <MeshTransmissionMaterial
        transmission={1}
        thickness={3}
        roughness={0.1}
        chromaticAberration={1}
        distortion={0.8}
        color="#ffffff"
      />
    </mesh>
  );
}

function Scene({ entered, onPassThrough }) {
  return (
    <>
      <color attach="background" args={["#000000"]} />
      <ambientLight intensity={0.25} />
      <spotLight
        position={[-6, 4, 6]}
        angle={0.35}
        penumbra={0.6}
        intensity={3.5}
        color="#ff0000"
      />
      <spotLight
        position={[6, -2, 4]}
        angle={0.4}
        penumbra={0.5}
        intensity={3.2}
        color="#ff0000"
      />
      <pointLight position={[0, 2, 8]} intensity={1.2} />
      <Sparkles count={140} size={2} speed={0.35} scale={12} color="#ffffff" />
      <LiquidKnot entered={entered} onPassThrough={onPassThrough} />
    </>
  );
}

export default function App() {
  const [entered, setEntered] = useState(false);
  const [showCards, setShowCards] = useState(false);

  const handleEnter = useCallback(() => {
    setEntered(true);
  }, []);

  const handlePassThrough = useCallback(() => {
    setShowCards(true);
  }, []);

  return (
    <div className="relative h-screen w-screen overflow-hidden bg-black text-white">
      <Canvas
        camera={{ position: [0, 0, 6], fov: 42 }}
        gl={{ antialias: true, alpha: false }}
      >
        <Scene entered={entered} onPassThrough={handlePassThrough} />
      </Canvas>

      <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
        <AnimatePresence>
          {!entered && (
            <motion.button
              key="enter"
              type="button"
              onClick={handleEnter}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
              className="pointer-events-auto rounded-full border border-white/30 bg-white/10 px-8 py-3 text-sm font-semibold uppercase tracking-[0.3em] text-white shadow-[0_0_40px_rgba(255,255,255,0.2)] backdrop-blur-xl hover:bg-white/20"
            >
              ENTRAR NO Z
            </motion.button>
          )}
        </AnimatePresence>
      </div>

      <div className="pointer-events-none absolute inset-0 flex items-end justify-center pb-20">
        <AnimatePresence>
          {showCards && (
            <motion.div
              key="cards"
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 40 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="pointer-events-auto grid gap-6 md:grid-cols-2"
            >
              <div className="w-64 rounded-2xl border border-white/20 bg-white/10 p-6 text-center shadow-[0_0_40px_rgba(255,0,0,0.18)] backdrop-blur-2xl">
                <p className="text-xs uppercase tracking-[0.3em] text-white/60">
                  Implantação
                </p>
                <p className="mt-4 text-3xl font-semibold">R$ 100,00</p>
                <p className="mt-2 text-sm text-white/70">
                  Setup completo do universo Z
                </p>
              </div>
              <div className="w-64 rounded-2xl border border-white/20 bg-white/10 p-6 text-center shadow-[0_0_40px_rgba(255,255,255,0.12)] backdrop-blur-2xl">
                <p className="text-xs uppercase tracking-[0.3em] text-white/60">
                  Mensalidade
                </p>
                <p className="mt-4 text-3xl font-semibold">R$ 49,90/mês</p>
                <p className="mt-2 text-sm text-white/70">
                  Suporte e evoluções contínuas
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
