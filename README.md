# KQueue

A simple queue system I built to manage project requests — mainly ESP32, Arduino, and Raspberry Pi stuff that people DM me about.

The problem was I kept forgetting who asked first, losing track of what needs to be done, and spending too much time going back and forth with clients before even starting. This fixes that.

## How it works

People fill out a form describing what they want built. I get a notification, check it out, and either approve or reject it. Approved requests go into the queue in order. I drag them around to reprioritize, mark them in-progress when I start, and done when I finish.

That's it.

## Pages

| URL | Who's it for |
|-----|--------------|
| `/` | Anyone who wants to submit a project |
| `/login` | Me |
| `/admin` | Me (after login) |

## Stack

- **Backend** — Node.js + Express
- **Database** — MongoDB Atlas (Mongoose)
- **Auth** — JWT, 24h expiry
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

The `render.yaml` is already set up. Just:

1. Push to GitHub
2. Connect the repo on [render.com](https://render.com)
3. Set `MONGODB_URI` and `ADMIN_PASSWORD` in the Environment tab
4. Deploy

MongoDB Atlas → Network Access → allow `0.0.0.0/0` so Render can connect.

## Form fields

Clients fill in:
- Project name
- Board type (ESP32, Arduino, etc.)
- What they want it to do
- Nickname + classroom (optional, useful for school projects)
- Contact — Instagram, Line, etc.
- Budget and deadline (optional)
- Any extra notes

## Notes

- The admin password is stored as plaintext in env. Good enough for personal use but don't reuse it elsewhere.
- Login is rate-limited to 5 attempts per 15 minutes per IP.
- JWT tokens expire after 24 hours.
- Drag-and-drop reordering saves automatically.
