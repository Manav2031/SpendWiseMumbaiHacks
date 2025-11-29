import React from "react";
import { Briefcase, BarChart3, Sparkles } from "lucide-react";
import { motion } from "framer-motion";

export function ServicesSection() {
  const services = [
    {
      shape: (
        <Briefcase className="w-10 h-10 text-purple-600 dark:text-purple-300" />
      ),
      title: "Daily Expense Tracking",
      desc: "Effortlessly record your day-to-day spending.",
    },
    {
      shape: (
        <BarChart3 className="w-10 h-10 text-purple-600 dark:text-purple-300" />
      ),
      title: "AI-Powered Spending Analysis",
      desc: "Track trends, compare data ranges, and understand your money flow with visual analytics.",
    },
    {
      shape: (
        <Sparkles className="w-10 h-10 text-purple-600 dark:text-purple-300" />
      ),
      title: "Smart Recommendations",
      desc: "Get clear insights into your spending patterns, leakage points, and saving opportunities.",
    },
  ];

  return (
    <section
      className="
        py-28 
        bg-white dark:bg-[#0b0f1c] 
        text-center 
        transition-colors
      "
      id="services"
    >
      <div className="max-w-5xl mx-auto px-6">
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-purple-600 dark:text-purple-300 tracking-widest font-semibold"
        >
          SERVICES
        </motion.p>

        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-4xl md:text-5xl font-extrabold 
                     text-gray-900 dark:text-white 
                     mt-3 mb-20"
        >
          Helping You Build
          <br /> Smarter Money Habits
        </motion.h2>

        <div className="grid md:grid-cols-3 gap-16">
          {services.map((srv, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 25 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.2, duration: 0.7 }}
              className="flex flex-col items-center"
            >
              <div className="relative">{srv.shape}</div>

              <h3
                className="text-xl font-semibold 
                             text-gray-900 dark:text-white 
                             mt-6"
              >
                {srv.title}
              </h3>

              <p
                className="text-gray-600 dark:text-gray-300 
                            max-w-xs mt-3"
              >
                {srv.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
