import {
  ALL_LOCATION,
  CATEGORY_URL,
  DISLIKE_PRODUCT,
  DISTRICTS_URL,
  LIKE_PRODUCT,
  PRODUCTS_URL,
  REGIONS_URL,
  USER_FAV_PRODS,
} from "../constants";

import { apiSlice } from "./apiSlice";
// import ProductType  from "../type";
import { Product } from "../type";

export const productsApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder: any) => ({
    getProducts: builder.query({
      query: ({
        currentPage = 1,
        page_size = 12,
        category_name = "",
        region_name = "",
        district_name = "",
        product_title = "",
        lang = "",
      }) => ({
        url: PRODUCTS_URL,
        params: {
          page: currentPage.toString(),
          page_size: page_size.toString(),
          category_name: category_name,
          region_name: region_name,
          district_name: district_name,
          product_title: product_title,
          lang: lang,
        }, // Ensure page and page_size are strings
      }),
      keepUnusedDataFor: 5,
      provideTags: ["Product"],
    }),
    getFavoriteItems: builder.query({
      query: ({ token }: { token: string }) => {
        return {
          url: USER_FAV_PRODS,
          headers: {
            Authorization: `Token ${token}`, // Pass token in headers
          },
          credentials: "include",
        };
      },
      invalidatesTags: ["Product"],
    }),
    getSingleProduct: builder.query({
      query: (productId: string) => ({
        url: `${PRODUCTS_URL}/${productId}`,
      }),
      keepUnusedDataFor: 5,
      provideTags: ["Product"],
    }),
    getCategoryList: builder.query({
      query: () => ({
        url: CATEGORY_URL,
      }),
      keepUnusedDataFor: 5,
      provideTags: ["Product"],
    }),
    getAllLocationList: builder.query({
      query: () => ({
        url: ALL_LOCATION,
      }),
      keepUnusedDataFor: 5,
      provideTags: ["Product"],
    }),
    getRegionsList: builder.query({
      query: () => ({
        url: REGIONS_URL,
      }),
      keepUnusedDataFor: 5,
      provideTags: ["Product"],
    }),
    getDistrictsList: builder.query({
      query: (region: string) => ({
        url: `${DISTRICTS_URL}${region}`,
      }),
      keepUnusedDataFor: 5,
      provideTags: ["Product"],
    }),

    createProduct: builder.mutation({
      query: ({
        productData,
        token,
      }: {
        productData: FormData;
        token: string;
      }) => {
        return {
          url: `${PRODUCTS_URL}/`,
          method: "POST",
          body: productData,
          headers: {
            Authorization: `Token ${token}`, // Add token to the Authorization header
          },
          credentials: "include",
        };
      },
      invalidatesTags: ["Product"],
    }),
    likeProduct: builder.mutation({
      query: ({ productId, token }: { productId: string; token: string }) => {
        return {
          url: `${LIKE_PRODUCT}${productId}/`,
          method: "POST",
          headers: {
            Authorization: `Token ${token}`, // Add token to the Authorization header
          },
          credentials: "include",
        };
      },
      invalidatesTags: ["Product"],
    }),
    unlikeProduct: builder.mutation({
      query: ({ productId, token }: { productId: string; token: string }) => {
        return {
          url: `${DISLIKE_PRODUCT}${productId}/`,
          method: "POST",
          headers: {
            Authorization: `Token ${token}`, // Add token to the Authorization header
          },
          credentials: "include",
        };
      },
      invalidatesTags: ["Product"],
    }),
  }),
});
export const {
  useGetProductsQuery,
  useGetSingleProductQuery,
  useGetCategoryListQuery,
  useGetAllLocationListQuery,
  useGetRegionsListQuery,
  useGetDistrictsListQuery,
  useCreateProductMutation,
  useGetFavoriteItemsQuery,
  useLikeProductMutation,
  useUnlikeProductMutation,
} = productsApiSlice;
export default productsApiSlice.reducer;
