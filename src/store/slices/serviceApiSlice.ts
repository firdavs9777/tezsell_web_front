
import { SERVICES_URL, SERVICES_CATEGORY } from '../constants';

import { apiSlice } from "./apiSlice";


export const servicessApiSlice = apiSlice.injectEndpoints({
    endpoints: (builder: any) => ({
        getServices: builder.query({
            query: ({ currentPage = 1, page_size = 10, category_name = '', region_name = '', district_name = '', service_name = '' }) => ({
                url: SERVICES_URL,
                params: { page: currentPage.toString(), page_size: page_size.toString(), category_name: category_name, region_name: region_name, district_name: district_name, service_name: service_name}, // Ensure page and page_size are strings
            }),
            keepUnusedDataFor: 5,
            provideTags: ['Service']
        }),
       getServiceCategoryList: builder.query({
                  query: () => ({
                      url: SERVICES_CATEGORY,
                  }),
                  keepUnusedDataFor: 5,
                  provideTags: ['Product']
              }),
    })
});
export const { useGetServicesQuery, useGetServiceCategoryListQuery } = servicessApiSlice;
export default servicessApiSlice.reducer;