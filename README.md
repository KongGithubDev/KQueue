# KQueue

A simple queue system I built to manage project requests — mainly ESP32, Arduino, and Raspberry Pi stuff that people ask me to build.

The problem was I kept forgetting who asked first and losing track of what's in progress. This fixes that.

## How it works

People fill out a form describing what they want built. I get a notification, review it, and either approve or reject it. Approved requests go into the queue. I can drag or use ↑↓ buttons to reprioritize, mark them in-progress when I start, and done when I finish. If parts are missing I can set it to "waiting for parts" and resume later.

## Pages

| URL | Who's it for |
|-----|--------------|
| `/` | Anyone submitting a project |
| `/login` | Me |
| `/admin` | Me (after login) |

## Stack

- **Backend** — Node.js + Express
- **Database** — MongoDB Atlas (Mongoose)
- **Auth** — JWT, 24h expiry, rate-limited login (5 attempts / 15 min)
- **Frontend** — Plain HTML/CSS/JS, no frameworks
- **Icons** — Lucide
- **Deploy** — Render.com

## Running locally

```bash
npm install
```

Create a `.env` file:

```
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=anything_long_and_random
ADMIN_PASSWORD=your_password
PORT=3000
```

```bash
npm run dev
```

Open `http://localhost:3000`

## Deploy on Render

The `render.yaml` is already configured. Steps:

1. Push to GitHub
2. Connect the repo on [render.com](https://render.com)
3. Set `MONGODB_URI` and `ADMIN_PASSWORD` in the Environment tab
4. Deploy

MongoDB Atlas → Network Access → allow `0.0.0.0/0` so Render can connect.

## Status flow

```
pending → approved → waiting_parts ⇄ in_progress → done
                                                     ↓
                                          (can revert back if needed)
```

## Features

**Client side**
- Submit project requests with name, board type, nickname, classroom, contact, budget, deadline, notes
- View live queue status

**Admin side**
- Approve / reject incoming requests
- Add projects directly (bypasses approval)
- Reorder queue with ↑↓ buttons or drag-and-drop
- Set status: approved → waiting parts → in progress → done (reversible)
- Post announcements visible to everyone on the public page
- Real-time stats: pending, in queue, in progress, done

## Security notes

- Admin password stored as plaintext in env — fine for personal use, don't reuse it elsewhere
- Login rate-limited to 5 wrong attempts per 15 minutes per IP
- JWT tokens expire after 24 hours
- CORS locked to `DOMAIN` in production
