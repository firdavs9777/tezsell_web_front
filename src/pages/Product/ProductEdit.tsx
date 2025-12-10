import Modal from "@components/Modal";

import { RootState } from "@store/index";
import {
  useGetCategoryListQuery,
  useGetSingleProductQuery,
} from "@store/slices/productsApiSlice";
import { useUpdateUserProductMutation } from "@store/slices/users";
import { Category, SingleProduct } from "@store/type";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";

interface SingleProductType {
  productId: string;
  closeModelStatus: boolean;
  onClose: () => void;
}

interface ExistingImage {
  id: number;
  image: string;
  fullUrl: string;
  isDeleted?: boolean;
}

const MyProductEdit: React.FC<SingleProductType> = ({
  productId,
  closeModelStatus,
  onClose,
}) => {
  const { t, i18n } = useTranslation();
  const userInfo = useSelector((state: RootState) => state.auth.userInfo);

  // API queries and mutations
  const {
    data: productData,
    isLoading: productLoading,
    error: productError,
    refetch: refetchSingleProduct,
  } = useGetSingleProductQuery(productId);

  const {
    data: categoryData,
    isLoading: categoryLoading,
    error: categoryError,
  } = useGetCategoryListQuery({});

  const [updateProduct, { isLoading: updateLoading }] =
    useUpdateUserProductMutation();

  // Typed data
  const singleProduct = productData as SingleProduct;
  const categoryList = categoryData as Category[];

  // Form state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [existingImages, setExistingImages] = useState<ExistingImage[]>([]);
  const [newImagePreviews, setNewImagePreviews] = useState<string[]>([]);
  const [newImageFiles, setNewImageFiles] = useState<File[]>([]);
  const [price, setPrice] = useState("");
  const [condition, setCondition] = useState("");
  const [category, setCategory] = useState("");
  const [isOpen, setIsOpen] = useState(closeModelStatus);
  const [imageUploading, setImageUploading] = useState(false);

  // Initialize form with product data
  useEffect(() => {
    if (singleProduct?.product) {
      setTitle(singleProduct.product.title || "");
      setDescription(singleProduct.product.description || "");
      setPrice(formatPrice(singleProduct.product.price?.toString() || ""));
      setCondition(singleProduct.product.condition || "");

      // Set category
      if (categoryList && singleProduct.product.category) {
        const productCategory = categoryList.find(
          (item: Category) => item.id === singleProduct.product.category.id
        );
        if (productCategory) {
          setCategory(getCategoryName(productCategory));
        }
      }

      // Set images
      if (singleProduct.product.images?.length > 0) {
        setExistingImages(
          singleProduct.product.images.map((image) => ({
            id: image.id || 11,
            image: image.image,
            fullUrl: `${image.image}`,
            isDeleted: false,
          }))
        );
      } else {
        setExistingImages([]);
      }
    }
  }, [singleProduct, categoryList]);

  // Format price with dots as thousand separators
  const formatPrice = (value: string): string => {
    const numericValue = value.replace(/[^0-9]/g, "");
    return parseInt(numericValue || "0", 10)
      .toLocaleString("en-US")
      .replace(/,/g, ".");
  };

  // Handle new image selection
  const handleNewImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const totalImages =
      existingImages.filter((img) => !img.isDeleted).length +
      newImagePreviews.length +
      files.length;

    if (totalImages > 10) {
      toast.error(t("maxImagesError"), { autoClose: 2000 });
      return;
    }

    setImageUploading(true);
    const previews: string[] = [];
    const fileArray: File[] = Array.from(files);

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
      toast.error(t("image_valid_type"), { autoClose: 2000 });

      // Filter out invalid files
      const validFiles = fileArray.filter(
        (file) => validFileTypes.includes(file.type) && file.size <= maxFileSize
      );

      if (validFiles.length === 0) {
        setImageUploading(false);
        return;
      }
    }

    // Process files with Promise.all
    const fileReaderPromises = fileArray.map((file) => {
      return new Promise<void>((resolve) => {
        const reader = new FileReader();
        reader.onload = () => {
          previews.push(reader.result as string);
          resolve();
        };
        reader.readAsDataURL(file);
      });
    });

    Promise.all(fileReaderPromises)
      .then(() => {
        setNewImagePreviews([...newImagePreviews, ...previews]);
        setNewImageFiles([...newImageFiles, ...fileArray]);
        setImageUploading(false);
      })
      .catch(() => {
        setImageUploading(false);
        toast.error(t("error_message"));
      });
  };

  // Remove existing image
  const handleRemoveExistingImage = (index: number) => {
    const confirmRemove = window.confirm(t("image_confirm_message"));
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

  // Handle form input changes
  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setCategory(e.target.value);
  };

  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPrice(formatPrice(e.target.value));
  };

  // Close modal and reset form
  const closeHandler = () => {
    setIsOpen(false);
    onClose();
    setExistingImages([]);
    setNewImagePreviews([]);
    setNewImageFiles([]);
  };

  // Form validation
  const validateForm = (): boolean => {
    if (!title.trim()) {
      toast.error(t("title_required_message"), { autoClose: 3000 });
      return false;
    }

    if (!description.trim()) {
      toast.error(t("desc_required_message"), { autoClose: 3000 });
      return false;
    }

    if (!price.trim()) {
      toast.error(t("price_required_message"), { autoClose: 3000 });
      return false;
    }

    if (!condition) {
      toast.error(t("condition_required_message"), { autoClose: 3000 });
      return false;
    }

    // Check if at least one image exists
    const hasExistingImages = existingImages.some((img) => !img.isDeleted);
    const hasNewImages = newImageFiles.length > 0;

    if (!hasExistingImages && !hasNewImages) {
      toast.error(t("at_least_one_image_required"), { autoClose: 3000 });
      return false;
    }

    if (!category) {
      toast.error(t("category_required_message"), { autoClose: 3000 });
      return false;
    }

    return true;
  };

  // Prepare FormData for API submission
  const prepareFormData = (): FormData | null => {
    const formData = new FormData();
    formData.append("title", title);
    formData.append("description", description);
    formData.append("condition", condition);
    formData.append("currency", "Sum");
    formData.append("in_stock", "true");

    // Price handling - remove dots
    const cleanedPrice = price.replace(/\./g, "");
    formData.append("price", cleanedPrice);

    // Handle existing images - add IDs of images to keep
    const imagesToKeep = existingImages
      .filter((img) => !img.isDeleted)
      .map((img) => img.id);

    imagesToKeep.forEach((id) => {
      formData.append("existing_images", id.toString());
    });

    // Add new images
    newImageFiles.forEach((file) => {
      formData.append("new_images", file);
    });

    // Add location and user info
    if (!userInfo?.user_info?.location?.id) {
      toast.error(t("location_info_error"), { autoClose: 3000 });
      return null;
    }

    formData.append("location_id", userInfo.user_info.location.id.toString());
    formData.append("userName_id", userInfo.user_info.id.toString());
    formData.append(
      "userAddress_id",
      userInfo.user_info.location.id.toString()
    );

    // Add category
    const selectedCategory = categoryList?.find(
      (item: Category) => getCategoryName(item) === category
    );

    if (selectedCategory) {
      const selectedCategoryId = selectedCategory.id;
      formData.append("category_id", selectedCategoryId.toString());
    } else {
      toast.error(t("category_required_message"), { autoClose: 3000 });
      return null;
    }

    return formData;
  };

  // Form submission handler
  const submitFormHandler = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    const formData = prepareFormData();
    if (!formData) {
      return;
    }

    try {
      const token = userInfo?.token;
      const response = await updateProduct({
        id: productId,
        productData: formData,
        token,
      });

      if ("data" in response) {
        toast.success(t("product_updated_success"), { autoClose: 3000 });
        refetchSingleProduct();
        closeHandler();
      } else if ("error" in response) {
        toast.error(t("product_update_failed"), { autoClose: 3000 });
      }
    } catch (error: unknown) {
      if (error instanceof Error) {
        toast.error(error.message || t("error_updating_product"), {
          autoClose: 3000,
        });
      } else {
        toast.error(t("unknown_error"), { autoClose: 3000 });
      }
    }
  };

  // Helper function to get localized category name
  const getCategoryName = (categoryItem: Category) => {
    const langKey = `name_${i18n.language}` as keyof Category;
    return categoryItem[langKey] as string;
  };

  // Loading and error states
  if (productLoading || categoryLoading) {
    return (
      <div className="flex justify-center items-center p-8 text-lg font-medium text-gray-600">
        {t("loading.loading")}
      </div>
    );
  }

  if (productError || categoryError) {
    return (
      <div className="flex justify-center items-center p-8 text-lg font-medium text-red-600">
        {t("error_message")}
      </div>
    );
  }

  // Calculate total visible images
  const totalVisibleImages =
    existingImages.filter((img) => !img.isDeleted).length +
    newImagePreviews.length;

  return (
    <Modal onClose={closeHandler} isOpen={isOpen}>
      <div className="w-full max-w-4xl mx-auto bg-white rounded-lg">
        <h1 className="text-2xl font-bold text-center text-gray-800 mb-6 pt-4">
          {t("edit_product_title")}
        </h1>

        <div className="px-6 pb-6">
          <form className="space-y-6" onSubmit={submitFormHandler}>
            {/* Title Input */}
            <div className="space-y-2">
              <label
                htmlFor="product-title"
                className="block text-gray-700 font-medium"
              >
                {t("new_product_title")}
                <span className="text-red-500 text-lg font-bold ml-1">*</span>
              </label>
              <input
                id="product-title"
                type="text"
                placeholder={t("enter_product_title")}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>

            {/* Description Input */}
            <div className="space-y-2">
              <label
                htmlFor="product-description"
                className="block text-gray-700 font-medium"
              >
                {t("new_product_description")}
                <span className="text-red-500 text-lg font-bold ml-1">*</span>
              </label>
              <textarea
                id="product-description"
                placeholder={t("enter_product_description")}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-32"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              ></textarea>
            </div>

            {/* Price Input */}
            <div className="space-y-2">
              <label
                htmlFor="product-price"
                className="block text-gray-700 font-medium"
              >
                {t("new_product_price")}
                <span className="text-red-500 text-lg font-bold ml-1">*</span>
              </label>
              <div className="flex items-center">
                <input
                  id="product-price"
                  type="text"
                  placeholder={t("enter_product_price")}
                  required
                  value={price}
                  onChange={handlePriceChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <span className="bg-gray-100 px-4 py-2 border border-l-0 border-gray-300 rounded-r-md text-gray-700 font-medium">
                  {t("sum")}
                </span>
              </div>
            </div>

            {/* Condition Dropdown */}
            <div className="space-y-2">
              <label
                htmlFor="product-condition"
                className="block text-gray-700 font-medium"
              >
                {t("new_product_condition")}
                <span className="text-red-500 text-lg font-bold ml-1">*</span>
              </label>
              <select
                id="product-condition"
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                value={condition}
                onChange={(e) => setCondition(e.target.value)}
              >
                <option value="" disabled>
                  {t("select_condition")}
                </option>
                <option value="new">{t("new")}</option>
                <option value="used">{t("used")}</option>
              </select>
            </div>

            {/* Category Dropdown */}
            <div className="space-y-2">
              <label
                htmlFor="product-category"
                className="block text-gray-700 font-medium"
              >
                {t("new_product_category")}
                <span className="text-red-500 text-lg font-bold ml-1">*</span>
              </label>
              <select
                id="product-category"
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                value={category}
                onChange={handleCategoryChange}
              >
                <option value="" disabled>
                  {t("select_category")}
                </option>
                {categoryLoading ? (
                  <option>{t("loading.loading")}</option>
                ) : categoryError ? (
                  <option>{t("error_loading_categories")}</option>
                ) : (
                  categoryList?.map((categoryItem) => (
                    <option
                      key={categoryItem.id}
                      value={getCategoryName(categoryItem)}
                    >
                      {getCategoryName(categoryItem)}
                    </option>
                  ))
                )}
              </select>
            </div>

            {/* Images Section */}
            <div className="space-y-2">
              <label className="block text-gray-700 font-medium">
                {t("new_product_images")} ({totalVisibleImages}/10)
                <span className="text-red-500 text-lg font-bold ml-1">*</span>
              </label>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
                {/* Existing Images */}
                {existingImages.map(
                  (image, index) =>
                    !image.isDeleted && (
                      <div
                        key={`existing-${index}`}
                        className="relative h-24 rounded-md overflow-hidden border border-gray-300"
                      >
                        <img
                          src={image.fullUrl}
                          alt={`Product ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                        <button
                          type="button"
                          className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm hover:bg-red-600 focus:outline-none"
                          onClick={() => handleRemoveExistingImage(index)}
                        >
                          ×
                        </button>
                      </div>
                    )
                )}

                {/* New Images */}
                {newImagePreviews.map((preview, index) => (
                  <div
                    key={`new-${index}`}
                    className="relative h-24 rounded-md overflow-hidden border border-gray-300"
                  >
                    <img
                      src={preview}
                      alt={`New ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm hover:bg-red-600 focus:outline-none"
                      onClick={() => handleRemoveNewImage(index)}
                    >
                      ×
                    </button>
                  </div>
                ))}

                {/* Add more button */}
                {totalVisibleImages < 10 && (
                  <div
                    className="h-24 border-2 border-dashed border-gray-300 rounded-md flex items-center justify-center cursor-pointer hover:border-blue-500 transition-colors"
                    onClick={() =>
                      document.getElementById("image-upload")?.click()
                    }
                  >
                    <span className="text-3xl text-gray-400">+</span>
                  </div>
                )}
              </div>

              {/* Loading indicator for images */}
              {imageUploading && (
                <div className="text-center py-2 text-blue-600">
                  <span>{t("load")}</span>
                </div>
              )}

              <input
                id="image-upload"
                type="file"
                accept="image/jpeg,image/png,image/gif,image/webp"
                onChange={handleNewImageChange}
                multiple
                className="hidden"
              />

              <p className="text-xs text-gray-500 mt-1">
                {t("image_upload_requirements")}
              </p>
            </div>

            {/* Form Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <button
                type="submit"
                className="w-full sm:w-1/2 bg-blue-600 text-white py-3 rounded-md font-medium hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-blue-300"
                disabled={updateLoading || imageUploading}
              >
                {updateLoading ? t("updating") : t("upload_btn_label")}
              </button>
              <button
                type="button"
                className="w-full sm:w-1/2 bg-gray-200 text-gray-800 py-3 rounded-md font-medium hover:bg-gray-300 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-400"
                onClick={closeHandler}
              >
                {t("cancel_btn_label")}
              </button>
            </div>
          </form>
        </div>
      </div>
    </Modal>
  );
};

export default MyProductEdit;
