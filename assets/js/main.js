/* Cluster AI — scroll choreography.
   Lenis smooth scroll + GSAP ScrollTrigger. Motion is slow, eases out,
   and always resolves upward. The manifesto is a pinned typographic
   monument whose words brighten as you scroll. */

(function () {
  'use strict';

  document.documentElement.classList.remove('no-js');

  var REDUCED = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (REDUCED || !window.gsap) {
    document.documentElement.classList.add('reduced-motion');
    return;
  }

  gsap.registerPlugin(ScrollTrigger);

  /* ---------------- smooth scroll ---------------- */

  var lenis = new Lenis({
    duration: 1.15,
    smoothWheel: true,
    anchors: true
  });
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add(function (time) {
    lenis.raf(time * 1000);
  });
  gsap.ticker.lagSmoothing(0);

  /* ---------------- hero entrance ---------------- */

  var heroItems = gsap.utils.toArray('.hero [data-reveal]');
  gsap.to(heroItems, {
    opacity: 1,
    y: 0,
    duration: 1.1,
    ease: 'power3.out',
    stagger: 0.14,
    delay: 0.25
  });

  /* ---------------- scroll reveals ---------------- */

  gsap.utils.toArray('[data-reveal]').forEach(function (el) {
    if (heroItems.indexOf(el) !== -1) return;
    gsap.to(el, {
      opacity: 1,
      y: 0,
      duration: 1.0,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: el,
        start: 'top 82%'
      }
    });
  });

  /* ---------------- manifesto word reveal ---------------- */

  var manifesto = document.querySelector('.manifesto-text');
  if (manifesto) {
    /* split into word spans, preserving the amber .em phrase */
    var splitWords = function (node) {
      var out = [];
      Array.prototype.slice.call(node.childNodes).forEach(function (child) {
        if (child.nodeType === Node.TEXT_NODE) {
          var frag = document.createDocumentFragment();
          child.textContent.split(/(\s+)/).forEach(function (piece) {
            if (piece.trim() === '') {
              frag.appendChild(document.createTextNode(piece));
            } else {
              var span = document.createElement('span');
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

    var words = splitWords(manifesto);

    gsap.to(words, {
      color: function (i, el) {
        return el.closest('.em') ? '#ffb829' : '#ffffff';
      },
      stagger: 0.06,
      ease: 'none',
      scrollTrigger: {
        trigger: '.manifesto',
        start: 'top top',
        end: '+=170%',
        pin: true,
        scrub: 0.6
      }
    });
  }

  /* ---------------- nav active state ---------------- */

  [
    ['#manifesto', 'manifesto'],
    ['#platform', 'platform'],
    ['#contact', 'contact']
  ].forEach(function (pair) {
    var section = document.querySelector(pair[0]);
    var link = document.querySelector('[data-nav="' + pair[1] + '"]');
    if (!section || !link) return;
    ScrollTrigger.create({
      trigger: section,
      start: 'top 50%',
      end: 'bottom 50%',
      onToggle: function (self) {
        link.classList.toggle('is-active', self.isActive);
      }
    });
  });
})();
