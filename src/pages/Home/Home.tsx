import { useTranslation } from "react-i18next";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowRight,
  Baby,
  Bed,
  Book,
  Car,
  Dumbbell,
  Flower2,
  Guitar,
  HeartPulse,
  Home as HomeIcon,
  Laptop,
  type LucideIcon,
  Package,
  Pill,
  School,
  Shirt,
  ShoppingBag,
  Smartphone,
  Sofa,
  Sparkles,
  Tablet,
  Tv,
  UtensilsCrossed,
  Wrench,
  Bike,
  Cat,
  Footprints,
  Settings,
  ToyBrick,
} from "lucide-react";
import { Button, Card, EmptyState, Skeleton } from "@components/ui";
import { useFormat } from "@utils/intl";
import {
  useGetCategoryListQuery,
  useGetProductsQuery,
} from "@store/slices/productsApiSlice";
import type { Category, Product, ProductResponse } from "@store/type";

function categoryName(category: Category, lang: string): string {
  if (lang.startsWith("ru")) return category.name_ru;
  if (lang.startsWith("uz")) return category.name_uz;
  return category.name_en;
}

const CATEGORY_ICONS: Record<string, LucideIcon> = {
  smartphones: Smartphone,
  furniture: Sofa,
  shoes: Footprints,
  kids_and_babies: Baby,
  automotive: Car,
  home_appliances: UtensilsCrossed,
  real_estate: HomeIcon,
  food: UtensilsCrossed,
  women_clothing: Shirt,
  men_clothing: Shirt,
  bags: ShoppingBag,
  perfume: Sparkles,
  flowers: Flower2,
  medicine: Pill,
  medical_products: HeartPulse,
  construction_tools: Wrench,
  sport_equipment: Dumbbell,
  kitchen_tools: UtensilsCrossed,
  musical_instruments: Guitar,
  books_media: Book,
  pets: Cat,
  others: Package,
  used_cars: Car,
  toys: ToyBrick,
  laptops_computers: Laptop,
  bedroom_furniture: Bed,
  teacher_materials: School,
  motorcycles_scooters: Bike,
  office_furniture: Sofa,
  kitchen_furniture: Sofa,
  children_furniture: Baby,
  car_parts: Settings,
  tablets_ebooks: Tablet,
  tv_home_theater: Tv,
};

function categoryIcon(key: string): LucideIcon {
  return CATEGORY_ICONS[key] ?? Package;
}

const Home = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const format = useFormat();

  const { data: categories, isLoading: categoriesLoading } =
    useGetCategoryListQuery({});
  const { data: productsData, isLoading: productsLoading } =
    useGetProductsQuery({ currentPage: 1, page_size: 8 });

  const products: Product[] = (productsData as ProductResponse)?.results ?? [];
  const categoryList: Category[] = (
    (categories as { data?: Category[] } | undefined)?.data ?? []
  ).slice(0, 12);

  return (
    <div className="bg-background">
      {/* Hero */}
      <section className="border-b border-border bg-surface">
        <div className="container flex flex-col items-center gap-6 py-16 text-center md:py-24">
          <h1 className="max-w-3xl text-4xl font-bold tracking-tight text-foreground md:text-6xl">
            {t("home.heroTitle")}
          </h1>
          <p className="max-w-2xl text-lg text-muted">{t("home.heroSubtitle")}</p>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button size="lg" onClick={() => navigate("/new-product")}>
              {t("home.startSelling")}
            </Button>
            <Button size="lg" variant="outline" onClick={() => navigate("/products")}>
              {t("home.browseAll")}
            </Button>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="container py-12">
        <h2 className="mb-6 text-2xl font-bold text-foreground">
          {t("home.categoriesTitle")}
        </h2>
        {categoriesLoading ? (
          <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-6">
            {Array.from({ length: 12 }, (_, i) => (
              <Skeleton key={i} className="h-24" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-6">
            {categoryList.map((category) => {
              const Icon = categoryIcon(category.key);
              return (
                <Link
                  key={category.id}
                  to="/products"
                  className="flex flex-col items-center gap-2 rounded-xl border border-border bg-surface p-4 text-center transition-colors hover:border-primary/50 hover:bg-primary/5"
                >
                  <Icon className="h-6 w-6 text-primary" aria-hidden="true" />
                  <span className="text-xs font-medium text-foreground">
                    {categoryName(category, i18n.language)}
                  </span>
                </Link>
              );
            })}
          </div>
        )}
      </section>

      {/* Fresh listings */}
      <section className="container pb-16">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-foreground">
            {t("home.freshTitle")}
          </h2>
          <Link
            to="/products"
            className="flex items-center gap-1 text-sm font-medium text-primary hover:underline"
          >
            {t("home.viewAll")}
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        {productsLoading ? (
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {Array.from({ length: 8 }, (_, i) => (
              <Skeleton key={i} className="h-64" />
            ))}
          </div>
        ) : products.length === 0 ? (
          <EmptyState
            title={t("home.emptyListings")}
            action={
              <Button onClick={() => navigate("/new-product")}>
                {t("home.startSelling")}
              </Button>
            }
          />
        ) : (
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {products.map((product) => (
              <Link key={product.id} to={`/product/${product.id}`}>
                <Card className="h-full overflow-hidden transition-shadow hover:shadow-md">
                  <div className="aspect-square bg-foreground/5">
                    {product.images?.[0] && (
                      <img
                        src={product.images[0].image}
                        alt={product.images[0].alt_text ?? product.title}
                        loading="lazy"
                        className="h-full w-full object-cover"
                      />
                    )}
                  </div>
                  <div className="space-y-1 p-3">
                    <p className="truncate text-sm font-medium text-foreground">
                      {product.title}
                    </p>
                    <p className="text-base font-bold text-foreground">
                      {format.currency(product.price, product.currency || "UZS")}
                    </p>
                    <p className="truncate text-xs text-muted">
                      {product.location?.district ??
                        product.location?.region ??
                        ""}{" "}
                      · {format.relative(product.created_at)}
                    </p>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default Home;
