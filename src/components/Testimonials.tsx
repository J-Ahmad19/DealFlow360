import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Star, Quote } from 'lucide-react';

const testimonials = [
  {
    name: 'Sarah Chen',
    role: 'VP of Sales',
    company: 'TechVenture',
    quote:
      'DealFlow360 transformed our entire sales process. We went from 14-day deal cycles to under 5. The AI-powered discount governance alone saved us $2.3M in margin leakage last quarter.',
    rating: 5,
    avatar: 'SC',
    color: 'bg-brand-500',
  },
  {
    name: 'Marcus Rodriguez',
    role: 'Head of Revenue Operations',
    company: 'GlobalTrade',
    quote:
      'The multi-warehouse fulfillment module is a game changer. We process 3x more orders with the same team, and our customers love the real-time tracking. The ROI was clear within 60 days.',
    rating: 5,
    avatar: 'MR',
    color: 'bg-secondary-400',
  },
  {
    name: 'Emily Watson',
    role: 'CFO',
    company: 'InnovateCo',
    quote:
      'Finally, a platform that bridges sales and finance seamlessly. The hybrid billing engine handles our complex multi-model pricing without a single manual intervention. It\'s like having an extra finance team.',
    rating: 5,
    avatar: 'EW',
    color: 'bg-blue-400',
  },
  {
    name: 'David Kim',
    role: 'Sales Director',
    company: 'CloudScale',
    quote:
      'The deal health monitoring is pure gold. It flagged at-risk deals we would have lost, and the cross-sell recommendations boosted our average deal value by 28%. Our reps actually love using it.',
    rating: 5,
    avatar: 'DK',
    color: 'bg-warning-500',
  },
];

export default function Testimonials() {
  const [current, setCurrent] = useState(0);

  const next = () => setCurrent((prev) => (prev + 1) % testimonials.length);
  const prev = () => setCurrent((prev) => (prev - 1 + testimonials.length) % testimonials.length);

  return (
    <section id="testimonials" className="py-24 lg:py-32 bg-slate-50 relative">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-sm font-bold text-secondary-500 uppercase tracking-widest mb-4"
          >
            Customer Testimonials
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="font-display text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 leading-tight"
          >
            Loved by revenue teams worldwide
          </motion.h2>
        </div>

        <div className="max-w-4xl mx-auto">
          <div className="relative">
            <div className="card-tactile rounded-3xl p-8 sm:p-12 lg:p-16 relative">
              <Quote
                size={48}
                className="absolute top-8 left-8 text-brand-100"
              />

              <AnimatePresence mode="wait">
                <motion.div
                  key={current}
                  initial={{ opacity: 0, x: 30 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -30 }}
                  transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                  className="relative z-10"
                >
                  <div className="flex items-center gap-1 mb-6">
                    {Array.from({ length: testimonials[current].rating }).map((_, i) => (
                      <Star
                        key={i}
                        size={20}
                        className="fill-warning-500 text-warning-500"
                      />
                    ))}
                  </div>

                  <blockquote className="font-display text-xl sm:text-2xl lg:text-[1.7rem] font-bold text-slate-800 leading-relaxed mb-8">
                    &ldquo;{testimonials[current].quote}&rdquo;
                  </blockquote>

                  <div className="flex items-center gap-4">
                    <div
                      className={`w-14 h-14 rounded-2xl ${testimonials[current].color} flex items-center justify-center text-white font-display font-black text-lg border-2 border-transparent shadow-sm`}
                    >
                      {testimonials[current].avatar}
                    </div>
                    <div>
                      <p className="font-display font-black text-slate-900 text-lg">
                        {testimonials[current].name}
                      </p>
                      <p className="text-sm font-bold text-slate-500">
                        {testimonials[current].role} at {testimonials[current].company}
                      </p>
                    </div>
                  </div>
                </motion.div>
              </AnimatePresence>

              <div className="flex items-center justify-between mt-10 pt-8 border-t-2 border-slate-100">
                <div className="flex items-center gap-3">
                  {testimonials.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setCurrent(idx)}
                      className={`h-3 rounded-full transition-all duration-300 ${
                        idx === current
                          ? 'bg-brand-500 w-10'
                          : 'bg-slate-200 hover:bg-slate-300 w-3'
                      }`}
                      aria-label={`Go to testimonial ${idx + 1}`}
                    />
                  ))}
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={prev}
                    className="btn-tactile btn-secondary w-12 h-12 rounded-xl flex items-center justify-center p-0"
                    aria-label="Previous testimonial"
                  >
                    <ChevronLeft size={20} />
                  </button>
                  <button
                    onClick={next}
                    className="btn-tactile btn-secondary w-12 h-12 rounded-xl flex items-center justify-center p-0"
                    aria-label="Next testimonial"
                  >
                    <ChevronRight size={20} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
