import { useEffect, useMemo, useState } from "react";
import "./Dashboard.css";
import "./DashboardActions.css";

const idOf = value => (typeof value === "string" ? value : value?._id);
const titleCase = value => value?.charAt(0).toUpperCase() + value?.slice(1);

export default function Dashboard({ user, apiUrl, onLogout, onDiscover, onOpenChat }) {
  const [peers, setPeers] = useState([]);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [selectedPeer, setSelectedPeer] = useState(null);
  const [message, setMessage] = useState("");
  const userId = user?._id;
  const offeredSkills = user?.skillsOffered || [];
  const wantedSkills = user?.skillsWanted || [];

  const loadDashboard = async () => {
    if (!userId) {
      setLoading(false);
      setError("Please log in again to load your requests.");
      return;
    }
    try {
      setLoading(true);
      const [usersResponse, requestsResponse] = await Promise.all([
        fetch(`${apiUrl}/api/users`),
        fetch(`${apiUrl}/api/swap-requests`),
      ]);
      if (!usersResponse.ok || !requestsResponse.ok) throw new Error();
      setPeers(await usersResponse.json());
      setRequests(await requestsResponse.json());
      setError("");
    } catch {
      setError("We could not load your community data. Make sure the backend is running.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadDashboard(); }, [userId]);

  const suggestions = useMemo(() => {
    const score = peer => {
      const offers = peer.skillsOffered || [];
      const wants = peer.skillsWanted || [];
      return offers.filter(skill => wantedSkills.includes(skill)).length * 2 +
        wants.filter(skill => offeredSkills.includes(skill)).length;
    };
    return peers.filter(peer => idOf(peer) !== userId).sort((a, b) => score(b) - score(a)).slice(0, 4);
  }, [peers, userId, offeredSkills, wantedSkills]);

  const received = requests.filter(request => idOf(request.toUser) === userId);
  const sent = requests.filter(request => idOf(request.fromUser) === userId);

  const sendRequest = async event => {
    event.preventDefault();
    if (!selectedPeer || !message.trim()) return;
    try {
      const response = await fetch(`${apiUrl}/api/swap-requests`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fromUser: userId, toUser: selectedPeer._id, message: message.trim() }),
      });
      if (!response.ok) throw new Error();
      const created = await response.json();
      setRequests(current => [{ ...created, fromUser: user, toUser: selectedPeer }, ...current]);
      setNotice(`Your request was sent to ${selectedPeer.name}.`);
      setSelectedPeer(null);
      setMessage("");
    } catch {
      setNotice("Your request could not be sent. Please try again.");
    }
  };

  const updateRequest = async (requestId, status) => {
    try {
      const response = await fetch(`${apiUrl}/api/swap-requests/${requestId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!response.ok) throw new Error();
      const updated = await response.json();
      setRequests(current => current.map(request => request._id === requestId ? { ...request, ...updated } : request));
      setNotice(`Request ${status}.`);
    } catch {
      setNotice("The request could not be updated. Please try again.");
    }
  };

  const tags = (skills, kind, emptyText) => skills.length
    ? skills.map(skill => <span className={`tag ${kind}`} key={skill}>{skill}</span>)
    : <span className="empty-skill">{emptyText}</span>;

  return <div className="dashboard-page">
    <nav>
      <a className="brand" href="#dashboard"><span>↔</span> swaplify</a>
      <div className="nav-links"><button className="nav-action" onClick={onDiscover}>Discover</button><button className="nav-action" onClick={() => onOpenChat()}>Messages</button><span>Hi, {user.name}</span><button className="login" onClick={onLogout}>Log out</button></div>
    </nav>
    <main className="dashboard" id="dashboard">
      <section className="dashboard-intro"><div><p className="eyebrow">YOUR LEARNING SPACE</p><h1>Welcome back, {user.name?.split(" ")[0] || "learner"}.</h1><p>Find a learning partner, manage your requests, and keep your skill journey moving.</p></div><button className="primary" onClick={onDiscover}>Explore all peers <span>→</span></button></section>
      {notice && <p className="dashboard-notice" role="status">{notice}</p>}
      {error && <p className="dashboard-error" role="alert">{error}</p>}
      <div className="dashboard-layout">
        <section className="dashboard-main">
          <div className="dashboard-heading"><div><p className="eyebrow">MATCHES FOR YOU</p><h2>Suggested learning partners</h2></div><button className="text-button" onClick={loadDashboard}>Refresh</button></div>
          {loading ? <p className="dashboard-empty">Finding people for you…</p> : suggestions.length ? <div className="suggestion-grid">{suggestions.map(peer => <article className="suggestion-card" key={peer._id}>
            <div className="suggestion-top"><div className="profile-avatar">{peer.name?.split(" ").map(part => part[0]).join("").slice(0, 2)}</div><div><h3>{peer.name}</h3><p>{peer.bio || "Skill exchanger"}</p></div></div>
            <p className="skill-label">Can teach</p><div className="dashboard-tags">{tags(peer.skillsOffered || [], "teach", "No skills added")}</div>
            <p className="skill-label">Wants to learn</p><div className="dashboard-tags">{tags(peer.skillsWanted || [], "wants", "No skills added")}</div>
            <div className="suggestion-actions"><button className="outline request-button" onClick={() => onOpenChat(peer)}>Message</button><button className="outline request-button" onClick={() => setSelectedPeer(peer)}>Request a swap</button></div>
          </article>)}</div> : <p className="dashboard-empty">No suggestions yet. Ask more people to join Swaplify.</p>}
          <RequestList title="Requests received" label="INCOMING" count={received.length} requests={received} type="received" onUpdate={updateRequest} onOpenChat={onOpenChat} />
          <RequestList title="Requests sent" label="OUTGOING" count={sent.length} requests={sent} type="sent" onUpdate={updateRequest} onOpenChat={onOpenChat} />
        </section>
        <aside className="profile-panel"><p className="eyebrow">YOUR PROFILE</p><div className="large-profile-avatar">{user.name?.split(" ").map(part => part[0]).join("").slice(0, 2) || "Y"}</div><h2>{user.name}</h2><p className="profile-email">{user.email}</p>{user.bio && <p className="profile-bio">{user.bio}</p>}<div className="profile-divider" /><p className="skill-label">You can teach</p><div className="dashboard-tags">{tags(offeredSkills, "teach", "Add skills to improve your matches.")}</div><p className="skill-label">You want to learn</p><div className="dashboard-tags">{tags(wantedSkills, "wants", "Add learning goals to get suggestions.")}</div><div className="profile-stats"><div><strong>{sent.length}</strong><span>Sent</span></div><div><strong>{received.length}</strong><span>Received</span></div><div><strong>{user.rating || "New"}</strong><span>Rating</span></div></div></aside>
      </div>
    </main>
    {selectedPeer && <div className="modal-backdrop" onClick={() => setSelectedPeer(null)}><div className="modal" onClick={event => event.stopPropagation()}><button className="close" onClick={() => setSelectedPeer(null)}>×</button><p className="eyebrow">START A SWAP</p><h2>Learn from {selectedPeer.name}</h2><p>Introduce yourself and say what you would like to exchange.</p><form onSubmit={sendRequest}><label>Your message<textarea required value={message} onChange={event => setMessage(event.target.value)} placeholder={`Hi ${selectedPeer.name?.split(" ")[0]}, I would love to learn from you. I can help you with…`} /></label><button className="primary wide">Send request →</button></form></div></div>}
  </div>;
}

function RequestList({ title, label, count, requests, type, onUpdate, onOpenChat }) {
  return <section className="request-section"><div className="dashboard-heading"><div><p className="eyebrow">{label}</p><h2>{title}</h2></div><span className="request-count">{count}</span></div>{requests.length ? <div className="request-list">{requests.map(request => { const peer = type === "sent" ? request.toUser : request.fromUser; return <article className="request-card" key={request._id}><div><h3>{type === "sent" ? `To ${peer?.name || "a Swaplify member"}` : peer?.name || "A Swaplify member"}</h3><p>{request.message}</p><small>Sent {new Date(request.createdAt).toLocaleDateString()}</small></div><div className="request-card-footer"><button className="outline message-button" disabled={!peer?._id} onClick={() => onOpenChat(peer, request)}>Message</button>{type === "received" && request.status === "pending" ? <div className="request-actions"><button className="accept" onClick={() => onUpdate(request._id, "accepted")}>Accept</button><button className="decline" onClick={() => onUpdate(request._id, "declined")}>Decline</button></div> : <span className={`status ${request.status}`}>{titleCase(request.status)}</span>}</div></article>})}</div> : <p className="dashboard-empty">{type === "sent" ? "You have not sent a request yet." : "No one has sent you a request yet."}</p>}</section>;
}
