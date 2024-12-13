import Navbar from "./pages/Navbar/Navbar"
import { I18nextProvider } from 'react-i18next';
import { BrowserRouter as Router } from 'react-router-dom';
import RouterPage from  './routes/Router'
import i18n from './utils/i18n';
function App() {
  return (
    <I18nextProvider i18n={i18n}>
      <Router>
      <Navbar />
<div className="content">
          <RouterPage /> {/* Add Router here */}
        </div>
      </Router>
      </I18nextProvider>
  )
}

export default App
