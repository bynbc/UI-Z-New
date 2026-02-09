import { useCallback, useMemo, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { MeshTransmissionMaterial, Sparkles, Environment, Float, useScroll } from "@react-three/drei";
import { AnimatePresence, motion, useScroll as useFramerScroll, useTransform } from "framer-motion";
import * as THREE from "three";
import { ArrowRight, Check, Instagram, MessageCircle } from "lucide-react";

// --- COMPONENTE 3D: O "Z" LÍQUIDO OTIMIZADO ---
function LiquidKnot({ entered }) {
  const knotRef = useRef(null);
  const { camera, mouse } = useThree();
  
  const targetPos = useMemo(() => new THREE.Vector3(0, 0, entered ? -5 : 6), [entered]);

  useFrame((state, delta) => {
    if (knotRef.current) {
      // Rotação um pouco mais lenta para economizar processamento visual
      knotRef.current.rotation.x += delta * 0.1;
      knotRef.current.rotation.y += delta * 0.15;

      if (!entered) {
        // Reduzi o fator de parallax no mobile para evitar tontura/lag
        const x = (mouse.x * window.innerWidth) / 500;
        const y = (mouse.y * window.innerHeight) / 500;
        knotRef.current.rotation.x += y * 0.02;
        knotRef.current.rotation.y += x * 0.02;
      }
    }

    camera.position.lerp(targetPos, 0.04);
    
    const lookAtTarget = entered ? new THREE.Vector3(0, -2, -10) : new THREE.Vector3(0, 0, 0);
    const currentLookAt = new THREE.Vector3(0, 0, -2);
    currentLookAt.lerp(lookAtTarget, 0.04);
    camera.lookAt(currentLookAt);
  });

  return (
    <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
      <mesh ref={knotRef} position={[0, 0, 0]}>
        {/* GEOMETRIA REDUZIDA: De 300, 30 para 128, 16. Muito mais leve. */}
        <torusKnotGeometry args={[1.8, 0.6, 128, 16]} />
        <MeshTransmissionMaterial
          backside={true}
          samples={6} // Reduzido de 10 (padrão) para 6
          resolution={512} // Baixa resolução do buffer de refração (CRUCIAL PRO MOBILE)
          transmission={1}
          thickness={1.5}
          roughness={0.05}
          chromaticAberration={0.8}
          anisotropy={0.5}
          distortion={0.6}
          distortionScale={0.5}
          color="#ffffff"
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
      {/* Ambiente com resolução menor se possível */}
      <Environment preset="city" blur={1} />
      <spotLight position={[-10, 10, 10]} angle={0.3} penumbra={1} intensity={20} color="#ef4444" />
      <spotLight position={[10, -10, -10]} angle={0.3} penumbra={1} intensity={20} color="#ef4444" />
      {/* Menos partículas para o mobile renderizar */}
      <Sparkles count={100} size={4} speed={0.2} opacity={0.5} scale={15} color="#fff" />
      <LiquidKnot entered={entered} />
    </>
  );
}

// --- APP PRINCIPAL ---
export default function App() {
  const [entered, setEntered] = useState(false);
  
  const { scrollYProgress } = useFramerScroll();
  const opacityHero = useTransform(scrollYProgress, [0, 0.2], [1, 0]);
  const yHero = useTransform(scrollYProgress, [0, 0.2], [0, -50]);

  // LINKS CONFIGURADOS
  const WHATSAPP_LINK = "https://wa.me/5555991844071?text=Ol%C3%A1!%20Vim%20pelo%20site%20UI%20Z%20e%20quero%20transformar%20minha%20presen%C3%A7a%20digital.";
  const PAYMENT_LINK = "https://payment-link-v3.stone.com.br/pl_zoZrQw9PM6g3Ag2H4sryNejKGJ0WxpXd";

  return (
    <div className="relative w-full min-h-screen bg-black text-white selection:bg-red-500 selection:text-white font-sans">
      
      {/* 1. CAMADA 3D OTIMIZADA */}
      <div className="fixed inset-0 z-0">
        <Canvas 
          // TRAVA A RESOLUÇÃO: Isso salva a bateria e o FPS no celular
          dpr={[1, 1.5]} 
          // DESLIGA ANTIALIAS: Telas de celular não precisam tanto, e pesa muito
          gl={{ antialias: false, powerPreference: "high-performance" }} 
          camera={{ position: [0, 0, 6], fov: 45 }}
        >
          <color attach="background" args={["#000000"]} />
          <Scene entered={entered} />
        </Canvas>
      </div>

      {/* 2. CAMADA DE INTERFACE (UI) */}
      <div className={`relative z-10 transition-all duration-1000 ${entered ? "overflow-y-auto h-screen" : "overflow-hidden h-screen"}`}>
        
        {/* TELA INICIAL */}
        {!entered && (
          <div className="absolute inset-0 flex flex-col items-center justify-end pb-32 pointer-events-none">
            <motion.div 
              initial={{ opacity: 0, y: 20 }} 
              animate={{ opacity: 1, y: 0 }}
              className="text-center pointer-events-auto z-50 px-4"
            >
              <h1 className="text-6xl md:text-7xl font-bold tracking-tighter mb-4 text-transparent bg-clip-text bg-gradient-to-b from-white to-white/40">
                UI Z
              </h1>
              <p className="text-zinc-400 mb-8 tracking-widest text-xs uppercase">Seu Site Profissional por Assinatura</p>
              
              <button 
                onClick={() => setEntered(true)}
                className="group relative px-8 py-4 bg-white/5 backdrop-blur-md border border-white/10 rounded-full text-sm font-bold tracking-[0.2em] uppercase transition-all hover:bg-red-600 hover:border-red-600 hover:shadow-[0_0_40px_rgba(239,68,68,0.6)]"
              >
                <span className="relative z-10">Clique e Descubra</span>
              </button>
            </motion.div>
          </div>
        )}

        {/* CONTEÚDO SCROLLÁVEL */}
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
                className="text-4xl md:text-7xl font-bold tracking-tighter mb-6 leading-tight"
              >
                A solução completa para <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-orange-600">
                  conquistar presença digital.
                </span>
              </motion.h2>
              <motion.p 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.2 }}
                className="text-lg md:text-2xl text-zinc-400 max-w-3xl font-light"
              >
                "Sem necessidade de um alto investimento inicial, você pode ter um site moderno, rápido e sempre atualizado."
              </motion.p>
            </motion.div>

            {/* FEATURES (BENTO GRID) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-32">
              <BentoCard title="Design Profissional" delay={0.2}>
                Site moderno e responsivo que se adapta perfeitamente a celular, tablet e computador. Visual premium com carregamento rápido.
              </BentoCard>
              <BentoCard title="Conteúdo Personalizado" delay={0.4}>
                Logo, fotos do negócio, textos institucionais e links para redes sociais. Botões diretos para WhatsApp e Instagram.
              </BentoCard>
              <BentoCard title="Animações e Vídeos" delay={0.6} highlight>
                Animações suaves, vídeos curtos impactantes e transições modernas. Sua marca com o mesmo nível de startups de sucesso.
              </BentoCard>
              <BentoCard title="Atualizações Contínuas" delay={0.8}>
                Alterações de texto, fotos e links sob demanda. Ajustes visuais e inclusão de novas seções quando necessário.
              </BentoCard>
            </div>

            {/* PRICING SECTION */}
            <div className="flex flex-col md:flex-row gap-8 justify-center items-stretch mb-32">
              {/* Card Implantação */}
              <div className="flex-1 bg-zinc-900/50 backdrop-blur-xl border border-white/10 p-8 md:p-10 rounded-3xl flex flex-col justify-between">
                <div>
                  <h3 className="text-zinc-400 uppercase tracking-widest text-sm font-bold mb-4">Implantação Inicial</h3>
                  <div className="text-4xl md:text-5xl font-bold mb-2">R$ 100<span className="text-2xl text-zinc-500">,00</span></div>
                  <p className="text-zinc-500 text-sm mb-8">Pagamento único no primeiro mês</p>
                  <ul className="space-y-4 text-zinc-300">
                    <li className="flex gap-3"><Check className="text-red-500" size={20}/> Configuração completa do site</li>
                    <li className="flex gap-3"><Check className="text-red-500" size={20}/> Ativação do site personalizado</li>
                    <li className="flex gap-3"><Check className="text-red-500" size={20}/> Publicação imediata</li>
                  </ul>
                </div>
              </div>

              {/* Card Assinatura (Destaque) */}
              <div className="flex-1 relative bg-gradient-to-b from-red-900/20 to-black backdrop-blur-xl border border-red-500/50 p-8 md:p-10 rounded-3xl flex flex-col justify-between shadow-[0_0_50px_rgba(239,68,68,0.2)]">
                <div className="absolute top-0 right-0 bg-red-600 text-white text-xs font-bold px-4 py-1 rounded-bl-xl rounded-tr-2xl uppercase tracking-wider">
                  Recorrente
                </div>
                <div>
                  <h3 className="text-red-400 uppercase tracking-widest text-sm font-bold mb-4">Mensalidade</h3>
                  <div className="text-4xl md:text-5xl font-bold mb-2">R$ 49<span className="text-2xl text-zinc-500">,90</span></div>
                  <p className="text-zinc-500 text-sm mb-8">/mês. Tudo incluído, sem surpresas.</p>
                  <ul className="space-y-4 text-zinc-300">
                    <li className="flex gap-3"><Check className="text-red-500" size={20}/> Site online 24 horas por dia</li>
                    <li className="flex gap-3"><Check className="text-red-500" size={20}/> Hospedagem profissional</li>
                    <li className="flex gap-3"><Check className="text-red-500" size={20}/> Manutenção técnica contínua</li>
                  </ul>
                </div>
                {/* LINK DE PAGAMENTO STONE */}
                <a 
                  href={PAYMENT_LINK} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="w-full mt-8 bg-white text-black font-bold py-4 rounded-xl hover:bg-red-500 hover:text-white transition-colors flex items-center justify-center gap-2 cursor-pointer"
                >
                  Assinar Agora <ArrowRight size={18}/>
                </a>
              </div>
            </div>

            {/* CTA FINAL */}
            <div className="text-center pb-32">
              <h3 className="text-3xl md:text-5xl font-bold mb-6">Pronto Para Transformar Sua Presença Digital?</h3>
              <p className="text-zinc-400 max-w-2xl mx-auto mb-10 text-lg">
                Com UI Z, você tem um site profissional completo por menos do que custo de um almoço por semana.
              </p>
              <div className="flex flex-col md:flex-row gap-4 justify-center">
                {/* LINK WHATSAPP */}
                <a 
                  href={WHATSAPP_LINK} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="bg-green-500 hover:bg-green-600 text-black font-bold px-8 py-4 rounded-full flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  <MessageCircle size={20} /> Quero Meu Site Agora
                </a>
                
                {/* LINK SECUNDÁRIO */}
                <a 
                   href={WHATSAPP_LINK}
                   target="_blank" 
                   rel="noopener noreferrer"
                   className="bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold px-8 py-4 rounded-full flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  <Instagram size={20} /> Saiba Mais
                </a>
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
