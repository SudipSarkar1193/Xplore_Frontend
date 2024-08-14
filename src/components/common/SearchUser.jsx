import { useQuery, useQueryClient } from "@tanstack/react-query";
import React, { useEffect, useState } from "react";
import RightPanelSkeleton from "../skeletons/RightPanelSkeleton";
import { backendServer } from "../../BackendServer";
import { Link } from "react-router-dom";
import RightPanel from "./RightPanel";
import { FaSearch } from "react-icons/fa";

// "suggestedUsers"

export const SearchUser = ({ show = false }) => {
	const [search, setSearch] = useState("");

	const queryClient = useQueryClient();

	const { data: users, isLoading } = useQuery({
		queryKey: ["users"],
		queryFn: async () => {
			try {
				const res = await fetch(
					`${backendServer}/api/v1/users/getusers/users`,
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

	useEffect(() => {
		// Promise.all([
		// 	queryClient.invalidateQueries({ queryKey: ["users"] }),
		// 	queryClient.invalidateQueries({ queryKey: ["suggestedUsers"] }), //Maybe dont need to
		// ]);

		queryClient.invalidateQueries({ queryKey: ["users"] });
	}, [search]);

	return (
		<div className={`${show ? "block" : "hidden"} lg:block`}>
			<div className={` block  lg:block sticky my-4 ml-4 right:0`}>
				<div
					className={` block lg:block  bg-transparent p-4 rounded-md sticky top-2 `}
				>
					<div className="flex flex-col gap-4">
						<label className="input input-bordered  rounded-lg flex items-center gap-2 ">
							<FaSearch />
							<input
								type="text"
								// className="grow"
								placeholder="Search"
								onChange={(e) => setSearch(e.target.value)}
							/>
						</label>

						<p className="font-bold mb-2">Who to follow... </p>

						{!search && <RightPanel con={true} />}

						{search &&
							!isLoading &&
							users
								?.filter(
									(user) =>
										user.username.toLowerCase().includes(search) ||
										user.fullName.toLowerCase().includes(search)
								)
								?.map((user) => (
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
												{isLoading ? <LoadingSpinner size="sm" /> : "Follow"}
											</button>
										</div>
									</div>
								))}
					</div>
				</div>
			</div>
		</div>
	);
};

export default SearchUser;
