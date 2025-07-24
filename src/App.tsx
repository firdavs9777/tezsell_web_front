import Footer from "@pages/Footer/Footer";
import Navbar from "@pages/Navbar/Navbar";
import RouterPage from "@routes/Router";
import i18n from "@utils/i18n";
import { I18nextProvider } from "react-i18next";
import { BrowserRouter as Router } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function App() {
  return (
    <I18nextProvider i18n={i18n}>
      <div className="page-container">
        <Router>
          <Navbar />
          <div className="content">
            <RouterPage />
          </div>
          <Footer />
        </Router>
        <ToastContainer />
      </div>
    </I18nextProvider>
  );
}

export default App;
