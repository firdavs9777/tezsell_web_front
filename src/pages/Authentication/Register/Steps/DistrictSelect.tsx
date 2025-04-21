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
  const { t } = useTranslation();

  if (isLoading) {
    return <div className="text-center text-gray-500">{t("loading")}</div>;
  }
  if (error) {
    return <div className="text-center text-red-500">{t("error_message")}</div>;
  }

  return (
    <div className="max-w-md mx-auto p-4 bg-white shadow-lg rounded-xl">
      <h1 className="text-xl font-semibold text-gray-800 mb-2">{t("district_select_title")}</h1>
      <p className="text-gray-600 mb-4">{t("district_select_paragraph")}</p>
      <ul className="space-y-2">
        {districts.districts.map((item, index) => (
          <li
            key={index}
            onClick={(event) => {
              event.preventDefault();
              onSelect(item.district);
            }}
            className={`cursor-pointer px-4 py-2 rounded-lg transition duration-200 ${
              district === item.district
                ? "bg-blue-100 text-blue-700 font-semibold"
                : "hover:bg-gray-100 text-gray-800"
            }`}
          >
            {index + 1}. {item.district}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default DistrictSelect;
