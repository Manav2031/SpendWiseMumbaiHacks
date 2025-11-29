import React from "react";
import { motion } from "framer-motion";

export function AboutSection() {
  return (
    <section
      className="
        w-full py-28 
        bg-white dark:bg-[#0b0f1c] 
        flex flex-col md:flex-row 
        items-center justify-between
        transition-colors
      "
      id="about"
    >
      <div className="w-full md:w-1/2 px-10 md:px-20">
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-purple-600 dark:text-purple-300 font-semibold tracking-wider mb-4"
        >
          ABOUT
        </motion.p>

        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-4xl md:text-5xl font-extrabold 
                     text-gray-900 dark:text-white 
                     leading-tight mb-8"
        >
          Your Smart <br /> Financial Companion
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="text-gray-700 dark:text-gray-300 
                     text-lg leading-relaxed mb-6"
        >
          SpendWise is an AI-powered personal finance companion designed to help
          you build strong money habits before you even think about investing.
          Instead of focusing only on “where to invest,” SpendWise helps you
          understand how you spend, where your money leaks, and how you can save
          more consistently.
        </motion.p>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-gray-700 dark:text-gray-300 
                     text-lg leading-relaxed"
        >
          It is a smart, everyday guide that keeps you aware, informed, and in
          control of your finances. By learning from your daily transactions,
          and income behavior, SpendWise delivers personalized insights and
          easy-to-read analytics.
        </motion.p>
      </div>
      <div
        className="
          w-full md:w-1/2 relative h-[500px] 
          bg-gradient-to-b 
          from-purple-200 to-purple-500 
          dark:from-purple-800 dark:to-purple-900
          flex items-end justify-center 
          overflow-hidden transition-colors
        "
      >
        <div className="absolute inset-0 opacity-30">
          <div
            className="w-full h-full"
            style={{
              backgroundImage:
                "linear-gradient(#ffffff40 1px, transparent 1px), linear-gradient(90deg, #ffffff40 1px, transparent 1px)",
              backgroundSize: "80px 80px",
            }}
          ></div>
        </div>

        <svg
          viewBox="0 0 800 400"
          className="absolute bottom-0 w-full opacity-90"
        >
          <path
            d="M0 350 C 150 320, 300 200, 450 150 C 600 100, 700 160, 800 120 L 800 400 L 0 400 Z"
            fill="rgba(255,255,255,0.3)"
            stroke="white"
            strokeWidth="3"
          />

          <circle
            cx="700"
            cy="135"
            r="12"
            fill="white"
            stroke="white"
            strokeWidth="4"
            className="drop-shadow-lg"
          />
        </svg>
      </div>
    </section>
  );
}
