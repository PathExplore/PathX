import React from "react";
import "./ErrorPage.css";

const ErrorPage = () => {
	return (
		<div className="error-page">
			<h1 className="error-title">Oops! That page doesn't exist yet.</h1>
			<a href="/" className="error-button">
				Go Back Home
			</a>
		</div>
	);
};

export default ErrorPage;
