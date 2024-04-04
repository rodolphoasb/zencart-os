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

  if (!authSession.data.storeId) {
    authSession.set("storeId", user.storeId);
  }

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
                      width="156"
                      height="40"
                      fill="none"
                      viewBox="0 0 156 40"
                    >
                      <circle
                        cx="20"
                        cy="20"
                        r="20"
                        fill="#F97316"
                        transform="rotate(180 20 20)"
                      ></circle>
                      <path
                        fill="#fff"
                        d="M6 18.75c-.552 0-1.003-.448-.967-1a15 15 0 0129.934 0c.037.552-.415 1-.967 1H6z"
                      ></path>
                      <path
                        fill="#000"
                        d="M89.101 15.83c1.76 0 3.143.542 4.148 1.625 1.025 1.064 1.538 2.504 1.538 4.322v8.905h-1.915v-8.905c0-1.296-.348-2.301-1.044-3.017-.677-.715-1.644-1.073-2.9-1.073-1.393 0-2.524.445-3.395 1.334-.87.87-1.305 2.224-1.305 4.061v7.6h-1.914V16.18h1.914v2.262c1.083-1.74 2.707-2.61 4.873-2.61zM72.075 15.83c2.146 0 3.877.764 5.192 2.292 1.334 1.508 2.001 3.297 2.001 5.366a9.7 9.7 0 01-.058.9H66.476c.194 1.47.812 2.64 1.857 3.51 1.063.85 2.368 1.276 3.916 1.276 1.102 0 2.05-.223 2.842-.667.812-.465 1.422-1.064 1.828-1.799l1.682.986c-.638 1.025-1.508 1.838-2.61 2.437-1.103.6-2.36.9-3.772.9-2.281 0-4.138-.716-5.569-2.147-1.43-1.431-2.146-3.25-2.146-5.454 0-2.165.705-3.974 2.117-5.424 1.412-1.45 3.23-2.175 5.454-2.175zm0 1.857c-1.509 0-2.776.454-3.8 1.363-1.006.89-1.606 2.05-1.799 3.481h10.82c-.194-1.528-.783-2.717-1.77-3.568-.986-.85-2.136-1.276-3.451-1.276zM52.263 28.768h10.79v1.914H50v-1.914l10.5-16.476H50.29v-1.915h12.473v1.915l-10.5 16.476z"
                      ></path>
                      <path
                        fill="#F97316"
                        d="M155.7 18.615h-3.858v7.861c0 .716.135 1.228.406 1.538.29.29.725.444 1.305.464.581 0 1.296-.02 2.147-.058v2.262c-2.205.29-3.819.116-4.844-.522-1.025-.657-1.538-1.885-1.538-3.684v-7.86h-2.871v-2.437h2.871v-3.307l2.524-.754v4.06h3.858v2.437zM140.476 18.615c.831-1.798 2.34-2.697 4.525-2.697v2.64c-1.238-.059-2.301.27-3.191.985-.89.716-1.334 1.867-1.334 3.452v7.687h-2.524V16.18h2.524v2.436zM131.605 16.178h2.524v14.504h-2.524v-2.494c-1.257 1.914-3.084 2.871-5.482 2.871-2.031 0-3.762-.735-5.193-2.204-1.431-1.49-2.146-3.297-2.146-5.425 0-2.127.715-3.925 2.146-5.395 1.431-1.489 3.162-2.233 5.193-2.233 2.398 0 4.225.957 5.482 2.871V16.18zm-5.163 12.445c1.469 0 2.697-.494 3.684-1.48.986-1.005 1.479-2.243 1.479-3.713 0-1.47-.493-2.697-1.479-3.684-.987-1.005-2.215-1.508-3.684-1.508-1.451 0-2.669.503-3.655 1.508-.986.987-1.48 2.215-1.48 3.684 0 1.47.494 2.708 1.48 3.713.986.986 2.204 1.48 3.655 1.48zM108.098 31.06c-3.075 0-5.617-1.016-7.629-3.046-1.991-2.031-2.987-4.526-2.987-7.484 0-2.96.996-5.454 2.987-7.484 2.012-2.03 4.554-3.046 7.629-3.046 1.857 0 3.558.445 5.106 1.334 1.566.89 2.784 2.089 3.654 3.597l-2.349 1.364c-.58-1.122-1.451-2.012-2.611-2.67-1.141-.676-2.407-1.014-3.8-1.014-2.34 0-4.254.754-5.743 2.262-1.47 1.509-2.205 3.394-2.205 5.657 0 2.243.735 4.119 2.205 5.627 1.489 1.508 3.403 2.263 5.743 2.263 1.393 0 2.659-.33 3.8-.987 1.16-.677 2.031-1.566 2.611-2.668l2.349 1.334c-.85 1.508-2.059 2.717-3.625 3.626-1.567.89-3.278 1.334-5.135 1.334z"
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
                width="156"
                height="40"
                fill="none"
                viewBox="0 0 156 40"
              >
                <circle
                  cx="20"
                  cy="20"
                  r="20"
                  fill="#F97316"
                  transform="rotate(180 20 20)"
                ></circle>
                <path
                  fill="#fff"
                  d="M6 18.75c-.552 0-1.003-.448-.967-1a15 15 0 0129.934 0c.037.552-.415 1-.967 1H6z"
                ></path>
                <path
                  fill="#000"
                  d="M89.101 15.83c1.76 0 3.143.542 4.148 1.625 1.025 1.064 1.538 2.504 1.538 4.322v8.905h-1.915v-8.905c0-1.296-.348-2.301-1.044-3.017-.677-.715-1.644-1.073-2.9-1.073-1.393 0-2.524.445-3.395 1.334-.87.87-1.305 2.224-1.305 4.061v7.6h-1.914V16.18h1.914v2.262c1.083-1.74 2.707-2.61 4.873-2.61zM72.075 15.83c2.146 0 3.877.764 5.192 2.292 1.334 1.508 2.001 3.297 2.001 5.366a9.7 9.7 0 01-.058.9H66.476c.194 1.47.812 2.64 1.857 3.51 1.063.85 2.368 1.276 3.916 1.276 1.102 0 2.05-.223 2.842-.667.812-.465 1.422-1.064 1.828-1.799l1.682.986c-.638 1.025-1.508 1.838-2.61 2.437-1.103.6-2.36.9-3.772.9-2.281 0-4.138-.716-5.569-2.147-1.43-1.431-2.146-3.25-2.146-5.454 0-2.165.705-3.974 2.117-5.424 1.412-1.45 3.23-2.175 5.454-2.175zm0 1.857c-1.509 0-2.776.454-3.8 1.363-1.006.89-1.606 2.05-1.799 3.481h10.82c-.194-1.528-.783-2.717-1.77-3.568-.986-.85-2.136-1.276-3.451-1.276zM52.263 28.768h10.79v1.914H50v-1.914l10.5-16.476H50.29v-1.915h12.473v1.915l-10.5 16.476z"
                ></path>
                <path
                  fill="#F97316"
                  d="M155.7 18.615h-3.858v7.861c0 .716.135 1.228.406 1.538.29.29.725.444 1.305.464.581 0 1.296-.02 2.147-.058v2.262c-2.205.29-3.819.116-4.844-.522-1.025-.657-1.538-1.885-1.538-3.684v-7.86h-2.871v-2.437h2.871v-3.307l2.524-.754v4.06h3.858v2.437zM140.476 18.615c.831-1.798 2.34-2.697 4.525-2.697v2.64c-1.238-.059-2.301.27-3.191.985-.89.716-1.334 1.867-1.334 3.452v7.687h-2.524V16.18h2.524v2.436zM131.605 16.178h2.524v14.504h-2.524v-2.494c-1.257 1.914-3.084 2.871-5.482 2.871-2.031 0-3.762-.735-5.193-2.204-1.431-1.49-2.146-3.297-2.146-5.425 0-2.127.715-3.925 2.146-5.395 1.431-1.489 3.162-2.233 5.193-2.233 2.398 0 4.225.957 5.482 2.871V16.18zm-5.163 12.445c1.469 0 2.697-.494 3.684-1.48.986-1.005 1.479-2.243 1.479-3.713 0-1.47-.493-2.697-1.479-3.684-.987-1.005-2.215-1.508-3.684-1.508-1.451 0-2.669.503-3.655 1.508-.986.987-1.48 2.215-1.48 3.684 0 1.47.494 2.708 1.48 3.713.986.986 2.204 1.48 3.655 1.48zM108.098 31.06c-3.075 0-5.617-1.016-7.629-3.046-1.991-2.031-2.987-4.526-2.987-7.484 0-2.96.996-5.454 2.987-7.484 2.012-2.03 4.554-3.046 7.629-3.046 1.857 0 3.558.445 5.106 1.334 1.566.89 2.784 2.089 3.654 3.597l-2.349 1.364c-.58-1.122-1.451-2.012-2.611-2.67-1.141-.676-2.407-1.014-3.8-1.014-2.34 0-4.254.754-5.743 2.262-1.47 1.509-2.205 3.394-2.205 5.657 0 2.243.735 4.119 2.205 5.627 1.489 1.508 3.403 2.263 5.743 2.263 1.393 0 2.659-.33 3.8-.987 1.16-.677 2.031-1.566 2.611-2.668l2.349 1.334c-.85 1.508-2.059 2.717-3.625 3.626-1.567.89-3.278 1.334-5.135 1.334z"
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
              width="156"
              height="40"
              fill="none"
              viewBox="0 0 156 40"
            >
              <circle
                cx="20"
                cy="20"
                r="20"
                fill="#F97316"
                transform="rotate(180 20 20)"
              ></circle>
              <path
                fill="#fff"
                d="M6 18.75c-.552 0-1.003-.448-.967-1a15 15 0 0129.934 0c.037.552-.415 1-.967 1H6z"
              ></path>
              <path
                fill="#000"
                d="M89.101 15.83c1.76 0 3.143.542 4.148 1.625 1.025 1.064 1.538 2.504 1.538 4.322v8.905h-1.915v-8.905c0-1.296-.348-2.301-1.044-3.017-.677-.715-1.644-1.073-2.9-1.073-1.393 0-2.524.445-3.395 1.334-.87.87-1.305 2.224-1.305 4.061v7.6h-1.914V16.18h1.914v2.262c1.083-1.74 2.707-2.61 4.873-2.61zM72.075 15.83c2.146 0 3.877.764 5.192 2.292 1.334 1.508 2.001 3.297 2.001 5.366a9.7 9.7 0 01-.058.9H66.476c.194 1.47.812 2.64 1.857 3.51 1.063.85 2.368 1.276 3.916 1.276 1.102 0 2.05-.223 2.842-.667.812-.465 1.422-1.064 1.828-1.799l1.682.986c-.638 1.025-1.508 1.838-2.61 2.437-1.103.6-2.36.9-3.772.9-2.281 0-4.138-.716-5.569-2.147-1.43-1.431-2.146-3.25-2.146-5.454 0-2.165.705-3.974 2.117-5.424 1.412-1.45 3.23-2.175 5.454-2.175zm0 1.857c-1.509 0-2.776.454-3.8 1.363-1.006.89-1.606 2.05-1.799 3.481h10.82c-.194-1.528-.783-2.717-1.77-3.568-.986-.85-2.136-1.276-3.451-1.276zM52.263 28.768h10.79v1.914H50v-1.914l10.5-16.476H50.29v-1.915h12.473v1.915l-10.5 16.476z"
              ></path>
              <path
                fill="#F97316"
                d="M155.7 18.615h-3.858v7.861c0 .716.135 1.228.406 1.538.29.29.725.444 1.305.464.581 0 1.296-.02 2.147-.058v2.262c-2.205.29-3.819.116-4.844-.522-1.025-.657-1.538-1.885-1.538-3.684v-7.86h-2.871v-2.437h2.871v-3.307l2.524-.754v4.06h3.858v2.437zM140.476 18.615c.831-1.798 2.34-2.697 4.525-2.697v2.64c-1.238-.059-2.301.27-3.191.985-.89.716-1.334 1.867-1.334 3.452v7.687h-2.524V16.18h2.524v2.436zM131.605 16.178h2.524v14.504h-2.524v-2.494c-1.257 1.914-3.084 2.871-5.482 2.871-2.031 0-3.762-.735-5.193-2.204-1.431-1.49-2.146-3.297-2.146-5.425 0-2.127.715-3.925 2.146-5.395 1.431-1.489 3.162-2.233 5.193-2.233 2.398 0 4.225.957 5.482 2.871V16.18zm-5.163 12.445c1.469 0 2.697-.494 3.684-1.48.986-1.005 1.479-2.243 1.479-3.713 0-1.47-.493-2.697-1.479-3.684-.987-1.005-2.215-1.508-3.684-1.508-1.451 0-2.669.503-3.655 1.508-.986.987-1.48 2.215-1.48 3.684 0 1.47.494 2.708 1.48 3.713.986.986 2.204 1.48 3.655 1.48zM108.098 31.06c-3.075 0-5.617-1.016-7.629-3.046-1.991-2.031-2.987-4.526-2.987-7.484 0-2.96.996-5.454 2.987-7.484 2.012-2.03 4.554-3.046 7.629-3.046 1.857 0 3.558.445 5.106 1.334 1.566.89 2.784 2.089 3.654 3.597l-2.349 1.364c-.58-1.122-1.451-2.012-2.611-2.67-1.141-.676-2.407-1.014-3.8-1.014-2.34 0-4.254.754-5.743 2.262-1.47 1.509-2.205 3.394-2.205 5.657 0 2.243.735 4.119 2.205 5.627 1.489 1.508 3.403 2.263 5.743 2.263 1.393 0 2.659-.33 3.8-.987 1.16-.677 2.031-1.566 2.611-2.668l2.349 1.334c-.85 1.508-2.059 2.717-3.625 3.626-1.567.89-3.278 1.334-5.135 1.334z"
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
