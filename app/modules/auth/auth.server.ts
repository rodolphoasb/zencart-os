import { redirect } from "@remix-run/node";
import { Authenticator } from "remix-auth";
import { TOTPStrategy } from "remix-auth-totp";
import { prisma } from "prisma/index.server";
import { authSessionStorage } from "./session.server";

type User = {
  id: string;
  email: string;
};

export const authenticator = new Authenticator<User>(authSessionStorage, {
  throwOnError: true,
});

authenticator.use(
  new TOTPStrategy(
    {
      secret: process.env.ENCRYPTION_SECRET || "NOT_A_STRONG_SECRET",
      magicLinkPath: "/magic-link",
      sendTOTP: async ({ email, code, magicLink }) => {
        if (process.env.NODE_ENV === "development") {
          console.log("[Dev-Only] TOTP Code:", code);
        }
        const options = {
          method: "POST",
          headers: {
            Authorization: `Bearer ${process.env.LOOPS_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            transactionalId: "cltz24zqv008lmpzclmp3d8v2",
            email: email,
            dataVariables: {
              magicLink: magicLink,
            },
          }),
        };

        try {
          const response = await fetch(
            "https://app.loops.so/api/v1/transactional",
            options
          );
          const jsonResponse = await response.json();

          console.log("jsonResponse", jsonResponse);
        } catch (err) {
          console.log(err);
        }
      },
    },
    async ({ email }) => {
      let user = await prisma.user.findUnique({ where: { email } });

      if (!user) {
        user = await prisma.user.create({ data: { email } });
        if (!user) throw new Error("Whoops! Unable to create user.");
      }

      return user;
    }
  )
);

// export async function getUserId(request: Request) {
//   const authSession = await authSessionStorage.getSession(
//     request.headers.get('cookie'),
//   )
//   const sessionId = authSession.get(sessionKey)
//   if (!sessionId) return null
//   const session = await prisma.session.findUnique({
//     select: { user: { select: { id: true } } },
//     where: { id: sessionId, expirationDate: { gt: new Date() } },
//   })
//   if (!session?.user) {
//     throw redirect('/', {
//       headers: {
//         'set-cookie': await authSessionStorage.destroySession(authSession),
//       },
//     })
//   }
//   return session.user.id
// }

export async function getUserData(request: Request) {
  const session = await authenticator.isAuthenticated(request, {
    failureRedirect: "/login",
  });

  const user = await prisma.user.findUnique({ where: { id: session.id } });
  if (!user) return redirect("/login");

  return user;
}
