import type { SubmissionResult } from "@conform-to/react";
import { jsonWithError } from "remix-toast";

export function handleErrorReturn(
  reply: SubmissionResult<string[]>,
  defaultMessage: string,
) {
  if (reply.error) {
    const firstError = Object.values(reply.error)[0];
    return jsonWithError(
      {
        ok: false,
      },
      firstError && firstError[0] ? firstError[0] : (defaultMessage as string),
    );
  } else {
    return jsonWithError(
      {
        ok: false,
      },
      defaultMessage,
    );
  }
}
