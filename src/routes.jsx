import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./pages/auth/login/login";
import Signup from "./pages/auth/signup/signup";
import Navbar from "./components/navbar";
import ProtectedRoute from "./components/protected-route";

const AppRoutes = () => (
  <Routes>
    <Route path="/" element={<Login />} />
    <Route path="/login" element={<Login />} />
    <Route path="/signup" element={<Signup />} />
    <Route
      path="/profile"
      element={
        <ProtectedRoute>
          <Navbar />
        </ProtectedRoute>
      }
    />
  </Routes>
);

export default AppRoutes;
