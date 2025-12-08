import { StackClientApp } from "@stackframe/react";

export const stackClientApp = new StackClientApp({
  projectId: import.meta.env.VITE_STACK_PROJECT_ID || "eb04e940-25a6-4888-85b6-041d6fdcf015",
  publishableClientKey: import.meta.env.VITE_STACK_PUBLISHABLE_CLIENT_KEY || "pck_w1cnvcv21maxm8vg4f2am232ec5w89xvzy2wv3jpwdxmg",
  tokenStore: "cookie",
});
