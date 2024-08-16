import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { backendServer } from "../BackendServer";

const useUpdateUserProfile = () => {
	const queryClient = useQueryClient();

	const {
		mutateAsync: updateProfile,
		isPending: isUpdatingProfile,
		isSuccess,
	} = useMutation({
		mutationFn: async (formData) => {
			try {
				const res = await fetch(`${backendServer}/api/v1/users/update`, {
					method: "POST",
					headers: {
						"Content-Type": "application/json",
					},
					credentials: "include",
					body: JSON.stringify(formData),
				});
				const data = await res.json();
				if (!res.ok) {
					throw new Error(data.error || "Something went wrong");
				}
				return data;
			} catch (error) {
				throw error;
			}
		},
		onSuccess: () => {
			toast.success("Profile updated successfully");
			Promise.all([
				queryClient.invalidateQueries({ queryKey: ["userProfile" , ] }),
				queryClient.invalidateQueries({ queryKey: ["userAuth"] }),
				queryClient.invalidateQueries({ queryKey: ["posts"] }),
			]);
		},
		onError: (error) => {
			toast.error(error.message);
		},
	});

	return { updateProfile, isUpdatingProfile, isSuccess };
};

export default useUpdateUserProfile;
