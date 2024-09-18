import express from "express";
const userRouter = express.Router();
import fileUpload from "../utils/multer.js";
import {
	createUser,
	loginFunc,
	updateMe,
	getMe,
	deleteMe,
	getUser,
	updatePassword,
	forgetPass,
	resetPass,
	blockUserByAdmin,
	allUsers,
} from "../controllers/userControll.js";
import { allowTo, protect } from "../middelwars/authMiddelwar.js";

//auth
userRouter.route("/signUp").post(createUser);
userRouter.route("/login").post(loginFunc);
userRouter.post("/forgetPassword", forgetPass);
userRouter.patch("/resetPassword", resetPass);

// protect all routes after this middelware
userRouter.use(protect);
userRouter
	.route("/Me")
	.get(getMe, getUser)
	.patch(fileUpload("image").single("image"), updateMe)
	.delete(deleteMe);
userRouter.patch("/updatePassword", updatePassword);
userRouter.get("/getUser/:id", getUser);
userRouter.patch("/blockUser/admin/:id", allowTo("admin"), blockUserByAdmin);
userRouter.get("/allUsers/admin", allowTo("admin"), allUsers);
export default userRouter;
