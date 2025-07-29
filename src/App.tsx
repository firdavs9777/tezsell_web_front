import Footer from "@pages/Footer/Footer";
import Navbar from "@pages/Navbar/Navbar";
import RouterPage from "@routes/Router";
import { Chat, useGetAllChatMessagesQuery } from "@store/slices/chatSlice";
import i18n from "@utils/i18n";
import { useEffect, useState } from "react";
import { I18nextProvider } from "react-i18next";
import { useSelector } from "react-redux";
import { BrowserRouter as Router } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { RootState } from "./store";

function App() {
    const [chats, setChats] = useState<Chat[]>([]);
  const userInfo = useSelector((state: RootState) => state.auth.userInfo);
  const token = userInfo?.token;

  // Fetch chats at the app level so both Navbar and MainChat can use them
  const { data, isLoading, error, refetch } = useGetAllChatMessagesQuery(
    { token },
    {
      skip: !token, // Only fetch if user is logged in
      refetchOnMountOrArgChange: true,
      pollingInterval: 30000, // Poll every 30 seconds for live updates
    }
  );

  // Update chats when data changes
  useEffect(() => {
    if (data?.results) {
      setChats(data.results as Chat[]);
    }
  }, [data]);


  return (
    <I18nextProvider i18n={i18n}>
      <div className="page-container">
        <Router>
       <Navbar chats={chats} />
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
