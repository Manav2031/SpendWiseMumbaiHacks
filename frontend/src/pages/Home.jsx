import React, { useState, useEffect } from "react";
import { Navbar } from "../components/Navbar";
import Loading from "../components/Loading";
import { HeroSection } from "../components/HeroSection";
import { ServicesSection } from "../components/ServicesSection";
import { TestimonialsSection } from "../components/TestimonialsSection";
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

      <section id="contact">
        <ContactSection />
      </section>

      <Footer />
    </div>
  );
}
