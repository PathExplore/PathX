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
import Navbar from "./Navbar";
import InternshipsHomePage from "./PathX Internships/InternshipsHomePage";
import SummerProgramsHomePage from "./PathX Summer Programs/SummerProgramsHomePage";
import CompetitionsHomePage from "./PathX Competitions/CompetitionsHomePage";

// Firebase configuration
const firebaseConfig = {
	apiKey: "AIzaSyAhQQRDG2IK5WxeF0YHumVaB92NepnZfrs",
	authDomain: "civicspark-app.firebaseapp.com",
	projectId: "civicspark-app",
	storageBucket: "civicspark-app.appspot.com",
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
				<Routes>
					<Route
						path="/*"
						element={
							<>
								<Navbar />
								<Routes>
									<Route path="/" element={<HomePage />} />
									<Route path="/about" element={<AboutPage />} />
									<Route path="*" element={<ErrorPage />} />
								</Routes>
							</>
						}
					/>

					<Route
						path="/volunteering/*"
						element={
							<>
								<VolunteeringNavbar />
								<Routes>
									<Route path="/" element={<VolunteeringHomePage />} />
									<Route
										path="/dashboard"
										element={
											<ProtectedRoute element={<VolunteeringDashboardPage />} />
										}
									/>
									<Route
										path="/opportunities"
										element={
											<ProtectedRoute
												element={<VolunteeringOpportunitiesPage />}
											/>
										}
									/>
									<Route
										path="/opportunity/:id"
										element={
											<ProtectedRoute element={<VolunteeringDetailsPage />} />
										}
									/>
									<Route
										path="/organization/:orgId"
										element={
											<ProtectedRoute
												element={<VolunteeringOrganizationPage />}
											/>
										}
									/>
								</Routes>
							</>
						}
					/>

					{/* Internships */}
					<Route path="/internships" element={<InternshipsHomePage />} />

					{/* Summer Programs */}
					<Route path="/summer-programs" element={<SummerProgramsHomePage />} />

					{/* Competitions */}
					<Route path="/competitions" element={<CompetitionsHomePage />} />
				</Routes>
			</NotificationProvider>
		</BrowserRouter>
	</React.StrictMode>
);

reportWebVitals();
