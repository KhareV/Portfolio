"use client";

import { useState, useEffect, useRef, memo, useCallback } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowUp, Sparkles, Terminal } from "lucide-react";
import { useMessage } from "../contexts/MessageContext";
import { cn } from "../styles/spacing.jsx";

const funFacts = [
  "Started out aiming for civil engineering, explored optometry, and eventually found my edge in full-stack development.",
  "Incoming Software Engineering Intern at Walmart Global Tech (Sparkplug 2026).",
  "Secured 3rd place at the Spectrum National Level Hackathon.",
  "Smart India Hackathon Finalist with MedWE (healthcare + blockchain platform).",
  "Ranked 19th out of 2000+ teams in the Devshouse Hackathon.",
  "District-level football player with a competitive mindset.",
  "Plays the piano with Grade 3 Trinity College London certification.",
  "Builds full-stack + blockchain systems solving real-world problems.",
];

const starterQuestions = [
  "tell me about yourself",
  "what projects have you built?",
  "what are your strongest skills?",
  "how can i contact you?",
];

const AUTO_QUESTION = "tell me about yourself";
const AUTO_ANSWER =
  "hi i am vedant khare. i study computer science at VIT Chennai. i have built 40+ projects, won multiple hackathons, and focus on full-stack development, blockchain, and AI integration.";

const ChatBox = () => {
  const { messages, setMessages } = useMessage();
  const [currMsg, setCurrMsg] = useState("");
  const [factIndex, setFactIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [autoAnswerText, setAutoAnswerText] = useState("");
  const [autoAnswerDone, setAutoAnswerDone] = useState(false);
  const isAutoIntroTyping = messages.length === 0 && !autoAnswerDone;

  const chatboxRef = useRef(null);

  const scrollToBottom = useCallback((behavior = "smooth") => {
    if (chatboxRef.current) {
      const chatContainer = chatboxRef.current;
      chatContainer.scrollTo({
        top: chatContainer.scrollHeight,
        behavior,
      });
    }
  }, []);

  useEffect(() => {
    const frameId = window.requestAnimationFrame(() => {
      scrollToBottom(isAutoIntroTyping ? "auto" : "smooth");
    });
    return () => window.cancelAnimationFrame(frameId);
  }, [messages.length, isLoading, isAutoIntroTyping, scrollToBottom]);

  useEffect(() => {
    if (messages.length > 0) {
      setAutoAnswerDone(true);
      return;
    }

    let intervalId;
    const startDelay = window.setTimeout(() => {
      let cursor = 0;
      intervalId = window.setInterval(() => {
        cursor += 1;
        setAutoAnswerText(AUTO_ANSWER.slice(0, cursor));

        if (cursor >= AUTO_ANSWER.length) {
          window.clearInterval(intervalId);
          setAutoAnswerDone(true);
        }
      }, 20);
    }, 280);

    return () => {
      window.clearTimeout(startDelay);
      window.clearInterval(intervalId);
    };
  }, [messages.length]);

  useEffect(() => {
    const interval = window.setInterval(
      () => setFactIndex((prev) => (prev + 1) % funFacts.length),
      4500,
    );
    return () => window.clearInterval(interval);
  }, []);

  const getResponse = useCallback(async (question) => {
    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question }),
      });

      if (!response.ok) throw new Error(`Status: ${response.status}`);
      const data = await response.json();
      return data.answer;
    } catch (error) {
      console.error("Error fetching response:", error);
      return "Sorry, I am having trouble connecting right now. Please try again in a moment.";
    }
  }, []);

  const askQuestion = useCallback(
    async (questionText) => {
      const trimmed = questionText.trim();
      if (!trimmed || isLoading) return;

      setIsLoading(true);
      setMessages((prev) => [
        ...prev,
        { question: trimmed, answer: "Thinking..." },
      ]);

      try {
        const answer = await getResponse(trimmed);
        setMessages((prevMessages) =>
          prevMessages.map((msg, idx) =>
            idx === prevMessages.length - 1
              ? { question: trimmed, answer }
              : msg,
          ),
        );
      } catch (error) {
        setMessages((prevMessages) =>
          prevMessages.map((msg, idx) =>
            idx === prevMessages.length - 1
              ? { question: trimmed, answer: "Sorry, something went wrong." }
              : msg,
          ),
        );
      } finally {
        setIsLoading(false);
      }
    },
    [getResponse, isLoading, setMessages],
  );

  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault();
      if (currMsg.trim()) {
        const nextQuestion = currMsg;
        setCurrMsg("");
        await askQuestion(nextQuestion);
      }
    },
    [askQuestion, currMsg],
  );

  return (
    <div className="relative flex h-full w-full flex-col overflow-hidden rounded-[2rem] border border-white/10 bg-slate-950/60 shadow-2xl backdrop-blur-2xl">
      {/* Subtle top glow */}
      <div className="absolute inset-x-0 -top-px h-px w-full bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent" />

      {/* HEADER */}
      <div className="flex items-center justify-between border-b border-white/5 bg-white/[0.02] px-6 py-5">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="font-hero-serif text-lg font-medium text-white tracking-wide">
              Ask Vedant
            </h2>
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500"></span>
            </span>
          </div>
          <p className="mt-1 text-xs text-slate-400">
            Ask about projects, skills, or experience.
          </p>
        </div>
        <div className="grid h-10 w-10 place-items-center rounded-full bg-white/5 border border-white/10 shadow-inner">
          <Terminal size={18} className="text-emerald-400" />
        </div>
      </div>

      {/* FUN FACT TICKER */}
      <div className="border-b border-white/5 bg-black/20 px-6 py-3">
        <div className="flex items-center gap-2 mb-1.5">
          <Sparkles size={12} className="text-amber-400" />
          <p className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">
            Fun Fact
          </p>
        </div>
        <div className="min-h-[20px] overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.p
              key={factIndex}
              className="text-sm font-medium text-slate-300 leading-snug"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
            >
              {funFacts[factIndex]}
            </motion.p>
          </AnimatePresence>
        </div>
      </div>

      {/* CHAT AREA */}
      <div
        ref={chatboxRef}
        data-lenis-prevent
        className={cn(
          "flex-1 min-h-0 space-y-6 p-6",
          isAutoIntroTyping ? "overflow-y-hidden" : "overflow-y-auto",
          /* Sleek Custom Scrollbar */
          "[&::-webkit-scrollbar]:w-1.5[&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-white/10 hover:[&::-webkit-scrollbar-thumb]:bg-white/20",
        )}
      >
        {/* AUTO INTRO MESSAGE */}
        {messages.length === 0 ? (
          <motion.div
            className="flex flex-col gap-4"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
          >
            {/* User Bubble */}
            <div className="max-w-[85%] self-end rounded-2xl rounded-tr-sm bg-emerald-500/15 border border-emerald-500/20 px-4 py-2.5 text-[13px] leading-relaxed text-emerald-50 shadow-sm">
              {AUTO_QUESTION}
            </div>
            {/* AI Bubble */}
            <div className="max-w-[85%] self-start rounded-2xl rounded-tl-sm bg-white/5 border border-white/10 px-4 py-2.5 text-[13px] leading-relaxed text-slate-200 shadow-sm backdrop-blur-md">
              {autoAnswerText}
              {!autoAnswerDone && (
                <span className="ml-1 inline-block h-3.5 w-1.5 animate-pulse bg-emerald-400 align-middle rounded-full shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
              )}
            </div>
          </motion.div>
        ) : null}

        {/* ACTUAL MESSAGES */}
        {messages.map(({ question, answer }, index) => (
          <div className="flex flex-col gap-4" key={index}>
            {/* User Bubble */}
            <motion.div
              initial={{
                opacity: 0,
                scale: 0.95,
                transformOrigin: "bottom right",
              }}
              animate={{ opacity: 1, scale: 1 }}
              className="max-w-[85%] self-end rounded-2xl rounded-tr-sm bg-emerald-500/15 border border-emerald-500/20 px-4 py-2.5 text-[13px] leading-relaxed text-emerald-50 shadow-sm"
            >
              {question}
            </motion.div>

            {/* AI Bubble */}
            <motion.div
              initial={{
                opacity: 0,
                scale: 0.95,
                transformOrigin: "bottom left",
              }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 }}
              className="max-w-[85%] self-start rounded-2xl rounded-tl-sm bg-white/5 border border-white/10 px-4 py-3 text-[13px] leading-relaxed text-slate-200 shadow-sm backdrop-blur-md [&>p]:mb-2[&>p:last-child]:mb-0 [&>a]:text-emerald-400 [&>a]:underline[&>a]:underline-offset-2"
            >
              {answer === "Thinking..." ? (
                <div className="flex items-center gap-1.5 h-5 px-1">
                  <motion.div
                    className="h-1.5 w-1.5 rounded-full bg-slate-400"
                    animate={{ y: [0, -4, 0] }}
                    transition={{ duration: 0.6, repeat: Infinity, delay: 0 }}
                  />
                  <motion.div
                    className="h-1.5 w-1.5 rounded-full bg-slate-400"
                    animate={{ y: [0, -4, 0] }}
                    transition={{ duration: 0.6, repeat: Infinity, delay: 0.2 }}
                  />
                  <motion.div
                    className="h-1.5 w-1.5 rounded-full bg-slate-400"
                    animate={{ y: [0, -4, 0] }}
                    transition={{ duration: 0.6, repeat: Infinity, delay: 0.4 }}
                  />
                </div>
              ) : (
                <div dangerouslySetInnerHTML={{ __html: answer }} />
              )}
            </motion.div>
          </div>
        ))}
      </div>

      {/* INPUT AREA */}
      <div className="border-t border-white/5 bg-black/20 p-4 sm:p-6">
        {/* Starter Prompts */}
        <div className="mb-4 flex flex-wrap gap-2">
          {starterQuestions.map((question) => (
            <button
              key={question}
              type="button"
              onClick={() => askQuestion(question)}
              disabled={isLoading}
              className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-[11px] font-medium text-slate-300 transition-all hover:bg-white/10 hover:text-white disabled:opacity-50 active:scale-95"
            >
              {question}
            </button>
          ))}
        </div>

        {/* Input Field */}
        <form className="relative flex items-center" onSubmit={handleSubmit}>
          <input
            value={currMsg}
            className="h-12 w-full rounded-full border border-white/10 bg-black/40 pl-5 pr-12 text-sm text-white placeholder:text-slate-500 shadow-inner focus:border-emerald-500/50 focus:outline-none focus:ring-1 focus:ring-emerald-500/50 transition-all"
            type="text"
            placeholder="Ask me anything..."
            onChange={(e) => setCurrMsg(e.target.value)}
          />
          <button
            type="submit"
            disabled={isLoading || !currMsg.trim()}
            aria-label="Send message"
            className={cn(
              "absolute right-1.5 grid h-9 w-9 place-items-center rounded-full transition-all duration-300",
              currMsg.trim() && !isLoading
                ? "bg-emerald-500 text-white shadow-[0_0_15px_rgba(16,185,129,0.4)] hover:bg-emerald-400"
                : "bg-white/10 text-slate-500 cursor-not-allowed",
            )}
          >
            <ArrowUp size={16} strokeWidth={2.5} />
          </button>
        </form>

        {/* Footer Links */}
        <div className="mt-4 flex flex-wrap justify-center gap-4 text-[11px] font-medium text-slate-500">
          <a
            href="https://www.linkedin.com/in/kharevedant05/"
            target="_blank"
            rel="noreferrer"
            className="transition-colors hover:text-emerald-400"
          >
            LinkedIn
          </a>
          <span className="w-1 h-1 rounded-full bg-slate-700 self-center" />
          <a
            href="https://github.com/KhareV"
            target="_blank"
            rel="noreferrer"
            className="transition-colors hover:text-emerald-400"
          >
            GitHub
          </a>
          <span className="w-1 h-1 rounded-full bg-slate-700 self-center" />
          <a
            href="mailto:kharevedant05@gmail.com"
            className="transition-colors hover:text-emerald-400"
          >
            Email
          </a>
        </div>
      </div>
    </div>
  );
};

export default memo(ChatBox);
