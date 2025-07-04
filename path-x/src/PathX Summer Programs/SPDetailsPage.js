import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import axios from "axios";
import { useNotification } from "../NotificationContext";
import { getAuth } from "firebase/auth";
import { getUserIdByEmail } from "../apiUtils";
import "./SPDetailsPage.css";

const SPDetailsPage = () => {
	const { id } = useParams();
	const [program, setProgram] = useState(null);
	const { addNotification } = useNotification();
	const [savedPrograms, setSavedPrograms] = useState({});
	const [isAccepted, setIsAccepted] = useState(false);
	const auth = getAuth();
	const user = auth.currentUser;

	useEffect(() => {
		const fetchProgramDetails = async () => {
			try {
				const response = await axios.get(
					`${process.env.REACT_APP_SERVER}/summer-programs`,
					{
						params: {
							id,
							user_id: user ? await getUserIdByEmail(user.email) : null,
						},
					}
				);
				setProgram(response.data);
				setIsAccepted(response.data.is_accepted);
			} catch (error) {
				console.error("Error fetching program details:", error);
				addNotification("Failed to load program details. " + error, "error");
			}
		};

		fetchProgramDetails();
	}, [id, user]);

	useEffect(() => {
		if (user?.email) {
			const fetchSavedStatus = async () => {
				const userId = await getUserIdByEmail(user.email);
				const updatedSaves = {};

				try {
					const saveResponse = await axios.get(
						`${process.env.REACT_APP_SERVER}/summer-programs/saved/check`,
						{
							params: { user_id: userId, program_id: program.id },
						}
					);
					updatedSaves[program.id] = saveResponse.data.saved;
				} catch (error) {
					console.error("Error checking save status:", error);
				}

				setSavedPrograms(updatedSaves);
			};

			fetchSavedStatus();
		}
	}, [program]);

	const handleSaveProgram = async (programId) => {
		try {
			const userId = await getUserIdByEmail(user.email);
			const response = await axios.post(
				`${process.env.REACT_APP_SERVER}/summer-programs/saved`,
				{
					program_id: programId,
					user_id: userId,
				}
			);
			if (response.status === 200) {
				addNotification("This program is already saved.", "info");
			} else if (response.status === 201) {
				addNotification("You have successfully saved this program!", "success");
				setSavedPrograms((prev) => ({ ...prev, [programId]: true }));
			}
		} catch (error) {
			console.error("Error saving program:", error);
			addNotification("Failed to save program. " + error, "error");
		}
	};

	const handleUnsaveProgram = async (programId) => {
		try {
			const userId = await getUserIdByEmail(user.email);
			const response = await axios.post(
				`${process.env.REACT_APP_SERVER}/summer-programs/saved/remove`,
				{
					program_id: programId,
					user_id: userId,
				}
			);
			if (response.status === 200) {
				addNotification("You have unsaved this program.", "info");
				setSavedPrograms((prev) => ({ ...prev, [programId]: false }));
			}
		} catch (error) {
			console.error("Error unsaving program:", error);
			addNotification("Failed to unsave program. " + error, "error");
		}
	};

	const handleAcceptProgram = async () => {
		try {
			const userId = await getUserIdByEmail(user.email);
			const response = await axios.post(
				`${process.env.REACT_APP_SERVER}/summer-programs/accept`,
				{
					user_id: userId,
					program_id: program.id,
				}
			);
			if (response.status === 200) {
				addNotification("You have already accepted this program.", "info");
			} else if (response.status === 201) {
				addNotification(
					"You have successfully accepted this program!",
					"success"
				);
				setIsAccepted(true);
			}
		} catch (error) {
			console.error("Error accepting program:", error);
			addNotification("Failed to accept program. " + error, "error");
		}
	};

	const handleUnacceptProgram = async () => {
		try {
			const userId = await getUserIdByEmail(user.email);
			const response = await axios.post(
				`${process.env.REACT_APP_SERVER}/summer-programs/unaccept`,
				{
					user_id: userId,
					program_id: program.id,
				}
			);
			if (response.status === 200) {
				addNotification("You have unaccepted this program.", "info");
				setIsAccepted(false);
			}
		} catch (error) {
			console.error("Error unaccepting program:", error);
			addNotification("Failed to unaccept program. " + error, "error");
		}
	};

	const handleToggleAccept = () => {
		if (isAccepted) {
			handleUnacceptProgram();
		} else {
			handleAcceptProgram();
		}
	};

	if (!program) {
		return <div>Loading...</div>;
	}

	return (
		<div className="details-page">
			{/* Left Panel */}
			<div className="left-panel">
				<h1>{program.name}</h1>
				<div className="program-info">
					<div className="program-category">
						<span>{program.category}</span>
					</div>
				</div>
				<div className="program-description">
					<h2>Description</h2>
					<p>{program.description}</p>
				</div>
				<div className="program-requirements">
					<h2>Requirements</h2>
					<p>{program.requirements}</p>
				</div>
			</div>

			{/* Right Panel */}
			<div className="right-panel">
				<h2>Program Details</h2>
				<div className="detail-item">
					<strong>Deadline:</strong>{" "}
					{new Date(program.deadline).toLocaleDateString()}
				</div>
				<div className="detail-item">
					<strong>Location:</strong> {program.location}
				</div>
				<div className="detail-item">
					<strong>Cost:</strong> ${program.cost}
				</div>

				<div className="accept-card-container">
					<label className="accept-card-label">
						<input
							type="checkbox"
							className="accept-card-input"
							checked={isAccepted}
							onChange={handleToggleAccept}
						/>
						<div className="accept-card-content">
							<div className="accept-card-icon">
								<i className="fa-solid fa-check"></i>
							</div>
							<div className="accept-card-text">
								<span className="accept-card-title">
									{isAccepted ? "Accepted" : "Accept Program"}
								</span>
								<span className="accept-card-subtitle">
									{isAccepted
										? "You have accepted this program"
										: "Click to accept this program"}
								</span>
							</div>
						</div>
						<div className="accept-card-overlay"></div>
					</label>
				</div>

				{savedPrograms[program.id] ? (
					<button
						onClick={() => handleUnsaveProgram(program.id)}
						className="unsave-button"
					>
						Unsave Program
					</button>
				) : (
					<button
						onClick={() => handleSaveProgram(program.id)}
						className="save-button"
					>
						Save Program
					</button>
				)}
			</div>
		</div>
	);
};

export default SPDetailsPage;
