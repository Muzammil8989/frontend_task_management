import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter as Router } from "react-router-dom"; // Add this import
import AppRoutes from "./routes";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { AuthProvider } from "./context/auth-context";
import "bootstrap/dist/css/bootstrap.min.css";
import "./assets/styles/main.css";
import "animate.css";

const queryClient = new QueryClient();

const App = () => {
  return (
    <Router>
      {/* Wrap everything with Router */}
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <div className="app-container">
            <ToastContainer position="top-right" autoClose={3000} />
            <AppRoutes />
          </div>
        </AuthProvider>
      </QueryClientProvider>
    </Router>
  );
};

export default App;
