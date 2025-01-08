import Navbar from "./pages/Navbar/Navbar"
import { I18nextProvider } from 'react-i18next';
import { BrowserRouter as Router } from 'react-router-dom';
import RouterPage from  './routes/Router'
import i18n from './utils/i18n';
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Footer from "./pages/Footer/Footer";

function App() {
  return (
    <I18nextProvider i18n={i18n}>
      <Router>
      <Navbar />
<div className="content">
          <RouterPage />
        </div>
        <Footer/>
      </Router>
       <ToastContainer />
      </I18nextProvider>
  )
}

export default App
