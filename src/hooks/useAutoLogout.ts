// hooks/useAutoLogout.ts
import { useEffect, useCallback, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { RootState } from "@store/index";
import { logout } from "@store/slices/authSlice";
import { useLogoutUserMutation } from "@store/slices/users";

const AUTO_LOGOUT_TIME = 2 * 60 * 60 * 1000; // 2 hours in milliseconds
const WARNING_TIME = 5 * 60 * 1000; // 5 minutes before logout
const STORAGE_KEY = "lastActivity";

export const useAutoLogout = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const userInfo = useSelector((state: RootState) => state.auth.userInfo);
  const [logoutApiCall] = useLogoutUserMutation();

  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const warningTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const clearAllStorage = useCallback(() => {
    // Clear localStorage
    localStorage.clear();

    // Clear sessionStorage
    sessionStorage.clear();

    // Clear any IndexedDB if you're using it
    if ("indexedDB" in window) {
      indexedDB.databases().then((databases) => {
        databases.forEach((db) => {
          if (db.name) {
            indexedDB.deleteDatabase(db.name);
          }
        });
      });
    }

    // Clear cookies (optional - be careful with this)
    document.cookie.split(";").forEach((cookie) => {
      const eqPos = cookie.indexOf("=");
      const name = eqPos > -1 ? cookie.substr(0, eqPos) : cookie;
      document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/";
    });
  }, []);

  const performLogout = useCallback(
    async (showMessage = true) => {
      try {
        if (userInfo?.token) {
          await logoutApiCall(userInfo.token).unwrap();
        }
      } catch (error) {
        console.error("Logout API call failed:", error);
      } finally {
        dispatch(logout(userInfo));
        clearAllStorage();
        navigate("/login");

        if (showMessage) {
          toast.info(
            "Session expired. You have been logged out for security.",
            {
              autoClose: 3000,
            }
          );
        }
      }
    },
    [userInfo, logoutApiCall, dispatch, navigate, clearAllStorage]
  );

  const showWarning = useCallback(() => {
    toast.warning(
      "Your session will expire in 5 minutes. Please save your work.",
      {
        autoClose: 5000,
        toastId: "session-warning", // Prevent duplicate warnings
      }
    );
  }, []);

  const resetTimer = useCallback(() => {
    if (!userInfo?.token) return;

    // Clear existing timeouts
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    if (warningTimeoutRef.current) {
      clearTimeout(warningTimeoutRef.current);
    }

    // Update last activity timestamp
    localStorage.setItem(STORAGE_KEY, Date.now().toString());

    // Set warning timeout (5 minutes before logout)
    warningTimeoutRef.current = setTimeout(
      showWarning,
      AUTO_LOGOUT_TIME - WARNING_TIME
    );

    // Set logout timeout
    timeoutRef.current = setTimeout(() => performLogout(), AUTO_LOGOUT_TIME);
  }, [userInfo?.token, showWarning, performLogout]);

  const checkExistingSession = useCallback(() => {
    if (!userInfo?.token) return;

    const lastActivity = localStorage.getItem(STORAGE_KEY);
    if (lastActivity) {
      const timeSinceLastActivity = Date.now() - parseInt(lastActivity);

      if (timeSinceLastActivity >= AUTO_LOGOUT_TIME) {
        // Session has already expired
        performLogout(false);
        return;
      }

      // Calculate remaining time
      const remainingTime = AUTO_LOGOUT_TIME - timeSinceLastActivity;
      const warningTime = Math.max(0, remainingTime - WARNING_TIME);

      // Set appropriate timeouts for remaining time
      if (warningTime > 0) {
        warningTimeoutRef.current = setTimeout(showWarning, warningTime);
      } else {
        // Already in warning period
        showWarning();
      }

      timeoutRef.current = setTimeout(() => performLogout(), remainingTime);
    } else {
      // No previous activity recorded, start fresh
      resetTimer();
    }
  }, [userInfo?.token, performLogout, showWarning, resetTimer]);

  const handleActivity = useCallback(() => {
    if (userInfo?.token) {
      resetTimer();
    }
  }, [userInfo?.token, resetTimer]);

  useEffect(() => {
    if (!userInfo?.token) {
      // User is not logged in, clear any existing timers
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
      if (warningTimeoutRef.current) {
        clearTimeout(warningTimeoutRef.current);
        warningTimeoutRef.current = null;
      }
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    // Check existing session on mount
    checkExistingSession();

    // Activity events to track
    const events = [
      "mousedown",
      "mousemove",
      "keypress",
      "scroll",
      "touchstart",
      "click",
    ];

    // Add event listeners
    events.forEach((event) => {
      document.addEventListener(event, handleActivity, true);
    });

    // Periodic check for cross-tab synchronization
    intervalRef.current = setInterval(() => {
      const lastActivity = localStorage.getItem(STORAGE_KEY);
      if (lastActivity) {
        const timeSinceLastActivity = Date.now() - parseInt(lastActivity);
        if (timeSinceLastActivity >= AUTO_LOGOUT_TIME) {
          performLogout(false);
        }
      }
    }, 30000); // Check every 30 seconds

    // Cleanup function
    return () => {
      events.forEach((event) => {
        document.removeEventListener(event, handleActivity, true);
      });

      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      if (warningTimeoutRef.current) {
        clearTimeout(warningTimeoutRef.current);
      }
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [userInfo?.token, handleActivity, checkExistingSession, performLogout]);

  // Handle browser tab visibility change
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden && userInfo?.token) {
        checkExistingSession();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [userInfo?.token, checkExistingSession]);

  return {
    resetTimer,
    performLogout: () => performLogout(true),
    clearAllStorage,
  };
};
