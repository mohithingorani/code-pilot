"use client";

import NavBar from "@/components/NavBar2";
import {
  motion,
  useScroll,
  useTransform,
  useSpring,
  AnimatePresence,
} from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

const GITHUB_URL = "https://github.com/mohithingorani/code-pilot";
const LINKEDIN_URL = "https://www.linkedin.com/in/mohithingorani/";

const LANGUAGES = [
  "Python",
  "JavaScript",
  "TypeScript",
  "Java",
  "C++",
  "Markdown",
];

const EASE = [0.22, 1, 0.36, 1] as const;

const features = [
  {
    num: "01",
    title: "Real-time sync",
    desc: "Watch your team's cursors move as it happens. No refresh, no delays, no merge dread.",
    tag: "collaboration",
  },
  {
    num: "02",
    title: "Isolated containers",
    desc: "Every project runs in its own Docker sandbox. Real toolchains, zero blast radius.",
    tag: "execution",
  },
  {
    num: "03",
    title: "Browser-native",
    desc: "Open any project from any browser. Same setup everywhere, nothing to install.",
    tag: "cloud",
  },
  {
    num: "04",
    title: "Built-in terminal",
    desc: "Run npm, git, pip and friends without ever leaving the editor — it's a real shell.",
    tag: "tooling",
  },
  {
    num: "05",
    title: "Instant sharing",
    desc: "Hand someone a link and they're in your workspace. Collaborators join in a click.",
    tag: "sharing",
  },
  {
    num: "06",
    title: "Always saved",
    desc: "Files stream to durable storage as you type. Close the tab, lose nothing.",
    tag: "persistence",
  },
];

const steps = [
  {
    k: "01",
    t: "Spin up a project",
    d: "Pick a language. We seed a starter template and a fresh workspace in seconds.",
  },
  {
    k: "02",
    t: "Code in the browser",
    d: "A full Monaco editor with a file tree, tabs and a live terminal — no local setup.",
  },
  {
    k: "03",
    t: "Run in a container",
    d: "Your code executes inside an isolated Docker container, streamed straight to you.",
  },
];

const faqData = [
  {
    question: "Is my code private?",
    answer:
      "Yes. Your code is encrypted in transit and at rest. Only you and people you explicitly invite can access your projects.",
  },
  {
    question: "What languages are supported?",
    answer:
      "Python, JavaScript, TypeScript, Java, C++, and Markdown today — each with a real toolchain inside its container. More are on the way.",
  },
  {
    question: "Where does my code actually run?",
    answer:
      "Every project gets its own isolated Docker container on our infrastructure. You get a genuine shell, not a sandboxed fake.",
  },
  {
    question: "Do you train AI models on my code?",
    answer:
      "No. We never use your code for training. Your intellectual property stays yours, full stop.",
  },
];

/* ------------------------------------------------------------------ */
/* Primitives                                                          */
/* ------------------------------------------------------------------ */

function MaskLine({
  children,
  delay = 0,
  className = "",
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  return (
    <span className={`block overflow-hidden ${className}`}>
      <motion.span
        className="block"
        initial={{ y: "115%" }}
        animate={{ y: 0 }}
        transition={{ duration: 0.95, delay, ease: EASE }}
      >
        {children}
      </motion.span>
    </span>
  );
}

function Reveal({
  children,
  delay = 0,
  className = "",
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-12%" }}
      transition={{ duration: 0.8, delay, ease: EASE }}
    >
      {children}
    </motion.div>
  );
}

function Marquee({
  items,
  reverse = false,
  duration = "34s",
  className = "",
}: {
  items: React.ReactNode[];
  reverse?: boolean;
  duration?: string;
  className?: string;
}) {
  const Row = ({ ariaHidden }: { ariaHidden?: boolean }) => (
    <div
      aria-hidden={ariaHidden}
      className={`flex shrink-0 items-center ${
        reverse ? "animate-marquee-reverse" : "animate-marquee"
      }`}
    >
      {items.map((it, i) => (
        <span key={i} className="flex items-center">
          {it}
        </span>
      ))}
    </div>
  );
  return (
    <div className={`marquee-pause overflow-hidden ${className}`}>
      <div
        className="flex w-max"
        style={{ ["--marquee-duration" as string]: duration }}
      >
        <Row />
        <Row ariaHidden />
      </div>
    </div>
  );
}

function Typewriter({ phrases }: { phrases: string[] }) {
  const [out, setOut] = useState("");
  const [i, setI] = useState(0);
  const [del, setDel] = useState(false);

  useEffect(() => {
    const full = phrases[i % phrases.length];
    if (!del && out === full) {
      const t = setTimeout(() => setDel(true), 1600);
      return () => clearTimeout(t);
    }
    if (del && out === "") {
      setDel(false);
      setI((v) => v + 1);
      return;
    }
    const t = setTimeout(
      () => {
        setOut((cur) =>
          del ? cur.slice(0, -1) : full.slice(0, cur.length + 1)
        );
      },
      del ? 35 : 75
    );
    return () => clearTimeout(t);
  }, [out, del, i, phrases]);

  return (
    <span>
      {out}
      <span className="caret ml-0.5 inline-block h-[1em] w-[0.55ch] translate-y-[0.12em] bg-acid" />
    </span>
  );
}

/* ------------------------------------------------------------------ */
/* Sections                                                            */
/* ------------------------------------------------------------------ */

function Hero() {
  const router = useRouter();
  const start = () => {
    const token =
      typeof window !== "undefined" ? localStorage.getItem("token") : null;
    router.push(token ? "/dashboard" : "/join");
  };

  return (
    <section className="relative flex min-h-screen flex-col px-5 pt-28 sm:px-8 md:px-12">
      {/* meta row */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.8 }}
        className="flex items-center justify-between font-mono text-[11px] uppercase tracking-[0.25em] text-paper/40"
      >
        <span className="flex items-center gap-2">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-acid" />
          Browser-native IDE
        </span>
        <span className="hidden sm:block">Est. 2026 — v1.0</span>
      </motion.div>

      {/* headline */}
      <div className="flex flex-1 flex-col justify-center py-10">
        <h1 className="font-display text-[clamp(2.7rem,12.5vw,12rem)] font-bold uppercase leading-[0.82] tracking-[-0.035em]">
          <MaskLine delay={0.05}>Code at the</MaskLine>
          <MaskLine delay={0.13}>speed of</MaskLine>
          <MaskLine delay={0.21} className="flex items-baseline">
            <span className="text-acid">thought</span>
            <span className="text-stroke">.</span>
          </MaskLine>
        </h1>
      </div>

      {/* bottom row */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.8, ease: EASE }}
        className="flex flex-col gap-8 border-t border-paper/10 py-7 md:flex-row md:items-end md:justify-between"
      >
        <div className="max-w-md">
          <div className="mb-4 font-mono text-[13px] text-paper/45">
            <span className="text-acid">~/code-pilot</span>{" "}
            <span className="text-paper/30">❯</span>{" "}
            <Typewriter
              phrases={[
                "npm run dev",
                "python main.py",
                "g++ main.cpp -o app",
                "git push origin main",
              ]}
            />
          </div>
          <p className="text-sm leading-relaxed text-paper/55 sm:text-base">
            A real-time collaborative IDE that runs your code in isolated
            containers. Open a browser, start shipping.
          </p>
        </div>

        <div className="flex shrink-0 items-center gap-3">
          <button
            onClick={start}
            className="group flex items-center gap-3 bg-acid px-7 py-4 font-mono text-sm font-medium uppercase tracking-wider text-ink transition-transform hover:-translate-y-0.5"
          >
            Start coding
            <span className="transition-transform group-hover:translate-x-1">
              →
            </span>
          </button>
          <a
            href={GITHUB_URL}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-2 border border-paper/20 px-6 py-4 font-mono text-sm uppercase tracking-wider text-paper/70 transition-colors hover:border-paper/50 hover:text-paper"
          >
            ★ GitHub
          </a>
        </div>
      </motion.div>

      {/* language marquee */}
      <Marquee
        className="border-y border-paper/10 py-4"
        duration="40s"
        items={[...LANGUAGES, "+ more"].flatMap((l, i) => [
          <span
            key={`l-${i}`}
            className="px-6 font-display text-2xl font-medium text-paper/70 sm:text-3xl"
          >
            {l}
          </span>,
          <span key={`s-${i}`} className="text-acid">
            ✦
          </span>,
        ])}
      />
    </section>
  );
}

function Divider() {
  const word = (k: string) => (
    <span className="px-8 font-display text-[clamp(2rem,7vw,5.5rem)] font-bold uppercase leading-none text-ink">
      {k}
    </span>
  );
  const star = <span className="text-2xl text-ink/40">✺</span>;
  return (
    <div className="bg-acid py-5">
      <Marquee
        duration="26s"
        items={[
          word("Zero setup"),
          star,
          word("Real-time"),
          star,
          word("Containers"),
          star,
          word("Ship faster"),
          star,
        ]}
      />
    </div>
  );
}

function Showcase() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const rotate = useTransform(scrollYProgress, [0, 0.5], [16, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.5], [0.88, 1]);
  const y = useTransform(scrollYProgress, [0, 0.5], [80, 0]);

  const code: { n: number; t: React.ReactNode }[] = [
    {
      n: 1,
      t: (
        <>
          <span className="text-paper/35">import</span> {"{ useState }"}{" "}
          <span className="text-paper/35">from</span>{" "}
          <span className="text-acid">"react"</span>
        </>
      ),
    },
    { n: 2, t: <span /> },
    {
      n: 3,
      t: (
        <>
          <span className="text-paper/35">export default function</span>{" "}
          <span className="text-paper/90">Editor</span>() {"{"}
        </>
      ),
    },
    {
      n: 4,
      t: (
        <>
          {"  "}
          <span className="text-paper/35">const</span> [ready, setReady] ={" "}
          <span className="text-paper/35">useState</span>(
          <span className="text-acid">false</span>)
        </>
      ),
    },
    {
      n: 5,
      t: (
        <>
          {"  "}
          <span className="text-paper/35">return</span>{" "}
          <span className="text-paper/55">{"<Workspace ready={ready} />"}</span>
        </>
      ),
    },
    { n: 6, t: <>{"}"}</> },
  ];

  return (
    <section ref={ref} className="relative px-5 py-24 sm:px-8 md:px-12">
      <Reveal className="mb-10 flex items-end justify-between">
        <h2 className="font-display text-[clamp(1.8rem,5vw,3.5rem)] font-bold uppercase leading-[0.9] tracking-tight">
          Your whole
          <br />
          dev box, <span className="text-stroke-acid">on a tab</span>
        </h2>
        <span className="hidden font-mono text-xs uppercase tracking-[0.3em] text-paper/40 sm:block">
          (live preview)
        </span>
      </Reveal>

      <div style={{ perspective: 1400 }}>
        <motion.div
          style={{ rotateX: rotate, scale, y }}
          className="overflow-hidden border border-paper/15 bg-[#0b0b0b] shadow-[0_40px_120px_-40px_rgba(0,0,0,0.9)]"
        >
          {/* title bar */}
          <div className="flex items-center gap-4 border-b border-paper/10 px-4 py-3">
            <div className="flex gap-1.5">
              <span className="h-3 w-3 rounded-full bg-paper/20" />
              <span className="h-3 w-3 rounded-full bg-paper/20" />
              <span className="h-3 w-3 rounded-full bg-acid" />
            </div>
            <span className="font-mono text-xs text-paper/40">
              editor.tsx — code-pilot
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-[180px_1fr]">
            {/* file tree */}
            <div className="hidden flex-col gap-1 border-r border-paper/10 p-4 font-mono text-xs text-paper/40 md:flex">
              <span className="text-paper/30">EXPLORER</span>
              <span className="mt-2 text-paper/55">▾ src</span>
              <span className="pl-3 text-acid">editor.tsx</span>
              <span className="pl-3">workspace.tsx</span>
              <span className="pl-3">terminal.tsx</span>
              <span className="mt-1 text-paper/55">▸ public</span>
              <span className="text-paper/55">package.json</span>
            </div>

            {/* code */}
            <div>
              <div className="flex font-mono text-[13px] leading-7 sm:text-sm">
                <div className="select-none border-r border-paper/5 px-4 py-5 text-right text-paper/20">
                  {code.map((l) => (
                    <div key={l.n}>{l.n}</div>
                  ))}
                </div>
                <div className="overflow-x-auto px-5 py-5 text-paper/80">
                  {code.map((l) => (
                    <div key={l.n} className="whitespace-pre">
                      {l.t}
                    </div>
                  ))}
                </div>
              </div>
              {/* terminal strip */}
              <div className="border-t border-paper/10 px-5 py-3 font-mono text-xs">
                <span className="text-paper/35">~/code-pilot ❯</span>{" "}
                <span className="text-paper/70">npm run dev</span>
                <div className="text-acid/80">
                  → ready on localhost:3000{" "}
                  <span className="caret inline-block h-3 w-1.5 translate-y-0.5 bg-acid/70" />
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

function FeatureList() {
  return (
    <section id="features" className="px-5 sm:px-8 md:px-12">
      <Reveal className="flex items-baseline justify-between border-b border-paper/15 pb-6">
        <h2 className="font-display text-[clamp(2.2rem,8vw,7rem)] font-bold uppercase leading-[0.85] tracking-[-0.03em]">
          What you get
        </h2>
        <span className="font-mono text-xs uppercase tracking-[0.3em] text-paper/40">
          (006)
        </span>
      </Reveal>

      <div>
        {features.map((f, i) => (
          <Reveal key={f.num} delay={(i % 2) * 0.06}>
            <div className="group relative grid grid-cols-[auto_1fr] items-center gap-5 border-b border-paper/10 py-7 transition-colors duration-300 hover:bg-acid sm:grid-cols-[80px_1fr_auto] sm:gap-8 sm:py-9 md:px-4">
              <span className="font-mono text-sm text-paper/30 transition-colors group-hover:text-ink/50">
                {f.num}
              </span>
              <div className="min-w-0">
                <h3 className="font-display text-2xl font-medium uppercase tracking-tight transition-colors group-hover:text-ink sm:text-4xl">
                  {f.title}
                </h3>
                <p className="mt-1 max-w-xl text-sm text-paper/45 transition-colors group-hover:text-ink/70 sm:mt-2">
                  {f.desc}
                </p>
              </div>
              <div className="col-span-2 flex items-center gap-4 sm:col-span-1 sm:justify-end">
                <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-paper/30 transition-colors group-hover:text-ink/50">
                  {f.tag}
                </span>
                <span className="text-2xl text-paper/30 transition-all duration-300 group-hover:translate-x-1 group-hover:text-ink">
                  →
                </span>
              </div>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

function HowItWorks() {
  return (
    <section id="how-it-works" className="px-5 py-24 sm:px-8 md:px-12">
      <Reveal>
        <span className="font-mono text-xs uppercase tracking-[0.3em] text-paper/40">
          (02) — How it works
        </span>
        <h2 className="mt-4 max-w-3xl font-display text-[clamp(1.9rem,6vw,4.5rem)] font-bold uppercase leading-[0.9] tracking-tight">
          Idea to running code in three moves
        </h2>
      </Reveal>

      <div className="mt-14 grid gap-px overflow-hidden border border-paper/10 sm:grid-cols-3">
        {steps.map((s, i) => (
          <Reveal
            key={s.k}
            delay={i * 0.1}
            className="group bg-ink p-7 outline outline-1 outline-paper/10 transition-colors hover:bg-paper/[0.03] sm:p-9"
          >
            <div className="flex items-center justify-between">
              <span className="font-display text-5xl font-bold text-stroke sm:text-7xl">
                {s.k}
              </span>
              <span className="text-acid transition-transform group-hover:translate-x-1">
                →
              </span>
            </div>
            <h3 className="mt-8 font-display text-xl font-medium uppercase tracking-tight sm:text-2xl">
              {s.t}
            </h3>
            <p className="mt-3 text-sm leading-relaxed text-paper/45">{s.d}</p>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

function Faq() {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <section id="faq" className="px-5 py-12 sm:px-8 md:px-12">
      <Reveal className="grid gap-10 md:grid-cols-[0.8fr_1.2fr]">
        <div>
          <span className="font-mono text-xs uppercase tracking-[0.3em] text-paper/40">
            (03) — FAQ
          </span>
          <h2 className="mt-4 font-display text-[clamp(2rem,6vw,4rem)] font-bold uppercase leading-[0.88] tracking-tight">
            Questions,
            <br />
            answered
          </h2>
        </div>

        <div>
          {faqData.map((f, i) => {
            const isOpen = open === i;
            return (
              <div
                key={i}
                className={`border-t border-paper/10 ${
                  i === faqData.length - 1 ? "border-b" : ""
                }`}
              >
                <button
                  onClick={() => setOpen(isOpen ? null : i)}
                  className="flex w-full items-center justify-between gap-4 py-6 text-left"
                >
                  <span
                    className={`font-display text-lg font-medium uppercase tracking-tight transition-colors sm:text-2xl ${
                      isOpen ? "text-acid" : "text-paper/80"
                    }`}
                  >
                    {f.question}
                  </span>
                  <span
                    className={`shrink-0 font-mono text-xl transition-transform ${
                      isOpen ? "rotate-45 text-acid" : "text-paper/40"
                    }`}
                  >
                    +
                  </span>
                </button>
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.35, ease: EASE }}
                      className="overflow-hidden"
                    >
                      <p className="max-w-xl pb-6 text-sm leading-relaxed text-paper/50 sm:text-base">
                        {f.answer}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </Reveal>
    </section>
  );
}

function CtaBand() {
  const router = useRouter();
  const start = () => {
    const token =
      typeof window !== "undefined" ? localStorage.getItem("token") : null;
    router.push(token ? "/dashboard" : "/join");
  };
  return (
    <section className="px-5 py-20 sm:px-8 md:px-12">
      <Reveal>
        <button
          onClick={start}
          className="group block w-full border border-paper/15 bg-acid py-16 text-center transition-colors sm:py-24"
        >
          <span className="font-mono text-xs uppercase tracking-[0.3em] text-ink/60">
            No installs · No config
          </span>
          <span className="mt-4 flex items-center justify-center gap-4 font-display text-[clamp(2.5rem,10vw,9rem)] font-bold uppercase leading-none tracking-[-0.03em] text-ink">
            Start coding
            <span className="transition-transform duration-300 group-hover:translate-x-3">
              →
            </span>
          </span>
        </button>
      </Reveal>
    </section>
  );
}

function Footer() {
  return (
    <footer className="relative overflow-hidden border-t border-paper/10 px-5 pt-16 sm:px-8 md:px-12">
      <div className="flex flex-col justify-between gap-8 md:flex-row md:items-start">
        <div>
          <div className="font-display text-2xl font-bold uppercase tracking-tight">
            Code Pilot
          </div>
          <p className="mt-2 max-w-xs text-sm text-paper/40">
            A real-time, browser-native IDE for people who'd rather ship than
            configure.
          </p>
        </div>
        <div className="flex gap-12 font-mono text-sm">
          <div className="flex flex-col gap-3">
            <span className="text-paper/30 uppercase tracking-[0.2em] text-[11px]">
              Product
            </span>
            <a href="#features" className="text-paper/60 hover:text-acid">
              Features
            </a>
            <a href="#how-it-works" className="text-paper/60 hover:text-acid">
              How it works
            </a>
            <a href="#faq" className="text-paper/60 hover:text-acid">
              FAQ
            </a>
          </div>
          <div className="flex flex-col gap-3">
            <span className="text-paper/30 uppercase tracking-[0.2em] text-[11px]">
              App
            </span>
            <a href="/join" className="text-paper/60 hover:text-acid">
              Join
            </a>
            <a href="/dashboard" className="text-paper/60 hover:text-acid">
              Dashboard
            </a>
          </div>
          <div className="flex flex-col gap-3">
            <span className="text-paper/30 uppercase tracking-[0.2em] text-[11px]">
              Social
            </span>
            <a
              href={GITHUB_URL}
              target="_blank"
              rel="noreferrer"
              className="text-paper/60 hover:text-acid"
            >
              GitHub
            </a>
            <a
              href={LINKEDIN_URL}
              target="_blank"
              rel="noreferrer"
              className="text-paper/60 hover:text-acid"
            >
              LinkedIn
            </a>
          </div>
        </div>
      </div>

      {/* giant wordmark */}
      <div className="pointer-events-none mt-10 select-none">
        <h2 className="font-display text-[clamp(3.5rem,22vw,20rem)] font-bold uppercase leading-[0.78] tracking-[-0.04em] text-stroke">
          Code Pilot
        </h2>
      </div>

      <div className="flex flex-col items-center justify-between gap-2 border-t border-paper/10 py-6 font-mono text-xs text-paper/30 sm:flex-row">
        <span>© 2026 Code Pilot Inc.</span>
        <span>Built for the browser ✦</span>
      </div>
    </footer>
  );
}

/* ------------------------------------------------------------------ */
/* Page                                                                */
/* ------------------------------------------------------------------ */

export default function Home() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 120,
    damping: 30,
    mass: 0.3,
  });

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-ink text-paper">
      <motion.div
        style={{ scaleX }}
        className="fixed left-0 top-0 z-[60] h-0.5 w-full origin-left bg-acid"
      />
      <NavBar />
      <Hero />
      <Divider />
      <Showcase />
      <FeatureList />
      <HowItWorks />
      <Faq />
      <CtaBand />
      <Footer />
    </div>
  );
}
