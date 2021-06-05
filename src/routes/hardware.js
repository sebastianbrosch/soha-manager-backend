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

/**
 * @swagger
 * /hardware:
 *   get:
 *     description: Returns all Hardware items.
 *     tags:
 *       - Hardware
 *     responses:
 *       200:
 *         description: A list of all Hardware items.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: "#/components/schemas/Hardware"
 *       500:
 *         description: A unexpected error on the API.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 */
router.get('/', (req, res) => {
  Hardware.findAll().then(hardware_items => {
    res.status(200).json(hardware_items);
  }).catch(err => {
    res.status(500).json({error: err});
  });
});

/**
 * @swagger
 * /hardware/{HardwareId}:
 *   get:
 *     description: Returns the Hardware item with given ID.
 *     tags:
 *       - Hardware
 *     responses:
 *       200:
 *         description: The found Hardware item.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               items:
 *                 $ref: "#/components/schemas/Hardware"
 *       500:
 *         description: A unexpected error on the API.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *   parameters:
 *     - name: HardwareId
 *       in: path
 *       description: ID of the Hardware item.
 *       required: true
 */
router.get('/:HardwareId', (req, res) => {
  Hardware.findByPk(req.params.HardwareId).then(hardware_item => {
    res.status(200).json(hardware_item);
  }).catch(err => {
    res.status(500).json({error: err});
  });
});

/**
 * @swagger
 * /hardware/{HardwareId}/barcodes:
 *   get:
 *     description: Returns all the Barcode items of the Hardware item with given ID.
 *     tags:
 *       - Hardware
 *     responses:
 *       200:
 *         description: A list of all Barcode items.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: "#/components/schemas/Barcode"
 *       500:
 *         description: A unexpected error on the API.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *   parameters:
 *     - name: HardwareId
 *       in: path
 *       description: ID of the Hardware item.
 *       required: true
 */
router.get('/:HardwareId/barcodes', (req, res) => {
	Hardware.findByPk(req.params.HardwareId, {include: {model: Barcode}}).then(hardware_item => {
		hardware_item.getBarcodes().then(barcodes => {
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

/**
 * @swagger
 * /hardware/{HardwareId}/barcodes:
 *   post:
 *     description: Create a new Barcode item for the Hardware item.
 *     tags:
 *       - Hardware
 *     responses:
 *       200:
 *         description: The Barcode item added to the Hardware item.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               items:
 *                 $ref: "#/components/schemas/Barcode"
 *       500:
 *         description: A unexpected error on the API.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *   parameters:
 *     - name: HardwareId
 *       in: path
 *       description: ID of the Hardware item.
 *       required: true
 */
router.post('/:HardwareId/barcodes', (req, res) => {
	Hardware.findByPk(req.params.HardwareId).then(hardware_item => {
		Barcode.create({
			format: req.body.format,
			code: req.body.barcode,
			HardwareId: hardware_item.id
		}).then(barcode_item => {
			res.status(200).json(barcode_item);
		}).catch(err => {
			res.status(500).json({error: err});
		});
	}).catch(err => {
		res.status(500).json({error: err});
	});
});

/**
 * @swagger
 * /hardware/{HardwareId}/barcodes/{BarcodeId}:
 *   delete:
 *     description: Delete a Barcode item of the Hardware item.
 *     tags:
 *       - Hardware
 *     responses:
 *       200:
 *         description: A object with the status information.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *       500:
 *         description: A unexpected error on the API.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *   parameters:
 *     - name: HardwareId
 *       in: path
 *       description: ID of the Hardware item.
 *       required: true
 *     - name: BarcodeId
 *       in: path
 *       description: ID of the Barcode item.
 *       required: true
 */
router.delete('/:HardwareId/barcodes/:BarcodeId', (req, res) => {
  Barcode.destroy({ where: { id: req.params.BarcodeId }}).then(() => {
    res.status(200).json({deleted: req.params.BarcodeId});
  }).catch(err => {
    res.status(500).json({error: err});
  });
});

/**
 * @swagger
 * /hardware/{HardwareId}/comments:
 *   get:
 *     description: Returns all the Comment items of the Hardware item with given ID.
 *     tags:
 *       - Hardware
 *     responses:
 *       200:
 *         description: A list of all Comment items with User information.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: "#/components/schemas/Comment"
 *       500:
 *         description: A unexpected error on the API.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *   parameters:
 *     - name: HardwareId
 *       in: path
 *       description: ID of the Hardware item.
 *       required: true
 */
 router.get('/:HardwareId/comments', (req, res) => {
  Hardware.findByPk(req.params.HardwareId, {include: {model: Comment}}).then(hardware_item => {
    hardware_item.getComments({include: {model: User}, attributes: {exclude: ['SoftwareId', 'HardwareId', 'UserId']}}).then(comment_items => {
      res.status(200).json(comment_items);
    }).catch(err => {
      res.status(500).json({error: err});
    });
  }).catch(err => {
    res.status(500).json({error: err});
  });
});

/**
 * @swagger
 * /hardware/{HardwareId}/comments:
 *   post:
 *     description: Create a new Comment item for the Hardware item.
 *     tags:
 *       - Hardware
 *     responses:
 *       200:
 *         description: The Comment item added to the Hardware item.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               items:
 *                 $ref: "#/components/schemas/Comment"
 *       500:
 *         description: A unexpected error on the API.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *   parameters:
 *     - name: HardwareId
 *       in: path
 *       description: ID of the Hardware item.
 *       required: true
 */
router.post('/:HardwareId/comments', (req, res) => {
  Hardware.findByPk(req.params.HardwareId).then(hardware_item => {
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
  });
});

/**
 * @swagger
 * /hardware/{HardwareId}/comments/{CommentId}:
 *   delete:
 *     description: Delete a Comment item of the Hardware item.
 *     tags:
 *       - Hardware
 *     responses:
 *       200:
 *         description: A object with the status information.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *       500:
 *         description: A unexpected error on the API.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *   parameters:
 *     - name: HardwareId
 *       in: path
 *       description: ID of the Hardware item.
 *       required: true
 *     - name: CommentId
 *       in: path
 *       description: ID of the Comment item.
 *       required: true
 */
router.delete('/:HardwareId/comments/:CommentId', (req, res) => {
	Hardware.findByPk(req.params.HardwareId).then(hardware_item => {
		Comment.findByPk(req.params.CommentId).then(comment_item => {
			Comment.destroy({ where: {	id: comment_item.id }}).then(() => {
				res.status(200).json({
					action: 'deleted',
					HardwareId: hardware_item.id,
					CommentId: comment_item.id
				});
			}).catch(err => {
				res.status(500).json({error: err});
			});
		}).catch(err => {
			res.status(500).json({error: err});
		});
	}).catch(err => {
		res.status(500).json({error: err});
	});
});

/**
 * @swagger
 * /hardware/{HardwareId}/documents:
 *   get:
 *     description: Returns all the Document items of the Hardware item with given ID.
 *     tags:
 *       - Hardware
 *     responses:
 *       200:
 *         description: A list of all Document items.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: "#/components/schemas/Document"
 *       500:
 *         description: A unexpected error on the API.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *   parameters:
 *     - name: HardwareId
 *       in: path
 *       description: ID of the Hardware item.
 *       required: true
 */
router.get('/:HardwareId/documents', (req, res) => {
  Hardware.findByPk(req.params.HardwareId, {include: {model: Document}}).then(hardware_item => {
    hardware_item.getDocuments().then(document_items => {
      res.status(200).json(document_items);
    }).catch(err => {
      res.status(500).json({error: err});
    });
  }).catch(err => {
    res.status(500).json({error: err});
  });
});

/**
 * @swagger
 * /hardware/{HardwareId}/documents:
 *   post:
 *     description: Create a new Document item for the Hardware item.
 *     tags:
 *       - Hardware
 *     responses:
 *       200:
 *         description: The Document item added to the Hardware item.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               items:
 *                 $ref: "#/components/schemas/Document"
 *       500:
 *         description: A unexpected error on the API.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *   parameters:
 *     - name: HardwareId
 *       in: path
 *       description: ID of the Hardware item.
 *       required: true
 */
router.post('/:HardwareId/documents', documentUpload.single('document'), (req, res) => {
  Hardware.findByPk(req.params.HardwareId).then(hardware_item => {
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

/**
 * @swagger
 * /hardware/{HardwareId}/documents/{DocumentId}:
 *   delete:
 *     description: Delete a Document item of the Hardware item.
 *     tags:
 *       - Hardware
 *     responses:
 *       200:
 *         description: A object with the status information.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *       500:
 *         description: A unexpected error on the API.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *   parameters:
 *     - name: HardwareId
 *       in: path
 *       description: ID of the Hardware item.
 *       required: true
 *     - name: DocumentId
 *       in: path
 *       description: ID of the Document item.
 *       required: true
 */
router.delete('/:HardwareId/documents/:DocumentId', (req, res) => {
	Hardware.findByPk(req.params.HardwareId).then(hardware_item => {
		Document.findByPk(req.params.DocumentId).then(document_item => {
			Document.destroy({ where: {	id: document_item.id, HardwareId: hardware_item.id }}).then(() => {
				fs.unlinkSync(path.resolve() + '/static/documents/' + document_item.static_file);
				res.status(200).json({deleted: document_item.id});
			}).catch(err => {
				res.status(500).json({error: err});
			});
		}).catch(err => {
			res.status(500).json({error: err});
		});
	}).catch(err => {
		res.status(500).json({error: err});
	});
});

/**
 * @swagger
 * /hardware/{HardwareId}/files:
 *   get:
 *     description: Returns all the File items of the Hardware item with given ID.
 *     tags:
 *       - Hardware
 *     responses:
 *       200:
 *         description: A list of all File items.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: "#/components/schemas/File"
 *       500:
 *         description: A unexpected error on the API.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *   parameters:
 *     - name: HardwareId
 *       in: path
 *       description: ID of the Hardware item.
 *       required: true
 */
router.get('/:HardwareId/files', (req, res) => {
	Hardware.findByPk(req.params.HardwareId, {include: {model: File}}).then(hardware_item => {
		hardware_item.getFiles().then(file_items => {
			res.status(200).json(file_items);
		}).catch(err => {
			res.status(500).json({error: err});
		});
	}).catch(err => {
		res.status(500).json({error: err});
	});
});

/**
 * @swagger
 * /hardware/{HardwareId}/files:
 *   post:
 *     description: Create a new File item for the Hardware item.
 *     tags:
 *       - Hardware
 *     responses:
 *       200:
 *         description: A object with the created File item.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               items:
 *                 $ref: "#/components/schemas/File"
 *       500:
 *         description: A unexpected error on the API.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *   parameters:
 *     - name: HardwareId
 *       in: path
 *       description: ID of the Hardware item.
 *       required: true
 */
router.post('/:HardwareId/files', fileUpload.single('file'), (req, res) => {
	Hardware.findByPk(req.params.HardwareId).then(hardware_item => {
		File.create({
			mime: req.file.mimetype,
			filename: req.file.originalname,
			static_filename: req.file.filename,
			HardwareId: hardware_item.id
		}).then(file_item => {
			res.status(200).json(file_item);
		}).catch(err => {
			res.status(500).json({error: err});
		});
	}).catch(err => {
		res.status(500).json({error: err});
	});
});

/**
 * @swagger
 * /hardware/{HardwareId}/files/{FileId}:
 *   delete:
 *     description: Delete a File item of the Hardware item.
 *     tags:
 *       - Hardware
 *     responses:
 *       200:
 *         description: A object with the status information.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *       500:
 *         description: A unexpected error on the API.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *   parameters:
 *     - name: HardwareId
 *       in: path
 *       description: ID of the Hardware item.
 *       required: true
 *     - name: FileId
 *       in: path
 *       description: ID of the File item.
 *       required: true
 */
router.delete('/:HardwareId/files/:FileId', (req, res) => {
	Hardware.findByPk(req.params.HardwareId).then(hardware_item => {
		File.findByPk(req.params.FileId).then((file_item) => {
			File.destroy({ where: { id: file_item.id, HardwareId: hardware_item.id }}).then(() => {
				fs.unlinkSync(path.resolve() + '/static/files/' + file_item.static_filename);
				res.status(200).json({deleted: file_item.id});
			}).catch(err => {
				res.status(500).json({error: err});
			});
		}).catch(err => {
			res.status(500).json({error: err});
		});
	}).catch(err => {
		res.status(500).json({error: err});
	});
});

/**
 * @swagger
 * /hardware/{HardwareId}/software:
 *   get:
 *     description: Returns all the Software items of the Hardware item with given ID.
 *     tags:
 *       - Hardware
 *     responses:
 *       200:
 *         description: A list of all Software items.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: "#/components/schemas/Software"
 *       500:
 *         description: A unexpected error on the API.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *   parameters:
 *     - name: HardwareId
 *       in: path
 *       description: ID of the Hardware item.
 *       required: true
 */
router.get('/:HardwareId/software', (req, res) => {
  Hardware.findByPk(req.params.HardwareId, {include: {model: Software}}).then(hardware_items => {
    hardware_items.getSoftware().then(software_items => {
      res.status(200).json(software_items);
    }).catch(err => {
      res.status(500).json({error: err});
    });
  }).catch(err => {
    res.status(500).json({error: err});
  });
});

/**
 * @swagger
 * /hardware/{HardwareId}/software/{SoftwareId}:
 *   delete:
 *     description: Remove the assignment between Hardware and Software.
 *     tags:
 *       - Hardware
 *     responses:
 *       200:
 *         description: A object with information of the reject.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *       500:
 *         description: A unexpected error on the API.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *   parameters:
 *     - name: HardwareId
 *       in: path
 *       description: ID of the Hardware item.
 *       required: true
 *     - name: SoftwareId
 *       in: path
 *       description: ID of the Software item.
 *       required: true
 */
router.delete('/:HardwareId/software/:SoftwareId', (req, res) => {
	Hardware.findByPk(req.params.HardwareId).then((hardware_item) => {
		hardware_item.removeSoftware(req.params.SoftwareId).then(() => {
			res.status(200).json({
				'action': 'reject',
				hardware_id: req.params.HardwareId,
				software_id: req.params.SoftwareId
			});
		}).catch(err => {
			res.status(500).json({error: err});
		});
	});
});

/**
 * @swagger
 * /hardware/{HardwareId}/software/{SoftwareId}:
 *   put:
 *     description: Add the assignment between Hardware and Software.
 *     tags:
 *       - Hardware
 *     responses:
 *       200:
 *         description: A object with information of the assignment.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *       500:
 *         description: A unexpected error on the API.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *   parameters:
 *     - name: HardwareId
 *       in: path
 *       description: ID of the Hardware item.
 *       required: true
 *     - name: SoftwareId
 *       in: path
 *       description: ID of the Software item.
 *       required: true
 */
router.put('/:HardwareId/software/:SoftwareId', (req, res) => {
	Hardware.findByPk(req.params.HardwareId).then((hardware_item) => {
		hardware_item.addSoftware(req.params.SoftwareId).then(() => {
			res.status(200).json({
				action: 'assign',
				hardware_id: req.params.HardwareId,
				software_id: req.params.SoftwareId
			});
		}).catch(err => {
			res.status(500).json({error: err});
		});
	});
});

/**
 * @swagger
 * /hardware/{HardwareId}:
 *   delete:
 *     description: Delete the Hardware item with given ID.
 *     tags:
 *       - Hardware
 *     responses:
 *       200:
 *         description: Message which Hardware item was deleted.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *       500:
 *         description: A unexpected error on the API.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *   parameters:
 *     - name: HardwareId
 *       in: path
 *       description: ID of the Hardware item.
 *       required: true
 */
router.delete('/:HardwareId', (req, res) => {
  Hardware.destroy({where: {id: req.params.HardwareId}}).then(() => {
    res.status(200).json({deleted: req.params.HardwareId});
  }).catch(err => {
    res.status(500).json({error: err});
  });
});

/**
 * @swagger
 * /hardware/{HardwareId}:
 *   put:
 *     description: Update the Hardware item with given ID.
 *     tags:
 *       - Hardware
 *     responses:
 *       200:
 *         description: Mesage which Hardware item was updated.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *       500:
 *         description: A unexpected error on the API.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *   parameters:
 *     - name: HardwareId
 *       in: path
 *       description: ID of the Hardware item.
 *       required: true
 */
router.put('/:HardwareId', (req, res) => {
	Hardware.update({
		name: req.body.name,
		producer: req.body.producer,
		serialNumber: req.body.serialNumber,
		type: req.body.type,
		purchaseDate: req.body.purchaseDate,
		warrantyDate: req.body.warrantyDate,
		state: req.body.state,
		offlineArchive: req.body.offlineArchive
  }, {
		where: { id: req.params.HardwareId }
  }).then(() => {
    res.status(200).json({updated: req.params.HardwareId});
  }).catch(err => {
    res.status(500).json({error: err});
  });
});

/**
 * @swagger
 * /hardware:
 *   post:
 *     description: Create a new Hardware item.
 *     tags:
 *       - Hardware
 *     responses:
 *       200:
 *         description: The successfully created Hardware item.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *       500:
 *         description: A unexpected error on the API.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 */
router.post('/', (req, res) => {
  Hardware.create({
		name: req.body.name,
		producer: req.body.producer,
		serial_number: req.body.serial_number,
		type: req.body.type,
		purchase_date: req.body.purchase_date,
		warranty_date: req.body.warranty_date,
		state: req.body.state,
		offline_archive: req.body.offline_archive
  }).then(hardware_item => {
    res.status(200).json(hardware_item);
	}).catch(err => {
		res.status(500).json({error: err});
	});
});

export default router;
