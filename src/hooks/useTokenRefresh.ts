// hooks/useTokenRefresh.ts
import { useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@store/index";
import { updateTokens, logout } from "@store/slices/authSlice";
import { useRefreshTokenMutation } from "@store/slices/users";
import { useNavigate } from "react-router-dom";

// Refresh token every 23 hours (before 24 hour expiry)
const REFRESH_INTERVAL = 23 * 60 * 60 * 1000; // 23 hours in milliseconds

export const useTokenRefresh = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const processedUserInfo = useSelector(
    (state: RootState) => state.auth.processedUserInfo
  );
  const [refreshTokenMutation] = useRefreshTokenMutation();
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const refreshToken = async () => {
    const refreshTokenValue =
      processedUserInfo?.refresh_token || localStorage.getItem("refresh_token");

    if (!refreshTokenValue) {
      console.warn("No refresh token available");
      return;
    }

    try {
      const result = await refreshTokenMutation({
        refresh_token: refreshTokenValue,
      }).unwrap();

      if (result.access_token) {
        dispatch(
          updateTokens({
            access_token: result.access_token,
            refresh_token: result.refresh_token || refreshTokenValue,
            expires_in: result.expires_in,
            refresh_expires_in: result.refresh_expires_in,
          })
        );
        console.log("Token refreshed successfully");
      }
    } catch (error: any) {
      console.error("Token refresh failed:", error);
      // If refresh fails, logout user
      dispatch(logout());
      navigate("/login");
    }
  };

  useEffect(() => {
    // Only set up refresh if user is logged in and has a refresh token
    const hasRefreshToken =
      processedUserInfo?.refresh_token || localStorage.getItem("refresh_token");

    if (!hasRefreshToken || !processedUserInfo?.token) {
      return;
    }

    // Set up interval to refresh token every 23 hours
    intervalRef.current = setInterval(() => {
      refreshToken();
    }, REFRESH_INTERVAL);

    // Cleanup on unmount
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [processedUserInfo?.refresh_token, processedUserInfo?.token]);

  return { refreshToken };
};

