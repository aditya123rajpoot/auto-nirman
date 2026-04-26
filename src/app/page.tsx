'use client';

import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import Image from 'next/image';
import dynamic from 'next/dynamic';
import RobotAssistant from '@/components/RobotAssistant';
import { FaCheckCircle, FaArrowRight, FaStar, FaQuoteLeft, FaChartLine, FaLock, FaLightbulb } from 'react-icons/fa';

import constructionAnim from '@/lotties/construction.json';
import aiAnim from '@/lotties/ai.json';
import blueprintAnim from '@/lotties/blueprint.json';

const Lottie = dynamic(() => import('lottie-react'), { ssr: false });

const features = [
  {
    lottie: constructionAnim,
    title: 'BOQ Analysis',
    desc: 'Upload your Bill of Quantities and detect cost leakages instantly with AI precision.',
    icon: FaChartLine,
  },
  {
    lottie: aiAnim,
    title: 'AI Cost Intelligence',
    desc: 'Compare vendor rates against benchmarks and flag anomalies before they drain your budget.',
    icon: FaLightbulb,
  },
  {
    lottie: blueprintAnim,
    title: 'Smart Planning',
    desc: 'Generate construction plans, timelines and risk reports — all in one place.',
    icon: FaLock,
  },
];

const stats = [
  { value: '₹1Cr+', label: 'Average savings per project' },
  { value: '95%', label: 'BOQ accuracy rate' },
  { value: '10x', label: 'Faster than manual audits' },
  { value: '500+', label: 'Projects analysed' },
];

const testimonials = [
  {
    name: 'Rajesh Kumar',
    company: 'Kumar Real Estate, Lucknow',
    text: 'Auto Nirman saved us ₹2.3 crores on our last project. The BOQ analysis caught vendor inflation we would have missed.',
    stars: 5,
  },
  {
    name: 'Priya Sharma',
    company: 'Sharma Constructions, Kanpur',
    text: 'Best investment for any mid-size developer. Caught duplicate line items worth ₹40 lakh in 15 minutes.',
    stars: 5,
  },
  {
    name: 'Vikram Singh',
    company: 'Singh Builders, Agra',
    text: 'The PDF reports are so detailed, our CFO uses them directly in board meetings. Impressed.',
    stars: 5,
  },
];

const pricingPlans = [
  {
    name: 'Starter',
    price: '₹2.5L',
    desc: 'Perfect for your first project',
    features: ['1 BOQ Analysis', 'PDF Report', 'Email Support', '30 days validity'],
  },
  {
    name: 'Professional',
    price: '₹8L',
    desc: 'Most popular for mid-size developers',
    features: ['5 BOQ Analyses', 'Priority Support', 'Custom Benchmarks', 'API Access', '90 days validity'],
    popular: true,
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    desc: 'For large-scale operations',
    features: ['Unlimited Analyses', 'Dedicated Manager', 'Custom Integration', 'Training Included', 'Annual contract'],
  },
];

export default function Home() {
  const router = useRouter();

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.2, delayChildren: 0.3 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8 } },
  };

  return (
    <main className="relative bg-black text-white overflow-hidden">

      {/* ── Background ── */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,_#38bdf811_1px,_transparent_0)] [background-size:18px_18px] opacity-10" />
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 via-purple-900/10 to-black" />
      </div>

      {/* ── HERO ── */}
      <section className="relative z-10 min-h-screen flex flex-col items-center justify-center text-center px-4 pt-20">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <Image
            src="/logo.png"
            alt="Auto Nirman Logo"
            width={100}
            height={100}
            className="mx-auto mb-6 drop-shadow-[0_0_20px_#38bdf8] animate-pulse"
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="inline-flex items-center gap-2 bg-blue-400/10 border border-blue-400/30 rounded-full px-4 py-1.5 text-blue-300 text-sm mb-6"
        >
          <span className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" />
          AI-Powered Infrastructure Intelligence
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-5xl md:text-7xl font-extrabold leading-tight mb-6 max-w-4xl"
        >
          <span className="bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
            Build Smarter.
          </span>
          <br />
          <span className="text-white">Save Crores.</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="text-lg md:text-xl text-slate-400 max-w-2xl mb-10"
        >
          Auto Nirman detects cost leakage in your BOQ before construction begins.
          Even a 1% error on a ₹100Cr project costs ₹1 Crore. We fix that.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="flex flex-col sm:flex-row gap-4"
        >
          <motion.button
            whileHover={{ scale: 1.05, boxShadow: '0 0 30px #38bdf8' }}
            whileTap={{ scale: 0.95 }}
            onClick={() => router.push('/login')}
            className="bg-blue-500 hover:bg-blue-400 px-8 py-4 rounded-xl text-lg font-semibold shadow-[0_0_20px_#38bdf855] transition-all flex items-center justify-center gap-2"
          >
            Get Started Free
            <FaArrowRight size={16} />
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => router.push('/dashboard')}
            className="border border-white/20 hover:border-blue-400 px-8 py-4 rounded-xl text-lg font-semibold transition-all hover:shadow-[0_0_20px_#38bdf833]"
          >
            View Dashboard →
          </motion.button>
        </motion.div>

        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="absolute bottom-10 left-1/2 -translate-x-1/2 text-slate-600 text-sm flex flex-col items-center gap-1"
        >
          <span>Scroll to explore</span>
          <span className="text-xl">↓</span>
        </motion.div>
      </section>

      {/* ── STATS ── */}
      <section className="relative z-10 py-20 px-4">
        <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6">
          {stats.map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="bg-white/5 backdrop-blur border border-white/10 rounded-2xl p-6 text-center hover:border-blue-400/50 transition-all"
            >
              <p className="text-3xl font-extrabold text-blue-400 mb-1">{stat.value}</p>
              <p className="text-xs text-slate-400">{stat.label}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section className="relative z-10 py-20 px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-5xl mx-auto text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Everything you need to{' '}
            <span className="bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
              eliminate waste
            </span>
          </h2>
          <p className="text-slate-400">
            Built specifically for Indian real estate developers managing complex, high-value projects.
          </p>
        </motion.div>

        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map((feature, i) => {
            const IconComponent = feature.icon;
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
                whileHover={{ scale: 1.03, borderColor: '#38bdf8' }}
                className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-6 flex flex-col items-center text-center hover:shadow-[0_0_30px_#38bdf822] transition-all group"
              >
                <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-20 h-1 bg-gradient-to-r from-transparent via-blue-400 to-transparent rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="w-32 h-32 mb-4">
                  <Lottie animationData={feature.lottie} loop autoplay />
                </div>
                <IconComponent className="text-blue-400 text-2xl mb-3 opacity-70" />
                <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                <p className="text-sm text-slate-400 leading-relaxed">{feature.desc}</p>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section className="relative z-10 py-20 px-4">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-3xl md:text-4xl font-bold text-center mb-16"
        >
          How it works
        </motion.h2>
        <div className="max-w-3xl mx-auto space-y-6">
          {[
            { step: '01', title: 'Upload your BOQ', desc: 'Drop your Excel or PDF Bill of Quantities into Auto Nirman in seconds.' },
            { step: '02', title: 'AI analyzes instantly', desc: 'Our engine compares every line item against benchmark rates and flags anomalies.' },
            { step: '03', title: 'Get your leakage report', desc: 'Download a detailed PDF showing exactly where money is being lost and how to fix it.' },
          ].map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15 }}
              className="flex items-start gap-6 bg-white/5 backdrop-blur border border-white/10 rounded-2xl p-6 hover:border-blue-400/40 transition-all group"
            >
              <span className="text-4xl font-extrabold text-blue-400/30 shrink-0 group-hover:text-blue-400/50 transition-colors">{item.step}</span>
              <div className="text-left">
                <h3 className="text-lg font-semibold mb-1">{item.title}</h3>
                <p className="text-sm text-slate-400">{item.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section className="relative z-10 py-20 px-4">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-3xl md:text-4xl font-bold text-center mb-16"
        >
          Trusted by developers across India
        </motion.h2>
        <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((testimonial, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="bg-white/5 backdrop-blur border border-white/10 rounded-2xl p-6"
            >
              <div className="flex gap-1 mb-3">
                {[...Array(testimonial.stars)].map((_, j) => (
                  <FaStar key={j} className="text-yellow-400" size={14} />
                ))}
              </div>
              <FaQuoteLeft className="text-blue-400/30 text-xl mb-3" />
              <p className="text-sm text-slate-300 mb-4 leading-relaxed">"{testimonial.text}"</p>
              <div>
                <p className="font-semibold text-sm">{testimonial.name}</p>
                <p className="text-xs text-slate-500">{testimonial.company}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── PRICING ── */}
      <section className="relative z-10 py-20 px-4">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-3xl md:text-4xl font-bold text-center mb-4"
        >
          Simple, transparent pricing
        </motion.h2>
        <p className="text-center text-slate-400 mb-16 max-w-lg mx-auto">
          Choose the plan that fits your project needs. All plans include full access to our AI engine.
        </p>
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
          {pricingPlans.map((plan, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className={`rounded-2xl p-8 border transition-all ${
                plan.popular
                  ? 'bg-blue-500/10 border-blue-400/50 shadow-[0_0_30px_#38bdf822] scale-105'
                  : 'bg-white/5 border-white/10 hover:border-white/30'
              }`}
            >
              {plan.popular && (
                <div className="inline-block bg-blue-400/20 border border-blue-400/30 rounded-full px-3 py-1 text-xs text-blue-300 font-semibold mb-4">
                  Most Popular
                </div>
              )}
              <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
              <p className="text-slate-400 text-sm mb-4">{plan.desc}</p>
              <p className="text-3xl font-extrabold text-blue-400 mb-6">{plan.price}</p>
              <button
                onClick={() => router.push('/login')}
                className={`w-full py-2.5 rounded-lg font-semibold text-sm mb-6 transition-all ${
                  plan.popular
                    ? 'bg-blue-500 hover:bg-blue-400 text-white'
                    : 'border border-white/20 hover:border-blue-400 text-white'
                }`}
              >
                Get Started
              </button>
              <ul className="space-y-3">
                {plan.features.map((feature, j) => (
                  <li key={j} className="flex items-center gap-3 text-sm text-slate-300">
                    <FaCheckCircle className="text-blue-400 shrink-0" size={14} />
                    {feature}
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="relative z-10 py-24 px-4 text-center">
        <div className="absolute inset-0 bg-blue-500/5 pointer-events-none" />
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-3xl md:text-5xl font-extrabold mb-6"
        >
          Ready to save your first{' '}
          <span className="bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
            ₹1 Crore?
          </span>
        </motion.h2>
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-slate-400 mb-10 max-w-xl mx-auto"
        >
          Join developers across India who are using Auto Nirman to eliminate cost leakage on every project.
        </motion.p>
        <motion.button
          whileHover={{ scale: 1.05, boxShadow: '0 0 40px #38bdf8' }}
          whileTap={{ scale: 0.95 }}
          onClick={() => router.push('/login')}
          className="bg-blue-500 hover:bg-blue-400 px-10 py-4 rounded-xl text-xl font-bold shadow-[0_0_30px_#38bdf855] transition-all inline-flex items-center gap-2"
        >
          Start Free Trial
          <FaArrowRight />
        </motion.button>
      </section>

      {/* ── FOOTER ── */}
      <footer className="relative z-10 border-t border-white/10 py-12 px-4">
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div>
            <h4 className="font-semibold mb-3">Product</h4>
            <ul className="space-y-2 text-sm text-slate-400">
              <li><a href="#" className="hover:text-white transition">Features</a></li>
              <li><a href="#" className="hover:text-white transition">Pricing</a></li>
              <li><a href="#" className="hover:text-white transition">Security</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-3">Company</h4>
            <ul className="space-y-2 text-sm text-slate-400">
              <li><a href="#" className="hover:text-white transition">About</a></li>
              <li><a href="#" className="hover:text-white transition">Blog</a></li>
              <li><a href="#" className="hover:text-white transition">Contact</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-3">Legal</h4>
            <ul className="space-y-2 text-sm text-slate-400">
              <li><a href="#" className="hover:text-white transition">Privacy</a></li>
              <li><a href="#" className="hover:text-white transition">Terms</a></li>
              <li><a href="#" className="hover:text-white transition">Cookies</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-3">Follow</h4>
            <ul className="space-y-2 text-sm text-slate-400">
              <li><a href="#" className="hover:text-white transition">Twitter</a></li>
              <li><a href="#" className="hover:text-white transition">LinkedIn</a></li>
              <li><a href="#" className="hover:text-white transition">GitHub</a></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-white/10 pt-8 text-center text-slate-500 text-sm">
          <p>© 2025 Auto Nirman. Built for Indian real estate developers.</p>
          <p className="mt-1">Lucknow, Uttar Pradesh 🇮🇳</p>
        </div>
      </footer>

      <RobotAssistant />
    </main>
  );
}