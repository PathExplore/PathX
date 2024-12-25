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
            Hi, I’m Rukshik, a passionate developer who loves turning ideas into reality through
            technology. My journey started with curiosity about how websites work, which evolved
            into a deep passion for crafting engaging digital experiences.
          </p>
        </div>
      </section>

      {/* Skills Section */}
      <section className="skills-section">
        <div className="content-wrapper">
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
            Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
          </p>
        </div>
      </section>

      {/* Contact Section */}
      <section className="contact-section">
        <div className="content-wrapper">
          <h2>Let’s Connect</h2>
          <p>
            I’m always excited to collaborate on innovative projects or discuss new ideas. Feel free to reach out via GitHub or email!
          </p>
          <div className="social-links">
            <a href="mailto:rukshikn@gmail.com">
              <i className="fa fa-envelope"></i>
            </a>
            <a href="https://github.com/rukshik" target="_blank" rel="noopener noreferrer">
              <i className="fa fa-github"></i>
            </a>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AboutPage;