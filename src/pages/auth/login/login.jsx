import { useAuth } from "../../../context/auth-context";
import { useNavigate } from "react-router-dom";
import Form from "../../../components/form/form";

const Login = () => {
  const navigate = useNavigate();
  const { loginUser, isLoading } = useAuth();

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
    loginUser(data);
  };

  return (
    <Form
      title="Welcome Back"
      fields={fields}
      onSubmit={handleSubmit}
      submitText={isLoading ? "Logging in..." : "Login"}
      haveAccount={true}
      onNavigate={() => navigate("/signup")}
      isRegistering={false}
    />
  );
};

export default Login;
