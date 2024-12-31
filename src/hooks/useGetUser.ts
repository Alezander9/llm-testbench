import { useQuery } from "convex/react";
import { useUser } from "@clerk/clerk-react";
import { api } from "../../convex/_generated/api";

export function useGetUser() {
  const { user } = useUser();
  const currentUser = useQuery(api.queries.getUserByClerkId, {
    clerkId: user?.id ?? "",
  });

  return currentUser;
}
