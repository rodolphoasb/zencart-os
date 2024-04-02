import { type ActionFunction,json } from "@remix-run/node";

export const action: ActionFunction = async ({ request }) => {
  const requestBody = await request.json();
  const numberOfUrls = requestBody.numberOfUrls || 1;

  const urls = await Promise.all(
    Array.from({ length: numberOfUrls }, async () => {
      const url = `https://api.cloudflare.com/client/v4/accounts/${process.env.PUBLIC_CLOUDFLARE_ACCOUNT_ID}/images/v2/direct_upload`;
      const formData = new FormData();
      formData.append("requireSignedURLs", "false");
      formData.append("metadata", JSON.stringify({ key: "value" }));

      const response = await fetch(url, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.PUBLIC_CLOUDFLARE_IMAGE_TOKEN}`,
        },
        body: formData,
      });

      const jsonData = await response.json();
      return jsonData.result;
    }),
  );

  return json({ data: urls });
};
