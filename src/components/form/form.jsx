import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { motion } from "framer-motion";
import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline";

const Form = ({
  title,
  fields,
  onSubmit,
  submitText,
  haveAccount,
  onNavigate,
}) => {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm();
  const [showPassword, setShowPassword] = useState({});

  const formVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  const PasswordStrength = ({ password }) => {
    const calculateStrength = (pass) => {
      let strength = 0;
      if (pass.length >= 8) strength++;
      if (pass.match(/[A-Z]/)) strength++;
      if (pass.match(/[0-9]/)) strength++;
      if (pass.match(/[^A-Za-z0-9]/)) strength++;
      return strength;
    };

    const strength = calculateStrength(password);
    const strengthText = ["Very Weak", "Weak", "Good", "Strong", "Very Strong"][
      strength
    ];
    const strengthColors = [
      "#dc3545",
      "#ffc107",
      "#0d6efd",
      "#198754",
      "#198754",
    ];

    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="mt-3"
      >
        <div className="progress" style={{ height: "5px" }}>
          <div
            className="progress-bar"
            role="progressbar"
            style={{
              width: `${(strength / 4) * 100}%`,
              backgroundColor: strengthColors[strength],
            }}
          />
        </div>
        <small
          className="d-block mt-1"
          style={{ color: strengthColors[strength] }}
        >
          Password Strength: {strengthText}
        </small>
      </motion.div>
    );
  };

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={formVariants}
      transition={{ duration: 0.3 }}
      className="container d-flex flex-column justify-content-center"
      style={{ minHeight: "100vh" }}
    >
      <div className="row justify-content-center">
        <div className="col-12">
          <div className="card shadow-lg border-0">
            <div className="card-body p-5">
              <h2 className="text-center mb-4 display-6 fw-bold">{title}</h2>
              <form onSubmit={handleSubmit(onSubmit)}>
                {fields.map((field) => (
                  <div key={field.name} className="mb-4">
                    <label
                      htmlFor={field.name}
                      className="form-label fw-medium"
                    >
                      {field.label}
                    </label>
                    <div className="position-relative">
                      <input
                        type={showPassword[field.name] ? "text" : field.type}
                        className={`form-control form-control-lg ${
                          errors[field.name] ? "is-invalid" : ""
                        }`}
                        id={field.name}
                        {...register(field.name, field.validation)}
                        disabled={isSubmitting}
                      />
                      {field.type === "password" && (
                        <button
                          type="button"
                          className="btn btn-link position-absolute end-0 top-50 translate-middle-y"
                          onClick={() =>
                            setShowPassword((prev) => ({
                              ...prev,
                              [field.name]: !prev[field.name],
                            }))
                          }
                          style={{ zIndex: 10 }}
                        >
                          {showPassword[field.name] ? (
                            <EyeSlashIcon
                              style={{
                                width: "20px",
                                height: "20px",
                                color: "#6c757d",
                              }}
                            />
                          ) : (
                            <EyeIcon
                              style={{
                                width: "20px",
                                height: "20px",
                                color: "#6c757d",
                              }}
                            />
                          )}
                        </button>
                      )}
                    </div>
                    {errors[field.name] && (
                      <div className="invalid-feedback">
                        {errors[field.name].message}
                      </div>
                    )}
                    {field.name === "password" && watch("password") && (
                      <PasswordStrength password={watch("password")} />
                    )}
                  </div>
                ))}

                <div className="d-grid gap-2 mt-4">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    className="btn btn-primary btn-lg"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <div className="d-flex align-items-center justify-content-center">
                        <span
                          className="spinner-border spinner-border-sm me-2"
                          role="status"
                          aria-hidden="true"
                        />
                        Processing...
                      </div>
                    ) : (
                      submitText
                    )}
                  </motion.button>
                </div>
              </form>

              {/* Switch form navigation */}
              <div className="text-center mt-4">
                <p className="mb-0">
                  {haveAccount
                    ? "Don't have an account?"
                    : "Already have an account?"}{" "}
                  <button className="btn btn-link p-0" onClick={onNavigate}>
                    {haveAccount ? "Sign Up" : "Sign In"}
                  </button>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default Form;
