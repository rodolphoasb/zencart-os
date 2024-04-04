import { Buffer } from "node:buffer";
import {
  AppLoadContext,
  createWorkersKVSessionStorage,
  SessionStorage,
} from "@remix-run/cloudflare";
import { Authenticator } from "remix-auth";
import { TOTPStrategy } from "remix-auth-totp";
import { Pool, neonConfig } from "@neondatabase/serverless";
import { PrismaNeon } from "@prisma/adapter-neon";
import { PrismaClient } from "@prisma/client";
import ws from "ws";

type User = {
  id: string;
  email: string;
};

export interface ServicesContext {
  env: AppLoadContext["cloudflare"]["env"];
  auth: ReturnType<typeof createAuth>;
  db: PrismaClient;
}

export function createServices(context: AppLoadContext) {
  console.log("createServices");
  // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions/get#smart_self-overwriting_lazy_getters
  const servicesContext: ServicesContext = {
    env: context.cloudflare.env,
    get db() {
      neonConfig.webSocketConstructor = ws;
      const connectionString = `${context.cloudflare.env.DATABASE_URL}`;
      const pool = new Pool({ connectionString });
      const adapter = new PrismaNeon(pool);
      const prisma = new PrismaClient({ adapter });

      return prisma;
    },
    get auth() {
      console.log("get auth() self-overwriting");
      // @ts-expect-error The operand of a 'delete' operator must be optional. ts(2790)
      delete this.auth;
      this.auth = createAuth(servicesContext);
      return this.auth;
    },
  };
  return servicesContext;
}

export function createAuth({
  env: { SESSION_SECRET, ENVIRONMENT, TOTP_SECRET, KV, LOOPS_API_KEY },
  db,
}: ServicesContext) {
  globalThis.Buffer = Buffer;
  const sessionStorage = createWorkersKVSessionStorage<
    {
      "auth:email": string;
    },
    { "auth:error": { message: string } }
  >({
    kv: KV,
    cookie: {
      name: "_auth",
      path: "/",
      sameSite: "lax",
      httpOnly: true,
      secrets: [SESSION_SECRET],
      secure: ENVIRONMENT === "production",
    },
  });
  const authenticator = new Authenticator<User>(
    sessionStorage as SessionStorage
  );
  authenticator.use(
    new TOTPStrategy(
      {
        secret: TOTP_SECRET,
        magicLinkPath: "/magic-link",
        sendTOTP: async ({ email, code, magicLink }) => {
          if (ENVIRONMENT === "development") {
            console.log("[Dev-Only] TOTP Code:", code);
          }
          const options = {
            method: "POST",
            headers: {
              Authorization: `Bearer ${LOOPS_API_KEY}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              transactionalId: "cluls4u3201h3fco57tnz79bb",
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
            KV.put(
              `simulateEmail:${email}`,
              `Email not implemented. Use code: ${code} or magic link: ${magicLink}`,
              {
                expirationTtl: 60,
              }
            );
          }
        },
      },
      async ({ email }) => {
        let user = await db.user.findUnique({ where: { email } });

        if (!user) {
          user = await db.user.create({ data: { email } });
          if (!user) throw new Error("Whoops! Unable to create user.");
        }

        return user;
      }
    )
  );
  return {
    authenticator,
    getSession: sessionStorage.getSession,
    commitSession: sessionStorage.commitSession,
    destroySession: sessionStorage.destroySession,
  };
}

export async function getUserData(context: AppLoadContext, request: Request) {
  const {
    auth: { authenticator },
    db,
  } = createServices(context);
  const session = await authenticator.isAuthenticated(request, {
    failureRedirect: "/login",
  });

  const user = await db.user.findUnique({ where: { id: session.id } });

  if (!user) {
    throw new Error("User not found");
  }

  const storeId = await getStoreId(user.id, request, context);

  return {
    userId: user?.id,
    email: user?.email,
    storeId: storeId,
  };
}

async function getStoreId(
  userId: string,
  request: Request,
  context: AppLoadContext
) {
  if (!userId) return null;

  const {
    auth: { getSession },
    db,
  } = createServices(context);
  const authSession = await getSession(request.headers.get("cookie"));

  // TODO - Fix this
  // Check if there's a storeId session token
  const maybeStoreId = authSession.get("auth:email") as string;

  // If there is, return it
  if (maybeStoreId) return maybeStoreId;

  // If there isn't, query the database for the storeId related to the user
  const user = await db.user.findFirst({
    where: {
      id: userId,
    },
    include: {
      ownedStores: true,
    },
  });

  const store = user?.ownedStores[0];

  // If this happens something weird is going on
  if (!store) return null;

  // Return the storeId
  return store.id;
}
