import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNotification } from "./NotificationContext";
import { AgGridReact } from "ag-grid-react";
import "./DashboardPage.css";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-alpine.css";
import {
	getAuth,
	updateProfile,
	// updateEmail,
	deleteUser,
	reauthenticateWithPopup,
	GoogleAuthProvider,
	OAuthProvider,
} from "firebase/auth";
import { Link, useNavigate } from "react-router-dom";
import { getUserIdByEmail } from "./apiUtils";
import { Bar, Pie } from "react-chartjs-2";
import {
	Chart as ChartJS,
	CategoryScale,
	LinearScale,
	BarElement,
	ArcElement,
	Tooltip,
	Legend,
} from "chart.js";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";

ChartJS.register(
	CategoryScale,
	LinearScale,
	BarElement,
	ArcElement,
	Tooltip,
	Legend
);

const DashboardPage = () => {
	const [userData, setUserData] = useState({
		pastOpportunities: [],
		savedOpportunities: [],
		favorites: [],
		upcomingEvents: [],
	});
	const [profileData, setProfileData] = useState(null);
	const [isModalOpen, setModalOpen] = useState(false);
	const { addNotification } = useNotification();
	const auth = getAuth();
	const user = auth.currentUser;
	const navigate = useNavigate();
	const [hoursData, setHoursData] = useState([]);
	const [categoryData, setCategoryData] = useState([]);
	const [graphRange, setGraphRange] = useState(12); // Default to last 12 months
	const [categoryRange, setCategoryRange] = useState("year"); // Default to year

	useEffect(() => {
		const fetchUserData = async () => {
			try {
				if (user.email) {
					const userId = await getUserIdByEmail(user.email);
					const dashboardResponse = await axios.get(
						`${process.env.REACT_APP_SERVER}/user/dashboard`,
						{
							params: { user_id: userId },
						}
					);

					const eventsResponse = await axios.get(
						`${process.env.REACT_APP_SERVER}/user/accepted_events`,
						{
							params: { user_id: userId },
						}
					);

					const profileResponse = await axios.get(
						`${process.env.REACT_APP_SERVER}/user/profile`,
						{
							params: { user_id: userId },
						}
					);

					const { pastOpportunities } = dashboardResponse.data;
					processPastEvents(pastOpportunities);

					setUserData({
						...dashboardResponse.data,
						upcomingEvents: eventsResponse.data,
					});
					setProfileData(profileResponse.data);
				}
			} catch (error) {
				console.error("Error fetching user data", error);
				addNotification("Failed to load dashboard data. " + error, "error");
			}
		};

		fetchUserData();
	}, [categoryRange]);

	const handleEditProfile = async (updatedProfile) => {
		try {
			const userId = await getUserIdByEmail(user.email);

			const requestData = {
				user_id: userId,
				email: user.email,
				...updatedProfile,
			};

			await axios.post(
				`${process.env.REACT_APP_SERVER}/user/update_profile`,
				requestData
			);
			setProfileData({ ...profileData, ...updatedProfile });

			updateProfile(user, {
				displayName: updatedProfile.name,
				photoURL: updatedProfile.profile_picture_url,
			})
				.then(() => {
					// if (updatedProfile.email !== user.email) {
					// 	const reauthProvider =
					// 		user.providerData[0].providerId === "google.com"
					// 			? new GoogleAuthProvider()
					// 			: new OAuthProvider();
					// 	alert("Please confirm by signing in with your old email.");
					// 	reauthenticateWithPopup(user, reauthProvider)
					// 		.then(() => {
					// 			updateEmail(user, updatedProfile.email)
					// 				.then(() => {
					// 					setModalOpen(false);
					// 					addNotification("Profile updated successfully.", "success");
					// 				})
					// 				.catch((error) => {
					// 					console.error("Error updating profile", error);
					// 					addNotification("Failed to update profile. " + error, "error");
					// 				});
					// 		})
					// 		.catch((error) => {
					// 			console.error("Error updating profile", error);
					// 			addNotification("Failed to update profile. " + error, "error");
					// 		});
					// } else {
					// 	setModalOpen(false);
					// 	addNotification("Profile updated successfully.", "success");
					// }
					setModalOpen(false);
					addNotification("Profile updated successfully.", "success");
				})
				.catch((error) => {
					console.error("Error updating profile", error);
					addNotification("Failed to update profile. " + error, "error");
				});
		} catch (error) {
			console.error("Error updating profile", error);
			addNotification("Failed to update profile. " + error, "error");
		}
	};

	const handleDeleteAccount = async () => {
		try {
			const userId = await getUserIdByEmail(user.email);

			if (
				window.confirm(
					"Are you sure you want to delete your account? This action cannot be undone."
				)
			) {
				await axios.delete(`${process.env.REACT_APP_SERVER}/user/delete`, {
					params: { user_id: userId },
				});
				const reauthProvider =
					user.providerData[0].providerId === "google.com"
						? new GoogleAuthProvider()
						: new OAuthProvider("microsoft.com");
				alert("Please confirm by signing in.");
				reauthenticateWithPopup(user, reauthProvider)
					.then(() => {
						deleteUser(user)
							.then(() => {
								addNotification("Account deleted successfully.", "success");
								navigate("/");
								auth.signOut();
							})
							.catch((error) => {
								console.error("Error deleting account", error);
								addNotification("Failed to delete account. " + error, "error");
							});
					})
					.catch((error) => {
						console.error("Error deleting account", error);
						addNotification("Failed to delete account. " + error, "error");
					});
			}
		} catch (error) {
			console.error("Error deleting account", error);
			addNotification("Failed to delete account. " + error, "error");
		}
	};

	const processPastEvents = (pastOpportunities) => {
		const now = new Date();
		const monthHours = new Array(24).fill(0);
		const categoryCounts = {};

		pastOpportunities.forEach((opp) => {
			const completedDate = new Date(opp.completed_at);
			const monthDifference =
				now.getFullYear() * 12 +
				now.getMonth() -
				(completedDate.getFullYear() * 12 + completedDate.getMonth());
			const isInRange =
				(categoryRange === "month" &&
					completedDate.getMonth() === now.getMonth() &&
					completedDate.getFullYear() === now.getFullYear()) ||
				(categoryRange === "year" &&
					completedDate.getFullYear() === now.getFullYear());

			if (monthDifference < 24) {
				monthHours[monthDifference] += parseFloat(opp.length) || 0;
			}

			// Split categories and add hours for each category
			if (isInRange) {
				const categories = opp.category.split(", ").map((cat) => cat.trim());
				categories.forEach((category) => {
					if (
						categoryRange === "month" &&
						completedDate.getMonth() === now.getMonth() &&
						completedDate.getFullYear() === now.getFullYear()
					) {
						categoryCounts[category] =
							(parseFloat(categoryCounts[category]) || 0) +
							parseFloat(opp.length);
					}

					if (
						categoryRange === "year" &&
						completedDate.getFullYear() === now.getFullYear()
					) {
						categoryCounts[category] =
							(parseFloat(categoryCounts[category]) || 0) +
							parseFloat(opp.length);
					}
				});
			}
		});

		setHoursData(monthHours.reverse());
		setCategoryData(categoryCounts);
	};

	const barData = {
		labels: Array.from({ length: graphRange }, (_, i) => {
			const date = new Date();
			date.setMonth(date.getMonth() - (graphRange - 1 - i));
			return `${date.toLocaleString("default", {
				month: "short",
			})} ${date.getFullYear()}`;
		}),
		datasets: [
			{
				label: " Hours Volunteered",
				data: hoursData.slice(-graphRange),
				backgroundColor: "#2a9d8f",
			},
		],
	};

	const pieData = {
		labels: Object.keys(categoryData),
		datasets: [
			{
				label: " Hours",
				data: Object.values(categoryData),
				backgroundColor: ["#2a9d8f", "#e76f51", "#f4a261", "#264653"],
			},
		],
	};

	const pastOpportunitiesColumns = [
		{ headerName: "Title", field: "title", flex: 1 },
		{ headerName: "Completed At", field: "completed_at", flex: 1 },
		{ headerName: "Category", field: "category", flex: 1 },
		{ headerName: "Organization", field: "organization", flex: 1 },
		{ headerName: "Duration", field: "length", flex: 1 },
	];

	const savedOpportunitiesColumns = [
		{
			headerName: "Opportunity",
			field: "title",
			flex: 1,
			cellRenderer: (params) => {
				const url = "/opportunity/" + params.data.id || "#";
				return (
					<Link to={url} rel="noopener noreferrer" className="saved-sign-up">
						{params.value}
					</Link>
				);
			},
		},
		{ headerName: "Date(s)", field: "date", flex: 1 },
		{ headerName: "Time(s)", field: "time", flex: 1 },
		{ headerName: "Location", field: "location", flex: 1 },
		{ headerName: "Organization", field: "organization", flex: 1 },
		{ headerName: "Duration", field: "length", flex: 1 },
	];

	const favoritesColumns = [
		{
			headerName: "Organization",
			field: "name",
			flex: 1,
			cellRenderer: (params) => {
				const url = "/organization/" + params.data.id || "#";
				return (
					<Link to={url} rel="noopener noreferrer" className="saved-sign-up">
						{params.value}
					</Link>
				);
			},
		},
		{ headerName: "Description", field: "description", flex: 1 },
	];

	const upcomingEventsColumns = [
		{ headerName: "Title", field: "title", flex: 1 },
		{ headerName: "Date(s)", field: "date", flex: 1 },
		{ headerName: "Time(s)", field: "time", flex: 1 },
		{ headerName: "Location", field: "location", flex: 1 },
		{ headerName: "Organization", field: "organization", flex: 1 },
		{ headerName: "Duration", field: "length", flex: 1 },
	];

	return (
		<div className="dashboard-page">
			<h1>Your Dashboard</h1>

			<div className="dashboard-cards">
				<div className="dashboard-card">
					<h4>Upcoming Events</h4>
					<div
						className="ag-theme-alpine"
						style={{ height: 300, width: "100%" }}
					>
						<AgGridReact
							rowData={userData.upcomingEvents.map((event) => ({
								id: event.id,
								title: event.title,
								date: event.date
									? new Date(event.date).toLocaleDateString()
									: "N/A",
								time: event.date
									? new Date(event.date).toLocaleTimeString()
									: "N/A",
								location: event.location || "N/A",
								organization: event.organization || "N/A",
								length: event.length || "N/A",
							}))}
							columnDefs={upcomingEventsColumns}
							pagination={true}
						/>
					</div>
				</div>

				<div className="dashboard-card">
					<h4>Past Events</h4>
					<div
						className="ag-theme-alpine"
						style={{ height: 300, width: "100%" }}
					>
						<AgGridReact
							rowData={userData.pastOpportunities.map((opp) => ({
								id: opp.id,
								title: opp.title,
								completed_at: new Date(opp.completed_at).toLocaleDateString(),
								category: opp.category || "N/A",
								organization: opp.organization || "N/A",
								length: opp.length || "N/A",
							}))}
							columnDefs={pastOpportunitiesColumns}
							pagination={true}
						/>
					</div>
				</div>

				<div className="dashboard-card">
					<h4>Saved Opportunities</h4>
					<div
						className="ag-theme-alpine"
						style={{ height: 300, width: "100%" }}
					>
						<AgGridReact
							rowData={userData.savedOpportunities.map((opp) => ({
								id: opp.id,
								title: opp.title,
								signup_url: opp.signup_url,
								date: opp.date
									? new Date(opp.date).toLocaleDateString()
									: "N/A",
								time: opp.date
									? new Date(opp.date).toLocaleTimeString()
									: "N/A",
								location: opp.location || "N/A",
								category: opp.category || "N/A",
								organization: opp.organization || "N/A",
								length: opp.length || "N/A",
							}))}
							columnDefs={savedOpportunitiesColumns}
							pagination={true}
						/>
					</div>
				</div>

				<div className="dashboard-card">
					<h4>Favorited Organizations</h4>
					<div
						className="ag-theme-alpine"
						style={{ height: 300, width: "100%" }}
					>
						<AgGridReact
							rowData={userData.favorites}
							columnDefs={favoritesColumns}
							pagination={true}
						/>
					</div>
				</div>
			</div>

			<div className="profile-section">
				{profileData && (
					<div className="profile-card">
						<h4>Profile</h4>
						<img
							src={profileData.profile_picture_url}
							alt="Profile"
							className="profile-picture"
						/>
						<h3>{profileData.name}</h3>
						<p>Email: {profileData.email}</p>
						<p>Total Volunteering Hours: {profileData.total_hours}</p>
						<div className="profile-actions">
							<button
								className="cta-button primary edit-profile"
								onClick={() => setModalOpen(true)}
							>
								Edit Profile
							</button>
							<button
								className="cta-button danger del-profile"
								onClick={handleDeleteAccount}
							>
								Delete Account
							</button>
						</div>
					</div>
				)}

				{/* Volunteer Hours Graph */}
				<div className="profile-card graph-card">
					<h4>Volunteer Hours</h4>
					<div className="inner-graph">
						<Bar
							data={barData}
							options={{ maintainAspectRatio: false, responsive: true }}
						/>
					</div>
					<select
						value={graphRange}
						onChange={(e) => setGraphRange(Number(e.target.value))}
						className="dashboard-dropdown"
					>
						<option value={6}>Last 6 Months</option>
						<option value={12}>Last 12 Months</option>
						<option value={24}>Last 24 Months</option>
					</select>
				</div>

				{/* Volunteer Categories Graph */}
				<div className="profile-card graph-card">
					<h4>Volunteer Categories</h4>
					<div className="inner-graph">
						{Object.keys(categoryData).length > 0 ? (
							<Pie
								data={pieData}
								options={{ maintainAspectRatio: false, responsive: true }}
							/>
						) : (
							<p>No data available for the selected range.</p>
						)}
					</div>
					<select
						value={categoryRange}
						onChange={(e) => setCategoryRange(e.target.value)}
						className="dashboard-dropdown"
					>
						<option value="month">This Month</option>
						<option value="year">This Year</option>
					</select>
				</div>

				{/* Calendar */}
				<div className="profile-card calendar-card">
					<h4>Event Calendar</h4>
					<FullCalendar
						plugins={[dayGridPlugin, timeGridPlugin]}
						initialView="dayGridMonth"
						headerToolbar={{
							left: "prev,next today",
							center: "title",
							right: "dayGridMonth,timeGridWeek",
						}}
						events={userData.upcomingEvents.map((event) => ({
							title: event.title,
							start: event.date,
							allDay: true,
						}))}
					/>
				</div>
			</div>

			{isModalOpen && (
				<div className="modal-backdrop">
					<div className="modal">
						<h2>Edit Profile</h2>
						<form
							onSubmit={(e) => {
								e.preventDefault();
								const updatedProfile = {
									name: e.target.name.value,
									// email: e.target.email.value,
									profile_picture_url: e.target.profile_picture_url.value,
								};
								handleEditProfile(updatedProfile);
							}}
						>
							<div>
								<label className="modal-label">Name:</label>
								<input
									type="text"
									name="name"
									defaultValue={profileData.name}
									required
									className="modal-input"
								/>
							</div>
							{/* <div>
								<label className="modal-label">Email:</label>
								<input
									type="email"
									name="email"
									defaultValue={profileData.email}
									required
									className="modal-input"
								/>
							</div> */}
							<div>
								<label className="modal-label">Profile Picture URL:</label>
								<input
									type="text"
									name="profile_picture_url"
									defaultValue={profileData.profile_picture_url}
									className="modal-input"
								/>
							</div>
							<button type="submit" className="cta-button primary">
								Save
							</button>
							<button
								type="button"
								className="modal-close"
								onClick={() => setModalOpen(false)}
							>
								Cancel
							</button>
						</form>
					</div>
				</div>
			)}
		</div>
	);
};

export default DashboardPage;
