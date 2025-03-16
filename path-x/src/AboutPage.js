import React from "react";
import "./AboutPage.css";

const AboutPage = () => {
	return (
		<div className="about-page">
			{/* Hero Section */}
			<section className="hero-section">
				<div className="hero-content">
					<img
						src="https://via.placeholder.com/150"
						alt="Rukshik"
						className="profile-picture"
					/>
					<h1 className="creator-name">Rukshik Nelluri</h1>
					{/* <p className="tagline">Creating Digital Wonders, One Line of Code at a Time</p> */}
				</div>
			</section>

			{/* Biography Section */}
			<section className="biography-section">
				<div className="content-wrapper">
					<h2>About Me</h2>
					<p>
						Hi, I’m Rukshik, a passionate developer who loves turning ideas into
						reality through technology. I’m a high school student with a
						fascination for all aspects of computer science, including
						artificial intelligence, website development, machine learning, data
						science, and more! I’m always eager to learn new things and explore
						the endless possibilities of the digital world.
					</p>
				</div>
			</section>

			{/* Skills Section */}
			<section className="skills-section">
				<div className="skills-content-wrapper">
					<h2 className="skill-header">Skills & Interests</h2>
					<div className="skills-grid">
						<div className="skill-card">
							<i className="fa fa-code"></i>
							<p>Full-Stack Development</p>
						</div>
						<div className="skill-card">
							<i className="fa fa-paint-brush"></i>
							<p>UI/UX Design</p>
						</div>
						<div className="skill-card">
							<i class="fa-solid fa-robot"></i>
							<p>Artificial Intelligence</p>
						</div>
						<div className="skill-card">
							<i class="fa-solid fa-database"></i>
							<p>Machine Learning & Data Science</p>
						</div>
						<div className="skill-card">
							<i className="fa fa-lightbulb"></i>
							<p>Creative Problem Solving</p>
						</div>
						<div className="skill-card">
							<i className="fa fa-heart"></i>
							<p>Programming Enthusiast</p>
						</div>
					</div>
				</div>
			</section>

			{/* Origin Story Section */}
			<section className="origin-story-section">
				<div className="content-wrapper">
					<h2>How The Idea Came to Life</h2>
					<p>
						As a high schooler, I’ve spent countless hours scouring the internet
						for opportunities like internships, competitions, summer programs,
						and volunteering experiences. It was frustrating to find that many
						of the best resources were hidden behind paywalls or scattered
						across dozens of websites, making the process overwhelming and
						time-consuming. I realized that if I was struggling to find these
						opportunities, other students probably were too. That’s when the
						idea for PathX was born — a free, one-stop platform designed to make
						it easy for high schoolers to discover and access high-quality
						opportunities all in one place. I wanted to create something that
						would save students the stress and hassle I went through, empowering
						them to explore their passions and build their futures without
						barriers. PathX is my way of giving back and making sure no student
						has to navigate this journey alone.
					</p>
				</div>
			</section>

			{/* Contact Section */}
			<section className="contact-section">
				<div className="content-wrapper">
					<h2>Let’s Connect</h2>
					<p>
						I’m always excited to collaborate on innovative projects or discuss
						new ideas. Feel free to reach out via GitHub or email!
					</p>
					<div className="social-links">
						<a href="mailto:rukshikn@gmail.com">
							<i className="fa fa-envelope"></i>
						</a>
						<a
							href="https://github.com/rukshik"
							target="_blank"
							rel="noopener noreferrer"
						>
							<i className="fa fa-github"></i>
						</a>
					</div>
				</div>
			</section>
		</div>
	);
};

export default AboutPage;
