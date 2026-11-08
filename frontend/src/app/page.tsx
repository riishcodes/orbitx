"use client"
import { useRef, useEffect, useState, useCallback, type ReactNode } from "react"
import { useRouter } from "next/navigation"
import {
    motion,
    useTransform,
    useScroll,
    useInView,
    AnimatePresence,
} from "framer-motion"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import { analyzeRepo } from "@/lib/api"
import { useGraphStore } from "@/stores/graphStore"
import DemoLoader from "@/components/layout/DemoLoader"
import { ArrowRight, GitBranch, Cpu, Route, BarChart3, TrendingUp, Layers, Loader2, Play, Check } from "lucide-react"
import type { LucideIcon } from "lucide-react"

/* ──────────────────────────────────────────
   FONT HELPERS
   ────────────────────────────────────────── */
const editorial = "var(--font-editorial), 'Georgia', serif"
const pixel = "var(--font-pixel), monospace"

/* ──────────────────────────────────────────
   ANIMATION CONFIG
   ────────────────────────────────────────── */
const customEase = [0.22, 1, 0.36, 1] as const

const reveal = (delay = 0) => ({
    initial: { opacity: 0, y: 20, filter: "blur(4px)" },
    animate: { opacity: 1, y: 0, filter: "blur(0px)" },
    transition: { duration: 0.8, ease: customEase, delay },
})

const featuresStagger = {
    hidden: {},
    show: { transition: { staggerChildren: 0.07, delayChildren: 0.05 } },
}

const featuresWord = {
    hidden: { opacity: 0, y: "0.55em" },
    show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: customEase } },
}

const featuresUnderline = {
    hidden: { scaleX: 0 },
    show: { scaleX: 1, transition: { duration: 0.8, delay: 0.35, ease: customEase } },
}

/* ──────────────────────────────────────────
   PRELOADER
   ────────────────────────────────────────── */
function Preloader({ onComplete }: { onComplete: () => void }) {
    useEffect(() => {
        const timer = setTimeout(onComplete, 2200) // Let it animate for 2.2s
        return () => clearTimeout(timer)
    }, [onComplete])

    return (
        <motion.div
            key="preloader"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 1.05, filter: "blur(10px)" }}
            transition={{ duration: 0.8, ease: customEase }}
            className={`fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[#FCFCFD] ${GeistSans.className}`}
        >
            <div className="relative">
                {/* Expanding outer ring */}
                <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: [0.8, 1.2, 1.5], opacity: [0, 1, 0] }}
                    transition={{ duration: 2, ease: "easeInOut", times: [0, 0.5, 1] }}
                    className="absolute inset-0 rounded-full border border-orange-200"
                />

                {/* Core logo */}
                <motion.div
                    initial={{ scale: 0.8, opacity: 0, y: 10 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    transition={{ duration: 1, ease: "easeOut" }}
                    className="relative z-10"
                >
                    <span
                        className="text-[26px] sm:text-[34px] font-bold tracking-tight text-center"
                        style={{ fontFamily: pixel, color: "#F97316" }}
                    >
                        OrbitX
                    </span>
                </motion.div>

                {/* Particles */}
                <motion.div
                    className="absolute top-1/2 left-1/2 -ml-1 -mt-1 w-2 h-2 rounded-full bg-orange-400"
                    initial={{ x: 0, y: 0, opacity: 0 }}
                    animate={{ x: 40, y: -40, opacity: [0, 1, 0] }}
                    transition={{ duration: 1.5, delay: 0.2, ease: "easeOut" }}
                />
                <motion.div
                    className="absolute top-1/2 left-1/2 -ml-1 -mt-1 w-1.5 h-1.5 rounded-full bg-amber-400"
                    initial={{ x: 0, y: 0, opacity: 0 }}
                    animate={{ x: -35, y: 25, opacity: [0, 1, 0] }}
                    transition={{ duration: 1.2, delay: 0.4, ease: "easeOut" }}
                />
            </div>

            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.5 }}
                className="mt-8 flex flex-col items-center gap-2"
            >
                <span className={`text-[11px] text-slate-500 font-bold uppercase tracking-[0.2em] ${GeistMono.className}`}>
                    Initializing Environment
                </span>
            </motion.div>
        </motion.div>
    )
}

/* ──────────────────────────────────────────
   ORBIT RING — Ultra Light SVG
   ────────────────────────────────────────── */
function OrbitRing({
    size,
    duration,
    dotSize = 5,
    ringOpacity = 0.08,
    dotColor = "#FB923C",
    reverse = false,
    dashed = false,
}: {
    size: number
    duration: number
    dotSize?: number
    ringOpacity?: number
    dotColor?: string
    reverse?: boolean
    dashed?: boolean
}) {
    const r = size / 2

    return (
        <div
            className="absolute top-1/2 left-1/2 pointer-events-none"
            style={{ width: size, height: size, marginLeft: -r, marginTop: -r }}
        >
            <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="absolute inset-0" fill="none">
                <circle cx={r} cy={r} r={r - 1} stroke={`rgba(249,115,22,${ringOpacity})`} strokeWidth={1} strokeDasharray={dashed ? "4 8" : undefined} />
            </svg>
            <motion.div
                className="absolute inset-0"
                animate={{ rotate: reverse ? [0, -360] : [0, 360] }}
                transition={{ duration, repeat: Infinity, ease: "linear", repeatType: "loop" }}
                style={{ willChange: "transform" }}
            >
                <div
                    className="absolute rounded-full"
                    style={{
                        width: dotSize, height: dotSize, background: dotColor,
                        boxShadow: `0 0 ${dotSize * 2}px ${dotColor}60`,
                        top: 0, left: r - dotSize / 2, transform: `translateY(-${dotSize / 2}px)`,
                    }}
                />
            </motion.div>
        </div>
    )
}

/* ──────────────────────────────────────────
   FEATURE VISUALS — tiny animated previews
   ────────────────────────────────────────── */
function MiniGraphVisual({ active }: { active: boolean }) {
    const hub = { x: 174, y: 98 }
    const satellites = [
        { x: 62, y: 48, r: 7.5, fill: "#FDBA74" },
        { x: 122, y: 26, r: 5.5, fill: "#CBD5E1" },
        { x: 244, y: 30, r: 6.5, fill: "#F97316" },
        { x: 306, y: 82, r: 8.5, fill: "#94A3B8" },
        { x: 284, y: 154, r: 5.5, fill: "#FDBA74" },
        { x: 188, y: 178, r: 7.5, fill: "#CBD5E1" },
        { x: 92, y: 164, r: 6, fill: "#F97316" },
        { x: 34, y: 108, r: 5, fill: "#CBD5E1" },
    ]
    const ring: [number, number][] = [
        [0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 6], [6, 7], [7, 0],
    ]

    return (
        <div className="relative h-full w-full overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] bg-[size:15px_15px] opacity-70" />
            <div className="absolute left-1/2 top-1/2 h-40 w-40 -translate-x-1/2 -translate-y-1/2 rounded-full bg-orange-100/60 blur-2xl" />

            <svg viewBox="0 0 340 200" className="relative h-full w-full" aria-hidden="true">
                {ring.map(([a, b], i) => (
                    <motion.line
                        key={`ring-${i}`}
                        x1={satellites[a].x} y1={satellites[a].y}
                        x2={satellites[b].x} y2={satellites[b].y}
                        stroke="#E2E8F0" strokeWidth={1}
                        initial={{ opacity: 0 }}
                        animate={active ? { opacity: 1 } : {}}
                        transition={{ duration: 0.6, delay: 0.35 + i * 0.05 }}
                    />
                ))}

                {satellites.map((node, i) => (
                    <motion.line
                        key={`spoke-${i}`}
                        x1={hub.x} y1={hub.y} x2={node.x} y2={node.y}
                        stroke="#FDBA74" strokeWidth={1.5} strokeLinecap="round"
                        initial={{ pathLength: 0, opacity: 0 }}
                        animate={active ? { pathLength: 1, opacity: 1 } : {}}
                        transition={{ duration: 0.8, delay: 0.1 + i * 0.06, ease: customEase }}
                    />
                ))}

                <motion.circle
                    cx={hub.x} cy={hub.y} r={20}
                    fill="#FFF7ED" stroke="#FDBA74" strokeWidth={1}
                    initial={{ r: 0, opacity: 0 }}
                    animate={active ? { r: 20, opacity: 1 } : {}}
                    transition={{ type: "spring", stiffness: 220, damping: 20 }}
                />
                <motion.circle
                    cx={hub.x} cy={hub.y} r={8}
                    fill="#F97316"
                    initial={{ r: 0, opacity: 0 }}
                    animate={active ? { r: 8, opacity: 1 } : {}}
                    transition={{ type: "spring", stiffness: 260, damping: 18, delay: 0.1 }}
                />

                {active && (
                    <motion.circle
                        cx={hub.x} cy={hub.y} r={8}
                        fill="none" stroke="#FB923C" strokeWidth={1.5}
                        initial={{ r: 8, opacity: 0.55 }}
                        animate={{ r: [8, 32], opacity: [0.55, 0] }}
                        transition={{ duration: 1.9, repeat: Infinity, ease: "easeOut" }}
                    />
                )}

                {satellites.map((node, i) => (
                    <motion.circle
                        key={`node-${i}`}
                        cx={node.x} cy={node.y} r={node.r}
                        fill={node.fill} stroke="#FFFFFF" strokeWidth={1.5}
                        initial={{ r: 0, opacity: 0 }}
                        animate={active ? { r: node.r, opacity: 1 } : {}}
                        transition={{ type: "spring", stiffness: 260, damping: 20, delay: 0.35 + i * 0.06 }}
                    />
                ))}

                <motion.text
                    x={hub.x} y={hub.y + 34}
                    textAnchor="middle"
                    fill="#94A3B8"
                    style={{ fontSize: 8.5, fontWeight: 700, letterSpacing: 2 }}
                    initial={{ opacity: 0 }}
                    animate={active ? { opacity: 1 } : {}}
                    transition={{ duration: 0.5, delay: 0.6 }}
                >
                    YOU
                </motion.text>
            </svg>

            <div className="absolute left-3 top-3 flex items-center gap-1.5 rounded-full border border-slate-200/80 bg-white/90 px-2 py-1 text-[9px] font-bold text-slate-500 shadow-sm backdrop-blur">
                <span className="h-1.5 w-1.5 rounded-full bg-orange-500" />
                23 skills mapped
            </div>
            <div className="absolute bottom-3 right-3 flex items-center gap-1.5 rounded-full border border-slate-200/80 bg-white/90 px-2 py-1 text-[9px] font-bold text-slate-500 shadow-sm backdrop-blur">
                <GitBranch className="h-2.5 w-2.5 text-orange-500" />
                repo:Myorbits
            </div>
        </div>
    )
}

function GapVisual({ active }: { active: boolean }) {
    const rows = [
        { name: "React", you: 80, need: 60, gap: false },
        { name: "SQL", you: 12, need: 85, gap: true },
        { name: "Node.js", you: 18, need: 78, gap: true },
    ]

    return (
        <div className="flex h-full w-full flex-col justify-center px-4 py-4">
            <div className="mb-3.5 flex items-center justify-between gap-2">
                <span className="rounded-full border border-slate-200 bg-white px-2 py-0.5 text-[8.5px] font-bold uppercase tracking-[0.12em] text-slate-500">
                    Full Stack Developer
                </span>
                <span className="flex items-center gap-1.5 rounded-full border border-orange-200 bg-orange-50 px-2 py-0.5 text-[8.5px] font-bold text-orange-600">
                    <span className="relative flex h-1.5 w-1.5">
                        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-orange-400 opacity-75" />
                        <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-orange-500" />
                    </span>
                    2 gaps
                </span>
            </div>

            <div className="space-y-3">
                {rows.map((row, i) => (
                    <div key={row.name}>
                        <div className="mb-1 flex items-baseline justify-between">
                            <span className={`text-[10.5px] font-bold ${row.gap ? "text-slate-900" : "text-slate-500"}`}>
                                {row.name}
                            </span>
                            <span className={`text-[8.5px] font-bold uppercase tracking-[0.14em] ${row.gap ? "text-orange-600" : "text-emerald-600"}`}>
                                {row.gap ? "learn next" : "covered"}
                            </span>
                        </div>
                        <div className="relative h-1.5 rounded-full bg-slate-200/70">
                            <motion.div
                                className={`h-full rounded-full ${row.gap ? "bg-gradient-to-r from-orange-400 to-orange-500" : "bg-gradient-to-r from-emerald-400 to-emerald-500"}`}
                                initial={{ width: 0 }}
                                animate={active ? { width: `${row.you}%` } : {}}
                                transition={{ duration: 0.9, delay: 0.15 + i * 0.12, ease: customEase }}
                            />
                            <motion.div
                                className="absolute -top-0.5 h-2.5 w-px bg-slate-500/80"
                                style={{ left: `${row.need}%` }}
                                initial={{ opacity: 0 }}
                                animate={active ? { opacity: 1 } : {}}
                                transition={{ duration: 0.4, delay: 0.65 + i * 0.1 }}
                            />
                        </div>
                    </div>
                ))}
            </div>

            <p className="mt-3 flex items-center gap-1.5 text-[9px] font-medium text-slate-400">
                <span className="inline-block h-1.5 w-1.5 rounded-full bg-slate-500/80" />
                marker shows what the role expects
            </p>
        </div>
    )
}

function RoadmapVisual({ active }: { active: boolean }) {
    const steps = [
        { title: "Foundations", meta: "2 weeks", state: "done" },
        { title: "Build & deploy", meta: "4 weeks", state: "active" },
        { title: "Interview ready", meta: "2 weeks", state: "next" },
    ]

    return (
        <div className="flex h-full w-full flex-col justify-center px-4 py-4">
            <div className="mb-3.5 flex items-center justify-between gap-2">
                <span className="rounded-full border border-slate-200 bg-white px-2 py-0.5 text-[8.5px] font-bold uppercase tracking-[0.12em] text-slate-500">
                    Personalised path
                </span>
                <span className="rounded-full border border-orange-200 bg-orange-50 px-2 py-0.5 text-[8.5px] font-bold text-orange-600">
                    8 weeks
                </span>
            </div>

            <div className="relative pl-7">
                <span className="absolute left-[9px] top-1 bottom-1 w-px bg-slate-200" />
                <motion.span
                    className="absolute left-[9px] top-1 bottom-1 w-px origin-top bg-gradient-to-b from-emerald-400 to-orange-400"
                    initial={{ scaleY: 0 }}
                    animate={active ? { scaleY: 0.58 } : {}}
                    transition={{ duration: 1, delay: 0.2, ease: customEase }}
                />

                <div className="space-y-3">
                    {steps.map((step, i) => (
                        <motion.div
                            key={step.title}
                            className="relative"
                            initial={{ opacity: 0, x: -6 }}
                            animate={active ? { opacity: 1, x: 0 } : {}}
                            transition={{ duration: 0.5, delay: 0.3 + i * 0.15, ease: customEase }}
                        >
                            <span
                                className={`absolute -left-7 top-0.5 flex h-[19px] w-[19px] items-center justify-center rounded-full border ${step.state === "done"
                                    ? "border-emerald-200 bg-emerald-50 text-emerald-600"
                                    : step.state === "active"
                                        ? "border-orange-300 bg-orange-50 text-orange-600"
                                        : "border-slate-200 bg-white text-slate-300"
                                    }`}
                            >
                                {step.state === "done" ? (
                                    <Check className="h-2.5 w-2.5" strokeWidth={3.5} />
                                ) : step.state === "active" ? (
                                    <span className="relative flex h-1.5 w-1.5">
                                        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-orange-400 opacity-75" />
                                        <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-orange-500" />
                                    </span>
                                ) : (
                                    <span className="h-1 w-1 rounded-full bg-slate-300" />
                                )}
                            </span>
                            <p className="text-[10.5px] font-bold text-slate-800">{step.title}</p>
                            <p className="text-[9px] font-medium text-slate-400">{step.meta}</p>
                        </motion.div>
                    ))}
                </div>
            </div>
        </div>
    )
}

function DemandVisual({ active }: { active: boolean }) {
    const bars = [
        { name: "React", value: 95 },
        { name: "Python", value: 92 },
        { name: "TypeScript", value: 90 },
        { name: "Next.js", value: 88 },
        { name: "FastAPI", value: 85 },
    ]

    return (
        <div className="flex h-full w-full flex-col justify-center px-4 py-4">
            <div className="mb-3.5 flex items-center justify-between gap-2">
                <span className="rounded-full border border-slate-200 bg-white px-2 py-0.5 text-[8.5px] font-bold uppercase tracking-[0.12em] text-slate-500">
                    Hiring demand · 2025
                </span>
                <span className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[8.5px] font-bold text-emerald-600">
                    <TrendingUp className="h-2.5 w-2.5" />
                    role benchmarks
                </span>
            </div>

            <div className="space-y-2.5">
                {bars.map((bar, i) => (
                    <div key={bar.name} className="flex items-center gap-3">
                        <span className="w-16 shrink-0 text-right text-[10px] font-semibold text-slate-600">{bar.name}</span>
                        <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-200/60">
                            <motion.div
                                className="h-full rounded-full bg-gradient-to-r from-orange-400 via-orange-400 to-amber-300"
                                initial={{ width: 0 }}
                                animate={active ? { width: `${bar.value}%` } : {}}
                                transition={{ duration: 0.9, delay: 0.15 + i * 0.1, ease: customEase }}
                            />
                        </div>
                        <span className="w-8 shrink-0 text-right text-[10px] font-bold tabular-nums text-slate-500">
                            {bar.value}%
                        </span>
                    </div>
                ))}
            </div>
        </div>
    )
}

/* ──────────────────────────────────────────
   FEATURE TILE
   ────────────────────────────────────────── */
function FeatureTile({
    icon: Icon,
    kicker,
    title,
    desc,
    visual,
    accent = "orange",
    index = 0,
    className = "",
}: {
    icon: LucideIcon
    kicker: string
    title: string
    desc: string
    visual: (active: boolean) => ReactNode
    accent?: "orange" | "slate"
    index?: number
    className?: string
}) {
    const ref = useRef<HTMLDivElement>(null)
    const isInView = useInView(ref, { once: true, margin: "-60px" })
    const accents = accent === "orange"
        ? {
            line: "from-orange-400 via-orange-300 to-transparent",
            icon: "from-orange-500 to-amber-500",
            glow: "group-hover:bg-orange-100/70",
        }
        : {
            line: "from-slate-700 via-slate-400 to-transparent",
            icon: "from-slate-800 to-slate-700",
            glow: "group-hover:bg-slate-100",
        }

    return (
        <motion.article
            ref={ref}
            initial={{ opacity: 0, y: 28 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            whileHover={{ y: -6 }}
            transition={{ duration: 0.7, ease: customEase, delay: index * 0.08 }}
            className={`group relative flex h-full flex-col overflow-hidden rounded-[26px] border border-slate-200/70 bg-white p-6 shadow-[0_1px_2px_rgba(15,23,42,0.04)] transition-colors duration-300 hover:border-orange-200/80 hover:shadow-[0_28px_70px_-30px_rgba(249,115,22,0.35)] sm:p-7 ${className}`}
        >
            <span className={`absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r ${accents.line} opacity-60 transition-opacity duration-300 group-hover:opacity-100`} />
            <span className={`pointer-events-none absolute -right-16 -top-20 h-48 w-48 rounded-full blur-2xl transition-colors duration-500 ${accents.glow}`} />

            <div className="relative flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <span className={`flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ${accents.icon} shadow-sm`}>
                        <Icon className="h-[18px] w-[18px] text-white" strokeWidth={2} />
                    </span>
                    <span className={`text-[9.5px] font-bold uppercase tracking-[0.22em] text-slate-400 ${GeistMono.className}`}>
                        {kicker}
                    </span>
                </div>
                <span className={`text-[10px] font-bold tabular-nums text-slate-300 ${GeistMono.className}`}>
                    {String(index + 1).padStart(2, "0")}
                </span>
            </div>

            <div className="relative mt-5 h-[204px] overflow-hidden rounded-2xl border border-slate-200/70 bg-[#FBFBFD]">
                {visual(isInView)}
            </div>

            <h3 className="relative mt-5 text-[17px] font-bold tracking-tight text-slate-900">{title}</h3>
            <p className="relative mt-2 flex-1 text-[13.5px] leading-relaxed text-slate-500">{desc}</p>

            <div className="relative mt-5 flex items-center gap-1.5 text-[11.5px] font-bold text-slate-400 transition-colors duration-300 group-hover:text-orange-600">
                <span>See it in the demo</span>
                <ArrowRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-0.5" />
            </div>
        </motion.article>
    )
}

/* ──────────────────────────────────────────
   STAT ITEM
   ────────────────────────────────────────── */
function StatItem({
    stat,
    index
}: {
    stat: { value: string; label: string; icon: any }
    index: number
}) {
    const ref = useRef(null)
    const isInView = useInView(ref, { once: true, margin: "-20px" })
    return (
        <motion.div
            ref={ref}
            initial={{ opacity: 0, y: 16 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, ease: customEase, delay: index * 0.1 }}
            className="group flex items-center gap-4 rounded-2xl border border-slate-200/70 bg-[#FCFCFD] px-5 py-5 transition-colors duration-300 hover:border-orange-200/80 hover:bg-orange-50/30"
        >
            <div className="w-11 h-11 rounded-xl bg-orange-50 flex items-center justify-center shrink-0 transition-colors duration-300 group-hover:bg-orange-100/80">
                <stat.icon className="w-5 h-5 text-orange-500" strokeWidth={2} />
            </div>
            <div>
                <p className="text-[19px] font-bold text-slate-900 tracking-tight">{stat.value}</p>
                <p className={`text-[12px] font-bold text-slate-400 uppercase tracking-widest mt-0.5 ${GeistMono.className}`}>{stat.label}</p>
            </div>
        </motion.div>
    )
}

/* ──────────────────────────────────────────
   STEP ITEM
   ────────────────────────────────────────── */
function StepItem({
    item,
    index
}: {
    item: { step: string; icon: any; title: string; desc: string; gradient: string }
    index: number
}) {
    const stepRef = useRef(null)
    const stepInView = useInView(stepRef, { once: true, margin: "-40px" })
    return (
        <motion.div
            ref={stepRef}
            initial={{ opacity: 0, y: 30 }}
            animate={stepInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7, ease: customEase, delay: index * 0.15 }}
            className="relative flex flex-col items-center text-center"
        >
            {/* Step circle */}
            <div className="relative z-10 mb-6">
                <div className={`w-[104px] h-[104px] rounded-full bg-gradient-to-br ${item.gradient} flex items-center justify-center shadow-lg`}>
                    <item.icon className="w-8 h-8 text-white" strokeWidth={1.5} />
                </div>
                {/* Step number badge */}
                <div className={`absolute -top-2 -right-2 w-9 h-9 rounded-full bg-white border-2 border-slate-100 shadow-md flex items-center justify-center`}>
                    <span className={`text-[11px] font-bold text-orange-600 ${GeistMono.className}`}>
                        {item.step}
                    </span>
                </div>
            </div>

            {/* Vertical connector (mobile) */}
            {index < 2 && (
                <div className="md:hidden w-px h-8 bg-gradient-to-b from-orange-200 to-transparent -mt-2 mb-2" />
            )}

            <h3 className="text-xl font-bold text-slate-900 mb-2 tracking-tight">
                {item.title}
            </h3>
            <p className="text-[14px] text-slate-500 leading-relaxed max-w-[260px] font-medium">
                {item.desc}
            </p>
        </motion.div>
    )
}

/* ──────────────────────────────────────────
   MAIN PAGE
   ────────────────────────────────────────── */
export default function LandingPage() {
    const router = useRouter()
    const [isLoading, setIsLoading] = useState(true)
    const [repoUrl, setRepoUrl] = useState("")
    const [analyzing, setAnalyzing] = useState(false)
    const [error, setError] = useState("")
    const [demoLoading, setDemoLoading] = useState(false)
    const demoStartedRef = useRef(false)

    // Scroll parallax (only animate when loaded)
    const { scrollYProgress } = useScroll()
    const heroY = useTransform(scrollYProgress, [0, 0.2], [0, -40])

    // Wake up Render backend (free tier sleeps after inactivity)
    useEffect(() => {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
        fetch(`${apiUrl}/health`).catch(() => {})
    }, [])

    // Skip preloader on repeat visits (state starts true to avoid hydration mismatch)
    useEffect(() => {
        try {
            if (sessionStorage.getItem("myorbits-preloader-seen") === "1") {
                setIsLoading(false)
            }
        } catch { }
    }, [])

    const handlePreloaderComplete = useCallback(() => {
        try {
            sessionStorage.setItem("myorbits-preloader-seen", "1")
        } catch { }
        setIsLoading(false)
    }, [])

    // Lock scroll during preloader / demo
    useEffect(() => {
        if (isLoading || demoLoading) {
            document.body.style.overflow = "hidden"
        } else {
            document.body.style.overflow = "auto"
        }
        return () => { document.body.style.overflow = "auto" }
    }, [isLoading, demoLoading])

    // Kick off the simulated demo flow (seeding runs in the background)
    const startDemo = useCallback(() => {
        if (demoStartedRef.current) return
        demoStartedRef.current = true
        setDemoLoading(true)
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
        fetch(`${apiUrl}/graph/demo`, { method: 'POST' }).catch(() => { })
    }, [])

    const handleDemoComplete = useCallback(() => {
        router.push("/dashboard?demo=true")
    }, [router])

    const handleAnalyze = async () => {
        const url = repoUrl.trim()
        if (!url) {
            setError("Please paste a GitHub repo URL")
            return
        }
        // Basic URL validation
        const isValid = /^(https?:\/\/)?(www\.)?github\.com\/[^/]+\/[^/]+\/?$/.test(url) || /^[^/]+\/[^/]+$/.test(url)
        if (!isValid) {
            setError("Enter a valid GitHub URL (e.g. github.com/user/repo)")
            return
        }
        setError("")
        setAnalyzing(true)
        try {
            const provider = useGraphStore.getState().analysisEngine
            await analyzeRepo(url, provider)
            router.push(`/dashboard?source=repo`)
        } catch (err: any) {
            setError(err?.response?.data?.detail || "Failed to analyze repo. Make sure it's a public repository.")
        } finally {
            setAnalyzing(false)
        }
    }

    return (
        <div id="top" className={`relative w-full bg-[#FCFCFD] overflow-x-hidden selection:bg-orange-100 selection:text-orange-900 ${GeistSans.className}`}>

            <AnimatePresence>
                {isLoading && <Preloader onComplete={handlePreloaderComplete} />}
            </AnimatePresence>

            {demoLoading && <DemoLoader onComplete={handleDemoComplete} />}

            {/* ═══════════ NAVBAR ═══════════ */}
            <motion.nav
                initial={{ opacity: 0, y: -20 }}
                animate={!isLoading ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.6, ease: customEase, delay: 0.2 }}
                className="fixed top-0 inset-x-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200/50"
            >
                <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 sm:h-16 flex items-center justify-between">
                    <div className="flex items-center">
                        <span className="text-[15px] sm:text-[18px] font-bold tracking-tight" style={{ fontFamily: pixel, color: "#F97316" }}>
                            OrbitX
                        </span>
                    </div>
                    <div className="hidden md:flex items-center gap-8">
                        <a href="#features" className="text-[13px] font-medium text-slate-500 hover:text-slate-900 transition-colors">Why it helps</a>
                        <a href="#how-it-works" className="text-[13px] font-medium text-slate-500 hover:text-slate-900 transition-colors">How it Works</a>
                        <button
                            onClick={startDemo}
                            className="group inline-flex items-center gap-1.5 text-[13px] font-bold text-white bg-slate-900 hover:bg-slate-800 px-4 py-2 rounded-full transition-all shadow-sm"
                        >
                            <Play className="w-3 h-3 fill-current text-orange-400 transition-transform duration-200 group-hover:scale-110" />
                            Try Demo
                        </button>
                    </div>
                    {/* Mobile nav button */}
                    <button
                        onClick={startDemo}
                        className="md:hidden inline-flex items-center gap-1 text-[12px] font-bold text-white bg-slate-900 hover:bg-slate-800 px-3 py-1.5 rounded-full transition-colors"
                    >
                        <Play className="w-2.5 h-2.5 fill-current text-orange-400" />
                        Try Demo
                    </button>
                </div>
            </motion.nav>

            {/* ═══════════ HERO ═══════════ */}
            <motion.section
                style={{ y: heroY }}
                className="relative flex flex-col items-center justify-center min-h-screen px-4 sm:px-6 pt-16 sm:pt-20"
            >
                {/* Clean SaaS Background */}
                <div className="absolute inset-0 pointer-events-none">
                    <div className="absolute inset-0 bg-[linear-gradient(to_right,#f1f5f9_1px,transparent_1px),linear-gradient(to_bottom,#f1f5f9_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-40" />
                </div>

                {/* Minimal Orange Blob */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none">
                    <motion.div
                        className="w-[600px] h-[600px] rounded-full"
                        style={{ background: "radial-gradient(circle, rgba(249,115,22,0.06) 0%, transparent 70%)", filter: "blur(60px)" }}
                        animate={{ opacity: [0.7, 1, 0.7] }}
                        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                    />
                </div>

                {/* Smooth Orbits — hide on small screens */}
                <div className="absolute inset-0 hidden sm:flex items-center justify-center pointer-events-none">
                    <OrbitRing size={380} duration={18} dotSize={6} ringOpacity={0.15} dotColor="#F97316" />
                    <OrbitRing size={520} duration={26} dotSize={5} ringOpacity={0.08} dotColor="#FB923C" reverse />
                    <OrbitRing size={680} duration={38} dotSize={4} ringOpacity={0.04} dotColor="#FDBA74" dashed />
                </div>

                <div className="relative z-10 w-full max-w-5xl mx-auto mt-6 sm:mt-10 text-center">
                    {/* Eyebrow */}
                    <motion.div
                        initial={{ opacity: 0, y: 20, filter: "blur(4px)" }}
                        animate={!isLoading ? { opacity: 1, y: 0, filter: "blur(0px)" } : {}}
                        transition={{ duration: 0.8, ease: customEase, delay: 0.1 }}
                    >
                        <div className="inline-flex items-center gap-2.5 mb-7 sm:mb-9 px-4 py-2 rounded-full border border-orange-200/70 bg-white/70 backdrop-blur-sm shadow-sm">
                            <span className="relative flex h-1.5 w-1.5">
                                <span className="absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-70 animate-ping" />
                                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-orange-500" />
                            </span>
                            <span className={`text-[10px] sm:text-[11px] font-bold text-orange-700/90 uppercase tracking-[0.2em] ${GeistMono.className}`}>
                                Your tech career, simplified
                            </span>
                        </div>
                    </motion.div>

                    {/* Headline */}
                    <motion.h1
                        initial={{ opacity: 0, y: 20, filter: "blur(4px)" }}
                        animate={!isLoading ? { opacity: 1, y: 0, filter: "blur(0px)" } : {}}
                        transition={{ duration: 0.8, ease: customEase, delay: 0.2 }}
                        className="mb-5 sm:mb-7"
                    >
                        <span className="block text-slate-900 text-[clamp(2.15rem,5vw,4.5rem)] font-bold leading-[1.06] tracking-[-0.035em]">
                            Stop learning randomly.
                        </span>
                        <span
                            className="mt-1 block pb-2 text-[clamp(2.6rem,6.2vw,5.9rem)] leading-[0.98] tracking-[-0.025em]"
                            style={{ fontFamily: editorial, fontStyle: "italic", color: "#F97316" }}
                        >
                            Find your direction.
                        </span>
                    </motion.h1>

                    {/* Subcopy */}
                    <motion.p
                        initial={{ opacity: 0, y: 20, filter: "blur(4px)" }}
                        animate={!isLoading ? { opacity: 1, y: 0, filter: "blur(0px)" } : {}}
                        transition={{ duration: 0.8, ease: customEase, delay: 0.3 }}
                        className="text-slate-500 text-[15px] sm:text-[18px] leading-relaxed max-w-2xl mx-auto mb-8 sm:mb-10 font-medium tracking-tight"
                    >
                        Turn your GitHub projects into a clear tech career path. Discover your skills, learning resources, career roadmaps, and market demand — all in one place.
                    </motion.p>

                    {/* Repo input + actions */}
                    <motion.div
                        initial={{ opacity: 0, y: 20, filter: "blur(4px)" }}
                        animate={!isLoading ? { opacity: 1, y: 0, filter: "blur(0px)" } : {}}
                        transition={{ duration: 0.8, ease: customEase, delay: 0.38 }}
                        className="max-w-xl mx-auto"
                    >
                        <div
                            className={`group flex items-center rounded-2xl border-2 bg-white/90 p-1.5 shadow-lg transition-all duration-300 ${
                                error
                                    ? "border-red-300 shadow-red-100"
                                    : "border-slate-200/90 shadow-slate-200/40 hover:border-orange-300 focus-within:border-orange-400 focus-within:shadow-orange-100/70"
                            }`}
                        >
                            <div className="flex items-center pl-1.5 sm:pl-2">
                                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-50 text-slate-400 transition-colors duration-300 group-focus-within:bg-orange-50 group-focus-within:text-orange-500">
                                    <GitBranch className="h-[17px] w-[17px]" />
                                </span>
                            </div>
                            <input
                                type="text"
                                value={repoUrl}
                                onChange={(e) => { setRepoUrl(e.target.value); setError("") }}
                                onKeyDown={(e) => { if (e.key === "Enter" && !analyzing) handleAnalyze() }}
                                placeholder="Paste your GitHub repository URL"
                                aria-label="GitHub repository URL"
                                disabled={analyzing}
                                className="flex-1 min-w-0 bg-transparent px-2.5 sm:px-3 py-3 sm:py-3.5 text-[14px] sm:text-[15px] font-medium text-slate-900 placeholder:text-slate-400 outline-none disabled:opacity-50"
                            />
                            <kbd className={`hidden sm:flex items-center rounded-lg border border-slate-200 bg-slate-50 px-2 py-1 mr-1 text-[10px] font-bold text-slate-400 ${GeistMono.className}`}>
                                ↵
                            </kbd>
                        </div>

                        {/* Actions */}
                        <div className="mt-4 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
                            <motion.button
                                whileHover={!analyzing ? { y: -1 } : {}}
                                whileTap={!analyzing ? { scale: 0.98 } : {}}
                                onClick={() => handleAnalyze()}
                                disabled={analyzing}
                                className="group/btn inline-flex w-full sm:w-auto items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 px-7 py-3.5 text-[14px] font-bold text-white shadow-lg shadow-orange-500/20 transition-all duration-200 hover:from-orange-600 hover:to-orange-700 hover:shadow-orange-500/30 disabled:cursor-not-allowed disabled:opacity-70"
                            >
                                {analyzing ? (
                                    <><Loader2 className="w-4 h-4 animate-spin" />Analyzing...</>
                                ) : (
                                    <>
                                        Analyze Repository
                                        <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover/btn:translate-x-0.5" />
                                    </>
                                )}
                            </motion.button>

                            <span className="hidden sm:block h-1 w-1 rounded-full bg-slate-300" aria-hidden="true" />

                            <motion.button
                                whileHover={{ y: -1 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={startDemo}
                                className="group/demo inline-flex w-full sm:w-auto items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-6 py-3.5 text-[14px] font-bold text-slate-700 shadow-sm transition-all duration-200 hover:border-orange-200 hover:bg-orange-50/60 hover:text-orange-700 hover:shadow-md"
                            >
                                <Play className="h-3.5 w-3.5 fill-current text-orange-500" />
                                Explore Demo
                            </motion.button>
                        </div>

                        {error && (
                            <motion.p
                                initial={{ opacity: 0, y: -4 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="mt-3 text-left text-[13px] font-medium text-red-500 pl-2"
                            >
                                {error}
                            </motion.p>
                        )}
                    </motion.div>

                    {/* Tagline */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={!isLoading ? { opacity: 1 } : {}}
                        transition={{ duration: 0.8, ease: customEase, delay: 0.48 }}
                        className="mt-9 sm:mt-11 flex items-center justify-center gap-3"
                    >
                        <span className="h-px w-6 bg-gradient-to-r from-transparent to-orange-200" />
                        <p
                            className="text-[13px] sm:text-[14px] italic text-slate-400 font-medium tracking-wide"
                            style={{ fontFamily: editorial }}
                        >
                            From what you know to what comes next.
                        </p>
                        <span className="h-px w-6 bg-gradient-to-l from-transparent to-orange-200" />
                    </motion.div>
                </div>
            </motion.section>

            {/* ═══════════ STATS ═══════════ */}
            <section className="relative py-12 sm:py-16 bg-white border-y border-slate-200/60">
                <div className="max-w-5xl mx-auto px-4 sm:px-6">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                        {[
                            { value: "Beginner-first", label: "No jargon. No assumptions.", icon: Cpu },
                            { value: "Visual", label: "Finally see what you know", icon: Layers },
                            { value: "Actionable", label: "One clear next step", icon: TrendingUp },
                        ].map((stat, i) => (
                            <StatItem key={stat.label} stat={stat} index={i} />
                        ))}
                    </div>
                </div>
            </section>

            {/* ═══════════ FEATURES ═══════════ */}
            <section id="features" className="relative overflow-hidden bg-[#FCFCFD] px-4 py-16 sm:px-6 sm:py-24 lg:py-32">
                {/* Ambient wash */}
                <div className="pointer-events-none absolute inset-0" aria-hidden="true">
                    <div className="absolute left-1/2 top-0 h-[420px] w-[820px] -translate-x-1/2 rounded-full bg-[radial-gradient(ellipse_at_center,rgba(249,115,22,0.07),transparent_65%)]" />
                    <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-slate-200/80 to-transparent" />
                </div>

                <div className="relative mx-auto max-w-6xl">
                    <motion.div
                        variants={featuresStagger}
                        initial="hidden"
                        whileInView="show"
                        viewport={{ once: true, margin: "-70px" }}
                        className="relative mx-auto max-w-2xl text-center"
                    >
                        <motion.span
                            variants={featuresWord}
                            className={`inline-flex items-center gap-2 rounded-full border border-orange-200/70 bg-orange-50/60 px-3 py-1 text-[9.5px] font-bold uppercase tracking-[0.2em] text-orange-600 ${GeistMono.className}`}
                        >
                            <span className="h-1.5 w-1.5 rounded-full bg-orange-500" />
                            What you get
                        </motion.span>

                        <h2 className="mt-5 flex flex-wrap justify-center gap-x-[0.26em] gap-y-1 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl lg:text-[44px] lg:leading-[1.15]">
                            {["Everything", "you", "need", "to", "stop"].map((word) => (
                                <span key={word} className="inline-block overflow-hidden py-0.5">
                                    <motion.span variants={featuresWord} className="inline-block">
                                        {word}
                                    </motion.span>
                                </span>
                            ))}
                            <span className="relative inline-block overflow-hidden py-0.5">
                                <motion.span
                                    variants={featuresWord}
                                    className="inline-block"
                                    style={{ fontFamily: editorial, fontStyle: "italic", fontWeight: 400, color: "#F97316" }}
                                >
                                    guessing
                                </motion.span>
                                <motion.span
                                    aria-hidden="true"
                                    variants={featuresUnderline}
                                    className="absolute bottom-0 left-0 right-0 h-[3px] origin-left rounded-full bg-gradient-to-r from-orange-400 to-amber-300"
                                />
                            </span>
                        </h2>

                        <motion.p
                            variants={featuresWord}
                            className="mx-auto mt-4 max-w-xl text-[15px] font-medium leading-relaxed text-slate-500 sm:text-[16px]"
                        >
                            No more jumping between random tutorials. See where you are, what&apos;s missing, and what to do next.
                        </motion.p>
                    </motion.div>

                    <div className="mt-11 grid grid-cols-1 gap-5 sm:mt-14 sm:gap-6 md:grid-cols-2 lg:grid-cols-3">
                        <FeatureTile
                            icon={GitBranch}
                            kicker="See your skills"
                            title="3D Skill Graph"
                            desc="Paste a repo and watch your languages, frameworks and tools become a map you can actually read. No jargon, no spreadsheets."
                            accent="orange"
                            index={0}
                            className="lg:col-span-2"
                            visual={(active) => <MiniGraphVisual active={active} />}
                        />
                        <FeatureTile
                            icon={Cpu}
                            kicker="Know the gap"
                            title="Plain-English Gap Analysis"
                            desc="We compare what you've built with the role you want, then name the few skills worth learning next — not a 200-hour list."
                            accent="slate"
                            index={1}
                            visual={(active) => <GapVisual active={active} />}
                        />
                        <FeatureTile
                            icon={Route}
                            kicker="Know the path"
                            title="Beginner-Friendly Roadmap"
                            desc="A phase-by-phase plan that starts where you are, with an official, free resource for every step."
                            accent="slate"
                            index={2}
                            visual={(active) => <RoadmapVisual active={active} />}
                        />
                        <FeatureTile
                            icon={BarChart3}
                            kicker="Know the market"
                            title="Real Market Demand"
                            desc="See which technologies employers actually hire for — before you spend months learning something that won't move your career."
                            accent="orange"
                            index={3}
                            className="lg:col-span-2"
                            visual={(active) => <DemandVisual active={active} />}
                        />
                    </div>
                </div>
            </section>

            {/* ═══════════ HOW IT WORKS ═══════════ */}
            <section id="how-it-works" className="py-16 sm:py-24 lg:py-32 px-4 sm:px-6 bg-white border-y border-slate-200/50">
                <div className="max-w-5xl mx-auto">
                    <div className="text-center mb-20">
                        <motion.h2
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, margin: "-40px" }}
                            transition={{ duration: 0.7, ease: customEase }}
                            className="text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight mb-4"
                        >
                            From confused to{" "}
                            <span style={{ fontFamily: editorial, fontStyle: "italic", fontWeight: 400, color: "#F97316" }}>
                                clear
                            </span>
                        </motion.h2>
                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, margin: "-40px" }}
                            transition={{ duration: 0.7, ease: customEase, delay: 0.1 }}
                            className="text-[17px] text-slate-500 max-w-xl mx-auto font-medium"
                        >
                            No experience needed. No account. Start with a repo you already have.
                        </motion.p>
                    </div>

                    <div className="relative grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-8">
                        {/* Connecting line (desktop) */}
                        <div className="hidden md:block absolute top-[52px] left-[16.67%] right-[16.67%] h-px">
                            <div className="w-full h-full bg-gradient-to-r from-orange-200 via-orange-300 to-orange-200" />
                        </div>

                        {[
                            {
                                step: "01",
                                icon: GitBranch,
                                title: "Connect",
                                desc: "Paste any public GitHub repo — or try the demo with a sample student profile. No setup, no account.",
                                gradient: "from-orange-500 to-amber-500",
                            },
                            {
                                step: "02",
                                icon: Cpu,
                                title: "Understand",
                                desc: "We read your projects and explain what each technology is, where it's used, and why it matters for your goal.",
                                gradient: "from-slate-800 to-slate-700",
                            },
                            {
                                step: "03",
                                icon: Route,
                                title: "Move Forward",
                                desc: "Get your 3D skill map, the gaps for your target role, and a beginner-friendly roadmap you can actually follow.",
                                gradient: "from-orange-500 to-orange-600",
                            },
                        ].map((item, i) => (
                            <StepItem key={item.step} item={item} index={i} />
                        ))}
                    </div>
                </div>
            </section>

            {/* ═══════════ CTA ═══════════ */}
            <section className="py-14 sm:py-24 px-4 sm:px-6 bg-white border-t border-slate-200/50">
                <div className="max-w-4xl mx-auto">
                    <div className="relative overflow-hidden rounded-3xl border border-orange-100 bg-gradient-to-br from-orange-50/80 via-white to-amber-50/50 px-6 py-14 sm:px-12 sm:py-16 text-center shadow-sm">
                        {/* Decorative orbit rings */}
                        <div className="pointer-events-none absolute -top-24 -right-20 h-64 w-64 rounded-full border border-orange-100" aria-hidden="true" />
                        <div className="pointer-events-none absolute -bottom-28 -left-20 h-72 w-72 rounded-full border border-orange-100/70" aria-hidden="true" />

                        <div className="relative">
                            <h2 className="text-3xl sm:text-4xl text-slate-900 font-bold tracking-tight mb-4">
                                Your next step shouldn&apos;t be <span style={{ fontFamily: editorial, fontStyle: "italic", color: "#F97316" }}>a guess.</span>
                            </h2>
                            <p className="text-[15px] sm:text-[17px] text-slate-500 mb-9 sm:mb-10 font-medium max-w-xl mx-auto">
                                Paste a repo or explore the demo. Build your first skill map in minutes — no account required.
                            </p>
                            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center">
                                <motion.button
                                    whileHover={{ y: -1 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={startDemo}
                                    className="group/cta inline-flex w-full sm:w-auto items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 px-7 py-3.5 text-[14px] font-bold text-white shadow-lg shadow-orange-500/20 transition-all duration-200 hover:from-orange-600 hover:to-orange-700 hover:shadow-orange-500/30"
                                >
                                    See Your Skill Map
                                    <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover/cta:translate-x-0.5" />
                                </motion.button>
                                <a
                                    href="#top"
                                    className="inline-flex w-full sm:w-auto items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-6 py-3.5 text-[14px] font-bold text-slate-700 shadow-sm transition-all duration-200 hover:border-orange-200 hover:bg-orange-50/60 hover:text-orange-700 hover:shadow-md"
                                >
                                    <GitBranch className="h-4 w-4 text-orange-500" />
                                    Paste a repository
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ═══════════ FOOTER ═══════════ */}
            <footer className="py-8 bg-slate-50 border-t border-slate-200 border-dashed text-center">
                <p className="text-[13px] font-medium text-slate-500 flex items-center justify-center gap-1.5">
                    &copy; {new Date().getFullYear()} <span style={{ fontFamily: pixel, color: "#F97316" }} className="text-[15px] font-bold ml-1 tracking-tight">OrbitX</span>. Built for students who are still figuring it out.
                </p>
            </footer>
        </div>
    )
}
