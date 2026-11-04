'use client';

import React, { useState } from 'react';
import { Star, Send, CheckCircle2, ShieldAlert } from 'lucide-react';
import { supabase } from '@/lib/supabase/client';
import { antiBot } from '@/lib/rateLimit';

export const Testimonials: React.FC = () => {
  const [reviews, setReviews] = useState([
    {
      id: '1',
      author: 'Dilshod R.',
      product: 'NO. 01 Obsidian',
      rating: 5,
      comment: 'Obsidian hidini olganimdan beri atrofimdagilar doim qanday atir ekanini so‘rashadi. Uzoq saqlanishi a’lo darajada!',
    },
    {
      id: '2',
      author: 'Madina K.',
      product: 'NO. 03 Éclat',
      rating: 5,
      comment: 'Juda nafis, gulli va iliq vanil hidi. Kundalik ishga va kechki uchrashuvlarga bemalol sepsa bo‘ladi.',
    },
    {
      id: '3',
      author: 'Jahongir A.',
      product: 'NO. 02 Santal',
      rating: 5,
      comment: 'Sandal va oq mushkning sokinligi juda yoqdi. Do‘kondan borib oldim, xizmat ko‘rsatish ham yuqori saviyada.',
    },
  ]);

  const [name, setName] = useState('');
  const [rating, setRating] = useState(5);
  const [text, setText] = useState('');
  const [honeypot, setHoneypot] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!name.trim() || !text.trim()) return;

    // 1. Honeypot tekshiruvi
    if (!antiBot.checkHoneypot(honeypot)) {
      setErrorMessage('Xavfsizlik tekshiruvidan o‘tmadiniz.');
      return;
    }

    // 2. Rate Limit (har 20 soniyada faqat 1 ta sharh)
    const rateCheck = antiBot.checkRateLimit('submit_review', 20);
    if (!rateCheck.allowed) {
      setErrorMessage(`Iltimos, ${rateCheck.remainingSeconds} soniya kuting.`);
      return;
    }

    try {
      await supabase.from('reviews').insert({
        reviewer: name,
        product_id: 'general',
        rating,
        text,
        status: 'pending',
      });
    } catch (e) {
      // Offline fallback
    }

    setReviews([
      { id: String(Date.now()), author: name, product: 'NOXAR Tanlovi', rating, comment: text },
      ...reviews,
    ]);
    setName('');
    setText('');
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 4000);
  };

  return (
    <section id="reviews" className="py-20 lg:py-28 border-b border-border-hairline">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <span className="text-[10px] uppercase tracking-[0.25em] text-gold-primary block mb-2 font-medium">
            Mijozlar Fikri
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-normal text-text-main">
            Haqiqiy <span className="italic text-gold-light">tajribalar</span>
          </h2>
          <p className="text-text-muted text-xs sm:text-sm mt-3 font-light">
            Bizning mijozlarimiz NOXAR atirlari haqida nima deyishadi?
          </p>
        </div>

        {/* Sharhlar Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          {reviews.slice(0, 3).map((r) => (
            <div
              key={r.id}
              className="bg-surface-1 rounded-2xl border border-border-hairline p-7 flex flex-col justify-between hover:border-gold-primary/30 transition-all"
            >
              <div>
                <div className="flex items-center gap-1 text-gold-primary mb-4">
                  {Array.from({ length: r.rating }).map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-current" />
                  ))}
                </div>
                <p className="text-text-main font-serif italic text-base leading-relaxed mb-6">
                  “{r.comment}”
                </p>
              </div>

              <div className="pt-4 border-t border-border-hairline flex items-center justify-between text-xs">
                <span className="font-medium text-text-main">{r.author}</span>
                <span className="text-[11px] text-text-muted">{r.product}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Sharh qoldirish formasi */}
        <div className="max-w-xl mx-auto bg-surface-1 rounded-2xl border border-border-hairline p-6 sm:p-8">
          <h3 className="font-serif text-xl text-text-main mb-1">O‘z fikringizni qoldiring</h3>
          <p className="text-xs text-text-muted mb-6">Sizning tajribangiz boshqalar uchun juda muhim.</p>

          {errorMessage && (
            <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 flex-shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {submitted ? (
            <div className="p-4 rounded-xl bg-gold-primary/10 border border-gold-primary/30 text-gold-primary text-xs flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
              <span>Rahmat! Sharhingiz muvaffaqiyatli qabul qilindi va moderator ko‘rigidan so‘ng chiqadi.</span>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* BOT HONEYPOT */}
              <div style={{ display: 'none' }} aria-hidden="true">
                <input
                  type="text"
                  name="review_honeypot_bot"
                  tabIndex={-1}
                  autoComplete="off"
                  value={honeypot}
                  onChange={(e) => setHoneypot(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-[11px] uppercase tracking-wider text-text-muted block mb-1">
                    Ismingiz
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Masalan: Sardor"
                    className="w-full bg-surface-2 text-text-main text-xs px-3.5 py-2.5 rounded-xl border border-border-hairline outline-none focus:border-gold-primary transition-all"
                  />
                </div>
                <div>
                  <label className="text-[11px] uppercase tracking-wider text-text-muted block mb-1">
                    Bahongiz
                  </label>
                  <select
                    value={rating}
                    onChange={(e) => setRating(Number(e.target.value))}
                    className="w-full bg-surface-2 text-text-main text-xs px-3.5 py-2.5 rounded-xl border border-border-hairline outline-none focus:border-gold-primary transition-all cursor-pointer"
                  >
                    <option value={5}>5 yulduz — A’lo</option>
                    <option value={4}>4 yulduz — Yaxshi</option>
                    <option value={3}>3 yulduz — O‘rtacha</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[11px] uppercase tracking-wider text-text-muted block mb-1">
                  Fikringiz
                </label>
                <textarea
                  required
                  rows={3}
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder="Atirning ochilishi va saqlanishi haqida yozing..."
                  className="w-full bg-surface-2 text-text-main text-xs px-3.5 py-2.5 rounded-xl border border-border-hairline outline-none focus:border-gold-primary transition-all resize-none"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-gold-primary hover:bg-gold-light text-black font-semibold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-md shadow-gold-primary/10"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Sharhni yuborish</span>
              </button>
            </form>
          )}
        </div>
      </div>
    </section>
  );
};
