import React, { useEffect, useState } from "react";
import Modal from "../../components/Modal";
import { useGetSingleProductQuery } from "../../store/slices/productsApiSlice";
import { SingleProduct } from "../../store/type";

interface SingleProductType {
  productId: string;
  closeModelStatus: boolean;
}
const MyProductEdit: React.FC<SingleProductType> = ({
  productId,
  closeModelStatus,
}) => {
  const { data, isLoading, error, refetch } =
    useGetSingleProductQuery(productId);

  const singleProduct: SingleProduct = data as SingleProduct;

  const [newProdName, setNewProdName] = useState("");
  const [newProductDesc, setNewProdDesc] = useState("");
  useEffect(() => {
    setNewProdName(singleProduct?.product?.title);
    setNewProdDesc(singleProduct?.product?.description);
  }, [singleProduct]);
  const [closeModel, setCloseModel] = useState(closeModelStatus);

  const closeHandler = () => {
    setCloseModel(false);
  };
  if (isLoading) {
    return <div className="loading">Loading...</div>;
  }

  if (error) {
    return <div className="error">Error Occurred...</div>;
  }
  return (
    <Modal onClose={closeHandler} isOpen={closeModel}>
      <h1>Product Edit</h1>
      <form>
        <label htmlFor="">Product Title</label>
        <input
          type="text"
          value={newProdName}
          onChange={(e) => setNewProdName(e.target.value)}
        />
        <label htmlFor="">Product Description</label>
        <textarea
          className="product-form-textarea"
          value={newProductDesc}
          onChange={(e) => setNewProdDesc(e.target.value)}
        />
        <p>{productId}</p>
        <p>{newProdName}</p>
        <p>{newProductDesc}</p>
      </form>
    </Modal>
  );
};
export default MyProductEdit;
