import { Fragment, useState } from "react";
import { Dialog, Transition } from "@headlessui/react";
import type { LoaderFunction } from "@remix-run/cloudflare";
import { json } from "@remix-run/cloudflare";
import {
  NavLink,
  Outlet,
  redirect,
  useLoaderData,
  useLocation,
  useMatches,
} from "@remix-run/react";
import {
  HomeIcon,
  MenuIcon,
  MoreVertical,
  ShoppingBag,
  StoreIcon,
  XIcon,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { sleep } from "~/components/ui/globalloading";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "~/components/ui/tooltip";
import { cn } from "~/utils";

import { ExitButton } from "./components/ExitButton";
import { createServices, getUserData } from "~/modules/auth/services.server";

const navigation = [
  { name: "Home", href: "/home", icon: HomeIcon },
  {
    name: "Empresa",
    href: "/stores",
    icon: StoreIcon,
  },
  {
    name: "Produtos",
    href: "/products",
    icon: ShoppingBag,
  },
];

export const loader: LoaderFunction = async ({ context, request }) => {
  const user = await getUserData(context, request);
  await sleep(1000);
  const {
    auth: { getSession, commitSession },
  } = createServices(context);

  if (!user?.userId) {
    throw redirect("/login");
  }

  if (!user?.storeId) {
    throw redirect("/onboarding?step=1");
  }

  const authSession = await getSession(request.headers.get("cookie"));

  // authSession.set("storeId", user.storeId);

  return json(
    {
      user: {
        userId: user?.userId,
        email: user?.email,
      },
    },
    {
      headers: {
        "set-cookie": await commitSession(authSession),
      },
    }
  );
};

export default function Screen() {
  const { user } = useLoaderData<typeof loader>();
  const location = useLocation();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const matches = useMatches();
  const { id } = matches[matches.length - 1];

  const collapsedNavBarRoutes = [
    "routes/_db+/flows+/new/route",
    "routes/_db+/settings+/_index/route",
    "routes/_db+/settings+/domains._index/route",
    "routes/_db+/settings+/domains.$domainId/route",
    "routes/_db+/settings+/account/route",
    "routes/_db+/settings+/team/route",
    "routes/_db+/settings+/integrations/_index/_index",
    "routes/_db+/settings+/integrations/kiwify/_kiwify",
    "routes/_db+/conversations+/_index/route",
    "routes/_db+/conversations+/$conversationId/_route",
  ];

  const isCollapsedNavBar = collapsedNavBarRoutes.includes(id);

  return (
    <div>
      <Transition.Root show={sidebarOpen} as={Fragment}>
        <Dialog
          as="div"
          className="relative z-50 lg:hidden"
          onClose={setSidebarOpen}
        >
          <Transition.Child
            as={Fragment}
            enter="transition-opacity ease-linear duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="transition-opacity ease-linear duration-300"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-gray-100/80" />
          </Transition.Child>

          <div className="fixed inset-0 flex">
            <Transition.Child
              as={Fragment}
              enter="transition ease-in-out duration-300 transform"
              enterFrom="-translate-x-full"
              enterTo="translate-x-0"
              leave="transition ease-in-out duration-300 transform"
              leaveFrom="translate-x-0"
              leaveTo="-translate-x-full"
            >
              <Dialog.Panel className="relative mr-16 flex w-full max-w-xs flex-1">
                <Transition.Child
                  as={Fragment}
                  enter="ease-in-out duration-300"
                  enterFrom="opacity-0"
                  enterTo="opacity-100"
                  leave="ease-in-out duration-300"
                  leaveFrom="opacity-100"
                  leaveTo="opacity-0"
                >
                  <div className="absolute left-full top-0 flex w-16 justify-center pt-5">
                    <button
                      type="button"
                      className="-m-2.5 p-2.5"
                      onClick={() => setSidebarOpen(false)}
                    >
                      <span className="sr-only">Close sidebar</span>
                      <XIcon
                        className="h-6 w-6 text-white"
                        aria-hidden="true"
                      />
                    </button>
                  </div>
                </Transition.Child>
                {/* Sidebar component, swap this element with another sidebar if you like */}
                <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-gray-100 px-6 pb-2 ring-1 ring-white/10">
                  <div className="flex h-16 shrink-0 items-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="125"
                      height="32"
                      fill="none"
                      viewBox="0 0 125 32"
                    >
                      <circle cx="16" cy="16" r="16" fill="#F97316"></circle>
                      <path
                        fill="#fff"
                        d="M27 17c.552 0 1.004.449.958.999a12 12 0 01-23.916 0C3.996 17.449 4.448 17 5 17h22z"
                      ></path>
                      <path
                        fill="#000"
                        d="M71.281 12.664c1.408 0 2.514.434 3.318 1.3.82.85 1.23 2.003 1.23 3.458v7.124h-1.531v-7.124c0-1.037-.279-1.841-.836-2.414-.541-.572-1.315-.858-2.32-.858-1.114 0-2.02.355-2.715 1.067-.697.696-1.045 1.78-1.045 3.249v6.08h-1.531V12.943h1.531v1.81c.867-1.393 2.166-2.089 3.899-2.089zM57.66 12.664c1.717 0 3.102.611 4.153 1.834 1.068 1.206 1.602 2.637 1.602 4.293 0 .17-.016.41-.047.72H53.181c.155 1.175.65 2.11 1.485 2.807.85.68 1.895 1.021 3.133 1.021.882 0 1.64-.178 2.274-.534.65-.371 1.137-.85 1.462-1.439l1.346.79a5.51 5.51 0 01-2.089 1.949c-.881.48-1.887.72-3.016.72-1.826 0-3.311-.573-4.456-1.718-1.145-1.145-1.717-2.6-1.717-4.363 0-1.732.565-3.179 1.694-4.34 1.13-1.16 2.584-1.74 4.363-1.74zm0 1.486c-1.207 0-2.22.363-3.04 1.09-.805.712-1.284 1.64-1.44 2.785h8.657c-.155-1.222-.627-2.174-1.416-2.854a4.097 4.097 0 00-2.761-1.021zM41.81 23.014h8.633v1.532H40v-1.532l8.4-13.18h-8.168V8.301h9.979v1.531l-8.4 13.181z"
                      ></path>
                      <path
                        fill="#F97316"
                        d="M124.56 14.892h-3.086v6.289c0 .572.108.982.325 1.23.232.232.58.356 1.044.371.464 0 1.036-.015 1.717-.046v1.81c-1.764.232-3.055.093-3.875-.418-.82-.526-1.23-1.508-1.23-2.947v-6.289h-2.298v-1.95h2.298v-2.645l2.019-.603v3.249h3.086v1.95zM112.381 14.892c.665-1.439 1.872-2.158 3.62-2.158v2.112c-.99-.047-1.841.216-2.553.789-.712.572-1.067 1.493-1.067 2.761v6.15h-2.019V12.943h2.019v1.95zM105.284 12.943h2.019v11.603h-2.019V22.55c-1.006 1.532-2.468 2.297-4.386 2.297-1.624 0-3.009-.588-4.154-1.763-1.145-1.192-1.717-2.638-1.717-4.34 0-1.701.572-3.14 1.717-4.316 1.145-1.191 2.53-1.787 4.154-1.787 1.918 0 3.38.766 4.386 2.297v-1.995zm-4.131 9.955c1.176 0 2.159-.394 2.947-1.183.789-.805 1.184-1.795 1.184-2.97 0-1.177-.395-2.159-1.184-2.948-.788-.804-1.771-1.207-2.947-1.207-1.16 0-2.135.403-2.924 1.207-.789.79-1.183 1.771-1.183 2.947 0 1.176.394 2.166 1.183 2.97.79.79 1.764 1.184 2.924 1.184zM86.479 24.847c-2.46 0-4.495-.812-6.103-2.436-1.594-1.625-2.39-3.62-2.39-5.987s.796-4.363 2.39-5.987C81.984 8.812 84.019 8 86.478 8c1.485 0 2.846.356 4.084 1.067 1.253.712 2.228 1.671 2.924 2.878l-1.88 1.09c-.464-.897-1.16-1.608-2.088-2.134-.913-.542-1.927-.813-3.04-.813-1.872 0-3.404.604-4.595 1.81-1.176 1.207-1.764 2.716-1.764 4.526 0 1.794.588 3.295 1.764 4.502 1.191 1.206 2.723 1.81 4.595 1.81 1.114 0 2.127-.263 3.04-.79.928-.54 1.624-1.252 2.088-2.134l1.88 1.067c-.681 1.207-1.648 2.174-2.901 2.9-1.253.713-2.622 1.068-4.107 1.068z"
                      ></path>
                    </svg>
                  </div>
                  <nav className="flex flex-1 flex-col">
                    <ul className="flex flex-1 flex-col gap-y-7">
                      <li>
                        <ul className="-mx-2 space-y-4">
                          {navigation.map((item) => (
                            <li key={`${item.name}-mobile`}>
                              <NavLink
                                to={item.href}
                                className={({ isActive }) =>
                                  cn(
                                    isActive
                                      ? "font-semibold text-gray-700"
                                      : "text-gray-400 hover:bg-gray-400 hover:text-white",
                                    "group flex gap-x-3 rounded-md p-2 text-sm font-semibold leading-6"
                                  )
                                }
                              >
                                <item.icon
                                  className="h-6 w-6 shrink-0"
                                  aria-hidden="true"
                                />
                                {item.name}
                              </NavLink>
                            </li>
                          ))}
                        </ul>
                      </li>
                    </ul>
                  </nav>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </Dialog>
      </Transition.Root>
      {/* Static sidebar for desktop */}
      {isCollapsedNavBar ? (
        <div className="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-20 lg:flex-col">
          {/* Sidebar component, swap this element with another sidebar if you like */}
          <div className="mx-auto flex w-full grow flex-col items-center gap-y-5 overflow-y-auto bg-gray-50">
            <div className="flex h-16 shrink-0 items-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="125"
                height="32"
                fill="none"
                viewBox="0 0 125 32"
              >
                <circle cx="16" cy="16" r="16" fill="#F97316"></circle>
                <path
                  fill="#fff"
                  d="M27 17c.552 0 1.004.449.958.999a12 12 0 01-23.916 0C3.996 17.449 4.448 17 5 17h22z"
                ></path>
                <path
                  fill="#000"
                  d="M71.281 12.664c1.408 0 2.514.434 3.318 1.3.82.85 1.23 2.003 1.23 3.458v7.124h-1.531v-7.124c0-1.037-.279-1.841-.836-2.414-.541-.572-1.315-.858-2.32-.858-1.114 0-2.02.355-2.715 1.067-.697.696-1.045 1.78-1.045 3.249v6.08h-1.531V12.943h1.531v1.81c.867-1.393 2.166-2.089 3.899-2.089zM57.66 12.664c1.717 0 3.102.611 4.153 1.834 1.068 1.206 1.602 2.637 1.602 4.293 0 .17-.016.41-.047.72H53.181c.155 1.175.65 2.11 1.485 2.807.85.68 1.895 1.021 3.133 1.021.882 0 1.64-.178 2.274-.534.65-.371 1.137-.85 1.462-1.439l1.346.79a5.51 5.51 0 01-2.089 1.949c-.881.48-1.887.72-3.016.72-1.826 0-3.311-.573-4.456-1.718-1.145-1.145-1.717-2.6-1.717-4.363 0-1.732.565-3.179 1.694-4.34 1.13-1.16 2.584-1.74 4.363-1.74zm0 1.486c-1.207 0-2.22.363-3.04 1.09-.805.712-1.284 1.64-1.44 2.785h8.657c-.155-1.222-.627-2.174-1.416-2.854a4.097 4.097 0 00-2.761-1.021zM41.81 23.014h8.633v1.532H40v-1.532l8.4-13.18h-8.168V8.301h9.979v1.531l-8.4 13.181z"
                ></path>
                <path
                  fill="#F97316"
                  d="M124.56 14.892h-3.086v6.289c0 .572.108.982.325 1.23.232.232.58.356 1.044.371.464 0 1.036-.015 1.717-.046v1.81c-1.764.232-3.055.093-3.875-.418-.82-.526-1.23-1.508-1.23-2.947v-6.289h-2.298v-1.95h2.298v-2.645l2.019-.603v3.249h3.086v1.95zM112.381 14.892c.665-1.439 1.872-2.158 3.62-2.158v2.112c-.99-.047-1.841.216-2.553.789-.712.572-1.067 1.493-1.067 2.761v6.15h-2.019V12.943h2.019v1.95zM105.284 12.943h2.019v11.603h-2.019V22.55c-1.006 1.532-2.468 2.297-4.386 2.297-1.624 0-3.009-.588-4.154-1.763-1.145-1.192-1.717-2.638-1.717-4.34 0-1.701.572-3.14 1.717-4.316 1.145-1.191 2.53-1.787 4.154-1.787 1.918 0 3.38.766 4.386 2.297v-1.995zm-4.131 9.955c1.176 0 2.159-.394 2.947-1.183.789-.805 1.184-1.795 1.184-2.97 0-1.177-.395-2.159-1.184-2.948-.788-.804-1.771-1.207-2.947-1.207-1.16 0-2.135.403-2.924 1.207-.789.79-1.183 1.771-1.183 2.947 0 1.176.394 2.166 1.183 2.97.79.79 1.764 1.184 2.924 1.184zM86.479 24.847c-2.46 0-4.495-.812-6.103-2.436-1.594-1.625-2.39-3.62-2.39-5.987s.796-4.363 2.39-5.987C81.984 8.812 84.019 8 86.478 8c1.485 0 2.846.356 4.084 1.067 1.253.712 2.228 1.671 2.924 2.878l-1.88 1.09c-.464-.897-1.16-1.608-2.088-2.134-.913-.542-1.927-.813-3.04-.813-1.872 0-3.404.604-4.595 1.81-1.176 1.207-1.764 2.716-1.764 4.526 0 1.794.588 3.295 1.764 4.502 1.191 1.206 2.723 1.81 4.595 1.81 1.114 0 2.127-.263 3.04-.79.928-.54 1.624-1.252 2.088-2.134l1.88 1.067c-.681 1.207-1.648 2.174-2.901 2.9-1.253.713-2.622 1.068-4.107 1.068z"
                ></path>
              </svg>
            </div>
            <nav className="flex flex-1 flex-col">
              <ul className="flex flex-1 flex-col gap-y-7">
                <li>
                  <ul className="flex flex-col items-center space-y-4">
                    {navigation.map((item) => (
                      <li key={`${item.name}-collapsed`}>
                        <TooltipProvider delayDuration={0}>
                          <Tooltip>
                            <TooltipTrigger>
                              <NavLink
                                to={item.href}
                                className={({ isActive }) =>
                                  cn(
                                    isActive
                                      ? "bg-gray-200 text-gray-700"
                                      : "text-gray-500 hover:bg-gray-200 hover:text-gray-700",
                                    "group flex justify-center gap-x-3 rounded-md p-2 text-sm font-semibold leading-6"
                                  )
                                }
                              >
                                <item.icon
                                  className="h-5 w-5 shrink-0"
                                  aria-hidden="true"
                                />
                              </NavLink>
                            </TooltipTrigger>
                            <TooltipContent side="right">
                              <p>{item.name}</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </li>
                    ))}
                  </ul>
                </li>

                <div className="mt-auto flex items-center justify-between py-4">
                  {user ? (
                    <ExitButton
                      isDialogOpen={isDialogOpen}
                      setIsDialogOpen={setIsDialogOpen}
                    />
                  ) : null}
                </div>
              </ul>
            </nav>
          </div>
        </div>
      ) : (
        <div className="hidden border-r lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-60 lg:flex-col">
          {/* Sidebar component, swap this element with another sidebar if you like */}
          <div className="mt-8 flex grow flex-col gap-y-5 overflow-y-auto px-6">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="125"
              height="32"
              fill="none"
              viewBox="0 0 125 32"
            >
              <circle cx="16" cy="16" r="16" fill="#F97316"></circle>
              <path
                fill="#fff"
                d="M27 17c.552 0 1.004.449.958.999a12 12 0 01-23.916 0C3.996 17.449 4.448 17 5 17h22z"
              ></path>
              <path
                fill="#000"
                d="M71.281 12.664c1.408 0 2.514.434 3.318 1.3.82.85 1.23 2.003 1.23 3.458v7.124h-1.531v-7.124c0-1.037-.279-1.841-.836-2.414-.541-.572-1.315-.858-2.32-.858-1.114 0-2.02.355-2.715 1.067-.697.696-1.045 1.78-1.045 3.249v6.08h-1.531V12.943h1.531v1.81c.867-1.393 2.166-2.089 3.899-2.089zM57.66 12.664c1.717 0 3.102.611 4.153 1.834 1.068 1.206 1.602 2.637 1.602 4.293 0 .17-.016.41-.047.72H53.181c.155 1.175.65 2.11 1.485 2.807.85.68 1.895 1.021 3.133 1.021.882 0 1.64-.178 2.274-.534.65-.371 1.137-.85 1.462-1.439l1.346.79a5.51 5.51 0 01-2.089 1.949c-.881.48-1.887.72-3.016.72-1.826 0-3.311-.573-4.456-1.718-1.145-1.145-1.717-2.6-1.717-4.363 0-1.732.565-3.179 1.694-4.34 1.13-1.16 2.584-1.74 4.363-1.74zm0 1.486c-1.207 0-2.22.363-3.04 1.09-.805.712-1.284 1.64-1.44 2.785h8.657c-.155-1.222-.627-2.174-1.416-2.854a4.097 4.097 0 00-2.761-1.021zM41.81 23.014h8.633v1.532H40v-1.532l8.4-13.18h-8.168V8.301h9.979v1.531l-8.4 13.181z"
              ></path>
              <path
                fill="#F97316"
                d="M124.56 14.892h-3.086v6.289c0 .572.108.982.325 1.23.232.232.58.356 1.044.371.464 0 1.036-.015 1.717-.046v1.81c-1.764.232-3.055.093-3.875-.418-.82-.526-1.23-1.508-1.23-2.947v-6.289h-2.298v-1.95h2.298v-2.645l2.019-.603v3.249h3.086v1.95zM112.381 14.892c.665-1.439 1.872-2.158 3.62-2.158v2.112c-.99-.047-1.841.216-2.553.789-.712.572-1.067 1.493-1.067 2.761v6.15h-2.019V12.943h2.019v1.95zM105.284 12.943h2.019v11.603h-2.019V22.55c-1.006 1.532-2.468 2.297-4.386 2.297-1.624 0-3.009-.588-4.154-1.763-1.145-1.192-1.717-2.638-1.717-4.34 0-1.701.572-3.14 1.717-4.316 1.145-1.191 2.53-1.787 4.154-1.787 1.918 0 3.38.766 4.386 2.297v-1.995zm-4.131 9.955c1.176 0 2.159-.394 2.947-1.183.789-.805 1.184-1.795 1.184-2.97 0-1.177-.395-2.159-1.184-2.948-.788-.804-1.771-1.207-2.947-1.207-1.16 0-2.135.403-2.924 1.207-.789.79-1.183 1.771-1.183 2.947 0 1.176.394 2.166 1.183 2.97.79.79 1.764 1.184 2.924 1.184zM86.479 24.847c-2.46 0-4.495-.812-6.103-2.436-1.594-1.625-2.39-3.62-2.39-5.987s.796-4.363 2.39-5.987C81.984 8.812 84.019 8 86.478 8c1.485 0 2.846.356 4.084 1.067 1.253.712 2.228 1.671 2.924 2.878l-1.88 1.09c-.464-.897-1.16-1.608-2.088-2.134-.913-.542-1.927-.813-3.04-.813-1.872 0-3.404.604-4.595 1.81-1.176 1.207-1.764 2.716-1.764 4.526 0 1.794.588 3.295 1.764 4.502 1.191 1.206 2.723 1.81 4.595 1.81 1.114 0 2.127-.263 3.04-.79.928-.54 1.624-1.252 2.088-2.134l1.88 1.067c-.681 1.207-1.648 2.174-2.901 2.9-1.253.713-2.622 1.068-4.107 1.068z"
              ></path>
            </svg>
            <nav className="mt-4 flex flex-1 flex-col">
              <ul className="flex flex-1 flex-col gap-y-3">
                <li>
                  <ul className="-mx-2 space-y-3">
                    {navigation.map((item) => (
                      <li key={`${item.name}-full-desktop`}>
                        <NavLink
                          to={item.href}
                          className={({ isActive }) =>
                            cn(
                              isActive
                                ? "font-semibold text-gray-700"
                                : "font-medium text-gray-500 opacity-75 hover:bg-gray-200 hover:text-gray-700",
                              "group relative flex items-center gap-x-3 rounded-md px-2 py-1 text-sm leading-6"
                            )
                          }
                        >
                          {location.pathname.includes(item.href) && (
                            <div className="absolute -left-4 h-3.5 w-[3px] rounded-r-md bg-gray-800" />
                          )}
                          <item.icon
                            className="h-5 w-5 shrink-0"
                            aria-hidden="true"
                          />
                          {item.name}
                        </NavLink>
                      </li>
                    ))}
                  </ul>
                </li>

                <div className="mt-auto flex w-full items-center justify-between overflow-hidden py-4">
                  <p className="truncate text-sm text-gray-500">
                    {user?.email}
                  </p>

                  {user ? (
                    <DropdownMenu>
                      <DropdownMenuTrigger>
                        <MoreVertical className="h-5 w-5 text-zinc-500" />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent
                        className={`${isDialogOpen ? "hidden" : ""}`}
                      >
                        {/* https://github.com/radix-ui/primitives/issues/1836 */}
                        <ExitButton
                          isDialogOpen={isDialogOpen}
                          setIsDialogOpen={setIsDialogOpen}
                        />
                      </DropdownMenuContent>
                    </DropdownMenu>
                  ) : null}
                </div>
              </ul>
            </nav>
          </div>
        </div>
      )}

      <div className="sticky top-0 z-40 flex items-center gap-x-6 bg-white px-4 py-4 shadow-sm sm:px-6 lg:hidden">
        <button
          type="button"
          className="-m-2.5 p-2.5 text-gray-400 lg:hidden"
          onClick={() => setSidebarOpen(true)}
        >
          <span className="sr-only">Open sidebar</span>
          <MenuIcon className="h-6 w-6" aria-hidden="true" />
        </button>
        <div className="flex-1 text-sm font-semibold leading-6 text-gray-800">
          Dashboard
        </div>
      </div>

      <main
        className={`${isCollapsedNavBar ? "lg:pl-20" : "pb-10 pt-7 lg:pl-64"} `}
      >
        <div className={`${isCollapsedNavBar ? "" : "px-4 sm:px-6 lg:px-8"}`}>
          <Outlet />
        </div>
      </main>
    </div>
  );
}
