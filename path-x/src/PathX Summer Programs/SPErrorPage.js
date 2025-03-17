import React from "react";
import "./SPErrorPage.css";

const SPErrorPage = () => {
	return (
		<div className="sp-error-page">
			<h1 className="error-title">Oops! That page doesn't exist yet.</h1>
			<a href="/summer-programs" className="error-button">
				Go Back Home
			</a>
		</div>
	);
};

export default SPErrorPage;
