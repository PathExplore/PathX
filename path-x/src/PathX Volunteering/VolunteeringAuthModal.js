import React from "react";
import "./VolunteeringAuthModal.css";

const VolunteeringAuthModal = ({
	isOpen,
	onClose,
	onGoogleSignIn,
	onMicrosoftSignIn,
}) => {
	if (!isOpen) return null;

	return (
		<div className="auth-modal-backdrop">
			<div className="volunteering-auth-modal">
				<h2>Sign In</h2>
				<button onClick={onGoogleSignIn} className="auth-modal-button google">
					Sign in with Google
				</button>
				<button
					onClick={onMicrosoftSignIn}
					className="auth-modal-button microsoft"
				>
					Sign in with Microsoft
				</button>
				<button onClick={onClose} className="auth-modal-close">
					Close
				</button>
			</div>
		</div>
	);
};

export default VolunteeringAuthModal;
