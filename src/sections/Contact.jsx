import emailjs from "@emailjs/browser";
import { useRef, useState } from "react";
import { motion } from "framer-motion";

import useAlert from "../hooks/useAlert.js";
import Alert from "../components/Alert.jsx";

const Contact = () => {
  const formRef = useRef();
  const { alert, showAlert, hideAlert } = useAlert();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", message: "" });

  const handleChange = ({ target: { name, value } }) => {
    setForm({ ...form, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
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
          showAlert({
            show: true,
            text: "Thank you for your message 😃",
            type: "success",
          });

          setTimeout(() => {
            hideAlert(false);
            setForm({
              name: "",
              email: "",
              message: "",
            });
          }, 3000);
        },
        (error) => {
          setLoading(false);
          console.error(error);

          showAlert({
            show: true,
            text: "I didn't receive your message 😢",
            type: "danger",
          });
        }
      );
  };

  return (
    <motion.section
      className="c-space my-20"
      id="contact"
      initial={{ x: -150, opacity: 0 }}
      whileInView={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: "easeOut" }} // Reduced duration
      viewport={{ once: true, amount: 0.5 }}
    >
      {alert.show && <Alert {...alert} />}

      <div className="relative min-h-screen flex items-center justify-center flex-col">
        <img
          src="/assets/terminal.png"
          alt="terminal-bg"
          className="absolute inset-0 min-h-screen"
        />
        {/* Marquee Background */}
        <div className="mx-10 text-white-800 absolute inset-0 opacity-10 z-0 flex flex-col gap-32 mt-56">
          {/* Row 1 */}
          <div className="relative flex overflow-x-hidden">
            <div className="animate-marquee whitespace-nowrap flex items-center">
              <span className="mx-4 text-3xl">
                Let's build something interesting
              </span>
              <span className="mx-4 text-3xl">
                Let's build something interesting
              </span>
              <span className="mx-4 text-3xl">
                Let's build something interesting
              </span>
              <span className="mx-4 text-3xl">
                Let's build something interesting
              </span>
              <span className="mx-4 text-3xl">
                Let's build something interesting
              </span>
            </div>
            <div className="absolute top-0 animate-marquee2 whitespace-nowrap flex items-center">
              <span className="mx-4 text-3xl">
                Let's build something interesting
              </span>
              <span className="mx-4 text-3xl">
                Let's build something interesting
              </span>
              <span className="mx-4 text-3xl">
                Let's build something interesting
              </span>
              <span className="mx-4 text-3xl">
                Let's build something interesting
              </span>
              <span className="mx-4 text-3xl">
                Let's build something interesting
              </span>
            </div>
          </div>

          {/* Row 2 */}
          <div className="relative flex overflow-x-hidden">
            <div className="animate-marquee-reverse whitespace-nowrap flex items-center">
              <span className="mx-4 text-3xl">
                I am cool, you are cool, let's build something
              </span>
              <span className="mx-4 text-3xl">
                I am cool, you are cool, let's build something
              </span>
              <span className="mx-4 text-3xl">
                I am cool, you are cool, let's build something
              </span>
              <span className="mx-4 text-3xl">
                I am cool, you are cool, let's build something
              </span>
              <span className="mx-4 text-3xl">
                I am cool, you are cool, let's build something
              </span>
            </div>
            <div className="absolute top-0 animate-marquee2-reverse whitespace-nowrap flex items-center">
              <span className="mx-4 text-3xl">
                I am cool, you are cool, let's build something
              </span>
              <span className="mx-4 text-3xl">
                I am cool, you are cool, let's build something
              </span>
              <span className="mx-4 text-3xl">
                I am cool, you are cool, let's build something
              </span>
              <span className="mx-4 text-3xl">
                I am cool, you are cool, let's build something
              </span>
              <span className="mx-4 text-3xl">
                I am cool, you are cool, let's build something
              </span>
            </div>
          </div>

          {/* Row 3 */}
          <div className="relative flex overflow-x-hidden">
            <div className="animate-marquee whitespace-nowrap flex items-center">
              <span className="mx-4 text-3xl">Together, we make it happen</span>
              <span className="mx-4 text-3xl">Together, we make it happen</span>
              <span className="mx-4 text-3xl">Together, we make it happen</span>
              <span className="mx-4 text-3xl">Together, we make it happen</span>
              <span className="mx-4 text-3xl">Together, we make it happen</span>
            </div>
            <div className="absolute top-0 animate-marquee2 whitespace-nowrap flex items-center">
              <span className="mx-4 text-3xl">Together, we make it happen</span>
              <span className="mx-4 text-3xl">Together, we make it happen</span>
              <span className="mx-4 text-3xl">Together, we make it happen</span>
              <span className="mx-4 text-3xl">Together, we make it happen</span>
              <span className="mx-4 text-3xl">Together, we make it happen</span>
            </div>
          </div>

          {/* Row 4 */}
          <div className="relative flex overflow-x-hidden">
            <div className="animate-marquee-reverse whitespace-nowrap flex items-center">
              <span className="mx-4 text-3xl">Inspiration meets creation</span>
              <span className="mx-4 text-3xl">Inspiration meets creation</span>
              <span className="mx-4 text-3xl">Inspiration meets creation</span>
              <span className="mx-4 text-3xl">Inspiration meets creation</span>
              <span className="mx-4 text-3xl">Inspiration meets creation</span>
            </div>
            <div className="absolute top-0 animate-marquee2-reverse whitespace-nowrap flex items-center">
              <span className="mx-4 text-3xl">Inspiration meets creation</span>
              <span className="mx-4 text-3xl">Inspiration meets creation</span>
              <span className="mx-4 text-3xl">Inspiration meets creation</span>
              <span className="mx-4 text-3xl">Inspiration meets creation</span>
              <span className="mx-4 text-3xl">Inspiration meets creation</span>
            </div>
          </div>
        </div>
        <motion.div
          className="contact-container"
          initial={{ x: -100, opacity: 0 }}
          whileInView={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.6, ease: "easeOut" }} // Reduced duration
          viewport={{ once: true, amount: 0.5 }}
        >
          <h3 className="head-text">Let's talk</h3>
          <p className="text-3xl text-white-600 mt-3">
            Whether you’re looking to build a new website, improve your existing
            platform, or bring a unique project to life, I’m here to help.
          </p>

          <motion.form
            ref={formRef}
            onSubmit={handleSubmit}
            className="mt-12 flex flex-col space-y-7"
            initial={{ x: -100, opacity: 0 }}
            whileInView={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.6, ease: "easeOut" }} // Reduced duration
            viewport={{ once: true, amount: 0.5 }}
          >
            <label className="space-y-3">
              <span className="field-label">Full Name</span>
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                required
                className="field-input"
                placeholder="ex., John Doe"
              />
            </label>

            <label className="space-y-3">
              <span className="field-label">Email address</span>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                required
                className="field-input"
                placeholder="ex., johndoe@gmail.com"
              />
            </label>

            <label className="space-y-3">
              <span className="field-label">Your message</span>
              <textarea
                name="message"
                value={form.message}
                onChange={handleChange}
                required
                rows={5}
                className="field-input"
                placeholder="Share your thoughts or inquiries..."
              />
            </label>

            <button className="field-btn" type="submit" disabled={loading}>
              {loading ? "Sending..." : "Send Message"}
              <img
                src="/assets/arrow-up.png"
                alt="arrow-up"
                className="field-btn_arrow"
              />
            </button>
          </motion.form>
        </motion.div>
      </div>
    </motion.section>
  );
};

export default Contact;
