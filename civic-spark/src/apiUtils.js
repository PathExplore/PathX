import axios from "axios";

export const getUserIdByEmail = async (email) => {
	try {
		const response = await axios.get(
			`${process.env.REACT_APP_SERVER}/user/get_user_id_by_email`,
			{
				params: { email },
			}
		);

		return response.data.user_id;
	} catch (error) {
		console.error("Error fetching user ID by email:", error);
		throw new Error("Could not fetch user ID. Please ensure the email exists.");
	}
};