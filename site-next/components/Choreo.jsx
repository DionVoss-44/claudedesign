'use client';

/* Scroll choreography, ported from the vanilla build:
   Lenis smooth scroll on the GSAP ticker (the canonical wiring from
   Lenis' own docs), hero entrance, data-reveal scroll-ins, the pinned
   manifesto word-reveal, nav active states, the access form, and the
   brain's travel between sections via the shared pose. */

import { useEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';
import { pose } from '../lib/pose';

export default function Choreo() {
  useEffect(() => {
    const REDUCED = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    /* access form works regardless of motion preferences */
    const accessForm = document.querySelector('.access-form');
    const onSubmit = (e) => {
      e.preventDefault();
      const input = accessForm.querySelector('.access-input');
      if (!input.value || input.value.indexOf('@') === -1) {
        input.focus();
        return;
      }
      accessForm.hidden = true;
      document.querySelector('.access-done').hidden = false;
    };
    if (accessForm) accessForm.addEventListener('submit', onSubmit);

    if (REDUCED) {
      document.documentElement.classList.add('reduced-motion');
      return () => {
        if (accessForm) accessForm.removeEventListener('submit', onSubmit);
      };
    }

    gsap.registerPlugin(ScrollTrigger);

    const lenis = new Lenis({ duration: 1.15, smoothWheel: true, anchors: true });
    lenis.on('scroll', ScrollTrigger.update);
    const tick = (time) => lenis.raf(time * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);

    const ctx = gsap.context(() => {
      /* hero entrance */
      const heroItems = gsap.utils.toArray('.hero [data-reveal]');
      gsap.to(heroItems, {
        opacity: 1,
        y: 0,
        duration: 1.1,
        ease: 'power3.out',
        stagger: 0.14,
        delay: 0.25,
      });

      /* scroll reveals */
      gsap.utils.toArray('[data-reveal]').forEach((el) => {
        if (heroItems.indexOf(el) !== -1) return;
        gsap.to(el, {
          opacity: 1,
          y: 0,
          duration: 1.0,
          ease: 'power3.out',
          scrollTrigger: { trigger: el, start: 'top 82%' },
        });
      });

      /* manifesto word reveal */
      const manifesto = document.querySelector('.manifesto-text');
      if (manifesto) {
        const splitWords = (node) => {
          let out = [];
          Array.prototype.slice.call(node.childNodes).forEach((child) => {
            if (child.nodeType === Node.TEXT_NODE) {
              const frag = document.createDocumentFragment();
              child.textContent.split(/(\s+)/).forEach((piece) => {
                if (piece.trim() === '') {
                  frag.appendChild(document.createTextNode(piece));
                } else {
                  const span = document.createElement('span');
                  span.className = 'word';
                  span.textContent = piece;
                  frag.appendChild(span);
                  out.push(span);
                }
              });
              node.replaceChild(frag, child);
            } else if (child.nodeType === Node.ELEMENT_NODE) {
              out = out.concat(splitWords(child));
            }
          });
          return out;
        };
        const words = splitWords(manifesto);
        gsap.to(words, {
          color: (i, el) => (el.closest('.em') ? '#ffb829' : '#ffffff'),
          stagger: 0.06,
          ease: 'none',
          scrollTrigger: {
            trigger: '.manifesto',
            start: 'top top',
            end: '+=170%',
            pin: true,
            scrub: 0.6,
          },
        });
      }

      /* the brain's journey */
      [
        ['section[aria-label="The problem"]', { x: 0.26, y: 0.5, s: 0.95, a: 1, r: 0.9 }],
        ['.manifesto', { x: 0.5, y: 0.5, s: 1.6, a: 0.12, r: 1.8 }],
        ['#platform', { x: 0.76, y: 0.48, s: 0.9, a: 0.3, r: 2.7 }],
        ['#contact', { x: 0.68, y: 0.44, s: 1.15, a: 0.75, r: 3.6 }],
      ].forEach(([trigger, vars]) => {
        gsap.to(pose, {
          ...vars,
          ease: 'none',
          immediateRender: false,
          scrollTrigger: { trigger, start: 'top bottom', end: 'top top', scrub: 0.6 },
        });
      });

      /* nav active state */
      [
        ['#manifesto', 'manifesto'],
        ['#platform', 'platform'],
        ['#contact', 'contact'],
      ].forEach(([sel, nav]) => {
        const section = document.querySelector(sel);
        const link = document.querySelector(`[data-nav="${nav}"]`);
        if (!section || !link) return;
        ScrollTrigger.create({
          trigger: section,
          start: 'top 50%',
          end: 'bottom 50%',
          onToggle: (self) => link.classList.toggle('is-active', self.isActive),
        });
      });
    });

    return () => {
      ctx.revert();
      gsap.ticker.remove(tick);
      lenis.destroy();
      if (accessForm) accessForm.removeEventListener('submit', onSubmit);
    };
  }, []);

  return null;
}
