import React, { useState, useMemo } from "react";
import { Category } from "@store/type";
import { toast } from "react-toastify";
import { useSelector } from "react-redux";
import { RootState } from "@store/index";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  useCreateServiceMutation,
  useGetServiceCategoryListQuery,
} from "@store/slices/serviceApiSlice";

const NewService = () => {
  const { t, i18n } = useTranslation();
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




  const getCategoryName = (categoryItem: Category) => {
      const langKey = `name_${i18n.language}` as keyof Category;
      return categoryItem[langKey] || categoryItem.name_en || "";
    };
  
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    const totalImages = imagePreviews.length + files.length;
    if (totalImages > 10) {
      toast.error(t("maxImagesError"));
      return;
    }
    const previews: string[] = [];
    const fileArray: File[] = [];
    const readers: FileReader[] = [];

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

  // Loading states
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-center">
          <div className="animate-spin inline-block w-6 h-6 border-4 border-current border-t-transparent text-blue-600 rounded-full mb-2"></div>
          <p>{t("loading")}</p>
        </div>
      </div>
    );
  }

  if (create_loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-center">
          <div className="animate-spin inline-block w-6 h-6 border-4 border-current border-t-transparent text-green-600 rounded-full mb-2"></div>
          <p>{t("creating")}</p>
        </div>
      </div>
    );
  }

  const submitFormHandler = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Form validation
    if (!name.trim()) {
      toast.error(t("nameRequired"));
      return;
    }

    if (!description.trim()) {
      toast.error(t("descriptionRequired"));
      return;
    }

    if (!category) {
      toast.error(t("categoryRequired"));
      return;
    }

    const formData = new FormData();
    formData.append("name", name);
    formData.append("description", description);

    // Image handling
    imageFiles.forEach((file) => {
      formData.append("images", file);
    });

    // Add user info
    if (userInfo?.user_info?.location?.id) {
      formData.append("location_id", userInfo.user_info.location.id);
      formData.append("userAddress_id", userInfo.user_info.location.id);
    } else {
      toast.error(t("locationMissing"));
      return;
    }

    if (userInfo?.user_info?.id) {
      formData.append("userName_id", userInfo.user_info.id);
    } else {
      toast.error(t("userInfoMissing"));
      return;
    }

    const selectedCategory = category_list.find(
            (item: Category) => getCategoryName(item) === category
          );

    if (selectedCategory) {
              const selectedCategoryId = selectedCategory.id;
        formData.append("category_id", selectedCategoryId.toString());
    } else {
      toast.error(t("categoryNotFound"), {autoClose: 2000});
      return;
    }

    try {
      const token = userInfo?.token;
      if (!token) {
        toast.error(t("authRequired"));
        return;
      }

      const response = await createProduct({ productData: formData, token });

      if (response?.data) {
        toast.success(t("productCreatedSuccess"));
        navigate("/service");
      }
    } catch (error: unknown) {
      if (error instanceof Error) {
        toast.error(error.message || t("errorCreatingService"));
      } else {
        toast.error(t("unknownError"));
      }
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold text-center text-gray-800 mb-8">
        {t("addNewService")}
      </h1>

      <div className="bg-white rounded-lg shadow-lg p-6 border border-gray-100">
        <form className="space-y-6" onSubmit={submitFormHandler}>
          {/* Service Name */}
          <div className="space-y-2">
            <label
              htmlFor="service-title"
              className="block text-sm font-medium text-gray-700"
            >
              {t("serviceName")} <span className="text-red-500">*</span>
            </label>
            <input
              id="service-title"
              type="text"
              placeholder={t("serviceNamePlaceholder")}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          {/* Service Description */}
          <div className="space-y-2">
            <label
              htmlFor="service-description"
              className="block text-sm font-medium text-gray-700"
            >
              {t("serviceDescription")} <span className="text-red-500">*</span>
            </label>
            <textarea
              id="service-description"
              placeholder={t("serviceDescriptionPlaceholder")}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors h-32 resize-y"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          {/* Service Category */}
          <div className="space-y-2">
            <label
              htmlFor="service-category"
              className="block text-sm font-medium text-gray-700"
            >
              {t("serviceCategory")} <span className="text-red-500">*</span>
            </label>
            <select
              id="service-category"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              value={category}
              onChange={handleCategoryChange}
              required
            >
              <option value="" disabled>
                {t("selectCategory")}
              </option>
              {isLoading ? (
                <option>{t("loadingCategories")}</option>
              ) : error ? (
                <option>{t("errorLoadingCategories")}</option>
              ) : (
                 category_list.map((categoryItem) => (
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
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              {t("serviceImages")}{" "}
              <span
                className={
                  imagePreviews.length === 10 ? "text-red-500" : "text-gray-500"
                }
              >
                ({imagePreviews.length}/10)
              </span>
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {imagePreviews.map((preview, index) => (
                <div
                  key={index}
                  className="relative h-28 bg-gray-100 rounded-lg overflow-hidden shadow-sm border border-gray-200"
                >
                  <img
                    src={preview}
                    alt={`Preview ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                  <button
                    type="button"
                    className="absolute top-1 right-1 bg-red-500 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs hover:bg-red-600 focus:outline-none shadow-md transition-colors"
                    onClick={() => handleRemoveImage(index)}
                    aria-label={t("removeImage")}
                  >
                    ×
                  </button>
                </div>
              ))}
              {imagePreviews.length < 10 && (
                <div
                  className="flex flex-col items-center justify-center h-28 bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors"
                  onClick={() =>
                    document.getElementById("image-upload")?.click()
                  }
                >
                  <span className="text-3xl text-gray-400">+</span>
                  <span className="text-xs text-gray-500 mt-1">
                    {t("addImage")}
                  </span>
                </div>
              )}
            </div>
            <input
              id="image-upload"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleImageChange}
              multiple
            />
            <p className="text-xs text-gray-500 mt-2">
              {t("imageUploadHelper")}
            </p>
          </div>

          {/* Submit Button */}
          <div className="pt-6">
            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors shadow-md font-medium"
              disabled={create_loading}
            >
              {create_loading ? t("submitting") : t("submit")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NewService;
