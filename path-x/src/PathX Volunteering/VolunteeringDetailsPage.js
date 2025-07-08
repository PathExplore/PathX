import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import axios from "axios";
import { useNotification } from "../NotificationContext";
import { getAuth } from "firebase/auth";
import { getUserIdByEmail } from "../apiUtils";
import "./VolunteeringDetailsPage.css";

const VolunteeringDetailsPage = () => {
	const { id } = useParams(); // Get the opportunity ID from the URL
	const [opportunity, setOpportunity] = useState(null);
	const { addNotification } = useNotification();
	const [favoritedOrgs, setFavoritedOrgs] = useState({});
	const [savedOpportunities, setSavedOpportunities] = useState({});
	const [isAccepted, setIsAccepted] = useState(false);
	const auth = getAuth();
	const user = auth.currentUser;

	useEffect(() => {
		const fetchOpportunityDetails = async () => {
			try {
				const response = await axios.get(
					`${process.env.REACT_APP_SERVER}/opportunities`,
					{
						params: {
							id,
							user_id: user ? await getUserIdByEmail(user.email) : null,
						},
					}
				);
				setOpportunity(response.data);
				setIsAccepted(response.data.is_accepted);
			} catch (error) {
				console.error("Error fetching opportunity details:", error);
			}
		};

		fetchOpportunityDetails();
	}, [id, user]);

	useEffect(() => {
		if (user.email) {
			const fetchFavoritesAndSaves = async () => {
				const userId = await getUserIdByEmail(user.email);
				const updatedFavorites = {};
				const updatedSaves = {};

				try {
					// Check if the organization is favorited
					const favoriteResponse = await axios.get(
						`${process.env.REACT_APP_SERVER}/favorites/check`,
						{
							params: { user_id: userId, org_id: opportunity.org_id },
						}
					);
					updatedFavorites[opportunity.org_id] =
						favoriteResponse.data.favorited;

					// Check if the opportunity is saved
					const saveResponse = await axios.get(
						`${process.env.REACT_APP_SERVER}/saved/check`,
						{
							params: { user_id: userId, opp_id: opportunity.id },
						}
					);
					updatedSaves[opportunity.id] = saveResponse.data.saved;
				} catch (error) {
					console.error("Error checking status:", error);
				}

				setFavoritedOrgs(updatedFavorites);
				setSavedOpportunities(updatedSaves);
			};

			fetchFavoritesAndSaves();
		}
	}, [opportunity]);

	const handleFavorite = async (orgId, event) => {
		try {
			const userId = await getUserIdByEmail(user.email);
			const response = await axios.post(
				`${process.env.REACT_APP_SERVER}/favorites`,
				{ org_id: orgId, user_id: userId }
			);
			if (response.status === 200) {
				addNotification("This organization is already favorited.", "info");
			} else if (response.status === 201) {
				addNotification(
					"You have successfully favorited this organization!",
					"success"
				);
				setFavoritedOrgs((prev) => ({ ...prev, [orgId]: true }));
			}
		} catch (error) {
			console.error("Error favoriting organization", error);
			addNotification("Failed to favorite organization. " + error, "error");
		}
	};

	const handleUnfavorite = async (orgId, event) => {
		try {
			const userId = await getUserIdByEmail(user.email);
			const response = await axios.post(
				`${process.env.REACT_APP_SERVER}/favorites/remove`,
				{ user_id: userId, org_id: orgId }
			);
			if (response.status === 200) {
				addNotification("You have unfavorited this organization.", "info");
				setFavoritedOrgs((prev) => ({ ...prev, [orgId]: false }));
			}
		} catch (error) {
			console.error("Error unfavoriting organization:", error);
			addNotification("Failed to unfavorite organization. " + error, "error");
		}
	};

	const handleSaveOpportunity = async (oppId) => {
		try {
			const userId = await getUserIdByEmail(user.email);
			const response = await axios.post(
				`${process.env.REACT_APP_SERVER}/saved`,
				{
					opp_id: oppId,
					user_id: userId,
				}
			);
			if (response.status === 200) {
				addNotification("This opportunity is already saved.", "info");
			} else if (response.status === 201) {
				addNotification(
					"You have successfully saved this opportunity!",
					"success"
				);
				setSavedOpportunities((prev) => ({ ...prev, [oppId]: true }));
			}
		} catch (error) {
			console.error("Error saving opportunity.", error);
			addNotification("Failed to save opportunity. " + error, "error");
		}
	};

	const handleUnsaveOpportunity = async (oppId) => {
		try {
			const userId = await getUserIdByEmail(user.email);
			const response = await axios.post(
				`${process.env.REACT_APP_SERVER}/saved/remove`,
				{
					opp_id: oppId,
					user_id: userId,
				}
			);
			if (response.status === 200) {
				addNotification("You have unsaved this opportunity.", "info");
				setSavedOpportunities((prev) => ({ ...prev, [oppId]: false }));
			}
		} catch (error) {
			console.error("Error unsaving opportunity.", error);
			addNotification("Failed to unsave opportunity. " + error, "error");
		}
	};

	const handleAcceptOpportunity = async () => {
		try {
			const userId = await getUserIdByEmail(user.email);
			const response = await axios.post(
				`${process.env.REACT_APP_SERVER}/opportunities/accept`,
				{
					user_id: userId,
					opp_id: opportunity.id,
				}
			);
			if (response.status === 200) {
				addNotification("You have already accepted this opportunity.", "info");
			} else if (response.status === 201) {
				addNotification(
					"You have successfully accepted this opportunity!",
					"success"
				);
				setIsAccepted(true);
			}
		} catch (error) {
			console.error("Error accepting opportunity:", error);
			addNotification("Failed to accept opportunity. " + error, "error");
		}
	};

	const handleUnacceptOpportunity = async () => {
		try {
			const userId = await getUserIdByEmail(user.email);
			const response = await axios.post(
				`${process.env.REACT_APP_SERVER}/opportunities/unaccept`,
				{
					user_id: userId,
					opp_id: opportunity.id,
				}
			);
			if (response.status === 200) {
				addNotification("You have unaccepted this opportunity.", "info");
				setIsAccepted(false);
			}
		} catch (error) {
			console.error("Error unaccepting opportunity:", error);
			addNotification("Failed to unaccept opportunity. " + error, "error");
		}
	};

	const handleToggleAccept = () => {
		if (isAccepted) {
			handleUnacceptOpportunity();
		} else {
			handleAcceptOpportunity();
		}
	};

	if (!opportunity) {
		return <div>Loading...</div>;
	}

	return (
		<div className="details-page">
			{/* Left Panel */}
			<div className="left-panel">
				<h1>{opportunity.title}</h1>
				<div className="organization-info">
					<Link
						to={`/volunteering/organization/${opportunity.org_id}`}
						className="org-link"
						rel="noopener noreferrer"
					>
						<div className="org-name-favorite">
							<img
								src={opportunity.organization.logo_url}
								alt="Organization"
								className="organization-logo"
							/>
							<span>{opportunity.organization.name}</span>
							{favoritedOrgs[opportunity.org_id] ? (
								<button
									onClick={(event) => {
										event.preventDefault();
										handleUnfavorite(opportunity.org_id, event);
									}}
									className="unfavorite-button"
								>
									<i className="fa-solid fa-heart"></i>
								</button>
							) : (
								<button
									onClick={(event) => {
										event.preventDefault();
										handleFavorite(opportunity.org_id, event);
									}}
									className="favorite-button"
								>
									<i className="fa-regular fa-heart"></i>
								</button>
							)}
						</div>
					</Link>
				</div>
				<img
					src={opportunity.image_link}
					alt="Opportunity"
					className="opp-image"
				></img>
				<p>{opportunity.description}</p>
			</div>

			{/* Right Panel */}
			<div className="right-panel">
				<h2>Details</h2>
				{opportunity.category && (
					<p className="detail-item">
						<strong>Category:</strong> {opportunity.category}
					</p>
				)}
				{opportunity.skills_required && (
					<p className="detail-item">
						<strong>Skills Required:</strong> {opportunity.skills_required}
					</p>
				)}
				{opportunity.date && (
					<p className="detail-item">
						<strong>Date(s):</strong> {opportunity.date}
					</p>
				)}
				{opportunity.time && (
					<p className="detail-item">
						<strong>Time(s):</strong> {opportunity.time}
					</p>
				)}
				{opportunity.length && (
					<p className="detail-item">
						<strong>Duration:</strong> {opportunity.length}
					</p>
				)}
				{opportunity.location && (
					<p className="detail-item last-detail-item">
						<strong>Location:</strong> {opportunity.location}
					</p>
				)}
				{savedOpportunities[opportunity.id] ? (
					<button
						onClick={(event) => handleUnsaveOpportunity(opportunity.id, event)}
						className="unsave-button"
					>
						Unsave
					</button>
				) : (
					<button
						onClick={(event) => handleSaveOpportunity(opportunity.id, event)}
						className="save-button"
					>
						Save for Later
					</button>
				)}
				<a
					href={opportunity.signup_url}
					target="_blank"
					rel="noopener noreferrer"
					className="signup-button"
				>
					Sign Up
				</a>
				<div className="accept-card-container">
					<label className="accept-card-label">
						<input
							type="checkbox"
							checked={isAccepted}
							onChange={handleToggleAccept}
							className="accept-card-input"
						/>
						<div className="accept-card-content">
							<div className="accept-card-icon">
								{isAccepted ? (
									<i className="fa-solid fa-check-circle"></i>
								) : (
									<i className="fa-regular fa-calendar-plus"></i>
								)}
							</div>
							<div className="accept-card-text">
								<span className="accept-card-title">
									{isAccepted ? "Accepted" : "Accept Opportunity"}
								</span>
								<span className="accept-card-subtitle">
									{isAccepted
										? "You're all set! Don't forget to sign up above."
										: "For our records only. You still need to sign up above!"}
								</span>
							</div>
						</div>
						<div className="accept-card-overlay"></div>
					</label>
				</div>
			</div>
		</div>
	);
};

export default VolunteeringDetailsPage;
