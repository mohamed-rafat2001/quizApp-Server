import mongoose from "mongoose";
export default function dbConnect() {
	mongoose
		.connect(process.env.DB_URL)
		.then(() => console.log("db connected"))
		.catch((e) => console.log(e));
}
