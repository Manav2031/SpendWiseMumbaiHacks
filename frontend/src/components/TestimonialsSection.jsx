// TestimonialsSection.jsx
import { motion } from "framer-motion";
import React, { useEffect, useState, useRef } from "react";

export function TestimonialsSection() {
  const testimonials = [
    {
      name: "Amit Sharma",
      role: "Freelancer",
      text: "SpendWise helped me stabilize my irregular income and save consistently.",
    },
    {
      name: "Sonia Patel",
      role: "Designer",
      text: "I love the daily insights. They actually changed my spending habits!",
    },
    {
      name: "Rahul Verma",
      role: "Student",
      text: "The dashboard makes my spending so easy to understand - everything is clear at a glance.",
    },
  ];

  const [index, setIndex] = useState(0);
  const startX = useRef(0);
  const endX = useRef(0);

  // Auto-slide every 5 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % testimonials.length);
    }, 5000);

    return () => clearInterval(timer);
  }, []);

  // Swipe detection
  const handleTouchStart = (e) => {
    startX.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e) => {
    endX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = () => {
    const delta = endX.current - startX.current;

    if (delta > 50) {
      setIndex(
        (prev) => (prev - 1 + testimonials.length) % testimonials.length
      );
    } else if (delta < -50) {
      setIndex((prev) => (prev + 1) % testimonials.length);
    }
  };

  return (
    <section
      id="testimonials"
      className="
        py-32 text-center 
        bg-[#A44EFF] 
        dark:bg-[#6A1CB0]   /* darker violet for dark mode */
        transition-colors duration-300
      "
    >
      <div
        className="max-w-4xl mx-auto px-6"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Top Label */}
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="text-white uppercase tracking-widest mb-10 text-sm"
        >
          Testimonials
        </motion.p>

        {/* Main Testimonial Box */}
        <motion.div
          key={index}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6 }}
        >
          <p className="text-4xl md:text-5xl font-semibold text-white leading-relaxed mb-10">
            “{testimonials[index].text}”
          </p>

          <h3 className="text-white text-lg font-semibold">
            {testimonials[index].name}
          </h3>

          <p className="text-white/80 dark:text-white/70 text-sm">
            {testimonials[index].role}
          </p>
        </motion.div>

        {/* Dot Indicators */}
        <div className="mt-12 flex justify-center gap-2">
          {testimonials.map((_, i) => (
            <button
              key={i}
              onClick={() => setIndex(i)}
              className={`
                w-3 h-3 rounded-full transition-all
                ${i === index ? "bg-white" : "bg-white/40 dark:bg-white/30"}
              `}
            ></button>
          ))}
        </div>
      </div>
    </section>
  );
}
