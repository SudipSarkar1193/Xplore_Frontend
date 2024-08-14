import React, { Suspense, lazy } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { toast, Toaster } from "react-hot-toast";
import { useQuery } from "@tanstack/react-query";

import "./index.css";
import { backendServer } from "./BackendServer";

import { BackgroundPage } from "./components/BackgroundPage/BackgroundPage";
import LoadingSpinner from "./components/common/LoadingSpinner";
import SearchUser from "./components/common/SearchUser";

const HomePage = lazy(() => import("./pages/home/HomePage"));
const RegisterPage = lazy(() => import("./pages/auth/RegisterPage"));
const LoginPage = lazy(() => import("./pages/auth/LoginPage"));
const NotificationPage = lazy(() =>
	import("./pages/notification/NotificationPage")
);
const ProfilePage = lazy(() => import("./pages/profile/ProfilePage"));
const EmailVerifyPage = lazy(() => import("./pages/auth/EmailVerifyPage"));
const Sidebar = lazy(() => import("./components/common/Sidebar"));
const RightPanel = lazy(() => import("./components/common/RightPanel"));

const App = () => {
	const { data: authUser, isLoading } = useQuery({
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

				const jsonRes = await res.json();

				if (!res.ok) {
					return null;
				}
				return jsonRes;
			} catch (error) {
				throw new Error(error);
			}
		},

		retry: false,
		refetchOnWindowFocus: false,
	});

	const StyledLoadingSpinner = () => (
		<div className="h-svh w-screen flex items-center justify-center ">
			<LoadingSpinner size="lg" />
		</div>
	);
	if (isLoading) {
		return <BackgroundPage showHeading={true} isLoading={isLoading} />;
	}

	return (
		<div className="flex justify-between max-w-6xl mx-auto ">
			<Suspense fallback={<StyledLoadingSpinner />}>
				<BackgroundPage />
				{authUser && <Sidebar />}
				<Routes>
					<Route
						path="/"
						element={authUser ? <HomePage /> : <Navigate to="/login" />}
					/>
					<Route
						path="/signup"
						element={!authUser ? <RegisterPage /> : <Navigate to="/" />}
					/>
					<Route
						path="/login"
						element={!authUser ? <LoginPage /> : <Navigate to="/" />}
					/>
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
				</Routes>
				{authUser && <SearchUser />}
			</Suspense>

			<Toaster />
		</div>
	);
};

export default App;
