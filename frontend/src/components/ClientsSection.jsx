// ClientsSection.jsx
import React from "react";
import { motion } from "framer-motion";

export function ClientsSection() {
  const logos = [
    "https://dummyimage.com/120x50/aaa/fff&text=Logo+1",
    "https://dummyimage.com/120x50/aaa/fff&text=Logo+2",
    "https://dummyimage.com/120x50/aaa/fff&text=Logo+3",
    "https://dummyimage.com/120x50/aaa/fff&text=Logo+4",
    "https://dummyimage.com/120x50/aaa/fff&text=Logo+5",
  ];

  return (
    <section className="py-20 bg-white" id="clients">
      <div className="max-w-6xl mx-auto px-6 text-center">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-3xl font-bold text-gray-900 mb-10"
        >
          Trusted By
        </motion.h2>

        <div className="flex flex-wrap justify-center gap-10">
          {logos.map((logo, idx) => (
            <motion.img
              key={idx}
              src={logo}
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ delay: idx * 0.1 }}
              className="w-32 opacity-70 hover:opacity-100 transition"
            />
          ))}
        </div>
      </div>
    </section>
  );
}
