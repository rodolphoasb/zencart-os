export function getTenant(request: Request) {
  const { hostname } = new URL(request.url);
  const [tenant, domain, tld] = hostname.split(".");

  // // // if tld is undefined it means there was not subdomain
  // // // so we can redirect to another url and set a default tenant
  // // // or even redirect to a route where the tenant is not required
  // // // like a landing or login form
  // if (!tld) {
  //   if (process.env.NODE_ENV === "development") {
  //     return redirect("localhost:3000");
  //   }
  //   return redirect("https://zencart.io");
  // }

  return {
    tenant,
    domain,
    tld,
  };
}
