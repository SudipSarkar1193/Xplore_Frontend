import { Link } from "react-router-dom";
import RightPanelSkeleton from "../skeletons/RightPanelSkeleton.jsx";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import useFollow from "../../custom_hooks/useFollow.js";
import LoadingSpinner from "./LoadingSpinner.jsx";
import { useEffect, useState } from "react";
import { backendServer } from "../../BackendServer.js";
import { IoIosPersonAdd } from "react-icons/io";

const RightPanel = ({ con = true, limit = 15 }) => {
	const [loadingUserId, setLoadingUserId] = useState(null);
	const queryClient = useQueryClient();
	const { data: suggestedUsers, isLoading } = useQuery({
		queryKey: ["suggestedUsers"],
		queryFn: async () => {
			try {
				const res = await fetch(
					`${backendServer}/api/v1/users/getusers/suggestions`,
					{
						method: "GET",
						headers: {
							"Content-Type": "application/json",
						},
						credentials: "include",
					}
				);

				if (!res.ok) {
					return null;
				}
				const jsonRes = await res.json();

				return await jsonRes.data.users;
			} catch (error) {
				console.log(error.message || "Error fetching suggestions");
			}
		},
		retry: false,
	});

	const { data: authUser } = useQuery({ queryKey: ["userAuth"] });

	const { followUnfollow, isPending } = useFollow();

	const handleFollow = async (e, id) => {
		console.log(id);
		e.preventDefault();
		setLoadingUserId(id);
		try {
			followUnfollow(id);
		} catch (error) {
			console.log("Error during follow/unfollow:", error);
		} finally {
			setLoadingUserId(null);
		}
	};

	return (
		<div className={`  lg:block sticky my-4 ml-4 right:0 `}>
			<div className={`block lg:block   p-4 rounded-md sticky top-2`}>
				<div className="flex flex-col gap-4">
					{/* item */}
					{isLoading && (
						<>
							<RightPanelSkeleton />
							<RightPanelSkeleton />
							<RightPanelSkeleton />
							<RightPanelSkeleton />
							<RightPanelSkeleton />
						</>
					)}
					{!isLoading &&
						suggestedUsers?.map((user) => {
							const isFollowing = authUser?.following.includes(user?._id);
							return (
								<div className="flex items-center justify-between gap-4">
									<Link to={`/profile/${user?.username}`} key={user._id}>
										<div className="flex gap-2 items-center">
											<div className="avatar">
												<div className="w-8 rounded-full">
													<img
														src={user.profileImg || "/avatar-placeholder.png"}
													/>
												</div>
											</div>
											<div className="flex flex-col">
												<span className="font-semibold tracking-tight truncate w-28">
													{user.fullName}
												</span>
												<span className="text-sm text-slate-500">
													@
													{user.username.length < limit - 3
														? user.username
														: user.username.slice(0, limit - 3) + "..."}
												</span>
											</div>
										</div>
									</Link>
									<div>
										<button
											className="btn btn-outline rounded-full btn-sm"
											onClick={(e) => handleFollow(e, user._id)}
										>
											{isPending && loadingUserId == user._id  && <LoadingSpinner size="sm" />}
											{!isPending && (isFollowing ? "Unfollow" : "Follow")}
										</button>
									</div>
								</div>
							);
						})}
				</div>
			</div>
		</div>
	);
};
export default RightPanel;
