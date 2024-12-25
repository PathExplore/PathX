import React, { useState, useEffect } from "react";
import { Navigate } from "react-router-dom";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { useNotification } from "./NotificationContext";

const ProtectedRoute = ({ element }) => {
	const [loading, setLoading] = useState(true);
	const [user, setUser] = useState(null);
	const auth = getAuth();
	const { addNotification } = useNotification();

	useEffect(() => {
		const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
			setUser(currentUser);
			setLoading(false);
		});

		return () => unsubscribe();
	}, [auth]);

	if (loading) {
		return <div>Loading...</div>;
	}

	if (!user) {
		addNotification("Please sign in to access these pages.", "error");
		return <Navigate to="/" replace />;
	}

	return element;
};

export default ProtectedRoute;