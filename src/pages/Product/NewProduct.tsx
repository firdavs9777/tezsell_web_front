import React, { useState } from "react";
import './NewProduct.css';
import { useCreateProductMutation, useGetCategoryListQuery } from "../../store/slices/productsApiSlice";
import { Category } from "../../store/type";
import { toast } from "react-toastify";
import { useSelector } from "react-redux";
import { RootState } from "../../store";

const NewProduct = () => {
  const { data, isLoading, error } = useGetCategoryListQuery({});
  const category_list = data as Category[];
  const [createProduct, { isLoading: create_loading }] = useCreateProductMutation()
  const userInfo = useSelector((state: RootState) => state.auth.userInfo);

  const [title, setTitle] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [price, setPrice] = useState<string>('');
  const [condition, setCondition] = useState<string>('');
  const [category, setCategory] = useState<string>('');
  const [imageLength, setImageLength] = useState<number>(0)

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    const totalImages = imagePreviews.length + files.length;
    if (totalImages > 10) {
      toast.error("You can upload a maximum of 10 images");
      return
    }
    const previews: string[] = [];
    const readers: FileReader[] = [];


    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      setImageLength(files.length)
      const reader = new FileReader();
      readers.push(reader);

      reader.onloadend = () => {
        previews.push(reader.result as string);
        if (previews.length === files.length) {
          setImagePreviews((prev) => [...prev, ...previews]);
        }
      };
      reader.readAsDataURL(file);
    }
  };
  const handleRemoveImage = (index: number) => {
    setImagePreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setCategory(e.target.value);
  };

  const formatPrice = (value: string): string => {
    const numericValue = value.replace(/[^0-9]/g, '');
    const parts = numericValue.split('.');
    const integerPart = parts[0];
    const formattedInt = parseInt(integerPart || '0', 10)
      .toLocaleString('en-US')
      .replace(/,/g, '.');
    return formattedInt;
  };

  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {

    const rawValue = e.target.value;
    const formattedValue = formatPrice(rawValue);
    setPrice(formattedValue);
  };
  if (isLoading) {
    return <div>Loading....</div>
  }
  if (create_loading) {
    return <div>Creating....</div>
  }
  const submitFormHandler = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('title', title);
    formData.append('description', description);
    formData.append('condition', condition);
    formData.append('currency', 'Sum');
    formData.append('in_stock', 'true');
    // Price handling
    const cleanedPrice = price.replace(/\./g, '');
    formData.append('price', cleanedPrice)
    // Image handling
    imagePreviews.forEach((preview, index) => {
      const file = new File([preview], `image_${index}.jpg`, { type: "image/jpeg" });
      formData.append("images", file);
    });
    // Location Handling 
    formData.append('location_id', userInfo.user_info.location.id);
    formData.append('userName_id', userInfo.user_info.id);
    formData.append('userAddress_id', userInfo?.user_info.location.id);
    alert(userInfo?.user_info.id)
    const selectedCategory = category_list.find((item: Category) => item.name === category);
    if (selectedCategory) {
      const selectedCategoryId = selectedCategory.id;
      formData.append('category_id', selectedCategoryId.toString());
    } else {
      console.log('Category not found');
    }

    try {
        const token = userInfo?.token;

      const response = await createProduct({ productData: formData, token });
      if (response)
      {
        toast.success('Product created successfully')
      }
    }
    catch (error: any) {
          toast.error(error?.message || "Error while creating product");

    }
    // alert(title)
    // alert(description)
    // alert(price)
    // alert(category)
    // alert()
    // alert('Submit')
  }
  return (
    <div className="new-product">
      <h1 className="new-product-title">Add New Product</h1>
      <div className="new-product-container">
        <form className="new-product-form" onSubmit={submitFormHandler}>
          {/* Form Fields */}
          <div className="form-group">
            <label htmlFor="product-title">Product Title *</label>
            <input
              id="product-title"
              type="text"
              placeholder="Enter product title"
              required
              className="form-input"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label htmlFor="product-description">Product Description *</label>
            <textarea
              id="product-description"

              placeholder="Enter product description"
              required
              className="form-textarea"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            ></textarea>
          </div>

          <div className="form-group">
            <label htmlFor="product-price">Product Price *</label>
            <input
              id="product-price"
              type="text"
              placeholder="Enter product price"
              required
              value={price}
              onChange={handlePriceChange}
              className="form-input"
            />
            <span>So'm</span>
          </div>

          <div className="form-group">
            <label htmlFor="product-condition">Product Condition *</label>
            <select
              id="product-condition"
              required
              className="form-select"
              value={condition}
              onChange={(e) => setCondition(e.target.value)}
            >
              <option value="" disabled selected>
                Select condition
              </option>
              <option value="new">New</option>
              <option value="used">Used</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="product-category">Product Category</label>
            <select
              id="product-category"
              className="form-select"
              value={category}
              onChange={handleCategoryChange}
            >
              <option value="" disabled>
                Select category
              </option>
              {isLoading ? (
                <option>Loading...</option>
              ) : error ? (
                <option>Error loading categories</option>
              ) : (
                category_list.map((categoryItem) => (
                  <option key={categoryItem.id} value={categoryItem.name}>
                    {categoryItem.name}
                  </option>
                ))
              )}
            </select>
          </div>

          <div className="form-group">
            <label>Product Images {imageLength > 0 ? `${imagePreviews.length}/10` : '0/10'} </label>
            <div className="image-preview-container">
              {imagePreviews.map((preview, index) => (
                <div key={index} className="image-wrapper">
                  <img src={preview} alt={`Preview ${index}`} className="image-preview" />
                  <button
                    type="button"
                    className="remove-image-button"
                    onClick={() => handleRemoveImage(index)}
                  >
                    X
                  </button>
                </div>

              ))}
              <div
                className="upload-more-wrapper"
                onClick={() => document.getElementById('image-upload')?.click()}
              >
                <span className="plus-icon">+</span>
              </div>
            </div>
            <input
              id="image-upload"
              type="file"
              accept="image/*"
              className="form-file"
              onChange={handleImageChange}
              multiple
              style={{ display: "none" }}
            />
          </div>
          <div className="form-group">
            <button type="submit" className="form-submit-button">
              Submit
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NewProduct;
