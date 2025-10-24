import emailjs from "@emailjs/browser";
import { useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Send,
  Mail,
  User,
  MessageSquare,
  Check,
  AlertCircle,
} from "lucide-react";
import Prism from "./Prism";
import Beams from "./Beams";
import useDeviceDetection from "../hooks/useDeviceDetection";

const Contact = () => {
  const { isMobile } = useDeviceDetection();
  const formRef = useRef();
  const [alert, setAlert] = useState({ show: false, text: "", type: "" });
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", message: "" });

  const handleChange = ({ target: { name, value } }) => {
    setForm({ ...form, [name]: value });
  };

  const handleSubmit = () => {
    if (!form.name || !form.email || !form.message) return;
    setLoading(true);

    emailjs
      .send(
        "service_z35bjki",
        "template_dmewlhk",
        {
          from_name: form.name,
          to_name: "Vedant Khare",
          from_email: form.email,
          to_email: "kharevedant05@gmail.com",
          message: form.message,
        },
        "5SB9vIYuPZek1cZXG"
      )
      .then(
        () => {
          setLoading(false);
          setAlert({
            show: true,
            text: "Message sent successfully!",
            type: "success",
          });

          setTimeout(() => {
            setAlert({ show: false, text: "", type: "" });
            setForm({ name: "", email: "", message: "" });
          }, 3000);
        },
        (error) => {
          setLoading(false);
          console.error(error);
          setAlert({
            show: true,
            text: "Failed to send message. Please try again.",
            type: "error",
          });
        }
      );
  };

  return (
    <section
      className="relative min-h-screen overflow-hidden bg-black"
      id="contact"
    >
      {/* Background - Prism for desktop, Beams for mobile */}
      {!isMobile ? (
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
          />
        </div>
      ) : (
        <div className="absolute inset-0 z-0 pointer-events-none">
          <Beams
            beamWidth={2}
            beamHeight={15}
            beamNumber={12}
            lightColor="#ffffff"
            speed={2}
            noiseIntensity={1.75}
            scale={0.2}
            rotation={0}
          />
        </div>
      )}

      {/* Subtle gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/80 z-0" />

      {/* Alert Notification */}
      <AnimatePresence>
        {alert.show && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.9 }}
            className="fixed top-8 left-1/2 -translate-x-1/2 z-50"
          >
            <div
              className={`px-6 py-3 rounded-full backdrop-blur-md border flex items-center gap-2 shadow-2xl ${
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
      <div className="relative z-10 max-w-5xl mx-auto px-6 py-24 flex flex-col items-center justify-center min-h-screen">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-5xl md:text-6xl font-bold mb-4 text-white">
            Let's Talk
          </h2>
          <p className="text-lg text-gray-400 max-w-xl mx-auto">
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
          <div className="relative backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-8 md:p-10 shadow-2xl">
            <div className="space-y-6">
              {/* Name Field */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3, duration: 0.5 }}
                viewport={{ once: true }}
              >
                <label className="block">
                  <div className="flex items-center gap-2 mb-2">
                    <User className="w-4 h-4 text-gray-400" />
                    <span className="text-sm font-medium text-gray-300">
                      Name
                    </span>
                  </div>
                  <input
                    type="text"
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    required
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
                <label className="block">
                  <div className="flex items-center gap-2 mb-2">
                    <Mail className="w-4 h-4 text-gray-400" />
                    <span className="text-sm font-medium text-gray-300">
                      Email
                    </span>
                  </div>
                  <input
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    required
                    placeholder="your@email.com"
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:border-white/30 focus:outline-none transition-all"
                  />
                </label>
              </motion.div>

              {/* Message Field */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5, duration: 0.5 }}
                viewport={{ once: true }}
              >
                <label className="block">
                  <div className="flex items-center gap-2 mb-2">
                    <MessageSquare className="w-4 h-4 text-gray-400" />
                    <span className="text-sm font-medium text-gray-300">
                      Message
                    </span>
                  </div>
                  <textarea
                    name="message"
                    value={form.message}
                    onChange={handleChange}
                    required
                    rows={5}
                    placeholder="Tell me about your project..."
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:border-white/30 focus:outline-none transition-all resize-none"
                  />
                </label>
              </motion.div>

              {/* Submit Button */}
              <motion.button
                type="button"
                onClick={handleSubmit}
                disabled={loading}
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
            </div>
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

export default Contact;
