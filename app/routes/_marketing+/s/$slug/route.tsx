import { useCallback, useEffect, useRef, useState } from "react";
import { type LoaderFunctionArgs } from "@remix-run/cloudflare";
import {
  json,
  Link,
  type MetaFunction,
  Outlet,
  useLoaderData,
} from "@remix-run/react";
import { ChevronRight, ShareIcon } from "lucide-react";
import { useSnapshot } from "valtio";
import { InfoComponent } from "../components/Info";
import { Layout1 } from "../components/Layout1";
import { Layout2 } from "../components/Layout2";
import { cartStore } from "../hooks/cartStore";
import { createServices } from "~/modules/auth/services.server";

export const meta: MetaFunction<typeof loader> = ({ data }) => {
  return [
    { title: `${data?.data?.title} | Digital Catalog` },
    {
      property: "og:title",
      content: `${data?.data?.title} | Digital Catalog`,
    },
    {
      name: "description",
      content: "Access our digital catalog.",
    },
  ];
};

export async function loader({ context, params }: LoaderFunctionArgs) {
  const slug = params.slug;
  const { db: prisma } = createServices(context);

  const storeData = await prisma.store.findUnique({
    where: { slug },
    include: {
      items: {
        include: {
          tags: true,
          customizationCategories: {
            include: {
              itemCustomizations: true,
            },
          },
        },
        where: {
          isVisible: true,
        },
      },
      categories: {
        include: {
          tags: true,
        },
      },
      units: {
        include: {
          businessHours: true,
        },
      },
    },
  });

  // Ensure store data was found
  if (!storeData) {
    return json({
      ok: false,
      code: 404,
      error: "Store not found",
      data: null,
    });
  }

  // Prepare categories with matched products
  const categoriesWithProducts = storeData.categories.map((category) => {
    // For each category, filter items that have all the tags of this category
    const categoryTagNames = category.tags.map((t) => t.name);
    const products = storeData.items.filter((item) => {
      const itemTagNames = item.tags.map((t) => t.name);
      // Check if all category tags are included in the item's tags
      return categoryTagNames.every((tagName) =>
        itemTagNames.includes(tagName)
      );
    });

    return {
      name: category.name,
      tags: category.tags.map((t) => t.name), // Assuming you want tag names
      products, // Already filtered to match this category's tags and visibility
      productIds: products.map((p) => p.id),
    };
  });

  return json({
    ok: true,
    code: 200,
    error: null,
    data: {
      slug: storeData.slug,
      title: storeData.name,
      category: storeData.category,
      paymentMethods: storeData.paymentMethods,
      description: storeData.description,
      layoutType: storeData?.typeOfLayout,
      categories: categoriesWithProducts,
      units: storeData.units,
      logoUrl: storeData.logoUrl,
      acceptsOrdersOutsideBusinessHours:
        storeData.acceptsOrdersOutsideBusinessHours,
      acceptsOrdersOnWhatsapp: storeData.acceptsOrdersOnWhatsapp,
    },
  });
}

export default function StorePage() {
  const { data } = useLoaderData<typeof loader>();
  const categoriesWithProducts = data?.categories;
  const title = data?.title;
  const layoutType = data?.layoutType;
  const [isVisible, setIsVisible] = useState(false);
  const [intersectionSections, setIntersectionSections] = useState<
    {
      name: string;
      Ycoord: number;
    }[]
  >([]);
  const navContainerRef = useRef<HTMLDivElement>(null);
  const navLinkRefs = useRef<{ [key: string]: HTMLAnchorElement }>({});
  const setNavLinkRefs = useCallback(
    (element: HTMLAnchorElement | null, name: string) => {
      if (element) {
        navLinkRefs.current[name] = element; // Store a reference to each nav link
      }
    },
    []
  );
  const { cart } = useSnapshot(cartStore);

  const active = intersectionSections.length
    ? intersectionSections.reduce((prev, curr) => {
        return prev.Ycoord < curr.Ycoord ? prev : curr;
      })
    : { name: "" };

  useEffect(() => {
    const activeLink = navLinkRefs.current[active.name];
    const navContainer = navContainerRef.current;

    console.log("activeLink", activeLink);
    console.log("navContainer", navContainer);

    if (activeLink && navContainer) {
      const scrollLeft =
        activeLink.offsetLeft +
        activeLink.offsetWidth / 2 -
        navContainer.offsetWidth / 2;
      navContainer.scroll({
        left: scrollLeft,
        behavior: "smooth",
      });
    }
  }, [active.name]);

  // Scroll event handler
  const toggleVisibility = () => {
    if (window.scrollY > 100) {
      setIsVisible(true);
    } else {
      setIsVisible(false);
    }
  };

  useEffect(() => {
    window.addEventListener("scroll", toggleVisibility);

    return () => {
      window.removeEventListener("scroll", toggleVisibility);
    };
  }, []);

  if (!categoriesWithProducts) {
    return null;
  }

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${title}`,
          url: `https://${data.slug}.zencart.io`,
        });
      } catch (error) {
        console.error("Error sharing the content", error);
      }
    } else {
      console.log("Web Share API is not supported in this browser.");
    }
  };

  return (
    <div className="flex min-h-screen flex-col">
      <div className="flex min-h-32 w-full items-start justify-end gap-x-6 bg-black px-5 py-6">
        <InfoComponent
          logoUrl={data.logoUrl}
          storeName={title}
          units={data.units}
          description={data.description}
          paymentMethods={data.paymentMethods}
        />
        <button onClick={handleShare}>
          <ShareIcon className="h-6 w-6 text-white" />
        </button>
      </div>

      <nav
        className={`${
          isVisible ? "block" : "hidden"
        } fixed left-0 top-0 z-50 w-full bg-white pt-4`}
      >
        <div
          ref={navContainerRef}
          className="flex overflow-x-scroll [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          <div className="flex flex-nowrap md:ml-20">
            {categoriesWithProducts?.map((category) => (
              <Link
                to={`#${category.name}`}
                className={`scroll-smooth whitespace-nowrap px-4 py-2 text-black ${
                  category.name === active.name
                    ? "border-b-2 font-semibold"
                    : ""
                }`}
                key={category.name}
                ref={(el) => setNavLinkRefs(el, category.name)}
              >
                {category.name}
              </Link>
            ))}
          </div>
        </div>
      </nav>

      <div className="-mt-12 w-full rounded-t-3xl bg-white">
        {/* Header */}
        <div className="flex justify-between px-5 py-6">
          <div>
            <h1 className="text-xl font-medium">{title}</h1>
            <p className="text-sm text-gray-600">
              {data.category ? data.category : ""}
            </p>
          </div>
          {data.logoUrl ? (
            <div className="h-20 w-20 overflow-hidden rounded-full">
              <img
                src={data.logoUrl}
                alt="logo"
                className="h-20 w-20 rounded-full"
              />
            </div>
          ) : null}
        </div>

        {cart.length > 0 ? (
          <div className="fixed bottom-0 left-0 right-0 z-50 flex justify-between bg-gradient-to-r from-orange-400 to-orange-500">
            <div className="flex w-full items-end justify-between px-4 py-2">
              <div className="flex flex-col">
                <h1 className="text-xs text-white">Seu carrinho em</h1>
                <p className="font-semibold text-white">{title}</p>
              </div>
              <div className="flex items-center gap-x-2">
                <div className="flex flex-col">
                  <p className="self-end text-xs text-white">
                    {cart.length} {cart.length > 1 ? "itens" : "item"}
                  </p>
                  {/* Get sum */}
                  <p className="text-base font-semibold text-white">
                    {(
                      cart.reduce((acc, item) => {
                        return (
                          acc +
                          (item.price +
                            item.customizationItems.reduce(
                              (acc, item) => acc + item.price * item.quantity,
                              0
                            )) *
                            item.quantity
                        );
                      }, 0) / 100
                    ).toLocaleString("pt-BR", {
                      style: "currency",
                      currency: "BRL",
                    })}
                  </p>
                </div>
                <Link
                  to={`/s/${data.slug}/cart`}
                  preventScrollReset={true}
                  className="flex h-8 w-8 items-center justify-center rounded-full bg-white"
                >
                  <ChevronRight className="text-orange-600" />
                </Link>
              </div>
            </div>
          </div>
        ) : null}

        {/* Products */}
        {layoutType === "HORIZONTAL" ? (
          <Layout1
            setIntersectionSections={setIntersectionSections}
            categoriesWithProducts={categoriesWithProducts}
          />
        ) : null}
        {layoutType === "VERTICAL" ? (
          <Layout2
            categoriesWithProducts={categoriesWithProducts}
            setIntersectionSections={setIntersectionSections}
          />
        ) : null}
      </div>
      <Outlet />
    </div>
  );
}
