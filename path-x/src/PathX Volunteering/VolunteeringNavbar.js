import React, { useState, useEffect } from "react";
import {
	getAuth,
	signInWithPopup,
	signOut,
	GoogleAuthProvider,
	OAuthProvider,
} from "firebase/auth";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useNotification } from "../NotificationContext";
import "./VolunteeringNavbar.css";
import AuthModal from "../AuthModal";

const VolunteeringNavbar = () => {
	const [user, setUser] = useState(null);
	const [isModalOpen, setModalOpen] = useState(false);
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
			navigate("/volunteering");
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

	return (
		<>
			<nav className="navbar">
				<a href="/volunteering" className="navbar-brand">
					<img
						src="/images/pathX-volunteering-logo.png"
						alt="PathX Logo"
						className="navbar-logo"
					/>
					PathX Volunteering
				</a>
				<ul className="navbar-links">
					<li>
						<a href="/volunteering/dashboard">Dashboard</a>
					</li>
					<li>
						<a href="/volunteering/opportunities">Opportunities</a>
					</li>
					<li>
						<a href="/about">About</a>
					</li>
					{user ? (
						<li>
							<button className="signout-button" onClick={handleSignOut}>
								Sign Out
							</button>
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

			<AuthModal
				isOpen={isModalOpen}
				onClose={() => setModalOpen(false)}
				onGoogleSignIn={handleGoogleSignIn}
				onMicrosoftSignIn={handleMicrosoftSignIn}
			/>
		</>
	);
};

export default VolunteeringNavbar;
