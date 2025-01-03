import React, { useState, useEffect } from "react";
import { useNotification } from "./NotificationContext";
import axios from "axios";
import "./OrganizationPage.css";
import { Link, useParams } from "react-router-dom";
import { getUserIdByEmail } from "./apiUtils";
import { getAuth } from "firebase/auth";
import { AgGridReact } from "ag-grid-react";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-alpine.css";

const OrganizationPage = () => {
	const { orgId } = useParams(); // Get organization ID from URL
	const [organization, setOrganization] = useState(null);
	const [opportunities, setOpportunities] = useState([]);
	const [isFavorited, setIsFavorited] = useState(false);
	const { addNotification } = useNotification();
	const auth = getAuth();
	const user = auth.currentUser;

	useEffect(() => {
		const fetchOrganizationDetails = async () => {
			try {
				const response = await axios.get(
					`${process.env.REACT_APP_SERVER}/organization/${orgId}`
				);
				setOrganization(response.data.organization);
				setOpportunities(response.data.opportunities);
			} catch (error) {
				console.error("Error fetching organization details:", error);
				addNotification(
					"Failed to load organization details. " + error,
					"error"
				);
			}
		};

		fetchOrganizationDetails();
	}, [orgId]);

	useEffect(() => {
		if (user?.email) {
			const fetchFavorites = async () => {
				const userId = await getUserIdByEmail(user.email);

				// Check if the organization is favorited
				const favoriteResponse = await axios.get(
					`${process.env.REACT_APP_SERVER}/favorites/check`,
					{
						params: { user_id: userId, org_id: orgId },
					}
				);
				setIsFavorited(favoriteResponse.data.favorited);
			};

			fetchFavorites();
		}
	}, [orgId]);

	const handleFavorite = async (orgId) => {
		try {
			const userId = await getUserIdByEmail(user.email);
			await axios.post(`${process.env.REACT_APP_SERVER}/favorites`, {
				org_id: orgId,
				user_id: userId,
			});
			addNotification(
				"This organization was successfully favorited.",
				"success"
			);
			setIsFavorited(true);
		} catch (error) {
			console.error("Error favoriting organization", error);
			addNotification("Failed to favorite organization. " + error, "error");
		}
	};

	const handleUnfavorite = async (orgId) => {
		try {
			const userId = await getUserIdByEmail(user.email);
			await axios.post(`${process.env.REACT_APP_SERVER}/favorites/remove`, {
				user_id: userId,
				org_id: orgId,
			});
			addNotification(
				"This organization was successfully unfavorited.",
				"success"
			);
			setIsFavorited(false);
		} catch (error) {
			console.error("Error unfavoriting organization", error);
			addNotification("Failed to unfavorite organization. " + error, "error");
		}
	};

	const opportunitiesColumns = [
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
		{ headerName: "Date", field: "date", flex: 1 },
		{ headerName: "Time", field: "time", flex: 1 },
		{ headerName: "Location", field: "location", flex: 1 },
		{ headerName: "Category", field: "category", flex: 1 },
		{ headerName: "Length (Hours)", field: "length", flex: 1 },
	];

	return (
		<div className="organization-page">
			{organization && (
				<div className="organization-content">
					{/* Left Panel */}
					<div className="organization-left-panel">
						<div className="organization-info">
							<img
								src={organization.logo_url}
								alt={`${organization.name} Logo`}
								className="organization-page-logo"
							/>
							<div className="org-name-favorite">
								<h1>{organization.name}</h1>
								{isFavorited ? (
									<button
										onClick={(event) => {
											event.preventDefault();
											handleUnfavorite(orgId);
										}}
										className="favorite-button organization-fav-button"
									>
										<i className="fa-solid fa-heart"></i>
									</button>
								) : (
									<button
										onClick={(event) => {
											event.preventDefault();
											handleFavorite(orgId);
										}}
										className="favorite-button organization-fav-button"
									>
										<i className="fa-regular fa-heart"></i>
									</button>
								)}
							</div>
						</div>

						<p className="organization-description">
							{organization.description}
						</p>
					</div>

					{/* Right Panel */}
					<div className="organization-right-panel">
						<h2>Opportunities</h2>
						<div
							className="ag-theme-alpine org-opp-grid"
							style={{ height: 400, width: "100%" }}
						>
							<AgGridReact
								rowData={opportunities.map((opp) => ({
									id: opp.id,
									title: opp.title,
									date: opp.date
										? new Date(opp.date).toLocaleDateString()
										: "N/A",
									time: opp.date
										? new Date(opp.date).toLocaleTimeString()
										: "N/A",
									location: opp.location || "N/A",
									category: opp.category || "N/A",
									length: opp.length || "N/A",
								}))}
								columnDefs={opportunitiesColumns}
								pagination={true}
							/>
						</div>
					</div>
				</div>
			)}
		</div>
	);
};

export default OrganizationPage;
