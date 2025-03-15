import React, { createContext, useContext, useState } from "react";
import "./Notification.css";

const NotificationContext = createContext();

export const useNotification = () => {
	return useContext(NotificationContext);
};

export const NotificationProvider = ({ children }) => {
	const [notifications, setNotifications] = useState([]);

	const addNotification = (message, type = "success") => {
		const id = Date.now();
		setNotifications((prev) => [...prev, { id, message, type }]);

		setTimeout(() => {
			setNotifications((prev) =>
				prev.filter((notification) => notification.id !== id)
			);
		}, 3000);
	};

	return (
		<NotificationContext.Provider value={{ addNotification }}>
			{children}
			<div className="notification-container">
				{notifications.map((notification) => (
					<div
						key={notification.id}
						className={`notification ${notification.type}`}
					>
						{notification.message}
					</div>
				))}
			</div>
		</NotificationContext.Provider>
	);
};
