import { useAuth } from "../../../context/auth-context";
import { useNavigate } from "react-router-dom";
import Form from "../../../components/form/form";

const SignUp = () => {
  const navigate = useNavigate();
  const { registerUser, isLoading } = useAuth();

  const fields = [
    {
      name: "name",
      label: "Full Name",
      type: "text",
      validation: {
        required: "Name is required",
      },
    },
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
        minLength: {
          value: 8,
          message: "Password must be at least 8 characters",
        },
      },
    },
  ];

  const handleSubmit = (data) => {
    registerUser(data);
  };

  return (
    <Form
      title="Create Account"
      fields={fields}
      onSubmit={handleSubmit}
      submitText={isLoading ? "Registering..." : "Register"}
      haveAccount={false}
      onNavigate={() => navigate("/login")}
      isRegistering={true}
    />
  );
};

export default SignUp;
