const dns = require('dns');
dns.setServers(['1.1.1.1', '8.8.8.8']);

const connectDB = require('./server/config/db');
const express = require('express');
const cors = require('cors');
const path = require('path');

require('dotenv').config();

const app = express();

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

const corsOptions = {
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    // removed credentials:true — incompatible with origin:'*'
};


app.use(cors(corsOptions));

// API Routes
const userRouter       = require('./server/routes/users');
const eventRouter      = require('./server/routes/events');
const directoryRouter  = require('./server/routes/directory');
const messagesRouter   = require('./server/routes/messages');
const mentorshipRouter = require('./server/routes/mentorship');
const discussionRouter = require('./server/routes/discussions');
const commentRouter    = require('./server/routes/comments');
const opportunityRouter    = require('./server/routes/opportunities');
const notificationRouter   = require('./server/routes/notifications');
const achievementRouter    = require('./server/routes/achievements');
const leadershipRouter     = require('./server/routes/leadership');

app.use('/users',        userRouter);
app.use('/events',       eventRouter);
app.use('/directory',    directoryRouter);
app.use('/messages',     messagesRouter);
app.use('/mentorship',   mentorshipRouter);
app.use('/discussions',  discussionRouter);
app.use('/comments',     commentRouter);
app.use('/opportunities',  opportunityRouter);
app.use('/notifications',  notificationRouter);
app.use('/achievements',   achievementRouter);
app.use('/leadership',     leadershipRouter);

// ========== FIX: Add middleware to handle static files for views ==========
// This ensures CSS/JS load correctly regardless of route path
app.use('/v', express.static(path.join(__dirname, 'public')));
app.use('/v', express.static(path.join(__dirname, 'views')));

// Serve HTML views
app.get('/',       (req, res) => res.sendFile(path.join(__dirname, 'views', 'index.html')));
app.get('/login',  (req, res) => res.sendFile(path.join(__dirname, 'views', 'login.html')));
app.get('/signup', (req, res) => res.sendFile(path.join(__dirname, 'views', 'signup.html')));
app.get('/v/home',   (req, res) => res.sendFile(path.join(__dirname, 'views', 'home.html')));
app.get('/v/directory', (req, res) => res.sendFile(path.join(__dirname, 'views', 'directory.html')));
app.get('/v/profile', (req, res) => res.sendFile(path.join(__dirname, 'views', 'profile.html')));
app.get('/v/events',  (req, res) => res.sendFile(path.join(__dirname, 'views', 'events.html')));
app.get('/v/opportunities',  (req, res) => res.sendFile(path.join(__dirname, 'views', 'opportunities.html')));
app.get('/v/messages',  (req, res) => res.sendFile(path.join(__dirname, 'views', 'messages.html')));
app.get('/v/mentorship',  (req, res) => res.sendFile(path.join(__dirname, 'views', 'mentorship.html')));
app.get('/v/discussions',  (req, res) => res.sendFile(path.join(__dirname, 'views', 'discussions.html')));
app.get('/v/achievements',  (req, res) => res.sendFile(path.join(__dirname, 'views', 'achievements.html')));
app.get('/v/leadership',  (req, res) => res.sendFile(path.join(__dirname, 'views', 'leadership.html')));

const PORT = process.env.PORT || 5000;

// Connect to DB first, then start server
connectDB().then(() => {
    app.listen(PORT, () => {
        console.log(`🚀 Server running at http://localhost:${PORT}`);
        console.log(`📁 CSS should be available at: http://localhost:${PORT}/css/style.css`);
        console.log(`📁 Also available at: http://localhost:${PORT}/v/css/style.css`);
    });
}).catch(err => {
    console.error('❌ Database connection failed:', err.message);
    process.exit(1);
});