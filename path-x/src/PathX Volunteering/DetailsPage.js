import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import axios from "axios";
import { useNotification } from "../NotificationContext";
import { getAuth } from "firebase/auth";
import { getUserIdByEmail } from "../apiUtils";
import "./DetailsPage.css";

const DetailsPage = () => {
	const { id } = useParams(); // Get the opportunity ID from the URL
	const [opportunity, setOpportunity] = useState(null);
	const { addNotification } = useNotification();
	const [favoritedOrgs, setFavoritedOrgs] = useState({});
	const [savedOpportunities, setSavedOpportunities] = useState({});
	const auth = getAuth();
	const user = auth.currentUser;

	useEffect(() => {
		const fetchOpportunityDetails = async () => {
			try {
				const response = await axios.get(
					`${process.env.REACT_APP_SERVER}/opportunities`,
					{
						params: { id }, // Fetch specific opportunity by ID
					}
				);
				setOpportunity(response.data);
			} catch (error) {
				console.error("Error fetching opportunity details:", error);
			}
		};

		fetchOpportunityDetails();
	}, [id]);

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
					"This organization was successfully favorited.",
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
				addNotification(
					"This organization was successfully unfavorited.",
					"success"
				);
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
					<p className="detail-item">
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
			</div>
		</div>
	);
};

export default DetailsPage;
