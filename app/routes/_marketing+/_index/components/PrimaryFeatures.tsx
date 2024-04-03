"use client";

import { useEffect, useState } from "react";
import { Tab } from "@headlessui/react";
import clsx from "clsx";
import screenshotCategories from "/src/images/screenshots/categories.png";
import screenshotOrder from "/src/images/screenshots/order.png";
import screenshotProduct from "/src/images/screenshots/product.png";
import screenshotProducts from "/src/images/screenshots/products.png";
import { Container } from "./Container";

const features = [
  {
    title: "Crie seus produtos",
    description:
      "Liste todos seus produtos e controle o que aparece no seu catálogo de forma fácil e intuitiva.",
    image: screenshotProducts,
  },
  {
    title: "Adicione fotos, descrição e tags",
    description:
      "Adicione as informações do seu produto e quantas fotos quiser para deixar seu produto ainda mais atrativo.",
    image: screenshotProduct,
  },
  {
    title: "Crie categorias para facilitar a busca",
    description:
      "Crie as categorias que aparecem no seu catálogo para organizar seus produtos de forma flexível.",
    image: screenshotCategories,
  },
  {
    title: "Receba pedidos direto no WhatsApp",
    description:
      "Pare de perder tempo com pedidos desorganizados. Receba pedidos direto no WhatsApp e organize tudo em um só lugar.",
    image: screenshotOrder,
  },
];

export function PrimaryFeatures() {
  const [tabOrientation, setTabOrientation] = useState<
    "horizontal" | "vertical"
  >("horizontal");

  useEffect(() => {
    const lgMediaQuery = window.matchMedia("(min-width: 1024px)");

    function onMediaQueryChange({ matches }: { matches: boolean }) {
      setTabOrientation(matches ? "vertical" : "horizontal");
    }

    onMediaQueryChange(lgMediaQuery);
    lgMediaQuery.addEventListener("change", onMediaQueryChange);

    return () => {
      lgMediaQuery.removeEventListener("change", onMediaQueryChange);
    };
  }, []);

  return (
    <section
      id="features"
      aria-label="Features for running your books"
      className="relative overflow-hidden bg-slate-950 pb-28 pt-20 sm:py-32"
    >
      {/* <img
        className="absolute left-1/2 top-1/2 max-w-none translate-x-[-44%] translate-y-[-42%]"
        src={backgroundImage}
        alt=""
        width={2245}
        height={1636}
      /> */}
      <Container className="relative">
        <div className="max-w-2xl md:mx-auto md:text-center xl:max-w-none">
          <h2 className="font-semibold text-3xl tracking-tight text-white sm:text-4xl md:text-5xl">
            Everything you need to boost your sales.
          </h2>
          <p className="mt-6 text-lg tracking-tight text-white">
            Receive neatly organized orders, saving you time on order
            processing.
          </p>
        </div>
        <Tab.Group
          as="div"
          className="mt-16 grid grid-cols-1 items-center gap-y-2 pt-10 sm:gap-y-6 md:mt-20 lg:grid-cols-12 lg:pt-0"
          vertical={tabOrientation === "vertical"}
        >
          {({ selectedIndex }) => (
            <>
              <div className="-mx-4 flex overflow-x-auto pb-4 sm:mx-0 sm:overflow-visible sm:pb-0 lg:col-span-5">
                <Tab.List className="relative z-10 flex gap-x-4 whitespace-nowrap px-4 sm:mx-auto sm:px-0 lg:mx-0 lg:block lg:gap-x-0 lg:gap-y-1 lg:whitespace-normal">
                  {features.map((feature, featureIndex) => (
                    <div
                      key={feature.title}
                      className={clsx(
                        "group relative rounded-full px-4 py-1 lg:rounded-l-xl lg:rounded-r-none lg:p-6",
                        selectedIndex === featureIndex
                          ? "bg-white lg:bg-white/10 lg:ring-1 lg:ring-inset lg:ring-white/10"
                          : "hover:bg-white/10 lg:hover:bg-white/5"
                      )}
                    >
                      <h3>
                        <Tab
                          className={clsx(
                            "  text-lg ui-not-focus-visible:outline-none",
                            selectedIndex === featureIndex
                              ? "text-black lg:text-white"
                              : "text-white hover:text-white lg:text-white"
                          )}
                        >
                          <span className="absolute inset-0 rounded-full lg:rounded-l-xl lg:rounded-r-none" />
                          {feature.title}
                        </Tab>
                      </h3>
                      <p
                        className={clsx(
                          "mt-2 hidden text-sm lg:block",
                          selectedIndex === featureIndex
                            ? "text-white"
                            : "text-white group-hover:text-white"
                        )}
                      >
                        {feature.description}
                      </p>
                    </div>
                  ))}
                </Tab.List>
              </div>
              <Tab.Panels className="lg:col-span-7">
                {features.map((feature) => (
                  <Tab.Panel key={feature.title} unmount={false}>
                    <div className="relative sm:px-6 lg:hidden">
                      <div className="absolute -inset-x-4 bottom-[-4.25rem] top-[-6.5rem] bg-white/10 ring-1 ring-inset ring-white/10 sm:inset-x-0 sm:rounded-t-xl" />
                      <p className="relative mx-auto max-w-2xl text-base text-white sm:text-center">
                        {feature.description}
                      </p>
                    </div>
                    <div className="mt-10 w-[45rem] overflow-hidden rounded-xl bg-slate-50 shadow-xl shadow-blue-900/20 sm:w-auto lg:mt-0 lg:w-[67.8125rem]">
                      <img
                        className="w-full"
                        src={feature.image}
                        alt=""
                        sizes="(min-width: 1024px) 67.8125rem, (min-width: 640px) 100vw, 45rem"
                      />
                    </div>
                  </Tab.Panel>
                ))}
              </Tab.Panels>
            </>
          )}
        </Tab.Group>
      </Container>
    </section>
  );
}
