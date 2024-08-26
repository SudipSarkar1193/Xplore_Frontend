import React, { Suspense, lazy, useState } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { useQuery } from "@tanstack/react-query";

import "./index.css";
import { backendServer } from "./BackendServer";

import { BackgroundPage } from "./components/BackgroundPage/BackgroundPage";
import LoadingSpinner from "./components/common/LoadingSpinner";
import { SearchUser } from "./components/common/SearchUser";

const ErrorPage = lazy(() => import("./pages/error/ErrorPage"));

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
	const { data, isLoading, isError, error } = useQuery({
		queryKey: ["userAuth"],
		queryFn: async () => {
			const res = await fetch(`${backendServer}/api/v1/auth/me`, {
				method: "GET",
				headers: {
					"Content-Type": "application/json",
				},
				credentials: "include",
			});

			if (!res.ok) {
				// const errorMessage = await res.text();
				// throw new Error(errorMessage)

				const errorText = await res.text(); // Get the error as text
				const errorJsonString = errorText.replace("Error: ", ""); // Remove the 'Error: ' part
				const errorMessage = JSON.parse(errorJsonString); // Parse the JSON string
				throw errorMessage; // Throw the error as a JSON object
			}

			const jsonRes = await res.json();
			return jsonRes;
		},
		cacheTime: 1000 * 60 * 10,
		refetchOnWindowFocus: false,
		retry: false,
	});

	const StyledLoadingSpinner = () => (
		<div className="h-svh w-screen flex items-center justify-center">
			<LoadingSpinner size="lg" />
		</div>
	);

	if (isLoading) {
		return <BackgroundPage showHeading={true} />;
	}

	console.log(error.message);
	let authUser = null;

	if (
		isError &&
		error.message === "Unauthorized access Request" &&
		error.error === "Unauthorized access Request"
	) {
		authUser = false;
	} else if (!isError && error === null) {
		authUser = true;
	}

	return (
		<div className="flex justify-between max-w-6xl mx-auto">
			<Toaster />
			<Suspense fallback={<StyledLoadingSpinner />}>
				{authUser === true && (
					<>
						<Sidebar />
						<Routes>
							<Route path="/" element={<HomePage />} />
							<Route path="/login" element={<Navigate to="/" />} />

							<Route path="/notifications" element={<NotificationPage />} />
							<Route path="/profile/:username" element={<ProfilePage />} />
							<Route path="/bookmarks" element={<BookmarkPage />} />
							<Route path="/error" element={<ErrorPage />} />
							<Route path="*" element={<Navigate to="/error" />} />
						</Routes>
						<SearchUser />
					</>
				)}
				{authUser === false && (
					<>
						<BackgroundPage />
						<Routes>
							<Route path="/" element={<Navigate to="/login" />} />
							<Route path="/login" element={<LoginPage />} />
							<Route path="/signup" element={<RegisterPage />} />
							<Route
								path="/users/:id/verify/:token"
								element={<EmailVerifyPage />}
							/>
							<Route path="/error" element={<ErrorPage />} />
							<Route path="*" element={<Navigate to="/error" />} />
						</Routes>
					</>
				)}

				{(authUser === null || authUser === undefined) && <ErrorPage />}
			</Suspense>
		</div>
	);
};

export default App;
