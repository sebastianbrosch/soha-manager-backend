import express from 'express';
import Hardware from '../models/hardware.js';
import Barcode from '../models/barcode.js';

// init the router
const router = express.Router();

router.get('/hardware', async (req, res) => {
	await Barcode.findAll({
		where: {
			format: req.body.format,
			code: req.body.code
		},
		include: {
			model: Hardware,
		}
	}).then(barcodeItems => {
		let arrHardwareItems = [];

		barcodeItems.forEach((barcodeItem) => {
			if (barcodeItem.Hardware) {
				arrHardwareItems.push(barcodeItem.Hardware);
			}
		});

		res.status(200).json(arrHardwareItems);
	}).catch(err => {
		console.log(err);
		res.status(500).json({error: err});
	});
});

router.post('/software', async (req, res) => {
	await Barcode.findAll({
		where: {
			format: req.body.format,
			code: req.body.code
		},
		include: {
			model: Software,
		}
	}).then(barcodeItems => {
		let arrSoftwareItems = [];

		barcodeItems.forEach((barcodeItem) => {
			if (barcodeItem.Software) {
				arrSoftwareItems.push(barcodeItem.Software);
			}
		});

		res.status(200).json(arrSoftwareItems);
	}).catch(err => {
		console.log(err);
		res.status(500).json({error: err});
	});
});

export default router;
