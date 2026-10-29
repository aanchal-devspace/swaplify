# Swaplify

A peer-to-peer skill exchange website built with React, Express, and MongoDB. Users can list skills they offer and want, discover suitable peers, and send swap requests.

## Included in this starter

- Responsive React landing page and peer discovery screen
- Search by name or skill
- Swap-request modal with a success state
- Express API routes for users and swap requests
- MongoDB models for users and swap requests

## Run it locally

1. Install Node.js and MongoDB Community Server.
2. In this folder, run `npm install`, then `npm run install:all`.
3. Copy `server/.env.example` to `server/.env`.
4. Start MongoDB, then run `npm run dev`.
5. Open the address shown by Vite (normally `http://localhost:5173`).

The visible React interface currently uses sample peer data. The next step is to connect its requests to the API, then add authentication.
