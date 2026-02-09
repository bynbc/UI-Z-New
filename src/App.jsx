import { useCallback, useMemo, useRef, useState, useEffect } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { MeshTransmissionMaterial, Sparkles, Environment, Float, useScroll } from "@react-three/drei";
import { AnimatePresence, motion, useScroll as useFramerScroll, useTransform } from "framer-motion";
import * as THREE from "three";
import { ArrowRight, Check, X, Instagram, MessageCircle, ChevronDown, Zap, Shield, Clock } from "lucide-react";

// --- CONFIGURAÇÃO DE PERFORMANCE ---
const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;

// --- COMPONENTE 3D REATIVO (A MÁGICA ACONTECE AQUI) ---
function ReactiveLiquidKnot({ entered, setEntered }) {
  const knotRef = useRef(null);
  const materialRef = useRef(null);
  const { camera, mouse, viewport } = useThree();
  
  // Variáveis para física do mouse
  const lastMouse = useRef({ x: 0, y: 0 });
  const velocity = useRef(0);
  
  const targetPos = useMemo(() => new THREE.Vector3(0, 0, entered ? -5 : 6), [entered]);

  useFrame((state, delta) => {
    if (!knotRef.current) return;

    // 1. CÁLCULO DE VELOCIDADE DO MOUSE (Para criar o efeito de distorção)
    // Calcula a distância que o mouse percorreu desde o último frame
    const dx = mouse.x - lastMouse.current.x;
    const dy = mouse.y - lastMouse.current.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    
    // Suaviza a velocidade (Lerp) para não ficar piscando
    velocity.current = THREE.MathUtils.lerp(velocity.current, dist * 100, 0.1);
    lastMouse.current = { x: mouse.x, y: mouse.y };

    // 2. APLICAÇÃO NO MATERIAL (REAÇÃO)
    if (materialRef.current) {
      // Quanto mais rápido o mouse, maior a distorção (efeito líquido agitado)
      // Base: 0.4. Máximo: 1.0
      materialRef.current.distortion = THREE.MathUtils.lerp(0.4, 1.0, velocity.current / 5);
      
      // A aberração cromática (arco-íris) também aumenta com a velocidade
      materialRef.current.chromaticAberration = THREE.MathUtils.lerp(0.5, 1.5, velocity.current / 5);
    }

    // 3. ROTAÇÃO MAGNÉTICA
    // O objeto gira sozinho, MAS se inclina agressivamente na direção do mouse
    knotRef.current.rotation.x += delta * 0.1; 
    knotRef.current.rotation.y += delta * 0.15;

    if (!entered && !isMobile) {
      // Parallax mais forte e elástico
      const targetRotationX = (mouse.y * viewport.height) / 100;
      const targetRotationY = (mouse.x * viewport.width) / 100;
      
      knotRef.current.rotation.x = THREE.MathUtils.lerp(knotRef.current.rotation.x, targetRotationX, 0.1);
      knotRef.current.rotation.y = THREE.MathUtils.lerp(knotRef.current.rotation.y, targetRotationY, 0.1);
    }

    // 4. MOVIMENTO DA CÂMERA (Fly-Through)
    camera.position.lerp(targetPos, 0.04);
    
    const lookAtTarget = entered ? new THREE.Vector3(0, -2, -10) : new THREE.Vector3(0, 0, 0);
    const currentLookAt = new THREE.Vector3(0, 0, -2);
    currentLookAt.lerp(lookAtTarget, 0.04);
    camera.lookAt(currentLookAt);
  });

  // Função de clique no objeto (Feedback Tátil Visual)
  const handlePulse = () => {
    if(!entered) {
        // Se clicar no objeto, entra no site
        setEntered(true);
    }
  };

  return (
    <Float speed={isMobile ? 1 : 2} rotationIntensity={0.5} floatIntensity={0.5}>
      <mesh 
        ref={knotRef} 
        onClick={handlePulse}
        onPointerOver={() => { document.body.style.cursor = 'pointer' }}
        onPointerOut={() => { document.body.style.cursor = 'auto' }}
      >
        <torusKnotGeometry args={[1.8, 0.6, 128, 32]} /> {/* Geometria média para bom visual */}
        <MeshTransmissionMaterial
          ref={materialRef}
          backside={true} 
          samples={isMobile ? 2 : 6} 
          resolution={isMobile ? 128 : 512}
          transmission={1} 
          thickness={1.5} 
          roughness={0.05} 
          chromaticAberration={0.5} // Valor base
          anisotropy={0} 
          distortion={0.4} // Valor base
          distortionScale={0.5} 
          color="#ffffff" 
          toneMapped={false}
        />
      </mesh>
    </Float>
  );
}

function Scene({ entered, setEntered }) {
  return (
    <>
      <Environment preset="city" blur={1} />
      <spotLight position={[-10, 10, 10]} intensity={20} color="#ef4444" />
      <spotLight position={[10, -10, -10]} intensity={20} color="#ef4444" />
      <Sparkles count={isMobile ? 40 : 100} size={4} opacity={0.5} scale={15} color="#fff" />
      <ReactiveLiquidKnot entered={entered} setEntered={setEntered} />
    </>
  );
}

// --- APP PRINCIPAL ---
export default function App() {
  const [entered, setEntered] = useState(false);
  const { scrollYProgress } = useFramerScroll();
  const opacityHero = useTransform(scrollYProgress, [0, 0.2], [1, 0]);
  const yHero = useTransform(scrollYProgress, [0, 0.2], [0, -50]);
  const scrollIndicatorOpacity = useTransform(scrollYProgress, [0, 0.05], [1, 0]);

  // LINKS
  const WHATSAPP_LINK = "https://wa.me/5555991844071?text=Ol%C3%A1!%20Vi%20o%20comparativo%20no%20site%20e%20quero%20aproveitar%20a%20implanta%C3%A7%C3%A3o%20de%20R$100.";
  const PAYMENT_LINK = "https://payment-link-v3.stone.com.br/pl_zoZrQw9PM6g3Ag2H4sryNejKGJ0WxpXd";

  return (
    <div className="relative w-full min-h-screen bg-black text-white font-sans selection:bg-red-500 selection:text-white">
      
      {/* 3D BACKGROUND */}
      <div className="fixed inset-0 z-0">
        <Canvas dpr={isMobile ? [1, 1] : [1, 1.5]} gl={{ antialias: false, powerPreference: "high-performance" }} camera={{ position: [0, 0, 6], fov: 45 }}>
          <color attach="background" args={["#000000"]} />
          <Scene entered={entered} setEntered={setEntered} />
        </Canvas>
      </div>

      {/* UI LAYER */}
      <div className={`relative z-10 transition-all duration-1000 ${entered ? "overflow-y-auto h-screen" : "overflow-hidden h-screen"}`}>
        
        {/* LANDING SCREEN */}
        {!entered && (
          <div className="absolute inset-0 flex flex-col items-center justify-end pb-32 pointer-events-none px-4">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center pointer-events-auto z-50">
              <div className="mb-4 inline-block rounded-full bg-red-500/10 border border-red-500/20 px-4 py-1">
                <span className="text-[10px] font-bold uppercase tracking-widest text-red-500 animate-pulse">● Vagas Limitadas Este Mês</span>
              </div>
              <h1 className="text-6xl md:text-8xl font-bold tracking-tighter mb-4 text-white">UI Z</h1>
              <p className="text-zinc-400 mb-8 tracking-widest text-xs uppercase">Interaja com o objeto acima</p>
              
              {/* DICA VISUAL PARA INTERAGIR */}
              <div className="text-white/30 text-xs mb-4 animate-pulse">
                (Arraste ou passe o mouse rápido)
              </div>

              <button onClick={() => setEntered(true)} className="group relative px-8 py-4 bg-white text-black rounded-full text-sm font-bold tracking-[0.2em] uppercase transition-all hover:bg-red-600 hover:text-white hover:scale-105 active:scale-95 shadow-[0_0_20px_rgba(255,255,255,0.3)]">
                Entrar no Sistema
              </button>
            </motion.div>
          </div>
        )}

        {/* SCROLL INDICATOR */}
        {entered && (
          <motion.div style={{ opacity: scrollIndicatorOpacity }} className="fixed bottom-8 left-0 right-0 z-50 flex flex-col items-center pointer-events-none">
            <p className="text-[10px] uppercase tracking-[0.3em] text-zinc-500 mb-2">Compare e Decida</p>
            <motion.div animate={{ y: [0, 10, 0] }} transition={{ repeat: Infinity, duration: 2 }}><ChevronDown className="text-white/50" /></motion.div>
          </motion.div>
        )}

        {/* MAIN CONTENT (HIPERCONVERSÃO) */}
        {entered && (
          <div className="w-full max-w-5xl mx-auto px-4 md:px-6 py-24 pb-48 space-y-32">
            
            {/* HERO */}
            <motion.div style={{ opacity: opacityHero, y: yHero }} className="min-h-[60vh] flex flex-col justify-center items-center text-center">
              <h2 className="text-4xl md:text-7xl font-bold tracking-tighter mb-6 leading-tight">
                Pare de gastar fortunas <br /> em sites <span className="text-red-500">obsoletos.</span>
              </h2>
              <p className="text-lg md:text-2xl text-zinc-400 max-w-3xl font-light">
                A tecnologia mudou. Por que você ainda pagaria R$ 3.000 em um site estático? Assine o futuro.
              </p>
            </motion.div>

            {/* SEÇÃO DE HIPERCONVERSÃO: COMPARATIVO */}
            <div className="relative">
              <div className="text-center mb-12">
                <h3 className="text-3xl font-bold mb-4">A Realidade do Mercado</h3>
                <p className="text-zinc-400">Compare e veja por que o modelo antigo morreu.</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* O ELES (RUIM) */}
                <div className="p-8 rounded-3xl border border-white/5 bg-white/5 backdrop-blur-sm opacity-70 grayscale transition-all hover:grayscale-0">
                  <h4 className="text-xl font-bold mb-6 text-zinc-400">Agências Tradicionais</h4>
                  <ul className="space-y-4">
                    <ComparativoItem ruim text="Investimento: R$ 2.000 a R$ 5.000" />
                    <ComparativoItem ruim text="Prazo: 30 a 60 dias" />
                    <ComparativoItem ruim text="Atualizações: Cobradas por hora" />
                    <ComparativoItem ruim text="Suporte: Lento e burocrático" />
                    <ComparativoItem ruim text="Tecnologia: Wordpress (Lento)" />
                  </ul>
                </div>

                {/* O UI Z (BOM) */}
                <div className="relative p-8 rounded-3xl border border-red-500/50 bg-gradient-to-b from-red-900/20 to-black backdrop-blur-md shadow-[0_0_50px_rgba(239,68,68,0.1)] transform md:scale-105">
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-red-600 text-white px-4 py-1 rounded-full text-xs font-bold uppercase tracking-widest shadow-lg">
                    A Escolha Inteligente
                  </div>
                  <h4 className="text-2xl font-bold mb-6 text-white flex items-center gap-2"><Zap className="text-yellow-400 fill-yellow-400" size={20}/> Assinatura UI Z</h4>
                  <ul className="space-y-4">
                    <ComparativoItem bom text="Implantação: Apenas R$ 100,00" />
                    <ComparativoItem bom text="Prazo: Publicação Imediata" />
                    <ComparativoItem bom text="Atualizações: Ilimitadas e Inclusas" />
                    <ComparativoItem bom text="Suporte: VIP via WhatsApp" />
                    <ComparativoItem bom text="Tecnologia: React (Ultra Rápido)" />
                  </ul>
                  <a href={WHATSAPP_LINK} target="_blank" className="mt-8 block w-full bg-white text-black font-bold py-3 rounded-xl text-center hover:bg-red-500 hover:text-white transition-all">
                    Quero essa Vantagem
                  </a>
                </div>
              </div>
            </div>

            {/* BENTO GRID (RECURSOS) */}
            <div>
              <h3 className="text-3xl font-bold mb-12 text-center">Tudo Incluso na Assinatura</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <BentoCard title="Zero Dor de Cabeça" icon={<Shield className="mb-4 text-red-500"/>}>
                  Esqueça hospedagem, domínios, SSL e bugs. Nós cuidamos da parte chata técnica. Você foca em vender.
                </BentoCard>
                <BentoCard title="Design de Alta Conversão" icon={<Zap className="mb-4 text-red-500"/>}>
                  Layouts pensados psicologicamente para transformar visitantes em clientes no WhatsApp.
                </BentoCard>
                <BentoCard title="Atualizações Infinitas" icon={<Clock className="mb-4 text-red-500"/>} highlight>
                  Mudou o preço? Trocou de foto? Mande um zap e nós atualizamos. Sem taxas surpresas.
                </BentoCard>
                <BentoCard title="Velocidade Extrema" icon={<Zap className="mb-4 text-red-500"/>}>
                  Seu site carrega instantaneamente. O Google ama, seus clientes amam e você vende mais.
                </BentoCard>
              </div>
            </div>

            {/* PRICING (FINAL) */}
            <div className="flex flex-col items-center text-center bg-zinc-900/50 border border-white/10 rounded-3xl p-8 md:p-16 backdrop-blur-xl">
              <h3 className="text-zinc-400 uppercase tracking-widest text-sm font-bold mb-4">Oferta Especial</h3>
              <div className="flex items-baseline gap-2 mb-2">
                 <span className="text-2xl text-zinc-500 line-through">R$ 3.000</span>
                 <span className="text-6xl font-bold text-white">R$ 100</span>
              </div>
              <p className="text-zinc-400 mb-8">Taxa única de implantação + R$ 49,90/mês</p>
              
              <div className="flex flex-col md:flex-row gap-4 w-full max-w-md">
                <a href={PAYMENT_LINK} target="_blank" className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-red-900/20">
                  <Check size={20} /> Garantir Minha Vaga
                </a>
                <a href={WHATSAPP_LINK} target="_blank" className="flex-1 bg-white/10 hover:bg-white/20 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 transition-all">
                  <MessageCircle size={20} /> Tirar Dúvidas
                </a>
              </div>
              <p className="mt-6 text-xs text-zinc-600">Garantia de 7 dias ou seu dinheiro de volta.</p>
            </div>

          </div>
        )}
      </div>
    </div>
  );
}

// --- SUB-COMPONENTES ---
function BentoCard({ title, children, highlight, icon }) {
  return (
    <div className={`p-8 rounded-3xl border ${highlight ? "border-red-500/30 bg-red-900/10" : "border-white/10 bg-white/5"} backdrop-blur-lg hover:bg-white/10 transition-colors`}>
      {icon}
      <h3 className={`text-xl font-bold mb-2 ${highlight ? "text-red-400" : "text-white"}`}>{title}</h3>
      <p className="text-zinc-400 text-sm leading-relaxed">{children}</p>
    </div>
  );
}

function ComparativoItem({ text, bom, ruim }) {
  return (
    <li className="flex items-center gap-3 text-sm md:text-base">
      {bom && <div className="bg-green-500/20 p-1 rounded-full"><Check size={14} className="text-green-500" /></div>}
      {ruim && <div className="bg-red-500/10 p-1 rounded-full"><X size={14} className="text-red-500" /></div>}
      <span className={ruim ? "text-zinc-500 line-through decoration-red-500/50" : "text-zinc-200"}>{text}</span>
    </li>
  );
}
