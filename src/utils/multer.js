import multer from "multer";
import appError from "./appError.js";

export default function fileUpload(validation) {
	const multerStorag = multer.diskStorage({
		filename: (req, file, cb) => {
			const ext = file.mimetype.split("/")[1];
			cb(null, `user-${req.user._id}-${Date.now()}.${ext}`);
		},
	});
	const multerFilter = (req, file, cb) => {
		if (!file.mimetype.startsWith(validation))
			cb(
				new appError(
					`Not an ${validation} ! please enter only ${validation}`,
					400
				),
				null
			);
		cb(null, true);
	};

	const upload = multer({
		storage: multerStorag,
		fileFilter: multerFilter,
	});
	return upload;
}
