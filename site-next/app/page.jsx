import Ambient from '../components/Ambient';
import BrainCanvas from '../components/BrainCanvas';
import Choreo from '../components/Choreo';

export default function Page() {
  return (
    <>
      <Ambient />
      <BrainCanvas />
      <Choreo />

      <header className="nav">
        <div className="wrap nav-inner">
          <a className="brand" href="#top" aria-label="Cluster AI home">
            <svg className="brand-mark" viewBox="0 0 32 32" aria-hidden="true">
              <path d="M15 3.5 L24.5 20 L5.5 20 Z" fill="none" stroke="#8052ff" strokeWidth="2" strokeLinejoin="round" />
              <path d="M23 23 L27.5 29.5 L18.5 29.5 Z" fill="none" stroke="#8052ff" strokeWidth="1.6" strokeLinejoin="round" />
              <path d="M9.5 23.5 L12.5 28 L6.5 28 Z" fill="#8052ff" />
            </svg>
            <span className="brand-word">Cluster</span>
          </a>
          <nav aria-label="Primary">
            <ul className="nav-links">
              <li><a className="ghost-link" data-nav="manifesto" href="#manifesto">Manifesto</a></li>
              <li><a className="ghost-link" data-nav="platform" href="#platform">Platform</a></li>
              <li><a className="ghost-link" data-nav="contact" href="#contact">Contact</a></li>
            </ul>
          </nav>
          <a className="ghost-link nav-cta" href="#contact">Get access</a>
        </div>
      </header>

      <main id="top">
        <section className="hero wrap" aria-label="Introduction">
          <div className="hero-copy">
            <span className="label" data-reveal>Introducing Cluster</span>
            <h1 className="display" data-reveal>Unlock your second&nbsp;brain.</h1>
            <p className="body-copy" data-reveal>
              Stop hunting for answers. Start using them. Cluster connects to every
              system your business runs on and turns scattered knowledge into
              instant, confident answers.
            </p>
            <a className="btn" href="#contact" data-reveal>Request early access</a>
          </div>
          <div className="hero-visual" aria-hidden="true"></div>
        </section>

        <section className="section" aria-label="The problem">
          <div className="wrap split">
            <div className="split-head">
              <h2 className="h-lg" data-reveal>Knowledge, splintered.</h2>
            </div>
            <div className="split-body">
              <span className="label" data-reveal>The problem</span>
              <p className="body-copy" data-reveal>
                Critical knowledge lives as countless fragments scattered across
                hundreds of disparate tools. Your team faces the anxiety of
                bothering a busy coworker again — or aimlessly connecting dots
                with incomplete context.
              </p>
            </div>
          </div>
        </section>

        <section className="manifesto" id="manifesto" aria-label="Manifesto">
          <div className="wrap manifesto-inner">
            <span className="label">Manifesto</span>
            <p className="manifesto-text">
              Cluster is your intelligent, real-time source of truth — eliminating
              the cultural, financial and operational struggles of splintered
              tools. We connect your systems behind the scenes and pull together
              exactly the knowledge you require into one elegant, contextual view.{' '}
              <span className="em">Just ask Cluster</span> for the answer that advances
              your work — and make every decision with more confidence.
            </p>
          </div>
        </section>

        <section className="section" id="platform" aria-label="The platform">
          <div className="wrap split flip">
            <div className="split-head">
              <h2 className="h-lg" data-reveal>Ask once. Know&nbsp;everything.</h2>
            </div>
            <div className="split-body">
              <span className="label" data-reveal>The platform</span>
              <p className="body-copy" data-reveal>
                Docs, chats, tickets, CRMs — Cluster works behind the scenes to
                assemble exactly what you need into one contextual view, the
                moment you ask. No more managing knowledge. Only using it.
              </p>
              <div className="exchange" data-reveal>
                <p className="exchange-q">
                  <span className="exchange-tag">You ask</span>
                  “Where did we land on the Q3 pricing change?”
                </p>
                <p className="exchange-a">
                  <span className="exchange-tag">Cluster answers</span>
                  Finalized at $79 per seat on May 12 — with the decision doc,
                  the approval thread and the updated deck, in one view.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="closing" id="contact" aria-label="Request access">
          <div className="wrap closing-inner">
            <span className="label" data-reveal>Get started</span>
            <h2 className="display" data-reveal>
              Your business has the answer.<br />
              <span className="ask">Just ask Cluster.</span>
            </h2>
            <form className="access-form" data-reveal noValidate>
              <label className="visually-hidden" htmlFor="access-email">Work email</label>
              <input
                className="access-input"
                id="access-email"
                type="email"
                name="email"
                placeholder="Work email"
                autoComplete="email"
                required
              />
              <button className="btn" type="submit">Request early access</button>
            </form>
            <p className="access-done" hidden>
              You&apos;re on the list. We&apos;ll be in touch —{' '}
              <span className="em-amber">just ask Cluster</span> when you get there.
            </p>
          </div>
        </section>
      </main>

      <footer className="footer">
        <div className="wrap footer-inner">
          <p className="footer-meta">© 2026 Cluster AI — the second brain for business.</p>
          <ul className="footer-links">
            <li><a className="ghost-link" href="#manifesto">Manifesto</a></li>
            <li><a className="ghost-link" href="#platform">Platform</a></li>
            <li><a className="ghost-link" href="mailto:hello@cluster.ai">hello@cluster.ai</a></li>
          </ul>
        </div>
      </footer>
    </>
  );
}
