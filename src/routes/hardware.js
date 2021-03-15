import express from 'express';
import Hardware from '../models/Hardware.js';
import Comment from '../models/comment.js';
import Document from '../models/document.js';
import multer from 'multer';
import Software from '../models/software.js';
import User from '../models/user.js';
import Barcode from '../models/barcode.js';
import fs from 'fs';
import path from 'path';
import File from '../models/file.js';

const documentStorage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, './static/documents/');
  },
  filename: function(req, file, cb) {
    cb(null, Date.now() + '_' + file.originalname);
  }
});

const fileStorage = multer.diskStorage({
	destination: function(req, file, cb) {
		cb(null, './static/files/');
	},
	filename: function(req, file, cb) {
		cb(null, Date.now() + '_' + file.originalname.toLowerCase());
	}
});

const documentFilter = (req, file, cb) => {
  if (file.mimetype === 'application/pdf') {
    cb(null, true);
  } else {
    cb(null, false);
  }
};

const fileFilter = (req, file, cb) => {
	cb(null, true);
	// if (file.mimetype === 'application/octet-stream') {
	// } else {
	// 	cb(null, false);
	// }
};

const documentUpload = multer({storage: documentStorage, limits: {
  filesize: 1024 * 1024 * 5
}, fileFilter: documentFilter});

const fileUpload = multer({storage: fileStorage, limits: {
	filesize: 1024 * 1024 * 5
}, fileFilter: fileFilter});

// init the router
const router = express.Router();

// get all hardware items
router.get('/', (req, res) => {
  Hardware.findAll().then(hardware_items => {
    res.status(200).json(hardware_items);
  }).catch(err => {
    res.status(500).json({error: err});
  });
});

router.get('/users', async (req, res) => {
  await Hardware.findAll({include: {model: User}}).then(hardware_items => {
    res.status(200).json(hardware_items);
  }).catch(err => {
    res.status(500).json({error: err});
  });
});

router.post('/barcodes', async (req, res) => {
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

// get a specific hardware item
router.get('/:id', (req, res) => {
  Hardware.findByPk(req.params.id).then(hardware_item => {
    res.status(200).json(hardware_item);
  }).catch(err => {
    res.status(500).json({error: err});
  });
});

router.get('/:id/comments', (req, res) => {
  Hardware.findByPk(req.params.id, {include: {model: Comment}}).then(hardware_item => {
    hardware_item.getComments({include: {model: User}}).then(comment_items => {
      res.status(200).json(comment_items);
    }).catch(err => {
      res.status(500).json({error: err});
    });
  }).catch(err => {
    res.status(500).json({error: err});
  });
});

router.get('/:id/documents', (req, res) => {
  Hardware.findByPk(req.params.id, {include: {model: Document}}).then(hardware_item => {
    hardware_item.getDocuments().then(document_items => {
      res.status(200).json(document_items);
    }).catch(err => {
      res.status(500).json({error: err});
    });
  }).catch(err => {
    res.status(500).json({error: err});
  });
});

router.get('/:hardwareId/files', (req, res) => {
	Hardware.findByPk(req.params.hardwareId, {include: {model: File}}).then(hardwareItem => {
		hardwareItem.getFiles().then(fileItems => {
			res.status(200).json(fileItems);
		}).catch(err => {
			res.status(500).json({error: err});
		});
	}).catch(err => {
		res.status(500).json({error: err});
	});
});

router.get('/:id/barcodes', (req, res) => {
	Hardware.findByPk(req.params.id, {include: {model: Barcode}}).then(hardware => {
		hardware.getBarcodes().then(barcodes => {
			res.status(200).json(barcodes);
		}).catch(err => {
			console.log(err);
			res.status(500).json({error: err});
		});
	}).catch(err => {
		console.log(err);
		res.status(500).json({error: err});
	});
});

router.get('/:hid/software', (req, res) => {
  Hardware.findByPk(req.params.hid, {include: {model: Software}}).then(hardwareItems => {
    hardwareItems.getSoftware().then(softwareItems => {
      res.status(200).json(softwareItems);
    }).catch(err => {
      res.status(500).json({error: err});
    });
  }).catch(err => {
    res.status(500).json({error: err});
  });
});

// create a new hardware item
router.post('/', (req, res) => {
  Hardware.create({
    name: req.body.name,
    serialnumber: req.body.serialnumber,
    devicetype: req.body.devicetype,
    offlinefolder: req.body.offlinefolder,
    state: req.body.state
  }).then(hardware_item => {
    res.status(200).json(hardware_item);
  }).catch(err => {
    res.status(500).json({error: err});
  });
});

router.post('/:hid/documents', documentUpload.single('document'), (req, res) => {
  Hardware.findByPk(req.params.hid).then(hardware_item => {
    Document.create({
      description: req.body.description,
      documenttype: req.body.documenttype,
      static_file: req.file.filename,
			filename: req.file.originalname,
			mime: req.file.mimetype,
      HardwareId: hardware_item.id
    }).then(document_item => {
      res.status(200).json(document_item);
    }).catch(err => {
      res.status(500).json({error: err});
    });
  }).catch(err => {
    res.status(500).json({error: err});
  });
});

router.post('/:hardwareId/files', fileUpload.single('file'), (req, res) => {
	Hardware.findByPk(req.params.hardwareId).then(hardwareItem => {
		File.create({
			mime: req.file.mimetype,
			filename: req.file.originalname,
			static_filename: req.file.filename,
			HardwareId: hardwareItem.id
		}).then(fileItem => {
			res.status(200).json(fileItem);
		}).catch(err => {
			console.log(err);
			res.status(500).json({error: err});
		});
	}).catch(err => {
		console.log(err);
		res.status(500).json({error: err});
	});
});

router.post('/:hid/comments', (req, res) => {
  Hardware.findByPk(req.params.hid).then(hardware_item => {
    Comment.create({
      content: req.body.content,
      HardwareId: hardware_item.id,
			UserId: req.body.userId,
    }).then(comment_item => {
      res.status(200).json(comment_item);
    }).catch(err => {
      res.status(500).json({error: err});
    });
  }).catch(err => {
    res.status(500).json({error: err});
  })
});

router.post('/:hid/barcodes', (req, res) => {
	Hardware.findByPk(req.params.hid).then(hardwareItem => {
		Barcode.create({
			format: req.body.format,
			code: req.body.barcode,
			HardwareId: hardwareItem.id
		}).then(barcodeItem => {
			res.status(200).json(barcodeItem);
		}).catch(err => {
			console.log(err);
			res.status(500).json({error: err});
		});
	}).catch(err => {
		console.log(err);
		res.status(500).json({error: err});
	});
});

router.post('/:hid/software/:sid', (req, res) => {
  Hardware.findByPk(req.params.hid).then(hardwareItem => {
    hardwareItem.addSoftware(req.params.sid);
  });
});

// update the hardware item
router.put('/:id', async (req, res) => {



	if (req.body.softwareAdd) {
		await Hardware.findByPk(req.params.id).then(async (item) => {
			await item.addSoftware(req.body.softwareAdd);
		})
	}

	if (req.body.softwareRemove) {
		await Hardware.findByPk(req.params.id).then(async (item) => {
			await item.removeSoftware(req.body.softwareRemove);
		})
	}

  Hardware.update({
    name: req.body.name,
    serialnumber: req.body.serialnumber,
    devicetype: req.body.devicetype,
    offlinefolder: req.body.offlinefolder,
    state: req.body.state
  }, {
    where: { id: req.params.id }
  }).then(() => {
    res.status(200).json({updated: req.params.id});
  }).catch(err => {
    res.status(500).json({error: err});
  });
});

// delete the hardware item
router.delete('/:id', (req, res) => {
  Hardware.destroy({
    where: {
      id: req.params.id
    }
  }).then(() => {
    res.status(200).json({deleted: req.params.id});
  }).catch(err => {
    res.status(500).json({error: err});
  });
});

router.delete('/:hid/barcodes/:bid', (req, res) => {
  Barcode.destroy({ where: { id: req.params.bid }}).then(() => {
    res.status(200).json({deleted: req.params.bid});
  }).catch(err => {
    res.status(500).json({error: err});
  });
});

router.delete('/:hid/documents/:did', async (req, res) => {
	const documentItem = await Document.findByPk(req.params.did);
	const staticFilename = documentItem.static_file;

	await Document.destroy({ where: {	id: req.params.did }}).then(() => {
		fs.unlinkSync(path.resolve() + '/static/documents/' + staticFilename);
		res.status(200).json({deleted: req.params.did});
	}).catch(err => {
		res.status(500).json({error: err});
	});
});

router.delete('/:hardwareId/files/:fileId', async (req, res) => {
	const fileItem = await File.findByPk(req.params.fileId);
	const static_filename = fileItem.static_filename;

	await File.destroy({ where: { id: req.params.fileId }}).then(() => {
		fs.unlinkSync(path.resolve() + '/static/files/' + static_filename);
		res.status(200).json({deleted: req.params.fileId});
	}).catch(err => {
		res.status(500).json({error: err});
	});
});

export default router;
