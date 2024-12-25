import React, { useState, useEffect } from "react";
import { useNotification } from "./NotificationContext";
import axios from "axios";
import "./OrganizationPage.css";
import { Link, useParams } from "react-router-dom";
import { getUserIdByEmail } from "./apiUtils";
import { getAuth } from "firebase/auth";

const OrganizationPage = () => {
	const { orgId } = useParams(); // Get organization ID from URL
	const [organization, setOrganization] = useState(null);
	const [opportunities, setOpportunities] = useState([]);
	const [isFavorited, setIsFavorited] = useState(false);
	const [savedOpportunities, setSavedOpportunities] = useState({});
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
			const fetchSaves = async () => {
				const userId = await getUserIdByEmail(user.email);
				const updatedSaves = {};

				for (const opp of opportunities) {
					// Check if the opportunity is saved
					const saveResponse = await axios.get(
						`${process.env.REACT_APP_SERVER}/saved/check`,
						{
							params: { user_id: userId, opp_id: opp.id },
						}
					);
					updatedSaves[opp.id] = saveResponse.data.saved;
				}

				setSavedOpportunities(updatedSaves);
			};

			if (opportunities.length > 0) {
				fetchSaves();
			}
		}
	}, [opportunities]);

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
	}, []);

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

	const handleSaveOpportunity = async (oppId) => {
		try {
			const userId = await getUserIdByEmail(user.email);
			await axios.post(`${process.env.REACT_APP_SERVER}/saved`, {
				opp_id: oppId,
				user_id: userId,
			});
			addNotification("This opportunity was successfully saved.", "success");
			setSavedOpportunities((prev) => ({ ...prev, [oppId]: true }));
		} catch (error) {
			console.error("Error saving opportunity.", error);
			addNotification("Failed to save opportunity. " + error, "error");
		}
	};

	const handleUnsaveOpportunity = async (oppId) => {
		try {
			const userId = await getUserIdByEmail(user.email);
			await axios.post(`${process.env.REACT_APP_SERVER}/saved/remove`, {
				opp_id: oppId,
				user_id: userId,
			});
			addNotification("This opportunity was successfully unsaved.", "success");
			setSavedOpportunities((prev) => ({ ...prev, [oppId]: false }));
		} catch (error) {
			console.error("Error unsaving opportunity.", error);
			addNotification("Failed to unsave opportunity. " + error, "error");
		}
	};

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
							{organization.long_description}
						</p>
					</div>

					{/* Right Panel */}
					<div className="organization-right-panel">
						<h2>Upcoming Opportunities</h2>
						{opportunities.length > 0 ? (
							opportunities.map((opp) => (
								<Link
									to={`/opportunity/${opp.id}`}
									key={opp.id}
									className="card-link"
								>
									<div key={opp.id} className="opportunity-card">
										<h3>{opp.title}</h3>
										<p className="opportunity-description">{opp.description}</p>
										<p className="opportunity-category">{opp.category}</p>
										<div className="button-group">
											<a
												href={opp.signup_url}
												target="_blank"
												rel="noopener noreferrer"
												className="opp-sign-up-button"
												onClick={(event) => event.stopPropagation()}
											>
												Sign Up
											</a>
											{savedOpportunities[opp.id] ? (
												<button
													onClick={(event) => {
														event.preventDefault();
														handleUnsaveOpportunity(opp.id);
													}}
													className="opp-unsave-button"
												>
													Unsave
												</button>
											) : (
												<button
													onClick={(event) => {
														event.preventDefault();
														handleSaveOpportunity(opp.id);
													}}
													className="opp-save-button"
												>
													Save for Later
												</button>
											)}
										</div>
									</div>
								</Link>
							))
						) : (
							<p>No upcoming opportunities.</p>
						)}
					</div>
				</div>
			)}
		</div>
	);
};

export default OrganizationPage;
