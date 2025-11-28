// ContactSection.jsx
import React from "react";
import { motion } from "framer-motion";
import { Linkedin, Facebook, Twitter } from "lucide-react";

export function ContactSection() {
  return (
    <section
      id="contact"
      className="
        py-32 relative 
        bg-white dark:bg-[#0A0B2E]
        transition-colors duration-300
      "
      style={{
        backgroundImage:
          "linear-gradient(#0000000A 1px, transparent 1px), linear-gradient(90deg, #0000000A 1px, transparent 1px)",
        backgroundSize: "32px 32px",
      }}
    >
      <div className="max-w-6xl mx-auto px-6 grid md:grid-cols-2 gap-16 items-start">
        {/* LEFT SIDE */}
        <div>
          <p className="text-purple-600 font-semibold tracking-widest uppercase mb-4">
            Contact
          </p>

          <h2 className="text-4xl md:text-5xl font-bold text-[#0A0B2E] dark:text-white mb-8">
            Let’s Work Together
          </h2>

          <p className="text-[#0A0B2E] dark:text-white/80 text-lg mb-4">
            Survey No. 27, Near, Trimurti Chowk, Bharati Vidyapeeth, Dhankawadi,
            Pune, Maharashtra 411043
          </p>

          <p className="text-[#0A0B2E] dark:text-white/80 text-lg mb-2">
            spartons@spendwise.com
          </p>

          <p className="text-[#0A0B2E] dark:text-white/80 text-lg mb-8">
            Tel: 460-198-0216
          </p>

          {/* Social Icons */}
          <div className="flex gap-5 text-[#0A0B2E] dark:text-white mt-10">
            <div className="p-2 transition">
              <Linkedin
                size={24}
                strokeWidth={1.5}
                className="cursor-pointer hover:text-purple-600 dark:hover:text-purple-400"
              />
            </div>

            <div className="p-2 transition">
              <Facebook
                size={24}
                strokeWidth={1.5}
                className="cursor-pointer hover:text-purple-600 dark:hover:text-purple-400"
              />
            </div>

            <div className="p-2 transition">
              <Twitter
                size={24}
                strokeWidth={1.5}
                className="cursor-pointer hover:text-purple-600 dark:hover:text-purple-400"
              />
            </div>
          </div>
        </div>

        {/* RIGHT SIDE FORM */}
        <motion.form
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="space-y-10"
        >
          {/* First + Last Name */}
          <div className="grid grid-cols-2 gap-6">
            <div className="flex flex-col gap-2">
              <label className="text-[#0A0B2E] dark:text-white text-sm">
                First Name *
              </label>
              <input
                type="text"
                className="
                  border-b border-gray-400 dark:border-gray-600
                  bg-transparent
                  text-[#0A0B2E] dark:text-white
                  focus:border-black dark:focus:border-white
                  outline-none pb-2
                "
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-[#0A0B2E] dark:text-white text-sm">
                Last Name *
              </label>
              <input
                type="text"
                className="
                  border-b border-gray-400 dark:border-gray-600
                  bg-transparent
                  text-[#0A0B2E] dark:text-white
                  focus:border-black dark:focus:border-white
                  outline-none pb-2
                "
              />
            </div>
          </div>

          {/* Email */}
          <div className="flex flex-col gap-2">
            <label className="text-[#0A0B2E] dark:text-white text-sm">
              Email *
            </label>
            <input
              type="email"
              className="
                border-b border-gray-400 dark:border-gray-600
                bg-transparent
                text-[#0A0B2E] dark:text-white
                focus:border-black dark:focus:border-white
                outline-none pb-2
              "
            />
          </div>

          {/* Message */}
          <div className="flex flex-col gap-2">
            <label className="text-[#0A0B2E] dark:text-white text-sm">
              Leave us a message…
            </label>
            <textarea
              rows="4"
              className="
                border-b border-gray-400 dark:border-gray-600
                bg-transparent
                text-[#0A0B2E] dark:text-white
                focus:border-black dark:focus:border-white
                outline-none pb-2
              "
            ></textarea>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="
              bg-purple-600 dark:bg-purple-500 
              hover:bg-purple-700 dark:hover:bg-purple-400
              text-white px-10 py-3 rounded-full text-lg font-medium 
              transition self-start
            "
          >
            Submit
          </button>
        </motion.form>
      </div>
    </section>
  );
}
