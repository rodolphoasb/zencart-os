import { type ActionFunction, json } from "@remix-run/cloudflare";

export const action: ActionFunction = async ({ request }) => {
  const requestBody = (await request.json()) as {
    base64String: string | string[];
  };
  const base64Strings = Array.isArray(requestBody.base64String)
    ? requestBody.base64String
    : [requestBody.base64String];
  const encodedCredentials = btoa(
    `${process.env.R2_BUCKET_NAME}:${process.env.R2_API_TOKEN}`
  );

  const uploadURL = "https://r2-image-worker.rbravo.workers.dev/upload";

  // Function to upload a single image
  const uploadImage = async (base64String: string) => {
    const body = JSON.stringify({ body: base64String });
    const fetchOptions: RequestInit = {
      method: "PUT",
      headers: {
        Authorization: `Basic ${encodedCredentials}`,
        "Content-Type": "application/json",
      },
      body: body,
    };

    const uploadResponse = await fetch(uploadURL, fetchOptions);
    const responseText = await uploadResponse.text(); // Get raw response text

    if (uploadResponse.ok) {
      return { url: responseText };
    } else {
      // Instead of throwing, you return an error object to handle it gracefully
      return {
        error: "Upload failed for one of the images",
        details: uploadResponse.statusText,
      };
    }
  };

  // Map each base64 string to a promise to upload it
  const uploadPromises = base64Strings.map(uploadImage);

  try {
    // Use Promise.all to wait for all uploads to complete
    const uploadResults = await Promise.all(uploadPromises);
    return json(uploadResults);
  } catch (error) {
    // Handle the case where any upload fails
    console.error("Error uploading images:", error);
    return json({
      error: "An error occurred during the upload process",
    });
  }
};
