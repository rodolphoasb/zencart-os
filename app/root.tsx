import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLoaderData,
} from "@remix-run/react";
import { SonnerToaster } from "./components/ui/sonner";
import { getToast } from "remix-toast";
import { toast as notify } from "sonner";
import { LinksFunction, LoaderFunctionArgs, json } from "@remix-run/cloudflare";
import { combineHeaders, getDomainUrl } from "./utils";
import { useEffect } from "react";
import "./tailwind.css";
import DefaultErrorBoundary from "./components/error-boundary";

export const links: LinksFunction = () => {
  return [
    {
      rel: "preconnect",
      href: "https://fonts.googleapis.com",
    },
    {
      rel: "preconnect",
      href: "https://fonts.gstatic.com",
      crossOrigin: "anonymous",
    },
    {
      rel: "stylesheet",
      href: "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap",
    },
  ];
};

export async function loader({ request }: LoaderFunctionArgs) {
  const { toast, headers: toastHeaders } = await getToast(request);

  return json(
    {
      requestInfo: {
        origin: getDomainUrl(request),
        path: new URL(request.url).pathname,
      },
      toast,
    },
    {
      headers: combineHeaders(toastHeaders),
    }
  );
}

export function Layout({ children }: { children: React.ReactNode }) {
  const data = useLoaderData<typeof loader>();

  useEffect(() => {
    switch (data?.toast?.type) {
      case "success":
        notify.success(data?.toast.message, {
          description: data?.toast.description,
        });
        return;
      case "error":
        notify.error(data?.toast.message, {
          description: data?.toast.description,
        });
        return;
      default:
        return;
    }
  }, [data?.toast]);

  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body>
        {children}
        <ScrollRestoration />
        <Scripts />
        <SonnerToaster richColors closeButton />
      </body>
    </html>
  );
}

export default function App() {
  return <Outlet />;
}

export function ErrorBoundary() {
  return <DefaultErrorBoundary />;
}

export function HydrateFallback() {
  return <h1>Loading..</h1>;
}
