import React from "react";
import { useGetRegionsListQuery } from "../../../../store/slices/productsApiSlice";
import { RegionsList } from "../../../../store/type";

interface RegionSelectProps {
  onSelect: (status: boolean,region: string) => void; // Callback function to send selected region
  region: string; // Currently selected region (optional)
}

const RegionSelect: React.FC<RegionSelectProps> = ({ onSelect, region }) => {
  const { data: regions_list, isLoading, error } = useGetRegionsListQuery({});
  const regions: RegionsList = regions_list as RegionsList;

  if (isLoading) {
    return <div>It is loading ...</div>;
  }
  if (error) {
    return <div>Error Occurred</div>;
  }

  return (
    <div>
      <h1>Regions List</h1>
      <p>Select a Region:</p>
      <ul>
        {regions.regions.map((item, index) => (
          <li key={index} onClick={(event) => {
            event.preventDefault();
            onSelect(true, item.region)
          }} style={{ cursor: "pointer", color: region === item.region ? "blue" : "black" }}>
            {item.region}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default RegionSelect;
