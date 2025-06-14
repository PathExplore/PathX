import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNotification } from "../NotificationContext";
import { AgGridReact } from "ag-grid-react";
import "./SPDashboardPage.css";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-alpine.css";
import { getAuth } from "firebase/auth";
import { Link } from "react-router-dom";
import { getUserIdByEmail } from "../apiUtils";

const SPDashboardPage = () => {
	const [userData, setUserData] = useState({
		savedPrograms: [],
		acceptedPrograms: [],
		pastPrograms: [],
	});
	const { addNotification } = useNotification();
	const auth = getAuth();
	const user = auth.currentUser;

	useEffect(() => {
		const fetchUserData = async () => {
			try {
				if (user.email) {
					const userId = await getUserIdByEmail(user.email);
					const [savedResponse, acceptedResponse, pastResponse] =
						await Promise.all([
							axios.get(
								`${process.env.REACT_APP_SERVER}/summer-programs/saved`,
								{
									params: { user_id: userId },
								}
							),
							axios.get(
								`${process.env.REACT_APP_SERVER}/summer-programs/accepted`,
								{
									params: { user_id: userId },
								}
							),
							axios.get(
								`${process.env.REACT_APP_SERVER}/summer-programs/past`,
								{
									params: { user_id: userId },
								}
							),
						]);

					setUserData({
						savedPrograms: savedResponse.data.programs,
						acceptedPrograms: acceptedResponse.data.programs,
						pastPrograms: pastResponse.data.programs,
					});
				}
			} catch (error) {
				console.error("Error fetching user data", error);
				addNotification("Failed to load dashboard data. " + error, "error");
			}
		};

		fetchUserData();
	}, [user]);

	const savedProgramsColumns = [
		{
			headerName: "Program",
			field: "name",
			flex: 1,
			cellRenderer: (params) => {
				const url = "/summer-programs/program/" + params.data.id || "#";
				return (
					<Link to={url} rel="noopener noreferrer" className="sp-saved-sign-up">
						{params.value}
					</Link>
				);
			},
		},
		{ headerName: "Category", field: "category", flex: 1 },
		{ headerName: "Deadline", field: "deadline", flex: 1 },
		{ headerName: "Location", field: "location", flex: 1 },
		{ headerName: "Cost", field: "cost", flex: 1 },
	];

	const acceptedProgramsColumns = [
		{
			headerName: "Program",
			field: "name",
			flex: 1,
			cellRenderer: (params) => {
				const url = "/summer-programs/program/" + params.data.id || "#";
				return (
					<Link to={url} rel="noopener noreferrer" className="sp-saved-sign-up">
						{params.value}
					</Link>
				);
			},
		},
		{ headerName: "Category", field: "category", flex: 1 },
		{ headerName: "Deadline", field: "deadline", flex: 1 },
		{ headerName: "Location", field: "location", flex: 1 },
		{ headerName: "Cost", field: "cost", flex: 1 },
	];

	const pastProgramsColumns = [
		{
			headerName: "Program",
			field: "name",
			flex: 1,
			cellRenderer: (params) => {
				const url = "/summer-programs/program/" + params.data.id || "#";
				return (
					<Link to={url} rel="noopener noreferrer" className="sp-saved-sign-up">
						{params.value}
					</Link>
				);
			},
		},
		{ headerName: "Category", field: "category", flex: 1 },
		{ headerName: "Completed Date", field: "completed_at", flex: 1 },
		{ headerName: "Location", field: "location", flex: 1 },
		{ headerName: "Cost", field: "cost", flex: 1 },
	];

	return (
		<div className="dashboard-page">
			<h1 className="sp-dashboard-page-title">Your Dashboard</h1>

			<div className="dashboard-cards">
				<div className="dashboard-card">
					<h4 className="sp-dashboard-card-title">Accepted Programs</h4>
					<div
						className="ag-theme-alpine"
						style={{ height: 300, width: "100%" }}
					>
						<AgGridReact
							rowData={userData.acceptedPrograms.map((program) => ({
								id: program.id,
								name: program.name,
								category: program.category || "N/A",
								deadline: program.deadline
									? new Date(program.deadline).toLocaleDateString()
									: "N/A",
								location: program.location || "N/A",
								cost: program.cost || "N/A",
							}))}
							columnDefs={acceptedProgramsColumns}
							pagination={true}
						/>
					</div>
				</div>

				<div className="dashboard-card">
					<h4 className="sp-dashboard-card-title">Past Programs</h4>
					<div
						className="ag-theme-alpine"
						style={{ height: 300, width: "100%" }}
					>
						<AgGridReact
							rowData={userData.pastPrograms.map((program) => ({
								id: program.id,
								name: program.name,
								category: program.category || "N/A",
								completed_at: program.completed_at
									? new Date(program.completed_at).toLocaleDateString()
									: "N/A",
								location: program.location || "N/A",
								cost: program.cost || "N/A",
							}))}
							columnDefs={pastProgramsColumns}
							pagination={true}
						/>
					</div>
				</div>
			</div>
			<div className="dashboard-card saved-programs-card">
				<h4 className="sp-dashboard-card-title">Saved Programs</h4>
				<div className="ag-theme-alpine" style={{ height: 300, width: "100%" }}>
					<AgGridReact
						rowData={userData.savedPrograms.map((program) => ({
							id: program.id,
							name: program.name,
							category: program.category || "N/A",
							deadline: program.deadline
								? new Date(program.deadline).toLocaleDateString()
								: "N/A",
							location: program.location || "N/A",
							cost: program.cost || "N/A",
						}))}
						columnDefs={savedProgramsColumns}
						pagination={true}
					/>
				</div>
			</div>
		</div>
	);
};

export default SPDashboardPage;
