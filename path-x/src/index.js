import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import VolunteeringHomePage from "./PathX Volunteering/VolunteeringHomePage";
import VolunteeringDashboardPage from "./PathX Volunteering/VolunteeringDashboardPage";
import VolunteeringOpportunitiesPage from "./PathX Volunteering/VolunteeringOpportunitiesPage";
import VolunteeringNavbar from "./PathX Volunteering/VolunteeringNavbar";
import ErrorPage from "./ErrorPage";
import reportWebVitals from "./reportWebVitals";
import { NotificationProvider } from "./NotificationContext";
import ProtectedRoute from "./ProtectedRoute";
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import AboutPage from "./AboutPage";
import VolunteeringDetailsPage from "./PathX Volunteering/VolunteeringDetailsPage";
import VolunteeringOrganizationPage from "./PathX Volunteering/VolunteeringOrganizationPage";
import HomePage from "./HomePage";

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
				<VolunteeringNavbar />
				<Routes>
					<Route path="/" element={<HomePage />} />
					<Route path="/volunteering" element={<VolunteeringHomePage />} />
					<Route
						path="/volunteering/dashboard"
						element={<ProtectedRoute element={<VolunteeringDashboardPage />} />}
					/>
					<Route
						path="/volunteering/opportunities"
						element={
							<ProtectedRoute element={<VolunteeringOpportunitiesPage />} />
						}
					/>
					<Route path="/about" element={<AboutPage />} />
					<Route
						path="/volunteering/opportunity/:id"
						element={<ProtectedRoute element={<VolunteeringDetailsPage />} />}
					/>
					<Route
						path="/volunteering/organization/:orgId"
						element={
							<ProtectedRoute element={<VolunteeringOrganizationPage />} />
						}
					/>
					<Route path="*" element={<ErrorPage />} />
				</Routes>
			</NotificationProvider>
		</BrowserRouter>
	</React.StrictMode>
);

reportWebVitals();
