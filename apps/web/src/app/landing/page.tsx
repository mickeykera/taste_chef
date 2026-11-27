'use client';

import { useEffect, useRef, useState } from 'react';

const START_FREE = '/auth/login';
const LOG_IN = '/auth/login?mode=login';
const GITHUB = 'https://github.com/mickeykera/taste_chef';
const EMAIL = 'mailto:hello@tastechef.app';
const APK = '/downloads/tastechef-debug.apk';

function Arrow({ size = 15 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M4 10h12M11 5l5 5-5 5" />
    </svg>
  );
}

function Check() {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" aria-hidden="true">
      <path d="M4 10.5l4 4 8-9" />
    </svg>
  );
}

function Bowl() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M3.5 11.5h17c0 4.7-3.8 8.5-8.5 8.5s-8.5-3.8-8.5-8.5Z" />
      <path d="M8.5 8.2c-.6-1.2.4-2 .1-3.1M12 8.2c-.6-1.2.4-2 .1-3.1M15.5 8.2c-.6-1.2.4-2 .1-3.1" />
    </svg>
  );
}

function Stars() {
  return (
    <span className="stars" aria-hidden="true">
      {[0, 1, 2, 3, 4].map((i) => (
        <svg key={i} className="empty" viewBox="0 0 20 20" fill="currentColor">
          <path d="M10 1.8l2.5 5.2 5.7.8-4.1 4 1 5.6-5.1-2.7-5.1 2.7 1-5.6-4.1-4 5.7-.8L10 1.8Z" />
        </svg>
      ))}
    </span>
  );
}

export default function LandingPage() {
  const [menuOpen, setMenuOpen] = useState(false);
  const burgerRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!menuOpen) return;

    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setMenuOpen(false);
        burgerRef.current?.focus();
      }
    };
    const onDocClick = (event: MouseEvent) => {
      const target = event.target as Element | null;
      if (!target?.closest('.site-header')) setMenuOpen(false);
    };
    const onResize = () => {
      if (window.innerWidth > 900) setMenuOpen(false);
    };

    document.addEventListener('keydown', onKey);
    document.addEventListener('click', onDocClick);
    window.addEventListener('resize', onResize);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.removeEventListener('click', onDocClick);
      window.removeEventListener('resize', onResize);
    };
  }, [menuOpen]);

  const closeMenu = () => setMenuOpen(false);

  return (
    <div className="tc-landing" id="top">
      <a className="skip" href="#main">Skip to content</a>

      <header className="site-header">
        <div className="wrap header-inner">
          <a className="brand" href="#top" aria-label="TasteChef home">
            <span className="brand-mark"><Bowl /></span>
            TasteChef
          </a>
          <nav className="nav" aria-label="Main">
            <a href="#how">How it works</a>
            <a href="#features">Features</a>
            <a href="#pricing">Pricing</a>
            <a href="#faq">FAQ</a>
          </nav>
          <div className="header-actions">
            <a className="login" href={LOG_IN}>Log in</a>
            <a className="btn btn-primary btn-sm" href={START_FREE}>Start free</a>
            <button
              ref={burgerRef}
              className="burger"
              type="button"
              aria-label={menuOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={menuOpen}
              aria-controls="mobile-nav"
              onClick={() => setMenuOpen((open) => !open)}
            >
              <svg className="icon-menu" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true">
                <path d="M3 6h14M3 10h14M3 14h14" />
              </svg>
              <svg className="icon-close" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true">
                <path d="M5 5l10 10M15 5L5 15" />
              </svg>
            </button>
          </div>
        </div>
        <div className={`mobile-nav${menuOpen ? ' open' : ''}`} id="mobile-nav">
          <a href="#how" onClick={closeMenu}>How it works <Arrow size={14} /></a>
          <a href="#features" onClick={closeMenu}>Features <Arrow size={14} /></a>
          <a href="#pricing" onClick={closeMenu}>Pricing <Arrow size={14} /></a>
          <a href="#faq" onClick={closeMenu}>FAQ <Arrow size={14} /></a>
          <div className="mobile-actions">
            <a className="btn btn-secondary" href={LOG_IN}>Log in</a>
            <a className="btn btn-primary" href={START_FREE}>Start free</a>
          </div>
        </div>
      </header>

      <main id="main" tabIndex={-1}>

        {/* HERO */}
        <section className="hero">
          <div className="wrap">
            <div className="hero-grid">
              <div className="hero-copy">
                <p className="eyebrow">Pre-launch · Built for real appetites</p>
                <h1>Cooking that respects what you will <span className="mark">actually eat</span>.</h1>
                <p className="hero-lede">Tell us how you like your food — crisp, tender, never slimy — and what is already in your kitchen. TasteChef writes recipes around your tastes, your allergens and what you’ll genuinely enjoy.</p>
                <div className="hero-actions">
                  <a className="btn btn-primary" href={START_FREE}>Start free <Arrow /></a>
                  <a className="btn btn-secondary" href="#how">See how it works</a>
                </div>
                <p className="hero-trust">
                  <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M10 2.5l6 2.5v5c0 3.6-2.5 6.4-6 7.5-3.5-1.1-6-3.9-6-7.5V5l6-2.5Z" />
                    <path d="M7.2 10l2 2 3.6-4" />
                  </svg>
                  No credit card. Your allergies are always checked.
                </p>
              </div>

              <div className="hero-visual">
                <div className="browser" aria-hidden="true">
                  <div className="browser-chrome">
                    <span className="dots"><i /><i /><i /></span>
                    <span className="urlbar">
                      <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8">
                        <rect x="4" y="8" width="12" height="8" rx="2" />
                        <path d="M7 8V6a3 3 0 0 1 6 0v2" />
                      </svg>
                      tastechef.app/cook/dinner
                    </span>
                  </div>
                  <div className="mock">
                    <div className="mock-top">
                      <span className="mock-brand">
                        <i>
                          <svg viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                            <path d="M4 12h16c0 4.4-3.6 8-8 8s-8-3.6-8-8Z" />
                            <path d="M9 8c-.5-1 .3-1.8.1-2.7" />
                          </svg>
                        </i>
                        TasteChef
                      </span>
                      <span className="mock-tabs">
                        <span className="mock-tab">Pantry</span>
                        <span className="mock-tab on">Dinner</span>
                        <span className="mock-tab">Plan</span>
                      </span>
                      <span className="mock-avatar">M</span>
                    </div>
                    <div className="mock-body">
                      <div>
                        <div className="mock-label">Tonight’s pick</div>
                        <p className="mock-title">Crispy salmon, charred greens &amp; lemon yoghurt</p>
                        <div className="mock-chips">
                          <span className="mchip blue">
                            <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                              <path d="M4 10.5l4 4 8-9" />
                            </svg>
                            92% pantry match
                          </span>
                          <span className="mchip">30 min</span>
                          <span className="mchip">2 servings</span>
                        </div>
                        <ul className="mock-list">
                          <li><span className="tick"><svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round"><path d="M4 10.5l4 4 8-9" /></svg></span>Salmon fillets · 2</li>
                          <li><span className="tick"><svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round"><path d="M4 10.5l4 4 8-9" /></svg></span>Tenderstem broccoli · 200 g</li>
                          <li><span className="tick"><svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round"><path d="M4 10.5l4 4 8-9" /></svg></span>Greek yoghurt · 150 g</li>
                          <li><span className="tick"><svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round"><path d="M4 10.5l4 4 8-9" /></svg></span>Lemon · 1</li>
                          <li className="miss"><span className="tick"><svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M6 6l8 8M14 6l-8 8" /></svg></span>Dill · swap or skip</li>
                        </ul>
                        <p className="mock-missing"><b>8 of 10 ingredients</b> already in your pantry</p>
                      </div>
                      <div className="mock-side">
                        <div className="texture-card">
                          <div className="texture-head"><strong>Texture notes</strong><span>For you</span></div>
                          <div className="texture-rows">
                            <div className="texture-row"><b>Salmon</b><span>Crisp skin, soft centre</span></div>
                            <div className="texture-row"><b>Greens</b><span>Tender, not mushy</span></div>
                            <div className="texture-row"><b>Sauce</b><span>Glossy, no lumps</span></div>
                          </div>
                        </div>
                        <div className="nutrition">
                          <div className="nutrition-head">Per serving <em>USDA data</em></div>
                          <div className="nutrition-grid">
                            <div><b>540</b><span>kcal</span></div>
                            <div><b>38 g</b><span>protein</span></div>
                            <div><b>21 g</b><span>carbs</span></div>
                            <div><b>34 g</b><span>fat</span></div>
                          </div>
                        </div>
                        <div className="mock-tags">
                          <span className="tag on">just right</span>
                          <span className="tag">too mushy</span>
                          <span className="tag">crisp skin</span>
                        </div>
                      </div>
                    </div>
                    <div className="mock-foot">
                      <p>How was the texture?</p>
                      <Stars />
                      <button className="mock-rate" type="button" tabIndex={-1}>Rate</button>
                    </div>
                  </div>
                </div>
                <p className="hero-note"><b>Illustrative interface</b> — a design mock, not a live screenshot.</p>
              </div>
            </div>

            <div className="hero-facts">
              <div className="fact"><strong><em>4</em> meal slots</strong><span>Breakfast through to snacks, planned around your day.</span></div>
              <div className="fact"><strong><em>3</em> recipes per request</strong><span>Enough choice to cook, not a scroll marathon.</span></div>
              <div className="fact"><strong>USDA-backed</strong><span>Nutrition calculated from FoodData Central values.</span></div>
            </div>
          </div>
        </section>

        {/* LOGO CLOUD */}
        <section className="logos" aria-label="Data and tools">
          <div className="wrap logos-inner">
            <p className="cap">Built on trusted food data.</p>
            <div className="logo-row">
              <span>USDA FoodData Central</span>
              <span>TheMealDB</span>
              <span>Supabase</span>
              <span>Anthropic Claude</span>
              <span>OpenAI</span>
              <span>pgvector</span>
            </div>
            <p className="fine">Wordmarks shown for identification only. No endorsement implied.</p>
          </div>
        </section>

        {/* FEATURES */}
        <section className="section" id="features">
          <div className="wrap">
            <div className="section-head">
              <p className="eyebrow">Why it works</p>
              <h2>Your tastes are specific. Your recipes should be too.</h2>
              <p>Most recipe apps ask what diet you are on. TasteChef asks how you actually like to eat — then cooks around it.</p>
            </div>

            <div className="feature">
              <div className="feature-copy">
                <h3>Texture is a taste, not a fuss.</h3>
                <p>Some people don’t dislike mushrooms. They dislike slimy ones. Set texture notes like <b>crisp edges, soft centre</b> or <b>never soggy</b>, and every recipe is written to cook that way. Rate a meal “too mushy” and it learns.</p>
                <ul className="pill-list">
                  <li><Check />Crisp</li>
                  <li><Check />Tender</li>
                  <li><Check />No slime</li>
                  <li><Check />Al dente</li>
                </ul>
                <a className="text-link" href="#how">How taste profiles work <Arrow size={14} /></a>
              </div>
              <div className="feature-media">
                <svg className="scene" viewBox="0 0 560 380" role="img" aria-label="Illustration of a plated salmon dish with texture notes">
                  <g fill="none" stroke="#0a1024" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="252" cy="204" r="132" fill="#fff" />
                    <circle cx="252" cy="204" r="106" fill="#f8faff" stroke="#dbe3f7" strokeWidth="1.6" />
                    <path d="M120 350h264" stroke="#dbe3f7" strokeWidth="1.6" />
                  </g>
                  <g transform="rotate(-9 240 190)">
                    <path d="M180 202c-4-9 2-20 14-27 17-10 45-14 70-10 22 4 38 14 40 27 2 12-11 21-31 24-28 4-62 1-79-5-6-2-11-5-14-9Z" fill="#ffc7a8" stroke="#0a1024" strokeWidth="2.2" strokeLinejoin="round" />
                    <path d="M187 188c17-9 43-12 66-9 17 2 28 7 34 14" fill="none" stroke="#e08a62" strokeWidth="2" strokeLinecap="round" opacity=".75" />
                    <path d="M205 197c15 6 31 8 47 5M212 208c13 5 27 6 40 4" fill="none" stroke="#0a1024" strokeWidth="1.6" strokeLinecap="round" opacity=".32" />
                  </g>
                  <g stroke="#0a1024" strokeWidth="2" strokeLinecap="round">
                    <path d="M324 226c8-14 22-18 30-10s2 22-12 25-24-4-18-15Z" fill="#b9edd0" />
                    <path d="M342 244c10-10 23-8 27 2s-5 20-17 18-16-12-10-20Z" fill="#b9edd0" />
                    <path d="M313 250c-6 14-1 26 8 30" fill="none" />
                    <path d="M338 262v18" fill="none" />
                  </g>
                  <g stroke="#0a1024" strokeWidth="2" strokeLinecap="round">
                    <circle cx="174" cy="252" r="20" fill="#ffe08a" />
                    <path d="M174 252l14-9M174 252l2 17M174 252l-15-9M174 252l-9 15" strokeWidth="1.5" />
                  </g>
                  <g stroke="#2e5bff" strokeWidth="2.4" strokeLinecap="round">
                    <path d="M150 130c-8-10 6-16 0-26M172 122c-8-10 6-16 0-26" opacity=".5" />
                    <circle cx="300" cy="300" r="4" fill="#2e5bff" stroke="none" />
                    <circle cx="318" cy="310" r="2.6" fill="#2e5bff" stroke="none" />
                    <circle cx="286" cy="314" r="3" fill="#2e5bff" stroke="none" />
                  </g>
                  <g transform="rotate(14 400 230)" stroke="#0a1024" strokeWidth="2.4" strokeLinecap="round" fill="#fff">
                    <rect x="392" y="180" width="14" height="88" rx="7" />
                    <path d="M390 176v-34M395 176v-38M400 176v-36M405 176v-32" fill="none" />
                    <path d="M390 176h16" fill="none" />
                  </g>
                  <g stroke="#0a1024" strokeWidth="2" strokeLinecap="round" fill="#fff">
                    <path d="M436 316l18-56 12 4-18 56Z" />
                  </g>
                </svg>
                <span className="ill-chip pos-a"><i />crisp edges</span>
                <span className="ill-chip pos-b"><i />soft centre</span>
              </div>
            </div>

            <div className="feature flip">
              <div className="feature-copy">
                <h3>Cook from what you have. Not what you are missing.</h3>
                <p>Add your pantry, flag what needs using first, then pick a meal slot and how long you have got. TasteChef builds dinner around it — and tells you honestly when a recipe needs one extra thing.</p>
                <ul className="pill-list">
                  <li><Check />Expiring soon</li>
                  <li><Check />30 minutes</li>
                  <li><Check />Dinner for 2</li>
                  <li><Check />High protein</li>
                </ul>
                <a className="text-link" href="#how">See the pantry in action <Arrow size={14} /></a>
              </div>
              <div className="feature-media">
                <svg className="scene" viewBox="0 0 560 380" role="img" aria-label="Illustration of a pantry shelf with jars, vegetables and an expiring-soon note">
                  <g fill="none" stroke="#0a1024" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="112" y="84" width="336" height="228" rx="14" fill="#fff" />
                    <path d="M112 200h336" />
                    <path d="M128 312v22M432 312v22" />
                  </g>
                  <g stroke="#0a1024" strokeWidth="2">
                    <rect x="146" y="124" width="58" height="66" rx="9" fill="#f6f8ff" />
                    <rect x="152" y="116" width="46" height="12" rx="5" fill="#2e5bff" />
                    <path d="M146 154h58" opacity=".25" />
                    <rect x="224" y="132" width="62" height="58" rx="9" fill="#ffc7a8" />
                    <rect x="230" y="124" width="50" height="12" rx="5" fill="#0a1024" />
                    <circle cx="242" cy="156" r="4" fill="#0a1024" stroke="none" opacity=".35" />
                    <circle cx="258" cy="168" r="4" fill="#0a1024" stroke="none" opacity=".35" />
                    <circle cx="272" cy="152" r="4" fill="#0a1024" stroke="none" opacity=".35" />
                    <rect x="306" y="128" width="56" height="62" rx="9" fill="#b9edd0" />
                    <rect x="312" y="120" width="44" height="12" rx="5" fill="#fff" />
                    <path d="M306 158h56" opacity=".25" />
                    <rect x="382" y="140" width="42" height="50" rx="8" fill="#ffe08a" />
                    <rect x="388" y="132" width="30" height="11" rx="5" fill="#fff" />
                  </g>
                  <text x="175" y="166" fontFamily="Host Grotesk, sans-serif" fontSize="10" fontWeight="600" fill="#0a1024" textAnchor="middle">rice</text>
                  <text x="255" y="168" fontFamily="Host Grotesk, sans-serif" fontSize="10" fontWeight="600" fill="#0a1024" textAnchor="middle">chickpeas</text>
                  <g stroke="#0a1024" strokeWidth="2.2" strokeLinejoin="round">
                    <path d="M176 250h132l-14 62h-104Z" fill="#f6f8ff" />
                    <path d="M192 250c0-16 12-28 28-28s28 12 28 28" fill="none" />
                    <path d="M212 262v38M240 262v38M268 262v38" opacity=".22" strokeWidth="1.5" />
                    <circle cx="290" cy="250" r="17" fill="#ff8f6b" />
                    <path d="M284 238c2-6 7-8 10-8" fill="none" stroke="#b9edd0" strokeWidth="3" />
                    <circle cx="322" cy="258" r="14" fill="#ffe08a" />
                    <path d="M312 240c8-8 20-8 26 0" fill="none" stroke="#b9edd0" strokeWidth="4" />
                  </g>
                  <g stroke="#0a1024" strokeWidth="2" strokeLinecap="round">
                    <path d="M360 300c-6-20 4-42 22-52" fill="none" />
                    <path d="M364 268c-12-2-20-12-18-24 14-2 24 8 24 20" fill="#b9edd0" />
                    <path d="M378 280c-2-14 8-26 22-28 4 14-6 26-20 28" fill="#b9edd0" />
                    <path d="M352 254c-12 2-24-6-26-18 14-4 26 4 28 16" fill="#b9edd0" />
                  </g>
                  <g stroke="#0a1024" strokeWidth="2.2" fill="#fff">
                    <circle cx="470" cy="110" r="33" />
                    <path d="M470 92v20l13 8" fill="none" stroke="#2e5bff" strokeWidth="2.6" strokeLinecap="round" />
                  </g>
                  <text x="470" y="160" fontFamily="Host Grotesk, sans-serif" fontSize="11" fontWeight="600" fill="#5b6681" textAnchor="middle">30 min</text>
                </svg>
                <span className="ill-chip blue pos-c">use soon</span>
                <span className="ill-chip pos-d"><i />dinner · serves 2</span>
              </div>
            </div>

            <div className="feature">
              <div className="feature-copy">
                <h3>Allergens checked by code. Nutrition from USDA.</h3>
                <p>Every recipe is screened against your allergen list by deterministic code, not a language model’s best guess. Nutrition comes from USDA FoodData Central, so the numbers mean something. Ratings and quick tags like “too mushy” come from you.</p>
                <ul className="pill-list">
                  <li><Check />Code-checked allergens</li>
                  <li><Check />USDA nutrition</li>
                  <li><Check />No guesswork</li>
                </ul>
                <a className="text-link" href="#faq">How allergen checks work <Arrow size={14} /></a>
              </div>
              <div className="feature-media">
                <svg className="scene" viewBox="0 0 560 380" role="img" aria-label="Illustration of a shield with code brackets, allergen tags and a nutrition panel">
                  <g fill="none" stroke="#0a1024" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M268 56l104 40v96c0 62-44 108-104 132-60-24-104-70-104-132V96l104-40Z" fill="#eef2ff" />
                    <path d="M268 90l74 28v72c0 46-31 81-74 100-43-19-74-54-74-100v-72l74-28Z" fill="#fff" stroke="#c9d5f5" strokeWidth="1.6" />
                  </g>
                  <text x="268" y="208" fontFamily="Host Grotesk, sans-serif" fontSize="48" fontWeight="600" fill="#2e5bff" textAnchor="middle" letterSpacing="-3">&lt;/&gt;</text>
                  <g>
                    <circle cx="340" cy="290" r="30" fill="#2e5bff" stroke="#0a1024" strokeWidth="2.2" />
                    <path d="M327 290l9 10 18-20" fill="none" stroke="#fff" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round" />
                  </g>
                  <g stroke="#dbe3f7" strokeWidth="2" strokeLinecap="round">
                    <path d="M92 128h64M72 160h52M96 300h58" />
                  </g>
                  <g stroke="#0a1024" strokeWidth="2" fill="#fff">
                    <circle cx="106" cy="248" r="12" />
                    <path d="M106 242v12M100 248h12" />
                  </g>
                </svg>
                <span className="ill-chip avoid pos-c">peanut</span>
                <span className="ill-chip avoid pos-f">shellfish</span>
                <div className="mini-card" aria-hidden="true">
                  <div className="mc-top">Per serving <em>USDA</em></div>
                  <div className="mc-row"><span>Protein</span><span className="mc-bar"><i style={{ width: '76%' }} /></span><b>38 g</b></div>
                  <div className="mc-row"><span>Carbs</span><span className="mc-bar"><i style={{ width: '34%' }} /></span><b>21 g</b></div>
                  <div className="mc-row"><span>Fat</span><span className="mc-bar"><i style={{ width: '52%' }} /></span><b>34 g</b></div>
                </div>
                <span className="ill-chip pos-h"><i />too mushy</span>
              </div>
            </div>
          </div>
        </section>

        {/* PROCESS */}
        <section className="section" id="how" style={{ paddingTop: 0 }}>
          <div className="wrap">
            <div className="process">
              <div className="section-head center" style={{ marginBottom: 0, maxWidth: 620 }}>
                <p className="eyebrow">How it works</p>
                <h2>Three steps, one dinner.</h2>
                <p>Set it up once. After that, dinner takes a couple of taps.</p>
              </div>
              <div className="steps">
                <div className="step">
                  <span className="step-num">1</span>
                  <h3>Tell us your tastes</h3>
                  <p>Pick your textures, flavours, diets and the things you would rather skip.</p>
                </div>
                <div className="step">
                  <span className="step-num">2</span>
                  <h3>Add what is in your kitchen</h3>
                  <p>Type it in, or add it from a list. Flag what needs using first so nothing goes to waste.</p>
                </div>
                <div className="step">
                  <span className="step-num">3</span>
                  <h3>Get recipes made for you</h3>
                  <p>Recipes for your meal slot, time and goals — allergens checked, nutrition filled in.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* TESTIMONIALS */}
        <section className="section" id="stories" style={{ paddingTop: 0 }}>
          <div className="wrap">
            <div className="section-head">
              <p className="eyebrow">Sample stories</p>
              <h2>Built for the “only when it is like this” eaters.</h2>
              <p>These are illustrative reviews written for the preview. They are not real customers.</p>
            </div>
            <div className="stories-grid">
              <article className="quote-card featured">
                <div>
                  <span className="sample-tag"><i />Sample content</span>
                  <span className="quote-mark" aria-hidden="true">
                    <svg viewBox="0 0 42 30" fill="currentColor">
                      <path d="M0 30V16C0 6 5 1 15 0v7c-5 1-7 4-7 8h7v15H0Zm24 0V16C24 6 29 1 39 0v7c-5 1-7 4-7 8h7v15H24Z" />
                    </svg>
                  </span>
                  <blockquote>I don’t hate mushrooms. I hate <span className="hl">slimy</span> mushrooms. TasteChef is the first app that understood the difference.</blockquote>
                </div>
                <div className="quote-foot">
                  <span className="avatar" aria-hidden="true">
                    <svg viewBox="0 0 64 64">
                      <rect width="64" height="64" fill="#ffd8bf" />
                      <circle cx="32" cy="30" r="17" fill="#f7c3a1" />
                      <path d="M14 30c0-13 8-20 18-20s18 7 18 20c-6-3-9-9-9-9-4 4-14 5-19 3-1 3-3 5-8 6Z" fill="#22263a" />
                      <circle cx="26" cy="30" r="1.8" fill="#0a1024" />
                      <circle cx="38" cy="30" r="1.8" fill="#0a1024" />
                      <path d="M27 37c3 2.5 7 2.5 10 0" fill="none" stroke="#0a1024" strokeWidth="1.8" strokeLinecap="round" />
                      <path d="M20 30h5M39 30h5" stroke="#0a1024" strokeWidth="1.5" opacity=".6" />
                    </svg>
                  </span>
                  <span className="quote-who"><b>Sample review</b><span>Home cook · two-person household</span></span>
                </div>
              </article>
              <div className="side-quotes">
                <article className="quote-card">
                  <div>
                    <span className="sample-tag"><i />Sample</span>
                    <blockquote>“I typed ‘no soggy bottoms’ and it actually listened.”</blockquote>
                  </div>
                  <div className="quote-foot">
                    <span className="avatar" aria-hidden="true">
                      <svg viewBox="0 0 64 64">
                        <rect width="64" height="64" fill="#dfe7ff" />
                        <circle cx="32" cy="31" r="16" fill="#e8b48f" />
                        <path d="M16 31c-2-12 5-21 16-21s18 9 16 21c-2-6-5-8-5-8-5 3-16 4-22 1-2 2-4 4-5 7Z" fill="#3c2a24" />
                        <circle cx="26" cy="31" r="1.8" fill="#0a1024" />
                        <circle cx="38" cy="31" r="1.8" fill="#0a1024" />
                        <path d="M27 38c3 3 7 3 10 0" fill="none" stroke="#0a1024" strokeWidth="1.8" strokeLinecap="round" />
                        <circle cx="20" cy="34" r="2.5" fill="#f2a08a" opacity=".6" />
                        <circle cx="44" cy="34" r="2.5" fill="#f2a08a" opacity=".6" />
                      </svg>
                    </span>
                    <span className="quote-who"><b>Sample review</b><span>Batch cook · London</span></span>
                  </div>
                </article>
                <article className="quote-card">
                  <div>
                    <span className="sample-tag"><i />Sample</span>
                    <blockquote>“Dinner from what was already in the fridge. Twice this week.”</blockquote>
                  </div>
                  <div className="quote-foot">
                    <span className="avatar" aria-hidden="true">
                      <svg viewBox="0 0 64 64">
                        <rect width="64" height="64" fill="#d9f4e6" />
                        <circle cx="32" cy="31" r="16" fill="#c98f68" />
                        <path d="M15 32c0-12 7-21 17-21s17 9 17 21c-3-5-5-6-8-7-3 2-8 3-13 2-4 2-9 1-13 5Z" fill="#141826" />
                        <circle cx="26" cy="31" r="1.8" fill="#0a1024" />
                        <circle cx="38" cy="31" r="1.8" fill="#0a1024" />
                        <path d="M27 38c3 2.5 7 2.5 10 0" fill="none" stroke="#0a1024" strokeWidth="1.8" strokeLinecap="round" />
                        <path d="M22 24c2-2 5-3 8-3" stroke="#0a1024" strokeWidth="1.4" fill="none" opacity=".5" />
                      </svg>
                    </span>
                    <span className="quote-who"><b>Sample review</b><span>Parent of two · Manchester</span></span>
                  </div>
                </article>
              </div>
            </div>
            <p className="sample-note">
              <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
                <circle cx="10" cy="10" r="7.5" />
                <path d="M10 6.5v4.5M10 14h.01" strokeLinecap="round" />
              </svg>
              All quotes and avatars on this page are sample content for a pre-launch preview. They are not real people or real reviews.
            </p>
          </div>
        </section>

        {/* PRICING */}
        <section className="section" id="pricing" style={{ paddingTop: 0 }}>
          <div className="wrap">
            <div className="pricing-head">
              <div className="section-head">
                <p className="eyebrow">Pricing</p>
                <h2>Simple plans, clearly priced.</h2>
                <p>Start free. Upgrade when the whole household wants in.</p>
              </div>
              <span className="badge"><span className="badge-dot" />Placeholder pricing</span>
            </div>
            <div className="plans">
              <article className="plan">
                <div className="plan-top"><h3 className="plan-name">Free</h3></div>
                <div className="price"><b>£0</b><span>forever</span></div>
                <p className="plan-note">For trying a few dinners and seeing how it fits.</p>
                <ul>
                  <li><Check />3 recipe generations a month</li>
                  <li><Check />Up to 10 saved recipes</li>
                  <li><Check />1 household profile</li>
                  <li><Check />Pantry and allergen checks</li>
                </ul>
                <a className="btn btn-secondary" href={START_FREE}>Start free</a>
              </article>

              <article className="plan featured">
                <div className="plan-top"><h3 className="plan-name">Plus</h3><span className="plan-flag">Recommended</span></div>
                <div className="price"><b>£6</b><span>per month</span></div>
                <p className="plan-note">For most households cooking through the week.</p>
                <ul>
                  <li><Check />100 recipe generations a month</li>
                  <li><Check />Unlimited saved recipes</li>
                  <li><Check />4 household profiles</li>
                  <li><Check />Weekly planning</li>
                </ul>
                <a className="btn btn-primary" href={START_FREE}>Start free</a>
              </article>

              <article className="plan">
                <div className="plan-top"><h3 className="plan-name">Family</h3></div>
                <div className="price"><b>£11</b><span>per month</span></div>
                <p className="plan-note">For busy kitchens with more than one set of tastes.</p>
                <ul>
                  <li><Check />300 recipe generations a month</li>
                  <li><Check />Unlimited saved recipes</li>
                  <li><Check />8 household profiles</li>
                  <li><Check />Shared pantry and weekly planning</li>
                </ul>
                <a className="btn btn-secondary" href={START_FREE}>Start free</a>
              </article>
            </div>
            <p className="pricing-foot"><b>Placeholder pricing for a pre-launch product.</b> No payment is taken, and final prices will be confirmed before launch. Annual billing and local taxes are still to be decided.</p>
          </div>
        </section>

        {/* FAQ */}
        <section className="section" id="faq" style={{ paddingTop: 0 }}>
          <div className="wrap faq-wrap">
            <div className="section-head center">
              <p className="eyebrow">FAQ</p>
              <h2>Good questions, plain answers.</h2>
            </div>
            <div className="faq-list">
              <details className="faq-item">
                <summary>I hate mushrooms. Is that a texture thing?<span className="faq-icon"><svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><path d="M10 4v12M4 10h12" /></svg></span></summary>
                <div className="faq-body">
                  <p>Often, yes. A lot of “picky” dislikes are really about how a food feels — slimy, mushy, rubbery or watery. TasteChef lets you say that directly, so it can suggest a mushroom recipe with a crisp finish, or leave mushrooms out entirely.</p>
                  <p>You can also mark a dislike as <b>“only when prepared like this”</b>, which means the ingredient stays on the table when the texture is right.</p>
                </div>
              </details>
              <details className="faq-item">
                <summary>How do you keep allergens safe?<span className="faq-icon"><svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><path d="M10 4v12M4 10h12" /></svg></span></summary>
                <div className="faq-body">
                  <p>Allergens are checked by <b>deterministic code</b>, not by asking a language model to be careful. You list your allergens, and recipes are screened against that list before they reach you. A recipe that cannot be checked is not shown as safe.</p>
                  <p>No software can guarantee an allergen-free kitchen. Always check packaging and labels, and consider cross-contact at home. TasteChef gives general cooking information and is <b>not medical advice</b>.</p>
                </div>
              </details>
              <details className="faq-item">
                <summary>Where do the recipes and nutrition numbers come from?<span className="faq-icon"><svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><path d="M10 4v12M4 10h12" /></svg></span></summary>
                <div className="faq-body">
                  <p>Recipes are generated for your profile and drawn from a seed library built with TheMealDB. Nutrition is calculated per serving from <b>USDA FoodData Central</b> values.</p>
                  <p>Numbers are estimates. Cooking method, portion size and ingredient brands all change the result, so treat them as a guide rather than a measurement.</p>
                </div>
              </details>
              <details className="faq-item">
                <summary>Can I use it with only what is already in my pantry?<span className="faq-icon"><svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><path d="M10 4v12M4 10h12" /></svg></span></summary>
                <div className="faq-body">
                  <p>Yes. <b>Pantry-only mode</b> returns recipes you can cook without shopping. If you would rather allow one or two missing items, you can relax the rule and TasteChef will tell you exactly what is missing before you start.</p>
                </div>
              </details>
              <details className="faq-item">
                <summary>Do you support vegetarian, halal, keto and other diets?<span className="faq-icon"><svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><path d="M10 4v12M4 10h12" /></svg></span></summary>
                <div className="faq-body">
                  <p>TasteChef supports diet goals including vegetarian, vegan, pescatarian, halal-style, keto and low-carb, alongside allergies and texture preferences.</p>
                  <p>A diet filter is not a religious or medical certification. For halal, kosher or medically prescribed diets, check ingredients and preparation yourself, and speak to a qualified professional where needed.</p>
                </div>
              </details>
              <details className="faq-item">
                <summary>What happens to my taste profile and pantry data?<span className="faq-icon"><svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><path d="M10 4v12M4 10h12" /></svg></span></summary>
                <div className="faq-body">
                  <p>Your taste profile, pantry and saved recipes are stored with your account so they are there next time. They are used to generate your recipes, not sold to advertisers. You can delete your account and its data from settings.</p>
                  <p>The full privacy policy will be published before launch. Pre-launch, this page is a preview and no account data is being collected.</p>
                </div>
              </details>
            </div>
            <p className="faq-aside">Still curious? <a href={EMAIL}>Email the team</a> and we will answer.</p>
          </div>
        </section>

        {/* CLOSING */}
        <section className="closing">
          <div className="wrap closing-grid">
            <div>
              <h2>Eat what you like. Skip what you don’t.</h2>
              <p>Your next dinner can start with the food already in your kitchen.</p>
            </div>
            <div className="closing-actions">
              <a className="btn btn-white" href={START_FREE}>Start free <Arrow /></a>
              <a className="btn btn-ghost-white" href="#how">See how it works</a>
              <p className="closing-fine">No credit card. Pre-launch preview.</p>
            </div>
          </div>
        </section>

      </main>

      <footer>
        <div className="wrap">
          <div className="footer-top">
            <div className="footer-brand">
              <a className="brand" href="#top" aria-label="TasteChef home">
                <span className="brand-mark"><Bowl /></span>
                TasteChef
              </a>
              <p>Recipes for the way you actually eat. Built around your textures, your allergens and your kitchen.</p>
              <div className="socials">
                <a href={GITHUB} target="_blank" rel="noreferrer">GitHub</a>
                <a href={EMAIL}>Email</a>
                <a href={`${EMAIL}?subject=Press%20enquiry`}>Press</a>
              </div>
            </div>
            <div className="footer-col">
              <h3>Product</h3>
              <ul>
                <li><a href="#how">How it works</a></li>
                <li><a href="#features">Features</a></li>
                <li><a href="#pricing">Pricing</a></li>
                <li><a href="#faq">FAQ</a></li>
                <li><a href={APK} download>Download the app</a></li>
              </ul>
            </div>
            <div className="footer-col">
              <h3>Company</h3>
              <ul>
                <li><a href="#top">About</a></li>
                <li><a href={EMAIL}>Contact</a></li>
                <li><a href={`${EMAIL}?subject=Press%20enquiry`}>Press kit</a></li>
                <li><a href={GITHUB} target="_blank" rel="noreferrer">GitHub</a></li>
              </ul>
            </div>
            <div className="footer-col">
              <h3>Legal</h3>
              <ul>
                <li><a href="#faq">Privacy policy</a></li>
                <li><a href="#faq">Terms of use</a></li>
                <li><a href="#faq">Allergen disclaimer</a></li>
                <li><a href="#faq">Cookie settings</a></li>
              </ul>
            </div>
          </div>
          <div className="footer-bottom">
            <p className="disclaimer">TasteChef gives general cooking and nutrition information and is not medical advice.</p>
            <p className="copy">© 2026 TasteChef. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
