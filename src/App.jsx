import React, { Suspense, lazy } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import RightPanel from "./components/common/RightPanel";
import { toast, Toaster } from "react-hot-toast";
import { useQuery } from "@tanstack/react-query";
import LoadingSpinner from "./components/common/LoadingSpinner";
import "./index.css";
import { backendServer } from "./BackendServer";

const HomePage = lazy(() => import("./pages/home/HomePage"));
const RegisterPage = lazy(() => import("./pages/auth/RegisterPage"));
const LoginPage = lazy(() => import("./pages/auth/LoginPage"));
const NotificationPage = lazy(() =>
	import("./pages/notification/NotificationPage")
);
const ProfilePage = lazy(() => import("./pages/profile/ProfilePage"));
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

				console.log("res", res);
				console.log("res.ok", res.ok);

				console.log("jsonRes", jsonRes);
				console.log("jsonRes.error", jsonRes.error);

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

	if (isLoading) {
		return (
			<div className="max-h-screen w-screen flex items-center justify-center ">
				<LoadingSpinner size="lg" />
			</div>
		);
	}

	return (
		<div className="flex justify-between max-w-6xl mx-auto">
			{authUser && <Sidebar />}

			<Suspense fallback={<LoadingSpinner size="lg" />}>
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
				</Routes>
			</Suspense>

			{authUser && <RightPanel />}
			<Toaster />
		</div>
	);
};

export default App;
