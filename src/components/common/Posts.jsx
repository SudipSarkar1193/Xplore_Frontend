import Post from "./Post.jsx";
import PostSkeleton from "../skeletons/PostSkeleton.jsx";
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { backendServer } from "../../BackendServer.js";

const Posts = ({ feedType, userId }) => {
	// const isLoading = false;
	const endPoint = () => {
		const r = `${backendServer}/api/v1/posts`;

		switch (feedType) {
			case "forYou":
				return `${r}/all`;
			case "following":
				return `${r}/following`;
			case "posts":
				return `${r}/posts/${userId}`;
			case "likes":
				return `${r}/likes/${userId}`;
			default:
				return `${r}/all`;
		}
	};
	const { data, isLoading, refetch, isRefetching } = useQuery({
		queryKey: ["posts"],
		queryFn: async () => {
			try {
				const res = await fetch(endPoint(), {
					method: "GET",
					headers: {
						"Content-Type": "application/json",
					},
					credentials: "include",
				});

				const jsonRes = await res.json();

				if (!res.ok) {
					return null;
				}
				// console.log("post jsonRes", jsonRes);

				return jsonRes.data.posts;
			} catch (error) {
				throw new Error(error);
			}
		},
	});

	//Important !!!
	//if feed type is changed , we'd want useQuery to refetch the data

	useEffect(() => {
		refetch();
	}, [feedType, refetch, userId]);

	const posts = Array.isArray(data) ? data : [];


	return (
		<div className="">
			{(isLoading || isRefetching) && (
				<div className="flex flex-col justify-center">
					<PostSkeleton />
					<PostSkeleton />
					<PostSkeleton />
				</div>
			)}
			{!isLoading && posts?.length === 0 && (
				<p className="text-center my-4">No posts in this tab. Switch 👻</p>
			)}
			{!isLoading && posts && (
				<div>
					{posts.map((post) => (
						<Post key={post._id} post={post} />
					))}
				</div>
			)}
		</div>
	);
};
export default Posts;