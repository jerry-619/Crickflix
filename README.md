# 🏏 Crickflix Frontend

Crickflix – Your Ultimate Destination for Live Cricket Streaming! This is the frontend application of the Crickflix platform, providing a modern and intuitive user interface for watching live cricket matches, browsing categories, reading blogs, and more.

## 📋 Description

Crickflix Frontend is built with React and Vite, offering a fast and responsive user interface. It features a modern design with Chakra UI components, dark/light mode support, and a seamless streaming experience for cricket enthusiasts.

## 🚀 Setup

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn
- Crickflix Backend API running

### Installation

1. Clone the repository
```bash
git clone https://github.com/yourusername/crickflix-frontend.git
cd crickflix-frontend
```

2. Install dependencies
```bash
npm install
```

3. Set up environment variables
```bash
cp .env.example .env
```
Edit the `.env` file with your configuration:
```env
VITE_APP_NAME=Crickflix
VITE_API_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
VITE_ADMIN_URL=http://localhost:5001
VITE_STORAGE_URL=http://localhost:5000/uploads
VITE_DEFAULT_THEME=dark
VITE_GA_TRACKING_ID=your_ga_tracking_id
```

4. Start the development server
```bash
# Development mode
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## 🎯 Features

### User Interface
- Responsive design for all devices
- Dark/Light mode support
- Modern and intuitive navigation
- Loading states and error handling
- Smooth animations and transitions

### Match Streaming
- HD quality live match streaming
- Match details and statistics
- View count tracking
- Stream quality selection
- Full-screen mode support

### Categories
- Browse matches by categories
- Category-wise match listing
- Easy navigation between categories
- Category thumbnails and descriptions

### Blogs
- Latest cricket news and updates
- Rich text content with images
- Share functionality
- Comment system (coming soon)

### User Features
- User authentication
- Favorite matches (coming soon)
- Watch history (coming soon)
- Personalized recommendations (coming soon)

## 🏗️ Project Structure

```
crickflix-frontend/
├── public/              # Static files
├── src/
│   ├── assets/         # Images, fonts, etc.
│   ├── components/     # Reusable components
│   ├── contexts/       # React contexts
│   ├── hooks/          # Custom hooks
│   ├── layouts/        # Page layouts
│   ├── pages/          # Page components
│   ├── services/       # API services
│   ├── styles/         # Global styles
│   ├── utils/          # Utility functions
│   ├── App.jsx         # Root component
│   └── main.jsx        # Entry point
├── .env.example        # Environment variables example
├── index.html          # HTML template
├── package.json        # Dependencies and scripts
└── vite.config.js      # Vite configuration
```

## 🛠️ Built With

- React.js
- Vite
- Chakra UI
- React Router DOM
- Axios
- Socket.io Client
- React Icons
- React Player
- React Query
- Framer Motion

## 📱 Responsive Design

The application is fully responsive and tested on:
- Desktop (1920px and above)
- Laptop (1024px to 1919px)
- Tablet (768px to 1023px)
- Mobile (320px to 767px)

## 🔒 Security Features

- JWT token management
- Protected routes
- XSS protection
- Secure API calls
- Environment variable protection
- Input validation
- Error boundaries

## 🎨 Theme Customization

The application uses Chakra UI for theming with:
- Custom color schemes
- Dark/Light mode
- Consistent spacing
- Typography system
- Component variants

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## ✍️ Author

**Fardeen Beigh**
- Email: itxjerry.com@gmail.com
- Telegram: [@btw_69](https://t.me/btw_69)

## 🤝 Contributing

Contributions, issues, and feature requests are welcome! Feel free to check [issues page](https://github.com/jerry-619/crickflix-frontend/issues).

## 📬 Contact

For any queries or support, please contact:
- Email: itxjerry.com@gmail.com
- Telegram: [@btw_69](https://t.me/btw_69)

## 🌟 Show your support

Give a ⭐️ if this project helped you!
