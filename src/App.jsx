import { useCallback, useMemo, useRef, useState, useEffect } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { MeshTransmissionMaterial, Sparkles, Environment, Float, useScroll } from "@react-three/drei";
import { AnimatePresence, motion, useScroll as useFramerScroll, useTransform } from "framer-motion";
import * as THREE from "three";
import { ArrowRight, Check, Instagram, MessageCircle, ShoppingCart } from "lucide-react";

// --- COMPONENTE 3D: O "Z" LÍQUIDO ---
function LiquidKnot({ entered }) {
  const knotRef = useRef(null);
  const { camera, mouse } = useThree();
  
  // Destino da câmera: Fora (z=6) ou Dentro (z=-5)
  const targetPos = useMemo(() => new THREE.Vector3(0, 0, entered ? -5 : 6), [entered]);

  useFrame((state, delta) => {
    if (knotRef.current) {
      // Rotação automática suave
      knotRef.current.rotation.x += delta * 0.1;
      knotRef.current.rotation.y += delta * 0.15;

      // PARALLAX: O objeto se inclina levemente seguindo o mouse (se não tiver entrado ainda)
      if (!entered) {
        const x = (mouse.x * window.innerWidth) / 500;
        const y = (mouse.y * window.innerHeight) / 500;
        knotRef.current.rotation.x += y * 0.05;
        knotRef.current.rotation.y += x * 0.05;
      }
    }

    // Movimento suave da câmera (Fly-Through)
    camera.position.lerp(targetPos, 0.04);
    
    // Se já entrou, a câmera foca em um ponto mais baixo para facilitar leitura
    // Se está fora, foca no centro
    const lookAtTarget = entered ? new THREE.Vector3(0, -2, -10) : new THREE.Vector3(0, 0, 0);
    const currentLookAt = new THREE.Vector3(0, 0, -2); // Vetor temporário
    currentLookAt.lerp(lookAtTarget, 0.04);
    camera.lookAt(currentLookAt);
  });

  return (
    <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
      <mesh ref={knotRef} position={[0, 0, 0]}>
        {/* Usando TorusKnot como o "Z" abstrato por enquanto */}
        <torusKnotGeometry args={[1.8, 0.6, 300, 30]} />
        <MeshTransmissionMaterial
          transmission={1}
          thickness={1.5}
          roughness={0.05} // Mais liso para brilhar mais
          chromaticAberration={0.8} // Efeito prisma nas bordas
          anisotropy={0.5}
          distortion={0.6} // Distorção de líquido
          distortionScale={0.5}
          color="#ffffff" // Base branca para pegar a cor da luz
          toneMapped={false}
        />
      </mesh>
    </Float>
  );
}

// --- CENA PRINCIPAL ---
function Scene({ entered }) {
  return (
    <>
      {/* Ambiente HDRI para reflexos realistas no vidro (City = luzes de cidade noturna) */}
      <Environment preset="city" />
      
      {/* Luzes de Recorte (Rim Light) Vermelhas */}
      <spotLight position={[-10, 10, 10]} angle={0.3} penumbra={1} intensity={20} color="#ef4444" />
      <spotLight position={[10, -10, -10]} angle={0.3} penumbra={1} intensity={20} color="#ef4444" />
      
      {/* Partículas de fundo */}
      <Sparkles count={200} size={3} speed={0.2} opacity={0.5} scale={15} color="#fff" />
      
      <LiquidKnot entered={entered} />
    </>
  );
}

// --- APP PRINCIPAL ---
export default function App() {
  const [entered, setEntered] = useState(false);
  
  // Controle de Scroll da página HTML
  const { scrollYProgress } = useFramerScroll();
  const opacityHero = useTransform(scrollYProgress, [0, 0.2], [1, 0]);
  const yHero = useTransform(scrollYProgress, [0, 0.2], [0, -50]);

  return (
    <div className="relative w-full min-h-screen bg-black text-white selection:bg-red-500 selection:text-white">
      
      {/* 1. CAMADA 3D (Fica fixa no fundo) */}
      <div className="fixed inset-0 z-0">
        <Canvas gl={{ antialias: true, toneMappingExposure: 1.5 }} camera={{ position: [0, 0, 6], fov: 45 }}>
          <color attach="background" args={["#000000"]} />
          <Scene entered={entered} />
        </Canvas>
      </div>

      {/* 2. CAMADA DE INTERFACE (UI) */}
      <div className={`relative z-10 transition-all duration-1000 ${entered ? "overflow-y-auto h-screen" : "overflow-hidden h-screen"}`}>
        
        {/* TELA INICIAL (Antes de Entrar) */}
        {!entered && (
          <div className="absolute inset-0 flex flex-col items-center justify-end pb-32 pointer-events-none">
            <motion.div 
              initial={{ opacity: 0, y: 20 }} 
              animate={{ opacity: 1, y: 0 }}
              className="text-center pointer-events-auto z-50"
            >
              <h1 className="text-7xl font-bold tracking-tighter mb-4 text-transparent bg-clip-text bg-gradient-to-b from-white to-white/40">
                UI Z
              </h1>
              <p className="text-zinc-400 mb-8 tracking-widest text-xs uppercase">Future Web Experience</p>
              
              <button 
                onClick={() => setEntered(true)}
                className="group relative px-8 py-4 bg-white/5 backdrop-blur-md border border-white/10 rounded-full text-sm font-bold tracking-[0.2em] uppercase transition-all hover:bg-red-600 hover:border-red-600 hover:shadow-[0_0_40px_rgba(239,68,68,0.6)]"
              >
                <span className="relative z-10">Clique e Descubra</span>
              </button>
            </motion.div>
          </div>
        )}

        {/* CONTEÚDO SCROLLÁVEL (Só aparece depois de entrar) */}
        {entered && (
          <div className="w-full max-w-5xl mx-auto px-6 py-24">
            
            {/* HERO SECTION */}
            <motion.div 
              style={{ opacity: opacityHero, y: yHero }}
              className="min-h-[60vh] flex flex-col justify-center items-center text-center mb-32"
            >
              <motion.h2 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 1 }}
                className="text-5xl md:text-7xl font-bold tracking-tighter mb-6 leading-tight"
              >
                Seu Site Profissional <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-orange-600">
                  Por Assinatura.
                </span>
              </motion.h2>
              <motion.p 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.2 }}
                className="text-xl md:text-2xl text-zinc-400 max-w-2xl font-light"
              >
                [cite_start]"Você não compra um site. <br/> Você assina um site ativo, vivo e sempre atualizado." [cite: 20]
              </motion.p>
            </motion.div>

            {/* FEATURES (BENTO GRID) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-32">
              <BentoCard title="Design Profissional" delay={0.2}>
                Site moderno e responsivo que se adapta perfeitamente a celular, tablet e computador. [cite_start]Visual premium nível startup. [cite: 24, 25, 26]
              </BentoCard>
              <BentoCard title="Atualizações Contínuas" delay={0.4}>
                Alterações de texto, fotos e links sob demanda. [cite_start]Seu site nunca fica obsoleto. [cite: 31, 32]
              </BentoCard>
              <BentoCard title="Conteúdo Personalizado" delay={0.6}>
                [cite_start]Logo, fotos do negócio, textos institucionais e botões diretos para WhatsApp e Instagram. [cite: 27, 28]
              </BentoCard>
              <BentoCard title="Sem Investimento Alto" delay={0.8} highlight>
                Esqueça pagar R$ 3.000 num site. [cite_start]Comece com um valor acessível e foco no resultado. [cite: 3]
              </BentoCard>
            </div>

            {/* PRICING SECTION */}
            <div className="flex flex-col md:flex-row gap-8 justify-center items-stretch mb-32">
              {/* Card Implantação */}
              <div className="flex-1 bg-zinc-900/50 backdrop-blur-xl border border-white/10 p-10 rounded-3xl flex flex-col justify-between">
                <div>
                  <h3 className="text-zinc-400 uppercase tracking-widest text-sm font-bold mb-4">Implantação</h3>
                  <div className="text-5xl font-bold mb-2">R$ 100<span className="text-2xl text-zinc-500">,00</span></div>
                  [cite_start]<p className="text-zinc-500 text-sm mb-8">Pagamento único [cite: 9]</p>
                  <ul className="space-y-4 text-zinc-300">
                    [cite_start]<li className="flex gap-3"><Check className="text-red-500" size={20}/> Configuração Completa [cite: 10]</li>
                    [cite_start]<li className="flex gap-3"><Check className="text-red-500" size={20}/> Publicação Imediata [cite: 13]</li>
                  </ul>
                </div>
              </div>

              {/* Card Assinatura (Destaque) */}
              <div className="flex-1 relative bg-gradient-to-b from-red-900/20 to-black backdrop-blur-xl border border-red-500/50 p-10 rounded-3xl flex flex-col justify-between shadow-[0_0_50px_rgba(239,68,68,0.2)]">
                <div className="absolute top-0 right-0 bg-red-600 text-white text-xs font-bold px-4 py-1 rounded-bl-xl rounded-tr-2xl uppercase tracking-wider">
                  Mais Popular
                </div>
                <div>
                  <h3 className="text-red-400 uppercase tracking-widest text-sm font-bold mb-4">Assinatura Mensal</h3>
                  <div className="text-5xl font-bold mb-2">R$ 49<span className="text-2xl text-zinc-500">,90</span></div>
                  [cite_start]<p className="text-zinc-500 text-sm mb-8">Por mês [cite: 15]</p>
                  <ul className="space-y-4 text-zinc-300">
                    [cite_start]<li className="flex gap-3"><Check className="text-red-500" size={20}/> Hospedagem Profissional [cite: 18]</li>
                    [cite_start]<li className="flex gap-3"><Check className="text-red-500" size={20}/> Manutenção Contínua [cite: 19]</li>
                    [cite_start]<li className="flex gap-3"><Check className="text-red-500" size={20}/> Suporte Garantido [cite: 19]</li>
                  </ul>
                </div>
                <button className="w-full mt-8 bg-white text-black font-bold py-4 rounded-xl hover:bg-red-500 hover:text-white transition-colors flex items-center justify-center gap-2">
                  Assinar Agora <ArrowRight size={18}/>
                </button>
              </div>
            </div>

            {/* CTA FINAL */}
            <div className="text-center pb-32">
              [cite_start]<h3 className="text-3xl md:text-5xl font-bold mb-8">Pronto para transformar sua presença? [cite: 33]</h3>
              <div className="flex flex-col md:flex-row gap-4 justify-center">
                <button className="bg-green-500 hover:bg-green-600 text-black font-bold px-8 py-4 rounded-full flex items-center justify-center gap-2 transition-all">
                  <MessageCircle size={20} /> Falar no WhatsApp
                </button>
                <button className="bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold px-8 py-4 rounded-full flex items-center justify-center gap-2 transition-all">
                  <Instagram size={20} /> Ver Portfólio
                </button>
              </div>
            </div>

          </div>
        )}
      </div>
    </div>
  );
}

// Componente auxiliar para os Cards do Bento Grid
function BentoCard({ title, children, delay, highlight }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ delay, duration: 0.5 }}
      className={`p-8 rounded-3xl border ${highlight ? "border-red-500/30 bg-red-900/10" : "border-white/10 bg-white/5"} backdrop-blur-lg hover:bg-white/10 transition-colors`}
    >
      <h3 className={`text-2xl font-bold mb-4 ${highlight ? "text-red-400" : "text-white"}`}>{title}</h3>
      <p className="text-zinc-400 leading-relaxed">
        {children}
      </p>
    </motion.div>
  );
}
