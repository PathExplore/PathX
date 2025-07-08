import React, { useState, useEffect } from "react";
import "./SPHomePage.css";
import SPAuthModal from "./SPAuthModal";
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

const SPHomePage = () => {
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
			navigate("/summer-programs/dashboard");
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
			navigate("/summer-programs/dashboard");
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
		<div className="summer-programs-home-container">
			<header className="sp-header">
				<div className="header-content">
					<div className="header-title">
						<img
							src="/images/pathX-sp-logo.png"
							alt="PathX Summer Programs Logo"
							className="header-logo"
						/>
						<h1 className="app-title">PathX Summer Programs</h1>
					</div>
					<p className="tagline">
						Discover transformative summer experiences to fuel your growth and
						passions.
					</p>
					{user ? (
						<p className="sp-welcome-message">
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
						<h2>About PathX Summer Programs</h2>
						<p>
							PathX Summer Programs is your gateway to life-changing summer
							experiences. Whether you're interested in STEM, arts, leadership,
							or entrepreneurship, we connect you with top-tier programs that
							inspire, educate, and empower. Our platform makes it easy to
							search, apply, and manage your summer plans, so you can focus on
							making the most of your break. Explore hundreds of opportunities,
							track deadlines, and find the perfect program to ignite your
							passions and build your future.
						</p>
					</div>
				</section>

				<section className="sp-features">
					<h2>Why Choose Us?</h2>
					<div className="feature-grid">
						<div className="sp-feature-card">
							<h3>Diverse Programs</h3>
							<p>
								From STEM to the arts, find programs that match your interests
								and goals.
							</p>
						</div>
						<div className="sp-feature-card">
							<h3>Easy Application</h3>
							<p>
								Streamline your summer plans with our user-friendly application
								tools.
							</p>
						</div>
						<div className="sp-feature-card">
							<h3>Expert Guidance</h3>
							<p>
								Get advice and resources to help you choose the right program
								for you.
							</p>
						</div>
						<div className="sp-feature-card">
							<h3>Track Progress</h3>
							<p>
								Manage deadlines, applications, and acceptances all in one
								place.
							</p>
						</div>
					</div>
				</section>

				<section className="sp-testimonials">
					<h2>What Our Users Say</h2>
					<div className="sp-testimonial testimonial">
						<blockquote>
							"PathX Summer Programs helped me find an incredible STEM program
							that changed my career trajectory!"
						</blockquote>
						<p>- Sarah M., Student</p>
					</div>
					<div className="sp-testimonial testimonial">
						<blockquote>
							"I discovered so many unique summer opportunities that I never
							knew existed."
						</blockquote>
						<p>- James L., Parent</p>
					</div>
				</section>

				<section className="sp-cta-section">
					<h2>Start Your Summer Journey</h2>
					<p>
						Ready to make this summer unforgettable? Join thousands of students
						who are already exploring their passions with PathX Summer Programs.
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

			<SPAuthModal
				isOpen={isModalOpen}
				onClose={() => setModalOpen(false)}
				onGoogleSignIn={handleGoogleSignIn}
				onMicrosoftSignIn={handleMicrosoftSignIn}
			/>
		</div>
	);
};

export default SPHomePage;
