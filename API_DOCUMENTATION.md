# Alumni Connect Platform — API Documentation

## Base URL
```
http://localhost:3000
```

## Authentication
All protected endpoints require a Bearer token in the Authorization header:
```
Authorization: Bearer {token}
```

---

## 📋 API Endpoints

### **Users & Authentication**
- `POST /users/register` - Register new user
- `POST /users/login` - Login user
- `GET /users/profile` - Get current user profile (Protected)
- `PUT /users/profile` - Update profile (Protected)
- `POST /users/verify-request` - Request profile verification (Protected)

### **Alumni Directory**
- `GET /directory/search?name={name}&cohort={cohort}&skill={skill}&location={location}` - Search alumni
- `GET /directory/{id}` - Get alumni profile
- `POST /directory/{userId}/connect` - Connect with alumni (Protected)
- `POST /directory/{userId}/follow` - Follow alumni (Protected)
- `DELETE /directory/{userId}/unfollow` - Unfollow alumni (Protected)

### **Direct Messaging**
- `POST /messages/send` - Send message (Protected)
- `GET /messages/conversation/{userId}` - Get conversation (Protected)
- `GET /messages` - Get all conversations (Protected)
- `GET /messages/unread/count` - Get unread count (Protected)

### **Mentorship**
- `POST /mentorship/request` - Request mentorship (Protected)
- `GET /mentorship/matches` - Get mentor matches (Protected)
- `GET /mentorship/my-mentorships` - Get my mentorships (Protected)
- `POST /mentorship/{mentorshipId}/log-session` - Log mentorship session (Protected)
- `POST /mentorship/{mentorshipId}/complete` - Complete mentorship (Protected)

### **Discussions**
- `POST /discussions/create` - Create discussion (Protected)
- `GET /discussions?category={category}&search={search}` - Get discussions
- `GET /discussions/{id}` - Get single discussion
- `POST /discussions/{id}/like` - Like discussion (Protected)
- `POST /discussions/{id}/pin` - Pin discussion (Admin only)
- `POST /discussions/{id}/close` - Close discussion (Protected)

### **Comments**
- `POST /comments/{discussionId}` - Add comment (Protected)
- `GET /comments/{discussionId}` - Get comments
- `POST /comments/{commentId}/like` - Like comment (Protected)
- `PUT /comments/{commentId}` - Edit comment (Protected)
- `DELETE /comments/{commentId}` - Delete comment (Protected)

### **Opportunities**
- `POST /opportunities/create` - Create opportunity (Protected)
- `GET /opportunities?type={type}&location={location}&skill={skill}` - Get opportunities
- `GET /opportunities/{id}` - Get single opportunity
- `POST /opportunities/{id}/apply` - Apply to opportunity (Protected)
- `POST /opportunities/{id}/save` - Save opportunity (Protected)
- `GET /opportunities/saved` - Get saved opportunities (Protected)
- `PATCH /opportunities/{id}/applicant/{applicantId}` - Update application status (Protected)

### **Events**
- `GET /events?type={type}&location={location}` - Get events
- `GET /events/{id}` - Get single event
- `POST /events/create` - Create event (Admin Protected)
- `POST /events/{eventId}/rsvp` - RSVP to event (Protected)
- `GET /events/{eventId}/attendees` - Get event attendees

### **Notifications**
- `GET /notifications` - Get notifications (Protected)
- `POST /notifications/{notificationId}/read` - Mark as read (Protected)
- `POST /notifications/read-all` - Mark all as read (Protected)
- `DELETE /notifications/{notificationId}` - Delete notification (Protected)

### **Achievements**
- `POST /achievements/{userId}/award` - Award achievement (Protected)
- `GET /achievements/user/{userId}` - Get user achievements
- `GET /achievements/leaderboard` - Get leaderboard

### **Leadership**
- `POST /leadership/role` - Assign leadership role (Admin Protected)
- `GET /leadership/team` - Get leadership team
- `POST /leadership/initiative/create` - Create initiative (Protected)
- `GET /leadership/initiatives` - Get initiatives
- `POST /leadership/initiative/{initiativeId}/join` - Join initiative (Protected)
- `POST /leadership/initiative/{initiativeId}/vote` - Vote on initiative (Protected)

---

## 🔒 Request/Response Format

### Register
```json
POST /users/register
{
  "name": "Jane Doe",
  "email": "jane@example.com",
  "password": "securePassword123",
  "confirmPassword": "securePassword123"
}

Response (200):
{
  "message": "Member created successfully",
  "result": { user object },
  "token": "jwt_token"
}
```

### Create Discussion
```json
POST /discussions/create
Headers: Authorization: Bearer {token}

{
  "title": "Best practices for career transitions",
  "description": "Let's share experiences...",
  "category": "Careers",
  "tags": ["career", "growth"]
}

Response (201):
{
  "message": "Discussion created",
  "data": { discussion object }
}
```

### Send Message
```json
POST /messages/send
Headers: Authorization: Bearer {token}

{
  "recipientId": "user_id",
  "content": "Hey, how are you?"
}

Response (201):
{
  "message": "Message sent",
  "data": { message object }
}
```

### RSVP Event
```json
POST /events/{eventId}/rsvp
Headers: Authorization: Bearer {token}

{
  "status": "going"  // Options: "going", "interested", "not_going"
}

Response (200):
{
  "message": "RSVP updated",
  "data": { event object }
}
```

---

## 🗂️ Frontend Pages

- `/` - Landing page
- `/login` - Login page
- `/signup` - Sign up page
- `/home` - Home/feed page
- `/directory` - Alumni directory
- `/messages` - Direct messaging
- `/mentorship` - Mentorship page
- `/discussions` - Discussions forum
- `/opportunities` - Opportunities board
- `/events` - Events listing

---

## ⚙️ Setup Instructions

### Prerequisites
- Node.js (v14+)
- MongoDB

### Installation
```bash
# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Start development server
npm run dev

# Start production server
npm start
```

### Environment Variables
```
PORT=3000
MONGO_URI=mongodb://localhost:27017/alumniConnect
JWT_SECRET=your_secret_key
NODE_ENV=development
```

---

## 📦 Project Structure

```
alumniConnect/
├── server/
│   ├── config/          # Database configuration
│   ├── controllers/     # Route controllers
│   ├── middleware/      # Auth & other middleware
│   ├── models/          # Mongoose schemas
│   └── routes/          # API endpoints
├── views/               # HTML pages
├── public/              # CSS, JS, images
├── app.js               # Main app file
├── package.json         # Dependencies
└── README.md           # This file
```

---

## 🔐 Authentication

- Uses JWT for token-based auth
- Tokens expire in 1 hour for login, 1 day for registration
- Passwords hashed with bcryptjs

---

## 🚀 Features Implemented

### Phase 1 (MVP - Community Connection)
✅ Alumni Directory with search
✅ Direct Messaging
✅ Mentorship Matching
✅ Discussions/Forums with comments

### Phase 2 (Opportunities & Events)
✅ Opportunities Board (jobs, internships, scholarships)
✅ Event RSVP & attendance tracking
✅ Notifications system (in-app)

### Phase 3 (Leadership & Recognition)
✅ Leadership roles management
✅ Achievements & badges system
✅ Profile verification system

### Phase 4 (Polish)
✅ Mobile-responsive design
⚠️ WCAG accessibility (in progress)
⚠️ Advanced security measures (in progress)

---

## 📝 Notes

- All dates are stored in ISO format
- Profile pictures use URLs
- Userverification required for certain features
- Admin role: Can create events, pin discussions
- Mentor role: Can log sessions, rate mentorships

---

Last Updated: May 2026
