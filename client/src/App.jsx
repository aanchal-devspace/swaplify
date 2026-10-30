import React from "react";
import { useMemo, useState } from "react";
import { peers } from "./data";
import PeerCard from "./components/PeerCard";


const API_URL = import.meta.env.VITE_API_URL || "https://swaplify-3.onrender.com";
const LOGIN_PATH = "/api/users/login";
const SIGNUP_PATH = "/api/users/register";


export default function App() {
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState(null);
  const [sent, setSent] = useState(false);

  
  const [authMode, setAuthMode] = useState(null);
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [authError, setAuthError] = useState("");
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("swaplify_user"));
    } catch {
      return null;
    }
  });

  const matchingPeers = useMemo(
    () =>
      peers.filter(peer =>
        `${peer.name} ${peer.offers.join(" ")} ${peer.wants.join(" ")}`
          .toLowerCase()
          .includes(query.toLowerCase())
      ),
    [query]
  );

  const sendRequest = event => {
    event.preventDefault();
    setSent(true);
  };

  const openAuth = mode => {
    setAuthMode(mode);
    setAuthError("");
    setForm({ name: "", email: "", password: "" });
  };

  const closeAuth = () => {
    setAuthMode(null);
    setAuthError("");
  };

  const handleAuth = async event => {
    event.preventDefault();
    setLoading(true);
    setAuthError("");
    const path = authMode === "login" ? LOGIN_PATH : SIGNUP_PATH;
    const body =
      authMode === "login"
        ? { email: form.email, password: form.password }
        : form;
    try {
      const res = await fetch(`${API_URL}${path}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setAuthError(data.message || data.error || "Something went wrong. Please try again.");
        return;
      }
      const loggedIn = data.user || { name: form.name || form.email.split("@")[0], email: form.email };
      try {
        localStorage.setItem("swaplify_user", JSON.stringify(loggedIn));
        if (data.token) localStorage.setItem("swaplify_token", data.token);
      } catch {}
      setUser(loggedIn);
      closeAuth();
    } catch {
      setAuthError("Could not reach the server. Is the backend running on port 8000?");
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    try {
      localStorage.removeItem("swaplify_user");
      localStorage.removeItem("swaplify_token");
    } catch {}
    setUser(null);
  };

  return <>
    <nav>
      <a className="brand" href="#top"><span>↔</span> swaplify</a>
      <div className="nav-links">
        <a href="#discover">Discover</a>
        <a href="#how-it-works">How it works</a>
        {user ? <>
          <span>Hi, {user.name || user.email}</span>
          <button className="login" onClick={logout}>Log out</button>
        </> : <>
          <button className="login" onClick={() => openAuth("login")}>Log in</button>
          <button className="join" onClick={() => openAuth("signup")}>Join free</button>
        </>}
      </div>
    </nav>
    <main id="top">
      <section className="hero"><div><p className="eyebrow">PEER-TO-PEER LEARNING</p><h1>Trade what you know.<br/><em>Learn</em> what you love.</h1><p className="hero-copy">Swaplify connects curious people who teach one another — no fees, no awkward searching, just shared growth.</p><div className="hero-actions"><a className="primary" href="#discover">Find your match <span>→</span></a><a className="text-link" href="#how-it-works">How it works <span>↓</span></a></div><div className="proof"><div className="faces"><i>R</i><i>M</i><i>A</i><i>+</i></div><p><strong>2,000+ learners</strong><br/>already swapping skills</p></div></div><div className="hero-art"><div className="bubble bubble-one">✦</div><div className="bubble bubble-two">⌘</div><div className="swap-orbit"><div className="center-card">You<br/><strong>Can grow</strong></div><div className="orbit-card top-card">🎨<small>Design</small></div><div className="orbit-card left-card">⌨️<small>Code</small></div><div className="orbit-card right-card">◉<small>Speak</small></div><div className="orbit-card bottom-card">⌁<small>Create</small></div></div></div></section>
      <section className="steps" id="how-it-works"><p className="eyebrow">SIMPLE BY DESIGN</p><h2>Good things happen when knowledge moves.</h2><div className="step-grid"><div><b>01</b><h3>Share your skills</h3><p>Add what you can teach and what you want to explore.</p></div><div><b>02</b><h3>Meet your match</h3><p>Find people with the skills you are looking for.</p></div><div><b>03</b><h3>Grow together</h3><p>Schedule a session, learn something new, and leave a review.</p></div></div></section>
      <section className="discover" id="discover"><div className="section-heading"><div><p className="eyebrow">EXPLORE THE COMMUNITY</p><h2>People you could learn with.</h2></div><label className="search">⌕<input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search a skill or name" /></label></div><div className="peer-grid">{matchingPeers.map(peer => <PeerCard key={peer.id} peer={peer} onRequest={setSelected} />)}</div>{matchingPeers.length === 0 && <p className="empty">No peers found. Try another skill.</p>}</section>
    </main>
    <footer><a className="brand" href="#top"><span>↔</span> swaplify</a><p>Made for curious people, everywhere.</p><p>© 2026 Swaplify</p></footer>

    {selected && <div className="modal-backdrop" onClick={() => setSelected(null)}><div className="modal" onClick={e => e.stopPropagation()}>{sent ? <><div className="success">✓</div><h2>Request sent!</h2><p>Your swap request is on its way to {selected.name}. We’ll let you know when they respond.</p><button className="primary wide" onClick={() => { setSelected(null); setSent(false); }}>Done</button></> : <><button className="close" onClick={() => setSelected(null)}>×</button><p className="eyebrow">START A SWAP</p><h2>Learn from {selected.name}</h2><p>Tell them what you would like to exchange.</p><form onSubmit={sendRequest}><label>Your message<textarea required placeholder={`Hi ${selected.name.split(" ")[0]}, I'd love to learn ${selected.offers[0]} and can help you with…`} /></label><button className="primary wide">Send request →</button></form></>}</div></div>}

    {authMode && <div className="modal-backdrop" onClick={closeAuth}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <button className="close" onClick={closeAuth}>×</button>
        <p className="eyebrow">{authMode === "login" ? "WELCOME BACK" : "JOIN SWAPLIFY"}</p>
        <h2>{authMode === "login" ? "Log in" : "Create your account"}</h2>
        <form onSubmit={handleAuth}>
          {authMode === "signup" && <label>Name
            <input required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Your name" />
          </label>}
          <label>Email
            <input type="email" required value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="you@example.com" />
          </label>
          <label>Password
            <input type="password" required minLength={6} value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} placeholder="At least 6 characters" />
          </label>
          {authError && <p role="alert" style={{ color: "#c0392b", margin: "8px 0" }}>{authError}</p>}
          <button className="primary wide" disabled={loading}>
            {loading ? "Please wait..." : authMode === "login" ? "Log in →" : "Sign up →"}
          </button>
        </form>
        <p style={{ marginTop: 12 }}>
          {authMode === "login" ? "New here? " : "Already have an account? "}
          <a href="#top" onClick={e => { e.preventDefault(); openAuth(authMode === "login" ? "signup" : "login"); }}>
            {authMode === "login" ? "Join free" : "Log in"}
          </a>
        </p>
      </div>
    </div>}
  </>;
}