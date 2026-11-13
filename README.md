# Rule 7 Media - Official Enterprise Monorepo

Welcome to the official repository for **Rule 7 Media** (Colt Telecom Pty Ltd T/A Rule 7 Media).

## Project Structure
- `Auction-Frontend-main/Auction-Frontend-main/`: React 18, Vite, Tailwind CSS, Redux Toolkit frontend application.
- `Auction-Backend-main/Auction-Backend-main/`: Node.js, Express, MongoDB Atlas, Socket.io backend API.
- `WORK_PLAN_RULE7MEDIA.md`: Complete architectural work plan, security guidelines, and task tracker.

## Getting Started

### Backend
```bash
cd "Auction-Backend-main/Auction-Backend-main"
npm install
npm start
```
Runs on `http://localhost:8000/`.

### Frontend
```bash
cd "Auction-Frontend-main/Auction-Frontend-main"
npm install
npm run dev
```
Runs on `http://localhost:5173/`.

### Production Build
```bash
cd "Auction-Frontend-main/Auction-Frontend-main"
npm run build
```
Build output is generated in `dist/`.
