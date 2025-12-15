import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { User } from "@store/type";

// Keep your existing UserType interface
export interface UserType {
  _id: string;
  name: string;
  email: string;
  password: string;
  isAdmin?: boolean;
  __v?: number;
  createdAt?: string;
  updatedAt?: string;
  matchPassword?: (arg1: string) => Promise<boolean>;
  save: () => Promise<UserType>;
}

// Enhanced interfaces for the new API response
export interface UserLocation {
  id: number | null;
  country: string | null;
  region: string | null;
  district: string | null;
}

export interface ProfileImage {
  url: string;
  alt_text: string;
}

export interface AgentInfo {
  id: number;
  agency_name: string;
  licence_number: string;
  is_verified: boolean;
  rating: string;
  total_sales: number;
  years_experience: number;
  specialization: string;
  created_at: string;
}

export interface UserPermissions {
  is_agent: boolean;
  is_verified_agent: boolean;
  is_staff: boolean;
  is_superuser: boolean;
  can_create_properties: boolean;
  can_manage_inquiries: boolean;
  can_access_admin: boolean;
  can_verify_agents: boolean;
  can_manage_users: boolean;
  user_role?: string;
  last_updated?: string; // Track when permissions were last updated
}

export interface EnhancedUser {
  id: number;
  username: string;
  email: string;
  phone_number: string | null;
  user_type: "regular" | "business";
  is_active: boolean;
  is_staff: boolean;
  is_superuser: boolean;
  created_at: string;
  updated_at: string;
  last_login: string | null;
  location: UserLocation;
  user_image: string | null;
  profile_image: ProfileImage | null;
}

// Enhanced AuthResponse that supports both old and new formats
export interface AuthResponse {
  // Common fields
  message?: string;
  token?: string; // Backward compatible - same as access_token

  // Token fields (new two-token system)
  access_token?: string;
  refresh_token?: string;
  token_type?: string;
  expires_in?: number; // 24 hours in seconds (86400)
  refresh_expires_in?: number; // 30 days in seconds (2592000)

  // Old format (for backward compatibility)
  user?: UserType;
  user_info?: User;

  // New enhanced format
  success?: boolean;
  agent_info?: AgentInfo | null;
  permissions?: UserPermissions;
  user_role?: string;
}

// Permission validation state
export interface PermissionValidation {
  isValidating: boolean;
  lastValidated: string | null;
  validationErrors: Record<string, string>;
}

// Enhanced AuthState that includes processed data
export interface AuthState {
  userInfo: AuthResponse | null;
  // Processed/normalized data for easy access
  processedUserInfo: {
    token: string;
    access_token?: string;
    refresh_token?: string;
    expires_in?: number;
    refresh_expires_in?: number;
    user: EnhancedUser | User | UserType;
    agent_info: AgentInfo | null;
    permissions: UserPermissions;
    user_role: string;
  } | null;
  permissionValidation: PermissionValidation;
  isLoading: boolean;
  error: string | null;
  permissionRefreshInterval: number | null; // Store interval ID
}

// Default permissions for backward compatibility
const defaultPermissions: UserPermissions = {
  is_agent: false,
  is_verified_agent: false,
  is_staff: false,
  is_superuser: false,
  can_create_properties: false,
  can_manage_inquiries: false,
  can_access_admin: false,
  can_verify_agents: false,
  can_manage_users: false,
  last_updated: new Date().toISOString(),
};

// Helper function to determine user role
const getUserRole = (user: any, permissions?: UserPermissions): string => {
  if (permissions?.user_role) return permissions.user_role;

  if (user?.is_superuser || user?.isAdmin) return "super_admin";
  if (user?.is_staff) return "staff";
  if (permissions?.is_verified_agent) return "verified_agent";
  if (permissions?.is_agent && !permissions?.is_verified_agent)
    return "pending_agent";
  return "regular_user";
};

// Helper function to process and normalize auth response
const processAuthResponse = (response: AuthResponse) => {
  const isEnhanced =
    response.success !== undefined && response.permissions !== undefined;

  // Get access token (prioritize access_token, fallback to token for backward compatibility)
  const accessToken = response.access_token || response.token;

  if (isEnhanced) {
    // New enhanced response
    return {
      token: accessToken!,
      access_token: response.access_token || response.token,
      refresh_token: response.refresh_token,
      expires_in: response.expires_in,
      refresh_expires_in: response.refresh_expires_in,
      user: response.user_info as EnhancedUser | User,
      agent_info: response.agent_info || null,
      permissions: {
        ...response.permissions!,
        last_updated: new Date().toISOString(),
      },
      user_role: response.user_role!,
    };
  } else {
    // Legacy response - create enhanced structure
    const user = response.user_info || response.user;

    // Create permissions based on available user data
    const permissions: UserPermissions = {
      ...defaultPermissions,
      is_staff: (user as any)?.is_staff || (user as any)?.isAdmin || false,
      is_superuser:
        (user as any)?.is_superuser || (user as any)?.isAdmin || false,
      can_access_admin:
        (user as any)?.is_staff || (user as any)?.isAdmin || false,
      can_verify_agents:
        (user as any)?.is_superuser || (user as any)?.isAdmin || false,
      can_manage_users:
        (user as any)?.is_staff || (user as any)?.isAdmin || false,
      last_updated: new Date().toISOString(),
    };

    const user_role = getUserRole(user, permissions);

    return {
      token: accessToken!,
      access_token: response.access_token || response.token,
      refresh_token: response.refresh_token,
      expires_in: response.expires_in,
      refresh_expires_in: response.refresh_expires_in,
      user: user!,
      agent_info: null,
      permissions,
      user_role,
    };
  }
};

const getStoredUserInfo = (): AuthResponse | null => {
  try {
    const storedInfo = localStorage.getItem("userInfo");
    return storedInfo ? JSON.parse(storedInfo) : null;
  } catch (error) {
    console.error("Error parsing stored user info:", error);
    localStorage.removeItem("userInfo");
    return null;
  }
};

const getStoredProcessedInfo = () => {
  const storedInfo = getStoredUserInfo();
  if (!storedInfo) return null;

  try {
    return processAuthResponse(storedInfo);
  } catch (error) {
    console.error("Error processing stored user info:", error);
    return null;
  }
};

const initialState: AuthState = {
  userInfo: getStoredUserInfo(),
  processedUserInfo: getStoredProcessedInfo(),
  permissionValidation: {
    isValidating: false,
    lastValidated: null,
    validationErrors: {},
  },
  isLoading: false,
  error: null,
  permissionRefreshInterval: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    // Enhanced setCredentials that processes the response
    setCredentials: (state, action: PayloadAction<AuthResponse>) => {
      state.userInfo = action.payload;
      state.processedUserInfo = processAuthResponse(action.payload);
      state.error = null;

      try {
        localStorage.setItem("userInfo", JSON.stringify(action.payload));
        // Store tokens separately for easy access
        const accessToken = action.payload.access_token || action.payload.token;
        const refreshToken = action.payload.refresh_token;
        if (accessToken) {
          localStorage.setItem("access_token", accessToken);
        }
        if (refreshToken) {
          localStorage.setItem("refresh_token", refreshToken);
        }
      } catch (error) {
        console.error("Error storing user info:", error);
        state.error = "Failed to store user information";
      }
    },

    // In your authSlice.ts, add this to the reducers:
    refreshPermissions: (state, action: PayloadAction<UserPermissions>) => {
      if (state.processedUserInfo) {
        const updatedPermissions = {
          ...action.payload,
          last_updated: new Date().toISOString(),
        };

        state.processedUserInfo.permissions = updatedPermissions;
        state.processedUserInfo.user_role = getUserRole(
          state.processedUserInfo.user,
          updatedPermissions
        );

        // Update stored info
        if (state.userInfo) {
          state.userInfo.permissions = updatedPermissions;
          state.userInfo.user_role = state.processedUserInfo.user_role;
          localStorage.setItem("userInfo", JSON.stringify(state.userInfo));
        }
      }
    },

    // Start permission validation
    startPermissionValidation: (state) => {
      state.permissionValidation.isValidating = true;
    },

    // Complete permission validation
    completePermissionValidation: (
      state,
      action: PayloadAction<{
        isValid: boolean;
        errors?: Record<string, string>;
        updatedPermissions?: UserPermissions;
      }>
    ) => {
      state.permissionValidation.isValidating = false;
      state.permissionValidation.lastValidated = new Date().toISOString();
      state.permissionValidation.validationErrors = action.payload.errors || {};

      // If permissions were updated during validation, apply them
      if (action.payload.updatedPermissions && state.processedUserInfo) {
        state.processedUserInfo.permissions = {
          ...action.payload.updatedPermissions,
          last_updated: new Date().toISOString(),
        };
        state.processedUserInfo.user_role = getUserRole(
          state.processedUserInfo.user,
          action.payload.updatedPermissions
        );

        // Update stored info
        if (state.userInfo) {
          state.userInfo.permissions = action.payload.updatedPermissions;
          state.userInfo.user_role = state.processedUserInfo.user_role;
          localStorage.setItem("userInfo", JSON.stringify(state.userInfo));
        }
      }
    },

    // Set permission refresh interval
    setPermissionRefreshInterval: (state, action: PayloadAction<number>) => {
      state.permissionRefreshInterval = action.payload;
    },

    // Clear permission refresh interval
    clearPermissionRefreshInterval: (state) => {
      if (state.permissionRefreshInterval) {
        clearInterval(state.permissionRefreshInterval);
        state.permissionRefreshInterval = null;
      }
    },

    // Set loading state
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },

    // Set error state
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
      state.isLoading = false;
    },

    logout: (state, action?: PayloadAction<AuthResponse | undefined>) => {
      console.log(action);

      // Clear permission refresh interval
      if (state.permissionRefreshInterval) {
        clearInterval(state.permissionRefreshInterval);
      }

      state.userInfo = null;
      state.processedUserInfo = null;
      state.permissionValidation = {
        isValidating: false,
        lastValidated: null,
        validationErrors: {},
      };
      state.error = null;
      state.isLoading = false;
      state.permissionRefreshInterval = null;

      try {
        localStorage.removeItem("userInfo");
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
      } catch (error) {
        console.error("Error clearing storage:", error);
      }
    },

    // Enhanced updateUserInfo that handles both formats
    updateUserInfo: (state, action: PayloadAction<Partial<AuthResponse>>) => {
      if (state.userInfo) {
        state.userInfo = { ...state.userInfo, ...action.payload };

        // Reprocess the updated data
        try {
          state.processedUserInfo = processAuthResponse(state.userInfo);
        } catch (error) {
          console.error("Error processing updated user info:", error);
        }

        try {
          localStorage.setItem("userInfo", JSON.stringify(state.userInfo));
          // Update tokens if provided
          if (action.payload.access_token) {
            localStorage.setItem("access_token", action.payload.access_token);
          }
          if (action.payload.refresh_token) {
            localStorage.setItem("refresh_token", action.payload.refresh_token);
          }
        } catch (error) {
          console.error("Error updating stored user info:", error);
          state.error = "Failed to update user information";
        }
      }
    },

    // Update tokens (for refresh token flow)
    updateTokens: (
      state,
      action: PayloadAction<{
        access_token: string;
        refresh_token?: string;
        expires_in?: number;
        refresh_expires_in?: number;
      }>
    ) => {
      if (state.userInfo && state.processedUserInfo) {
        // Update tokens in userInfo
        state.userInfo.token = action.payload.access_token;
        state.userInfo.access_token = action.payload.access_token;
        if (action.payload.refresh_token) {
          state.userInfo.refresh_token = action.payload.refresh_token;
        }
        if (action.payload.expires_in !== undefined) {
          state.userInfo.expires_in = action.payload.expires_in;
        }
        if (action.payload.refresh_expires_in !== undefined) {
          state.userInfo.refresh_expires_in = action.payload.refresh_expires_in;
        }

        // Update tokens in processedUserInfo
        state.processedUserInfo.token = action.payload.access_token;
        state.processedUserInfo.access_token = action.payload.access_token;
        if (action.payload.refresh_token) {
          state.processedUserInfo.refresh_token = action.payload.refresh_token;
        }
        if (action.payload.expires_in !== undefined) {
          state.processedUserInfo.expires_in = action.payload.expires_in;
        }
        if (action.payload.refresh_expires_in !== undefined) {
          state.processedUserInfo.refresh_expires_in =
            action.payload.refresh_expires_in;
        }

        try {
          localStorage.setItem("userInfo", JSON.stringify(state.userInfo));
          localStorage.setItem("access_token", action.payload.access_token);
          if (action.payload.refresh_token) {
            localStorage.setItem("refresh_token", action.payload.refresh_token);
          }
        } catch (error) {
          console.error("Error updating tokens:", error);
        }
      }
    },

    // Update agent info specifically
    updateAgentInfo: (state, action: PayloadAction<AgentInfo>) => {
      if (state.userInfo && state.processedUserInfo) {
        // Update the raw response
        state.userInfo.agent_info = action.payload;

        // Update processed info
        state.processedUserInfo.agent_info = action.payload;
        state.processedUserInfo.permissions = {
          ...state.processedUserInfo.permissions,
          is_agent: true,
          is_verified_agent: action.payload.is_verified,
          can_create_properties: action.payload.is_verified,
          can_manage_inquiries: action.payload.is_verified,
          last_updated: new Date().toISOString(),
        };
        state.processedUserInfo.user_role = action.payload.is_verified
          ? "verified_agent"
          : "pending_agent";

        try {
          localStorage.setItem("userInfo", JSON.stringify(state.userInfo));
        } catch (error) {
          console.error("Error updating stored agent info:", error);
        }
      }
    },

    clearAuth: (state) => {
      // Clear permission refresh interval
      if (state.permissionRefreshInterval) {
        clearInterval(state.permissionRefreshInterval);
      }

      state.userInfo = null;
      state.processedUserInfo = null;
      state.permissionValidation = {
        isValidating: false,
        lastValidated: null,
        validationErrors: {},
      };
      state.error = null;
      state.isLoading = false;
      state.permissionRefreshInterval = null;

      try {
        localStorage.removeItem("userInfo");
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
      } catch (error) {
        console.error("Error clearing auth:", error);
      }
    },

    syncWithStorage: (state) => {
      const storedInfo = getStoredUserInfo();
      state.userInfo = storedInfo;
      state.processedUserInfo = storedInfo
        ? processAuthResponse(storedInfo)
        : null;
    },

    // Handle real-time permission updates (e.g., from WebSocket)
    handlePermissionUpdate: (
      state,
      action: PayloadAction<{
        type: "permission_changed" | "role_updated" | "agent_verified";
        permissions?: UserPermissions;
        agentInfo?: AgentInfo;
        message?: string;
      }>
    ) => {
      const { type, permissions, agentInfo, message } = action.payload;

      if (state.processedUserInfo) {
        switch (type) {
          case "permission_changed":
            if (permissions) {
              state.processedUserInfo.permissions = {
                ...permissions,
                last_updated: new Date().toISOString(),
              };
              state.processedUserInfo.user_role = getUserRole(
                state.processedUserInfo.user,
                permissions
              );
            }
            break;

          case "agent_verified":
            if (agentInfo) {
              state.processedUserInfo.agent_info = agentInfo;
              state.processedUserInfo.permissions = {
                ...state.processedUserInfo.permissions,
                is_verified_agent: agentInfo.is_verified,
                can_create_properties: agentInfo.is_verified,
                can_manage_inquiries: agentInfo.is_verified,
                last_updated: new Date().toISOString(),
              };
              state.processedUserInfo.user_role = agentInfo.is_verified
                ? "verified_agent"
                : "pending_agent";
            }
            break;

          case "role_updated":
            if (permissions) {
              state.processedUserInfo.permissions = {
                ...permissions,
                last_updated: new Date().toISOString(),
              };
              state.processedUserInfo.user_role = getUserRole(
                state.processedUserInfo.user,
                permissions
              );
            }
            break;
        }

        // Update stored info
        if (state.userInfo) {
          state.userInfo.permissions = state.processedUserInfo.permissions;
          state.userInfo.user_role = state.processedUserInfo.user_role;
          state.userInfo.agent_info = state.processedUserInfo.agent_info;
          localStorage.setItem("userInfo", JSON.stringify(state.userInfo));
        }
      }

      // Show notification if message provided
      if (message) {
        console.log("Permission Update:", message);
        // You can dispatch a notification action here if you have a notification system
      }
    },
  },
});

export const {
  setCredentials,
  refreshPermissions,
  startPermissionValidation,
  completePermissionValidation,
  setPermissionRefreshInterval,
  clearPermissionRefreshInterval,
  setLoading,
  setError,
  logout,
  updateUserInfo,
  updateTokens,
  updateAgentInfo,
  clearAuth,
  syncWithStorage,
  handlePermissionUpdate,
} = authSlice.actions;

export default authSlice.reducer;

// Enhanced selectors for easy access
export const selectAuth = (state: { auth: AuthState }) => state.auth;
export const selectRawUserInfo = (state: { auth: AuthState }) =>
  state.auth.userInfo;
export const selectProcessedUserInfo = (state: { auth: AuthState }) =>
  state.auth.processedUserInfo;
export const selectUser = (state: { auth: AuthState }) =>
  state.auth.processedUserInfo?.user;
export const selectAgentInfo = (state: { auth: AuthState }) =>
  state.auth.processedUserInfo?.agent_info;
export const selectPermissions = (state: { auth: AuthState }) =>
  state.auth.processedUserInfo?.permissions;
export const selectUserRole = (state: { auth: AuthState }) =>
  state.auth.processedUserInfo?.user_role;
export const selectToken = (state: { auth: AuthState }) =>
  state.auth.processedUserInfo?.token;
export const selectAccessToken = (state: { auth: AuthState }) =>
  state.auth.processedUserInfo?.access_token || state.auth.processedUserInfo?.token;
export const selectRefreshToken = (state: { auth: AuthState }) =>
  state.auth.processedUserInfo?.refresh_token;
export const selectIsAuthenticated = (state: { auth: AuthState }) =>
  !!state.auth.processedUserInfo?.token;
export const selectAuthLoading = (state: { auth: AuthState }) =>
  state.auth.isLoading;
export const selectAuthError = (state: { auth: AuthState }) => state.auth.error;
export const selectPermissionValidation = (state: { auth: AuthState }) =>
  state.auth.permissionValidation;

// Permission-specific selectors
export const selectCanCreateProperties = (state: { auth: AuthState }) =>
  state.auth.processedUserInfo?.permissions?.can_create_properties || false;
export const selectCanAccessAdmin = (state: { auth: AuthState }) =>
  state.auth.processedUserInfo?.permissions?.can_access_admin || false;
export const selectIsSuperAdmin = (state: { auth: AuthState }) =>
  state.auth.processedUserInfo?.permissions?.is_superuser || false;
export const selectIsVerifiedAgent = (state: { auth: AuthState }) =>
  state.auth.processedUserInfo?.permissions?.is_verified_agent || false;
export const selectIsAgent = (state: { auth: AuthState }) =>
  state.auth.processedUserInfo?.permissions?.is_agent || false;

// Permission freshness selectors
export const selectPermissionsLastUpdated = (state: { auth: AuthState }) =>
  state.auth.processedUserInfo?.permissions?.last_updated;
export const selectPermissionsAge = (state: { auth: AuthState }) => {
  const lastUpdated = state.auth.processedUserInfo?.permissions?.last_updated;
  if (!lastUpdated) return null;
  return Date.now() - new Date(lastUpdated).getTime();
};
export const selectArePermissionsStale = (
  state: { auth: AuthState },
  maxAgeMs: number = 5 * 60 * 1000
) => {
  const age = selectPermissionsAge(state);
  return age ? age > maxAgeMs : true;
};
