import React, { useState, useEffect } from "react";
import { useNotification } from "../NotificationContext";
import axios from "axios";
import "./VolunteeringOpportunitiesPage.css";
import { getUserIdByEmail } from "../apiUtils";
import { getAuth } from "firebase/auth";
import { Link } from "react-router-dom";

const VolunteeringOpportunitiesPage = () => {
	const [opportunities, setOpportunities] = useState([]);
	const [filters, setFilters] = useState({ categories: {}, skills: {} });
	const [zipCode, setZipCode] = useState(""); // ZIP Code filter state
	const [favoritedOrgs, setFavoritedOrgs] = useState({});
	const [savedOpportunities, setSavedOpportunities] = useState({});
	const { addNotification } = useNotification();
	const auth = getAuth();
	const user = auth.currentUser;
	const categories = [
		"Advocacy & Human Rights",
		"Animals",
		"Arts & Culture",
		"Board Development",
		"Children & Youth",
		"Community",
		"Computers & Technology",
		"Crisis Support",
		"Disaster Relief",
		"Education & Literacy",
		"Emergency & Safety",
		"Employment",
		"Environment",
		"Faith-Based",
		"Health & Medicine",
		"Homeless & Housing",
		"Hunger",
		"Immigrants & Refugees",
		"International",
		"Justice & Legal",
		"LGBTQ+",
		"Media & Broadcasting",
		"People with Disabilities",
		"Politics",
		"Race & Ethnicity",
		"Seniors",
		"Sports & Recreation",
		"Veterans & Military Families",
		"Women",
	];
	const skills = [
		"Academics",
		"Administrative & Clerical",
		"Animals & Environment",
		"Arts",
		"Business & Management",
		"Children & Family",
		"Computers & IT",
		"Disaster Relief",
		"Education & Literacy",
		"Engineering",
		"Finance",
		"Food Service & Events",
		"For Profit & Nonprofit Development",
		"HR",
		"Healthcare & Social Services",
		"Hobbies & Crafts",
		"Housing & Facilities",
		"IT Infrastructure & Software",
		"Interactive & Web Development",
		"Interpersonal",
		"Language & Culture",
		"Legal & Advocacy",
		"Logistics, Supply Chain & Transportation",
		"Marketing & Communications",
		"Music",
		"Performing Arts",
		"Sports & Recreation",
		"Strategy Development & Business Planning",
		"Trades & Maintenance",
	];

	useEffect(() => {
		const fetchOpportunities = async () => {
			try {
				const response = await axios.get(
					`${process.env.REACT_APP_SERVER}/opportunities`,
					{
						params: {
							category: Object.keys(filters.categories),
							skills: Object.keys(filters.skills),
							zip_code: zipCode || undefined,
						},
					}
				);
				setOpportunities(response.data);
			} catch (error) {
				console.error("Error fetching opportunities.", error);
				addNotification("Failed to load opportunities. " + error, "error");
			}
		};

		fetchOpportunities();
	}, [filters, zipCode]);

	useEffect(() => {
		if (user?.email) {
			const fetchFavoritesAndSaves = async () => {
				const userId = await getUserIdByEmail(user.email);
				const updatedFavorites = {};
				const updatedSaves = {};

				for (const opp of opportunities) {
					try {
						// Check if the organization is favorited
						const favoriteResponse = await axios.get(
							`${process.env.REACT_APP_SERVER}/favorites/check`,
							{
								params: { user_id: userId, org_id: opp.org_id },
							}
						);
						updatedFavorites[opp.org_id] = favoriteResponse.data.favorited;

						// Check if the opportunity is saved
						const saveResponse = await axios.get(
							`${process.env.REACT_APP_SERVER}/saved/check`,
							{
								params: { user_id: userId, opp_id: opp.id },
							}
						);
						updatedSaves[opp.id] = saveResponse.data.saved;
					} catch (error) {
						console.error("Error checking status:", error);
					}
				}

				setFavoritedOrgs(updatedFavorites);
				setSavedOpportunities(updatedSaves);
			};

			if (opportunities.length > 0) {
				fetchFavoritesAndSaves();
			}
		}
	}, [opportunities]);

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
			setFavoritedOrgs((prev) => ({ ...prev, [orgId]: true }));
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
			setFavoritedOrgs((prev) => ({ ...prev, [orgId]: false }));
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

	const handleFilterChange = (e, type) => {
		const { name, checked } = e.target;

		setFilters((prevFilters) => {
			const updatedFilters = { ...prevFilters };
			updatedFilters[type] = { ...prevFilters[type] };

			if (checked) {
				updatedFilters[type][name] = name;
			} else {
				delete updatedFilters[type][name];
			}

			return updatedFilters;
		});
	};

	const handleZipCodeFilter = () => {
		setZipCode(document.getElementById("zip-code-input").value);
	};

	return (
		<>
			<div className="search-page">
				<h1>Volunteering Opportunities</h1>

				<div className="filters">
					<h2>Filters</h2>

					{/* Categories Filter */}
					<div className="dropdown">
						<button className="dropdown-toggle">
							Categories <i className="fa-solid fa-angle-right"></i>
						</button>
						<div className="dropdown-tooltip categories-tooltip">
							{categories.map((category) => (
								<label key={category}>
									<input
										type="checkbox"
										name={category}
										onChange={(e) => handleFilterChange(e, "categories")}
									/>
									{category}
								</label>
							))}
						</div>
					</div>

					{/* Skills Filter */}
					<div className="dropdown">
						<button className="dropdown-toggle">
							Skills Required <i className="fa-solid fa-angle-right"></i>
						</button>
						<div className="dropdown-tooltip skills-tooltip">
							{skills.map((skill) => (
								<label key={skill}>
									<input
										type="checkbox"
										name={skill}
										onChange={(e) => handleFilterChange(e, "skills")}
									/>
									{skill}
								</label>
							))}
						</div>
					</div>

					{/* Line Break */}
					<hr className="filter-line" />
					<h3 className="zip-code-heading">Filter by Zip Code</h3>

					{/* ZIP Code Filter */}
					<div className="zip-code-filter">
						<input
							type="text"
							placeholder="Enter ZIP Code"
							className="zip-code-input"
							id="zip-code-input"
						/>
						<button onClick={handleZipCodeFilter} className="zip-code-button">
							Filter
						</button>
					</div>
				</div>

				<div className="opportunity-grid" key={JSON.stringify(filters)}>
					{opportunities.map((opp) => (
						<Link
							to={`/volunteering/opportunity/${opp.id}`}
							key={opp.id}
							className="card-link"
						>
							<div key={opp.id} className="opportunity-card">
								<div className="opp-organization-info">
									<Link
										to={`/volunteering/organization/${opp.org_id}`}
										className="org-link"
										rel="noopener noreferrer"
									>
										<div className="org-name-favorite">
											<img
												src={opp.organization.logo_url}
												alt="Organization"
												className="organization-logo"
											/>
											<span>{opp.organization.name}</span>
											{favoritedOrgs[opp.org_id] ? (
												<button
													onClick={(event) => {
														event.preventDefault();
														handleUnfavorite(opp.org_id);
													}}
													className="unfavorite-button"
												>
													<i className="fa-solid fa-heart"></i>
												</button>
											) : (
												<button
													onClick={(event) => {
														event.preventDefault();
														handleFavorite(opp.org_id);
													}}
													className="favorite-button"
												>
													<i className="fa-regular fa-heart"></i>
												</button>
											)}
										</div>
									</Link>
								</div>
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
					))}
				</div>
			</div>
		</>
	);
};

export default VolunteeringOpportunitiesPage;
