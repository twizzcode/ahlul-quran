import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient();

export const { signIn, signUp, signOut, useSession, getSession } = authClient;

export const signInWithGoogle = async () => {
  await signIn.social({
    provider: "google",
    callbackURL: "/",
  });
};
