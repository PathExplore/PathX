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
	const [page, setPage] = useState(1);
	const [hasMore, setHasMore] = useState(true);
	const [loading, setLoading] = useState(false);
	const [loadingMore, setLoadingMore] = useState(false);
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
				setLoading(true);
				const response = await axios.get(
					`${process.env.REACT_APP_SERVER}/opportunities`,
					{
						params: {
							category: Object.keys(filters.categories),
							skills: Object.keys(filters.skills),
							zip_code: zipCode || undefined,
							page,
							per_page: 12,
						},
					}
				);

				if (page === 1) {
					setOpportunities(response.data.opportunities);
				} else {
					setOpportunities((prev) => [...prev, ...response.data.opportunities]);
				}

				setHasMore(page < response.data.total_pages);
			} catch (error) {
				console.error("Error fetching opportunities.", error);
				addNotification("Failed to load opportunities. " + error, "error");
			} finally {
				setLoading(false);
			}
		};

		fetchOpportunities();
	}, [filters, zipCode, page]);

	// Reset page when filters change
	useEffect(() => {
		setPage(1);
		setHasMore(true);
	}, [filters, zipCode]);

	useEffect(() => {
		if (user?.email) {
			const fetchFavoritesAndSaves = async () => {
				try {
					const userId = await getUserIdByEmail(user.email);

					// Fetch all favorites and saved opportunities in one call
					const [favoritesResponse, savedResponse] = await Promise.all([
						axios.get(`${process.env.REACT_APP_SERVER}/favorites`, {
							params: { user_id: userId },
						}),
						axios.get(`${process.env.REACT_APP_SERVER}/saved`, {
							params: { user_id: userId },
						}),
					]);

					// Create lookup objects for O(1) access
					const favoritesMap = {};
					favoritesResponse.data.forEach((fav) => {
						favoritesMap[fav.org_id] = true;
					});

					const savedMap = {};
					savedResponse.data.forEach((saved) => {
						savedMap[saved.opp_id] = true;
					});

					setFavoritedOrgs(favoritesMap);
					setSavedOpportunities(savedMap);
				} catch (error) {
					console.error("Error fetching favorites and saves:", error);
				}
			};

			fetchFavoritesAndSaves();
		}
	}, [user]);

	const handleFavorite = async (orgId) => {
		try {
			const userId = await getUserIdByEmail(user.email);
			const response = await axios.post(
				`${process.env.REACT_APP_SERVER}/favorites`,
				{
					org_id: orgId,
					user_id: userId,
				}
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

	const handleUnfavorite = async (orgId) => {
		try {
			const userId = await getUserIdByEmail(user.email);
			const response = await axios.post(
				`${process.env.REACT_APP_SERVER}/favorites/remove`,
				{
					user_id: userId,
					org_id: orgId,
				}
			);
			if (response.status === 200) {
				addNotification("You have unfavorited this organization.", "info");
				setFavoritedOrgs((prev) => ({ ...prev, [orgId]: false }));
			}
		} catch (error) {
			console.error("Error unfavoriting organization", error);
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

	const fetchOpportunities = async (isLoadMore = false) => {
		try {
			setLoading(true);
			const response = await axios.get(
				`${process.env.REACT_APP_SERVER}/opportunities`,
				{
					params: {
						category: Object.keys(filters.categories),
						skills: Object.keys(filters.skills),
						zip_code: zipCode,
						page: isLoadMore ? page + 1 : 1,
						per_page: 12,
					},
				}
			);

			const newOpportunities = response.data.opportunities;
			setHasMore(response.data.current_page < response.data.total_pages);

			if (isLoadMore) {
				setOpportunities((prev) => [...prev, ...newOpportunities]);
				setPage((prev) => prev + 1);
			} else {
				setOpportunities(newOpportunities);
				setPage(1);
			}
		} catch (error) {
			console.error("Error fetching opportunities:", error);
			addNotification("Failed to load opportunities", "error");
		} finally {
			setLoading(false);
		}
	};

	// Add scroll event listener for infinite scroll
	useEffect(() => {
		const handleScroll = () => {
			if (
				window.innerHeight + document.documentElement.scrollTop >=
				document.documentElement.offsetHeight - 100
			) {
				if (!loading && hasMore) {
					setPage((prev) => prev + 1);
				}
			}
		};

		window.addEventListener("scroll", handleScroll);
		return () => window.removeEventListener("scroll", handleScroll);
	}, [loading, hasMore]);

	return (
		<div className="volunteering-opportunities-page">
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
			<div className="opportunity-grid">
				{opportunities.map((opportunity) => (
					<Link
						to={`/volunteering/opportunity/${opportunity.id}`}
						key={opportunity.id}
						className="card-link"
					>
						<div key={opportunity.id} className="opportunity-card">
							<div className="opp-organization-info">
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
													handleUnfavorite(opportunity.org_id);
												}}
												className="unfavorite-button"
											>
												<i className="fa-solid fa-heart"></i>
											</button>
										) : (
											<button
												onClick={(event) => {
													event.preventDefault();
													handleFavorite(opportunity.org_id);
												}}
												className="favorite-button"
											>
												<i className="fa-regular fa-heart"></i>
											</button>
										)}
									</div>
								</Link>
							</div>
							<h3>{opportunity.title}</h3>
							<p className="opportunity-description">
								{opportunity.description}
							</p>
							<p className="opportunity-category">{opportunity.category}</p>
							<div className="button-group">
								<a
									href={opportunity.signup_url}
									target="_blank"
									rel="noopener noreferrer"
									className="opp-sign-up-button"
									onClick={(event) => event.stopPropagation()}
								>
									Sign Up
								</a>
								{savedOpportunities[opportunity.id] ? (
									<button
										onClick={(event) => {
											event.preventDefault();
											handleUnsaveOpportunity(opportunity.id);
										}}
										className="opp-unsave-button"
									>
										Unsave
									</button>
								) : (
									<button
										onClick={(event) => {
											event.preventDefault();
											handleSaveOpportunity(opportunity.id);
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
			{loading && (
				<div className="loading-spinner">Loading more opportunities...</div>
			)}
		</div>
	);
};

export default VolunteeringOpportunitiesPage;
