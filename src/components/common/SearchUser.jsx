import React, { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import RightPanel from "./RightPanel";
import { FaSearch } from "react-icons/fa";
import { useFollowStatus } from "../../custom_hooks/useFollowStatus";
import useFollow from "../../custom_hooks/useFollow";
import { backendServer } from "../../BackendServer";
import LoadingSpinner from "./LoadingSpinner";

export const SearchUser = ({ show = false, limit = 15 }) => {
	const [search, setSearch] = useState("");
	const queryClient = useQueryClient();
	const [loadingUserId, setLoadingUserId] = useState(null);

	const { data: users, isLoading } = useQuery({
		queryKey: ["users"],
		queryFn: async () => {
			const res = await fetch(`${backendServer}/api/v1/users/getusers/users`, {
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
			return jsonRes.data.users;
		},
		retry: false,
	});

	const { followUnfollow, isPending } = useFollow();

	const handleFollow = async (e, id) => {
		e.preventDefault();
		setLoadingUserId(id);
		try {
			followUnfollow(id);

			// set the follow status in the cache memory
			queryClient.setQueryData(["followStatus", id], (prev) => !prev);
		} catch (error) {
			console.log("Error during follow/unfollow:", error);
		} finally {
			setLoadingUserId(null);
		}
	};

	return (
		<div className={`${show ? "block" : "hidden"} lg:block`}>
			<div className={`block lg:block sticky my-4 ml-4 right:0`}>
				<div
					className={`block lg:block bg-transparent p-4 rounded-md sticky top-2`}
				>
					<div className="flex flex-col gap-4">
						<label className="input input-bordered rounded-lg flex items-center gap-2">
							<FaSearch />
							<input
								type="text"
								placeholder="Search"
								onChange={(e) => setSearch(e.target.value)}
							/>
						</label>

						<p className="font-bold mb-2">Who to follow...</p>

						{!search && <RightPanel con={true} />}

						{search &&
							!isLoading &&
							users
								?.filter(
									(user) =>
										user.username
											.toLowerCase()
											.includes(search.toLowerCase()) ||
										user.fullName.toLowerCase().includes(search.toLowerCase())
								)
								?.map((user) => {
									const followStatus = queryClient.getQueryData([
										"followStatus",
										user._id,
									]);

									return (
										<div
											className="flex items-center justify-between gap-4"
											key={user._id}
										>
											<Link to={`/profile/${user?.username}`}>
												<div className="flex gap-2 items-center">
													<div className="avatar">
														<div className="w-8 rounded-full">
															<img
																src={
																	user.profileImg || "/avatar-placeholder.png"
																}
																alt={user.username}
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
												<div onClick={(e) => handleFollow(e, user._id)}>
													{loadingUserId == user._id ? (
														<LoadingSpinner size="sm" />
													) : followStatus ? (
														<button className="btn bg-transparent text-gray-400 hover:bg-slate-500  active:bg-slate-500 rounded-full btn-sm  border-zinc-600">
															Unfollow
														</button>
													) : (
														<button className="btn bg-white text-black  hover:bg-slate-500 active:bg-slate-500 rounded-full btn-sm">
															Follow
														</button>
													)}
												</div>
											</div>
										</div>
									);
								})}
					</div>
				</div>
			</div>
		</div>
	);
};
