import React from "react";
import { useGetRegionsListQuery } from "@store/slices/productsApiSlice";
import { RegionsList } from "@store/type";
import { useTranslation } from "react-i18next";

interface RegionSelectProps {
  onSelect: (status: boolean, region: string) => void; // Callback function to send selected region
  region: string; // Currently selected region (optional)
}

const RegionSelect: React.FC<RegionSelectProps> = ({ onSelect, region }) => {
  const { data: regions_list, isLoading, error } = useGetRegionsListQuery({});
  const regions: RegionsList = regions_list as RegionsList;
  const { t, i18n } = useTranslation();

  if (isLoading) {
    return <div>{t("loading")}</div>;
  }
  if (error) {
    return <div>{t("error_message")}</div>;
  }

  return (
    <div>
      <h1>{t("regions_list")}</h1>
      <p>{t("select_region")}:</p>
      <ul>
        {regions.regions.map((item, index) => (
          <li
            key={index}
            onClick={(event) => {
              event.preventDefault();
              onSelect(true, item.region);
            }}
            style={{
              cursor: "pointer",
              color: region === item.region ? "blue" : "black",
            }}
          >
            {index + 1}: {item.region}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default RegionSelect;
