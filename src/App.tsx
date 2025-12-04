import Footer from "@pages/Footer/Footer";
import ErrorBoundary from "@pages/Navbar/ErrorBoundary";
import Navbar from "@pages/Navbar/Navbar";
import RouterPage from "@routes/Router";
// import { Chat, useGetAllChatMessagesQuery } from "@store/slices/chatSlice";
import i18n from "@utils/i18n";
// import { useEffect, useState } from "react";
import { I18nextProvider } from "react-i18next";
// import { useSelector } from "react-redux";
import { BrowserRouter as Router } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
// import { RootState } from "./store";
import { useTokenRefresh } from "@hooks/useTokenRefresh";

// Component to handle token refresh inside Router context
const TokenRefreshProvider = () => {
  useTokenRefresh();
  return null;
};

function App() {
  // const [chats, setChats] = useState<Chat[]>([]);
  // const [globalUnreadCount, setGlobalUnreadCount] = useState(0);
  // const userInfo = useSelector((state: RootState) => state.auth.userInfo);

  // // Existing RTK Query
  // const { data, refetch } = useGetAllChatMessagesQuery(
  //   { token: userInfo?.token || "" },
  //   {
  //     skip: !userInfo?.token,
  //     refetchOnMountOrArgChange: true,
  //     pollingInterval: 10000,
  //   }
  // );

  // // Simple WebSocket for live notifications
  // useEffect(() => {
  //   if (!userInfo?.token) return;

  //   const ws = new WebSocket(`wss://api.webtezsell.com/ws/notifications/`);

  //   ws.onopen = () => {
  //     ws.send(
  //       JSON.stringify({
  //         type: "authenticate",
  //         token: userInfo.token,
  //       })
  //     );
  //   };

  //   ws.onmessage = (event) => {
  //     const data = JSON.parse(event.data);

  //     if (data.type === "unread_count_update") {
  //       setGlobalUnreadCount(data.total_unread);
  //     } else if (data.type === "new_message") {
  //       // Increment unread count
  //       setGlobalUnreadCount((prev) => prev + 1);
  //       // Also refresh the full chat list
  //       refetch();
  //     }
  //   };

  //   return () => ws.close();
  // }, [userInfo?.token, refetch]);

  // // Update chats when data changes
  // useEffect(() => {
  //   if (data?.results) {
  //     setChats(data.results as Chat[]);
  //     // Update global count from fresh data
  //     const totalUnread = (data.results as Chat[]).reduce(
  //       (total, chat) => total + chat.unread_count,
  //       0
  //     );
  //     setGlobalUnreadCount(totalUnread);
  //   }
  // }, [data]);

  return (
    <ErrorBoundary>
      <I18nextProvider i18n={i18n}>
        <div className="page-container">
          <Router>
            {/* Set up automatic token refresh inside Router context */}
            <TokenRefreshProvider />
            {/* Pass both chats and live unread count */}
            <Navbar  />
            <div className="content">
              <RouterPage />
            </div>
            <Footer />
          </Router>
          <ToastContainer />
        </div>
      </I18nextProvider>
    </ErrorBoundary>
  );
}

export default App;
