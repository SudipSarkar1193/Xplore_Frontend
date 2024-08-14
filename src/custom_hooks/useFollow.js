import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { backendServer } from "../BackendServer";

const useFollow = () => {
	const queryClient = useQueryClient();

	const { mutate: followUnfollow, isPending } = useMutation({
		mutationFn: async (userId) => {
			try {
				const res = await fetch(
					`${backendServer}/api/v1/users/follow/${userId}`,
					{
						method: "POST",
						credentials: "include",
					}
				);

				const jsonRes = await res.json();

				if (!res.ok) {
					throw new Error(data.error || "Something went wrong!");
				}

				return jsonRes;
			} catch (error) {
				throw error;
			}
		},
		onSuccess: () => {
			Promise.all([
				queryClient.invalidateQueries({ queryKey: ["followStatus", userId] }),
				queryClient.invalidateQueries({ queryKey: ["suggestedUsers"] }),
				queryClient.invalidateQueries({ queryKey: ["userAuth"] }),
				queryClient.invalidateQueries({ queryKey: ["userProfile"] }),
			]);
		},
		onError: (error) => {
			toast.error(error.message);
		},
	});

	return { followUnfollow, isPending };
};

export default useFollow;
