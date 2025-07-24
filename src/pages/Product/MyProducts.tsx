import MyProduct from "@products/MyProduct";
import { RootState } from "@store/index";
import { useGetUserProductsQuery } from "@store/slices/users";
import { Product, ProductResponse } from "@store/type";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";

const MyProducts = () => {
  const userInfo = useSelector((state: RootState) => state.auth.userInfo);
  const token = userInfo?.token;
  const { t } = useTranslation();

  const {
    data: productsData,
    isLoading,
    error,
    refetch,
  } = useGetUserProductsQuery({ token });

  const refetchHandler = async () => {
    await refetch();
  };

  const products: ProductResponse | undefined = productsData as ProductResponse;

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 p-4"></div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[200px] gap-4 p-6">
        <p className="text-red-500 font-medium">{t("error_occurred")}</p>
        <button
          onClick={refetchHandler}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          {t("retry")}
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold px-4 pt-4">{t("my_products_title")}</h2>

      {products?.results?.length ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 p-4">
          {products.results.map((product: Product) => (
            <MyProduct
              product={product}
              key={product.id}
              refresh={refetchHandler}
            />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center min-h-[200px] gap-4">
          <p className="text-gray-500">{t("product_error")}</p>
          <button
            onClick={refetchHandler}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            {t("refresh")}
          </button>
        </div>
      )}
    </div>
  );
};

export default MyProducts;
