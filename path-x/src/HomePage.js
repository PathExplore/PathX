import React, { useState, useEffect } from "react";
import "./HomePage.css";
import AuthModal from "./AuthModal";
import {
	getAuth,
	signInWithPopup,
	GoogleAuthProvider,
	OAuthProvider,
	onAuthStateChanged,
} from "firebase/auth";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useNotification } from "./NotificationContext";

const HomePage = () => {
	const [user, setUser] = useState(null);
	const [isModalOpen, setModalOpen] = useState(false);
	const [email, setEmail] = useState("");
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

			await saveUserToDatabase(result.user);
			navigate("/");
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
			navigate("/");
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
		<div className="pathx-home-container">
			{/* Hero Section */}
			<section className="hero-section">
				<div className="hero-content">
					<h1>Your Future Starts Here</h1>
					<p>
						Discover opportunities, build skills, and shape your path with
						PathX.
					</p>
					{user ? (
						<p className="welcome-message">
							Welcome back, {user.displayName || user.email}!
						</p>
					) : (
						<button className="cta-button" onClick={() => setModalOpen(true)}>
							Get Started
						</button>
					)}
				</div>
			</section>

			{/* What is PathX? Section */}
			<section className="about-section">
				<h2>What is PathX?</h2>
				<p>
					PathX is a centralized platform designed for high school students to
					discover and manage opportunities that shape their future. Whether
					you’re looking for volunteering opportunities, summer programs,
					internships, or competitions, PathX provides a dedicated space for
					each category with a unique design and user-friendly experience.
					Students can sign up, explore curated opportunities, save favorites,
					track progress, access a personalized dashboard, and more — all in one
					place. PathX is more than just a search tool; it’s a hub for students
					to take control of their growth and future aspirations.
				</p>
			</section>

			{/* Features Section */}
			<section className="main-features-section">
				<h2>What We Offer</h2>
				<div className="main-feature-cards">
					<div className="main-feature-card">
						<h3>Volunteering</h3>
						<p>
							Make a difference in your community and gain valuable experience.
						</p>
					</div>
					<div className="main-feature-card">
						<h3>Internships</h3>
						<p>Explore real-world opportunities to kickstart your career.</p>
					</div>
					<div className="main-feature-card">
						<h3>Summer Programs</h3>
						<p>Learn, grow, and explore new interests during your summer.</p>
					</div>
					<div className="main-feature-card">
						<h3>Competitions</h3>
						<p>Challenge yourself and showcase your skills.</p>
					</div>
				</div>
			</section>

			{/* Stats Section */}
			<section className="stats-section">
				<div className="stat">
					<h3>10,000+</h3>
					<p>Users</p>
				</div>
				<div className="stat">
					<h3>500+</h3>
					<p>Opportunities</p>
				</div>
				<div className="stat">
					<h3>100+</h3>
					<p>Partners</p>
				</div>
			</section>

			{/* Testimonials Section */}
			<section className="testimonials-section">
				<h2>What Our Users Say</h2>
				<div className="testimonials-grid">
					<div className="testimonial">
						<blockquote>
							"PathX helped me find an amazing internship that kickstarted my
							career!"
						</blockquote>
						<p>- Sarah M.</p>
					</div>
					<div className="testimonial">
						<blockquote>
							"I discovered so many volunteering opportunities that I never knew
							existed."
						</blockquote>
						<p>- James L.</p>
					</div>
					<div className="testimonial">
						<blockquote>
							"The summer programs on PathX were life-changing for me."
						</blockquote>
						<p>- Emily R.</p>
					</div>
				</div>
			</section>

			{/* Call-to-Action Section */}
			<section className="main-cta-section">
				<h2>Ready to Take the Next Step?</h2>
				<p>
					Join thousands of students who are already shaping their future with
					PathX.
				</p>
				{user ? (
					<></>
				) : (
					<button className="cta-button" onClick={() => setModalOpen(true)}>
						Sign Up Now
					</button>
				)}
			</section>

			{/* Footer */}
			<footer className="footer">
				<p>© 2025 PathX. All Rights Reserved.</p>
				<nav>
					<a href="#privacy">Privacy Policy</a> |{" "}
					<a href="#terms">Terms of Service</a> |{" "}
					<a href="#contact">Contact Us</a>
				</nav>
			</footer>

			{/* Auth Modal */}
			<AuthModal
				isOpen={isModalOpen}
				onClose={() => setModalOpen(false)}
				onGoogleSignIn={handleGoogleSignIn}
				onMicrosoftSignIn={handleMicrosoftSignIn}
			/>
		</div>
	);
};

export default HomePage;
