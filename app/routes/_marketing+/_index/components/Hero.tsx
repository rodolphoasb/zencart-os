import { ClientOnly } from "remix-utils/client-only";
import { Container } from "./Container";
import { DrawerDialogWatchVideo } from "./DrawerDialogWatchVideo";

export function Hero() {
  return (
    <Container className="pb-16 pt-12 text-center lg:pb-32 lg:pt-20">
      <h1 className="mx-auto max-w-4xl text-4xl font-bold tracking-tight text-slate-900 sm:text-7xl sm:leading-[86px]">
        WhatsApp Your Way to More Sales
      </h1>
      <p className="mx-auto mt-6 max-w-2xl text-xl tracking-tight text-slate-600">
        Get orders fast on WhatsApp: Show your catalog, connect with customers,
        and sell with a tap.
      </p>

      <div className="mt-10 flex justify-center gap-x-6">
        <ClientOnly>{() => <DrawerDialogWatchVideo />}</ClientOnly>
      </div>
    </Container>
  );
}
