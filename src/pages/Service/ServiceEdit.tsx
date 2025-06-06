import React, { useEffect, useState } from "react";
import Modal from "../../components/Modal";
import { Category, SingleService } from "@store/type";
import { toast } from "react-toastify";
import { useSelector } from "react-redux";
import { RootState } from "@store/index";
import { BASE_URL } from "@store/constants";
import {
  useGetServiceCategoryListQuery,
  useGetSingleServiceQuery,
  useUpdateUserServiceMutation,
} from "@store/slices/serviceApiSlice";
import { FaTrash, FaSpinner, FaTimes, FaEdit, FaImage } from "react-icons/fa";
import { useTranslation } from "react-i18next";

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

interface FormState {
  name: string;
  description: string;
  category: string;
  existingImages: ExistingImage[];
  newImagePreviews: string[];
  newImageFiles: File[];
}

const MyServiceEdit: React.FC<SingleServiceType> = ({
  serviceId,
  closeModelStatus,
  onClose,
}) => {
  const { t, i18n } = useTranslation();
  const userInfo = useSelector((state: RootState) => state.auth.userInfo);

  // API Hooks
  const {
    data,
    isLoading: productLoading,
    error: productError,
    refetch: refetchSingleProduct,
  } = useGetSingleServiceQuery(serviceId);

  const {
    data: categoryData,
    isLoading: categoryLoading,
    error: categoryError,
  } = useGetServiceCategoryListQuery({});

  const [updateService, { isLoading: updateLoading }] =
    useUpdateUserServiceMutation();

  // Component States
  const [form, setForm] = useState<FormState>({
    name: "",
    description: "",
    category: "",
    existingImages: [],
    newImagePreviews: [],
    newImageFiles: [],
  });
  const [isOpen, setIsOpen] = useState<boolean>(closeModelStatus);
  const [imageUploading, setImageUploading] = useState<boolean>(false);

  // Processed data
  const singleService: SingleService = data as SingleService;
  const categoryList = categoryData as Category[];

  // Populate the form with existing service data
  useEffect(() => {
    if (singleService?.service) {
      // Find and set the category
      let categoryName = "";
      if (categoryList && singleService.service.category) {
        const productCategory = categoryList.find(
          (item: Category) => item.id === singleService.service.category.id
        );
        if (productCategory) {
          categoryName = getCategoryName(productCategory);
        }
      }

      // Set existing images if available
      const images =
        singleService.service.images?.map((image) => ({
          id: image.id || 0,
          image: image.image,
          fullUrl: `${BASE_URL}${image.image}`,
          isDeleted: false,
        })) || [];

      setForm({
        name: singleService.service.name || "",
        description: singleService.service.description || "",
        category: categoryName,
        existingImages: images,
        newImagePreviews: [],
        newImageFiles: [],
      });
    }
  }, [singleService, categoryList]);

  // Helper function to get category name based on language
  const getCategoryName = (categoryItem: Category) => {
    const langKey = `name_${i18n.language}` as keyof Category;
    return (categoryItem[langKey] as string) || categoryItem.name_en;
  };

  // Input handlers
  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleNewImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const totalImages =
      form.existingImages.filter((img) => !img.isDeleted).length +
      form.newImagePreviews.length +
      files.length;

    if (totalImages > 10) {
      toast.error(t("maxImagesError"));
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
      toast.error(t("image_valid_type"));
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
        setForm((prev) => ({
          ...prev,
          newImagePreviews: [...prev.newImagePreviews, ...previews],
          newImageFiles: [...prev.newImageFiles, ...fileArray],
        }));
        setImageUploading(false);
      })
      .catch(() => {
        setImageUploading(false);
        toast.error(t("error_message"));
      });
  };

  // Handle image operations
  const handleRemoveExistingImage = (index: number) => {
    const confirmRemove = window.confirm(t("image_confirm_message"));
    if (confirmRemove) {
      setForm((prev) => {
        const updatedImages = [...prev.existingImages];
        updatedImages[index] = { ...updatedImages[index], isDeleted: true };
        return { ...prev, existingImages: updatedImages };
      });
    }
  };

  const handleRemoveNewImage = (index: number) => {
    setForm((prev) => ({
      ...prev,
      newImagePreviews: prev.newImagePreviews.filter((_, i) => i !== index),
      newImageFiles: prev.newImageFiles.filter((_, i) => i !== index),
    }));
  };

  // Modal handling
  const closeHandler = () => {
    setIsOpen(false);
    onClose();
  };

  // Form validation and submission
  const validateForm = (): boolean => {
    if (!form.name.trim()) {
      toast.error(t("title_required_message"), { autoClose: 3000 });
      return false;
    }

    if (!form.description.trim()) {
      toast.error(t("desc_required_message"), { autoClose: 3000 });
      return false;
    }

    const hasExistingImages = form.existingImages.some((img) => !img.isDeleted);
    const hasNewImages = form.newImageFiles.length > 0;
    if (!hasExistingImages && !hasNewImages) {
      toast.error(t("one_image_confirm_message"), { autoClose: 3000 });
      return false;
    }

    if (!form.category) {
      toast.error(t("category_required_message"), { autoClose: 3000 });
      return false;
    }

    return true;
  };

  const prepareFormData = (): FormData | null => {
    const formData = new FormData();
    formData.append("name", form.name);
    formData.append("description", form.description);

    // Handle existing images - add IDs of images to keep
    const imagesToKeep = form.existingImages
      .filter((img) => !img.isDeleted)
      .map((img) => img.id);

    if (imagesToKeep.length > 0) {
      imagesToKeep.forEach((id) => {
        formData.append("existing_images", id.toString());
      });
    }

    // Add new images
    if (form.newImageFiles.length > 0) {
      form.newImageFiles.forEach((file) => {
        formData.append("new_images", file);
      });
    }

    // Add location and user info
    if (!userInfo?.user_info?.location?.id) {
      toast.error(t("location_missing"), { autoClose: 3000 });
      return null;
    }

    formData.append("location_id", userInfo.user_info.location.id);
    formData.append("userName_id", userInfo.user_info.id);
    formData.append("userAddress_id", userInfo.user_info.location.id);

    // Add category
    const selectedCategory = categoryList?.find(
      (item: Category) => getCategoryName(item) === form.category
    );

    if (selectedCategory) {
      formData.append("category_id", selectedCategory.id.toString());
    } else {
      toast.error(t("categoryNotFound"), { autoClose: 3000 });
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

    try {
      const token = userInfo?.token;
      const response = await updateService({
        id: serviceId,
        serviceData: formData,
        token,
      });

      // Check response type
      if ("data" in response) {
        toast.success(t("service_update_succes"), { autoClose: 3000 });
        refetchSingleProduct();
        closeHandler();
      } else if ("error" in response) {
        const errorResponse = response.error as { data?: { message: string } };

        // Handle error responses
        if (errorResponse.data?.message) {
          toast.error(errorResponse.data.message, { autoClose: 3000 });
        } else {
          toast.error(t("service_update_error"), { autoClose: 3000 });
        }
      }
    } catch {
      toast.error(t("service_update_error"), { autoClose: 3000 });
    }
  };

  // Loading and error states
  if (productLoading || categoryLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center">
          <div className="animate-spin inline-block w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mb-2"></div>
          <p className="text-gray-600">{t("loading")}</p>
        </div>
      </div>
    );
  }

  if (productError || categoryError) {
    return (
      <div className="bg-red-100 p-4 rounded-lg text-red-700 text-center">
        {t("error_message")}
      </div>
    );
  }

  // Calculate total visible images for display
  const totalVisibleImages =
    form.existingImages.filter((img) => !img.isDeleted).length +
    form.newImagePreviews.length;

  return (
    <Modal onClose={closeHandler} isOpen={isOpen}>
      <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 to-purple-700 py-4 px-6">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-white flex items-center">
              <FaEdit className="mr-2" /> {t("edit_service_modal_title")}
            </h1>
            <button
              onClick={closeHandler}
              className="text-white hover:text-gray-200 transition-colors p-2 rounded-full hover:bg-white/10"
              aria-label="Close"
            >
              <FaTimes size={20} />
            </button>
          </div>
        </div>

        <div className="p-6">
          <form onSubmit={submitFormHandler} className="space-y-6">
            {/* Service Title */}
            <div>
              <label
                htmlFor="name"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                {t("serviceName")}{" "}
                <span className="text-red-500 text-lg">*</span>
              </label>
              <input
                id="name"
                name="name"
                type="text"
                placeholder={t("serviceNamePlaceholder")}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                value={form.name}
                onChange={handleInputChange}
              />
            </div>

            {/* Service Description */}
            <div>
              <label
                htmlFor="description"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                {t("serviceDescription")}{" "}
                <span className="text-red-500 text-lg">*</span>
              </label>
              <textarea
                id="description"
                name="description"
                placeholder={t("serviceDescriptionPlaceholder")}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors min-h-32 resize-y"
                value={form.description}
                onChange={handleInputChange}
              ></textarea>
              <div className="text-xs text-gray-500 mt-1 flex justify-end">
                {form.description.length}/500
              </div>
            </div>

            {/* Service Category */}
            <div>
              <label
                htmlFor="category"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                {t("serviceCategory")}{" "}
                <span className="text-red-500 text-lg">*</span>
              </label>
              <select
                id="category"
                name="category"
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-white"
                value={form.category}
                onChange={handleInputChange}
              >
                <option value="" disabled>
                  {t("serviceCategory")}
                </option>
                {categoryLoading ? (
                  <option>{t("loading")}</option>
                ) : categoryError ? (
                  <option>{t("errorLoadingCategories")}</option>
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

            {/* Service Images */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t("serviceImages")} <span className="text-red-500">*</span>
                <span className="ml-2 text-sm font-normal text-gray-500">
                  ({totalVisibleImages}/10)
                </span>
              </label>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 mb-2">
                {/* Existing Images */}
                {form.existingImages.map(
                  (image, index) =>
                    !image.isDeleted && (
                      <div
                        key={`existing-${index}`}
                        className="relative group h-24 rounded-lg overflow-hidden border border-gray-200 shadow-sm"
                      >
                        <img
                          src={image.fullUrl}
                          alt={`Existing ${index}`}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all duration-300 flex items-center justify-center">
                          <button
                            type="button"
                            className="opacity-0 group-hover:opacity-100 p-2 bg-red-500 text-white rounded-full transition-opacity duration-300 hover:bg-red-600"
                            onClick={() => handleRemoveExistingImage(index)}
                            aria-label="Remove image"
                          >
                            <FaTrash size={14} />
                          </button>
                        </div>
                      </div>
                    )
                )}

                {/* New Images */}
                {form.newImagePreviews.map((preview, index) => (
                  <div
                    key={`new-${index}`}
                    className="relative group h-24 rounded-lg overflow-hidden border border-gray-200 shadow-sm"
                  >
                    <img
                      src={preview}
                      alt={`New ${index}`}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all duration-300 flex items-center justify-center">
                      <button
                        type="button"
                        className="opacity-0 group-hover:opacity-100 p-2 bg-red-500 text-white rounded-full transition-opacity duration-300 hover:bg-red-600"
                        onClick={() => handleRemoveNewImage(index)}
                        aria-label="Remove image"
                      >
                        <FaTrash size={14} />
                      </button>
                    </div>
                  </div>
                ))}
                {totalVisibleImages < 10 && (
                  <div
                    className="h-24 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center cursor-pointer hover:border-blue-500 transition-colors hover:bg-blue-50"
                    onClick={() =>
                      document.getElementById("image-upload")?.click()
                    }
                  >
                    {imageUploading ? (
                      <FaSpinner
                        className="animate-spin text-blue-500"
                        size={20}
                      />
                    ) : (
                      <div className="flex flex-col items-center text-gray-500 hover:text-blue-500">
                        <FaImage size={20} />
                        <span className="text-xs mt-1">
                          {t("new_product_images")}
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </div>

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
            <div className="flex gap-4 pt-4">
              <button
                type="submit"
                disabled={updateLoading || imageUploading}
                className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3 px-4 rounded-lg font-medium flex items-center justify-center disabled:opacity-50 hover:from-blue-600 hover:to-purple-700 transition-all duration-300 shadow-md"
              >
                {updateLoading ? (
                  <>
                    <FaSpinner className="animate-spin mr-2" /> {t("updating")}
                  </>
                ) : (
                  t("upload_btn_label")
                )}
              </button>

              <button
                type="button"
                onClick={closeHandler}
                className="flex-1 bg-gray-100 text-gray-700 py-3 px-4 rounded-lg font-medium hover:bg-gray-200 transition-colors border border-gray-300"
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
export default MyServiceEdit;
