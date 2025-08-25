import {
  AGENTS_URL,
  AGENT_APPLICATION_STATUS_URL,
  AGENT_BECOME_URL,
  AGENT_DASHBOARD_URL,
  AGENT_INQUIRIES_URL,
  AGENT_PROFILE_URL,
  AGENT_STATUS_URL,
  LOCATION_CHOICES_URL,
  MAP_BOUNDS_URL,
  MAP_STATS_URL,
  PENDING_AGENTS_URL,
  PROPERTIES_URL,
  PROPERTY_INQUIRIES_URL,
  PROPERTY_STATS_URL,
  SAVED_PROPERTIES_URL,
  TOP_AGENTS_URL,
  USER_LOCATIONS_URL,
  VERIFY_AGENT_URL,
} from "@store/constants";
import { apiSlice } from "@store/slices/apiSlice";
import {
  AgentStatus,
  BecomeAgentRequest,
  BecomeAgentResponse,
  GetAgentsQueryParams,
  GetPropertiesQueryParams,
  LocationChoices,
  MapBounds,
  MapStatistics,
  PaginatedResponse,
  Property,
  PropertyInquiry,
  PropertyStats,
  RealEstateAgent,
} from "@store/type";

export const realEstateApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // Properties endpoints
    getProperties: builder.query<
      PaginatedResponse<Property>,
      GetPropertiesQueryParams | void
    >({
      query: (params) => {
        const searchParams = new URLSearchParams();

        if (params?.page) searchParams.append("page", params.page.toString());
        if (params?.limit)
          searchParams.append("limit", params.limit.toString());
        if (params?.property_type)
          searchParams.append("property_type", params.property_type);
        if (params?.listing_type)
          searchParams.append("listing_type", params.listing_type);
        if (params?.min_price)
          searchParams.append("min_price", params.min_price.toString());
        if (params?.max_price)
          searchParams.append("max_price", params.max_price.toString());
        if (params?.district) searchParams.append("district", params.district);
        if (params?.city) searchParams.append("city", params.city);
        if (params?.bedrooms)
          searchParams.append("bedrooms", params.bedrooms.toString());
        if (params?.bathrooms)
          searchParams.append("bathrooms", params.bathrooms.toString());
        if (params?.search) searchParams.append("search", params.search);

        const queryString = searchParams.toString();
        return `${PROPERTIES_URL}/${queryString ? `?${queryString}` : ""}`;
      },
      providesTags: ["Property"],
    }),

    getPropertyById: builder.query<Property, string>({
      query: (id) => `${PROPERTIES_URL}/${id}/`,
      providesTags: (_result, _error, id) => [{ type: "Property", id }],
    }),

    createProperty: builder.mutation<Property, Partial<Property>>({
      query: (propertyData) => ({
        url: `${PROPERTIES_URL}/`,
        method: "POST",
        body: propertyData,
      }),
      invalidatesTags: ["Property"],
    }),

    updateProperty: builder.mutation<
      Property,
      { id: string; data: Partial<Property> }
    >({
      query: ({ id, data }) => ({
        url: `${PROPERTIES_URL}/${id}/`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: (_result, _error, { id }) => [{ type: "Property", id }],
    }),

    deleteProperty: builder.mutation<{ success: boolean }, string>({
      query: (id) => ({
        url: `${PROPERTIES_URL}/${id}/`,
        method: "DELETE",
      }),
      invalidatesTags: ["Property"],
    }),

    // Map & Search endpoints
    getPropertiesInMapBounds: builder.query<
      Property[],
      { bounds: MapBounds; filters?: GetPropertiesQueryParams }
    >({
      query: ({ bounds, filters = {} }) => {
        const searchParams = new URLSearchParams();
        searchParams.append("north", bounds.north.toString());
        searchParams.append("south", bounds.south.toString());
        searchParams.append("east", bounds.east.toString());
        searchParams.append("west", bounds.west.toString());

        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined) searchParams.append(key, value.toString());
        });

        return `${MAP_BOUNDS_URL}/?${searchParams.toString()}`;
      },
      providesTags: ["Property"],
    }),

    getMapStatistics: builder.query<MapStatistics, MapBounds>({
      query: (bounds) => {
        const searchParams = new URLSearchParams();
        searchParams.append("north", bounds.north.toString());
        searchParams.append("south", bounds.south.toString());
        searchParams.append("east", bounds.east.toString());
        searchParams.append("west", bounds.west.toString());

        return `${MAP_STATS_URL}/?${searchParams.toString()}`;
      },
      providesTags: ["Property"],
    }),

    // Location endpoints
    getLocationChoices: builder.query<LocationChoices, void>({
      query: () => `${LOCATION_CHOICES_URL}/`,
      providesTags: ["Location"],
    }),

    getUserLocations: builder.query<any[], void>({
      query: () => `${USER_LOCATIONS_URL}/`,
      providesTags: ["Location"],
    }),

    // Saved properties endpoints
    toggleSaveProperty: builder.mutation<{ saved: boolean }, { propertyId: string; token: string }>({
      query: ({propertyId, token}) => ({
        url: `${PROPERTIES_URL}/${propertyId}/save/`,
       headers: {
            Authorization: `Token ${token}`, // Pass token in headers
          },
        method: "POST",
      }),
      invalidatesTags: ["SavedProperty"],
    }),
     toggleUnsaveProperty: builder.mutation<{ saved: boolean }, { propertyId: string; token: string }>({
      query: ({propertyId, token}) => ({
        url: `${PROPERTIES_URL}/${propertyId}/save/`,
       headers: {
            Authorization: `Token ${token}`, // Pass token in headers
          },
        method: "DELETE",
      }),
      invalidatesTags: ["SavedProperty"],
    }),
    getSavedProperties: builder.query<PaginatedResponse<Property>, { token: string }>({
      query: ({ token }: { token: string }) => {
        return {
      url: `${SAVED_PROPERTIES_URL}/`,
      headers: {
        Authorization: `Token ${token}`, // Pass token in headers
      },
      credentials: "include",
    };
  },
  providesTags: ["SavedProperty"],
}),
    createPropertyInquiry: builder.mutation<
      PropertyInquiry,
      Omit<PropertyInquiry, "id" | "user" | "is_responded" | "created_at">
    >({
      query: (inquiryData) => ({
        url: `${PROPERTY_INQUIRIES_URL}/`,
        method: "POST",
        body: inquiryData,
      }),
      invalidatesTags: ["Inquiry"],
    }),

    // Analytics
    getPropertyStats: builder.query<PropertyStats, void>({
      query: () => `${PROPERTY_STATS_URL}/`,
      providesTags: ["Stats"],
    }),

    // Agent endpoints
    getAgents: builder.query<
      PaginatedResponse<RealEstateAgent>,
      GetAgentsQueryParams | void
    >({
      query: (params) => {
        const searchParams = new URLSearchParams();

        if (params?.page) searchParams.append("page", params.page.toString());
        if (params?.limit)
          searchParams.append("limit", params.limit.toString());
        if (params?.is_verified !== undefined)
          searchParams.append("is_verified", params.is_verified.toString());
        if (params?.specialization)
          searchParams.append("specialization", params.specialization);
        if (params?.min_rating)
          searchParams.append("min_rating", params.min_rating.toString());
        if (params?.search) searchParams.append("search", params.search);

        const queryString = searchParams.toString();
        return `${AGENTS_URL}/${queryString ? `?${queryString}` : ""}`;
      },
      providesTags: ["Agent"],
    }),

    getAgentById: builder.query<RealEstateAgent, string>({
      query: (id) => `${AGENTS_URL}/${id}/`,
      providesTags: (_result, _error, id) => [{ type: "Agent", id }],
    }),

    getAgentProperties: builder.query<PaginatedResponse<Property>, string>({
      query: (agentId) => `${AGENTS_URL}/${agentId}/properties/`,
      providesTags: ["Property"],
    }),

    getTopAgents: builder.query<RealEstateAgent[], void>({
      query: () => `${TOP_AGENTS_URL}/`,
      providesTags: ["Agent"],
    }),

    // Agent dashboard and management
    getAgentDashboard: builder.query<any, void>({
      query: () => `${AGENT_DASHBOARD_URL}/`,
      providesTags: ["AgentData"],
    }),

    getAgentInquiries: builder.query<PaginatedResponse<PropertyInquiry>, void>({
      query: () => `${AGENT_INQUIRIES_URL}/`,
      providesTags: ["Inquiry"],
    }),

    respondToInquiry: builder.mutation<
      any,
      { inquiryId: string; response: string }
    >({
      query: ({ inquiryId, response }) => ({
        url: `${AGENT_INQUIRIES_URL}/${inquiryId}/respond/`,
        method: "POST",
        body: { response },
      }),
      invalidatesTags: ["Inquiry"],
    }),

    becomeAgent: builder.mutation<BecomeAgentResponse, BecomeAgentRequest>({
      query: ({
        agency_name,
        licence_number,
        years_experience,
        specialization,
        token,
      }) => ({
        url: `${AGENT_BECOME_URL}/`,
        method: "POST",
        headers: {
          Authorization: `Token ${token}`, // Pass token in headers
        },
        body: {
          agency_name,
          licence_number,
          years_experience,
          specialization,
        },
      }),
      invalidatesTags: ["Agent", "AgentData"],
    }),

    updateAgentProfile: builder.mutation<
      RealEstateAgent,
      Partial<RealEstateAgent>
    >({
      query: (profileData) => ({
        url: `${AGENT_PROFILE_URL}/`,
        method: "PUT",
        body: profileData,
      }),
      invalidatesTags: ["Agent", "AgentData"],
    }),
    checkAgentStatus: builder.query<AgentStatus, { token: string }>({

      query: ({ token }) => ({
    url: `${AGENT_STATUS_URL}/`,
    headers: {
      Authorization: `Token ${token}`, // Add token to the Authorization header
    },
  }),
  providesTags: ["AgentData"],
}),
getAgentApplicationStatus: builder.query<any, { token: string }>({
  query: ({ token }) => ({
    url: `${AGENT_APPLICATION_STATUS_URL}/`,
    headers: {
      Authorization: `Token ${token}`, // Add token to the Authorization header
    },
  }),
  providesTags: ["AgentData"],
}),
    getPendingAgentApplications: builder.query<
      PaginatedResponse<RealEstateAgent>,
      void
    >({
      query: () => `${PENDING_AGENTS_URL}/`,
      providesTags: ["Agent"],
    }),

    verifyAgent: builder.mutation<
      any,
      { agentId: number; approved: boolean; rejection_reason?: string }
    >({
      query: ({ agentId, approved, rejection_reason }) => ({
        url: `${VERIFY_AGENT_URL}/${agentId}/verify/`,
        method: "POST",
        body: { approved, rejection_reason },
      }),
      invalidatesTags: ["Agent"],
    }),
  }),
});

// Export hooks for usage in functional components
export const {
  // Property hooks
  useGetPropertiesQuery,
  useGetPropertyByIdQuery,
  useCreatePropertyMutation,
  useUpdatePropertyMutation,
  useDeletePropertyMutation,

  // Map & Search hooks
  useGetPropertiesInMapBoundsQuery,
  useGetMapStatisticsQuery,

  // Location hooks
  useGetLocationChoicesQuery,
  useGetUserLocationsQuery,

  // Saved properties hooks
  useToggleSavePropertyMutation,
  useToggleUnsavePropertyMutation,
  useGetSavedPropertiesQuery,

  // Inquiry hooks
  useCreatePropertyInquiryMutation,

  // Analytics hooks
  useGetPropertyStatsQuery,

  // Agent hooks
  useGetAgentsQuery,
  useGetAgentByIdQuery,
  useGetAgentPropertiesQuery,
  useGetTopAgentsQuery,

  // Agent dashboard hooks
  useGetAgentDashboardQuery,
  useGetAgentInquiriesQuery,
  useRespondToInquiryMutation,
  useBecomeAgentMutation,
  useUpdateAgentProfileMutation,
  useCheckAgentStatusQuery,
  useGetAgentApplicationStatusQuery,

  // Admin hooks
  useGetPendingAgentApplicationsQuery,
  useVerifyAgentMutation,
} = realEstateApiSlice;

export default realEstateApiSlice.reducer;
