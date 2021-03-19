import express from 'express';
import Software from '../models/software.js';
import Comment from '../models/comment.js';
import Document from '../models/document.js';
import multer from 'multer';
import Hardware from '../models/hardware.js';
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
    cb(null, Date.now() + file.originalname.toLowerCase());
  }
});

const fileStorage = multer.diskStorage({
	destination: function(req, file, cb) {
		cb(null, './static/files/');
	},
	filename: function(req, file, cb) {
		cb(null, Date.now() + file.originalname.toLowerCase());
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
};

const documentUpload = multer({storage: documentStorage, limits: {
  filesize: 1024 * 1024 * 5
}, fileFilter: documentFilter});

const fileUpload = multer({storage: fileStorage, limits: {
	filesize: 1024 * 1024 * 5
}, fileFilter: fileFilter});

// init the router
const router = express.Router();


/**
 * @swagger
 * /software:
 *   get:
 *     description: Returns all Software of the Software and Hardware Management.
 *     responses:
 *       '200':
 *         description: A list of all Software items.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: "#/components/schemas/Software"
 */
router.get('/', (req, res) => {
  Software.findAll().then(software_items => {
    res.status(200).json(software_items);
  }).catch(err => {
    res.status(500).json({error: err});
  });
});

router.get('/hardware', (req, res) => {
  Software.findAll({include: {model: Hardware}}).then(software_items => {
    res.status(200).json(software_items);
  }).catch(err => {
    res.status(500).json({error: err});
  });
});

/**
 * @openapi
 * /software/users:
 *   get:
 *     description: Welcome to swagger-jsdoc!
 *     responses:
 *       200:
 *         description: Returns a mysterious string.
 */
router.get('/users', (req, res) => {
	console.log('software with users get');
  Software.findAll({include: {model: User}}).then(software_items => {
    res.status(200).json(software_items);
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

/**
 * @openapi
 * /software/{softwareId}/comments:
 *   get:
 *     description: Get all comments of a software.
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: Returns all comments of the software.
 *     parameters:
 *       - name: softwareId
 *         in: path
 *         required: true
 */
router.get('/:softwareId/comments', (req, res) => {
  Software.findByPk(req.params.softwareId, {include: {model: Comment}}).then(software_item => {
    software_item.getComments({include: {model: User}}).then(comment_items => {
      res.status(200).json(comment_items);
    }).catch(err => {
      res.status(500).json({error: err});
    });
  }).catch(err => {
    res.status(500).json({error: err});
  });
});

/**
 * @openapi
 * /software/{softwareId}/documents:
 *   get:
 *     description: Get all documents of a software.
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: Returns all documents of the software.
 *     parameters:
 *       - name: softwareId
 *         in: path
 *         required: true
 */
router.get('/:softwareId/documents', (req, res) => {
  Software.findByPk(req.params.softwareId, {include: {model: Document}}).then(software_item => {
    software_item.getDocuments().then(document_items => {
      res.status(200).json(document_items);
    }).catch(err => {
      res.status(500).json({error: err});
    });
  }).catch(err => {
    res.status(500).json({error: err});
  });
});

router.get('/:softwareId/files', (req, res) => {
	Software.findByPk(req.params.softwareId, {include: {model: File}}).then(softwareItem => {
		softwareItem.getFiles().then(fileItems => {
			res.status(200).json(fileItems);
		}).catch(err => {
			res.status(500).json({error: err});
		});
	}).catch(err => {
		res.status(500).json({error: err});
	});
});

router.get('/:id/barcodes', (req, res) => {
	Software.findByPk(req.params.id, {include: {model: Barcode}}).then(software => {
		software.getBarcodes().then(barcodes => {
			res.status(200).json(barcodes);
		}).catch(err => {
			res.status(500).json({error: err});
		});
	}).catch(err => {
		res.status(500).json({error: err});
	});
});

// get a specific software item
router.get('/:id', (req, res) => {
  Software.findByPk(req.params.id).then(software_item => {
    res.status(200).json(software_item);
  }).catch(err => {
    res.status(500).json({error: err});
  });
});

// create a new software item
router.post('/', (req, res) => {
  Software.create({
    name: req.body.name,
    units: req.body.units,
    offlinefolder: req.body.offlinefolder,
    license: req.body.license,
    state: req.body.state
  }).then(software_item => {
    res.status(200).json(software_item);
  }).catch(err => {
    res.status(500).json({error: err});
  });
});

router.post('/:sid/documents', documentUpload.single('document'), (req, res) => {
  Software.findByPk(req.params.sid).then(software_item => {
		console.log(req.file);
    Document.create({
      description: req.body.description,
      documenttype: req.body.documenttype,
			static_file: req.file.filename,
			filename: req.file.originalname,
			mime: req.file.mimetype,
      SoftwareId: software_item.id
    }).then(document_item => {

      res.status(200).json(document_item);
    }).catch(err => {
      res.status(500).json({error: err});
    });
  }).catch(err => {
    res.status(500).json({error: err});
  });
});

router.post('/:softwareId/files', fileUpload.single('file'), (req, res) => {
	Software.findByPk(req.params.softwareId).then(softwareItem => {
		File.create({
			description: req.body.description,
			filename: req.file.originalname,
			mime: req.file.mimetype,
			static_filename: req.file.filename,
			SoftwareId: softwareItem.id
		}).then(fileItem => {
			res.status(200).json(fileItem);
		}).catch(err => {
			res.status(500).json({error: err});
		});
	}).catch(err => {
		res.status(500).json({error: err});
	});
});

router.post('/:sid/barcodes', (req, res) => {
	Software.findByPk(req.params.sid).then(softwareItem => {
		Barcode.create({
			format: req.body.format,
			code: req.body.barcode,
			SoftwareId: softwareItem.id
		}).then(barcodeItem => {
			res.status(200).json(barcodeItem);
		}).catch(err => {
			res.status(500).json({error: err});
		});
	}).catch(err => {
		res.status(500).json({error: err});
	});
});

router.post('/:sid/comments', (req, res) => {
  Software.findByPk(req.params.sid).then(software_item => {
    Comment.create({
      content: req.body.content,
      SoftwareId: software_item.id,
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

// update the software item
router.put('/:id', (req, res) => {
  Software.update({
    name: req.body.name,
    units: req.body.units,
    license: req.body.license,
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

// delete the software item
router.delete('/:id', (req, res) => {
  Software.destroy({
    where: {
      id: req.params.id
    }
  }).then(() => {
    res.status(200).json({deleted: req.params.id});
  }).catch(err => {
    res.status(500).json({error: err});
  });
});

router.delete('/:sid/barcodes/:bid', (req, res) => {
  Barcode.destroy({
    where: {
      id: req.params.bid
    }
  }).then(() => {
    res.status(200).json({deleted: req.params.bid});
  }).catch(err => {
    res.status(500).json({error: err});
  });
});

router.delete('/:sid/documents/:did', async (req, res) => {
	const documentItem = await Document.findByPk(req.params.did);
	const staticFilename = documentItem.static_file;

	await Document.destroy({ where: {	id: req.params.did }}).then((documentItem) => {
		fs.unlinkSync(path.resolve() + '/static/documents/' + staticFilename);
		res.status(200).json({deleted: req.params.did});
	}).catch(err => {
		res.status(500).json({error: err});
	});
});

router.delete('/:softwareId/files/:fileId', async (req, res) => {
	const fileItem = await File.findByPk(req.params.fileId);
	const static_filename = fileItem.static_filename;

	await File.destroy({ where: { id: req.params.fileId }}).then(fileItem => {
		fs.unlinkSync(path.resolve() + '/static/files/' + static_filename);
		res.status(200).json({deleted: req.params.fileId});
	}).catch(err => {
		res.status(500).json({error: err});
	});
});

export default router;
