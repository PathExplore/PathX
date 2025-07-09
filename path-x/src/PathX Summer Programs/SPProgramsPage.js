import React, { useState, useEffect } from "react";
import { useNotification } from "../NotificationContext";
import axios from "axios";
import "./SPProgramsPage.css";
import { getUserIdByEmail } from "../apiUtils";
import { getAuth } from "firebase/auth";
import { Link } from "react-router-dom";

const SPProgramsPage = () => {
	const [programs, setPrograms] = useState([]);
	const [filters, setFilters] = useState({ categories: {} });
	const [savedPrograms, setSavedPrograms] = useState({});
	const [page, setPage] = useState(1);
	const [hasMore, setHasMore] = useState(true);
	const [loading, setLoading] = useState(false);
	const { addNotification } = useNotification();
	const auth = getAuth();
	const user = auth.currentUser;
	const categories = [
		"STEM",
		"Arts",
		"Leadership",
		"Community Service",
		"Sports",
		"Other",
	];

	useEffect(() => {
		const fetchPrograms = async () => {
			try {
				setLoading(true);
				const response = await axios.get(
					`${process.env.REACT_APP_SERVER}/summer-programs`,
					{
						params: {
							category: Object.keys(filters.categories),
							page,
							per_page: 12,
						},
					}
				);

				if (page === 1) {
					setPrograms(response.data.programs);
				} else {
					setPrograms((prev) => [...prev, ...response.data.programs]);
				}

				setHasMore(page < response.data.total_pages);
			} catch (error) {
				console.error("Error fetching programs.", error);
				addNotification("Failed to load programs. " + error, "error");
			} finally {
				setLoading(false);
			}
		};

		fetchPrograms();
	}, [filters, page]);

	useEffect(() => {
		setPage(1);
		setHasMore(true);
	}, [filters]);

	useEffect(() => {
		if (user?.email) {
			const fetchSaves = async () => {
				try {
					const userId = await getUserIdByEmail(user.email);
					const savedResponse = await axios.get(
						`${process.env.REACT_APP_SERVER}/summer-programs/saved`,
						{
							params: { user_id: userId },
						}
					);
					const savedMap = {};
					(savedResponse.data.programs || []).forEach((saved) => {
						savedMap[saved.id] = true;
					});
					setSavedPrograms(savedMap);
				} catch (error) {
					console.error("Error fetching saved programs:", error);
				}
			};
			fetchSaves();
		}
	}, [user]);

	const handleSaveProgram = async (pgrmId) => {
		try {
			const userId = await getUserIdByEmail(user.email);
			const response = await axios.post(
				`${process.env.REACT_APP_SERVER}/summer-programs/save`,
				{
					pgrm_id: pgrmId,
					user_id: userId,
				}
			);
			if (response.status === 200) {
				addNotification("This program is already saved.", "info");
			} else if (response.status === 201) {
				addNotification("You have successfully saved this program!", "success");
				setSavedPrograms((prev) => ({ ...prev, [pgrmId]: true }));
			}
		} catch (error) {
			console.error("Error saving program.", error);
			addNotification("Failed to save program. " + error, "error");
		}
	};

	const handleUnsaveProgram = async (pgrmId) => {
		try {
			const userId = await getUserIdByEmail(user.email);
			const response = await axios.post(
				`${process.env.REACT_APP_SERVER}/summer-programs/unsave`,
				{
					pgrm_id: pgrmId,
					user_id: userId,
				}
			);
			if (response.status === 200) {
				addNotification("You have unsaved this program.", "info");
				setSavedPrograms((prev) => ({ ...prev, [pgrmId]: false }));
			}
		} catch (error) {
			console.error("Error unsaving program.", error);
			addNotification("Failed to unsave program. " + error, "error");
		}
	};

	const handleFilterChange = (e) => {
		const { name, checked } = e.target;
		setFilters((prevFilters) => {
			const updatedFilters = { ...prevFilters };
			updatedFilters.categories = { ...prevFilters.categories };
			if (checked) {
				updatedFilters.categories[name] = name;
			} else {
				delete updatedFilters.categories[name];
			}
			return updatedFilters;
		});
	};

	// Infinite scroll
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
			<h1 className="sp-main-title">Summer Programs</h1>
			<div className="filters">
				<h2 className="sp-filters-title">Filters</h2>
				{/* Category Filter */}
				<div className="dropdown">
					<button className="dropdown-toggle">
						Categories <i className="fa-solid fa-angle-right"></i>
					</button>
					<div className="dropdown-tooltip categories-tooltip">
						{categories.map((category) => (
							<label key={category} className="">
								<input
									type="checkbox"
									name={category}
									onChange={handleFilterChange}
								/>
								{category}
							</label>
						))}
					</div>
				</div>
			</div>
			<div className="opportunity-grid">
				{programs.map((program) => (
					<Link
						to={`/summer-programs/program/${program.id}`}
						key={program.id}
						className="card-link"
					>
						<div key={program.id} className="opportunity-card">
							<h3 className="sp-card-title">{program.name}</h3>
							<p className="opportunity-description sp-description">
								{program.description}
							</p>
							<p className="opportunity-category sp-category">
								{program.category}
							</p>
							<p className="program-deadline">
								<strong>Deadline:</strong> {program.deadline}
							</p>
							<div className="button-group sp-button-group">
								{program.signup_url && (
									<a
										href={program.signup_url}
										target="_blank"
										rel="noopener noreferrer"
										className="opp-sign-up-button"
										onClick={(event) => event.stopPropagation()}
									>
										Sign Up
									</a>
								)}
								{savedPrograms[program.id] ? (
									<button
										onClick={(event) => {
											event.preventDefault();
											handleUnsaveProgram(program.id);
										}}
										className="opp-unsave-button"
									>
										Unsave
									</button>
								) : (
									<button
										onClick={(event) => {
											event.preventDefault();
											handleSaveProgram(program.id);
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
				<div className="loading-spinner sp-loading-spinner">
					Loading more programs...
				</div>
			)}
		</div>
	);
};

export default SPProgramsPage;
