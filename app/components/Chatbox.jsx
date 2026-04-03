"use client";
import { useState, useEffect, useRef, memo, useCallback } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { FaArrowRight } from "react-icons/fa6";
import { useMessage } from "../contexts/MessageContext";
import { cn } from "../styles/spacing";

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

    return () => {
      window.cancelAnimationFrame(frameId);
    };
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

    return () => {
      window.clearInterval(interval);
    };
  }, []);

  const getResponse = useCallback(async (question) => {
    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question }),
      });

      if (!response.ok) {
        throw new Error(`API responded with status: ${response.status}`);
      }

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
      if (!trimmed || isLoading) {
        return;
      }

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
        console.error("Error in askQuestion:", error);
        setMessages((prevMessages) =>
          prevMessages.map((msg, idx) =>
            idx === prevMessages.length - 1
              ? {
                  question: trimmed,
                  answer: "Sorry, something went wrong. Please try again.",
                }
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
    <div className="flex h-full w-full flex-col rounded-2xl border border-white/15 bg-black/35 text-[#f5efe8]">
      <div className="border-b border-white/10 px-4 py-3">
        <p className="font-hero-serif text-base font-semibold">Ask Vedant</p>
        <p className="mt-1 text-sm text-white/75">
          Quick questions, project details, work experience, or contact info.
        </p>
      </div>

      <div className="border-b border-white/10 px-4 py-3">
        <p className="font-hero-serif text-xs uppercase tracking-[0.2em] text-white/70">
          Fun Fact
        </p>
        <div className="mt-1 min-h-[22px] overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.p
              key={factIndex}
              className="font-hero-serif text-sm text-white/90"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.35, ease: "easeOut" }}
            >
              {funFacts[factIndex]}
            </motion.p>
          </AnimatePresence>
        </div>
      </div>

      <div className="border-b border-white/10 px-4 py-3">
        <div className="flex flex-wrap gap-2">
          {starterQuestions.map((question) => (
            <button
              key={question}
              type="button"
              onClick={() => askQuestion(question)}
              disabled={isLoading}
              className="rounded-lg border border-white/20 bg-white/5 px-3 py-1.5 text-xs text-white/90 transition-colors hover:bg-white/10 disabled:opacity-60"
            >
              {question}
            </button>
          ))}
        </div>
      </div>

      <div
        ref={chatboxRef}
        className={cn(
          "flex-1 space-y-4 px-4 py-4",
          isAutoIntroTyping ? "overflow-y-hidden" : "overflow-y-auto",
        )}
        style={{ scrollBehavior: "smooth" }}
      >
        {messages.length === 0 ? (
          <motion.div
            className="space-y-2"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
          >
            <div className="rounded-xl border border-white/20 bg-white/10 px-3 py-2 text-sm text-white">
              {AUTO_QUESTION}
            </div>
            <div className="rounded-xl border border-white/10 bg-black/25 px-3 py-2 text-sm text-white/90">
              {autoAnswerText}
              {!autoAnswerDone ? (
                <span className="ml-1 inline-block h-[0.9em] w-[2px] animate-pulse bg-white/80 align-middle" />
              ) : null}
            </div>
          </motion.div>
        ) : null}

        {messages.map(({ question, answer }, index) => (
          <div className="space-y-2" key={index}>
            <div className="rounded-xl border border-white/20 bg-white/10 px-3 py-2 text-sm text-white">
              {question}
            </div>
            <div className="rounded-xl border border-white/10 bg-black/25 px-3 py-2 text-sm text-white/90">
              {answer === "Thinking..." ? (
                <span className="text-white/70">Thinking...</span>
              ) : (
                <div dangerouslySetInnerHTML={{ __html: answer }} />
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="border-t border-white/10 px-4 py-3">
        <form className="flex items-center gap-2" onSubmit={handleSubmit}>
          <input
            value={currMsg}
            className="h-10 flex-1 rounded-lg border border-white/15 bg-black/30 px-3 text-sm text-white placeholder:text-white/60 focus:outline-none"
            type="text"
            placeholder="Ask me anything"
            onChange={(e) => setCurrMsg(e.target.value)}
          />
          <button
            type="submit"
            disabled={isLoading}
            className={cn(
              "grid h-10 w-10 place-items-center rounded-lg border border-white/20 bg-white/10 text-white transition-colors",
              isLoading ? "cursor-not-allowed opacity-70" : "hover:bg-white/20",
            )}
          >
            <FaArrowRight className="text-sm" />
          </button>
        </form>
        <div className="mt-3 flex flex-wrap gap-3 text-xs text-white/70">
          <a
            href="https://www.linkedin.com/in/kharevedant05/"
            target="_blank"
            rel="noreferrer"
            className="underline-offset-4 hover:underline"
          >
            LinkedIn
          </a>
          <a
            href="https://github.com/KhareV"
            target="_blank"
            rel="noreferrer"
            className="underline-offset-4 hover:underline"
          >
            GitHub
          </a>
          <a
            href="mailto:kharevedant05@gmail.com"
            className="underline-offset-4 hover:underline"
          >
            Email
          </a>
        </div>
      </div>
    </div>
  );
};

// Memoize the entire ChatBox component to prevent unnecessary re-renders
export default memo(ChatBox);
