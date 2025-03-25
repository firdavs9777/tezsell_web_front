import React from "react";
import MyProduct from "./MyProduct";
import { Product, ProductResponse } from "../../store/type";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";
import { RootState } from "../../store";
import "./MyProducts.css";
import { useGetUserProductsQuery } from "../../store/slices/users";
const MyProducts = () => {
  const userInfo = useSelector((state: RootState) => state.auth.userInfo);
  const token = userInfo?.token;
  //   const navigate = useNavigate();
  const {
    data: productsData,
    isLoading,
    error,
    refetch,
  } = useGetUserProductsQuery({ token });
  const { t, i18n } = useTranslation();
  const refetchHandler = async () => {
    refetch();
  }
  if (isLoading) {
    return <div>Loading...</div>
  }
  if (error) {
    return <div>Error occured ...</div>
  }
  const products: ProductResponse | undefined = productsData as ProductResponse;
  return (
    <div className="product-list">
      {products?.results?.length ? (
        products.results.map((product: Product) => (
          <MyProduct product={product} key={product.id} refresh={refetchHandler} />
        ))
      ) : (
        <p>{t("product_error")}</p>
      )}
    </div>
  );
};
export default MyProducts;
