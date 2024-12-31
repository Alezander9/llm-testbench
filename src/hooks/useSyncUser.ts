import { useUser } from "@clerk/clerk-react";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useEffect } from "react";

export function useSyncUser() {
  const { user } = useUser();
  const createUser = useMutation(api.mutations.createUser);

  useEffect(() => {
    if (!user) return;

    // Sync user data with Convex
    createUser({
      clerkId: user.id,
      email: user.primaryEmailAddress?.emailAddress || "",
      firstName: user.firstName || "",
      lastName: user.lastName || "",
      isOnboardingCompleted: false, // default value for new users
    });
  }, [user, createUser]);

  return null;
}
