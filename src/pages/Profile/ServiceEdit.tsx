import React, { useEffect, useState } from "react";
import Modal from "../../components/Modal";

import { Category, SingleService } from "../../store/type";
import { toast } from "react-toastify";
import { useSelector } from "react-redux";
import { RootState } from "../../store";

import { BASE_URL } from "../../store/constants";
import "./ProductEdit.css";
import {
  useGetServiceCategoryListQuery,
  useGetSingleServiceQuery,
  useUpdateUserServiceMutation,
} from "../../store/slices/serviceApiSlice";
interface SingleServiceType {
  serviceId: string;
  closeModelStatus: boolean;
  onClose: () => void;
}

interface ExistingImage {
  id: number;
  image: string;
  fullUrl: string;
  isDeleted?: boolean;
}

const MyServiceEdit: React.FC<SingleServiceType> = ({
  serviceId,
  closeModelStatus,
  onClose,
}) => {
  const {
    data,
    isLoading: productLoading,
    error: productError,
    refetch: refetch_single_product,
  } = useGetSingleServiceQuery(serviceId);
  console.log(data);
  const {
    data: categoryData,
    isLoading: categoryLoading,
    error: categoryError,
  } = useGetServiceCategoryListQuery({});
  const [updateService, { isLoading: updateLoading }] =
    useUpdateUserServiceMutation();
  const userInfo = useSelector((state: RootState) => state.auth.userInfo);

  const singleService: SingleService = data as SingleService;
  const category_list = categoryData as Category[];

  const [name, setName] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [existingImages, setExistingImages] = useState<ExistingImage[]>([]);
  const [newImagePreviews, setNewImagePreviews] = useState<string[]>([]);
  const [newImageFiles, setNewImageFiles] = useState<File[]>([]);

  const [category, setCategory] = useState<string>("");
  const [isOpen, setIsOpen] = useState<boolean>(closeModelStatus);
  const [imageUploading, setImageUploading] = useState<boolean>(false);


  // Populate the form with existing product data
  useEffect(() => {
    if (singleService?.service) {
      setName(singleService.service.name || "");
      setDescription(singleService.service.description || "");

      // Find and set the category
      if (category_list && singleService.service.category) {
        const productCategory = category_list.find(
          (item: Category) => item.id === singleService.service.category.id
        );
        if (productCategory) {
          setCategory(productCategory.name);
        }
      }

      // Set existing images if available
      if (
        singleService.service.images &&
        singleService.service.images.length > 0
      ) {
        const images = singleService.service.images.map((image) => ({
          id: image.id || 0,
          image: image.image,
          fullUrl: `${BASE_URL}${image.image}`, // Fixed URL construction
          isDeleted: false,
        }));
        console.log("Loaded existing images:", images);
        setExistingImages(images);
      } else {
        // Clear existing images if there are none in the API response
        setExistingImages([]);
      }
    }
  }, [singleService, category_list]);

  const handleNewImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const totalImages =
      existingImages.filter((img) => !img.isDeleted).length +
      newImagePreviews.length +
      files.length;

    if (totalImages > 10) {
      toast.error("You can upload a maximum of 10 images");
      return;
    }

    setImageUploading(true);
    const previews: string[] = [];
    const fileArray: File[] = Array.from(files);

    // Validate file types and sizes
    const validFileTypes = [
      "image/jpeg",
      "image/png",
      "image/gif",
      "image/webp",
      "image/jpg",
    ];
    const maxFileSize = 5 * 1024 * 1024; // 5MB

    const invalidFiles = fileArray.filter(
      (file) => !validFileTypes.includes(file.type) || file.size > maxFileSize
    );

    if (invalidFiles.length > 0) {
      toast.error(
        "Some files were not added. Please use JPG, PNG, GIF or WebP files under 5MB."
      );
      // Filter out invalid files
      const validFiles = fileArray.filter(
        (file) => validFileTypes.includes(file.type) && file.size <= maxFileSize
      );

      if (validFiles.length === 0) {
        setImageUploading(false);
        return;
      }
    }

    // Using Promise.all to wait for all files to be read before updating state
    const fileReaderPromises = fileArray.map((file) => {
      return new Promise<void>((resolve) => {
        const reader = new FileReader();
        reader.onload = () => {
          previews.push(reader.result as string); // Store preview image result
          resolve(); // Resolve when the file is read
        };
        reader.readAsDataURL(file);
      });
    });

    // Once all files are read, update the state for previews and actual files
    Promise.all(fileReaderPromises)
      .then(() => {
        // Combine existing and new images
        const updatedNewImagePreviews = [...newImagePreviews, ...previews];
        const updatedNewImageFiles = [...newImageFiles, ...fileArray];

        // Set the new previews and new image files to the state
        setNewImagePreviews(updatedNewImagePreviews);
        setNewImageFiles(updatedNewImageFiles);
        setImageUploading(false);
      })
      .catch(() => {
        setImageUploading(false);
        toast.error("Error processing image files");
      });
  };

  // Confirm before removing existing image
  const handleRemoveExistingImage = (index: number) => {
    const confirmRemove = window.confirm(
      "Are you sure you want to remove this image?"
    );
    if (confirmRemove) {
      setExistingImages((prev) => {
        const updated = [...prev];
        updated[index] = { ...updated[index], isDeleted: true };
        return updated;
      });
    }
  };

  // Remove new image
  const handleRemoveNewImage = (index: number) => {
    setNewImagePreviews((prev) => prev.filter((_, i) => i !== index));
    setNewImageFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setCategory(e.target.value);
  };

  const closeHandler = () => {
    setIsOpen(false);
    onClose();
    setExistingImages([]);
    setNewImagePreviews([]);
    setNewImageFiles([]);
  };

  // Validate all required fields
  const validateForm = (): boolean => {
    if (!name.trim()) {
      toast.error("Title is required", { autoClose: 3000 });
      return false;
    }

    if (!description.trim()) {
      toast.error("Description is required", { autoClose: 3000 });
      return false;
    }

    // if (!price.trim()) {
    //   toast.error("Price is required", { autoClose: 3000 });
    //   return false;
    // }


    const hasExistingImages = existingImages.some((img) => !img.isDeleted);
    const hasNewImages = newImageFiles.length > 0;
    if (!hasExistingImages && !hasNewImages) {
      toast.error("At least one product image is required", {
        autoClose: 3000,
      });
      return false;
    }
    if (!category) {
      toast.error("Category is required", { autoClose: 3000 });
      return false;
    }
    return true;
  };

  const prepareFormData = (): FormData | null => {
    const formData = new FormData();
    formData.append("name", name);
    formData.append("description", description);
  
    // formData.append("currency", "Sum");
    // formData.append("in_stock", "true");

    // Price handling
    // const cleanedPrice = price.replace(/\./g, "");
    // formData.append("price", cleanedPrice);

    // Handle existing images - add IDs of images to keep
    const imagesToKeep = existingImages
      .filter((img) => !img.isDeleted)
      .map((img) => img.id);

    console.log(imagesToKeep)
  if (imagesToKeep.length > 0) {
    imagesToKeep.forEach((id) => {
      // Ensure we're sending a string representation of a number
      formData.append("existing_images", String(id));
    });
  }

    // Add new images
    if (newImageFiles.length > 0) {
      console.log("Adding new images:", newImageFiles.length);
      newImageFiles.forEach((file) => {
        formData.append("new_images", file);
      });
    }

    // Add location and user info
    if (!userInfo?.user_info?.location?.id) {
      toast.error("User location information is missing", { autoClose: 3000 });
      return null;
    }

    formData.append("location_id", userInfo.user_info.location.id);
    formData.append("userName_id", userInfo.user_info.id);
    formData.append("userAddress_id", userInfo.user_info.location.id);

    // Add category
    const selectedCategory = category_list.find(
      (item: Category) => item.name === category
    );
    if (selectedCategory) {
      const selectedCategoryId = selectedCategory.id;
      formData.append("category_id", selectedCategoryId.toString());
    } else {
      toast.error("Category not found, select the category first", {
        autoClose: 3000,
      });
      return null;
    }

    return formData;
  };

  const submitFormHandler = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Validate form
    if (!validateForm()) {
      return;
    }

    // Prepare form data
    const formData = prepareFormData();
    if (!formData) {
      return;
    }

    // Debug the form data being sent
    console.log("Form data being sent:");
    for (let pair of formData.entries()) {
      console.log(
        pair[0] + ": " + (typeof pair[1] === "string" ? pair[1] : "File")
      );
    }

    try {
      const token = userInfo?.token;
      const response = await updateService({
        id: serviceId,
        serviceData: formData,
        token,
      });

      if ("data" in response) {
        toast.success("Product updated successfully", { autoClose: 3000 });
        refetch_single_product();
        closeHandler();
      } else if ("error" in response) {
        // Handle specific error responses
        if (response.error?.data?.message) {
          toast.error(response.error.data.message, { autoClose: 3000 });
        } else {
          toast.error("Failed to update product", { autoClose: 3000 });
        }
      }
    } catch (error: unknown) {
      if (error instanceof Error) {
        toast.error(error.message || "Error while updating product", {
          autoClose: 3000,
        });
      } else {
        toast.error("An unknown error occurred while updating the product", {
          autoClose: 3000,
        });
      }
    }
  };

  if (productLoading || categoryLoading) {
    return <div className="loading">Loading...</div>;
  }

  if (productError || categoryError) {
    return <div className="error">Error loading data...</div>;
  }

  // Calculate total visible images for display
  const totalVisibleImages =
    existingImages.filter((img) => !img.isDeleted).length +
    newImagePreviews.length;

  return (
    <Modal onClose={closeHandler} isOpen={isOpen}>
      <div className="new-product">
        <h1 className="new-product-title">Edit Service</h1>
        <div className="new-product-container">
          <form className="new-product-form" onSubmit={submitFormHandler}>
            <div className="product-form-group">
              <label htmlFor="product-title">Service Title *</label>
              <input
                id="product-title"
                type="text"
                placeholder="Enter product title"
                required
                className="product-form-input"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div className="product-form-group">
              <label htmlFor="product-description">Service Description *</label>
              <textarea
                id="product-description"
                placeholder="Enter product description"
                required
                className="product-form-textarea"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              ></textarea>
            </div>

            {/* <div className="product-form-group">
              <label htmlFor="product-price">Product Price *</label>
              <input
                id="product-price"
                type="text"
                placeholder="Enter product price"
                required
                value={price}
                onChange={handlePriceChange}
                className="product-form-input"
              />
              <span>So'm</span>
            </div> */}

        

            <div className="product-form-group">
              <label htmlFor="product-category">Service Category *</label>
              <select
                id="product-category"
                required
                className="product-form-select"
                value={category}
                onChange={handleCategoryChange}
              >
                <option value="" disabled>
                  Select category
                </option>
                {categoryLoading ? (
                  <option>Loading...</option>
                ) : categoryError ? (
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

            <div className="product-form-group">
              <label>Service Images * ({totalVisibleImages}/10)</label>
              <div className="image-preview-container">
                {/* Existing Images */}
                {existingImages.map(
                  (image, index) =>
                    !image.isDeleted && (
                      <div key={`existing-${index}`} className="image-wrapper">
                        <img
                          src={image.fullUrl}
                          alt={`Existing ${index}`}
                          className="image-preview"
                        />
                        <button
                          type="button"
                          className="remove-image-button"
                          onClick={() => handleRemoveExistingImage(index)}
                        >
                          X
                        </button>
                      </div>
                    )
                )}

                {/* New Images */}
                {newImagePreviews.map((preview, index) => (
                  <div key={`new-${index}`} className="image-wrapper">
                    <img
                      src={preview}
                      alt={`New ${index}`}
                      className="image-preview"
                    />
                    <button
                      type="button"
                      className="remove-image-button"
                      onClick={() => handleRemoveNewImage(index)}
                    >
                      X
                    </button>
                  </div>
                ))}

                {/* Add more button */}
                {totalVisibleImages < 10 && (
                  <div
                    className="upload-more-wrapper"
                    onClick={() =>
                      document.getElementById("image-upload")?.click()
                    }
                  >
                    <span className="plus-icon">+</span>
                  </div>
                )}
                {imageUploading && (
                  <div className="image-loading-indicator">
                    <span>Uploading...</span>
                  </div>
                )}
              </div>
              <input
                id="image-upload"
                type="file"
                accept="image/jpeg,image/png,image/gif,image/webp"
                className="product-form-file"
                onChange={handleNewImageChange}
                multiple
                style={{ display: "none" }}
              />
              <small className="image-requirements">
                * At least one image is required. You can upload up to 10 images
                (JPG, PNG, GIF, WebP under 5MB each).
              </small>
            </div>

            <div className="product-form-group">
              <button
                type="submit"
                className="product-form-submit-button"
                disabled={updateLoading || imageUploading}
              >
                {updateLoading ? "Updating..." : "Update Service"}
              </button>
              <button
                type="button"
                className="product-form-cancel-button"
                onClick={closeHandler}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </Modal>
  );
};

export default MyServiceEdit;
