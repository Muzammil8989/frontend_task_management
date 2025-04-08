# Task Management React Vite Project

This is a task management application built with **React** and **Vite**. It allows users to sign up, log in, create, view, update, and delete tasks, while also providing a protected route for managing tasks.

## Features

- **Authentication**: Users can register, log in, and log out.
- **Task Management**: Users can create, view, update, and delete tasks.
- **Protected Routes**: Task pages are protected and require users to be logged in.
- **Toast Notifications**: Provides real-time feedback using `react-toastify`.

## Technologies Used

- **React**: JavaScript library for building user interfaces.
- **Vite**: Fast build tool and development server for React.
- **React Router**: For client-side routing.
- **React Query**: For data fetching and caching.
- **React Toastify**: For toast notifications.
- **Axios**: For making HTTP requests.
- **Bootstrap**: For responsive UI components.
- **Animate.css**: For animations.
- **Context API**: For managing authentication state globally.

## Project Structure
```
└── 📁frontend_task_management
    └── 📁public
        └── _redirects
        └── favicon.png
    └── 📁src
        └── App.jsx
        └── 📁assets
            └── 📁styles
                └── main.css
        └── 📁components
            └── 📁form
                └── form.jsx
            └── navbar.jsx
            └── protected-route.jsx
        └── 📁context
            └── auth-context.jsx
        └── main.jsx
        └── 📁pages
            └── 📁auth
                └── 📁login
                    └── login.jsx
                └── 📁signup
                    └── signup.jsx
            └── 📁task
                └── task.css
                └── task.jsx
        └── routes.jsx
        └── 📁services
            └── auth-service.jsx
            └── task-service.jsx
    └── .env
    └── .gitignore
    └── eslint.config.js
    └── index.html
    └── package-lock.json
    └── package.json
    └── README.md
    └── vite.config.js
```

## Setup & Installation

### Prerequisites

Before getting started, ensure you have the following installed:

- [Node.js](https://nodejs.org/) (v14 or later)
- [npm](https://npmjs.com/) or [yarn](https://yarnpkg.com/) for managing packages

### 1. Clone the Repository

```bash
git clone https://github.com/Muzammil8989/frontend_task_management.git
cd frontend_task_management
npm install
# or
yarn install
```

### 2.  Environment Configuration (Backend)
VITE_BASE_URL=http://your-api-url.com

### 3.  Run the Development Server

```bash
npm run dev
# or
yarn dev
```


