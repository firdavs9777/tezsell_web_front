import React, { useState } from "react";
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
  const [imageLength, setImageLength] = useState<number>(0);

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

  // Language switcher function
  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        {t("loading")}
      </div>
    );
  }

  if (create_loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        {t("creating")}
      </div>
    );
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
    const selectedCategory = category_list.find(
      (item: Category) => item.name === category
    );
    if (selectedCategory) {
      const selectedCategoryId = selectedCategory.id;
      formData.append("category_id", selectedCategoryId.toString());
    } else {
      console.log(t("categoryNotFound"));
    }
    try {
      const token = userInfo?.token;
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
      {/* Language selector */}

      <h1 className="text-3xl font-bold text-center text-gray-800 mb-8">
        {t("addNewService")}
      </h1>
      <div className="bg-white rounded-lg shadow-md p-6">
        <form className="space-y-6" onSubmit={submitFormHandler}>
          {/* Service Name */}
          <div className="space-y-2">
            <label
              htmlFor="service-title"
              className="block text-sm font-medium text-gray-700"
            >
              {t("serviceName")}
            </label>
            <input
              id="service-title"
              type="text"
              placeholder={t("serviceNamePlaceholder")}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
              {t("serviceDescription")}
            </label>
            <textarea
              id="service-description"
              placeholder={t("serviceDescriptionPlaceholder")}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 h-32"
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
              {t("serviceCategory")}
            </label>
            <select
              id="service-category"
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                  <option key={categoryItem.id} value={categoryItem.name}>
                    {categoryItem.name}
                  </option>
                ))
              )}
            </select>
          </div>

          {/* Service Images */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              {t("serviceImages")}{" "}
              {imagePreviews.length > 0
                ? `(${imagePreviews.length}/10)`
                : "(0/10)"}
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {imagePreviews.map((preview, index) => (
                <div
                  key={index}
                  className="relative h-24 bg-gray-100 rounded-md overflow-hidden"
                >
                  <img
                    src={preview}
                    alt={`Preview ${index}`}
                    className="w-full h-full object-cover"
                  />
                  <button
                    type="button"
                    className="absolute top-1 right-1 bg-red-500 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs hover:bg-red-600 focus:outline-none"
                    onClick={() => handleRemoveImage(index)}
                  >
                    X
                  </button>
                </div>
              ))}
              {imagePreviews.length < 10 && (
                <div
                  className="flex items-center justify-center h-24 bg-gray-100 border-2 border-dashed border-gray-300 rounded-md cursor-pointer hover:bg-gray-50"
                  onClick={() =>
                    document.getElementById("image-upload")?.click()
                  }
                >
                  <span className="text-2xl text-gray-500">+</span>
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
            <p className="text-xs text-gray-500 mt-1">
              {t("imageUploadHelper")}
            </p>
          </div>

          {/* Submit Button */}
          <div className="pt-4">
            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
            >
              {t("submit")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NewService;
