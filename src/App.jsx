import React, { Suspense, lazy, useEffect } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { useQuery } from "@tanstack/react-query";

import "./index.css";
import { backendServer } from "./BackendServer";

import { BackgroundPage } from "./components/BackgroundPage/BackgroundPage";
import LoadingSpinner from "./components/common/LoadingSpinner";
import { SearchUser } from "./components/common/SearchUser";
// import LoginPage from "./pages/auth/LoginPage";

const HomePage = lazy(() => import("./pages/home/HomePage"));
const RegisterPage = lazy(() => import("./pages/auth/RegisterPage"));
const LoginPage = lazy(() => import("./pages/auth/LoginPage"));
const NotificationPage = lazy(() =>
	import("./pages/notification/NotificationPage")
);
const BookmarkPage = lazy(() => import("./pages/profile/BookmarkPage"));
const ProfilePage = lazy(() => import("./pages/profile/ProfilePage"));
const EmailVerifyPage = lazy(() => import("./pages/auth/EmailVerifyPage"));
const Sidebar = lazy(() => import("./components/common/Sidebar"));
const RightPanel = lazy(() => import("./components/common/RightPanel"));

const App = () => {
	//let authUser;
	console.log("hiey");
	const {
		data: authUser,
		isLoading,
		isError,
		error,
		isSuccess,
	} = useQuery({
		queryKey: ["userAuth"],
		queryFn: async () => {
			try {
				const res = await fetch(`${backendServer}/api/v1/auth/me`, {
					method: "GET",
					headers: {
						"Content-Type": "application/json",
					},
					credentials: "include",
				});

				if (!res.ok) {
					const errorMessage = await res.text(); // Retrieve the error message from the response
					console.error("DEBUG : Failed to fetch user authentication data");

					throw new Error(errorMessage); // Throw error to trigger onError callback
				}

				const jsonRes = await res.json();

				return jsonRes;
			} catch (error) {
				console.error("Error fetching user data:", error.message);
				throw new Error(error.message);
			}
		},
		staleTime: 1000 * 60 * 5, // 5 minutes
		cacheTime: 1000 * 60 * 10, // 10 minutes
		refetchOnWindowFocus: false,
		retry: false,
		onError: (err) => {
			console.error("Error fetching user data:", err.message);
		},
	});

	const StyledLoadingSpinner = () => (
		<div className="h-svh w-screen flex items-center justify-center">
			<LoadingSpinner size="lg" />
		</div>
	);

	if (isLoading) {
		return <BackgroundPage showHeading={true} isLoading={isLoading} />;
	}

	if (isError) {
		<Navigate to="/login" />;
	}

	return (
		<div className="flex justify-between max-w-6xl mx-auto">
			<Toaster />
			<Suspense fallback={<StyledLoadingSpinner />}>
				{!authUser && <BackgroundPage />}
				{authUser && <Sidebar />}
				<Routes>
					<Route
						path="/"
						element={authUser ? <HomePage /> : <Navigate to="/login" />}
					/>

					<Route path="/signup"  element={!authUser ?<RegisterPage />:<Navigate to="/" />} />
					<Route path="/login" element={!authUser ?<LoginPage />:<Navigate to="/" />} />

					<Route
						path="/notifications"
						element={authUser ? <NotificationPage /> : <Navigate to="/login" />}
					/>

					<Route
						path="/profile/:username"
						element={authUser ? <ProfilePage /> : <Navigate to="/login" />}
					/>
					
					<Route
						path="/users/:id/verify/:token"
						element={<EmailVerifyPage />}
					/>

					<Route
						path="/bookmarks"
						element={authUser ? <BookmarkPage /> : <Navigate to="/login" />}
					/>
				</Routes>
				{authUser && <SearchUser />}
			</Suspense>
		</div>
	);
};

export default App;
