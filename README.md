# Communications Dashboard

A modern React TypeScript application for managing customer communications data with MySQL database integration.

## Features

- **Customer Data Table** with the following columns:
  1. Customer Name (from `users.first_name` + `users.last_name`)
  2. Email (from `users.email`)
  3. Subject (from `order.subject`)
  4. Ticket Number (from `order.ticket_number`)
  5. Order Number (from `order.order_number`)
  6. Status (from `order.status`)
  7. Last Update Date (from `order.date_modified`)

- **Database Integration**: Connects to MySQL bountiplydb database
- **Real-time Filtering**: Filter communications by customer name, email, order number, status, and date
- **Status Management**: Visual status badges for Pending, In Progress, Completed, and Cancelled communications
- **Error Handling**: Graceful fallback to mock data when database is unavailable
- **Modern React with TypeScript**: Built with Create React App and TypeScript for type safety
- **Responsive Design**: Mobile-friendly interface that works on all devices

## Getting Started

### Prerequisites

- Node.js (version 14 or higher)
- npm or yarn
- MySQL database server (for production usage)

### Database Setup

The application is configured to connect to a MySQL database with the following specifications:

**Database Configuration:**
- Host: localhost:3306
- Database: bountiplydb
- Username: root
- Password: 

**Required Database Schema:**

```sql
-- Users table
CREATE TABLE users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  first_name VARCHAR(255),
  last_name VARCHAR(255),
  email VARCHAR(255)
);

-- Order table
CREATE TABLE `order` (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT,
  subject VARCHAR(255),
  ticket_number VARCHAR(255),
  order_number VARCHAR(255),
  status VARCHAR(50),
  date_modified DATETIME,
  FOREIGN KEY (user_id) REFERENCES users(id)
);
```

**Note:** If the database is not available, the application will gracefully fall back to mock data for demonstration purposes.

### Installation

1. Clone the repository or extract the project files
2. Navigate to the project directory:
   ```bash
   cd communications-dashboard
   ```

3. Install frontend dependencies:
   ```bash
   npm install
   ```

4. Install backend dependencies:
   ```bash
   cd backend
   npm install
   cd ..
   ```

### Development

#### Backend Server (Optional - for database integration)

1. Start the backend server:
   ```bash
   cd backend
   npm start
   # or for development with auto-reload:
   npm run dev
   ```

The backend API will be available at `http://localhost:3001`.

**API Endpoints:**
- `GET /api/communications` - Fetch communications data
- `GET /api/health` - Health check
- `GET /api/test-db` - Test database connection

#### Frontend Application

1. In a new terminal, start the frontend development server:
   ```bash
   npm start
   ```

The application will open in your browser at `http://localhost:3000`.

**Note:** The frontend will work with mock data even if the backend is not running.

### Building for Production

Create a production build:
```bash
npm run build
```

The build folder will contain the optimized files ready for deployment.

### Preview Production Build

To preview the production build locally:
```bash
npm run deploy
```

This will build the project and serve it locally using `serve`.

## Deployment

This app can be deployed to any static hosting service:

### Netlify
1. Build the project: `npm run build`
2. Drag and drop the `build` folder to Netlify

### Vercel
1. Connect your repository to Vercel
2. Set build command to `npm run build`
3. Set output directory to `build`

### GitHub Pages
1. Install gh-pages: `npm install --save-dev gh-pages`
2. Add to package.json: `"homepage": "https://yourusername.github.io/communications-dashboard"`
3. Add deploy script: `"gh-pages": "gh-pages -d build"`
4. Run: `npm run build && npm run gh-pages`

### Other Static Hosts
The `build` folder can be uploaded to any static hosting service like:
- AWS S3 + CloudFront
- Firebase Hosting
- Surge.sh
- Heroku (with buildpack)

## Project Structure

```
src/
├── components/          # React components
│   ├── Header.tsx       # Top navigation with user info
│   ├── Sidebar.tsx      # Filter sidebar
│   ├── DataTable.tsx    # Communications table
│   ├── StatusBadge.tsx  # Status indicator component
│   └── Layout.tsx       # Main layout component
├── data/                # Mock data
├── types/               # TypeScript type definitions
├── utils/               # Utility functions
└── styles/              # Additional styles
```

## Available Scripts

- `npm start` - Runs the app in development mode
- `npm test` - Launches the test runner
- `npm run build` - Builds the app for production
- `npm run preview` - Serves the production build locally
- `npm run deploy` - Builds and previews the production version

## Technologies Used

- React 19
- TypeScript
- CSS3 with modern layout techniques
- Create React App for tooling

## License

This project is licensed under the MIT License.