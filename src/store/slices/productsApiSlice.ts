
import { CATEGORY_URL, DISTRICTS_URL, PRODUCTS_URL, REGIONS_URL } from "../constants";

import { apiSlice } from "./apiSlice";
// import ProductType  from "../type";
import Product from "../type";


export const productsApiSlice  = apiSlice.injectEndpoints({
    endpoints: (builder: any)=> ({
        getProducts: builder.query({
            query: ({page = 1, page_size = 10}) => ({
                url: PRODUCTS_URL,
                params: {page, page_size},
            }),
            keepUnusedDataFor: 5,
        providesTags: ['Product'],
        }),
        getCategoryList: builder.query({
            query: () => ({
                url: CATEGORY_URL,
            }),
            keepUnusedDataFor: 5,
            provideTags: ['Product']
        }), 
        getRegionsList: builder.query({
            query: () => ({
                url: REGIONS_URL,
            }),
            keepUnusedDataFor: 5,
            provideTags: ['Product']
        }),
        getDistrictsList: builder.query({
            query: (region: string)=> ({
                url:`${DISTRICTS_URL}${region}`
            }),
            keepUnusedDataFor: 5,
            provideTags: ['Product']
        }),
        createProduct: builder.mutation({
            query: (productData: Product) => ({
                url: `${PRODUCTS_URL}/`,
                method: 'POST',
                body: productData,
                // headers: {
                //     'Content-Type': 'multipart/form-data'
                // },
            }),
            invalidatesTags: ['Product']
        }),

    })
});
export const { useGetProductsQuery, useGetCategoryListQuery, useGetRegionsListQuery, useGetDistrictsListQuery, useCreateProductMutation} = productsApiSlice;
export default productsApiSlice.reducer;