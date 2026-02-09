import { useMemo, useRef, useState, useEffect } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { MeshTransmissionMaterial, Sparkles, Environment, Float, useScroll } from "@react-three/drei";
import { motion, useScroll as useFramerScroll, useTransform } from "framer-motion";
import * as THREE from "three";
import { Check, X, MessageCircle, ChevronDown, Zap, Shield, Clock, BarChart3, Globe, Smartphone, Rocket, Layers } from "lucide-react";

// --- DETECÇÃO MOBILE ---
const useIsMobile = () => {
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);
  return isMobile;
};

// --- 3D REATIVO ---
function ReactiveLiquidKnot({ entered, setEntered, isMobile }) {
  const knotRef = useRef(null);
  const materialRef = useRef(null);
  const { camera, mouse, viewport } = useThree();
  const lastMouse = useRef({ x: 0, y: 0 });
  const velocity = useRef(0);
  
  const targetPos = useMemo(() => new THREE.Vector3(0, entered ? 0.8 : 0, entered ? (isMobile ? -9 : -5) : 6), [entered, isMobile]);

  useFrame((state, delta) => {
    if (!knotRef.current) return;

    if (!isMobile) {
      // --- LÓGICA DESKTOP ---
      const dx = mouse.x - lastMouse.current.x;
      const dy = mouse.y - lastMouse.current.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      velocity.current = THREE.MathUtils.lerp(velocity.current, dist * 100, 0.1);
      lastMouse.current = { x: mouse.x, y: mouse.y };

      if (materialRef.current) {
        materialRef.current.distortion = THREE.MathUtils.lerp(0.3, 0.8, velocity.current / 5);
        materialRef.current.chromaticAberration = THREE.MathUtils.lerp(1.0, 2.0, velocity.current / 5);
      }
      knotRef.current.rotation.x += delta * 0.1;
      knotRef.current.rotation.y += delta * 0.15;
      
      if (!entered) {
        const targetRotationX = (mouse.y * viewport.height) / 100;
        const targetRotationY = (mouse.x * viewport.width) / 100;
        knotRef.current.rotation.x = THREE.MathUtils.lerp(knotRef.current.rotation.x, targetRotationX, 0.05);
        knotRef.current.rotation.y = THREE.MathUtils.lerp(knotRef.current.rotation.y, targetRotationY, 0.05);
      }
    } else {
      // --- LÓGICA MOBILE ---
      knotRef.current.rotation.y += delta * 0.05;
    }

    camera.position.lerp(targetPos, 0.08);
    const lookAtTarget = entered ? new THREE.Vector3(0, -1, -10) : new THREE.Vector3(0, 0, 0);
    const currentLookAt = new THREE.Vector3(0, 0, -2);
    currentLookAt.lerp(lookAtTarget, 0.08);
    camera.lookAt(currentLookAt);
  });

  const handleInteract = () => { if(!entered) setEntered(true); };

  return (
    <Float speed={isMobile ? 0 : 2} rotationIntensity={isMobile ? 0 : 0.5} floatIntensity={isMobile ? 0 : 0.5}>
      <mesh ref={knotRef} onClick={handleInteract} rotation={[0, 0, 0]} onPointerOver={() => { if(!isMobile) document.body.style.cursor = 'pointer' }} onPointerOut={() => { if(!isMobile) document.body.style.cursor = 'auto' }}>
        <torusKnotGeometry args={[1.8, 0.65, isMobile ? 80 : 150, isMobile ? 24 : 32]} />
        
        {isMobile ? (
          <meshStandardMaterial color="#111" roughness={0.1} metalness={0.9} envMapIntensity={2} />
        ) : (
          <MeshTransmissionMaterial 
            ref={materialRef} 
            backside={true} 
            samples={6} 
            resolution={512} 
            transmission={1} 
            thickness={2.0} 
            roughness={0.0} 
            chromaticAberration={1.5} 
            anisotropy={0.5} 
            distortion={0.3} 
            distortionScale={0.5} 
            color="#ffffff" 
            toneMapped={false} 
          />
        )}
      </mesh>
    </Float>
  );
}

function Scene({ entered, setEntered, isMobile }) {
  return (
    <>
      <Environment preset="city" blur={1} />
      <spotLight position={[-10, 10, 10]} intensity={isMobile ? 20 : 40} color="#ff4d4d" angle={0.5} />
      <spotLight position={[10, -10, -10]} intensity={isMobile ? 20 : 40} color="#4d94ff" angle={0.5} />
      <Sparkles count={isMobile ? 20 : 80} size={isMobile ? 3 : 5} opacity={0.6} scale={15} color="#fff" />
      <ReactiveLiquidKnot entered={entered} setEntered={setEntered} isMobile={isMobile} />
    </>
  );
}

// --- ANIMAÇÃO DE SCROLL ---
function RevealOnScroll({ children, delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-10%" }}
      transition={{ duration: 0.6, delay: delay, ease: "easeOut" }}
    >
      {children}
    </motion.div>
  );
}

// --- SUB-COMPONENTES UI ---
function StatsBar({ delay = 0 }) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }} // Entra vindo de baixo agora
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: delay, duration: 0.5 }}
      // Bordas: tirei o border-b e pus border-t e border-b para ficar como um "rodapé" dessa seção
      className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8 py-6 md:py-8 border-y border-white/10 bg-black/40 backdrop-blur-md rounded-2xl w-full"
    >
      <StatItem number="+500" label="Projetos Entregues" />
      <StatItem number="99%" label="Satisfação" />
      <StatItem number="24h" label="Suporte Médio" />
      <StatItem number="Zero" label="Custo Surpresa" />
    </motion.div>
  );
}
function StatItem({ number, label }) {
  return (
    <div className="text-center">
      <div className="text-2xl md:text-3xl font-bold text-white mb-1">{number}</div>
      <div className="text-[10px] md:text-xs uppercase tracking-widest text-zinc-500">{label}</div>
    </div>
  );
}

function ProcessTimeline() {
  return (
    <div className="py-20 w-full">
      <RevealOnScroll>
        <div className="text-center mb-16">
          <h3 className="text-3xl md:text-4xl font-bold mb-4">Como funciona?</h3>
          <p className="text-zinc-400">Do zero ao site no ar em 3 passos simples.</p>
        </div>
      </RevealOnScroll>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
        <div className="hidden md:block absolute top-12 left-0 w-full h-0.5 bg-gradient-to-r from-red-900/0 via-red-500/50 to-red-900/0 z-0"></div>
        <ProcessStep number="01" title="Assinatura Flash" icon={<Zap className="text-white" />} desc="Você escolhe o plano, faz o pagamento da implantação e libera seu acesso imediato." delay={0.2} />
        <ProcessStep number="02" title="Personalização" icon={<Layers className="text-white" />} desc="Envia sua logo e fotos pelo WhatsApp. Nossa equipe ajusta tudo para sua marca." delay={0.4} />
        <ProcessStep number="03" title="Lançamento" icon={<Rocket className="text-white" />} desc="Conectamos seu domínio e pronto. Seu negócio está online e vendendo." delay={0.6} />
      </div>
    </div>
  );
}
function ProcessStep({ number, title, desc, icon, delay }) {
  return (
    <RevealOnScroll delay={delay}>
      <div className="relative z-10 bg-zinc-900/80 border border-white/10 p-8 rounded-2xl backdrop-blur-md hover:-translate-y-2 transition-transform duration-300">
        <div className="w-12 h-12 bg-red-600 rounded-full flex items-center justify-center mb-6 shadow-lg shadow-red-900/50 text-xl font-bold">
          {icon}
        </div>
        <div className="text-red-500 text-xs font-bold uppercase tracking-widest mb-2">Passo {number}</div>
        <h4 className="text-xl font-bold text-white mb-4">{title}</h4>
        <p className="text-zinc-400 text-sm leading-relaxed">{desc}</p>
      </div>
    </RevealOnScroll>
  );
}
function FAQSection() {
  return (
    <div className="py-20 max-w-3xl mx-auto w-full">
      <RevealOnScroll>
        <h3 className="text-3xl font-bold mb-12 text-center">Perguntas Frequentes</h3>
      </RevealOnScroll>
      <div className="space-y-4">
        <RevealOnScroll delay={0.1}><FAQItem question="Preciso pagar hospedagem separada?" answer="Não! A hospedagem premium já está inclusa no valor de R$ 49,90. Você economiza cerca de R$ 400 por ano só nisso." /></RevealOnScroll>
        <RevealOnScroll delay={0.2}><FAQItem question="O domínio (www) está incluso?" answer="O domínio é o único custo externo (cerca de R$ 40/ano no Registro.br), mas nós configuramos tudo para você gratuitamente." /></RevealOnScroll>
        <RevealOnScroll delay={0.3}><FAQItem question="Posso cancelar quando quiser?" answer="Sim. Não temos fidelidade amarrada. Se seu negócio mudar, você pode cancelar a assinatura sem multas abusivas." /></RevealOnScroll>
        <RevealOnScroll delay={0.4}><FAQItem question="E se eu quiser mudar uma foto depois?" answer="É só chamar no WhatsApp! Pequenas atualizações de texto e imagem são ilimitadas e gratuitas." /></RevealOnScroll>
      </div>
    </div>
  );
}
function FAQItem({ question, answer }) {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="border border-white/10 rounded-xl bg-white/5 overflow-hidden">
      <button onClick={() => setIsOpen(!isOpen)} className="w-full flex items-center justify-between p-6 text-left hover:bg-white/5 transition-colors">
        <span className="font-bold text-zinc-200">{question}</span>
        <ChevronDown className={`transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </button>
      {isOpen && <div className="p-6 pt-0 text-zinc-400 text-sm leading-relaxed border-t border-white/5">{answer}</div>}
    </div>
  );
}
function BentoCard({ title, children, icon }) {
  return (
    <RevealOnScroll>
      <div className="p-8 rounded-3xl border border-white/10 bg-white/5 backdrop-blur-lg hover:bg-white/10 transition-colors duration-300 h-full">
        {icon}
        <h3 className="text-xl font-bold mb-3 text-white">{title}</h3>
        <p className="text-zinc-400 text-sm leading-relaxed">{children}</p>
      </div>
    </RevealOnScroll>
  );
}
function ComparativoItem({ text, bom, ruim }) {
  return (
    <li className="flex items-center gap-4 text-sm md:text-base font-medium">
      {bom && <div className="bg-green-500/20 p-1.5 rounded-full shrink-0"><Check size={16} className="text-green-500" /></div>}
      {ruim && <div className="bg-red-500/10 p-1.5 rounded-full shrink-0"><X size={16} className="text-red-500" /></div>}
      <span className={ruim ? "text-zinc-500 line-through decoration-red-500/40 decoration-2" : "text-zinc-200"}>{text}</span>
    </li>
  );
}

// --- APP PRINCIPAL ---
export default function App() {
  const [entered, setEntered] = useState(false);
  const isMobile = useIsMobile();
  
  const WHATSAPP_LINK = "https://wa.me/5555991844071?text=Ol%C3%A1!%20Vi%20o%20site%20e%20quero%20a%20implanta%C3%A7%C3%A3o%20de%2099,90.";
  const PAYMENT_LINK = "https://payment-link-v3.stone.com.br/pl_zoZrQw9PM6g3Ag2H4sryNejKGJ0WxpXd";

  const handleEnter = () => {
    setEntered(true);
    window.scrollTo(0, 0);
  };

  return (
    <div className="relative w-full min-h-screen bg-black text-white font-sans selection:bg-red-500 selection:text-white overflow-x-hidden">
      
      {/* 3D LAYER */}
      <div className="fixed inset-0 z-0">
        <Canvas 
          dpr={[1, 2]} 
          gl={{ antialias: true, powerPreference: "high-performance" }} 
          camera={{ position: [0, 0, 6], fov: 45 }}
        >
          <color attach="background" args={["#050505"]} />
          <Scene entered={entered} setEntered={handleEnter} isMobile={isMobile} />
        </Canvas>
      </div>

      {/* UI LAYER */}
      <div className={`relative z-10 w-full transition-all duration-1000 ${entered ? "min-h-screen" : "h-screen overflow-hidden"}`}>
        
        {/* TELA DE CAPA */}
        {!entered && (
          <div className="absolute inset-0 flex flex-col items-center justify-end pb-32 px-4 z-50">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center w-full">
              <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-red-500/10 border border-red-500/30 px-4 py-1.5 backdrop-blur-md">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                </span>
                <span className="text-[10px] font-bold uppercase tracking-widest text-red-100">Disponível Agora</span>
              </div>
              <h1 className="text-6xl md:text-9xl font-bold tracking-tighter mb-2 text-white drop-shadow-[0_0_30px_rgba(0,0,0,0.8)]">UI Z</h1>
              <p className="text-zinc-300 mb-8 tracking-[0.3em] text-xs md:text-sm uppercase font-semibold drop-shadow-md">Seu Site Profissional por Assinatura</p>
              <button onClick={handleEnter} className="group relative px-10 py-4 bg-white text-black rounded-full text-sm font-bold tracking-[0.2em] uppercase transition-all hover:bg-red-600 hover:text-white hover:scale-105 active:scale-95 shadow-[0_0_40px_rgba(255,255,255,0.2)] cursor-pointer z-50 pointer-events-auto">
                Clique e Descubra
              </button>
            </motion.div>
          </div>
        )}

        {/* CONTEÚDO SCROLLÁVEL */}
        {entered && (
          <div className="w-full max-w-6xl mx-auto px-4 md:px-6 pb-24 relative pt-12 md:pt-20">
            
            {/* HERO SECTION - INVERTIDA E COMPACTA */}
            <div className="flex flex-col items-center text-center relative z-20 min-h-[500px]">
              
              {/* 1. TEXTO E OFERTA (AGORA VEM PRIMEIRO) */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.8 }}
                className="mb-12 w-full"
              >
                <h2 className="text-3xl md:text-8xl font-bold tracking-tighter mb-6 leading-tight">
                  O Fim dos Sites de <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-orange-500">R$ 3.000 Reais.</span>
                </h2>
                <p className="text-base md:text-2xl text-zinc-300 max-w-3xl mx-auto font-light leading-relaxed mb-8">
                  A tecnologia evoluiu. Assine o futuro da sua presença digital por menos de R$ 50/mês.
                </p>
                <div className="flex flex-col md:flex-row gap-4 justify-center">
                   <a href="#pricing" className="bg-red-600 text-white px-8 py-4 rounded-full font-bold hover:bg-red-700 transition-colors cursor-pointer shadow-lg shadow-red-900/40">Ver Planos</a>
                   <a href={WHATSAPP_LINK} target="_blank" className="bg-white/10 text-white px-8 py-4 rounded-full font-bold hover:bg-white/20 transition-colors cursor-pointer border border-white/5">Falar com Consultor</a>
                </div>
              </motion.div>

              {/* 2. STATS BAR (AGORA VEM DEPOIS) */}
              <StatsBar delay={0.4} />

            </div>

            {/* RESTO DO SITE */}
            
            <div className="py-24 border-b border-white/5 border-t border-white/5">
              <RevealOnScroll>
                <div className="text-center mb-16">
                  <h3 className="text-3xl font-bold mb-4">A Realidade do Mercado</h3>
                  <p className="text-zinc-400">Por que o modelo tradicional de agências está morrendo.</p>
                </div>
              </RevealOnScroll>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                <RevealOnScroll>
                  <div className="p-8 rounded-3xl border border-white/5 bg-zinc-900/40 backdrop-blur-sm grayscale opacity-70 hover:opacity-100 transition-all">
                    <h4 className="text-xl font-bold mb-6 text-zinc-500">Modelo Tradicional</h4>
                    <ul className="space-y-5">
                      <ComparativoItem ruim text="Investimento: R$ 2.000 a R$ 5.000" />
                      <ComparativoItem ruim text="Prazo: 30 a 60 dias" />
                      <ComparativoItem ruim text="Cobrança por Atualizações" />
                      <ComparativoItem ruim text="Tecnologia: Wordpress (Lento)" />
                    </ul>
                  </div>
                </RevealOnScroll>
                <RevealOnScroll delay={0.2}>
                  <div className="relative p-10 rounded-3xl border border-red-500/50 bg-gradient-to-b from-red-950/40 to-black backdrop-blur-md shadow-[0_0_60px_rgba(220,38,38,0.15)] transform md:scale-105">
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-red-600 text-white px-6 py-1 rounded-full text-xs font-bold uppercase tracking-widest shadow-lg">Recomendado</div>
                    <h4 className="text-3xl font-bold mb-8 text-white flex items-center gap-3"><Zap className="text-red-500 fill-red-500" size={28}/> UI Z</h4>
                    <ul className="space-y-5">
                      <ComparativoItem bom text="Implantação: Apenas R$ 99,90" />
                      <ComparativoItem bom text="Entrega: Imediata / Flash" />
                      <ComparativoItem bom text="Atualizações: ILIMITADAS e Grátis" />
                      <ComparativoItem bom text="Tecnologia: React 3D (O Futuro)" />
                    </ul>
                  </div>
                </RevealOnScroll>
              </div>
            </div>

            <ProcessTimeline />

            <div className="py-20 w-full">
              <RevealOnScroll>
                <h3 className="text-3xl font-bold mb-12 text-center">Engine V8 de Performance</h3>
              </RevealOnScroll>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <BentoCard title="Hospedagem AWS" icon={<Shield className="mb-4 text-red-500"/>}>Servidores globais. Seu site carrega rápido em qualquer lugar do mundo.</BentoCard>
                <BentoCard title="Mobile First" icon={<Smartphone className="mb-4 text-red-500"/>}>Desenhado para o dedo, não para o mouse. Navegação perfeita no celular.</BentoCard>
                <BentoCard title="SEO Otimizado" icon={<Globe className="mb-4 text-red-500"/>}>Estrutura de código que o Google ama ler. Suba no ranking mais rápido.</BentoCard>
                <BentoCard title="Design System" icon={<Zap className="mb-4 text-red-500"/>}>Cores, fontes e espaçamentos consistentes para passar autoridade.</BentoCard>
                <BentoCard title="Analytics Ready" icon={<BarChart3 className="mb-4 text-red-500"/>}>Pronto para conectar com Google Analytics e Pixel do Facebook.</BentoCard>
                <BentoCard title="Suporte Humano" icon={<MessageCircle className="mb-4 text-red-500"/>}>Nada de robôs. Fale com gente de verdade no WhatsApp.</BentoCard>
              </div>
            </div>

            <FAQSection />

            <RevealOnScroll>
              <div id="pricing" className="flex flex-col items-center text-center bg-zinc-900/60 border border-white/10 rounded-[3rem] p-8 md:p-20 backdrop-blur-xl relative overflow-hidden mt-20">
                <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-red-500 via-orange-500 to-red-500"></div>
                <h3 className="text-zinc-400 uppercase tracking-[0.2em] text-sm font-bold mb-6">Comece Hoje Mesmo</h3>
                <div className="flex flex-col md:flex-row items-baseline justify-center gap-4 mb-2">
                   <span className="text-2xl text-zinc-600 line-through font-medium">R$ 2.500</span>
                   <div className="text-6xl md:text-8xl font-bold text-white tracking-tighter">R$ 99,90</div>
                </div>
                <p className="text-xl text-zinc-300 mb-10">Taxa única de implantação + R$ 49,90/mês</p>
                <div className="flex flex-col md:flex-row gap-4 w-full max-w-lg">
                  <a href={PAYMENT_LINK} target="_blank" className="flex-1 bg-green-600 hover:bg-green-500 text-white font-bold py-5 rounded-2xl flex items-center justify-center gap-3 transition-all shadow-xl hover:-translate-y-1">
                    <Check size={24} /> Assinar Agora
                  </a>
                  <a href={WHATSAPP_LINK} target="_blank" className="flex-1 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-bold py-5 rounded-2xl flex items-center justify-center gap-3 transition-all">
                    <MessageCircle size={24} /> Tirar Dúvidas
                  </a>
                </div>
                <p className="mt-8 text-zinc-500 text-xs uppercase tracking-widest font-bold">Garantia de 7 dias • Sem Multas • Cancelamento Fácil</p>
              </div>
            </RevealOnScroll>

            <footer className="mt-32 pt-10 border-t border-white/5 text-center text-zinc-600 text-sm">
              <p>© 2024 UI Z. Todos os direitos reservados.</p>
              <p className="mt-2">Feito com tecnologia React 3D.</p>
            </footer>

          </div>
        )}
      </div>
    </div>
  );
}
