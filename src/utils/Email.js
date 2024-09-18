import nodemailer from "nodemailer";
export default class Email {
	constructor(user) {
		this.to = user.email;
		this.from = "Quiz-App@gmail.com";
		this.name = user.name;
	}
	newTransport() {
		if (process.env.STATUS === "PRODUCTION") {
			return 1;
		}
		return nodemailer.createTransport({
			host: process.env.MAILER_HOST,
			port: process.env.MAILER_PORT,
			auth: {
				user: process.env.MAILER_ID, // generated ethereal user
				pass: process.env.MAILER_PASS, // generated ethereal password
			},
		});
	}
	async send(subject, text) {
		const mailOptions = {
			from: this.from, // sender address
			to: this.to, // list of receivers
			subject, // Subject line
			text,
			html: "", // html body
		};
		await this.newTransport().sendMail(mailOptions);
	}
	async sendWelcome() {
		await this.send("Welcome To Quiz-App", `Welcome ${this.name} in our app`);
	}
	async resetPass(text) {
		await this.send("Reset Password", text);
	}
	async passQuizEmail(text) {
		await this.send("passing quiz", text);
	}
}
