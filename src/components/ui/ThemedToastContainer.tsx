import { ToastContainer } from "react-toastify";
import { useTheme } from "../../theme/ThemeProvider";

export default function ThemedToastContainer() {
  const { theme } = useTheme();
  return (
    <ToastContainer
      position="top-right"
      theme={theme}
      toastClassName="!rounded-xl !font-sans"
    />
  );
}
