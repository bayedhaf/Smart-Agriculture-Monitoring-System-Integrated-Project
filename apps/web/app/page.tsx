"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Leaf,
  Wifi,
  Brain,
  CloudRain,
  BarChart3,
  ArrowRight,
  CheckCircle2,
  Menu,
  X,
  Zap,
  Shield,
  Globe,
  ChevronRight,
  Star,
  Smartphone,
} from "lucide-react";
import { cn } from "@/lib/utils";

// ─── Animated counter ─────────────────────────────────────────────────────────
function Counter({ to, suffix = "" }: { to: number; suffix?: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const started = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started.current) {
          started.current = true;
          let start = 0;
          const step = to / 60;
          const timer = setInterval(() => {
            start += step;
            if (start >= to) { setCount(to); clearInterval(timer); }
            else setCount(Math.floor(start));
          }, 16);
        }
      },
      { threshold: 0.4 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [to]);

  return <span ref={ref}>{count.toLocaleString()}{suffix}</span>;
}

// ─── Image placeholder component ─────────────────────────────────────────────
function ImgPlaceholder({
  className,
  label = "Image placeholder",
  aspectRatio = "aspect-video",
}: {
  className?: string;
  label?: string;
  aspectRatio?: string;
}) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-[1rem] bg-[#1c1b1b] border border-[#41493e] flex items-center justify-center",
        aspectRatio,
        className
      )}
    >
      {/* grid pattern */}
      <div
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage:
            "linear-gradient(#41493e 1px, transparent 1px), linear-gradient(90deg, #41493e 1px, transparent 1px)",
          backgroundSize: "32px 32px",
        }}
      />
      {/* corner brackets */}
      {[
        "top-3 left-3 border-t-2 border-l-2",
        "top-3 right-3 border-t-2 border-r-2",
        "bottom-3 left-3 border-b-2 border-l-2",
        "bottom-3 right-3 border-b-2 border-r-2",
      ].map((cls, i) => (
        <span
          key={i}
          className={cn("absolute w-5 h-5 border-[#91d78a]", cls)}
        />
      ))}
      <div className="relative z-10 flex flex-col items-center gap-2 text-center px-4">
        <div className="w-10 h-10 rounded-full bg-[#1b5e20]/30 border border-[#91d78a]/30 flex items-center justify-center">
          <Leaf className="w-5 h-5 text-[#91d78a]/60" />
        </div>
        <p className="text-[11px] font-medium text-[#8a9386] uppercase tracking-widest">
          {label}
        </p>
      </div>
    </div>
  );
}

// ─── Nav ──────────────────────────────────────────────────────────────────────
function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handler);
    return () => window.removeEventListener("scroll", handler);
  }, []);

  const links = ["Features", "How it works", "Testimonials", "Pricing"];

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
        scrolled
          ? "bg-[#131313]/90 backdrop-blur-md border-b border-[#41493e]/60"
          : "bg-transparent"
      )}
    >
      <div className="max-w-7xl mx-auto px-4 md:px-8 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 rounded-[0.5rem] bg-[#1b5e20] border border-[#91d78a]/30 flex items-center justify-center group-hover:border-[#91d78a]/70 transition-colors">
            <Leaf className="w-4 h-4 text-[#91d78a]" />
          </div>
          <span
            className="text-[#e5e2e1] font-bold text-base tracking-tight"
            style={{ fontFamily: "Manrope, sans-serif" }}
          >
            AgriSense
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-6">
          {links.map((l) => (
            <a
              key={l}
              href={`#${l.toLowerCase().replace(/ /g, "-")}`}
              className="text-sm text-[#c0c9bb] hover:text-[#91d78a] transition-colors"
              style={{ fontFamily: "Inter, sans-serif" }}
            >
              {l}
            </a>
          ))}
        </nav>

        {/* CTA */}
        <div className="hidden md:flex items-center gap-3">
          <Link href="/auth/login">
            <Button
              variant="ghost"
              className="text-sm text-[#c0c9bb] hover:text-[#91d78a] hover:bg-transparent"
            >
              Sign in
            </Button>
          </Link>
          <Link href="/auth/register">
            <Button className="h-9 px-5 text-sm rounded-[0.5rem] bg-[#1b5e20] hover:bg-[#2e7d32] text-white border border-[#91d78a]/20 hover:border-[#91d78a]/50 transition-all">
              Get started free
            </Button>
          </Link>
        </div>

        {/* Mobile toggle */}
        <button
          className="md:hidden text-[#c0c9bb] hover:text-[#91d78a] transition-colors"
          onClick={() => setOpen(!open)}
          aria-label="Toggle menu"
        >
          {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden bg-[#1c1b1b] border-t border-[#41493e] px-4 py-4 space-y-3">
          {links.map((l) => (
            <a
              key={l}
              href={`#${l.toLowerCase().replace(/ /g, "-")}`}
              className="block text-sm text-[#c0c9bb] hover:text-[#91d78a] py-2 transition-colors"
              onClick={() => setOpen(false)}
            >
              {l}
            </a>
          ))}
          <div className="pt-2 flex flex-col gap-2">
            <Link href="/auth/login" onClick={() => setOpen(false)}>
              <Button variant="outline" className="w-full h-10 text-sm rounded-[0.5rem] border-[#41493e] text-[#c0c9bb] bg-transparent hover:bg-[#201f1f] hover:text-[#91d78a]">
                Sign in
              </Button>
            </Link>
            <Link href="/auth/register" onClick={() => setOpen(false)}>
              <Button className="w-full h-10 text-sm rounded-[0.5rem] bg-[#1b5e20] hover:bg-[#2e7d32] text-white">
                Get started free
              </Button>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}

// ─── Hero ─────────────────────────────────────────────────────────────────────
function Hero() {
  return (
    <section className="relative min-h-screen flex items-center overflow-hidden pt-16">
      {/* Background radial glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-175 h-125 rounded-full bg-[#1b5e20]/20 blur-[120px]" />
        <div className="absolute bottom-0 right-0 w-100 h-100 rounded-full bg-[#91d78a]/5 blur-[100px]" />
        {/* Grid overlay */}
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage:
              "linear-gradient(#91d78a 1px, transparent 1px), linear-gradient(90deg, #91d78a 1px, transparent 1px)",
            backgroundSize: "64px 64px",
          }}
        />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 md:px-8 py-20 w-full">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left — copy */}
          <div>
            <div className="inline-flex items-center gap-2 bg-[#1b5e20]/20 border border-[#91d78a]/20 rounded-full px-3.5 py-1.5 mb-6">
              <div className="w-1.5 h-1.5 rounded-full bg-[#91d78a] animate-pulse" />
              <span
                className="text-xs font-bold text-[#91d78a] uppercase tracking-widest"
                style={{ fontFamily: "Inter, sans-serif" }}
              >
                AI-Powered Farm Intelligence
              </span>
            </div>

            <h1
              className="text-[clamp(2.5rem,5vw,4rem)] font-bold text-[#e5e2e1] leading-[1.1] tracking-tight mb-6"
              style={{ fontFamily: "Manrope, sans-serif" }}
            >
              The Future of{" "}
              <span
                className="relative inline-block text-[#91d78a]"
              >
                Precision
                <span className="absolute bottom-1 left-0 right-0 h-px bg-linear-to-r from-[#91d78a]/0 via-[#91d78a]/60 to-[#91d78a]/0" />
              </span>
              <br />Agriculture
            </h1>

            <p
              className="text-base text-[#c0c9bb] leading-relaxed mb-8 max-w-lg"
              style={{ fontFamily: "Inter, sans-serif" }}
            >
              AgriSense combines IoT soil sensors, real-time weather data, and
              Claude AI to diagnose crop diseases and recommend precise
              irrigation actions — so every decision you make is backed by
              data.
            </p>

            <div className="flex flex-wrap gap-3 mb-10">
              <Link href="/auth/register">
                <Button className="h-12 px-7 text-sm font-semibold rounded-[0.5rem] bg-[#91d78a] hover:bg-[#acf4a4] text-[#003909] transition-all hover:scale-[1.02] active:scale-[0.98] group">
                  Start monitoring free
                  <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Button
                variant="outline"
                className="h-12 px-7 text-sm font-semibold rounded-[0.5rem] bg-transparent border-[#41493e] text-[#c0c9bb] hover:bg-[#1c1b1b] hover:border-[#8a9386] hover:text-[#e5e2e1] transition-all"
              >
                Watch demo
              </Button>
            </div>

            {/* Trust row */}
            <div className="flex items-center gap-5 flex-wrap">
              {["No credit card", "Free forever tier", "Open-source firmware"].map((t) => (
                <div key={t} className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#91d78a] shrink-0" />
                  <span
                    className="text-xs text-[#8a9386]"
                    style={{ fontFamily: "Inter, sans-serif" }}
                  >
                    {t}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Right — hero image placeholder */}
          <div className="relative">
            <ImgPlaceholder
              label="Hero dashboard screenshot"
              aspectRatio="aspect-[4/3]"
              className="w-full"
            />
            {/* Floating stat card */}
            <div className="absolute -bottom-4 -left-4 bg-[#201f1f] border border-[#41493e] rounded-[1rem] px-4 py-3 shadow-xl">
              <p
                className="text-[10px] font-bold uppercase tracking-widest text-[#8a9386] mb-1"
                style={{ fontFamily: "Inter, sans-serif" }}
              >
                Soil moisture
              </p>
              <p
                className="text-2xl font-bold text-[#91d78a]"
                style={{ fontFamily: "Manrope, sans-serif" }}
              >
                62<span className="text-sm font-normal text-[#8a9386]">%</span>
              </p>
              <p className="text-[10px] text-[#91d78a] mt-0.5">▲ Adequate · Hold irrigation</p>
            </div>
            {/* Floating disease badge */}
            <div className="absolute -top-4 -right-4 bg-[#201f1f] border border-[#41493e] rounded-[1rem] px-4 py-3 shadow-xl">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-[#91d78a]" />
                <p
                  className="text-xs font-semibold text-[#e5e2e1]"
                  style={{ fontFamily: "Inter, sans-serif" }}
                >
                  AI Diagnosis
                </p>
              </div>
              <p
                className="text-sm font-bold text-[#91d78a] mt-1"
                style={{ fontFamily: "Manrope, sans-serif" }}
              >
                Healthy leaf ✓
              </p>
              <p className="text-[10px] text-[#8a9386]">Confidence 94%</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── Stats ────────────────────────────────────────────────────────────────────
function Stats() {
  const items = [
    { value: 1200, suffix: "+", label: "Farmers onboarded" },
    { value: 98, suffix: "%", label: "Disease detection accuracy" },
    { value: 45, suffix: "%", label: "Water usage reduction" },
    { value: 3, suffix: "s", label: "Average diagnosis time" },
  ];
  return (
    <section className="border-y border-[#41493e] bg-[#1c1b1b]/50">
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-12 grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-0 md:divide-x divide-[#41493e]">
        {items.map((s) => (
          <div key={s.label} className="text-center px-6">
            <p
              className="text-4xl font-bold text-[#91d78a] mb-1"
              style={{ fontFamily: "Manrope, sans-serif" }}
            >
              <Counter to={s.value} suffix={s.suffix} />
            </p>
            <p
              className="text-sm text-[#8a9386]"
              style={{ fontFamily: "Inter, sans-serif" }}
            >
              {s.label}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}

// ─── Features ────────────────────────────────────────────────────────────────
function Features() {
  const features = [
    {
      icon: Wifi,
      title: "Real-time IoT Sensors",
      desc: "ESP32-powered nodes monitor soil moisture, temperature, and humidity every 30 minutes and push data directly to your dashboard.",
      tag: "Hardware",
    },
    {
      icon: Brain,
      title: "AI Crop Diagnosis",
      desc: "Photograph any leaf and Claude Vision AI identifies the disease, severity, and delivers step-by-step remedy instructions instantly.",
      tag: "AI",
    },
    {
      icon: CloudRain,
      title: "Weather Intelligence",
      desc: "OpenWeatherMap integration delivers 5-day forecasts and rain probability so your irrigation recommendations account for incoming weather.",
      tag: "Weather",
    },
    {
      icon: BarChart3,
      title: "Sensor Analytics",
      desc: "Track soil health trends over time with interactive charts. Spot patterns and act before problems escalate.",
      tag: "Analytics",
    },
    {
      icon: Zap,
      title: "Instant Recommendations",
      desc: "The AI recommendation engine fuses sensor readings with weather data to give you one clear action: irrigate, wait, or alert.",
      tag: "Automation",
    },
    {
      icon: Shield,
      title: "Secure & Private",
      desc: "Firebase Auth with JWT, per-device API keys for your ESP32 nodes, and role-based security rules on all your farm data.",
      tag: "Security",
    },
  ];

  return (
    <section id="features" className="py-24">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        {/* Section header */}
        <div className="text-center mb-16">
          <Badge
            variant="outline"
            className="mb-4 border-[#41493e] text-[#91d78a] bg-[#1b5e20]/10 text-[10px] font-bold uppercase tracking-widest px-3 py-1"
          >
            Platform Features
          </Badge>
          <h2
            className="text-[clamp(1.75rem,3.5vw,2.75rem)] font-bold text-[#e5e2e1] tracking-tight"
            style={{ fontFamily: "Manrope, sans-serif" }}
          >
            Everything your farm needs
            <br />
            <span className="text-[#91d78a]">in one platform</span>
          </h2>
          <p
            className="mt-4 text-[#8a9386] text-base max-w-xl mx-auto leading-relaxed"
            style={{ fontFamily: "Inter, sans-serif" }}
          >
            From hardware to AI, AgriSense is a complete vertical stack built
            for Ethiopian smallholder and commercial farmers.
          </p>
        </div>

        {/* Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {features.map((f) => (
            <div
              key={f.title}
              className="group relative bg-[#1c1b1b] border border-[#41493e] rounded-[1rem] p-6 hover:border-[#91d78a]/40 hover:bg-[#201f1f] transition-all duration-300 cursor-default"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="w-10 h-10 rounded-[0.75rem] bg-[#1b5e20]/30 border border-[#91d78a]/20 flex items-center justify-center group-hover:bg-[#1b5e20]/50 transition-colors">
                  <f.icon className="w-5 h-5 text-[#91d78a]" />
                </div>
                <span
                  className="text-[10px] font-bold uppercase tracking-widest text-[#8a9386] bg-[#2a2a2a] border border-[#41493e] rounded-full px-2.5 py-1"
                  style={{ fontFamily: "Inter, sans-serif" }}
                >
                  {f.tag}
                </span>
              </div>
              <h3
                className="text-base font-semibold text-[#e5e2e1] mb-2"
                style={{ fontFamily: "Manrope, sans-serif" }}
              >
                {f.title}
              </h3>
              <p
                className="text-sm text-[#8a9386] leading-relaxed"
                style={{ fontFamily: "Inter, sans-serif" }}
              >
                {f.desc}
              </p>
              {/* hover glow */}
              <div className="absolute inset-0 rounded-[1rem] bg-linear-to-br from-[#91d78a]/0 to-[#91d78a]/0 group-hover:from-[#91d78a]/3 group-hover:to-transparent transition-all duration-300 pointer-events-none" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── How it works ─────────────────────────────────────────────────────────────
function HowItWorks() {
  const steps = [
    {
      num: "01",
      title: "Install the sensor node",
      desc: "Flash the open-source firmware onto your ESP32, wire up the DHT11 and moisture sensors, and connect to Wi-Fi. Takes 20 minutes.",
      image: "ESP32 sensor hardware setup",
    },
    {
      num: "02",
      title: "Live data flows to your dashboard",
      desc: "Every 30 minutes, sensor readings push to Firebase and appear instantly on your Farm Dashboard — soil moisture, temperature, humidity.",
      image: "Dashboard live sensor data",
    },
    {
      num: "03",
      title: "Photograph leaves for AI diagnosis",
      desc: "Open the Scan screen, take a photo of any leaf, and Claude Vision AI returns disease name, confidence score, and treatment steps in seconds.",
      image: "AI disease diagnosis screen",
    },
    {
      num: "04",
      title: "Act on intelligent recommendations",
      desc: "The engine combines your sensor data and weather forecasts into a single, clear action: irrigate now, hold, or alert for an agronomist.",
      image: "Recommendation action card",
    },
  ];

  return (
    <section id="how-it-works" className="py-24 bg-[#1c1b1b]/30">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <div className="text-center mb-16">
          <Badge
            variant="outline"
            className="mb-4 border-[#41493e] text-[#91d78a] bg-[#1b5e20]/10 text-[10px] font-bold uppercase tracking-widest px-3 py-1"
          >
            How it works
          </Badge>
          <h2
            className="text-[clamp(1.75rem,3.5vw,2.75rem)] font-bold text-[#e5e2e1] tracking-tight"
            style={{ fontFamily: "Manrope, sans-serif" }}
          >
            From sensor to insight
            <br />
            <span className="text-[#91d78a]">in four steps</span>
          </h2>
        </div>

        <div className="space-y-16">
          {steps.map((step, i) => (
            <div
              key={step.num}
              className={cn(
                "grid lg:grid-cols-2 gap-10 items-center",
                i % 2 === 1 && "lg:grid-flow-dense"
              )}
            >
              {/* Copy */}
              <div className={cn(i % 2 === 1 && "lg:col-start-2")}>
                <div
                  className="text-[3.5rem] font-bold text-[#91d78a]/15 leading-none mb-3 select-none"
                  style={{ fontFamily: "Manrope, sans-serif" }}
                >
                  {step.num}
                </div>
                <h3
                  className="text-xl font-bold text-[#e5e2e1] mb-3"
                  style={{ fontFamily: "Manrope, sans-serif" }}
                >
                  {step.title}
                </h3>
                <p
                  className="text-[#8a9386] leading-relaxed mb-5"
                  style={{ fontFamily: "Inter, sans-serif" }}
                >
                  {step.desc}
                </p>
                <div className="flex items-center gap-1.5 text-[#91d78a] text-sm font-medium cursor-pointer hover:gap-2.5 transition-all group">
                  Learn more
                  <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
              {/* Image */}
              <div className={cn(i % 2 === 1 && "lg:col-start-1 lg:row-start-1")}>
                <ImgPlaceholder
                  label={step.image}
                  aspectRatio="aspect-[16/9]"
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Testimonials ────────────────────────────────────────────────────────────
function Testimonials() {
  const items = [
    {
      quote:
        "We reduced water usage by 40% in our first season. The irrigation recommendations are spot-on, even accounting for the unpredictable weather here in Oromia.",
      name: "Abebe Girma",
      role: "Maize farmer · Adama, Oromia",
      stars: 5,
    },
    {
      quote:
        "The disease detection saved our tomato crop. I photographed a leaf on Monday and had a fungicide prescription by Tuesday morning. Incredible.",
      name: "Tigist Bekele",
      role: "Greenhouse farmer · Bishoftu",
      stars: 5,
    },
    {
      quote:
        "Setting up the ESP32 node took less than an hour. Now I can check soil moisture from my phone while I'm at the market. It changed how I manage my farm.",
      name: "Dereje Alemu",
      role: "Teff farmer · Amhara region",
      stars: 5,
    },
  ];

  return (
    <section id="testimonials" className="py-24">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <div className="text-center mb-16">
          <Badge
            variant="outline"
            className="mb-4 border-[#41493e] text-[#91d78a] bg-[#1b5e20]/10 text-[10px] font-bold uppercase tracking-widest px-3 py-1"
          >
            Testimonials
          </Badge>
          <h2
            className="text-[clamp(1.75rem,3.5vw,2.75rem)] font-bold text-[#e5e2e1] tracking-tight"
            style={{ fontFamily: "Manrope, sans-serif" }}
          >
            Trusted by farmers
            <br />
            <span className="text-[#91d78a]">across Ethiopia</span>
          </h2>
        </div>

        <div className="grid md:grid-cols-3 gap-5">
          {items.map((t) => (
            <div
              key={t.name}
              className="bg-[#1c1b1b] border border-[#41493e] rounded-[1rem] p-6 flex flex-col"
            >
              {/* Stars */}
              <div className="flex gap-0.5 mb-4">
                {Array.from({ length: t.stars }).map((_, i) => (
                  <Star key={i} className="w-3.5 h-3.5 fill-[#91d78a] text-[#91d78a]" />
                ))}
              </div>
              <p
                className="text-sm text-[#c0c9bb] leading-relaxed flex-1 mb-5"
                style={{ fontFamily: "Inter, sans-serif" }}
              >
                &quot;{t.quote}&quot;
              </p>
              <div className="flex items-center gap-3 pt-4 border-t border-[#41493e]">
                {/* Avatar placeholder */}
                <div className="w-9 h-9 rounded-full bg-[#1b5e20]/40 border border-[#91d78a]/20 flex items-center justify-center shrink-0">
                  <span
                    className="text-xs font-bold text-[#91d78a]"
                    style={{ fontFamily: "Manrope, sans-serif" }}
                  >
                    {t.name.split(" ").map((n) => n[0]).join("")}
                  </span>
                </div>
                <div>
                  <p
                    className="text-sm font-semibold text-[#e5e2e1]"
                    style={{ fontFamily: "Manrope, sans-serif" }}
                  >
                    {t.name}
                  </p>
                  <p
                    className="text-[11px] text-[#8a9386]"
                    style={{ fontFamily: "Inter, sans-serif" }}
                  >
                    {t.role}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── App preview section ──────────────────────────────────────────────────────
function AppPreview() {
  return (
    <section className="py-24 bg-[#1c1b1b]/30">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <Badge
              variant="outline"
              className="mb-6 border-[#41493e] text-[#91d78a] bg-[#1b5e20]/10 text-[10px] font-bold uppercase tracking-widest px-3 py-1"
            >
              Mobile + Web
            </Badge>
            <h2
              className="text-[clamp(1.75rem,3.5vw,2.75rem)] font-bold text-[#e5e2e1] tracking-tight mb-4"
              style={{ fontFamily: "Manrope, sans-serif" }}
            >
              Works everywhere
              <br />
              <span className="text-[#91d78a]">your farm is</span>
            </h2>
            <p
              className="text-[#8a9386] leading-relaxed mb-8"
              style={{ fontFamily: "Inter, sans-serif" }}
            >
              A fully responsive Next.js app optimised for mobile first. The
              dashboard updates in real-time whether you&#39;re on your phone in
              the field or at your desktop at home.
            </p>

            <div className="space-y-4">
              {[
                { icon: Smartphone, title: "Progressive Web App", desc: "Install to home screen, works offline with cached sensor data." },
                { icon: Globe, title: "Works on any browser", desc: "Chrome, Firefox, Safari — no native app install required." },
                { icon: Zap, title: "Real-time sync", desc: "Firebase WebSocket connection keeps your dashboard live 24/7." },
              ].map((item) => (
                <div key={item.title} className="flex gap-4 items-start">
                  <div className="w-9 h-9 rounded-[0.75rem] bg-[#1b5e20]/20 border border-[#91d78a]/15 flex items-center justify-center shrink-0 mt-0.5">
                    <item.icon className="w-4 h-4 text-[#91d78a]" />
                  </div>
                  <div>
                    <p
                      className="text-sm font-semibold text-[#e5e2e1] mb-0.5"
                      style={{ fontFamily: "Manrope, sans-serif" }}
                    >
                      {item.title}
                    </p>
                    <p
                      className="text-sm text-[#8a9386]"
                      style={{ fontFamily: "Inter, sans-serif" }}
                    >
                      {item.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Two phone mockups */}
          <div className="relative flex justify-center gap-4">
            <div className="w-40 mt-8">
              <ImgPlaceholder
                label="Mobile dashboard"
                aspectRatio="aspect-[9/16]"
                className="w-full"
              />
            </div>
            <div className="w-40">
              <ImgPlaceholder
                label="Mobile scan screen"
                aspectRatio="aspect-[9/16]"
                className="w-full"
              />
            </div>
            {/* Background glow */}
            <div className="absolute inset-0 -z-10 bg-[#1b5e20]/10 blur-[60px] rounded-full" />
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── Pricing ─────────────────────────────────────────────────────────────────
function Pricing() {
  const plans = [
    {
      name: "Free",
      price: "0",
      period: "forever",
      desc: "Perfect for a single field and one device.",
      features: [
        "1 IoT sensor node",
        "50 AI diagnoses / month",
        "7-day data history",
        "Weather dashboard",
        "Community support",
      ],
      cta: "Get started free",
      highlight: false,
    },
    {
      name: "Farmer",
      price: "299",
      period: "per month (ETB)",
      desc: "For serious farmers managing multiple fields.",
      features: [
        "Up to 5 sensor nodes",
        "Unlimited AI diagnoses",
        "1-year data history",
        "Advanced analytics",
        "Push notifications",
        "Priority support",
      ],
      cta: "Start free trial",
      highlight: true,
    },
    {
      name: "Cooperative",
      price: "Custom",
      period: "contact us",
      desc: "For agricultural cooperatives and NGOs.",
      features: [
        "Unlimited sensor nodes",
        "Unlimited AI diagnoses",
        "Full data export",
        "Agronomist dashboard",
        "Dedicated support",
        "On-site training",
      ],
      cta: "Contact us",
      highlight: false,
    },
  ];

  return (
    <section id="pricing" className="py-24">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <div className="text-center mb-16">
          <Badge
            variant="outline"
            className="mb-4 border-[#41493e] text-[#91d78a] bg-[#1b5e20]/10 text-[10px] font-bold uppercase tracking-widest px-3 py-1"
          >
            Pricing
          </Badge>
          <h2
            className="text-[clamp(1.75rem,3.5vw,2.75rem)] font-bold text-[#e5e2e1] tracking-tight"
            style={{ fontFamily: "Manrope, sans-serif" }}
          >
            Simple, transparent pricing
          </h2>
          <p
            className="mt-4 text-[#8a9386] text-base"
            style={{ fontFamily: "Inter, sans-serif" }}
          >
            Start free. Upgrade when your farm grows.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-5 items-start">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={cn(
                "relative rounded-[1rem] p-6 border",
                plan.highlight
                  ? "bg-[#1b5e20]/20 border-[#91d78a]/40"
                  : "bg-[#1c1b1b] border-[#41493e]"
              )}
            >
              {plan.highlight && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#91d78a] text-[#003909] text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full">
                  Most popular
                </div>
              )}
              <div className="mb-5">
                <p
                  className="text-sm font-bold text-[#91d78a] uppercase tracking-widest mb-2"
                  style={{ fontFamily: "Inter, sans-serif" }}
                >
                  {plan.name}
                </p>
                <div className="flex items-end gap-1.5 mb-1">
                  {plan.price !== "Custom" && (
                    <span
                      className="text-4xl font-bold text-[#e5e2e1]"
                      style={{ fontFamily: "Manrope, sans-serif" }}
                    >
                      {plan.price === "0" ? "Free" : `${plan.price}`}
                    </span>
                  )}
                  {plan.price === "Custom" && (
                    <span
                      className="text-3xl font-bold text-[#e5e2e1]"
                      style={{ fontFamily: "Manrope, sans-serif" }}
                    >
                      Custom
                    </span>
                  )}
                  {plan.price !== "0" && plan.price !== "Custom" && (
                    <span
                      className="text-xs text-[#8a9386] mb-1.5"
                      style={{ fontFamily: "Inter, sans-serif" }}
                    >
                      ETB/{" "}mo
                    </span>
                  )}
                </div>
                <p
                  className="text-sm text-[#8a9386]"
                  style={{ fontFamily: "Inter, sans-serif" }}
                >
                  {plan.desc}
                </p>
              </div>

              <ul className="space-y-2.5 mb-6">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-[#91d78a] shrink-0 mt-0.5" />
                    <span
                      className="text-sm text-[#c0c9bb]"
                      style={{ fontFamily: "Inter, sans-serif" }}
                    >
                      {f}
                    </span>
                  </li>
                ))}
              </ul>

              <Link href={plan.price === "Custom" ? "#contact" : "/auth/register"}>
                <Button
                  className={cn(
                    "w-full h-10 text-sm font-semibold rounded-[0.5rem] transition-all",
                    plan.highlight
                      ? "bg-[#91d78a] hover:bg-[#acf4a4] text-[#003909]"
                      : "bg-transparent border border-[#41493e] text-[#c0c9bb] hover:bg-[#201f1f] hover:border-[#8a9386] hover:text-[#e5e2e1]"
                  )}
                >
                  {plan.cta}
                </Button>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── CTA / Newsletter ─────────────────────────────────────────────────────────
function CTA() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  return (
    <section className="py-24 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-[#1b5e20]/10 pointer-events-none" />
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-150 h-100 bg-[#1b5e20]/20 blur-[100px] rounded-full" />
      </div>

      <div className="relative max-w-2xl mx-auto px-4 md:px-8 text-center">
        <h2
          className="text-[clamp(1.75rem,4vw,3rem)] font-bold text-[#e5e2e1] tracking-tight mb-4"
          style={{ fontFamily: "Manrope, sans-serif" }}
        >
          Ready to transform
          <br />
          <span className="text-[#91d78a]">your farm?</span>
        </h2>
        <p
          className="text-[#8a9386] mb-8 leading-relaxed"
          style={{ fontFamily: "Inter, sans-serif" }}
        >
          Join 1,200+ farmers already using AgriSense. Sign up free — no
          credit card, no commitment. Get your first AI diagnosis in under 5
          minutes.
        </p>

        {submitted ? (
          <div className="flex items-center justify-center gap-2 text-[#91d78a]">
            <CheckCircle2 className="w-5 h-5" />
            <span
              className="font-semibold"
              style={{ fontFamily: "Manrope, sans-serif" }}
            >
              You&#39;re on the list! We&#39;ll be in touch.
            </span>
          </div>
        ) : (
          <div className="flex gap-2 max-w-md mx-auto">
            <Input
              type="email"
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="h-12 flex-1 rounded-[0.5rem] bg-[#1c1b1b] border-[#41493e] text-[#e5e2e1] placeholder:text-[#8a9386] focus-visible:ring-[#91d78a] focus-visible:border-[#91d78a] text-sm"
            />
            <Button
              onClick={() => email && setSubmitted(true)}
              className="h-12 px-6 text-sm font-semibold rounded-[0.5rem] bg-[#91d78a] hover:bg-[#acf4a4] text-[#003909] whitespace-nowrap transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              Join waitlist
            </Button>
          </div>
        )}

        <p
          className="text-xs text-[#41493e] mt-4"
          style={{ fontFamily: "Inter, sans-serif" }}
        >
          Or{" "}
          <Link
            href="/auth/register"
            className="text-[#91d78a] hover:underline"
          >
            create your account now →
          </Link>
        </p>
      </div>
    </section>
  );
}

// ─── Footer ───────────────────────────────────────────────────────────────────
function Footer() {
  return (
    <footer className="border-t border-[#41493e] bg-[#0e0e0e]">
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-12">
        <div className="grid md:grid-cols-4 gap-8 mb-10">
          {/* Brand */}
          <div className="md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-7 h-7 rounded-[0.5rem] bg-[#1b5e20] border border-[#91d78a]/30 flex items-center justify-center">
                <Leaf className="w-3.5 h-3.5 text-[#91d78a]" />
              </div>
              <span
                className="text-[#e5e2e1] font-bold text-sm"
                style={{ fontFamily: "Manrope, sans-serif" }}
              >
                AgriSense
              </span>
            </div>
            <p
              className="text-xs text-[#8a9386] leading-relaxed"
              style={{ fontFamily: "Inter, sans-serif" }}
            >
              AI-powered precision agriculture for Ethiopian farmers. Built at
              ASTU.
            </p>
          </div>

          {/* Links */}
          {[
            {
              heading: "Product",
              links: ["Features", "How it works", "Pricing", "Changelog"],
            },
            {
              heading: "Resources",
              links: ["Documentation", "Firmware", "API Reference", "GitHub"],
            },
            {
              heading: "Company",
              links: ["About", "Blog", "Privacy", "Terms"],
            },
          ].map((col) => (
            <div key={col.heading}>
              <p
                className="text-xs font-bold uppercase tracking-widest text-[#8a9386] mb-4"
                style={{ fontFamily: "Inter, sans-serif" }}
              >
                {col.heading}
              </p>
              <ul className="space-y-2.5">
                {col.links.map((l) => (
                  <li key={l}>
                    <a
                      href="#"
                      className="text-sm text-[#41493e] hover:text-[#91d78a] transition-colors"
                      style={{ fontFamily: "Inter, sans-serif" }}
                    >
                      {l}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-t border-[#41493e] pt-6 flex flex-col md:flex-row items-center justify-between gap-3">
          <p
            className="text-xs text-[#41493e]"
            style={{ fontFamily: "Inter, sans-serif" }}
          >
            © 2026 AgriSense · Team AgriTech Integrators · ASTU · Built with
            Next.js + Claude API
          </p>
          <div className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-[#91d78a] animate-pulse" />
            <span
              className="text-xs text-[#8a9386]"
              style={{ fontFamily: "Inter, sans-serif" }}
            >
              All systems operational
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#131313] text-[#e5e2e1]">
      <Navbar />
      <Hero />
      <Stats />
      <Features />
      <HowItWorks />
      <AppPreview />
      <Testimonials />
      <Pricing />
      <CTA />
      <Footer />
    </div>
  );
}
