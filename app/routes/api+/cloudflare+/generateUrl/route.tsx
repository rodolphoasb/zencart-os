import { type ActionFunction, json } from "@remix-run/cloudflare";

export const action: ActionFunction = async ({ context, request }) => {
  const requestBody = (await request.json()) as { numberOfUrls?: number };
  const numberOfUrls = requestBody.numberOfUrls || 1;

  const urls = await Promise.all(
    Array.from({ length: numberOfUrls }, async () => {
      const url = `https://api.cloudflare.com/client/v4/accounts/${context.cloudflare.env.PUBLIC_CLOUDFLARE_ACCOUNT_ID}/images/v2/direct_upload`;
      const formData = new FormData();
      formData.append("requireSignedURLs", "false");
      formData.append("metadata", JSON.stringify({ key: "value" }));

      const response = await fetch(url, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${context.cloudflare.env.PUBLIC_CLOUDFLARE_IMAGE_TOKEN}`,
        },
        body: formData,
      });

      const jsonData = (await response.json()) as { result: string };
      return jsonData.result;
    })
  );

  return json({ data: urls });
};
