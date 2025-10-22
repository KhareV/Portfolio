import emailjs from "@emailjs/browser";
import { useRef, useState } from "react";
import { motion } from "framer-motion";
import { Send, Mail, User, MessageSquare } from "lucide-react";

import useAlert from "../hooks/useAlert.js";
import Alert from "../components/Alert.jsx";
import { spacing, layout, responsive, cn } from "../styles/spacing.js";

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
      className={cn(
        "c-space",
        spacing.section.paddingY,
        "relative z-10 overflow-hidden"
      )}
      id="contact"
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      viewport={{ once: true, amount: 0.1 }}
    >
      {alert.show && <Alert {...alert} />}

      <div
        className={cn("relative", layout.flex.colCenter, "py-20 min-h-screen")}
      >
        {/* Terminal Background with overlay */}
        <div className="absolute inset-0 z-0">
          <img
            src="/assets/terminal.png"
            alt="terminal-bg"
            className="absolute inset-0 h-full w-full object-contain opacity-60"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-transparent to-black/80" />
        </div>
        {/* Marquee Background */}
        <div
          className={cn(
            "absolute inset-0 opacity-5 md:opacity-10 z-0 overflow-hidden pointer-events-none",
            layout.flex.col,
            "gap-32 mt-56",
            spacing.container.paddingX,
            "text-white-800"
          )}
        >
          {/* Row 1 */}
          <div className={cn("relative", layout.flex.row, "overflow-x-hidden")}>
            <div
              className={cn(
                "animate-marquee whitespace-nowrap",
                layout.flex.center
              )}
            >
              <span
                className={cn(spacing.container.paddingX, responsive.text.xl)}
              >
                Let's build something interesting
              </span>
              <span
                className={cn(spacing.container.paddingX, responsive.text.xl)}
              >
                Let's build something interesting
              </span>
              <span
                className={cn(spacing.container.paddingX, responsive.text.xl)}
              >
                Let's build something interesting
              </span>
              <span
                className={cn(spacing.container.paddingX, responsive.text.xl)}
              >
                Let's build something interesting
              </span>
              <span
                className={cn(spacing.container.paddingX, responsive.text.xl)}
              >
                Let's build something interesting
              </span>
            </div>
            <div
              className={cn(
                "absolute top-0 animate-marquee2 whitespace-nowrap",
                layout.flex.center
              )}
            >
              <span
                className={cn(spacing.container.paddingX, responsive.text.xl)}
              >
                Let's build something interesting
              </span>
              <span
                className={cn(spacing.container.paddingX, responsive.text.xl)}
              >
                Let's build something interesting
              </span>
              <span
                className={cn(spacing.container.paddingX, responsive.text.xl)}
              >
                Let's build something interesting
              </span>
              <span
                className={cn(spacing.container.paddingX, responsive.text.xl)}
              >
                Let's build something interesting
              </span>
              <span
                className={cn(spacing.container.paddingX, responsive.text.xl)}
              >
                Let's build something interesting
              </span>
            </div>
          </div>

          {/* Row 2 */}
          <div className={cn("relative", layout.flex.row, "overflow-x-hidden")}>
            <div
              className={cn(
                "animate-marquee-reverse whitespace-nowrap",
                layout.flex.center
              )}
            >
              <span
                className={cn(spacing.container.paddingX, responsive.text.xl)}
              >
                I am cool, you are cool, let's build something
              </span>
              <span
                className={cn(spacing.container.paddingX, responsive.text.xl)}
              >
                I am cool, you are cool, let's build something
              </span>
              <span
                className={cn(spacing.container.paddingX, responsive.text.xl)}
              >
                I am cool, you are cool, let's build something
              </span>
              <span
                className={cn(spacing.container.paddingX, responsive.text.xl)}
              >
                I am cool, you are cool, let's build something
              </span>
              <span
                className={cn(spacing.container.paddingX, responsive.text.xl)}
              >
                I am cool, you are cool, let's build something
              </span>
            </div>
            <div
              className={cn(
                "absolute top-0 animate-marquee2-reverse whitespace-nowrap",
                layout.flex.center
              )}
            >
              <span
                className={cn(spacing.container.paddingX, responsive.text.xl)}
              >
                I am cool, you are cool, let's build something
              </span>
              <span
                className={cn(spacing.container.paddingX, responsive.text.xl)}
              >
                I am cool, you are cool, let's build something
              </span>
              <span
                className={cn(spacing.container.paddingX, responsive.text.xl)}
              >
                I am cool, you are cool, let's build something
              </span>
              <span
                className={cn(spacing.container.paddingX, responsive.text.xl)}
              >
                I am cool, you are cool, let's build something
              </span>
              <span
                className={cn(spacing.container.paddingX, responsive.text.xl)}
              >
                I am cool, you are cool, let's build something
              </span>
            </div>
          </div>

          {/* Row 3 */}
          <div className={cn("relative", layout.flex.row, "overflow-x-hidden")}>
            <div
              className={cn(
                "animate-marquee whitespace-nowrap",
                layout.flex.center
              )}
            >
              <span
                className={cn(spacing.container.paddingX, responsive.text.xl)}
              >
                Together, we make it happen
              </span>
              <span
                className={cn(spacing.container.paddingX, responsive.text.xl)}
              >
                Together, we make it happen
              </span>
              <span
                className={cn(spacing.container.paddingX, responsive.text.xl)}
              >
                Together, we make it happen
              </span>
              <span
                className={cn(spacing.container.paddingX, responsive.text.xl)}
              >
                Together, we make it happen
              </span>
              <span
                className={cn(spacing.container.paddingX, responsive.text.xl)}
              >
                Together, we make it happen
              </span>
            </div>
            <div
              className={cn(
                "absolute top-0 animate-marquee2 whitespace-nowrap",
                layout.flex.center
              )}
            >
              <span
                className={cn(spacing.container.paddingX, responsive.text.xl)}
              >
                Together, we make it happen
              </span>
              <span
                className={cn(spacing.container.paddingX, responsive.text.xl)}
              >
                Together, we make it happen
              </span>
              <span
                className={cn(spacing.container.paddingX, responsive.text.xl)}
              >
                Together, we make it happen
              </span>
              <span
                className={cn(spacing.container.paddingX, responsive.text.xl)}
              >
                Together, we make it happen
              </span>
              <span
                className={cn(spacing.container.paddingX, responsive.text.xl)}
              >
                Together, we make it happen
              </span>
            </div>
          </div>

          {/* Row 4 */}
          <div className={cn("relative", layout.flex.row, "overflow-x-hidden")}>
            <div
              className={cn(
                "animate-marquee-reverse whitespace-nowrap",
                layout.flex.center
              )}
            >
              <span
                className={cn(spacing.container.paddingX, responsive.text.xl)}
              >
                Inspiration meets creation
              </span>
              <span
                className={cn(spacing.container.paddingX, responsive.text.xl)}
              >
                Inspiration meets creation
              </span>
              <span
                className={cn(spacing.container.paddingX, responsive.text.xl)}
              >
                Inspiration meets creation
              </span>
              <span
                className={cn(spacing.container.paddingX, responsive.text.xl)}
              >
                Inspiration meets creation
              </span>
              <span
                className={cn(spacing.container.paddingX, responsive.text.xl)}
              >
                Inspiration meets creation
              </span>
            </div>
            <div
              className={cn(
                "absolute top-0 animate-marquee2-reverse whitespace-nowrap",
                layout.flex.center
              )}
            >
              <span
                className={cn(spacing.container.paddingX, responsive.text.xl)}
              >
                Inspiration meets creation
              </span>
              <span
                className={cn(spacing.container.paddingX, responsive.text.xl)}
              >
                Inspiration meets creation
              </span>
              <span
                className={cn(spacing.container.paddingX, responsive.text.xl)}
              >
                Inspiration meets creation
              </span>
              <span
                className={cn(spacing.container.paddingX, responsive.text.xl)}
              >
                Inspiration meets creation
              </span>
              <span
                className={cn(spacing.container.paddingX, responsive.text.xl)}
              >
                Inspiration meets creation
              </span>
            </div>
          </div>
        </div>
        <motion.div
          className="contact-container relative z-20"
          initial={{ x: -100, opacity: 0 }}
          whileInView={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.6, ease: "easeOut" }}
          viewport={{ once: true, amount: 0.1 }}
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
            transition={{ delay: 0.3, duration: 0.6, ease: "easeOut" }}
            viewport={{ once: true, amount: 0.1 }}
          >
            <label className={cn(layout.flex.col, spacing.form.gap)}>
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

            <label className={cn(layout.flex.col, spacing.form.gap)}>
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

            <label className={cn(layout.flex.col, spacing.form.gap)}>
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
