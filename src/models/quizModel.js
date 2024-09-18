import mongoose from "mongoose"; // Erase if already required

// Declare the Schema of the Mongo model
const quizSchema = new mongoose.Schema(
	{
		quizName: {
			type: String,
			require: true,
			trim: true,
		},
		teacherId: {
			type: mongoose.Schema.ObjectId,
			ref: "UserModel",
		},
		questions: [
			{
				ques: String,
				answers: [],
				correctAnswer: String,
				Score: Number,
			},
		],
		numberTookQuiz: {
			type: Number,
			default: 0,
		},
		quizScore: Number,
		successRate: Number,
		passingNum: {
			type: Number,
			default: 0,
		},
		averagePassing: {
			type: Number,
			default: 0,
		},
		firstInQuiz: [
			{
				studentId: {
					type: mongoose.Schema.ObjectId,
					ref: "UserModel",
				},
				Score: Number,
			},
		],
		quizId: String,
		quizPassword: String,
		expire: Number,
		expireDate: Date,
	},
	{ timestamps: true }
);

//Export the model
export default mongoose.model("QuizModel", quizSchema);
