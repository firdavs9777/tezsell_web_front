import { useSelector } from "react-redux";
import { useGetUserServicesQuery } from "@store/slices/users";
import { useTranslation } from "react-i18next";
import { Service, ServiceResponse } from "@store/type";
import MyService from "./MyService";
import { RootState } from "@store/index";
import { BiLoader } from "react-icons/bi";

const MyServices = () => {
  const userInfo = useSelector((state: RootState) => state.auth.userInfo);
  const token = userInfo?.token;
  const { t } = useTranslation();

  const {
    data: servicesData,
    isLoading,
    error,
    refetch,
  } = useGetUserServicesQuery({ token });

  const refetchHandler = async () => {
    await refetch();
  };

  const services: ServiceResponse | undefined = servicesData as ServiceResponse;

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-4">
        {[...Array(3)].map((_, index) => (
          <BiLoader key={index} className="h-64 w-full rounded-lg" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center">
        <div className="text-red-500 text-xl font-medium mb-4">
          {t("error_occurred")}
        </div>
        <button
          onClick={refetchHandler}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
        >
          {t("retry")}
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4">
      <h1 className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-white mb-6">
        {t("my_services_title")}
      </h1>{" "}
      {services?.results?.length ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.results.map((service: Service) => (
            <MyService
              service={service}
              key={service.id}
              refresh={refetchHandler}
            />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center p-8 text-center">
          <div className="text-gray-500 text-xl font-medium mb-4">
            {t("product_error")}
          </div>
          <button
            onClick={refetchHandler}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
          >
            {t("refresh")}
          </button>
        </div>
      )}
    </div>
  );
};

export default MyServices;
