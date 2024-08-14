import { useQuery } from "@tanstack/react-query";
import { backendServer } from "../BackendServer";


export const useFollowStatus = (userId) => {
    return useQuery({
        queryKey: ["followStatus", userId],
        queryFn: async () => {
            const res = await fetch(
                `${backendServer}/api/v1/users/user/follows/${userId}`,
                {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    credentials: "include",
                }
            );

            if (!res.ok) {
                throw new Error("Error fetching follow status");
            }

            const jsonRes = await res.json();
            return jsonRes.data;
        },
        enabled: !!userId, // Only run query if userId is defined
    });
};
