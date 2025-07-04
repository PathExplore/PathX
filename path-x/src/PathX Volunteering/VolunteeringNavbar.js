import React, { useState, useEffect, useRef } from "react";
import {
	getAuth,
	signInWithPopup,
	signOut,
	GoogleAuthProvider,
	OAuthProvider,
	updateProfile,
} from "firebase/auth";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useNotification } from "../NotificationContext";
import "./VolunteeringNavbar.css";
import VolunteeringAuthModal from "./VolunteeringAuthModal";

const VolunteeringNavbar = () => {
	const [user, setUser] = useState(null);
	const [isModalOpen, setModalOpen] = useState(false);
	const [isProfileModalOpen, setProfileModalOpen] = useState(false);
	const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);
	const [isDropdownOpen, setDropdownOpen] = useState(false);
	const [profileData, setProfileData] = useState(null);
	const dropdownRef = useRef(null);
	const auth = getAuth();
	const { addNotification } = useNotification();
	const navigate = useNavigate();

	const saveUserToDatabase = async (userData) => {
		try {
			const response = await axios.post(
				`${process.env.REACT_APP_SERVER}/add_user`,
				{
					email: userData.email,
					name: userData.displayName || "Anonymous",
					profile_picture_url:
						userData.photoURL ||
						"https://media.istockphoto.com/id/1332100919/vector/man-icon-black-icon-person-symbol.jpg?s=612x612&w=0&k=20&c=AVVJkvxQQCuBhawHrUhDRTCeNQ3Jgt0K1tXjJsFy1eg=",
				}
			);

			if (response.status === 201) {
				addNotification(
					`Welcome, ${userData.displayName || userData.email}!`,
					"success"
				);
			} else if (response.status === 200) {
				addNotification("Welcome back!", "info");
			}
		} catch (error) {
			console.error("Error saving user to database:", error);
			addNotification(
				"Failed to save user data. Please try again later. " + error,
				"error"
			);
		}
	};

	const handleGoogleSignIn = async () => {
		const provider = new GoogleAuthProvider();
		try {
			const result = await signInWithPopup(auth, provider);
			setUser(result.user);
			setModalOpen(false);

			await saveUserToDatabase(result.user);
			navigate("/volunteering/dashboard");
		} catch (error) {
			console.error("Error signing in with Google:", error);
			addNotification(
				"Authorization failed. Please try again later. " + error,
				"error"
			);
		}
	};

	const handleMicrosoftSignIn = async () => {
		const provider = new OAuthProvider("microsoft.com");
		provider.addScope("user.read");
		try {
			const result = await signInWithPopup(auth, provider);
			setUser(result.user);
			setModalOpen(false);

			await saveUserToDatabase(result.user);
			navigate("/volunteering/dashboard");
		} catch (error) {
			console.error("Error signing in with Microsoft:", error);
			addNotification(
				"Authorization failed. Please try again later. " + error,
				"error"
			);
		}
	};

	const handleSignOut = async () => {
		try {
			await signOut(auth);
			setUser(null);
			addNotification("Signed out successfully.", "success");
			navigate("/");
		} catch (error) {
			console.error("Error signing out:", error);
			addNotification(
				"Authorization failed. Please try again later. " + error,
				"error"
			);
		}
	};

	useEffect(() => {
		const unsubscribe = auth.onAuthStateChanged((currentUser) => {
			setUser(currentUser);
		});

		return () => unsubscribe();
	}, [auth]);

	useEffect(() => {
		const handleOutsideClick = (event) => {
			if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
				setDropdownOpen(false);
			}
		};
		document.addEventListener("mousedown", handleOutsideClick);
		return () => {
			document.removeEventListener("mousedown", handleOutsideClick);
		};
	}, []);

	const getUserIdByEmail = async (email) => {
		const response = await axios.get(
			`${process.env.REACT_APP_SERVER}/user/get_user_id_by_email`,
			{ params: { email } }
		);
		return response.data.user_id;
	};

	const handleEditProfile = async (updatedProfile) => {
		try {
			const userId = await getUserIdByEmail(user.email);
			await axios.post(`${process.env.REACT_APP_SERVER}/user/update_profile`, {
				user_id: userId,
				name: updatedProfile.name,
				email: user.email,
				profile_picture_url: updatedProfile.profile_picture_url,
			});
			await updateProfile(auth.currentUser, {
				displayName: updatedProfile.name,
				photoURL: updatedProfile.profile_picture_url,
			});
			addNotification("Profile updated successfully.", "success");
			setProfileModalOpen(false);
			window.location.reload();
		} catch (error) {
			console.error("Error updating profile", error);
			addNotification("Failed to update profile. " + error, "error");
		}
	};

	const handleDeleteAccount = async () => {
		try {
			const userId = await getUserIdByEmail(user.email);
			await axios.delete(
				`${process.env.REACT_APP_SERVER}/user/delete?user_id=${userId}`
			);
			await signOut(auth);
			setUser(null);
			setDeleteModalOpen(false);
			addNotification("Account deleted successfully.", "success");
			navigate("/");
		} catch (error) {
			console.error("Error deleting account:", error);
			addNotification("Failed to delete account. " + error, "error");
		}
	};

	return (
		<>
			<nav className="volunteering-navbar">
				<a href="/volunteering" className="navbar-brand">
					<img
						src="/images/pathX-volunteering-logo.png"
						alt="PathX Volunteering Logo"
						className="navbar-logo"
					/>
					PathX Volunteering
				</a>
				<ul className="navbar-links">
					<li>
						<a href="/">PathX Home</a>
					</li>
					<li>
						<a href="/volunteering/dashboard">Dashboard</a>
					</li>
					<li>
						<a href="/volunteering/opportunities">Opportunities</a>
					</li>
					{user ? (
						<li className="profile-dropdown">
							<button
								className="profile-picture-button"
								onClick={() => setDropdownOpen(!isDropdownOpen)}
							>
								<img
									src={user.photoURL || "/images/default-avatar.png"}
									alt="Profile"
									className="profile-picture"
								/>
							</button>
							{isDropdownOpen && (
								<div className="dropdown-menu" ref={dropdownRef}>
									<button
										className="dropdown-item"
										onClick={() => {
											handleSignOut();
											setDropdownOpen(false);
										}}
									>
										Sign Out
									</button>
									<button
										className="dropdown-item"
										onClick={() => {
											setProfileModalOpen(true);
											setDropdownOpen(false);
										}}
									>
										Edit Profile
									</button>
									<button
										className="dropdown-item"
										onClick={() => {
											setDeleteModalOpen(true);
											setDropdownOpen(false);
										}}
									>
										Delete Account
									</button>
								</div>
							)}
						</li>
					) : (
						<li>
							<button
								className="signin-button"
								onClick={() => setModalOpen(true)}
							>
								Sign In
							</button>
						</li>
					)}
				</ul>
			</nav>

			<VolunteeringAuthModal
				isOpen={isModalOpen}
				onClose={() => setModalOpen(false)}
				onGoogleSignIn={handleGoogleSignIn}
				onMicrosoftSignIn={handleMicrosoftSignIn}
			/>

			{isProfileModalOpen && (
				<div className="modal-backdrop">
					<div className="modal volunteering-modal-bg">
						<h2>Edit Profile</h2>
						<form
							onSubmit={async (e) => {
								e.preventDefault();
								const formData = new FormData(e.target);
								handleEditProfile({
									name: formData.get("name"),
									profile_picture_url: formData.get("profile_picture_url"),
								});
							}}
						>
							<div>
								<label className="modal-label">Name</label>
								<input
									type="text"
									name="name"
									className="modal-input"
									defaultValue={user.displayName || ""}
									required
								/>
							</div>
							<div>
								<label className="modal-label">Profile Picture URL</label>
								<input
									type="url"
									name="profile_picture_url"
									className="modal-input"
									defaultValue={user.photoURL || ""}
									required
								/>
							</div>
							<div className="modal-buttons">
								<button type="submit" className="cta-button primary">
									Save Changes
								</button>
								<button
									type="button"
									className="cta-button modal-close-nb"
									onClick={() => setProfileModalOpen(false)}
								>
									Cancel
								</button>
							</div>
						</form>
					</div>
				</div>
			)}

			{isDeleteModalOpen && (
				<div className="modal-backdrop">
					<div className="modal volunteering-modal-bg">
						<h2>Delete Account</h2>
						<p className="delete-warning">
							Are you sure you want to delete your account? This action cannot
							be undone.
						</p>
						<div className="modal-buttons">
							<button
								className="cta-button primary"
								onClick={handleDeleteAccount}
							>
								Yes, Delete Account
							</button>
							<button
								className="cta-button modal-close-nb"
								onClick={() => setDeleteModalOpen(false)}
							>
								Cancel
							</button>
						</div>
					</div>
				</div>
			)}
		</>
	);
};

export default VolunteeringNavbar;
