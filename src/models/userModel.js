import mongoose from "mongoose";
import bcryptjs from "bcryptjs";
import slugify from "slugify";
import validator from "validator";
import jwt from "jsonwebtoken";

const userSchema = new mongoose.Schema(
	{
		name: {
			type: String,
			required: [true, "name required"],
			trim: true,
			minlength: 3,
		},
		email: {
			type: String,
			required: [true, "email required"],
			trim: true,
			validate: [validator.isEmail, "please enter the correct email"],
		},
		password: {
			type: String,
			required: [true, "password required"],
			trim: true,
			validate: [
				validator.isStrongPassword,
				"password must be minlength: 8, minUppercase: 1, minLowercase: 1, minNumbers: 1, minSymbols: 1 ",
			],
		},
		confirmPass: {
			type: String,
			required: [true, "confirmPass required"],
			trim: true,
			validate: {
				validator: function (el) {
					return el === this.password;
				},
				message: "confirm password must equal password",
			},
		},
		slug: String,
		passwordChangeAt: Date,
		resetPassCode: String,
		role: {
			type: String,
			default: "student",
			enum: ["student", "teacher", "admin"],
		},
		active: {
			type: Boolean,
			default: true,
		},
		block: {
			type: Boolean,
			default: false,
		},
		profileImg: {
			public_id: String,
			secure_url: String,
		},
	},
	{ timestamps: true }
);
userSchema.pre("save", async function (next) {
	this.slug = slugify(this.name, { lower: true });
	if (!this.isModified("password")) return next();

	this.password = await bcryptjs.hash(this.password, 12);
	this.confirmPass = undefined;
	next();
});

userSchema.pre("save", async function (next) {
	if (!this.isModified("password") || this.isNew) return next();

	this.passwordChangeAt = Date.now() - 1000;
	next();
});
userSchema.pre(/^find/, function (next) {
	this.find({
		active: {
			$ne: false,
		},
	});
	this.find({
		block: {
			$ne: true,
		},
	});
	next();
});
userSchema.methods.createToken = function () {
	const token = jwt.sign({ id: this._id.toString() }, process.env.JWT_SECRET);
	return token;
};
userSchema.methods.correctPassword = async function (password, userPassword) {
	const checkPass = await bcryptjs.compare(password, userPassword);
	return checkPass;
};
userSchema.methods.toJSON = function () {
	const user = this.toObject();
	delete user.password;
	delete user.__v;
	return user;
};
const UserModel = mongoose.model("UserModel", userSchema);
export default UserModel;
