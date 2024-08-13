import { Link } from "react-router-dom";
import RightPanelSkeleton from "../skeletons/RightPanelSkeleton.jsx";
import { useQuery } from "@tanstack/react-query";
import useFollow from "../../custom_hooks/useFollow.js";
import LoadingSpinner from "./LoadingSpinner.jsx";
import { useEffect } from "react";
import { backendServer } from "../../BackendServer.js";
import { IoIosPersonAdd } from "react-icons/io";

const RightPanel = ({ con = false }) => {
	const { data: suggestedUsers, isLoading } = useQuery({
		queryKey: ["suggestedUsers"],
		queryFn: async () => {
			try {
				const res = await fetch(`${backendServer}/api/v1/users/suggestions`, {
					method: "GET",
					headers: {
						"Content-Type": "application/json",
					},
					credentials: "include",
				});

				if (!res.ok) {
					return null;
				}
				const jsonRes = await res.json();

				return await jsonRes.data.suggestions;
			} catch (error) {
				console.log(error.message || "Error fetching suggestions");
			}
		},
		retry: false,
	});

	const { followUnfollow, isPending } = useFollow();

	const handleFollow = async (e, id) => {
		e.preventDefault();
		followUnfollow(id);
	};

	return (
		<div className={` ${con ? "block" : "hidden"} lg:block sticky my-4 ml-4 right:0`}>
			<div className={`${con ? "block" : "hidden"} lg:block  bg-[#16181C] p-4 rounded-md sticky top-2`}>
				<p className="font-bold mb-2">Who to follow </p>
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
						suggestedUsers?.map((user) => (
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
												@{user.username}
											</span>
										</div>
									</div>
								</Link>
								<div>
									<button
										className="btn bg-white text-black hover:bg-white hover:opacity-90 rounded-full btn-sm"
										onClick={(e) => handleFollow(e, user._id)}
									>
										{isPending ? <LoadingSpinner size="sm" /> : "Follow"}
									</button>
								</div>
							</div>
						))}
				</div>
			</div>
		</div>
	);
};
export default RightPanel;