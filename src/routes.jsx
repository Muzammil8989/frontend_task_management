import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./pages/auth/login/login";
import Signup from "./pages/auth/signup/signup";
import Navbar from "./components/navbar";
import ProtectedRoute from "./components/protected-route";
import TaskList from "./pages/task/task";

const AppRoutes = () => (
  <>
    {" "}
    <Navbar />
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route
        path="/task"
        element={
          <ProtectedRoute>
            <TaskList />
          </ProtectedRoute>
        }
      />
    </Routes>
  </>
);

export default AppRoutes;
