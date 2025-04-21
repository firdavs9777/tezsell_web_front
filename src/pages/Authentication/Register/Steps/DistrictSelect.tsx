import { useGetDistrictsListQuery } from "@store/slices/productsApiSlice";
import { DistrictsList } from "@store/type";
import { useTranslation } from "react-i18next";

interface DistrictProps {
  regionName: string;
  district: string;
  onSelect: (district: string) => void;
}

const DistrictSelect: React.FC<DistrictProps> = ({
  regionName,
  district,
  onSelect,
}) => {
  const {
    data: districtsList,
    isLoading,
    error,
  } = useGetDistrictsListQuery(regionName);
  const districts: DistrictsList = districtsList as DistrictsList;
  const { t, i18n } = useTranslation();

  if (isLoading) {
    return <div>{t("loading")}</div>;
  }
  if (error) {
    return <div>{t("error_message")}</div>;
  }

  return (
    <div>
      <h1>{t("district_select_title")}</h1>
      <p>{t("district_select_paragraph")}</p>
      {districts.districts.map((item, index) => (
        <p
          key={index}
          onClick={(event) => {
            event.preventDefault();
            onSelect(item.district); // Call the onSelect callback with the selected district
          }}
          style={{
            cursor: "pointer",
            color: district === item.district ? "blue" : "black", // Compare with the selected region
          }}
        >
          {index + 1}:{item.district}
        </p>
      ))}
    </div>
  );
};

export default DistrictSelect;
