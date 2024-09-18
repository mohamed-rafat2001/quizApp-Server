export default function (model, code, res) {
	res.status(code).json({
		status: "success",
		data: model,
	});
}
