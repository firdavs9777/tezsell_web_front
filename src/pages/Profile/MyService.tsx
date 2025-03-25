import { Service } from "../../store/type";
import React from "react";


interface SingleServiceProps {
  service: Service;
  refresh: () => void;
}

const MyService : React.FC<SingleServiceProps> = ({service, refresh}) => {
  return (
    <div>
      <h1>My Service</h1>
    </div>
  )
}

export default MyService