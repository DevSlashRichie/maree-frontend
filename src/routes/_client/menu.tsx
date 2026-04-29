import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { FoodCard } from "@/components/card";
import { Subheading } from "@/components/typography";
import { CategoryFilters } from "@/layouts/category-filters";
import { MenuHero } from "@/layouts/menu-hero";
import {
  useGetV1ProductsCategories,
  useGetV1ProductsVariants,
} from "@/lib/api";
import { formatPrice } from "@/lib/money";
import type { GetV1ProductsVariants200VariantsItem } from "@/lib/schemas";

export const Route = createFileRoute("/_client/menu")({
  component: RouteComponent,
});

function RouteComponent() {
  const navigate = useNavigate();
  const {
    data: categoriesData,
    isLoading: isLoadingCategories,
    error: errorCategories,
  } = useGetV1ProductsCategories();
  const {
    data: productsData,
    isLoading: isLoadingProducts,
    error: errorProducts,
  } = useGetV1ProductsVariants();

  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  const sectionRefs = useRef<{ [key: string]: HTMLElement | null }>({});

  const categories = useMemo(() => {
    const cats =
      categoriesData &&
      categoriesData.status === 200 &&
      "categories" in categoriesData.data
        ? categoriesData.data.categories
        : [];

    return cats.filter((cat) => cat.public);
  }, [categoriesData]);

  // biome-ignore lint/correctness/useExhaustiveDependencies: categories are required.
  useEffect(() => {
    if (isLoadingCategories || isLoadingProducts) return;

    const observerOptions = {
      root: null,
      rootMargin: "-20% 0px -60% 0px",
      threshold: 0,
    };

    const observerCallback = (entries: IntersectionObserverEntry[]) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          setActiveCategory(entry.target.id);
          break;
        }
      }
    };

    const observer = new IntersectionObserver(
      observerCallback,
      observerOptions,
    );

    const sections = Object.values(sectionRefs.current);
    for (const section of sections) {
      if (section) observer.observe(section);
    }

    return () => observer.disconnect();
  }, [categories, isLoadingCategories, isLoadingProducts]);

  if (isLoadingCategories || isLoadingProducts) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-pink-soft" />
      </div>
    );
  }

  if (
    errorCategories ||
    errorProducts ||
    categoriesData?.status !== 200 ||
    productsData?.status !== 200
  ) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen px-4 text-center">
        <h2 className="text-2xl font-display text-gray-800 mb-4">
          ¡Ups! Algo salió mal
        </h2>
        <p className="text-gray-600 mb-8 max-w-md">
          No pudimos cargar el menú en este momento. Por favor, intenta de nuevo
          más tarde.
        </p>
        <button
          type="button"
          onClick={() => window.location.reload()}
          className="px-6 py-2 bg-pink-soft text-white rounded-full hover:bg-pink-soft/90 transition-colors shadow-lg"
        >
          Reintentar
        </button>
      </div>
    );
  }

  const variants = (productsData?.data?.variants ??
    []) as GetV1ProductsVariants200VariantsItem[];

  const currentCategoryId = activeCategory ?? categories[0]?.id ?? null;

  const scrollToSection = (categoryId: string) => {
    const element = document.getElementById(categoryId);
    if (element) {
      const offset = 100; // Account for sticky nav
      const bodyRect = document.body.getBoundingClientRect().top;
      const elementRect = element.getBoundingClientRect().top;
      const elementPosition = elementRect - bodyRect;
      const offsetPosition = elementPosition - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth",
      });
    }
  };

  return (
    <>
      <MenuHero />
      <div className="texture-bg min-h-screen pb-20 relative">
        <div className="sticky top-0 z-50 w-full bg-white/70 backdrop-blur-xl border-b border-pink-soft/10 py-4 px-4 shadow-sm">
          <div className="max-w-7xl mx-auto">
            <CategoryFilters
              categories={categories.map((c) => ({ id: c.id, name: c.name }))}
              activeCategory={currentCategoryId ?? ""}
              onCategoryChange={scrollToSection}
            />
          </div>
        </div>

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-16">
          {categories.map((category) => {
            const items = variants.filter(
              (variant) => variant.product.categoryId === category.id,
            );
            const publicChildren =
              category.children?.filter((child) => child.public) ?? [];

            return (
              <section
                key={category.id}
                id={category.id}
                ref={(el) => {
                  sectionRefs.current[category.id] = el;
                }}
                className="mb-24 scroll-mt-32"
              >
                <div className="mb-16">
                  <div className="flex flex-col gap-3 border-l-4 border-charcoal pl-8 transition-all duration-700">
                    <div className="flex items-center gap-3">
                      <span className="h-px w-8 bg-charcoal" />
                      <span className="text-[10px] font-bold tracking-[0.4em] text-charcoal uppercase">
                        Nuestra Selección de
                      </span>
                    </div>
                    <Subheading className="text-4xl md:text-4xl font-display lowercase italic tracking-tight text-gray-900">
                      {category.name}
                    </Subheading>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-8 gap-y-16">
                  {items.length > 0 ? (
                    items.map((item) => (
                      <FoodCard
                        key={item.id}
                        title={item.name}
                        price={`$${(Number(item.price) || 0) / 100}`}
                        description={item.description}
                        image={
                          item.image ??
                          "https://images.unsplash.com/photo-1519676867240-f03562e64548?q=80&w=500"
                        }
                        onClick={() =>
                          navigate({
                            to: "/customize-product",
                            search: {
                              itemId: "",
                              variantId: item.id,
                            },
                          })
                        }
                        onAdd={() =>
                          navigate({
                            to: "/customize-product",
                            search: {
                              itemId: "",
                              variantId: item.id,
                            },
                          })
                        }
                      />
                    ))
                  ) : publicChildren.length === 0 ? (
                    <div className="col-span-full py-10 text-center opacity-40 italic font-body">
                      Próximamente... estamos preparando algo delicioso.
                    </div>
                  ) : null}
                </div>

                {publicChildren.map((child) => {
                  const childItems = variants.filter(
                    (variant) => variant.product.categoryId === child.id,
                  );

                  return (
                    <div key={child.id} className="mt-24 first:mt-20">
                      <div className="mb-12">
                        <div className="flex flex-col gap-2 border-l-2 border-pink-soft/30 pl-6">
                          <div className="flex items-center gap-2">
                            <span className="h-px w-6 bg-charcoal/30" />
                            <span className="text-[9px] font-bold tracking-[0.3em] text-charcoal uppercase">
                              Más de {category.name}
                            </span>
                          </div>
                          <h3 className="text-3xl font-display lowercase italic tracking-tight text-gray-800">
                            {child.name}
                          </h3>
                        </div>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-8 gap-y-16">
                        {childItems.length > 0 ? (
                          childItems.map((item) => (
                            <FoodCard
                              key={item.id}
                              title={item.name}
                              price={formatPrice(item.price || 0)}
                              description={item.description}
                              image={
                                item.image ??
                                "https://images.unsplash.com/photo-1519676867240-f03562e64548?q=80&w=500"
                              }
                              onClick={() => {
                                navigate({
                                  to: "/customize-product",
                                  search: {
                                    itemId: "",
                                    variantId: item.id,
                                  },
                                });
                              }}
                              onAdd={() => {
                                navigate({
                                  to: "/customize-product",
                                  search: {
                                    itemId: "",
                                    variantId: item.id,
                                  },
                                });
                              }}
                            />
                          ))
                        ) : (
                          <div className="col-span-full py-6 text-center opacity-40 italic font-body">
                            Próximamente... estamos preparando algo delicioso.
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </section>
            );
          })}
        </main>
      </div>
    </>
  );
}
