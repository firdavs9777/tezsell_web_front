import { useGetDistrictsListQuery } from "../../../../store/slices/productsApiSlice";
import { DistrictsList } from "../../../../store/type";

interface DistrictProps {
  regionName: string; 
  district: string;
  onSelect: (district: string) => void;  
}

const DistrictSelect: React.FC<DistrictProps> = ({ regionName, district, onSelect }) => {
  const { data: districtsList, isLoading, error } = useGetDistrictsListQuery(regionName);
  const districts: DistrictsList = districtsList as DistrictsList;

  if (isLoading) {
    return <div>It is loading ...</div>;
  }
  if (error) {
    return <div>Error Occurred</div>;
  }

  return (
    <div>
      <h1>District List</h1>
      <p>Select a district:</p>
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
          {item.district}
        </p>
      ))}
    </div>
  );
};

export default DistrictSelect;
