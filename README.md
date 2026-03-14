# AI Personality Replicator

An intelligent application that replicates and analyzes personality traits using AI technology.

## 📁 Project Architecture

```
ai-personality-replicator/
│
├── backend/                    # Node.js/Express Backend
│   ├── config/
│   │   └── db.js              # MongoDB connection configuration
│   ├── node_modules/          # Dependencies
│   ├── .env                   # Environment variables
│   ├── .gitignore             # Git ignore rules
│   ├── index.js               # Alternative server entry point
│   ├── server.js              # Main server entry point
│   ├── package.json           # Backend dependencies
│   └── package-lock.json      # Locked dependency versions
│
├── frontend/                   # React/Vue Frontend (To be created)
│   ├── public/
│   ├── src/
│   ├── package.json
│   └── README.md
│
├── models/                     # Database Models & Schemas
│   ├── User.js               # User model
│   ├── Personality.js        # Personality traits model
│   └── Analysis.js           # Analysis results model
│
├── routes/                     # API Routes
│   ├── users.js              # User endpoints
│   ├── personality.js        # Personality endpoints
│   └── analysis.js           # Analysis endpoints
│
├── config/                     # Configuration Files
│   ├── db.js                 # Database configuration
│   ├── env.example           # Environment template
│   └── constants.js          # App constants
│
├── .env                        # Environment Variables (Root)
└── README.md                   # Project Documentation
```

## 🚀 Quick Start

### Prerequisites
- Node.js (v14+)
- MongoDB Atlas account
- npm or yarn

### Backend Setup

1. **Navigate to backend folder:**
   ```bash
   cd ai-personality-replicator/backend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure environment variables:**
   ```
   PORT=5001
   NODE_ENV=development
   MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/?appName=Cluster0
   ```

4. **Start the server:**
   ```bash
   npm start
   ```

Server will run on `http://localhost:5001`

## 📦 Backend Dependencies

```json
{
  "express": "^4.19.2",        // Web framework
  "mongoose": "^9.3.0",        // MongoDB ODM
  "cors": "^2.8.5",            // CORS middleware
  "dotenv": "^16.6.1"          // Environment variables
}
```

### Dev Dependencies
```json
{
  "nodemon": "^3.1.4"          // Auto-reload on file changes
}
```

## 🔌 API Endpoints

### Base URL: `http://localhost:5001`

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | Server health check |
| GET | `/api/users` | Get all users (to be implemented) |
| POST | `/api/users` | Create new user (to be implemented) |
| GET | `/api/personality/:id` | Get personality analysis (to be implemented) |
| POST | `/api/personality` | Create personality analysis (to be implemented) |

## 🗄️ Database Structure

### MongoDB Collections

#### Users
```javascript
{
  _id: ObjectId,
  name: String,
  email: String,
  createdAt: Date,
  updatedAt: Date
}
```

#### Personalities
```javascript
{
  _id: ObjectId,
  userId: ObjectId,
  traits: {
    openness: Number,
    conscientiousness: Number,
    extraversion: Number,
    agreeableness: Number,
    neuroticism: Number
  },
  analysisDate: Date
}
```

#### Analyses
```javascript
{
  _id: ObjectId,
  userId: ObjectId,
  personalityId: ObjectId,
  results: Object,
  confidence: Number,
  timestamp: Date
}
```

## 🔧 Configuration

### Environment Variables
Create a `.env` file in the backend folder:

```env
# Server Configuration
PORT=5001
NODE_ENV=development

# Database Configuration
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/?appName=Cluster0

# API Configuration (to be added)
# JWT_SECRET=your_jwt_secret
# API_KEY=your_api_key
```

## 📝 Available Scripts

### Backend Scripts
```bash
npm start          # Run server (node server.js)
npm run dev        # Run with nodemon (auto-reload)
npm test           # Run tests (to be configured)
```

## 🏗️ Project Structure Details

### Backend (`/backend`)
- **Entry Point**: `server.js`
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose
- **CORS**: Enabled for frontend integration

### Frontend (`/frontend`)
- **Status**: To be created
- **Recommended**: React or Vue.js
- **Build Tool**: Vite or Create React App

### Models (`/models`)
- Contains Mongoose schemas
- Defines data structure for users, personalities, and analyses

### Routes (`/routes`)
- API endpoint handlers
- Business logic separation
- RESTful API design

### Config (`/config`)
- Environment management
- Database connection
- Application constants

## 🔐 Security Notes

- ⚠️ Never commit `.env` file with sensitive data
- Credentials are included in `.gitignore`
- Use environment variables for sensitive information
- Whitelist IP addresses in MongoDB Atlas Network Access

## 🌐 CORS Configuration

Currently enabled for all origins. Update in production:

```javascript
app.use(cors({
  origin: process.env.FRONTEND_URL,
  credentials: true
}));
```

## 🤝 Next Steps

1. **Create database models** in `/models`
2. **Setup API routes** in `/routes`
3. **Create middleware** for authentication
4. **Build frontend** in `/frontend`
5. **Add tests** for backend APIs
6. **Deploy** to production

## 📞 Support

For issues or help:
- Check environment variables are set correctly
- Ensure MongoDB is accessible
- Verify IP is whitelisted in MongoDB Atlas
- Check Node.js and npm versions

## 📄 License

ISC

---

**Author**: Piyush
**Created**: 2024
**Status**: In Development
