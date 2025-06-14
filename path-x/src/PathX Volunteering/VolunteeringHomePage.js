import React, { useState, useEffect } from "react";
import "./VolunteeringHomePage.css";
import VolunteeringAuthModal from "./VolunteeringAuthModal";
import {
	getAuth,
	signInWithPopup,
	GoogleAuthProvider,
	OAuthProvider,
	onAuthStateChanged,
} from "firebase/auth";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useNotification } from "../NotificationContext";

const VolunteeringHomePage = () => {
	const [user, setUser] = useState(null);
	const [isModalOpen, setModalOpen] = useState(false);
	const auth = getAuth();
	const { addNotification } = useNotification();
	const navigate = useNavigate();

	useEffect(() => {
		const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
			setUser(currentUser);
		});

		return () => unsubscribe();
	}, [auth]);

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

			await saveUserToDatabase(result.user);
			navigate("/dashboard");
			setModalOpen(false);
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

			await saveUserToDatabase(result.user);
			navigate("/dashboard");
			setModalOpen(false);
		} catch (error) {
			console.error("Error signing in with Microsoft:", error);
			addNotification(
				"Authorization failed. Please try again later. " + error,
				"error"
			);
		}
	};

	return (
		<div className="home-container">
			<header className="header">
				<div className="header-content">
					<div className="header-title">
						<img
							src="/images/pathX-volunteering-logo.png"
							alt="PathX Volunteering Logo"
							className="header-logo"
						/>
						<h1 className="app-title">PathX Volunteering</h1>
					</div>
					<p className="tagline">
						Empowering communities through connection, collaboration, and
						action.
					</p>
					{user ? (
						<p className="volunteering-welcome-message">
							Welcome back, {user.displayName || user.email}!
						</p>
					) : (
						<button
							className="cta-button primary"
							onClick={() => setModalOpen(true)}
						>
							Join Now
						</button>
					)}
				</div>
			</header>

			<main>
				<section className="introduction">
					<div className="content-wrapper">
						<h2>About PathX Volunteering</h2>
						<p>
							PathX Volunteering is your go-to platform for discovering hundreds
							of volunteer opportunities, attending local events, and accessing
							valuable resources to help your community. Our free, user-friendly
							tools empower you to easily search, track, and manage your
							volunteer activities, including logging hours and staying
							organized with upcoming events. Whether you're passionate about
							education, the environment, social justice, or beyond, PathX
							Volunteering connects you with meaningful ways to give back and
							make a lasting impact. Together, we can make a difference.
						</p>
					</div>
				</section>

				<section className="features">
					<h2>Why Choose Us?</h2>
					<div className="feature-grid">
						<div className="feature-card">
							<h3>Volunteer Opportunities</h3>
							<p>
								Find meaningful ways to give back. From mentoring youth to
								community cleanups, explore a variety of opportunities.
							</p>
						</div>
						<div className="feature-card">
							<h3>Feature Card 2</h3>
							<p>
								Lorem ipsum odor amet, consectetuer adipiscing elit. Nec ligula
								est eros platea tellus.
							</p>
						</div>
						<div className="feature-card">
							<h3>Feature Card 3</h3>
							<p>
								Non phasellus nascetur litora ut faucibus. Leo penatibus natoque
								magnis dictum luctus enim diam velit.
							</p>
						</div>
						<div className="feature-card">
							<h3>Feature Card 4</h3>
							<p>
								Duis nulla scelerisque fringilla condimentum, eget suscipit
								ridiculus pretium? Donec duis pretium purus consectetur turpis
								et iaculis fusce.
							</p>
						</div>
					</div>
				</section>

				<section className="testimonials">
					<h2>What Our Users Say</h2>
					<div className="testimonial">
						<blockquote>
							"PathX Volunteering has transformed the way I engage with my
							neighborhood. It’s never been easier to find meaningful volunteer
							opportunities!"
						</blockquote>
						<p>- Sarah M., Volunteer</p>
					</div>
					<div className="testimonial">
						<blockquote>
							"As a small business owner, this platform has helped me connect
							with local events and resources. Highly recommended!"
						</blockquote>
						<p>- James L., Local Business Owner</p>
					</div>
				</section>

				<section className="cta-section">
					<h2>Start Your Volunteering Journey</h2>
					<p>
						Ready to make a difference? Join a growing network of engaged
						individuals and organizations working to improve communities across
						the globe.
					</p>
					{user ? (
						<></>
					) : (
						<button
							className="cta-button secondary"
							onClick={() => setModalOpen(true)}
						>
							Join Now
						</button>
					)}
				</section>
			</main>

			<footer className="footer">
				<div className="footer-content">
					<p>© 2025 PathX. All Rights Reserved.</p>
					<nav>
						<a href="#privacy">Privacy Policy</a> |{" "}
						<a href="#terms">Terms of Service</a> |{" "}
						<a href="#contact">Contact Us</a>
					</nav>
				</div>
			</footer>

			<VolunteeringAuthModal
				isOpen={isModalOpen}
				onClose={() => setModalOpen(false)}
				onGoogleSignIn={handleGoogleSignIn}
				onMicrosoftSignIn={handleMicrosoftSignIn}
			/>
		</div>
	);
};

export default VolunteeringHomePage;
