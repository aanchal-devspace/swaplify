import { useEffect, useMemo, useState } from "react";
import "./chat.css";

const idOf = value => typeof value === "string" ? value : value?._id;
const initials = name => name?.split(" ").map(part => part[0]).join("").slice(0, 2) || "?";

export default function Chat({ user, apiUrl, initialPeer, initialSwapRequest, onBack, onLogout }) {
  const [people, setPeople] = useState([]);
  const [selectedPeer, setSelectedPeer] = useState(initialPeer || null);
  const [activeSwapRequest, setActiveSwapRequest] = useState(initialSwapRequest || null);
  const [messages, setMessages] = useState([]);
  const [draft, setDraft] = useState("");
  const [loadingPeople, setLoadingPeople] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [error, setError] = useState("");

  const userId = user?._id;

  useEffect(() => {
    const loadPeople = async () => {
      try {
        const response = await fetch(`${apiUrl}/api/users`);
        if (!response.ok) throw new Error();
        const users = await response.json();
        const otherPeople = users.filter(person => idOf(person) !== userId);
        setPeople(otherPeople);
        if (initialPeer) {
          setSelectedPeer(otherPeople.find(person => person._id === initialPeer._id) || initialPeer);
        }
      } catch {
        setError("We could not load the Swaplify community.");
      } finally {
        setLoadingPeople(false);
      }
    };
    if (!userId) {
      setLoadingPeople(false);
      setError("Please log in again to use messages.");
      return;
    }
    loadPeople();
  }, [apiUrl, initialPeer, userId]);

  useEffect(() => {
    const loadConversation = async () => {
      if (!selectedPeer?._id || !userId) return;
      try {
        setLoadingMessages(true);
        const query = new URLSearchParams({ userId, peerId: selectedPeer._id });
        const response = await fetch(`${apiUrl}/api/messages/conversation?${query}`);
        if (!response.ok) throw new Error();
        setMessages(await response.json());
        setError("");
      } catch {
        setError("We could not load this conversation.");
      } finally {
        setLoadingMessages(false);
      }
    };
    loadConversation();
  }, [apiUrl, selectedPeer?._id, userId]);

  const visiblePeople = useMemo(() => [...people].sort((a, b) => a.name.localeCompare(b.name)), [people]);

  const choosePeer = person => {
    setSelectedPeer(person);
    setActiveSwapRequest(null);
    setMessages([]);
  };

  const sendMessage = async event => {
    event.preventDefault();
    if (!selectedPeer || !draft.trim()) return;
    try {
      const response = await fetch(`${apiUrl}/api/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sender: userId, receiver: selectedPeer._id, text: draft.trim(), swapRequest: activeSwapRequest?._id }),
      });
      if (!response.ok) throw new Error();
      const createdMessage = await response.json();
      setMessages(current => [...current, createdMessage]);
      setDraft("");
    } catch {
      setError("Your message could not be sent. Please try again.");
    }
  };

  return <div className="chat-page">
    <nav><a className="brand" href="#messages"><span>↔</span> swaplify</a><div className="nav-links"><button className="nav-action" onClick={onBack}>Dashboard</button><span>Hi, {user.name}</span><button className="login" onClick={onLogout}>Log out</button></div></nav>
    <main className="chat-shell" id="messages">
      <aside className="conversation-list"><div className="conversation-list-head"><p className="eyebrow">YOUR MESSAGES</p><h1>Conversations</h1></div>{loadingPeople ? <p className="chat-empty">Loading people…</p> : visiblePeople.length ? visiblePeople.map(person => <button className={`conversation-person ${selectedPeer?._id === person._id ? "is-selected" : ""}`} key={person._id} onClick={() => choosePeer(person)}><span className="chat-avatar">{initials(person.name)}</span><span><strong>{person.name}</strong><small>{person.skillsOffered?.slice(0, 2).join(" · ") || "Swaplify member"}</small></span></button>) : <p className="chat-empty">No other members yet.</p>}</aside>
      <section className="chat-window">{selectedPeer ? <><header className="chat-header"><div className="chat-avatar large">{initials(selectedPeer.name)}</div><div><h2>{selectedPeer.name}</h2><p>{selectedPeer.bio || "Skill exchanger"}</p></div></header>{activeSwapRequest && <p className="chat-context">Chat about your swap request: “{activeSwapRequest.message}”</p>}<div className="message-history">{loadingMessages ? <p className="chat-empty">Loading conversation…</p> : messages.length ? messages.map(message => <div className={`message-bubble ${idOf(message.sender) === userId ? "mine" : "theirs"}`} key={message._id}><p>{message.text}</p><small>{new Date(message.createdAt).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}</small></div>) : <div className="chat-empty"><strong>Start the conversation</strong><br />Say hello and plan your skill swap.</div>}</div><form className="message-form" onSubmit={sendMessage}><textarea aria-label="Message" value={draft} onChange={event => setDraft(event.target.value)} maxLength="1000" placeholder={`Write a message to ${selectedPeer.name?.split(" ")[0]}…`} /><button className="primary" type="submit">Send <span>→</span></button></form></> : <div className="chat-placeholder"><div className="placeholder-icon">↔</div><h2>Your conversations</h2><p>Choose a community member to start chatting about a skill swap.</p></div>}</section>
    </main>
    {error && <p className="chat-error" role="alert">{error}</p>}
  </div>;
}
