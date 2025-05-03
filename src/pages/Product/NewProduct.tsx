import React, { useState } from "react";
import {
  useCreateProductMutation,
  useGetCategoryListQuery,
} from "@store/slices/productsApiSlice";
import { Category } from "@store/type";
import { toast } from "react-toastify";
import { useSelector } from "react-redux";
import { RootState } from "@store/index";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

const NewProduct = () => {
  const navigate = useNavigate();
  const { data, isLoading, error } = useGetCategoryListQuery({});
  const category_list = data as Category[];
  const [createProduct, { isLoading: create_loading }] =
    useCreateProductMutation();
  const userInfo = useSelector((state: RootState) => state.auth.userInfo);
  const [title, setTitle] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [price, setPrice] = useState<string>("");
  const [condition, setCondition] = useState<string>("");
  const [category, setCategory] = useState<string>("");
  const [imageLength, setImageLength] = useState<number>(0);
  const { t } = useTranslation();

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

  if (isLoading) {
    return <div>{t("loading")}</div>;
  }

  if (create_loading) {
    return <div>{t("loading")}</div>;
  }

  const submitFormHandler = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
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
      toast.error(t("categoryNotFound"), {
        autoClose: 3000,
      });
    }

    try {
      const token = userInfo?.token;
      const response = await createProduct({ productData: formData, token });
      if (response.data) {
        toast.success(t("productCreatedSuccess"), { autoClose: 2000 });
        navigate("/");
      }
    } catch (error: unknown) {
      if (error instanceof Error) {
        toast.error(t("errorCreatingProduct"), {
          autoClose: 2000,
        });
      } else {
        toast.error(t("unknown_error_message"), {
          autoClose: 2000,
        });
      }
    }
  };

  return (
    <div className="bg-gray-50 p-6 md:p-8 lg:p-12">
      <h1 className="text-3xl font-semibold text-center mb-6">
        {t("add_new_product_btn")}
      </h1>
      <div className="max-w-3xl mx-auto bg-white p-6 rounded-lg shadow-lg">
        <form className="space-y-6" onSubmit={submitFormHandler}>
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
              className="border p-2 rounded-md"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div className="flex flex-col space-y-2">
            <label htmlFor="product-description" className="font-medium">
              {t("new_product_description")}{" "}
              <span className="text-red-500 text-lg font-bold">*</span>
            </label>
            <textarea
              id="product-description"
              placeholder={t("new_product_description")}
              required
              className="border p-2 rounded-md"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

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
                className="border p-2 rounded-md w-full"
              />
              <span>{t("sum")}</span>
            </div>
          </div>

          <div className="flex flex-col space-y-2">
            <label htmlFor="product-condition" className="font-medium">
              {t("new_product_condition")}
              <span className="text-red-500 text-lg font-bold p-1">*</span>
            </label>
            <select
              id="product-condition"
              required
              className="border p-2 rounded-md"
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

          <div className="flex flex-col space-y-2">
            <label htmlFor="product-category" className="font-medium">
              {t("new_product_category")}
            </label>
            <select
              id="product-category"
              className="border p-2 rounded-md"
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
                  <option key={categoryItem.id} value={categoryItem.name}>
                    {categoryItem.name}
                  </option>
                ))
              )}
            </select>
          </div>

          <div className="flex flex-col space-y-2">
            <label className="font-medium">
              {t("new_product_images")}{" "}
              {imageLength > 0 ? `${imagePreviews.length}/10` : "0/10"}
              <span className="text-red-500 text-lg font-bold p-1">*</span>
            </label>
            <div className="flex space-x-4 flex-wrap">
              {imagePreviews.map((preview, index) => (
                <div key={index} className="relative w-20 h-20">
                  <img
                    src={preview}
                    alt={`Preview ${index}`}
                    className="object-cover w-full h-full rounded-md"
                  />
                  <button
                    type="button"
                    className="absolute top-0 right-0 text-white bg-black opacity-50 rounded-full w-6 h-6 flex items-center justify-center"
                    onClick={() => handleRemoveImage(index)}
                  >
                    X
                  </button>
                </div>
              ))}
            </div>
            <div
              className="cursor-pointer text-center mt-4 py-2 px-4 bg-gray-300 rounded-md"
              onClick={() => document.getElementById("image-upload")?.click()}
            >
              <span className="text-2xl">+</span>
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

          <div className="flex flex-col space-y-4">
            <button
              type="button"
              onClick={() => navigate("/")}
              className="px-6 py-2 bg-red-500 text-white rounded-md"
            >
              {t("cancel_btn_label")}
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-blue-500 text-white rounded-md"
            >
              {t("submit")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NewProduct;
