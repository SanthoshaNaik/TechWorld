# Tech-World

A premium, modern full-stack technology gadget article reading and publishing platform. Publishers can manage posts and reader accounts through a statistics-rich dashboard, while readers can sign up to view reviews, search/filter, and engage via likes, bookmarks, and comments.

---

#To Run the Project Locally
1. open the MaongoDB Comppas Connect the Database
    mongodb://localhost:27017
2. run this coomand in the CMD
   mongod --dbpath "C:\Users\Harshith N Naik\Desktop\TechWorld\backend\data\db" --port 27017
4. in cmd in backend folder
   npm run dev  (cd "C:\Users\Harshith N Naik\Desktop\TechWorld\backend")
5. in other cmd go to frontend
   "C:\Users\Harshith N Naik\Desktop\TechWorld\backend
       "C:\Users\Harshith N Naik\Desktop\TechWorld\backend login.html

## 📂 Project Structure

```
/TechWorld
│
├── /frontend                    # Client-side Static Files
│   ├── /css
│   │   └── index.css            # Responsive Dark/Light CSS design system
│   ├── /js
│   │   ├── config.js            # Environment API configuration helper
│   │   ├── auth.js              # Token and user session controller
│   │   ├── theme.js             # Local storage Dark/Light mode sync
│   │   ├── ui.js                # Shared Dynamic Header, Footer, and Toasts generator
│   │   ├── index.js             # Home page cards list and slider animations
│   │   ├── login.js             # User login validation and redirection
│   │   ├── register.js          # Account registration validation
│   │   ├── profile.js           # Edit profile and bookmarked posts lists
│   │   └── dashboard.js         # Publisher CRUD, stats, and text tagger
│   │
│   ├── /images                  # Image folder
│   ├── index.html               # Home Feed & Image Carousel
│   ├── login.html               # Authentication Login
│   ├── register.html            # Registration Signup
│   ├── profile.html             # User Profile Settings & Bookmarks
│   ├── post-detail.html         # Rich Article detail & Comments Section
│   └── dashboard.html           # Statistics Cards & Administrator Tables
│
└── /backend                     # Node.js Express server REST API
    ├── /config
    │   ├── db.js                # MongoDB Mongoose connector
    │   └── seed.js              # Automatic database seeding script
    ├── /controllers
    │   ├── authController.js    # Register, login, profile updates
    │   ├── postController.js    # Post CRUD, comments, likes, and bookmarks
    │   └── userController.js    # Readers listing and admin deletions
    ├── /models
    │   ├── User.js              # User DB Schema (bcrypt hashing, password compare)
    │   └── Post.js              # Gadget Post DB Schema (embedded Comments Schema)
    ├── /routes
    │   ├── authRoutes.js        # Auth routing maps
    │   ├── postRoutes.js        # Posts CRUD & interaction routing maps
    │   └── userRoutes.js        # Users list and administrative routing maps
    ├── /middleware
    │   ├── authMiddleware.js    # JWT authorization and role verification
    │   ├── uploadMiddleware.js  # Multer setup for gadget images upload
    │   └── errorMiddleware.js   # Global validation error formatter
    ├── /uploads                 # Created folder where uploaded images are saved
    ├── server.js                # Express app configuration & server startup
    ├── package.json             # NPM dependencies (express, mongoose, jwt, etc.)
    └── .env                     # Configuration keys
```

---

## ⚙️ Local Setup Instructions

### Prerequisites
- Make sure [Node.js](https://nodejs.org/) (v16 or higher) is installed.
- Make sure [MongoDB](https://www.mongodb.com/) is installed and running locally, or have a MongoDB Atlas connection URI ready.

### 1. Configure Environment Variables
Inside the `/backend` folder, create (or modify) a `.env` file:
```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/techworld
JWT_SECRET=supersecretkeytechworld12345
JWT_EXPIRE=30d
NODE_ENV=development
```

### 2. Install Dependencies
Open a terminal in the `/backend` directory and run:
```bash
npm install
```

### 3. Seed the Database
Populate the database with default publisher/user accounts and sample technology gadget articles by running:
```bash
npm run seed
```
**Default Seed Accounts created:**
* **Publisher Account (Dashboard Editor):**
  * Email: `santhoshnaik546@gmail.com`
  * Password: `Nsanthu@12`
* **Reader Account (User):**
  * Email: `user@techworld.com`
  * Password: `password123`

### 4. Run the Backend Server
Start the development server with hot-reloading (nodemon):
```bash
npm run dev
```
The server will boot on `http://localhost:5000`.

### 5. Launch the Frontend
You can open `frontend/login.html` directly in a browser (or use Live Server / simple HTTP server in the `frontend` folder).
* The frontend automatically switches to calling the local port `5000` when accessed via `localhost` or `127.0.0.1`.

---

## 🚀 Deployment Instructions

### Database: MongoDB Atlas
1. Create a free cluster on [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).
2. Create a database user and copy the connection string.
3. Replace the `MONGO_URI` connection string inside your production settings with this URI.

### Backend: Render
1. Create a Web Service on [Render](https://render.com/).
2. Connect your Git repository containing the `/backend` folder.
3. Configure the Root Directory to `backend` (if in a monorepo) or deploy directly.
4. Set the **Build Command** to: `npm install`
5. Set the **Start Command** to: `npm start`
6. Add the following **Environment Variables** in Render's dashboard:
   * `MONGO_URI` (your MongoDB Atlas URI)
   * `JWT_SECRET` (a strong random secret)
   * `JWT_EXPIRE` = `30d`
   * `NODE_ENV` = `production`

### Frontend: Vercel or Netlify
1. Create a project on [Vercel](https://vercel.com/) or [Netlify](https://www.netlify.com/).
2. Point the deployment directory to the `frontend/` folder.
3. Update `frontend/js/config.js` to change the production URL:
   * Replace `'https://techworld-backend.onrender.com/api'` with your deployed Render URL.
   * Replace `'https://techworld-backend.onrender.com'` with your Render base URL.
4. Deploy the site.

---

## 🔌 API Endpoints Documentation

### Authentication (`/api/auth`)
* `POST /api/auth/register` - Create user/publisher account.
* `POST /api/auth/login` - Authenticate user & return JWT token.
* `GET /api/auth/me` - [Protected] Retrieve profile details & bookmarks.
* `PUT /api/auth/profile` - [Protected] Edit username, email, image, or password.

### Posts (`/api/posts`)
* `GET /api/posts` - [Protected] List all gadget posts. Supports `?search=keyword` and `?author=userId`.
* `GET /api/posts/:id` - [Protected] Retrieve full post article, author details, comments, and likes.
* `POST /api/posts` - [Protected/Publisher] Create new article. Accepts multipart/form-data for image files.
* `PUT /api/posts/:id` - [Protected/Publisher] Update article content, metadata, or image file.
* `DELETE /api/posts/:id` - [Protected/Publisher] Remove article and its local image.
* `PUT /api/posts/:id/like` - [Protected] Toggle article like.
* `POST /api/posts/:id/comment` - [Protected] Add comment to article.
* `PUT /api/posts/:id/bookmark` - [Protected] Save/remove article from user bookmarks.

### User Management (`/api/users`)
* `GET /api/users` - [Protected/Publisher] List all registered user accounts.
* `DELETE /api/users/:id` - [Protected/Publisher] Remove user account.
