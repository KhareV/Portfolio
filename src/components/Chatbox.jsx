"use client";
import { useState, useContext, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Typewriter from "typewriter-effect";
import {
  FaLinkedinIn,
  FaGithub,
  FaEnvelope,
  FaBriefcase,
  FaUsers,
  FaLocationPin,
  FaCalendar,
  FaRocket,
  FaArrowRight,
} from "react-icons/fa6";
import { useMessage } from "../MessageContext";

const ChatBox = () => {
  const { messages, setMessages } = useMessage();

  // ChatBox states
  const [currSection, setCurrSection] = useState(-1);
  const [showResponse, setShowResponse] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [isScrolling, setIsScrolling] = useState(false);
  const [stopAutomatedMessages, setStopAutomatedMessages] = useState(false); // Flag to control automated messages

  // Message input state
  const [currMsg, setCurrMsg] = useState("");
  const [showIcons, setShowIcons] = useState(true);

  // Fun facts state for Time component
  const [factIndex, setFactIndex] = useState(0);

  const chatboxRef = useRef(null);
  const bottomRef = useRef(null);

  // Fun facts array
  const funFacts = [
    "↳ i wanted to be a civil engineer, then an optometrist, now i'm here",
    "↳ i secured 3rd place in the Spectrum National Level Hackathon",
    "↳ i like volleyball and badminton",
    "↳ i made it to the SIH Hackathon finals with my MedWE project",
    "↳ my favourite course so far has been Database Management",
    "↳ i ranked 19th out of 2000+ teams in Devshouse Hackathon",
    "↳ born and raised in Navi Mumbai - I was a school topper",
    "↳ i love volleyball, even if i kind of suck at it",
    "↳ i worked on an AI Travel Recommendation System",
    "↳ i ranked among top 60 teams in multiple hackathons",
  ];

  // Get current date for TopBoxBar
  const currDate = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  const scrollToBottom = () => {
    if (chatboxRef.current && !isScrolling) {
      bottomRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "end",
      });
    }
  };

  // Only scroll to bottom when content changes, not on every render
  useEffect(() => {
    // Only auto-scroll if not currently hovering or manually scrolling
    if (!isHovered && !isScrolling) {
      scrollToBottom();
    }
  }, [currSection, showResponse, messages, isHovered, isScrolling]);

  useEffect(() => {
    const waitBeforeChat = setTimeout(() => setCurrSection(0), 2500);
    return () => clearTimeout(waitBeforeChat);
  }, []);

  // Rotate fun facts
  useEffect(() => {
    const fadeInInterval = setInterval(
      () => setFactIndex((prev) => (prev + 1) % funFacts.length),
      4000
    );
    return () => {
      clearInterval(fadeInInterval);
    };
  }, []);

  // Handle wheel events to prevent propagation when chatbox is scrolled
  const handleWheel = (e) => {
    if (chatboxRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = chatboxRef.current;
      const isAtBottom = scrollTop + clientHeight >= scrollHeight - 10;
      const isAtTop = scrollTop <= 0;

      // Just stop propagation without trying to prevent default
      // This avoids the passive event listener error
      if ((e.deltaY > 0 && !isAtBottom) || (e.deltaY < 0 && !isAtTop)) {
        e.stopPropagation();
        // Removed preventDefault() call which was causing the error
      }

      // Set scrolling state to prevent automatic scrolling while user is manually scrolling
      if (!isScrolling) {
        setIsScrolling(true);

        // Reset scrolling state after user stops scrolling
        const scrollTimeout = setTimeout(() => {
          setIsScrolling(false);
        }, 1000);

        return () => clearTimeout(scrollTimeout);
      }
    }
  };

  // Add passive wheel event listener via useEffect
  useEffect(() => {
    const scrollableDiv = chatboxRef.current;
    if (scrollableDiv) {
      // Add the wheel event listener with the passive option set to false
      const wheelHandler = (e) => handleWheel(e);
      scrollableDiv.addEventListener("wheel", wheelHandler, { passive: true });

      // Cleanup function to remove event listener
      return () => {
        scrollableDiv.removeEventListener("wheel", wheelHandler);
      };
    }
  }, [isScrolling]); // Re-add when isScrolling changes

  // Add touch support for mobile devices
  const handleTouchStart = () => {
    setIsHovered(true); // Treat touch as hover for behavior consistency
  };

  const handleTouchEnd = () => {
    // Set a small delay before resetting hover state to avoid immediate auto-scrolling
    setTimeout(() => {
      setIsHovered(false);
    }, 1500);
  };

  // Handle form submission for new messages
  const getResponse = async () => {
    try {
      // Use the Express server URL instead of relative path
      const response = await fetch(
        "https://portfolio-server-91gu.onrender.com/api/chat",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ question: currMsg }),
        }
      );

      if (!response.ok) {
        throw new Error(`API responded with status: ${response.status}`);
      }

      const data = await response.json();
      return data.answer;
    } catch (error) {
      console.error("Error fetching response:", error);
      // Fallback response if the API call fails
      return "Sorry, I'm having trouble connecting to the server right now. Please try again later or contact Vedant directly at kharevedant05@gmail.com";
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (currMsg.trim()) {
      // Add user question immediately for better UX
      const newMessage = { question: currMsg, answer: "Thinking..." };
      setMessages([...messages, newMessage]);

      // Stop auto predefined messages when user sends their own message
      setCurrSection(999);
      setStopAutomatedMessages(true); // Set flag to stop automated messages

      // Clear input immediately
      const userQuestion = currMsg;
      setCurrMsg("");

      try {
        // Get answer from API
        const answer = await getResponse();

        // Update the message with the real answer
        setMessages((prevMessages) =>
          prevMessages.map((msg, idx) =>
            idx === prevMessages.length - 1
              ? { question: userQuestion, answer }
              : msg
          )
        );
      } catch (error) {
        console.error("Error in handleSubmit:", error);
        // Update with error message if something goes wrong
        setMessages((prevMessages) =>
          prevMessages.map((msg, idx) =>
            idx === prevMessages.length - 1
              ? {
                  question: userQuestion,
                  answer: "Sorry, something went wrong. Please try again.",
                }
              : msg
          )
        );
      }
    }
  };

  // Question component
  const Question = ({ question }) => {
    return (
      <motion.div
        whileHover={{ scale: 1.1, x: 30 }}
        className="flex gap-2 justify-center items-center font-sans bg-dark text-xs sm:text-sm p-3 w-fit rounded-lg shadow-2xl"
      >
        <img src="snoopy.png" className="rounded-full w-6 h-6 object-cover" />
        <h2 className="">{question}</h2>
      </motion.div>
    );
  };

  return (
    <div className="flex flex-col h-full w-full">
      {/* Top Box Bar */}
      <div className="flex justify-center items-center font-sans text-xs sm:text-sm font-bold sm:rounded-t-3xl w-full p-2 bg-accent shadow-2xl gap-4">
        <div className="sm:flex hidden justify-center items-center gap-1">
          <FaRocket /> Software Engineer
        </div>
        <span className="hidden sm:flex">•</span>
        <div className="flex justify-center items-center gap-1">
          <FaLocationPin /> Chennai, India
        </div>
        •
        <div className="flex justify-center items-center gap-1">
          <FaCalendar /> {currDate}
        </div>
      </div>

      <div className="h-[calc(100%-40px)] bg-background/80 backdrop-blur-lg rounded-b-2xl border border-white/10 flex flex-col">
        {/* Head Section - Fixed layout to prevent overlapping */}
        <div className="text-sm sm:text-lg flex flex-col w-full py-4">
          {/* Profile section with fixed positioning */}
          <div className="flex items-start gap-4 px-4">
            {/* Left side - Avatar and resume button */}
            <div className="relative w-24 sm:w-36">
              <motion.div
                initial={{ y: -200, scale: 0 }}
                animate={{ y: 0, scale: 1 }}
                transition={{
                  type: "spring",
                  ease: "easeInOut",
                  duration: 1,
                  delay: 0.5,
                }}
                className="relative"
              >
                <img
                  src="image/avatar.png"
                  alt="profile picture of vedant"
                  className="hover:border-hubspot border-2 border-accent transition hover:duration-300 ease-in-out w-20 h-20 sm:w-32 sm:h-32 rounded-full shadow-2xl object-cover"
                />
                <div className="absolute z-50 bottom-0 right-0">
                  <a
                    href="https://youtu.be/Sn3SUnL44w4?si=35OyaUUAQPh2BnYN&t=7"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{
                        duration: 0.5,
                        delay: 2,
                        ease: "easeInOut",
                      }}
                      className="bg-hubspot rounded-full p-2 border-2 dark:text-foreground text-accent hover:scale-110 transition duration-300 ease-in-out"
                    >
                      <FaBriefcase className="text-sm sm:text-lg" />
                    </motion.div>
                  </a>
                </div>
              </motion.div>
            </div>

            {/* Right side - Name and details */}
            <div className="flex flex-col flex-1">
              <div className="flex flex-col mb-2">
                <motion.div
                  initial={{ y: -100 }}
                  animate={{ y: 0 }}
                  transition={{
                    type: "spring",
                    ease: "easeInOut",
                    delay: 0,
                    duration: 1,
                  }}
                  className="text-lg sm:text-3xl font-medium"
                >
                  hello,
                </motion.div>

                <motion.div
                  initial={{ y: -100 }}
                  animate={{ y: 0 }}
                  transition={{
                    type: "spring",
                    ease: "easeInOut",
                    delay: 0.2,
                    duration: 1,
                  }}
                  className="text-3xl sm:text-5xl font-black"
                >
                  i m vedant khare<span className="font-semibold">.</span>
                </motion.div>
              </div>
            </div>
          </div>

          {/* Fun facts section with fixed height */}
          <motion.div
            initial={{ x: -200, scale: 0 }}
            animate={{ x: 0, scale: 1 }}
            transition={{
              type: "spring",
              ease: "easeInOut",
              delay: 0.6,
              duration: 1,
            }}
            className="hover:border-hubspot border-2 border-accent transition hover:duration-300 ease-in-out bg-dark rounded-lg flex items-center w-full h-16 px-4 mt-4 mx-4"
            style={{ maxWidth: "calc(100% - 2rem)" }}
          >
            <div className="flex items-center gap-2 w-full">
              <img
                src="snoopyicon.png"
                alt="snoopy"
                className="hidden dark:sm:block w-10 h-10"
              />
              <img
                src="snoopydark.png"
                alt="snoopy"
                className="hidden sm:block sm:dark:hidden w-10 h-10"
              />
              <div className="flex flex-col flex-1 overflow-hidden">
                <h1 className="text-xs font-semibold">
                  here's some fun facts about me :{")"}
                </h1>
                <AnimatePresence mode="wait">
                  <motion.div
                    key={factIndex}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.5 }}
                    className="text-sm sm:text-base font-black truncate"
                  >
                    {funFacts[factIndex]}
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{
              type: "spring",
              ease: "easeInOut",
              delay: 1.5,
              duration: 1,
            }}
            className="mt-3 w-full bg-accent h-0.5 rounded-full shadow-3xl"
          />
        </div>

        {/* Chat Messages Area */}
        <div
          ref={chatboxRef}
          className="overflow-y-auto scrollbar scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-transparent flex flex-col justify-left items-start w-full gap-8 text-base sm:text-xl flex-1"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          // Use a ref instead of the onWheel prop for proper passive event handling
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          style={{ scrollBehavior: "smooth" }}
        >
          <div className="space-y-8 w-full px-4 pb-4">
            {/* ===== INTRODUCTION SECTION ===== */}
            {currSection >= 0 && !stopAutomatedMessages && (
              <div className="flex flex-col gap-3 pt-3">
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5, delay: 0.5 }}
                  onAnimationComplete={() => {
                    setShowResponse(showResponse + 1);
                  }}
                >
                  <Question question="tell me about yourself" />
                </motion.div>
                {showResponse >= 1 && (
                  <div className="hover:shadow-2xl hover:p-4 hover:bg-dark rounded-2xl transition-all duration-300 ease-in-out">
                    <Typewriter
                      onInit={(typewriter) => {
                        typewriter
                          .typeString(
                            `hi i'm vedant khare. i study computer science at vellore institute of technology, chennai. i like playing volleyball and badminton, and i'm passionate about full-stack development and blockchain.`
                          )
                          .start()
                          .callFunction(() => {
                            scrollToBottom();
                            if (!stopAutomatedMessages) {
                              setCurrSection(currSection + 1);
                            }
                          });
                      }}
                      options={{
                        delay: 2,
                        cursor: "",
                      }}
                    />
                  </div>
                )}
              </div>
            )}

            {/* ===== PROJECTS SECTION ===== */}
            {currSection >= 1 && !stopAutomatedMessages && (
              <div className="flex flex-col gap-3">
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5, delay: 0.5 }}
                  onAnimationComplete={() => {
                    setShowResponse(showResponse + 1);
                  }}
                >
                  <Question question="how did you get into software development?" />
                </motion.div>

                {showResponse >= 2 && (
                  <div className="hover:shadow-2xl hover:p-4 hover:bg-dark rounded-2xl transition-all duration-300 ease-in-out">
                    <Typewriter
                      onInit={(typewriter) => {
                        typewriter
                          .typeString(
                            `↳ i was always interested in technology and problem-solving`
                          )
                          .typeString(`<br>↳ i participated in 5+ hackathons`)
                          .typeString(
                            `<br>↳ built projects like MedWE and SkillBridge`
                          )
                          .typeString(
                            `<br>↳ currently working as a full-stack developer in college clubs`
                          )
                          .start()
                          .callFunction(() => {
                            scrollToBottom();
                            if (!stopAutomatedMessages) {
                              setCurrSection(currSection + 1);
                            }
                          });
                      }}
                      options={{
                        delay: 2,
                        cursor: "",
                      }}
                    />
                  </div>
                )}
              </div>
            )}

            {/* ===== WORK EXPERIENCE SECTION ===== */}
            {currSection >= 2 && !stopAutomatedMessages && (
              <div className="flex flex-col gap-3">
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5, delay: 0.5 }}
                  onAnimationComplete={() => {
                    setShowResponse(showResponse + 1);
                  }}
                >
                  <Question question="where have you worked before?" />
                </motion.div>

                {showResponse >= 3 && (
                  <div className="hover:shadow-2xl hover:p-4 hover:bg-dark rounded-2xl transition-all duration-300 ease-in-out text-lg">
                    <Typewriter
                      onInit={(typewriter) => {
                        typewriter
                          .typeString(
                            '<span class="font-black text-xl text-center py-0.5 rounded-lg">CodeChef College Chapter</span><span class="ml-2 text-xs font-sans italic rounded-2xl">Aug 2024 - Present</span><br /><span class="bg-dark font-bold border-1 px-2 text-center py-0.5 rounded-lg">Full-Stack Web Engineer</span>'
                          )
                          .typeString(
                            '<br><span class="font-black text-xl text-center py-0.5 rounded-lg">iSpace College Club</span><span class="ml-2 text-xs font-sans italic rounded-2xl">Nov 2024 – Present</span><br /><span class="bg-dark font-bold border-1 px-2 text-center py-0.5 rounded-lg">Full-Stack Web Engineer</span>'
                          )
                          .start()
                          .callFunction(() => {
                            scrollToBottom();
                            if (!stopAutomatedMessages) {
                              setCurrSection(currSection + 1);
                            }
                          });
                      }}
                      options={{
                        delay: 2,
                        cursor: "",
                      }}
                    />
                  </div>
                )}
              </div>
            )}

            {/* ===== PROJECTS SECTION ===== */}
            {currSection >= 3 && !stopAutomatedMessages && (
              <div className="flex flex-col gap-3">
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5, delay: 0.5 }}
                  onAnimationComplete={() => {
                    setShowResponse(showResponse + 1);
                  }}
                >
                  <Question question="what kind of projects have you worked on?" />
                </motion.div>

                {showResponse >= 4 && (
                  <div className="hover:shadow-2xl hover:p-4 hover:bg-dark rounded-2xl transition-all duration-300 ease-in-out">
                    <Typewriter
                      onInit={(typewriter) => {
                        typewriter
                          .typeString(
                            'i\'ve worked on several exciting projects: <br>- MedWE: medicine delivery platform (SIH Finalist)<br>- SkillBridge: educational lending platform with blockchain<br>- Voyageur: AI Travel Recommendation System<br>- PropertyDhundo: Real Estate Marketplace<br>- 3D Portfolio Website using Three.js<br><br>check out my <a href="https://github.com/KhareV" target="_blank" class="italic bg-dark border-1 px-1 py-0.5 rounded-lg">github</a> for more!'
                          )
                          .start()
                          .callFunction(() => {
                            scrollToBottom();
                            if (!stopAutomatedMessages) {
                              setCurrSection(currSection + 1);
                            }
                          });
                      }}
                      options={{
                        delay: 2,
                        cursor: "",
                      }}
                    />
                  </div>
                )}
              </div>
            )}

            {/* ===== CONTACT INFORMATION SECTION ===== */}
            {currSection >= 4 && (
              <div className="flex flex-col gap-3">
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5, delay: 0.5 }}
                  onAnimationComplete={() => {
                    scrollToBottom();
                    setShowResponse(showResponse + 1);
                  }}
                >
                  <Question question="how can i contact you?" />
                </motion.div>

                {showResponse >= 5 && (
                  <div className="hover:shadow-2xl hover:p-4 hover:bg-dark rounded-2xl transition-all duration-300 ease-in-out">
                    <Typewriter
                      onInit={(typewriter) => {
                        typewriter
                          .typeString(
                            'you can reach me at <a href="mailto:kharevedant05@gmail.com" class="italic bg-dark border-1 px-1 py-0.5 rounded-lg">kharevedant05@gmail.com</a>, or connect with me on <a href="https://www.linkedin.com/in/kharevedant05/" target="_blank" class="italic bg-dark border-1 px-1 py-0.5 rounded-lg">linkedin</a>. my phone number is +91 9892031794.'
                          )
                          .start()
                          .callFunction(() => {
                            scrollToBottom();
                            setCurrSection(currSection + 1);
                          });
                      }}
                      options={{
                        delay: 2,
                        cursor: "",
                      }}
                    />
                  </div>
                )}
              </div>
            )}

            {/* ===== ADDITIONAL QUESTIONS SECTION ===== */}
            {currSection >= 5 && (
              <div className="flex flex-col gap-3">
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5, delay: 0.5 }}
                  onAnimationComplete={() => {
                    scrollToBottom();
                    setShowResponse(showResponse + 1);
                  }}
                >
                  <Question question="i want to ask you more questions tho ..." />
                </motion.div>

                {showResponse >= 6 && (
                  <div className="hover:shadow-2xl hover:p-4 hover:bg-dark rounded-2xl transition-all duration-300 ease-in-out">
                    <Typewriter
                      onInit={(typewriter) => {
                        typewriter
                          .typeString("sure, send me a message below then :) ")
                          .start()
                          .callFunction(() => {
                            scrollToBottom();
                            setCurrSection(currSection + 1);
                          });
                      }}
                      options={{
                        delay: 2,
                        cursor: "",
                      }}
                    />
                  </div>
                )}
              </div>
            )}

            {/* User submitted messages */}
            {messages &&
              messages.map(({ question, answer }, index) => {
                return (
                  <div
                    className="flex flex-col gap-3 text-base sm:text-xl"
                    key={index}
                  >
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.5, delay: 0.5 }}
                    >
                      <Question question={question} />
                    </motion.div>
                    <div className="hover:shadow-2xl hover:p-4 hover:bg-dark rounded-2xl transition-all duration-300 ease-in-out">
                      {answer === "Thinking..." ? (
                        <Typewriter
                          onInit={(typewriter) => {
                            typewriter
                              .typeString(answer)
                              .start()
                              .callFunction(() => scrollToBottom());
                          }}
                          options={{
                            delay: 10,
                            cursor: "",
                          }}
                        />
                      ) : (
                        <div dangerouslySetInnerHTML={{ __html: answer }} />
                      )}
                    </div>
                  </div>
                );
              })}
            <div ref={bottomRef} className="h-4" />
          </div>
        </div>

        {/* Message Input Bar */}
        <div className="flex w-full gap-2 text-2xl mt-auto px-4 py-3">
          <motion.div
            initial={{ y: 100 }}
            animate={{ y: 0 }}
            transition={{
              type: "spring",
              ease: "easeInOut",
              delay: 0.5,
              duration: 1,
            }}
            className="flex-1 hover:border-hubspot border-1 border-accent hover:border-2 transition hover:duration-300 ease-in-out flex justify-between items-center bg-dark dark:bg-accent rounded-lg p-1 h-12"
          >
            <form className="w-full" onSubmit={handleSubmit}>
              <div className="flex items-center w-full rounded-lg text-sm sm:text-lg">
                <input
                  value={currMsg}
                  className="px-4 focus:outline-none w-full bg-transparent"
                  type="text"
                  placeholder="ask me anything ..."
                  onChange={(e) => setCurrMsg(e.target.value)}
                />
                <button
                  type="submit"
                  className="flex justify-center items-center w-10 h-10 hover:text-hubspot hover:duration-300 hover:scale-110 rounded-lg"
                >
                  <FaArrowRight className="text-lg" />
                </button>
              </div>
            </form>
          </motion.div>

          <motion.div
            initial={{ y: 100 }}
            animate={{ y: 0 }}
            transition={{
              type: "spring",
              ease: "easeInOut",
              delay: 0.8,
              duration: 0.5,
            }}
            className="border-1 border-accent flex justify-center flex-row items-center gap-1 rounded-lg h-12 bg-dark dark:bg-accent p-2 transition duration-300 overflow-hidden"
          >
            <motion.div
              className="flex"
              initial={{ width: "auto" }}
              animate={{ width: showIcons ? "auto" : "0px" }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
            >
              {showIcons && (
                <motion.div
                  initial={{ opacity: 0, x: 100 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, ease: "easeInOut" }}
                  exit={{ opacity: 0, x: 100 }}
                  className="flex gap-1"
                >
                  <motion.div initial={{ rotate: -360 }} exit={{ rotate: 90 }}>
                    <a
                      className="flex justify-center items-center bg-accent dark:bg-dark text-background dark:text-foreground font-bold w-8 h-8 text-lg font-sans rounded-lg hover:bg-hubspot hover:scale-110 hover:duration-300"
                      href="https://www.linkedin.com/in/kharevedant05/"
                      target="_blank"
                    >
                      <FaLinkedinIn />
                    </a>
                  </motion.div>
                  <motion.div initial={{ rotate: -360 }} exit={{ rotate: 90 }}>
                    <a
                      className="flex justify-center items-center bg-accent dark:bg-dark text-background dark:text-foreground font-bold w-8 h-8 text-lg font-sans rounded-lg hover:bg-hubspot hover:scale-110 hover:duration-300"
                      href="https://github.com/KhareV"
                      target="_blank"
                    >
                      <FaGithub />
                    </a>
                  </motion.div>
                  <motion.div initial={{ rotate: -360 }} exit={{ rotate: 90 }}>
                    <a
                      className="flex justify-center items-center bg-accent dark:bg-dark text-background dark:text-foreground font-bold w-8 h-8 text-lg font-sans rounded-lg hover:bg-hubspot hover:scale-110 hover:duration-300"
                      href="tel:+919892031794"
                      target="_blank"
                    >
                      <div className="text-lg font-black">📞</div>
                    </a>
                  </motion.div>
                  <motion.div initial={{ rotate: -360 }} exit={{ rotate: 90 }}>
                    <a
                      className="flex justify-center items-center bg-accent dark:bg-dark text-background dark:text-foreground font-bold w-8 h-8 text-lg font-sans rounded-lg hover:bg-hubspot hover:scale-110 hover:duration-300"
                      href="mailto:kharevedant05@gmail.com"
                    >
                      <FaEnvelope />
                    </a>
                  </motion.div>
                </motion.div>
              )}
            </motion.div>
            <motion.div
              whileHover={{ rotate: 360 }}
              transition={{ duration: 0.1, ease: "easeInOut" }}
              onClick={() => setShowIcons((prev) => !prev)}
              className="flex justify-center items-center font-bold w-8 h-8 text-lg font-sans text-background dark:text-foreground rounded-lg bg-hubspot hover:scale-110 hover:duration-300"
            >
              <FaUsers className="text-sm" />
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* Background gradients */}
      <div className="absolute -z-10 w-52 h-52 bg-purple-500/30 blur-3xl rounded-full -top-10 -right-10"></div>
      <div className="absolute -z-10 w-72 h-72 bg-blue-500/20 blur-3xl rounded-full -bottom-20 -left-10"></div>
    </div>
  );
};

export default ChatBox;
