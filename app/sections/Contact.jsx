"use client";

import emailjs from "@emailjs/browser";
import dynamic from "next/dynamic";
import { memo, useCallback, useEffect, useRef, useState } from "react";
import { motion, AnimatePresence, useInView } from "framer-motion";
import {
  Send,
  Mail,
  User,
  MessageSquare,
  Check,
  AlertCircle,
} from "lucide-react";
import useDeviceDetection from "../hooks/useDeviceDetection";
import useRuntimePerformanceMode from "../hooks/useRuntimePerformanceMode";

const Prism = dynamic(() => import("./Prism"), { ssr: false });
const Beams = dynamic(() => import("./Beams"), { ssr: false });

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const ALERT_RESET_DELAY_MS = 3200;
const CONTACT_RECEIVER_NAME = "Vedant Khare";
const CONTACT_RECEIVER_EMAIL = "kharevedant05@gmail.com";

const EMAILJS_SERVICE_ID = process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID;
const EMAILJS_TEMPLATE_ID = process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID;
const EMAILJS_PUBLIC_KEY = process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY;

const isValidEmail = (value) => EMAIL_REGEX.test(value.trim());

const normalizeForm = (form) => ({
  name: form.name.trim(),
  email: form.email.trim(),
  message: form.message.trim(),
});

const Contact = () => {
  const { isMobile } = useDeviceDetection();
  const { disableHeavyVisuals } = useRuntimePerformanceMode();
  const sectionRef = useRef(null);
  const isSectionInView = useInView(sectionRef, {
    amount: 0.05,
    margin: "220px 0px",
  });
  const alertTimeoutRef = useRef(null);
  const [alert, setAlert] = useState({ show: false, text: "", type: "" });
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const isSuccessAlert = alert.type === "success";
  const shouldRenderLiveBackground = isSectionInView && !disableHeavyVisuals;

  const hasEmailValue = form.email.trim().length > 0;
  const showEmailValidation = hasEmailValue && !isValidEmail(form.email);

  useEffect(() => {
    return () => {
      if (alertTimeoutRef.current !== null) {
        window.clearTimeout(alertTimeoutRef.current);
      }
    };
  }, []);

  const showAlert = useCallback(
    (text, type = "error", autoHideMs = ALERT_RESET_DELAY_MS) => {
      setAlert({ show: true, text, type });

      if (alertTimeoutRef.current !== null) {
        window.clearTimeout(alertTimeoutRef.current);
      }

      if (autoHideMs > 0) {
        alertTimeoutRef.current = window.setTimeout(() => {
          setAlert({ show: false, text: "", type: "" });
        }, autoHideMs);
      }
    },
    [],
  );

  const handleChange = useCallback(({ target: { name, value } }) => {
    setForm((prevForm) => ({ ...prevForm, [name]: value }));
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (loading) {
      return;
    }

    const normalized = normalizeForm(form);

    if (
      !normalized.name ||
      !normalized.message ||
      !isValidEmail(normalized.email)
    ) {
      showAlert("Please enter a valid name, email, and message.", "error");
      return;
    }

    if (!EMAILJS_SERVICE_ID || !EMAILJS_TEMPLATE_ID || !EMAILJS_PUBLIC_KEY) {
      showAlert(
        "Contact form is not configured. Please email directly.",
        "error",
        5000,
      );
      return;
    }

    setLoading(true);

    try {
      await emailjs.send(
        EMAILJS_SERVICE_ID,
        EMAILJS_TEMPLATE_ID,
        {
          from_name: normalized.name,
          to_name: CONTACT_RECEIVER_NAME,
          from_email: normalized.email,
          to_email: CONTACT_RECEIVER_EMAIL,
          message: normalized.message,
        },
        EMAILJS_PUBLIC_KEY,
      );

      setForm({ name: "", email: "", message: "" });
      showAlert("Message sent successfully!", "success");
    } catch (error) {
      console.error("EmailJS send failed", error);
      showAlert("Failed to send message. Please try again.", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section
      ref={sectionRef}
      className="font-site-default relative min-h-screen overflow-hidden bg-black"
      id="contact"
    >
      {/* Background - Prism for desktop, Beams for mobile */}
      {shouldRenderLiveBackground ? (
        !isMobile ? (
          <div className="absolute inset-0 opacity-100 z-0">
            <Prism
              animationType="3drotate"
              timeScale={0.5}
              height={3.6}
              baseWidth={5.5}
              scale={3.6}
              hueShift={0}
              colorFrequency={1}
              noise={0}
              glow={1.2}
              hoverStrength={1.5}
              inertia={0.08}
              transparent={true}
              steps={84}
            />
          </div>
        ) : (
          <div className="absolute inset-0 z-0 pointer-events-none">
            <Beams
              beamWidth={4}
              beamHeight={30}
              beamNumber={10}
              lightColor="#7dd3fc"
              speed={1.9}
              noiseIntensity={2.2}
              scale={0.4}
              rotation={45}
              heightSegments={48}
              maxDpr={1.1}
            />
          </div>
        )
      ) : (
        <div
          className="absolute inset-0 z-0"
          style={{
            backgroundImage:
              "radial-gradient(circle at 15% 25%, rgba(255, 255, 255, 0.08), transparent 50%), radial-gradient(circle at 75% 65%, rgba(255, 255, 255, 0.06), transparent 52%), linear-gradient(180deg, #05060a 0%, #0a0d13 100%)",
          }}
          aria-hidden="true"
        >
          <div className="absolute inset-0 bg-[linear-gradient(120deg,transparent_0%,rgba(255,255,255,0.03)_45%,transparent_100%)]" />
        </div>
      )}

      {/* Subtle gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/80 z-0" />

      {/* Alert Notification */}
      <AnimatePresence>
        {alert.show && (
          <motion.div
            initial={{ opacity: 0, y: isSuccessAlert ? 20 : -20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: isSuccessAlert ? 20 : -20, scale: 0.9 }}
            className={`fixed z-50 ${
              isSuccessAlert
                ? "bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:bottom-6"
                : "top-8 left-1/2 -translate-x-1/2"
            }`}
            role={alert.type === "error" ? "alert" : "status"}
            aria-live="polite"
          >
            <div
              className={`px-6 py-3 rounded-full backdrop-blur-sm border flex items-center gap-2 shadow-2xl transform-gpu [will-change:transform] ${
                alert.type === "success"
                  ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                  : "bg-red-500/10 border-red-500/30 text-red-400"
              }`}
            >
              {alert.type === "success" ? (
                <Check className="w-4 h-4" />
              ) : (
                <AlertCircle className="w-4 h-4" />
              )}
              <span className="text-sm font-medium">{alert.text}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 py-20 sm:py-24 flex flex-col items-center justify-center min-h-screen">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-12 sm:mb-16"
        >
          <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-4 text-white">
            Let's Talk
          </h2>
          <p className="text-base sm:text-lg text-gray-400 max-w-xl mx-auto">
            Whether you're looking to build something new or improve what
            exists, I'm here to help bring your vision to life.
          </p>
        </motion.div>

        {/* Form Container */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          viewport={{ once: true }}
          className="w-full max-w-2xl"
        >
          <div className="relative backdrop-blur-sm bg-white/5 border border-white/10 rounded-2xl p-5 sm:p-7 md:p-10 shadow-2xl transform-gpu [will-change:transform]">
            <form className="space-y-6" onSubmit={handleSubmit} noValidate>
              {/* Name Field */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3, duration: 0.5 }}
                viewport={{ once: true }}
              >
                <label className="block" htmlFor="contact-name">
                  <div className="flex items-center gap-2 mb-2">
                    <User className="w-4 h-4 text-gray-400" />
                    <span className="text-sm font-medium text-gray-300">
                      Name
                    </span>
                  </div>
                  <input
                    id="contact-name"
                    type="text"
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    required
                    autoComplete="name"
                    aria-label="Your name"
                    placeholder="Your name"
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:border-white/30 focus:outline-none transition-all"
                  />
                </label>
              </motion.div>

              {/* Email Field */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4, duration: 0.5 }}
                viewport={{ once: true }}
              >
                <label className="block" htmlFor="contact-email">
                  <div className="flex items-center gap-2 mb-2">
                    <Mail className="w-4 h-4 text-gray-400" />
                    <span className="text-sm font-medium text-gray-300">
                      Email
                    </span>
                  </div>
                  <input
                    id="contact-email"
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    required
                    autoComplete="email"
                    aria-label="Your email address"
                    aria-invalid={showEmailValidation}
                    aria-describedby={
                      showEmailValidation ? "contact-email-error" : undefined
                    }
                    placeholder="your@email.com"
                    className={`w-full px-4 py-3 bg-white/5 rounded-lg text-white placeholder-gray-500 focus:outline-none transition-all ${
                      showEmailValidation
                        ? "border border-red-400/70 focus:border-red-400"
                        : "border border-white/10 focus:border-white/30"
                    }`}
                  />
                  {showEmailValidation && (
                    <p
                      id="contact-email-error"
                      className="mt-2 text-xs text-red-300"
                    >
                      Enter a valid email address.
                    </p>
                  )}
                </label>
              </motion.div>

              {/* Message Field */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5, duration: 0.5 }}
                viewport={{ once: true }}
              >
                <label className="block" htmlFor="contact-message">
                  <div className="flex items-center gap-2 mb-2">
                    <MessageSquare className="w-4 h-4 text-gray-400" />
                    <span className="text-sm font-medium text-gray-300">
                      Message
                    </span>
                  </div>
                  <textarea
                    id="contact-message"
                    name="message"
                    value={form.message}
                    onChange={handleChange}
                    required
                    rows={5}
                    aria-label="Project message"
                    placeholder="Tell me about your project..."
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:border-white/30 focus:outline-none transition-all resize-none"
                  />
                </label>
              </motion.div>

              {/* Submit Button */}
              <motion.button
                type="submit"
                disabled={loading}
                aria-busy={loading}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="relative w-full py-4 rounded-lg font-medium text-white bg-white/10 hover:bg-white/15 border border-white/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 group"
              >
                {loading ? (
                  <>
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{
                        duration: 1,
                        repeat: Infinity,
                        ease: "linear",
                      }}
                      className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
                    />
                    <span>Sending...</span>
                  </>
                ) : (
                  <>
                    <span>Send Message</span>
                    <Send className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </motion.button>
            </form>
          </div>
        </motion.div>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          viewport={{ once: true }}
          className="mt-8 text-center"
        >
          <p className="text-sm text-gray-500">
            Or email me directly at{" "}
            <a
              href="mailto:kharevedant05@gmail.com"
              className="text-gray-400 hover:text-white transition-colors"
            >
              kharevedant05@gmail.com
            </a>
          </p>
        </motion.div>
      </div>
    </section>
  );
};

export default memo(Contact);
