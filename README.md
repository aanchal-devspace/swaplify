# Swaplify

A peer-to-peer skill exchange website built with React, Express, and MongoDB. Users can list skills they offer and want, discover suitable peers, and send swap requests.

## Included in this starter

- Responsive React landing page and peer discovery screen
- Search by name or skill
- Swap-request modal with a success state
- Registration and login with hashed passwords
- Express API routes for users, swap requests, and messages
- MongoDB models for users, swap requests, and messages

## Run it locally

1. Install Node.js and MongoDB Community Server.
2. In this folder, run `npm install`, then `npm run install:all`.
3. Copy `server/.env.example` to `server/.env`.
4. Start MongoDB, then run `npm run dev`.
5. Open the address shown by Vite (normally `http://localhost:5173`).

## Messaging API

The backend now supports saved one-to-one messages:

- `POST /api/messages` sends a message. Provide `sender`, `receiver`, `text`, and optionally `swapRequest` in the request body.
- `GET /api/messages/conversation?userId=<id>&peerId=<id>` returns the messages exchanged by two users, ordered from oldest to newest.

The React discovery view currently uses sample peer data. A future chat screen can use these endpoints to display and send messages.
