import { RootState } from "@store/index";
import {
  useCreateProductMutation,
  useGetCategoryListQuery,
} from "@store/slices/productsApiSlice";
import { Category } from "@store/type";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { FaTimes } from "react-icons/fa";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

const NewProduct = () => {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const { data, isLoading, error } = useGetCategoryListQuery({});
  const category_list = data as Category[];
  const [createProduct, { isLoading: create_loading }] =
    useCreateProductMutation();
  const userInfo = useSelector((state: RootState) => state.auth.userInfo);

  // Form state
  const [title, setTitle] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [price, setPrice] = useState<string>("");
  const [condition, setCondition] = useState<string>("");
  const [category, setCategory] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

      useEffect(() => {
      window.scrollTo(0, 0);
    }, []);
  // Helper function to get the correct category name based on current language
  const getCategoryName = (categoryItem: Category) => {
    const langKey = `name_${i18n.language}` as keyof Category;
    return categoryItem[langKey] || categoryItem.name_en || "";
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const totalImages = imagePreviews.length + files.length;
    if (totalImages > 10) {
      toast.error(t("maxImagesError"), { autoClose: 2000 });
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

  const formatPrice = (value: string): string => {
    const numericValue = value.replace(/[^0-9]/g, "");
    const parts = numericValue.split(".");
    const integerPart = parts[0];
    const formattedInt = parseInt(integerPart || "0", 10)
      .toLocaleString("en-US")
      .replace(/,/g, ".");
    return formattedInt;
  };

  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value;
    const formattedValue = formatPrice(rawValue);
    setPrice(formattedValue);
  };

 const submitFormHandler = async (e: React.FormEvent<HTMLFormElement>) => {
  e.preventDefault();

  if (isSubmitting) return;
  setIsSubmitting(true);

  try {
    // Validate required fields
    if (
      !title ||
      !description ||
      !price ||
      !condition ||
      imageFiles.length === 0
    ) {
      toast.error(t("please_fill_all_required_fields"), { autoClose: 3000 });
      setIsSubmitting(false);
      return;
    }

    // Validate user authentication and data
    if (!userInfo?.user_info?.location?.id || !userInfo?.user_info?.id) {
      toast.error(t("user_info_missing"), { autoClose: 3000 });
      setIsSubmitting(false);
      return;
    }

    const formData = new FormData();
    formData.append("title", title);
    formData.append("description", description);
    formData.append("condition", condition);
    formData.append("currency", "Sum");
    formData.append("in_stock", "true");

    const cleanedPrice = price.replace(/\./g, "");
    formData.append("price", cleanedPrice);

    imageFiles.forEach((file) => {
      formData.append("images", file);
    });

    // Now safe to access these properties with proper null checks
    formData.append("location_id", userInfo.user_info.location.id.toString());
    formData.append("userName_id", userInfo.user_info.id.toString());
    formData.append("userAddress_id", userInfo.user_info.location.id.toString());

    // Find the selected category ID by name
    const selectedCategory = category_list?.find(
      (item: Category) => getCategoryName(item) === category
    );

    if (selectedCategory) {
      const selectedCategoryId = selectedCategory.id;
      formData.append("category_id", selectedCategoryId.toString());
    } else {
      toast.error(t("categoryNotFound"), { autoClose: 3000 });
      setIsSubmitting(false);
      return;
    }

    const token = userInfo?.token;
    if (!token) {
      toast.error(t("authentication_required"), { autoClose: 3000 });
      setIsSubmitting(false);
      return;
    }

    const response = await createProduct({ productData: formData, token });

    if (response.data) {
      toast.success(t("productCreatedSuccess"), { autoClose: 2000 });
      navigate("/");
    }
  } catch (error: unknown) {
    if (error instanceof Error) {
      toast.error(t("errorCreatingProduct"), { autoClose: 2000 });
    } else {
      toast.error(t("unknown_error_message"), { autoClose: 2000 });
    }
  } finally {
    setIsSubmitting(false);
  }
};

  if (isLoading || create_loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        <p className="ml-2">{t("loading")}</p>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 p-4 md:p-8 lg:p-12 min-h-screen">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-2xl md:text-3xl font-semibold text-center mb-6">
          {t("add_new_product_btn")}
        </h1>

        <div className="bg-white p-4 md:p-6 rounded-lg shadow-lg">
          <form className="space-y-6" onSubmit={submitFormHandler}>
            {/* Product Title */}
            <div className="flex flex-col space-y-2">
              <label htmlFor="product-title" className="font-medium">
                {t("new_product_title")}{" "}
                <span className="text-red-500 text-lg font-bold">*</span>
              </label>
              <input
                id="product-title"
                type="text"
                placeholder={t("new_product_title")}
                required
                className="border p-2 md:p-3 rounded-md focus:ring-2 focus:ring-blue-400 focus:outline-none"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>

            {/* Product Description */}
            <div className="flex flex-col space-y-2">
              <label htmlFor="product-description" className="font-medium">
                {t("new_product_description")}{" "}
                <span className="text-red-500 text-lg font-bold">*</span>
              </label>
              <textarea
                id="product-description"
                placeholder={t("new_product_description")}
                required
                rows={4}
                className="border p-2 md:p-3 rounded-md resize-none focus:ring-2 focus:ring-blue-400 focus:outline-none"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            {/* Product Price */}
            <div className="flex flex-col space-y-2">
              <label htmlFor="product-price" className="font-medium">
                {t("new_product_price")}{" "}
                <span className="text-red-500 text-lg font-bold">*</span>
              </label>
              <div className="flex items-center space-x-2">
                <input
                  id="product-price"
                  type="text"
                  placeholder={t("new_product_price")}
                  required
                  value={price}
                  onChange={handlePriceChange}
                  className="border p-2 md:p-3 rounded-md w-full focus:ring-2 focus:ring-blue-400 focus:outline-none"
                />
                <span className="whitespace-nowrap font-medium">
                  {t("sum")}
                </span>
              </div>
            </div>

            {/* Product Condition */}
            <div className="flex flex-col space-y-2">
              <label htmlFor="product-condition" className="font-medium">
                {t("new_product_condition")}
                <span className="text-red-500 text-lg font-bold ml-1">*</span>
              </label>
              <select
                id="product-condition"
                required
                className="border p-2 md:p-3 rounded-md focus:ring-2 focus:ring-blue-400 focus:outline-none"
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

            {/* Product Category */}
            <div className="flex flex-col space-y-2">
              <label htmlFor="product-category" className="font-medium">
                {t("new_product_category")}
                <span className="text-red-500 text-lg font-bold ml-1">*</span>
              </label>
              <select
                id="product-category"
                required
                className="border p-2 md:p-3 rounded-md focus:ring-2 focus:ring-blue-400 focus:outline-none"
                value={category}
                onChange={handleCategoryChange}
              >
                <option value="" disabled>
                  {t("select_category")}
                </option>
                {isLoading ? (
                  <option>{t("loading")}</option>
                ) : error ? (
                  <option>{t("error_loading_categories")}</option>
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

            {/* Product Images */}
            <div className="flex flex-col space-y-2">
              <label className="font-medium">
                {t("new_product_images")}{" "}
                <span className="text-gray-500">
                  ({imagePreviews.length}/10)
                </span>
                <span className="text-red-500 text-lg font-bold ml-1">*</span>
              </label>

              {imagePreviews.length > 0 && (
                <div className="flex flex-wrap gap-3 mt-2">
                  {imagePreviews.map((preview, index) => (
                    <div
                      key={index}
                      className="relative w-24 h-24 border rounded-md overflow-hidden"
                    >
                      <img
                        src={preview}
                        alt={`Preview ${index + 1}`}
                        className="object-cover w-full h-full"
                      />
                      <button
                        type="button"
                        className="absolute top-1 right-1 bg-black bg-opacity-60 text-white rounded-full w-6 h-6 flex items-center justify-center"
                        onClick={() => handleRemoveImage(index)}
                        aria-label={t("remove_image")}
                      >
                        <FaTimes size={12} />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <div
                className="cursor-pointer text-center py-6 px-4 border-2 border-dashed border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                onClick={() => document.getElementById("image-upload")?.click()}
              >
                <span className="text-2xl block mb-1">+</span>
                <span className="text-gray-500">{t("click_to_upload")}</span>
              </div>

              <input
                id="image-upload"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleImageChange}
                multiple
              />
            </div>

            {/* Form Actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
              <button
                type="button"
                onClick={() => navigate("/")}
                className="px-6 py-3 bg-gray-200 hover:bg-gray-300 rounded-md transition-colors text-gray-800 font-medium"
              >
                {t("cancel_btn_label")}
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className={`px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-md transition-colors font-medium ${
                  isSubmitting ? "opacity-70 cursor-not-allowed" : ""
                }`}
              >
                {isSubmitting ? t("submitting") : t("submit")}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default NewProduct;
