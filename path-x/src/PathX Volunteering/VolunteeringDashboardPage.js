import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNotification } from "../NotificationContext";
import { AgGridReact } from "ag-grid-react";
import "./VolunteeringDashboardPage.css";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-alpine.css";
import { getAuth } from "firebase/auth";
import { Link, useNavigate } from "react-router-dom";
import { getUserIdByEmail } from "../apiUtils";
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

const VolunteeringDashboardPage = () => {
	const [userData, setUserData] = useState({
		pastOpportunities: [],
		savedOpportunities: [],
		favorites: [],
		upcomingEvents: [],
	});
	const [profileData, setProfileData] = useState(null);
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
				const url = "/volunteering/opportunity/" + params.data.id || "#";
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
				const url = "/volunteering/organization/" + params.data.id || "#";
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
			{profileData && (
				<p className="total-hours">
					Total Volunteering Hours: {profileData.total_hours}
				</p>
			)}

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
		</div>
	);
};

export default VolunteeringDashboardPage;
