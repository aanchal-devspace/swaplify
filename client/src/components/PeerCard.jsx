import React from "react";
export default function PeerCard({ peer, onRequest }) {
  return <article className="peer-card">
    <div className="card-top"><div className={`avatar ${peer.color}`}>{peer.initials}</div><div><h3>{peer.name}</h3><p>{peer.role}</p></div></div>
    <div className="skill-row"><span>Teaches</span><div>{peer.offers.map(skill => <b className="tag teach" key={skill}>{skill}</b>)}</div></div>
    <div className="skill-row"><span>Wants</span><div>{peer.wants.map(skill => <b className="tag wants" key={skill}>{skill}</b>)}</div></div>
    <footer><span>★ {peer.rating} · {peer.swaps} swaps</span><button className="outline" onClick={() => onRequest(peer)}>Swap skills</button></footer>
  </article>;
}
