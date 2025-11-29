// import React, { useMemo, useEffect, useState } from "react";
// import axios from "axios";
// import {
//   LineChart,
//   TrendingUp,
//   Wallet,
//   Newspaper,
//   ArrowRight,
// } from "lucide-react";
// import { useNavigate, Link } from "react-router-dom";
// import { Typewriter } from "react-simple-typewriter";

// export default function Home() {
//   const [news, setNews] = useState([]);
//   const [scrollY, setScrollY] = useState(0);
//   const [counters, setCounters] = useState({
//     users: 0,
//     savings: 0,
//     insights: 0,
//   });

//   const navigate = useNavigate();

//   // 🌟 Load News
//   useEffect(() => {
//     async function load() {
//       try {
//         const res = await axios.get(
//           import.meta.env.VITE_BACKEND_URL + "/api/news"
//         );
//         setNews(res.data.articles || []);
//       } catch (e) {
//         console.error(e);
//       }
//     }
//     load();
//   }, []);

//   // ✨ Track Parallax Scroll
//   useEffect(() => {
//     const handleScroll = () => setScrollY(window.scrollY);
//     window.addEventListener("scroll", handleScroll);
//     return () => window.removeEventListener("scroll", handleScroll);
//   }, []);

//   // 📊 Animated Counters
//   useEffect(() => {
//     let start = 0;
//     const finalValues = { users: 1200, savings: 45000, insights: 8700 };

//     function animateCounters() {
//       start = 0;

//       const timer = setInterval(() => {
//         start += 5;

//         setCounters({
//           users: Math.min(start, finalValues.users),
//           savings: Math.min(start * 40, finalValues.savings),
//           insights: Math.min(start * 10, finalValues.insights),
//         });

//         // When finished
//         if (start >= 1200) {
//           clearInterval(timer);

//           // restart after a delay
//           setTimeout(() => {
//             setCounters({ users: 0, savings: 0, insights: 0 });
//             animateCounters(); // loop again
//           }, 1000);
//         }
//       }, 30);
//     }

//     animateCounters();
//   }, []);

//   const typewriterText = useMemo(() => {
//     return (
//       <Typewriter
//         words={["SpendWise", "Smart Finance", "Track. Save. Invest."]}
//         loop
//         cursor
//         cursorStyle="|"
//         typeSpeed={60}
//         deleteSpeed={60}
//       />
//     );
//   }, []);

//   return (
//     <div className="space-y-10 animate-fadeIn min-h-screen p-4">
//       {/* 🌟 Hero Section with Typewriter + Parallax */}
//       <section
//         className="bg-gradient-to-r from-[#93c5fd] to-[#60a5fa] text-white p-10 rounded-3xl shadow-lg relative overflow-hidden"
//         style={{
//           backgroundPositionY: scrollY * 0.3,
//         }}
//       >
//         <div className="flex flex-col md:flex-row items-center justify-between gap-6">
//           <div>
//             <h1 className={`text-4xl font-extrabold flex items-center gap-3`}>
//               <Wallet className="w-10 h-10 text-yellow-300" />

//               {/* ✨ Typewriter Title */}
//               <span>{typewriterText}</span>
//             </h1>

//             <p className="mt-4 text-lg max-w-lg text-blue-100">
//               Your autonomous financial coach helping you build smart money
//               habits, track spending, and make confident investment decisions.
//             </p>

//             <button
//               onClick={() => navigate("/auth")}
//               className="mt-6 px-6 py-3 bg-yellow-300 hover:bg-yellow-200 text-gray-900 font-semibold rounded-full transition flex items-center gap-2 shadow-md"
//             >
//               Get Started <ArrowRight className="w-4 h-4" />
//             </button>
//           </div>

//           <div className="text-center md:text-right">
//             <LineChart className="w-24 h-24 mx-auto text-blue-200" />
//             <p className="text-sm mt-2 italic text-blue-50">
//               “Track. Save. Invest.”
//             </p>
//           </div>
//         </div>
//       </section>

//       {/* 💼 About Section */}
//       <section className="bg-gradient-to-br from-[#dbeafe] via-[#fffef6] to-[#bfdbfe] p-10 rounded-3xl shadow-lg border border-blue-200">
//         <h2 className="text-3xl font-bold text-blue-700 mb-4 flex items-center gap-2">
//           <TrendingUp className="w-7 h-7 text-blue-500" />
//           Why SpendWise?
//         </h2>

//         <p className="text-gray-700 leading-relaxed text-lg">
//           SpendWise empowers gig workers, freelancers, and everyday citizens to
//           achieve financial clarity. Understand your spending behavior, receive
//           AI-driven insights, and follow a simple pathway from managing money →
//           <strong> saving</strong> → <strong> investing</strong>.
//         </p>
//       </section>

//       {/* 📊 Animated Counters Section */}
//       <section className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-center py-10 bg-gradient-to-br from-[#bfdbfe] via-[#fffef6] to-[#dbeafe] rounded-3xl shadow-lg border border-blue-200">
//         <div>
//           <h3 className={`ml-4 mr-4 text-4xl font-extrabold text-blue-700`}>
//             {counters.users}+
//           </h3>
//           <p className="text-gray-700 mt-2">Active Users</p>
//         </div>

//         <div>
//           <h3 className={`ml-4 mr-4 text-4xl font-extrabold text-blue-700`}>
//             Rs. {counters.savings}
//           </h3>
//           <p className="text-gray-700 mt-2">Savings Tracked</p>
//         </div>

//         <div>
//           <h3 className={`ml-4 mr-4 text-4xl font-extrabold text-blue-700`}>
//             {counters.insights}
//           </h3>
//           <p className="text-gray-700 mt-2">Insights Delivered</p>
//         </div>
//       </section>

//       {/* 📰 Finance News Section */}
//       <section className="p-8 bg-gradient-to-br from-[#bfdbfe] via-[#fffef6] to-[#dbeafe] rounded-3xl shadow-lg border border-blue-200">
//         <h2 className="text-3xl font-semibold mb-6 text-blue-700 flex items-center gap-2">
//           <Newspaper className="w-7 h-7 text-blue-500" /> Live Finance News
//         </h2>

//         {news.length === 0 ? (
//           <p className="text-sm text-gray-500">No news available right now.</p>
//         ) : (
//           <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
//             {news.slice(0, 9).map((n, i) => (
//               <div
//                 key={i}
//                 className="bg-gradient-to-br from-[#e0f2fe] via-[#fffef6] to-[#dbeafe] rounded-xl shadow-md p-5 border border-blue-200 hover:shadow-xl hover:-translate-y-1 transition transform"
//               >
//                 <a
//                   href={n.url}
//                   target="_blank"
//                   rel="noreferrer"
//                   className="text-lg font-semibold text-blue-800 hover:underline"
//                 >
//                   {n.title}
//                 </a>

//                 <p className="text-sm text-gray-600 mt-2 line-clamp-3">
//                   {n.description || "Click to read more..."}
//                 </p>

//                 <div className="mt-4 flex justify-between items-center text-xs text-gray-500">
//                   <span>{n.source?.name}</span>
//                   <span>{new Date(n.publishedAt).toLocaleDateString()}</span>
//                 </div>
//               </div>
//             ))}
//           </div>
//         )}
//       </section>
//     </div>
//   );
// }

import React, { useState, useEffect } from "react";
import { Navbar } from "../components/Navbar";
import Loading from "../components/Loading";
import { HeroSection } from "../components/HeroSection";
import { ServicesSection } from "../components/ServicesSection";
import { TestimonialsSection } from "../components/TestimonialsSection";
import { ClientsSection } from "../components/ClientsSection";
import { ContactSection } from "../components/ContactSection";
import { LiveFinanceNews } from "../components/LiveFinanceNews";
import { Footer } from "../components/Footer";
import { AboutSection } from "../components/AboutSection";

export default function Home() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  if (isLoading) return <Loading />;

  return (
    <div className="w-full bg-gradient-to-b from-purple-50 to-purple-100">
      {/* <Navbar /> */}
      <section id="home">
        <HeroSection />
        <LiveFinanceNews />
      </section>

      <section id="services">
        <ServicesSection />
      </section>

      <section id="about">
        <AboutSection />
      </section>

      <section id="testimonials">
        <TestimonialsSection />
      </section>

      {/* <ClientsSection /> */}

      <section id="contact">
        <ContactSection />
      </section>

      <Footer />
    </div>
  );
}
