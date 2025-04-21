import React from "react";
import { useGetRegionsListQuery } from "@store/slices/productsApiSlice";
import { RegionsList } from "@store/type";
import { useTranslation } from "react-i18next";

interface RegionSelectProps {
  onSelect: (status: boolean, region: string) => void;
  region: string;
}

const RegionSelect: React.FC<RegionSelectProps> = ({ onSelect, region }) => {
  const { data: regions_list, isLoading, error } = useGetRegionsListQuery({});
  const regions: RegionsList = regions_list as RegionsList;
  const { t } = useTranslation();

  if (isLoading) {
    return <div className="text-center text-gray-500">{t("loading")}</div>;
  }
  if (error) {
    return <div className="text-center text-red-500">{t("error_message")}</div>;
  }

  return (
    <div className="max-w-md mx-auto p-4 bg-white shadow-lg rounded-xl">
      <h1 className="text-xl font-semibold text-gray-800 mb-2">{t("regions_list")}</h1>
      <p className="text-gray-600 mb-4">{t("select_region")}:</p>
      <ul className="space-y-2">
        {regions.regions.map((item, index) => (
          <li
            key={index}
            onClick={(event) => {
              event.preventDefault();
              onSelect(true, item.region);
            }}
            className={`cursor-pointer px-4 py-2 rounded-lg transition duration-200 ${
              region === item.region
                ? "bg-blue-100 text-blue-700 font-semibold"
                : "hover:bg-gray-100 text-gray-800"
            }`}
          >
            {index + 1}. {item.region}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default RegionSelect;
