import { type MetaFunction } from "@remix-run/cloudflare";

export const meta: MetaFunction = () => {
  return [
    { title: "Home | Zencart" },
    {
      property: "og:title",
      content: "Home | Zencart",
    },
    {
      name: "description",
      content:
        "Welcome to Zencart! In this part of the site, you can manage your digital catalog.",
    },
  ];
};

export default function Screen() {
  return (
    <div className="flex flex-col">
      <div className="mb-12 flex flex-col items-center justify-between sm:flex-row">
        <h1 className="flex items-center text-lg font-semibold text-gray-600">
          Hey, welcome!
        </h1>
      </div>
      <div>
        <h2 className="font-medium text-gray-600">
          First steps to start using your Zencart:
        </h2>
        <div className="mt-6 flex flex-col gap-y-3 text-gray-600">
          <p>1. Access the side menu and click on the companies tab.</p>
          <p>
            2. Set up your company details and register a Unit (This is where
            you add your WhatsApp number).
          </p>
          <p>
            3. Once your company is set up, it&#39;s time to create your
            products!
          </p>
          <p>
            4. Access the side menu and click on the products tab, there you can
            add, edit, and delete your products.
          </p>
          <p>
            5. After finishing creating your products, go to the categories tab
            and add categories for your products (the categories you create here
            will appear in your digital catalog).
          </p>
          <p>
            6. Done! Now you can share the link of your digital catalog with
            your customers.
          </p>
        </div>
        <div className="mt-6 flex flex-col gap-y-3 text-gray-600">
          <h2 className="font-medium text-gray-600">Video tutorials</h2>
          <a
            target="_blank"
            rel="noreferrer noopener"
            className="text-orange-600 underline"
            href="https://www.loom.com/share/27654949e0dc48cb8efe7b49402cca97?sid=d4778278-ed83-4913-a323-5701195aa4ec"
          >
            Creating a product and a category
          </a>
        </div>
      </div>
    </div>
  );
}
