import { PROPERTIES_URL } from "@store/constants";
import { apiSlice } from "./apiSlice";

export const realEstateApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder: any) => ({
    getProperties: builder.query({
      // query: ({
      //     curren
      // })
      url: `${PROPERTIES_URL}`,
      keepUnusedDataFor: 5,
      provideTags: ["RealEstate"],
    }),
  }),
});

export const { useGetPropertiesQuery } = realEstateApiSlice;

export default realEstateApiSlice.reducer;
