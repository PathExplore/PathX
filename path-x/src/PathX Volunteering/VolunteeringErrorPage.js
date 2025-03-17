import React from "react";
import "./VolunteeringErrorPage.css";

const VolunteeringErrorPage = () => {
	return (
		<div className="volunteering-error-page">
			<h1 className="error-title">Oops! That page doesn't exist yet.</h1>
			<a href="/volunteering" className="error-button">
				Go Back Home
			</a>
		</div>
	);
};

export default VolunteeringErrorPage;
