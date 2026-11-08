"use client"
import { useState, useRef, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import ReactMarkdown, { type Components } from "react-markdown"
import remarkGfm from "remark-gfm"
import { ExternalLink, Sparkles } from "lucide-react"
import { useChatStore } from "@/stores/chatStore"
import { useGraphStore } from "@/stores/graphStore"
import api from "@/lib/api"

const QUICK_PROMPTS = [
    { label: "🔥 Roast my profile", prompt: "Roast my developer profile. Be brutally honest and funny about my skills." },
    { label: "📚 What to learn next", prompt: "Based on my skill profile, what should I learn next to maximize my career value?" },
    { label: "💼 Interview prep", prompt: "Help me prepare for a tech interview. What are my strongest talking points?" },
    { label: "🗺️ Career roadmap", prompt: "Create a 3-month career acceleration plan based on my current skills and gaps." },
]

/* ──────────────────────────────────────────
   MARKDOWN RENDERING
   The model answers in Markdown. Render it as a
   structured answer instead of raw text.
   ────────────────────────────────────────── */

function AssistantAvatar() {
    return (
        <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-orange-500 to-amber-500 shadow-sm">
            <Sparkles className="h-3.5 w-3.5 text-white" strokeWidth={2.5} />
        </div>
    )
}

function MarkdownHeading({
    children,
    level,
}: {
    children?: React.ReactNode
    level: 1 | 2 | 3 | 4
}) {
    const size = level === 1 ? "text-[15px]" : level === 2 ? "text-[14px]" : "text-[13px]"

    return (
        <div className="mb-2 mt-4 flex items-start gap-2 first:mt-0">
            <span className="mt-[5px] h-3.5 w-[3px] shrink-0 rounded-full bg-gradient-to-b from-orange-400 to-amber-500" />
            <h3 className={`${size} font-extrabold leading-snug tracking-tight text-slate-900`}>
                {children}
            </h3>
        </div>
    )
}

const markdownComponents: Components = {
    h1: ({ children }) => <MarkdownHeading level={1}>{children}</MarkdownHeading>,
    h2: ({ children }) => <MarkdownHeading level={2}>{children}</MarkdownHeading>,
    h3: ({ children }) => <MarkdownHeading level={3}>{children}</MarkdownHeading>,
    h4: ({ children }) => <MarkdownHeading level={4}>{children}</MarkdownHeading>,
    p: ({ children }) => (
        <p className="mb-2.5 text-[13px] leading-[1.65] text-slate-600 last:mb-0">{children}</p>
    ),
    strong: ({ children }) => <strong className="font-bold text-slate-900">{children}</strong>,
    em: ({ children }) => <em className="italic">{children}</em>,
    ul: ({ children }) => (
        <ul className="mb-2.5 list-disc space-y-1 pl-4 marker:text-orange-400">{children}</ul>
    ),
    ol: ({ children }) => (
        <ol className="mb-2.5 list-decimal space-y-1 pl-4 marker:font-bold marker:text-orange-400">
            {children}
        </ol>
    ),
    li: ({ children }) => (
        <li className="pl-0.5 text-[13px] leading-relaxed text-slate-600">{children}</li>
    ),
    a: ({ href, children }) => (
        <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="break-words font-semibold text-orange-600 underline decoration-orange-200 underline-offset-2 transition-colors hover:text-orange-700 hover:decoration-orange-400"
        >
            {children}
            <ExternalLink className="mb-0.5 ml-0.5 inline h-3 w-3" strokeWidth={2.5} />
        </a>
    ),
    code: ({ className, children }) => {
        const isBlock = typeof className === "string" && className.includes("language-")

        if (isBlock) {
            return <code className={`${className} font-mono`}>{children}</code>
        }

        return (
            <code className="rounded-md bg-slate-200/70 px-1.5 py-0.5 font-mono text-[11.5px] font-semibold text-slate-800">
                {children}
            </code>
        )
    },
    pre: ({ children }) => (
        <pre className="mb-3 overflow-x-auto rounded-xl bg-slate-900 p-3 font-mono text-[11.5px] leading-relaxed text-slate-100">
            {children}
        </pre>
    ),
    blockquote: ({ children }) => (
        <blockquote className="mb-2.5 rounded-r-lg border-l-2 border-orange-300 bg-orange-50/60 py-1.5 pl-3 text-[12.5px] italic text-slate-600">
            {children}
        </blockquote>
    ),
    hr: () => <hr className="my-3 border-slate-200" />,
    table: ({ children }) => (
        <div className="mb-3 overflow-x-auto rounded-xl border border-slate-200">
            <table className="w-full border-collapse text-[12px]">{children}</table>
        </div>
    ),
    thead: ({ children }) => <thead className="bg-slate-100/80">{children}</thead>,
    th: ({ children }) => (
        <th className="px-2.5 py-1.5 text-left font-bold text-slate-700">{children}</th>
    ),
    td: ({ children }) => (
        <td className="border-t border-slate-100 px-2.5 py-1.5 text-slate-600">{children}</td>
    ),
}

/* Pull a trailing "Confidence: 85%" line out of the answer so it can be
   rendered as a meter rather than a sentence. The line is removed even when
   the model adds a closing paragraph after it. */
const CONFIDENCE_LINE =
    /^[ \t]*(?:\*\*)?[ \t]*confidence(?:[ \t]+score)?[ \t]*(?:\*\*)?[ \t]*[:\-–—][ \t]*(?:\*\*)?[ \t]*(\d{1,3})[ \t]*%?[ \t]*(?:\*\*)?[ \t]*\.?[ \t]*$/im

function splitConfidence(content: string): { body: string; confidence: number | null } {
    const match = content.match(CONFIDENCE_LINE)
    if (!match || match.index === undefined) return { body: content, confidence: null }

    const body = `${content.slice(0, match.index)}${content.slice(match.index + match[0].length)}`
        .replace(/\n{3,}/g, "\n\n")
        .trim()

    return {
        body,
        confidence: Math.max(0, Math.min(100, Number(match[1]))),
    }
}

function ConfidenceMeter({ value }: { value: number }) {
    return (
        <div className="mt-3 flex items-center gap-2 border-t border-slate-200/80 pt-2.5">
            <span className="shrink-0 text-[9.5px] font-bold uppercase tracking-[0.14em] text-slate-400">
                Confidence
            </span>
            <div className="h-1 flex-1 overflow-hidden rounded-full bg-slate-200">
                <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${value}%` }}
                    transition={{ duration: 0.7, ease: "easeOut" }}
                    className="h-full rounded-full bg-gradient-to-r from-orange-400 to-amber-500"
                />
            </div>
            <span className="shrink-0 text-[11px] font-bold tabular-nums text-slate-700">
                {value}%
            </span>
        </div>
    )
}

export default function CopilotPanel() {
    const { messages, isLoading, addMessage, setLoading } = useChatStore()
    const { analysisEngine } = useGraphStore()
    const [input, setInput] = useState("")
    const scrollRef = useRef<HTMLDivElement>(null)
    const inputRef = useRef<HTMLInputElement>(null)

    // Auto-scroll to bottom
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight
        }
    }, [messages, isLoading])

    // Focus input on mount
    useEffect(() => {
        setTimeout(() => inputRef.current?.focus(), 300)
    }, [])

    const sendMessage = async (text: string) => {
        if (!text.trim() || isLoading) return

        addMessage("user", text.trim())
        setInput("")
        setLoading(true)

        try {
            const history = messages.map((m) => ({
                role: m.role,
                content: m.content,
            }))

            const res = await api.post("/chat/message", {
                message: text.trim(),
                history,
                engine: "orbitx",
                provider: analysisEngine,
            })

            addMessage("assistant", res.data.response)
        } catch (err) {
            addMessage(
                "assistant",
                "Hmm, I'm having trouble connecting. Make sure the backend is running and try again!"
            )
        } finally {
            setLoading(false)
        }
    }

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault()
            sendMessage(input)
        }
    }

    return (
        <div className="flex flex-col h-full bg-white">
            {/* Header */}
            <div className="px-5 pt-5 pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2.5 mb-1">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center shadow-sm">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M12 2L2 7l10 5 10-5-10-5z" />
                            <path d="M2 17l10 5 10-5" />
                            <path d="M2 12l10 5 10-5" />
                        </svg>
                    </div>
                    <div>
                        <h2 className="text-sm font-bold text-slate-900">OrbitX Copilot</h2>
                        <p className="text-[10px] text-slate-400 font-medium">Engine: {analysisEngine === 'openrouter' ? '✦ OpenRouter' : '◎ Ollama'} · uses your real data</p>
                    </div>
                </div>
            </div>

            {/* Messages */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4 space-y-4 scroll-smooth">
                {messages.length === 0 && !isLoading && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-4 pt-2"
                    >
                        <div className="text-center">
                            <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-orange-100 to-amber-50 flex items-center justify-center">
                                <span className="text-2xl">🤖</span>
                            </div>
                            <p className="text-sm font-bold text-slate-900 mb-1">Hey! I&apos;m your AI career coach.</p>
                            <p className="text-xs text-slate-500 leading-relaxed max-w-[260px] mx-auto">
                                I can see your real skills from your analyzed repos. Ask me anything or try a quick prompt:
                            </p>
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                            {QUICK_PROMPTS.map((qp) => (
                                <button
                                    key={qp.label}
                                    onClick={() => sendMessage(qp.prompt)}
                                    className="text-left px-3 py-2.5 rounded-xl border border-slate-200 hover:border-orange-300 hover:bg-orange-50/50 transition-all text-[11px] font-semibold text-slate-600 hover:text-orange-700 leading-tight"
                                >
                                    {qp.label}
                                </button>
                            ))}
                        </div>
                    </motion.div>
                )}

                <AnimatePresence initial={false}>
                    {messages.map((msg, i) => {
                        const isUser = msg.role === "user"
                        const { body, confidence } = isUser
                            ? { body: msg.content, confidence: null }
                            : splitConfidence(msg.content)

                        return (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 8 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
                                className={`flex gap-2.5 ${isUser ? "justify-end" : "justify-start"}`}
                            >
                                {!isUser && <AssistantAvatar />}

                                {isUser ? (
                                    <div className="max-w-[85%] whitespace-pre-wrap rounded-2xl rounded-br-md bg-gradient-to-r from-orange-500 to-orange-600 px-4 py-3 text-[13px] font-medium leading-relaxed text-white">
                                        {body}
                                    </div>
                                ) : (
                                    <div className="min-w-0 flex-1 rounded-2xl rounded-bl-md border border-slate-200/80 bg-[#FAFAFB] px-4 py-3.5">
                                        {body.trim() && (
                                            <ReactMarkdown
                                                remarkPlugins={[remarkGfm]}
                                                components={markdownComponents}
                                            >
                                                {body}
                                            </ReactMarkdown>
                                        )}
                                        {confidence !== null && <ConfidenceMeter value={confidence} />}
                                    </div>
                                )}
                            </motion.div>
                        )
                    })}
                </AnimatePresence>

                {/* Typing indicator */}
                {isLoading && (
                    <motion.div
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex justify-start gap-2.5"
                    >
                        <AssistantAvatar />
                        <div className="flex items-center gap-1.5 rounded-2xl rounded-bl-md border border-slate-200/80 bg-[#FAFAFB] px-4 py-3">
                            <div className="flex gap-1">
                                <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                                <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                                <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                            </div>
                            <span className="text-[11px] text-slate-400 font-medium ml-1">thinking...</span>
                        </div>
                    </motion.div>
                )}
            </div>

            {/* Input */}
            <div className="border-t border-slate-100 p-3">
                <div className="flex items-center gap-2 bg-slate-50 rounded-xl px-3 py-1 border border-slate-200 focus-within:border-orange-300 focus-within:bg-white transition-all">
                    <input
                        ref={inputRef}
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Ask about your skills..."
                        disabled={isLoading}
                        className="flex-1 bg-transparent text-[13px] font-medium text-slate-900 placeholder:text-slate-400 py-2.5 outline-none disabled:opacity-50"
                    />
                    <button
                        onClick={() => sendMessage(input)}
                        disabled={isLoading || !input.trim()}
                        className="w-8 h-8 rounded-lg bg-gradient-to-r from-orange-500 to-orange-600 flex items-center justify-center text-white disabled:opacity-40 hover:from-orange-600 hover:to-orange-700 transition-all shrink-0"
                    >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="22" y1="2" x2="11" y2="13" />
                            <polygon points="22 2 15 22 11 13 2 9 22 2" />
                        </svg>
                    </button>
                </div>
            </div>
        </div>
    )
}
