import React from "react";
import Form from "../../../components/form/form";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const navigate = useNavigate();

  const fields = [
    {
      name: "email",
      label: "Email Address",
      type: "email",
      validation: {
        required: "Email is required",
        pattern: {
          value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
          message: "Invalid email address",
        },
      },
    },
    {
      name: "password",
      label: "Password",
      type: "password",
      validation: {
        required: "Password is required",
      },
    },
  ];

  const handleSubmit = (data) => {
    console.log(data);
    // Add your login logic here
    navigate("/dashboard");
  };

  return (
    <Form
      title="Welcome Back"
      fields={fields}
      onSubmit={handleSubmit}
      submitText="Login"
      haveAccount={false}
      onNavigate={() => navigate("/signup")}
    />
  );
};

export default Login;
