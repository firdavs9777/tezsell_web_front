import { useSelector } from "react-redux";
import { useGetUserServicesQuery } from "../../store/slices/users";
import { useTranslation } from "react-i18next";
import { Service, ServiceResponse } from "../../store/type";
import MyService from "./MyService";

const MyServices = () => {
  const userInfo = useSelector((state: RootState) => state.auth.userInfo);
  const token = userInfo?.token;
  //   const navigate = useNavigate();
  const {
    data: servicesData,
    isLoading,
    error,
    refetch,
  } = useGetUserServicesQuery({ token });
  const { t, i18n } = useTranslation();
  const refetchHandler = async () => {
    refetch();
  };
  if (isLoading) {
    return <div>Loading...</div>;
  }
  if (error) {
    return <div>Error occured ...</div>;
  }
  const services: ServiceResponse | undefined = servicesData as ServiceResponse;
  console.log(services);
  return (
    <div className="product-list">
      {services?.results?.length ? (
        services.results.map((service: Service) => (
          <MyService
            service={service}
            key={service.id}
            refresh={refetchHandler}
          />
        ))
      ) : (
        <p>{t("product_error")}</p>
      )}
    </div>
  );
};

export default MyServices;
