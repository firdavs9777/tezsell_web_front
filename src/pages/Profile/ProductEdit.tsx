import React, { useEffect, useState } from "react";
import Modal from "../../components/Modal";
import {
  useGetCategoryListQuery,
  useGetSingleProductQuery,
} from "../../store/slices/productsApiSlice";
import { Category, SingleProduct } from "../../store/type";
import Button from "../../components/Button";
import Text from "../../components/Text";
import Card from "../../components/Card";

interface SingleProductType {
  productId: string;
  closeModelStatus: boolean;
}

const MyProductEdit: React.FC<SingleProductType> = ({
  productId,
  closeModelStatus,
}) => {
  const {
    data,
    isLoading: productLoading,
    error: productError,
  } = useGetSingleProductQuery(productId);
  const {
    data: categoryData,
    isLoading: categoryLoading,
    error: categoryError,
  } = useGetCategoryListQuery({});

  const singleProduct: SingleProduct | undefined = data;
  const categoryList: Category[] = categoryData || [];

  const [newProdName, setNewProdName] = useState("");
  const [newProductDesc, setNewProdDesc] = useState("");
  const [newPrice, setNewPrice] = useState("");
  const [condition, setCondition] = useState("");
  const [category, setCategory] = useState("");
  const [closeModel, setCloseModel] = useState(closeModelStatus);

  useEffect(() => {
    if (singleProduct?.product) {
      setNewProdName(singleProduct?.product?.title || "");
      setNewProdDesc(singleProduct?.product?.description || "");
      setNewPrice(singleProduct?.product?.price || "");
      setCondition(singleProduct?.product?.condition || "");
      setCategory(singleProduct?.product?.category?.name || "");
    }
  }, [singleProduct]);

  const closeHandler = () => {
    setCloseModel(false);
  };

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setCategory(e.target.value);
  };

  const formatPrice = (value: string): string => {
    const numericValue = value.replace(/[^0-9]/g, "");
    return parseInt(numericValue || "0", 10)
      .toLocaleString("en-US")
      .replace(/,/g, ".");
  };

  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewPrice(formatPrice(e.target.value));
  };

  if (productLoading || categoryLoading) {
    return <div className="loading">Loading...</div>;
  }

  if (productError || categoryError) {
    return <div className="error">Error Occurred...</div>;
  }

  return (
    <Modal onClose={closeHandler} isOpen={closeModel}>
      <Text variant="title">Product Edit</Text>
      <form>
        <Text variant="body">Product Title</Text>

        <input
          type="text"
          value={newProdName}
          onChange={(e) => setNewProdName(e.target.value)}
        />
        <Text variant="body">Product Description</Text>
        <textarea
          className="product-form-textarea"
          value={newProductDesc}
          onChange={(e) => setNewProdDesc(e.target.value)}
        />

        <Text variant="body">Product Price</Text>
        <input type="text" value={newPrice} onChange={handlePriceChange} />

        <div className="product-form-group">
          <Text variant="body">Product Condition *</Text>
          <select
            id="product-condition"
            required
            className="product-form-select"
            value={condition}
            onChange={(e) => setCondition(e.target.value)}
          >
            <option value="" disabled>
              Select condition
            </option>
            <option value="new">New</option>
            <option value="used">Used</option>
          </select>
        </div>

        <div className="product-form-group">
          <label htmlFor="product-category">Product Category</label>
          <select
            id="product-category"
            className="product-form-select"
            value={category}
            onChange={handleCategoryChange}
          >
            <option value="" disabled>
              Select category
            </option>
            {categoryList.map((categoryItem) => (
              <option key={categoryItem.id} value={categoryItem.name}>
                {categoryItem.name}
              </option>
            ))}
          </select>
        </div>
        <Card>
          <Button type="submit" variant="upload" label="Update" />
          <Button
            type="button"
            variant="close"
            label="Close"
            onClick={closeHandler}
          />
        </Card>
      </form>
    </Modal>
  );
};

export default MyProductEdit;
