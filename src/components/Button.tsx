import "@components/Button.css";
import React from "react";
interface ButtonProps {
  label: string;
  onClick?: () => void;
  type?: "button" | "submit" | "reset";
  variant?: "edit" | "see-more" | "add" | "upload" | "close" | "custom-upload";
  disabled?: boolean;
}

const Button: React.FC<ButtonProps> = ({
  label,
  onClick,
  type = "button",
  variant = "upload", // Default style
  disabled = false,
}) => {
  return (
    <button
      className={`btn ${variant}-btn`}
      onClick={onClick}
      type={type}
      disabled={disabled}
    >
      {label}
    </button>
  );
};

export default Button;
