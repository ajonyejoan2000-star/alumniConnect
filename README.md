# CodeQueen Alumni Connect Platform 🎓

A comprehensive digital community platform designed to connect CodeQueen alumni across cohorts, foster meaningful mentorship relationships, share career opportunities, and build a thriving community.

**Mission:** Strengthen alumni bonds through mentorship, networking, and community-driven initiatives.

---

## ✨ Core Features

### 🎯 Phase 1: Community Connection (MVP - Complete)
- **Alumni Directory** - Search alumni by name, cohort, skills, location
- **Direct Messaging** - Real-time conversations between alumni
- **Mentorship Matching** - Intelligent matching between mentors and mentees
- **Discussion Forums** - Community discussions with comments and reactions

### 💼 Phase 2: Opportunities & Events (Complete)
- **Opportunities Board** - Jobs, internships, scholarships, hackathons
- **Event Management** - Create, RSVP, and track event attendance
- **Notifications** - In-app notifications for key events and messages

### 🏆 Phase 3: Leadership & Recognition (Complete)
- **Leadership Dashboard** - Manage coordinator roles and initiatives
- **Achievements System** - Badges and recognition for contributions
- **Profile Verification** - Cohort authentication for community integrity

### 🎨 Phase 4: Polish & Enhancement (In Progress)
- **Mobile Responsive** - Fully responsive on all devices
- **Accessibility** - WCAG compliance (in development)
- **Security** - Enhanced security measures (in development)

---

## 🏗️ Technology Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | HTML5, CSS3, Bootstrap 5, Vanilla JavaScript |
| **Backend** | Node.js, Express.js |
| **Database** | MongoDB, Mongoose ODM |
| **Authentication** | JWT (JSON Web Tokens), bcryptjs |
| **API Style** | RESTful |
| **Deployment** | Ready for Heroku/AWS/Azure |

---

## 📂 Project Structure

```
alumniConnect/
├── server/
│   ├── config/
│   │   └── db.js                    # MongoDB connection setup
│   ├── controllers/                 # Business logic for each feature
│   │   ├── users.js                 # Auth & registration
│   │   ├── profile.js               # User profile management
│   │   ├── directory.js             # Alumni directory search
│   │   ├── messages.js              # Direct messaging
│   │   ├── mentorship.js            # Mentorship matching & management
│   │   ├── discussions.js           # Discussion forums
│   │   ├── comments.js              # Comments on discussions
│   │   ├── opportunities.js         # Job/opportunity board
│   │   ├── notifications.js         # Notification system
│   │   ├── achievements.js          # Achievement/badge system
│   │   ├── events.js                # Event management & RSVP
│   │   └── leadership.js            # Leadership roles & initiatives
│   ├── middleware/
│   │   ├── protect.js               # JWT authentication verification
│   │   └── authMiddleware.js        # Role-based access control
│   ├── models/
│   │   ├── users.js                 # User schema with skills, cohort, etc.
│   │   ├── message.js               # Direct messaging schema
│   │   ├── discussion.js            # Forum discussion schema
│   │   ├── comment.js               # Comment schema with nesting
│   │   ├── mentorship.js            # Mentorship relationship schema
│   │   ├── opportunity.js           # Job/opportunity posting schema
│   │   ├── achievement.js           # Badge/achievement schema
│   │   ├── notification.js          # Notification schema
│   │   ├── leadership.js            # Leadership role schema
│   │   ├── initiative.js            # Community initiative schema
│   │   └── events.js                # Event schema with RSVP
│   └── routes/
│       ├── users.js                 # /users routes
│       ├── directory.js             # /directory routes
│       ├── messages.js              # /messages routes
│       ├── mentorship.js            # /mentorship routes
│       ├── discussions.js           # /discussions routes
│       ├── comments.js              # /comments routes
│       ├── opportunities.js         # /opportunities routes
│       ├── events.js                # /events routes
│       ├── notifications.js         # /notifications routes
│       ├── achievements.js          # /achievements routes
│       └── leadership.js            # /leadership routes
├── views/                           # HTML5 pages
│   ├── index.html                   # Landing page
│   ├── login.html                   # Login page
│   ├── signup.html                  # Registration page
│   ├── home.html                    # Dashboard/feed
│   ├── directory.html               # Alumni directory
│   ├── messages.html                # Direct messaging interface
│   ├── mentorship.html              # Mentorship dashboard
│   ├── discussions.html             # Discussion forum
│   ├── opportunities.html           # Opportunities board
│   └── events.html                  # Events listing & RSVP
├── public/
│   ├── css/
│   │   └── style.css                # Main stylesheet
│   ├── js/
│   │   └── main.js                  # Shared JavaScript logic
│   ├── images/
│   └── fonts/
├── app.js                           # Express server entry point
├── package.json                     # Project dependencies
├── .env.example                     # Environment variables template
├── API_DOCUMENTATION.md             # Complete API reference
└── README.md                        # This file
```

---

## 🚀 Getting Started

### Prerequisites
- **Node.js** v14 or higher
- **npm** or yarn
- **MongoDB** (local or MongoDB Atlas)
- **Git** for version control

### Installation

Step 1: Clone the repository
```bash
git clone https://github.com/yourrepo/alumniConnect.git
cd alumniConnect
```

Step 2: Install dependencies
```bash
npm install
```

Step 3: Configure environment variables
```bash
cp .env.example .env
```

Step 4: Edit `.env` file with your configuration
```env
PORT=3000
MONGO_URI=mongodb://localhost:27017/alumniConnect
JWT_SECRET=your_super_secret_jwt_key_change_in_production
NODE_ENV=development
```

Step 5: Start the server
```bash
# Development mode with auto-reload
npm run dev

# Production mode
npm start
```

Step 6: Open in browser
```
http://localhost:3000
```

---

## 📡 API Quick Reference

### Authentication Endpoints
```bash
POST   /users/register              # Create new account
POST   /users/login                 # Log in user
GET    /users/profile               # Get current profile (Protected)
PUT    /users/profile               # Update profile (Protected)
POST   /users/verify-request        # Request profile verification
```

### Alumni Directory
```bash
GET    /directory/search            # Search alumni with filters
GET    /directory/:id               # Get alumni profile
POST   /directory/:userId/connect   # Connect with alumni
POST   /directory/:userId/follow    # Follow alumni
DELETE /directory/:userId/unfollow  # Unfollow alumni
```

### Messaging
```bash
POST   /messages/send               # Send message (Protected)
GET    /messages/conversation/:userId  # Get conversation (Protected)
GET    /messages                    # Get all conversations (Protected)
GET    /messages/unread/count       # Get unread count (Protected)
```

### Mentorship
```bash
POST   /mentorship/request          # Request mentorship (Protected)
GET    /mentorship/matches          # Get mentor matches (Protected)
GET    /mentorship/my-mentorships   # Get my mentorships (Protected)
POST   /mentorship/:id/log-session  # Log mentorship session (Protected)
```

### Discussions
```bash
POST   /discussions/create          # Create discussion (Protected)
GET    /discussions                 # Get all discussions
GET    /discussions/:id             # Get single discussion
POST   /discussions/:id/like        # Like discussion (Protected)
POST   /comments/:discussionId      # Add comment (Protected)
GET    /comments/:discussionId      # Get comments
```

### Opportunities
```bash
GET    /opportunities               # Get all opportunities
POST   /opportunities/create        # Post opportunity (Protected)
POST   /opportunities/:id/apply     # Apply to opportunity (Protected)
POST   /opportunities/:id/save      # Save opportunity (Protected)
GET    /opportunities/saved         # Get saved opportunities (Protected)
```

### Events
```bash
GET    /events                      # Get all events
POST   /events/create               # Create event (Admin Protected)
POST   /events/:id/rsvp             # RSVP to event (Protected)
GET    /events/:id/attendees        # Get event attendees
```

### Notifications
```bash
GET    /notifications               # Get notifications (Protected)
POST   /notifications/:id/read      # Mark as read (Protected)
DELETE /notifications/:id           # Delete notification (Protected)
```

See [API_DOCUMENTATION.md](./API_DOCUMENTATION.md) for complete details.

---

## 🔐 Security Features

- ✅ JWT-based token authentication
- ✅ Password hashing with bcryptjs (12 salt rounds)
- ✅ Protected API endpoints with role-based access
- ✅ CORS enabled with security headers
- ✅ Protected routes for sensitive operations
- ⚠️ Additional security hardening in progress

---

## 👥 User Roles & Permissions

| Role | Permissions |
|------|------------|
| **Guest** | View landing page, register/login |
| **Student** | All community features, post opportunities |
| **Mentor** | Offer guidance, log sessions, manage connections |
| **Alumni** | Verified member, can mentor, create initiatives |
| **Admin** | Create events, manage content, assign roles |

---

## 📊 Data Models Overview

### User
- Authentication credentials
- Profile information (bio, cohort, skills, location)
- Career history
- Connections and followers
- Achievements and badges
- Mentorship preferences

### Mentorship
- Mentor-mentee pairing
- Goals and expertise areas
- Session logs with notes
- Progress tracking
- Ratings and feedback

### Discussion
- Topic/title and description
- Category (Careers, Mentorship, General, etc.)
- Comments with nested replies
- Likes and view tracking
- Pinning and closing capabilities

### Opportunity
- Type (Job, Internship, Scholarship, etc.)
- Company, location, salary details
- Required skills
- Application tracking
- Save/bookmark functionality

### Event
- Event details (date, time, location)
- RSVP management
- Attendee tracking
- Image and agenda
- Event type and tags

---

## 🎯 Implementation Status

### Completed ✅
- User registration & authentication
- Profile management with enhanced fields
- Alumni directory with advanced search
- Direct messaging system
- Mentorship matching & management
- Discussion forums with comments
- Opportunities board (jobs, internships, scholarships)
- Event creation and RSVP
- Notification system
- Achievements & badges
- Leadership role assignments
- Community initiatives

### In Progress 🔄
- Email notifications
- Advanced filtering & sorting
- Image uploads
- Real-time notifications WebSocket
- Mobile app version

### Planned 📋
- Video conferencing for mentorship
- AI-powered mentor matching
- Analytics dashboard
- Social media integration
- Mobile app (iOS/Android)

---

## 🧪 Testing

```bash
# Run tests (when available)
npm test

# Run with coverage
npm run test:coverage

# Run specific test
npm test -- tests/directory.test.js
```

---

## 📈 Performance Tips

- Database indexes on frequently queried fields
- Pagination for large datasets (20 items per page)
- JWT token caching on client
- Lazy loading for images
- CORS pre-flight optimization

---

## 🐛 Troubleshooting

### MongoDB Connection Issues
```bash
# Check if MongoDB is running
mongod

# Or use MongoDB Atlas connection string in .env
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/alumniConnect
```

### Port Already in Use
```bash
# Find process on port 3000
lsof -i :3000

# Kill process
kill -9 <PID>

# Or change PORT in .env
```

### JWT Errors
- Ensure `JWT_SECRET` is set in `.env`
- Check token hasn't expired
- Verify Authorization header format: `Bearer {token}`

### CORS Errors
- Ensure frontend API_BASE matches backend URL
- Check CORS is enabled in app.js
- Clear browser cache and cookies

---

## 📚 Documentation

- [API Documentation](./API_DOCUMENTATION.md) - Complete API reference
- [Environment Variables](#env-configuration) - Setup guide
- [Project Structure](#-project-structure) - File organization
- [Tech Stack](#-technology-stack) - Technologies used

---

## 🤝 Contributing

We welcome contributions! To contribute:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

Please ensure:
- Code follows the existing style
- Tests are added for new features
- README is updated if needed
- Commits have clear messages

---

## 📄 License

This project is licensed under the ISC License - see the LICENSE file for details.

---

## 🙌 Acknowledgments

- Built with ❤️ for the CodeQueen community
- Inspired by alumni partnership opportunities
- Designed for maximum community impact
- Special thanks to all contributors

---

## 📞 Support & Contact

- 📧 **Email:** support@alumniconnect.dev
- 💬 **Slack:** #alumni-platform
- 📖 **Wiki:** [Project Wiki](https://github.com/project/wiki)
- 🐛 **Issues:** [Report Bug](https://github.com/project/issues)

---

## 🎯 Vision

To build the world's most connected alumni community where:
- ✨ Mentorship transforms careers
- 🤝 Networking creates opportunities
- 💼 Skills and knowledge are shared freely
- 🏆 Everyone's achievements are celebrated
- 🌍 Community creates lasting impact

---

**Version:** 1.0.0  
**Last Updated:** May 2026  
**Status:** 🟢 Production Ready - Active Development

*Together, Stronger. Always.*

---

## 🚀 Deployment

### Heroku
```bash
heroku create my-alumni-app
git push heroku main
```

### Docker
```bash
docker build -t alumni-app .
docker run -p 3000:3000 alumni-app
```

---

## 📚 Learn More

- [Express.js Docs](https://expressjs.com/)
- [MongoDB Docs](https://docs.mongodb.com/)
- [JWT Auth](https://jwt.io/)
- [Mongoose ODM](https://mongoosejs.com/)

---

## 📄 License

This project is open source under the MIT License.
