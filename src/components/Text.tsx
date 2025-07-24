import "@components/Text.css";
import React from "react";

interface TextProps {
  children: React.ReactNode;
  variant?: "title" | "subtitle" | "body" | "caption";
}

const Text: React.FC<TextProps> = ({ children, variant = "body" }) => {
  return <p className={`text ${variant}`}>{children}</p>;
};

export default Text;
