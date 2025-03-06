import React, { useState } from "react";
import "./NewService.css";
import { Category } from "../../store/type";
import { toast } from "react-toastify";
import { useSelector } from "react-redux";
import { RootState } from "../../store";
import { useNavigate } from "react-router-dom";
import {
  useCreateServiceMutation,
  useGetServiceCategoryListQuery,
} from "../../store/slices/serviceApiSlice";

const NewService = () => {
  const navigate = useNavigate();
  const { data, isLoading, error } = useGetServiceCategoryListQuery({});
  const category_list = data as Category[];
  const [createProduct, { isLoading: create_loading }] =
    useCreateServiceMutation();
  const userInfo = useSelector((state: RootState) => state.auth.userInfo);
  const [name, setName] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [category, setCategory] = useState<string>("");
  const [imageLength, setImageLength] = useState<number>(0);
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    const totalImages = imagePreviews.length + files.length;
    if (totalImages > 10) {
      toast.error("You can upload a maximum of 10 images");
      return;
    }
    const previews: string[] = [];
    const fileArray: File[] = [];
    const readers: FileReader[] = [];
    setImageLength(files.length);
    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      readers.push(reader);
      fileArray.push(file);

      reader.onloadend = () => {
        previews.push(reader.result as string);

        // Once all files are read, update the state for previews and actual files
        if (previews.length === files.length) {
          setImagePreviews((prev) => [...prev, ...previews]); // Set previews for UI
          setImageFiles((prev) => [...prev, ...fileArray]); // Set files for form submission
        }
      };
      reader.readAsDataURL(file);
    });
  };
  const handleRemoveImage = (index: number) => {
    setImagePreviews((prev) => prev.filter((_, i) => i !== index));
    setImageFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setCategory(e.target.value);
  };

  if (isLoading) {
    return <div>Loading....</div>;
  }
  if (create_loading) {
    return <div>Creating....</div>;
  }
  const submitFormHandler = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("name", name);
    formData.append("description", description);

    // Image handling
    imageFiles.forEach((file) => {
      formData.append("images", file);
    });
    formData.append("location_id", userInfo.user_info.location.id);
    formData.append("userName_id", userInfo.user_info.id);
    formData.append("userAddress_id", userInfo?.user_info.location.id);
    alert(userInfo?.user_info.id);
    const selectedCategory = category_list.find(
      (item: Category) => item.name === category
    );
    if (selectedCategory) {
      const selectedCategoryId = selectedCategory.id;
      formData.append("category_id", selectedCategoryId.toString());
    } else {
      console.log("Category not found");
    }
    try {
      const token = userInfo?.token;
      const response = await createProduct({ productData: formData, token });

      if (response?.data) {
        toast.success("Product created successfully");
        navigate("/service");
      }
    } catch (error: unknown) {
      if (error instanceof Error) {
        toast.error(error.message || "Error while creating service");
      } else {
        toast.error("An unknown error occurred while creating the service");
      }
    }
  };
  return (
    <div className="new-service">
      <h1 className="new-service-title">Add New Service</h1>
      <div className="new-service-container">
        <form className="new-service-form" onSubmit={submitFormHandler}>
          {/* Form Fields */}
          <div className="service-form-group">
            <label htmlFor="service-title">Service Name *</label>
            <input
              id="service-title"
              type="text"
              placeholder="Enter service title"
              required
              className="service-form-input"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className="service-form-group">
            <label htmlFor="service-description">Service Description *</label>
            <textarea
              id="service-description"
              placeholder="Enter service description"
              required
              className="service-form-textarea"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            ></textarea>
          </div>

          <div className="service-form-group">
            <label htmlFor="service-category">Service Category*</label>
            <select
              id="service-category"
              className="service-form-select"
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

          <div className="service-form-group">
            <label>
              Service Images{" "}
              {imageLength > 0 ? `${imagePreviews.length}/10` : "0/10"}{" "}
            </label>
            <div className="image-preview-container">
              {imagePreviews.map((preview, index) => (
                <div key={index} className="image-wrapper">
                  <img
                    src={preview}
                    alt={`Preview ${index}`}
                    className="image-preview"
                  />
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
                onClick={() => document.getElementById("image-upload")?.click()}
              >
                <span className="plus-icon">+</span>
              </div>
            </div>
            <input
              id="image-upload"
              type="file"
              accept="image/*"
              className="service-form-file"
              onChange={handleImageChange}
              multiple
              style={{ display: "none" }}
            />
          </div>
          <div className="service-form-group">
            <button type="submit" className="service-form-submit-button">
              Submit
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NewService;
