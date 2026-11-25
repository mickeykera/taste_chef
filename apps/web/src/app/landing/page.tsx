'use client';

import { useEffect, useRef, useState } from 'react';

type Pane = 'cook' | 'pantry' | 'taste' | 'saved';

export default function LandingPage() {
  const burgerRef = useRef<HTMLButtonElement>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [activePane, setActivePane] = useState<Pane>('cook');
  const [selected, setSelected] = useState(0);
  const [generated, setGenerated] = useState(false);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setMenuOpen(false);
        burgerRef.current?.focus();
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, []);

  return (
    <>
<svg width="0" height="0" style={{ position: 'absolute' }} aria-hidden="true">
  <symbol id="i-arrow" viewBox="0 0 16 16"><path d="M3 8h9M8.5 3.5 13 8l-4.5 4.5" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></symbol>
  <symbol id="i-menu" viewBox="0 0 24 24"><path d="M4 6h16M4 12h16M4 18h16" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round"/></symbol>
  <symbol id="i-close" viewBox="0 0 24 24"><path d="m6 6 12 12M18 6 6 18" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round"/></symbol>
  <symbol id="i-bowl" viewBox="0 0 32 32"><path d="M7.5 15.5h17a8.5 8.5 0 0 1-17 0Z" fill="currentColor"/><path d="M12 10.2c0-2.1 2.1-2.1 2.1-4.2M18 10.2c0-2.1 2.1-2.1 2.1-4.2" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/></symbol>
  <symbol id="i-cook" viewBox="0 0 24 24"><path d="M5 10h14v3a7 7 0 0 1-14 0v-3Z" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/><path d="M9 6c0-1.6 1.5-1.6 1.5-3.2M14 6c0-1.6 1.5-1.6 1.5-3.2" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></symbol>
  <symbol id="i-pantry" viewBox="0 0 24 24"><rect x="4" y="3" width="16" height="18" rx="2" fill="none" stroke="currentColor" strokeWidth="1.5"/><path d="M4 9h16M8 13h8M8 17h5" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></symbol>
  <symbol id="i-taste" viewBox="0 0 24 24"><path d="M12 3c2.4 3.4 5 5.8 5 9a5 5 0 0 1-10 0c0-3.2 2.6-5.6 5-9Z" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/><path d="M9.4 12.6c0 1.9 1.4 3 2.6 3" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></symbol>
  <symbol id="i-saved" viewBox="0 0 24 24"><path d="M6 4h12v17l-6-4-6 4V4Z" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/></symbol>
  <symbol id="i-search" viewBox="0 0 24 24"><circle cx="10.5" cy="10.5" r="6.5" fill="none" stroke="currentColor" strokeWidth="1.6"/><path d="m15.5 15.5 4 4" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/></symbol>
  <symbol id="i-check" viewBox="0 0 16 16"><path d="m3 8.5 3.2 3.2L13 4.8" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"/></symbol>
  <symbol id="i-phone" viewBox="0 0 24 24"><rect x="6" y="2.5" width="12" height="19" rx="2.2" fill="none" stroke="currentColor" strokeWidth="1.5"/><path d="M10.5 18.5h3" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></symbol>
  <symbol id="i-monitor" viewBox="0 0 24 24"><rect x="2.5" y="4" width="19" height="13" rx="2" fill="none" stroke="currentColor" strokeWidth="1.5"/><path d="M9 21h6M12 17v4" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></symbol>
  <symbol id="i-tablet" viewBox="0 0 24 24"><rect x="4" y="2.5" width="16" height="19" rx="2.2" fill="none" stroke="currentColor" strokeWidth="1.5"/><path d="M10.5 18.5h3" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></symbol>
  <symbol id="i-signal-off" viewBox="0 0 24 24"><path d="M3 3 21 21" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/><path d="M5 12.5a10 10 0 0 1 4-2.4M9 7.5a14 14 0 0 1 10 3.6M8 16.5a6 6 0 0 1 5-1.6M12 20h.01" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/></symbol>
  <symbol id="i-star" viewBox="0 0 16 16"><path d="m8 1.8 1.9 3.8 4.2.6-3 2.9.7 4.1L8 11.3l-3.8 2 .7-4.1-3-2.9 4.2-.6L8 1.8Z" fill="currentColor"/></symbol>
  <symbol id="i-clock" viewBox="0 0 16 16"><circle cx="8" cy="8" r="6" fill="none" stroke="currentColor" strokeWidth="1.4"/><path d="M8 4.8V8l2.2 1.4" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/></symbol>
  <symbol id="i-instagram" viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="5" fill="none" stroke="currentColor" strokeWidth="1.5"/><circle cx="12" cy="12" r="4" fill="none" stroke="currentColor" strokeWidth="1.5"/><circle cx="17.2" cy="6.8" r="1" fill="currentColor"/></symbol>
  <symbol id="i-youtube" viewBox="0 0 24 24"><rect x="2.5" y="5.5" width="19" height="13" rx="3" fill="none" stroke="currentColor" strokeWidth="1.5"/><path d="m10 9.2 4.5 2.8-4.5 2.8V9.2Z" fill="currentColor"/></symbol>
  <symbol id="i-github" viewBox="0 0 24 24"><path d="M12 2.5a9.5 9.5 0 0 0-3 18.5c.5.1.7-.2.7-.5v-1.8c-2.7.6-3.2-1.2-3.2-1.2-.4-1.1-1.1-1.4-1.1-1.4-.9-.6.1-.6.1-.6 1 .1 1.5 1 1.5 1 .9 1.5 2.3 1.1 2.9.8.1-.6.3-1.1.6-1.4-2.1-.2-4.4-1.1-4.4-4.8 0-1.1.4-1.9 1-2.6-.1-.2-.4-1.2.1-2.5 0 0 .8-.3 2.6 1a9 9 0 0 1 4.8 0c1.8-1.3 2.6-1 2.6-1 .5 1.3.2 2.3.1 2.5.6.7 1 1.5 1 2.6 0 3.7-2.3 4.6-4.4 4.8.3.3.6.9.6 1.8v2.7c0 .3.2.6.7.5A9.5 9.5 0 0 0 12 2.5Z" fill="currentColor"/></symbol>
  <symbol id="i-leaf" viewBox="0 0 32 32"><path d="M26 6c-9 0-15 4-15 11 0 3 1.5 5 4 6 7-1 11-7 11-17Z" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round"/><path d="M8 26c2-7 7-11 13-14" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round"/></symbol>
  <symbol id="i-pot" viewBox="0 0 32 32"><path d="M7 14h18v4a9 9 0 0 1-18 0v-4Z" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round"/><path d="M4 15h3M25 15h3M12 9c0-1.5 1.5-1.5 1.5-3M18 9c0-1.5 1.5-1.5 1.5-3" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round"/></symbol>
</svg>

<div className="tc-landing" id="top">
  <a className="skip-link" href="#main">Skip to content</a>
  <div className="announcement">
    <div className="tc-container">
      <span className="ann-chip">New</span>
      <span className="ann-text ann-long">TasteChef now generates recipes fully offline</span>
      <span className="ann-text ann-short">Fully offline recipes</span>
      <a className="ann-link" href="#offline">See what’s new <svg aria-hidden="true"><use href="#i-arrow"/></svg></a>
    </div>
  </div>

  <div className="header-wrap">
    <div className="tc-container">
      <header className="header">
        <a className="brand" href="#top" aria-label="TasteChef home">
          <span className="brand-mark"><svg aria-hidden="true"><use href="#i-bowl"/></svg></span>
          <span className="brand-word">TasteChef</span>
        </a>
        <nav className="nav" aria-label="Main">
          <a href="#features" onClick={() => setMenuOpen(false)}>Features</a>
          <a href="#taste" onClick={() => setMenuOpen(false)}>Taste</a>
          <a href="#offline" onClick={() => setMenuOpen(false)}>Offline</a>
          <a href="#faq" onClick={() => setMenuOpen(false)}>FAQ</a>
        </nav>
        <div className="header-actions">
          <a className="login" href="/auth/login">Log in</a>
          <a className="btn btn-primary btn-sm" href="/app/generate">Get the app <svg aria-hidden="true"><use href="#i-arrow"/></svg></a>
        </div>
        <button
          className="burger"
          type="button"
          aria-label={menuOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={menuOpen}
          aria-controls="mobile-menu"
          ref={burgerRef}
          onClick={() => setMenuOpen((open) => !open)}
        >
          <svg width="22" height="22" aria-hidden="true"><use href={menuOpen ? '#i-close' : '#i-menu'} /></svg>
        </button>
      </header>
      <div className={menuOpen ? 'mobile-menu open' : 'mobile-menu'} id="mobile-menu">
        <a href="#features" onClick={() => setMenuOpen(false)}>Features <svg width="14" height="14" aria-hidden="true"><use href="#i-arrow"/></svg></a>
        <a href="#taste" onClick={() => setMenuOpen(false)}>Taste <svg width="14" height="14" aria-hidden="true"><use href="#i-arrow"/></svg></a>
        <a href="#offline" onClick={() => setMenuOpen(false)}>Offline <svg width="14" height="14" aria-hidden="true"><use href="#i-arrow"/></svg></a>
        <a href="#faq" onClick={() => setMenuOpen(false)}>FAQ <svg width="14" height="14" aria-hidden="true"><use href="#i-arrow"/></svg></a>
        <div className="mm-actions">
          <a className="btn btn-secondary" href="/auth/login">Log in</a>
          <a className="btn btn-primary" href="/app/generate">Get the app</a>
        </div>
      </div>
    </div>
  </div>

  <div className="frame">
    <main id="main" tabIndex={-1}>
    <section className="section hero" id="hero">
      <div className="tc-container">
        <div className="hero-copy">
          <div className="hero-eyebrow"><span className="hero-mark" aria-hidden="true"></span><span>Offline recipe AI</span></div>
          <h1><span className="line">Your pantry,</span> <span className="line">in one app.</span></h1>
          <p className="hero-lead">Recipes from the pantry you have — matched to your diet, texture dislikes and taste. Offline, on your phone.</p>
          <div className="hero-actions">
            <a className="btn btn-primary" href="/app/generate">Get the app <svg aria-hidden="true"><use href="#i-arrow"/></svg></a>
            <a className="btn btn-secondary" href="#features">See how it works</a>
          </div>
        </div>

        <div className="stage" role="group" aria-label="TasteChef app preview">
          <div className="app">
            <div className="app-top">
              <div className="app-brand"><span className="mini-mark"><svg aria-hidden="true"><use href="#i-bowl"/></svg></span><span>TasteChef</span></div>
              <div className="app-crumb">Kitchen / Dinner</div>
              <div className="app-status"><span className="status-dot"></span>On device</div>
            </div>
            <div className="app-body">
              <div className="app-side">
                <nav className="app-nav" aria-label="App preview sections">
                  <button className={`app-tab${activePane === 'cook' ? ' is-active' : ''}`} type="button" data-pane="cook" aria-pressed={activePane === 'cook'} onClick={() => setActivePane('cook')}><svg aria-hidden="true"><use href="#i-cook"/></svg>Cook</button>
                  <button className={`app-tab${activePane === 'pantry' ? ' is-active' : ''}`} type="button" data-pane="pantry" aria-pressed={activePane === 'pantry'} onClick={() => setActivePane('pantry')}><svg aria-hidden="true"><use href="#i-pantry"/></svg>Pantry</button>
                  <button className={`app-tab${activePane === 'taste' ? ' is-active' : ''}`} type="button" data-pane="taste" aria-pressed={activePane === 'taste'} onClick={() => setActivePane('taste')}><svg aria-hidden="true"><use href="#i-taste"/></svg>Taste</button>
                  <button className={`app-tab${activePane === 'saved' ? ' is-active' : ''}`} type="button" data-pane="saved" aria-pressed={activePane === 'saved'} onClick={() => setActivePane('saved')}><svg aria-hidden="true"><use href="#i-saved"/></svg>Saved</button>
                </nav>
                <div className="app-side-plan">
                  <span className="asp-label">Tonight</span>
                  <div className="asp-recipe">
                    <span className="asp-thumb"><svg aria-hidden="true"><use href="#i-bowl"/></svg></span>
                    <div><strong>Lemon rice</strong><span>92% match</span></div>
                  </div>
                  <div className="asp-row"><span>Pantry match</span><b>82%</b></div>
                  <div className="asp-row"><span>Taste rules</span><b>3</b></div>
                  <div className="asp-row"><span>Time budget</span><b>20 min</b></div>
                  <div className="asp-track"><i style={{ width: '82%' }}></i></div>
                </div>
                <div className="app-side-foot"><span>Pantry</span><strong>9 items</strong></div>
              </div>
              <div className="app-main">
                <div className={`app-pane${activePane === 'cook' ? ' is-active' : ''}`} data-pane="cook">
                  <div className="app-head">
                    <div><h2>Tonight’s dinner</h2><p aria-live="polite">{generated ? 'Generated from 9 pantry items · 2 servings' : '9 pantry items · 2 servings · 20 min max'}</p></div>
                    <button className="app-generate" type="button" id="generate" onClick={() => { setSelected((current) => (current + 1) % 3); setGenerated(true); }}>Generate <svg aria-hidden="true"><use href="#i-arrow"/></svg></button>
                  </div>
                  <div className="recipe-grid" id="recipe-grid">
                    <article className={`recipe${selected === 0 ? ' is-selected' : ''}`}>
                      <div className="recipe-art">
                        <svg className="recipe-illus" viewBox="0 0 120 80" aria-hidden="true">
                          <ellipse cx="60" cy="69" rx="35" ry="4" fill="#1e40af" opacity=".14"/>
                          <path d="M26 39h68c0 16-15 26-34 26S26 55 26 39Z" fill="#fffdf8" stroke="#141314" strokeWidth="2"/>
                          <path d="M32 39c2-12 13-20 28-20s26 8 28 20Z" fill="#e8ecfa" stroke="#141314" strokeWidth="2"/>
                          <path d="M43 31c4-5 10-7 17-7s13 2 17 7" fill="none" stroke="#1e40af" strokeWidth="3" strokeLinecap="round"/>
                          <path d="M48 29c3-3 7-4 12-4s9 1 12 4" fill="none" stroke="#141314" strokeWidth="1.4" strokeLinecap="round"/>
                          <circle cx="42" cy="35" r="2" fill="#1e40af"/><circle cx="58" cy="32" r="1.6" fill="#1e40af"/><circle cx="74" cy="35" r="2" fill="#1e40af"/>
                          <path d="M80 23c4-5 9-7 14-6-1 6-5 10-11 10" fill="#e8ecfa" stroke="#141314" strokeWidth="1.4" strokeLinejoin="round"/>
                          <path d="M79 28c-2-4-6-6-10-6 1 4 3 7 7 8" fill="#fbfaf4" stroke="#141314" strokeWidth="1.4" strokeLinejoin="round"/>
                          <path d="M35 22c-3-3-7-4-10-3 1 4 4 6 8 6" fill="#1e40af"/>
                          <circle cx="60" cy="54" r="2.5" fill="#1e40af"/>
                        </svg>
                      </div>
                      <div className="recipe-body">
                        <h3>Lemon rice &amp; greens</h3>
                        <p>20 min · 1 pan</p>
                        <span className="match">92% match</span>
                        <div className="recipe-ing"><span>Eggs</span><span>Rice</span><span>Lemon</span></div>
                        <div className="recipe-why"><span>Uses 6 of 9</span><span>2 missing</span></div>
                      </div>
                    </article>
                    <article className={`recipe${selected === 1 ? ' is-selected' : ''}`}>
                      <div className="recipe-art">
                        <svg className="recipe-illus" viewBox="0 0 120 80" aria-hidden="true">
                          <ellipse cx="60" cy="68" rx="38" ry="4" fill="#1e40af" opacity=".14"/>
                          <ellipse cx="60" cy="44" rx="37" ry="21" fill="#e8ecfa" stroke="#141314" strokeWidth="2"/>
                          <ellipse cx="60" cy="44" rx="29" ry="15" fill="#1e40af" opacity=".22"/>
                          <circle cx="49" cy="40" r="10" fill="#fffdf8" stroke="#141314" strokeWidth="1.6"/>
                          <circle cx="49" cy="40" r="4" fill="#1e40af"/>
                          <circle cx="72" cy="48" r="9" fill="#fffdf8" stroke="#141314" strokeWidth="1.6"/>
                          <circle cx="72" cy="48" r="3.5" fill="#1e40af"/>
                          <path d="M38 30c4-3 9-4 13-3" fill="none" stroke="#141314" strokeWidth="1.4" strokeLinecap="round"/>
                          <path d="M85 34c-2-4-6-6-10-6" fill="none" stroke="#141314" strokeWidth="1.4" strokeLinecap="round"/>
                          <circle cx="62" cy="31" r="2" fill="#1e40af"/><circle cx="82" cy="43" r="1.6" fill="#1e40af"/>
                        </svg>
                      </div>
                      <div className="recipe-body">
                        <h3>Eggs in tomato</h3>
                        <p>15 min · 1 pan</p>
                        <span className="match">88% match</span>
                        <div className="recipe-ing"><span>Eggs</span><span>Tomato</span><span>Herbs</span></div>
                        <div className="recipe-why"><span>Uses 5 of 9</span><span>3 missing</span></div>
                      </div>
                    </article>
                    <article className={`recipe${selected === 2 ? ' is-selected' : ''}`}>
                      <div className="recipe-art">
                        <svg className="recipe-illus" viewBox="0 0 120 80" aria-hidden="true">
                          <ellipse cx="60" cy="69" rx="34" ry="4" fill="#1e40af" opacity=".14"/>
                          <path d="M29 38h62v8c0 12-14 20-31 20S29 58 29 46v-8Z" fill="#fffdf8" stroke="#141314" strokeWidth="2"/>
                          <path d="M29 38c0-6 14-10 31-10s31 4 31 10" fill="#e8ecfa" stroke="#141314" strokeWidth="2"/>
                          <path d="M23 38h74" stroke="#141314" strokeWidth="2" strokeLinecap="round"/>
                          <path d="M41 25c0-4 4-4 4-8M60 23c0-4 4-4 4-8M79 25c0-4 4-4 4-8" fill="none" stroke="#1e40af" strokeWidth="2" strokeLinecap="round"/>
                          <circle cx="47" cy="46" r="4" fill="#1e40af"/><circle cx="61" cy="50" r="4" fill="#1e40af"/><circle cx="75" cy="45" r="4" fill="#1e40af"/><circle cx="55" cy="58" r="4" fill="#1e40af"/><circle cx="70" cy="57" r="4" fill="#1e40af"/>
                          <path d="M38 52c3-3 7-4 10-3" fill="none" stroke="#141314" strokeWidth="1.4" strokeLinecap="round"/>
                        </svg>
                      </div>
                      <div className="recipe-body">
                        <h3>Chickpea stew</h3>
                        <p>25 min · 1 pot</p>
                        <span className="match">84% match</span>
                        <div className="recipe-ing"><span>Chickpeas</span><span>Tomato</span><span>Garlic</span></div>
                        <div className="recipe-why"><span>Uses 7 of 9</span><span>1 missing</span></div>
                      </div>
                    </article>
                  </div>
                  <div className="app-bottom">
                    <div className="using"><span>Using</span><span className="mini-chip on">Eggs</span><span className="mini-chip">Spinach</span><span className="mini-chip">Rice</span><span className="mini-chip">Lemon</span><span className="mini-chip">Tahini</span></div>
                    <a className="app-start" href="/app/generate">Start cooking <svg aria-hidden="true"><use href="#i-arrow"/></svg></a>
                  </div>
                </div>

                <div className={`app-pane${activePane === 'pantry' ? ' is-active' : ''}`} data-pane="pantry">
                  <div className="app-head">
                    <div><h2>Your pantry</h2><p>9 items · updated just now</p></div>
                    <button className="app-generate" type="button">Add item</button>
                  </div>
                  <div className="pantry-search"><svg aria-hidden="true"><use href="#i-search"/></svg><span>Find an ingredient</span><span className="kbd">⌘K</span></div>
                  <div className="pantry-grid">
                    <span className="pchip on">Eggs <b>6</b></span><span className="pchip on">Spinach <b>1 bag</b></span><span className="pchip on">Rice <b>500g</b></span><span className="pchip on">Lemon <b>1</b></span>
                    <span className="pchip on">Tahini <b>½ jar</b></span><span className="pchip on">Chickpeas <b>2 tins</b></span><span className="pchip on">Garlic <b>1 bulb</b></span><span className="pchip on">Olive oil <b>—</b></span>
                    <span className="pchip">Mushrooms</span><span className="pchip">Cream</span><span className="pchip">Pasta</span><span className="pchip">Feta</span>
                  </div>
                  <div className="match-bar">
                    <div className="mb-top"><span>Pantry match</span><strong>82%</strong></div>
                    <div className="mb-track"><i style={{ width: '82%' }}></i></div>
                    <p>2 missing for tonight’s shortlist: lemon zest, fresh herbs.</p>
                  </div>
                </div>

                <div className={`app-pane${activePane === 'taste' ? ' is-active' : ''}`} data-pane="taste">
                  <div className="app-head">
                    <div><h2>Your taste</h2><p>Learned from 12 ratings</p></div>
                    <button className="app-generate" type="button">Edit rules</button>
                  </div>
                  <div className="taste-list">
                    <div className="taste-row"><div><strong>No slimy textures</strong><span>Mushrooms, okra, cooked tomato</span></div><span className="switch on" aria-hidden="true"><i></i></span></div>
                    <div className="taste-row"><div><strong>Loves charred edges</strong><span>Roasted veg, seared fish, toast</span></div><span className="switch on" aria-hidden="true"><i></i></span></div>
                    <div className="taste-row"><div><strong>Keep it mild</strong><span>Chilli on the side, not in the pan</span></div><span className="switch" aria-hidden="true"><i></i></span></div>
                  </div>
                  <div className="taste-rating">
                    <span>Last night’s dinner</span>
                    <div className="stars" aria-label="4 out of 5 stars"><svg><use href="#i-star"/></svg><svg><use href="#i-star"/></svg><svg><use href="#i-star"/></svg><svg><use href="#i-star"/></svg><svg className="off"><use href="#i-star"/></svg></div>
                  </div>
                </div>

                <div className={`app-pane${activePane === 'saved' ? ' is-active' : ''}`} data-pane="saved">
                  <div className="app-head">
                    <div><h2>Saved</h2><p>4 recipes for later</p></div>
                    <button className="app-generate" type="button">New list</button>
                  </div>
                  <div className="saved-list">
                    <div className="saved-row"><span className="saved-art"><svg aria-hidden="true"><use href="#i-bowl"/></svg></span><div><strong>Lemon rice &amp; greens</strong><span>20 min · 92% match</span></div><span className="bookmark"><svg aria-hidden="true"><use href="#i-saved"/></svg></span></div>
                    <div className="saved-row"><span className="saved-art"><svg aria-hidden="true"><use href="#i-pot"/></svg></span><div><strong>Eggs in tomato</strong><span>15 min · 88% match</span></div><span className="bookmark"><svg aria-hidden="true"><use href="#i-saved"/></svg></span></div>
                    <div className="saved-row"><span className="saved-art"><svg aria-hidden="true"><use href="#i-leaf"/></svg></span><div><strong>Chickpea stew</strong><span>25 min · 84% match</span></div><span className="bookmark"><svg aria-hidden="true"><use href="#i-saved"/></svg></span></div>
                    <div className="saved-row"><span className="saved-art"><svg aria-hidden="true"><use href="#i-bowl"/></svg></span><div><strong>Overnight oats</strong><span>5 min · 79% match</span></div><span className="bookmark"><svg aria-hidden="true"><use href="#i-saved"/></svg></span></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="stage-foot">
          <p className="trust"><svg aria-hidden="true"><use href="#i-check"/></svg>No account, no API key, no signal required.</p>
          <dl className="figures">
            <div className="figure"><b>52</b><span>recipes offline</span></div>
            <div className="figure"><b>128</b><span>ingredients mapped</span></div>
            <div className="figure"><b>9</b><span>allergen groups checked</span></div>
            <div className="figure"><b>0</b><span>bars of signal needed</span></div>
          </dl>
        </div>
      </div>
    </section>

    <section className="section" id="features">
      <div className="tc-container">
        <div className="section-head center">
          <div className="eyebrow"><span className="bar"></span>What it does</div>
          <h2>Built around your kitchen</h2>
          <p className="lead">Not a chatbot with a recipe habit. A small, opinionated engine that knows your ingredients, your rules and the way you actually like to eat.</p>
        </div>

        <div className="feature-list">
          <div className="feature">
            <div className="feature-media">
              <div className="shot" aria-hidden="true">
                <div className="shot-window">
                  <div className="shot-bar"><span className="dot"></span><span className="dot"></span><span className="dot"></span><span className="shot-title">Pantry</span><span className="shot-status">9 items</span></div>
                  <div className="shot-body">
                    <div className="shot-head"><div><h4>What’s in the kitchen</h4><p>Tap to add, remove or update a quantity.</p></div><span className="mini-btn">Add</span></div>
                    <div className="pantry-search"><svg aria-hidden="true"><use href="#i-search"/></svg><span>Find an ingredient</span></div>
                    <div className="pt-filters"><span className="pt-filter on">All 9</span><span className="pt-filter">Produce</span><span className="pt-filter">Dairy</span><span className="pt-filter">Dry</span></div>
                    <div className="p-table">
                      <div className="pt-row pt-head"><span>Ingredient</span><span>Have</span><span>Used in</span></div>
                      <div className="pt-row"><span className="pt-name"><i className="pt-dot"></i>Eggs</span><span>6</span><span>14</span></div>
                      <div className="pt-row"><span className="pt-name"><i className="pt-dot"></i>Spinach</span><span>1 bag</span><span>9</span></div>
                      <div className="pt-row"><span className="pt-name"><i className="pt-dot"></i>Rice</span><span>500 g</span><span>11</span></div>
                      <div className="pt-row"><span className="pt-name"><i className="pt-dot"></i>Lemon</span><span>1</span><span>7</span></div>
                      <div className="pt-row"><span className="pt-name"><i className="pt-dot"></i>Chickpeas</span><span>2 tins</span><span>8</span></div>
                      <div className="pt-row off"><span className="pt-name"><i className="pt-dot"></i>Mushrooms</span><span>—</span><span>0</span></div>
                      <p className="p-note"><span>Showing 6 of 9 items</span><span>128 in library</span></p>
                    </div>
                    <div className="match-bar">
                      <div className="mb-top"><span>Pantry match</span><strong>82%</strong></div>
                      <div className="mb-track"><i style={{ width: '82%' }}></i></div>
                      <p>2 missing for the shortlist. TasteChef tells you before you start, not halfway through.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="feature-copy">
              <div className="feature-index"><span>01</span>Pantry</div>
              <h3>Cook from your pantry</h3>
              <p>Tell it what you have — half a lemon, three eggs, the rice at the back of the cupboard. TasteChef matches it against 52 recipes and shows what you’re missing before you start.</p>
              <a className="text-link" href="/app/generate">Try the pantry <svg aria-hidden="true"><use href="#i-arrow"/></svg></a>
            </div>
          </div>

          <div className="feature swap" id="taste">
            <div className="feature-media">
              <div className="shot" aria-hidden="true">
                <div className="shot-window">
                  <div className="shot-bar"><span className="dot"></span><span className="dot"></span><span className="dot"></span><span className="shot-title">Taste</span><span className="shot-status">12 ratings</span></div>
                  <div className="shot-body">
                    <div className="shot-head"><div><h4>Your taste, not a guess</h4><p>Hard rules and soft preferences live together.</p></div><span className="mini-btn">Edit</span></div>
                    <div className="taste-dial">
                      <div className="td-top"><span>Mushroom texture</span><b>Never</b></div>
                      <div className="td-track"><i></i><span className="td-knob"></span></div>
                      <div className="td-scale"><span>Any</span><span>Soft</span><span>Never</span></div>
                    </div>
                    <div className="taste-list">
                      <div className="taste-row"><div><strong>No slimy textures</strong><span>Mushrooms, okra, cooked tomato</span></div><span className="switch on" aria-hidden="true"><i></i></span></div>
                      <div className="taste-row"><div><strong>Loves charred edges</strong><span>Roasted veg, seared fish, toast</span></div><span className="switch on" aria-hidden="true"><i></i></span></div>
                      <div className="taste-row"><div><strong>Keep it mild</strong><span>Chilli on the side, not in the pan</span></div><span className="switch" aria-hidden="true"><i></i></span></div>
                      <div className="taste-row"><div><strong>No dairy</strong><span>Milk, cream, soft cheese</span></div><span className="switch" aria-hidden="true"><i></i></span></div>
                    </div>
                    <div className="taste-learned"><span>Learned this week</span><div><b>+ coriander</b><b className="neg">− soft aubergine</b></div></div>
                    <div className="taste-rating"><span>Last night’s dinner</span><div className="stars" aria-label="4 out of 5 stars"><svg><use href="#i-star"/></svg><svg><use href="#i-star"/></svg><svg><use href="#i-star"/></svg><svg><use href="#i-star"/></svg><svg className="off"><use href="#i-star"/></svg></div></div>
                  </div>
                </div>
              </div>
            </div>
            <div className="feature-copy">
              <div className="feature-index"><span>02</span>Taste</div>
              <h3>Taste, not guesswork</h3>
              <p>Rate a dish, flag a texture, add a rule. The engine learns what you reach for and quietly stops suggesting the mushrooms you can’t stand.</p>
              <a className="text-link" href="/app/generate">How taste works <svg aria-hidden="true"><use href="#i-arrow"/></svg></a>
            </div>
          </div>

          <div className="feature" id="offline">
            <div className="feature-media">
              <div className="shot phone-shot" aria-hidden="true">
                <div className="phone-wrap">
                  <div className="phone">
                    <div className="phone-screen">
                      <div className="ps-bar"><span>9:41</span><span className="ps-nosignal"><svg aria-hidden="true"><use href="#i-signal-off"/></svg>No signal</span></div>
                      <div className="ps-body">
                        <div className="ps-title">Tonight’s dinner</div>
                        <div className="ps-art">
                          <svg viewBox="0 0 120 80" aria-hidden="true">
                            <ellipse cx="60" cy="69" rx="35" ry="4" fill="#1e40af" opacity=".14"/>
                            <path d="M26 39h68c0 16-15 26-34 26S26 55 26 39Z" fill="#fffdf8" stroke="#141314" strokeWidth="2"/>
                            <path d="M32 39c2-12 13-20 28-20s26 8 28 20Z" fill="#e8ecfa" stroke="#141314" strokeWidth="2"/>
                            <path d="M43 31c4-5 10-7 17-7s13 2 17 7" fill="none" stroke="#1e40af" strokeWidth="3" strokeLinecap="round"/>
                            <path d="M48 29c3-3 7-4 12-4s9 1 12 4" fill="none" stroke="#141314" strokeWidth="1.4" strokeLinecap="round"/>
                            <circle cx="42" cy="35" r="2" fill="#1e40af"/><circle cx="58" cy="32" r="1.6" fill="#1e40af"/><circle cx="74" cy="35" r="2" fill="#1e40af"/>
                            <path d="M80 23c4-5 9-7 14-6-1 6-5 10-11 10" fill="#e8ecfa" stroke="#141314" strokeWidth="1.4" strokeLinejoin="round"/>
                            <path d="M79 28c-2-4-6-6-10-6 1 4 3 7 7 8" fill="#fbfaf4" stroke="#141314" strokeWidth="1.4" strokeLinejoin="round"/>
                            <path d="M35 22c-3-3-7-4-10-3 1 4 4 6 8 6" fill="#1e40af"/>
                            <circle cx="60" cy="54" r="2.5" fill="#1e40af"/>
                          </svg>
                        </div>
                        <div className="ps-card">
                          <strong>Lemon rice &amp; greens</strong>
                          <span>20 min · 1 pan · uses 6 of 9</span>
                          <span className="ps-match">92% match</span>
                        </div>
                        <div className="ps-list">
                          <div><span>Generated</span><b>on device</b></div>
                          <div><span>Data sent</span><b>0 KB</b></div>
                          <div><span>Offline mode</span><b>On</b></div>
                        </div>
                      </div>
                      <div className="ps-toast"><svg aria-hidden="true"><use href="#i-check"/></svg>Recipe ready · 0.4s</div>
                    </div>
                  </div>
                  <div className="phone-badge"><svg aria-hidden="true"><use href="#i-check"/></svg>0 KB sent</div>
                </div>
              </div>
            </div>
            <div className="feature-copy">
              <div className="feature-index"><span>03</span>Offline</div>
              <h3>Offline by design</h3>
              <p>The recipe engine runs on your phone. No API key, no account, no round trip to a server. It works on the train, in the shop, and in the kitchen with the wifi off.</p>
              <a className="text-link" href="/app/generate">Try it offline <svg aria-hidden="true"><use href="#i-arrow"/></svg></a>
            </div>
          </div>
        </div>
      </div>
    </section>

    <section className="section" id="stories">
      <div className="tc-container">
        <div className="section-head">
          <div className="eyebrow"><span className="bar"></span>Early testers</div>
          <h2>People who cook <span className="nowrap">with it</span></h2>
        </div>
        <div className="quotes">
          <div className="quote-feature">
            <div className="author">
              <span className="avatar" aria-hidden="true">
                <svg viewBox="0 0 48 48"><defs><pattern id="dots-a" width="4" height="4" patternUnits="userSpaceOnUse"><circle cx="1" cy="1" r=".8" fill="#1e40af" opacity=".5"/></pattern></defs><rect width="48" height="48" fill="#f2f1ec"/><circle cx="24" cy="20" r="10" fill="#fbfaf4" stroke="#141314" strokeWidth="1.4"/><path d="M13 47c1-9 5-13 11-13s10 4 11 13" fill="#1e40af"/><path d="M14 20c0-7 4.5-11 10-11s10 4 10 11c-2-3-5-5-10-5s-8 2-10 5Z" fill="#141314"/><rect x="24" y="11" width="14" height="19" fill="url(#dots-a)"/><circle cx="20.5" cy="20" r="1" fill="#141314"/><circle cx="27.5" cy="20" r="1" fill="#141314"/><path d="M21.5 24.5c1.6 1.2 3.4 1.2 5 0" fill="none" stroke="#141314" strokeWidth="1.1" strokeLinecap="round"/></svg>
              </span>
              <div><div className="author-name">Maya R.</div><div className="author-role">Cooks for two, Bristol</div></div>
            </div>
            <p className="quote">I stopped opening five tabs to work out dinner. It read my pantry and gave me something I actually wanted to eat.</p>
          </div>
          <div className="quote-pair">
            <div className="quote-cell">
            <div className="author">
              <span className="avatar" aria-hidden="true">
                <svg viewBox="0 0 48 48"><defs><pattern id="dots-b" width="4" height="4" patternUnits="userSpaceOnUse"><circle cx="1" cy="1" r=".8" fill="#1e40af" opacity=".5"/></pattern></defs><rect width="48" height="48" fill="#f2f1ec"/><circle cx="24" cy="20" r="10" fill="#fbfaf4" stroke="#141314" strokeWidth="1.4"/><path d="M13 47c1-9 5-13 11-13s10 4 11 13" fill="#141314"/><path d="M14 21c-1-8 4-12 10-12 7 0 11 4 10 12-1-2-3-4-5-4-2 2-7 3-10 2-2 1-4 1-5 2Z" fill="#141314"/><rect x="10" y="12" width="13" height="16" fill="url(#dots-b)"/><circle cx="20.5" cy="20" r="1" fill="#141314"/><circle cx="27.5" cy="20" r="1" fill="#141314"/><path d="M21.5 24.5c1.6 1.2 3.4 1.2 5 0" fill="none" stroke="#141314" strokeWidth="1.1" strokeLinecap="round"/></svg>
              </span>
              <div><div className="author-name">Daniel O.</div><div className="author-role">Home cook, Chicago</div></div>
            </div>
            <p className="quote">The texture settings are the first ones that made sense. No more slimy mushrooms hiding in a sauce.</p>
          </div>
            <div className="quote-cell">
            <div className="author">
              <span className="avatar" aria-hidden="true">
                <svg viewBox="0 0 48 48"><defs><pattern id="dots-c" width="4" height="4" patternUnits="userSpaceOnUse"><circle cx="1" cy="1" r=".8" fill="#1e40af" opacity=".5"/></pattern></defs><rect width="48" height="48" fill="#f2f1ec"/><circle cx="24" cy="20" r="10" fill="#fbfaf4" stroke="#141314" strokeWidth="1.4"/><path d="M13 47c1-9 5-13 11-13s10 4 11 13" fill="#1e40af"/><path d="M13 22c0-9 5-13 11-13s11 4 11 13c0-3-2-6-4-7-3 2-11 2-14 0-2 1-4 4-4 7Z" fill="#141314"/><rect x="24" y="10" width="14" height="20" fill="url(#dots-c)"/><circle cx="20.5" cy="20" r="1" fill="#141314"/><circle cx="27.5" cy="20" r="1" fill="#141314"/><path d="M21.5 24.5c1.6 1.2 3.4 1.2 5 0" fill="none" stroke="#141314" strokeWidth="1.1" strokeLinecap="round"/></svg>
              </span>
              <div><div className="author-name">Priya S.</div><div className="author-role">Commuter, Toronto</div></div>
            </div>
            <p className="quote">It works on the train with no bars. That’s the whole review.</p>
          </div>
          </div>
        </div>
      </div>
    </section>

    <section className="section" id="download">
      <div className="tc-container">
        <div className="section-head">
          <div className="eyebrow"><span className="bar"></span>Get it</div>
          <h2>Take it into the kitchen</h2>
          <p className="lead">Start on the web in seconds. Sideload the Android build, or keep it on your home screen like any other app.</p>
        </div>
        <div className="download-grid">
          <div className="platform">
            <span className="p-flag">Sideload</span>
            <span className="platform-icon"><svg aria-hidden="true"><use href="#i-phone"/></svg></span>
            <div className="p-head"><h3>Android</h3><p className="meta">Debug APK · 5.4 MB · v0.1.0</p></div>
            <a className="btn btn-primary" href="/downloads/tastechef-debug.apk" download>Download APK <svg aria-hidden="true"><use href="#i-arrow"/></svg></a>
            <div className="install-line"><b>Install</b><code>adb install tastechef-debug.apk</code></div>
          </div>
          <div className="platform">
            <span className="platform-icon"><svg aria-hidden="true"><use href="#i-tablet"/></svg></span>
            <div className="p-head"><h3>iPhone &amp; iPad</h3><p className="meta">Install from Safari in two taps.</p></div>
            <a className="btn btn-secondary" href="/app/generate">Open web app <svg aria-hidden="true"><use href="#i-arrow"/></svg></a>
            <div className="install-line"><b>Install</b><span>Share → Add to Home Screen</span></div>
          </div>
          <div className="platform">
            <span className="platform-icon"><svg aria-hidden="true"><use href="#i-monitor"/></svg></span>
            <div className="p-head"><h3>Desktop</h3><p className="meta">Any modern browser. No account needed.</p></div>
            <a className="btn btn-secondary" href="/app/generate">Open in browser <svg aria-hidden="true"><use href="#i-arrow"/></svg></a>
            <div className="install-line"><b>No install</b><span>Open and cook.</span></div>
          </div>
        </div>
        <p className="download-note">The Android build is a debug APK, signed with a local key. It’s for trying, not for the Play Store.</p>
      </div>
    </section>

    <section className="section" id="faq">
      <div className="tc-container">
        <div className="section-head">
          <div className="eyebrow"><span className="bar"></span>Good questions</div>
          <h2>The short answers</h2>
        </div>
        <div className="faq-grid">
          <div className="faq-item"><h3>Is TasteChef free?</h3><p>Yes. The web app and the offline engine are free to use. There’s no account, no trial and no paywall hiding the recipe button.</p></div>
          <div className="faq-item"><h3>Does it really work offline?</h3><p>Yes. The distilled recipe engine ships with the app, so generation runs on your device. You can turn off wifi and keep cooking.</p></div>
          <div className="faq-item"><h3>How does it learn my taste?</h3><p>Every rating updates a small on-device model. Any hard rule you set — no slimy textures, no mushrooms, no dairy — is applied before a recipe is shown.</p></div>
          <div className="faq-item"><h3>Can it handle allergies?</h3><p>It checks every ingredient against nine common allergen groups, including milk, eggs, peanuts, tree nuts, wheat, soy, fish, shellfish and sesame. It is a filter, not medical advice; always check labels.</p></div>
          <div className="faq-item"><h3>Do I need an account?</h3><p>No. The demo opens straight into the kitchen. If you sign in, your pantry and taste profile can follow you between devices.</p></div>
          <div className="faq-item"><h3>Where do the recipes come from?</h3><p>Fifty-two curated templates, each with ingredient-level nutrition and substitutions. The engine adapts them to your pantry instead of inventing dishes from scratch.</p></div>
        </div>
      </div>
    </section>

    </main>

    <footer className="section footer" id="footer">
      <div className="tc-container">
        <div className="footer-links">
          <div className="footer-col"><h4>Product</h4><a href="#features">Features</a><a href="#taste">Taste</a><a href="#offline">Offline</a><a href="#download">Download</a></div>
          <div className="footer-col"><h4>Company</h4><a href="#top">About</a><a href="#stories">Journal</a><a href="mailto:hello@tastechef.app">Contact</a></div>
          <div className="footer-col"><h4>Help</h4><a href="#faq">FAQ</a><a href="#faq">Privacy</a><a href="#faq">Terms</a></div>
        </div>
        <span className="giant" aria-hidden="true">TasteChef</span>
        <div className="footer-base">
          <span className="copy">© 2026 TasteChef</span>
          <div className="socials">
            <a href="https://instagram.com" aria-label="TasteChef on Instagram"><svg aria-hidden="true"><use href="#i-instagram"/></svg>Instagram</a>
            <a href="https://youtube.com" aria-label="TasteChef on YouTube"><svg aria-hidden="true"><use href="#i-youtube"/></svg>YouTube</a>
            <a href="https://github.com" aria-label="TasteChef on GitHub"><svg aria-hidden="true"><use href="#i-github"/></svg>GitHub</a>
          </div>
        </div>
        <p className="footer-note">Nutrition is estimated, not medical advice. Android builds are debug APKs signed locally.</p>
      </div>
    </footer>
  </div>
</div>
    </>
  );
}
