import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import HomePage from "./HomePage";
import DashboardPage from "./DashboardPage";
import OpportunitiesPage from "./OpportunitiesPage";
import Navbar from "./Navbar";
import ErrorPage from "./ErrorPage";
import reportWebVitals from "./reportWebVitals";
import { NotificationProvider } from "./NotificationContext";
import ProtectedRoute from "./ProtectedRoute";
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import AboutPage from "./AboutPage";
import DetailsPage from "./DetailsPage";
import OrganizationPage from "./OrganizationPage";

// Firebase configuration
const firebaseConfig = {
	apiKey: "AIzaSyAhQQRDG2IK5WxeF0YHumVaB92NepnZfrs",
	authDomain: "civicspark-app.firebaseapp.com",
	projectId: "civicspark-app",
	storageBucket: "civicspark-app.firebasestorage.app",
	messagingSenderId: "993495302329",
	appId: "1:993495302329:web:3f49e9998ec75e6d13db68",
	measurementId: "G-5LCYV8EW5L",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const analytics = getAnalytics(app);

ReactDOM.createRoot(document.getElementById("root")).render(
	<React.StrictMode>
		<BrowserRouter>
			<NotificationProvider>
				<Navbar />
				<Routes>
					<Route path="/" element={<HomePage />} />
					<Route
						path="/dashboard"
						element={<ProtectedRoute element={<DashboardPage />} />}
					/>
					<Route
						path="/opportunities"
						element={<ProtectedRoute element={<OpportunitiesPage />} />}
					/>
					<Route path="/about" element={<AboutPage />} />
					<Route
						path="/opportunity/:id"
						element={<ProtectedRoute element={<DetailsPage />} />}
					/>
					<Route
						path="/organization/:orgId"
						element={<ProtectedRoute element={<OrganizationPage />} />}
					/>
					<Route path="*" element={<ErrorPage />} />
				</Routes>
			</NotificationProvider>
		</BrowserRouter>
	</React.StrictMode>
);

reportWebVitals();
