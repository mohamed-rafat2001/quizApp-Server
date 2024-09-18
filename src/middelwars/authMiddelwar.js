import UserModel from "../models/userModel.js";

import appError from "../utils/appError.js";
import errorHandling from "../middelwars/errorHandling.js";
import jwt from "jsonwebtoken";

export const protect = errorHandling(async (req, res, next) => {
	let token;
	// 1) get token from headers
	if (
		req.header("Authorization") &&
		req.header("Authorization").startsWith("Bearer")
	) {
		token = req.header("Authorization").replace("Bearer ", "");
	} else if (req.cookies) {
		token = req.cookies.jwt;
	}
	if (!token)
		return next(
			new appError("you not logged in !, please log in to get access", 401)
		);
	// 2) verify token
	const decode = jwt.verify(token, process.env.JWT_SECRET);

	// 3) find user
	const user = await UserModel.findById(decode.id);
	if (!user)
		return next(new appError("the user belongg this token not exist", 401));

	req.user = user;
	next();
});

export const allowTo = (...roles) => {
	return (req, res, next) => {
		if (!roles.includes(req.user.role))
			return next(
				new appError("you don't have permission to perform this action", 403)
			);
		next();
	};
};
