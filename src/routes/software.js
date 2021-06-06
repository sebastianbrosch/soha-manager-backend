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
 *     description: Returns all Software items.
 *     tags:
 *       - Software
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
 *               $ref: "#/components/schemas/Error"
 */
router.get('/', (req, res) => {
	Software.findAll().then(software_items => {
		res.status(200).json(software_items);
  }).catch(err_message => {
    res.status(500).json({
			message: err_message
		});
  });
});

/**
 * @swagger
 * /software/{SoftwareId}:
 *   get:
 *     description: Returns the Software item with given ID.
 *     tags:
 *       - Software
 *     responses:
 *       200:
 *         description: The found Software item.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/Software"
 *       500:
 *         description: A unexpected error on the API.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/Error"
 *   parameters:
 *     - name: SoftwareId
 *       in: path
 *       description: ID of the Software item.
 *       required: true
 */
router.get('/:SoftwareId', (req, res) => {
  Software.findByPk(req.params.SoftwareId).then(software_item => {
    res.status(200).json(software_item);
  }).catch(err_message => {
    res.status(500).json({
			message: err_message
		});
  });
});

/**
 * @swagger
 * /software/{SoftwareId}/barcodes:
 *   get:
 *     description: Returns all the Barcode items of the Software item with given ID.
 *     tags:
 *       - Software
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
 *               $ref: "#/components/schemas/Error"
 *   parameters:
 *     - name: SoftwareId
 *       in: path
 *       description: ID of the Software item.
 *       required: true
 */
router.get('/:SoftwareId/barcodes', (req, res) => {
	Software.findByPk(req.params.SoftwareId, {include: {model: Barcode}}).then(software_item => {
		software_item.getBarcodes({attributes: {exclude: ['HardwareId']}}).then(barcode_items => {
			res.status(200).json(barcode_items);
		}).catch(err_message => {
			res.status(500).json({
				message: err_message
			});
		});
	}).catch(err_message => {
		res.status(500).json({
			message: err_message
		});
	});
});

/**
 * @swagger
 * /software/{SoftwareId}/barcodes:
 *   post:
 *     description: Create a new Barcode item for the Software item.
 *     tags:
 *       - Software
 *     responses:
 *       200:
 *         description: The Barcode item added to the Software item.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/Barcode"
 *       500:
 *         description: A unexpected error on the API.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/Error"
 *   parameters:
 *     - name: SoftwareId
 *       in: path
 *       description: ID of the Software item.
 *       required: true
 */
router.post('/:SoftwareId/barcodes', (req, res) => {
	Software.findByPk(req.params.SoftwareId).then(software_item => {
		Barcode.create({
			format: req.body.format,
			code: req.body.barcode,
			SoftwareId: software_item.id
		}).then(barcode_item => {
			res.status(200).json(barcode_item);
		}).catch(err_message => {
			res.status(500).json({
				message: err_message
			});
		});
	}).catch(err_message => {
		res.status(500).json({
			message: err_message
		});
	});
});

/**
 * @swagger
 * /software/{SoftwareId}/barcodes/{BarcodeId}:
 *   delete:
 *     description: Delete a Barcode item of the Software item.
 *     tags:
 *       - Software
 *     responses:
 *       200:
 *         description: A object with the status information.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/Info"
 *       500:
 *         description: A unexpected error on the API.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/Error"
 *   parameters:
 *     - name: SoftwareId
 *       in: path
 *       description: ID of the Software item.
 *       required: true
 *     - name: BarcodeId
 *       in: path
 *       description: ID of the Barcode item.
 *       required: true
 */
router.delete('/:SoftwareId/barcodes/:BarcodeId', (req, res) => {
  Barcode.destroy({where: {id: req.params.BarcodeId}}).then((barcode_item) => {
		console.log(barcode_item);
    res.status(200).json({
			action: 'deleted',
			item_id: req.params.BarcodeId
		});
  }).catch(err_message => {
    res.status(500).json({
			message: err_message
		});
  });
});

/**
 * @swagger
 * /software/{SoftwareId}/comments:
 *   get:
 *     description: Returns all the Comment items of the Software item with given ID.
 *     tags:
 *       - Software
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
 *               $ref: "#/components/schemas/Error"
 *   parameters:
 *     - name: SoftwareId
 *       in: path
 *       description: ID of the Software item.
 *       required: true
 */
router.get('/:SoftwareId/comments', (req, res) => {
  Software.findByPk(req.params.SoftwareId, {include: {model: Comment}}).then(software_item => {
    software_item.getComments({include: {model: User}, attributes: {exclude: ['SoftwareId', 'HardwareId', 'UserId']}}).then(comment_items => {
      res.status(200).json(comment_items);
    }).catch(err_message => {
      res.status(500).json({
				message: err_message
			});
    });
  }).catch(err_message => {
    res.status(500).json({
			message: err_message
		});
  });
});

/**
 * @swagger
 * /software/{SoftwareId}/comments:
 *   post:
 *     description: Create a new Comment item for the Software item.
 *     tags:
 *       - Software
 *     responses:
 *       200:
 *         description: The Comment item added to the Software item.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/Comment"
 *       404:
 *         description: Error if Software item was not found.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/Error"
 *       500:
 *         description: A unexpected error on the API.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/Error"
 *   parameters:
 *     - name: SoftwareId
 *       in: path
 *       description: ID of the Software item.
 *       required: true
 */
router.post('/:SoftwareId/comments', (req, res) => {
  Software.findByPk(req.params.SoftwareId).then(software_item => {
    Comment.create({
      content: req.body.content,
      SoftwareId: software_item.id,
			UserId: req.body.userId,
    }).then(comment_item => {
      res.status(200).json(comment_item);
    }).catch(err_message => {
      res.status(500).json({
				message: err_message
			});
    });
  }).catch(() => {
    res.status(404).json({
			message: 'Software not found!'
		});
  });
});

/**
 * @swagger
 * /software/{SoftwareId}/comments/{CommentId}:
 *   delete:
 *     description: Delete a Comment item of the Hardware item.
 *     tags:
 *       - Software
 *     responses:
 *       200:
 *         description: A object with the status information.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/Info"
 *       404:
 *         description: Error if Software item was not found.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/Error"
 *       500:
 *         description: A unexpected error on the API.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/Error"
 *   parameters:
 *     - name: SoftwareId
 *       in: path
 *       description: ID of the Software item.
 *       required: true
 *     - name: CommentId
 *       in: path
 *       description: ID of the Comment item.
 *       required: true
 */
router.delete('/:SoftwareId/comments/:CommentId', (req, res) => {
	Software.findByPk(req.params.SoftwareId).then(software_item => {
		Comment.destroy({where: {id: req.params.CommentId, SoftwareId: software_item.id}}).then(() => {
			res.status(200).json({
				action: 'deleted',
				item_id: req.params.CommentId
			});
		}).catch(err_message => {
			res.status(500).json({
				message: err_message
			});
		});
	}).catch(() => {
		res.status(404).json({
			message: 'Software not found!'
		});
	});
});

/**
 * @swagger
 * /software/{SoftwareId}/documents:
 *   get:
 *     description: Returns all the Document items of the Software item with given ID.
 *     tags:
 *       - Software
 *     responses:
 *       200:
 *         description: A list of all Document items.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: "#/components/schemas/Document"
 *       404:
 *         description: Error if Software item was not found.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/Error"
 *       500:
 *         description: A unexpected error on the API.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/Error"
 *   parameters:
 *     - name: SoftwareId
 *       in: path
 *       description: ID of the Software item.
 *       required: true
 */
router.get('/:SoftwareId/documents', (req, res) => {
  Software.findByPk(req.params.SoftwareId, {include: {model: Document}}).then(software_item => {
    software_item.getDocuments().then(document_items => {
      res.status(200).json(document_items);
    }).catch(err_message => {
      res.status(500).json({
				message: err_message
			});
    });
  }).catch(() => {
    res.status(404).json({
			message: 'Software not found!'
		});
  });
});

/**
 * @swagger
 * /software/{SoftwareId}/documents:
 *   post:
 *     description: Create a new Document item for the Software item with given ID.
 *     tags:
 *       - Software
 *     responses:
 *       200:
 *         description: The Document item added to the Software item.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/Document"
 *       404:
 *         description: Error if Software item was not found.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/Error"
 *       500:
 *         description: A unexpected error on the API.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/Error"
 *   parameters:
 *     - name: SoftwareId
 *       in: path
 *       description: ID of the Software item.
 *       required: true
 */
router.post('/:SoftwareId/documents', documentUpload.single('document'), (req, res) => {
  Software.findByPk(req.params.SoftwareId).then(software_item => {
    Document.create({
      description: req.body.description,
      documenttype: req.body.documenttype,
			static_file: req.file.filename,
			filename: req.file.originalname,
			mime: req.file.mimetype,
      SoftwareId: software_item.id
    }).then(document_item => {
      res.status(200).json(document_item);
    }).catch(err_message => {
      res.status(500).json({
				message: err_message
			});
    });
  }).catch(() => {
    res.status(404).json({
			message: 'Software not found!'
		});
  });
});

/**
 * @swagger
 * /software&{SoftwareId}/documents/{DocumentId}:
 *   delete:
 *     description: Delete a Document item of the Software item.
 *     tags:
 *       - Software
 *     responses:
 *       200:
 *         description: A object with the status information.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/Document"
 *       404:
 *         description: Error if Software item was not found.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/Error"
 *       500:
 *         description: A unexpected error on the API.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/Error"
 *   parameters:
 *     - name: SoftwareId
 *       in: path
 *       description: ID of the Software item.
 *       required: true
 *     - name: DocumentId
 *       in: path
 *       description: ID of the Document item.
 *       required: true
 */
router.delete('/:SoftwareId/documents/:DocumentId', (req, res) => {
	Software.findByPk(req.params.SoftwareId).then(software_item => {
		Document.destroy({where: {id: req.params.DocumentId, SoftwareId: software_item.id}}).then(document_item => {
			fs.unlinkSync(path.resolve() + '/static/documents/' + document_item.static_file);
			res.status(200).json({
				action: 'deleted',
				item_id: document_item.id
			});
		}).catch(err_message => {
			res.status(500).json({
				message: err_message
			});
		});
	}).catch(() => {
		res.status(404).json({
			message: 'Software not found!'
		});
	});
});

/**
 * @swagger
 * /software/{SoftwareId}/files:
 *   get:
 *     description: Returns all the File items of the Software item with given ID.
 *     tags:
 *       - Software
 *     responses:
 *       200:
 *         description: A list of all File items.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: "#/components/schemas/File"
 *       404:
 *         description: Error if Software item was not found.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/Error"
 *       500:
 *         description: A unexpected error on the API.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/Error"
 *   parameters:
 *     - name: SoftwareId
 *       in: path
 *       description: ID of the Software item.
 *       required: true
 */
router.get('/:SoftwareId/files', (req, res) => {
	Software.findByPk(req.params.SoftwareId, {include: {model: File}}).then(software_item => {
		software_item.getFiles().then(file_items => {
			res.status(200).json(file_items);
		}).catch(err_message => {
			res.status(500).json({
				message: err_message
			});
		});
	}).catch(() => {
		res.status(404).json({
			message: 'Software not found!'
		});
	});
});

/**
 * @swagger
 * /software/{SoftwareId}/files:
 *   post:
 *     description: Create a new File item for the Software item.
 *     tags:
 *       - Software
 *     responses:
 *       200:
 *         description: A object with the created File item.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/File"
 *       404:
 *         description: Error if Software item was not found.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/Error"
 *       500:
 *         description: A unexpected error on the API.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/Error"
 *   parameters:
 *     - name: SoftwareId
 *       in: path
 *       description: ID of the Software item.
 *       required: true
 */
router.post('/:SoftwareId/files', fileUpload.single('file'), (req, res) => {
	Software.findByPk(req.params.SoftwareId).then(software_item => {
		File.create({
			description: req.body.description,
			filename: req.file.originalname,
			mime: req.file.mimetype,
			static_filename: req.file.filename,
			SoftwareId: software_item.id
		}).then(file_item => {
			res.status(200).json(file_item);
		}).catch(err_message => {
			res.status(500).json({
				message: err_message
			});
		});
	}).catch(() => {
		res.status(404).json({
			message: 'Software not found!'
		});
	});
});

/**
 * @swagger
 * /software/{SoftwareId}/files/{FileId}:
 *   delete:
 *     description: Delete a File item of the Software item.
 *     tags:
 *       - Software
 *     responses:
 *       200:
 *         description: A object with the status information.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/Info"
 *       404:
 *         description: Error if Software item was not found.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/Error"
 *       500:
 *         description: A unexpected error on the API.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/Error"
 *   parameters:
 *     - name: SoftwareId
 *       in: path
 *       description: ID of the Software item.
 *       required: true
 *     - name: FileId
 *       in: path
 *       description: ID of the File item.
 *       required: true
 */
router.delete('/:SoftwareId/files/:FileId', (req, res) => {
	Software.findByPk(req.params.SoftwareId).then(software_item => {
		File.destroy({where: {id: req.params.FileId, SoftwareId: software_item.id}}).then(file_item => {
			fs.unlinkSync(path.resolve() + '/static/files/' + file_item.static_filename);
			res.status(200).json({
				action: 'deleted',
				item_id: file_item.id
			});
		}).catch(err_message => {
			res.status(500).json({
				message: err_message
			});
		});
	}).catch(() => {
		res.status(404).json({
			message: 'Software not found!'
		});
	});
});

/**
 * @swagger
 * /software/{SoftwareId}/hardware:
 *   get:
 *     description: Returns all the Hardware items of the Software item with given ID.
 *     tags:
 *       - Software
 *     responses:
 *       200:
 *         description: A list of all Hardware items.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: "#/components/schemas/Hardware"
 *       404:
 *         description: Error if Software item was not found.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/Error"
 *       500:
 *         description: A unexpected error on the API.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/Error"
 *   parameters:
 *     - name: SoftwareId
 *       in: path
 *       description: ID of the Software item.
 *       required: true
 */
router.get('/:SoftwareId/hardware', (req, res) => {
  Software.findByPk(req.params.SoftwareId, {include: {model: Hardware}}).then(software_item => {
		software_item.getHardware().then(hardware_items => {
			res.status(200).json(hardware_items);
		}).catch(err_message => {
			res.status(500).json({
				message: err_message
			});
		});
	}).catch(() => {
		res.status(404).json({
			message: 'Software not found!'
		});
	});
});

/**
 * @swagger
 * /software/{SoftwareId}/hardware/{HardwareId}:
 *   delete:
 *     description: Remove the assignment between Software and Hardware.
 *     tags:
 *       - Software
 *     responses:
 *       200:
 *         description: A object with the status information.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/Info"
 *       404:
 *         description: Error if Software item was not found.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/Error"
 *       500:
 *         description: A unexpected error on the API.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/Error"
 *   parameters:
 *     - name: SoftwareId
 *       in: path
 *       description: ID of the Software item.
 *       required: true
 *     - name: HardwareId
 *       in: path
 *       description: ID of the Hardware item.
 *       required: true
 */
router.delete('/:SoftwareId/hardware/:HardwareId', (req, res) => {
	Software.findByPk(req.params.SoftwareId).then(software_item => {
		software_item.removeHardware(req.params.HardwareId).then(() => {
			res.status(200).json({
				action: 'rejected',
				item_id: req.params.HardwareId
			});
		}).catch(err_message => {
			res.status(500).json({
				message: err_message
			});
		});
	}).catch(() => {
		res.status(404).json({
			message: 'Software not found!'
		});
	});
});

/**
 * @swagger
 * /software/{SoftwareId}/hardware/{HardwareId}:
 *   put:
 *     description: Add the assignment between Software and Hardware.
 *     tags:
 *       - Software
 *     responses:
 *       200:
 *         description: A object with information of the assignment.
 *         content:
 *           application/json:
 *             schema:
 *                $ref: "#/components/schemas/Info"
 *       404:
 *         description: Error if Software item was not found.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/Error"
 *       500:
 *         description: A unexpected error on the API.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/Error"
 *   parameters:
 *     - name: SoftwareId
 *       in: path
 *       description: ID of the Software item.
 *       required: true
 *     - name: HardwareId
 *       in: path
 *       description: ID of the Hardware item.
 *       required: true
 */
router.put('/:SoftwareId/hardware/:HardwareId', (req, res) => {
	Software.findByPk(req.params.SoftwareId).then(software_item => {
		software_item.addHardware(req.params.HardwareId).then(() => {
			res.status(200).json({
				action: 'assigned',
				item_id: req.params.HardwareId
			});
		}).catch(err_message => {
			res.status(500).json({
				message: err_message
			});
		});
	}).catch(() => {
		res.status(404).json({
			message: 'Software not found!'
		});
	});
});

/**
 * @swagger
 * /software/{SoftwareId}:
 *   delete:
 *     description: Delete the Software item with given ID.
 *     tags:
 *       - Software
 *     responses:
 *       200:
 *         description: A object with information of the deletion.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/Info"
 *       500:
 *         description: A unexpected error on the API.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/Error"
 *   parameters:
 *     - name: SoftwareId
 *       in: path
 *       description: ID of the Software item.
 *       required: true
 */
router.delete('/:SoftwareId', (req, res) => {
  Software.destroy({where: {id: req.params.SoftwareId}}).then(software_item => {
    res.status(200).json({
			action: 'deleted',
			item_id: software_item.id
		});
  }).catch(err_message => {
    res.status(500).json({
			message: err_message
		});
  });
});

/**
 * @swagger
 * /software/{SoftwareId}:
 *   put:
 *     description: Update the Software item with given ID.
 *     tags:
 *       - Software
 *     responses:
 *       200:
 *         description: A object with the updated Software item.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/Software"
 *       500:
 *         description: A unexpected error on the API.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/Error"
 *   parameters:
 *     - name: SoftwareId
 *       in: path
 *       description: ID of the Software item.
 *       required: true
 */
router.put('/:SoftwareId', (req, res) => {
  Software.update({
		name: req.body.name,
		producer: req.body.producer,
		licenseId: req.body.licenseId,
		licenseKey: req.body.licenseKey,
		numberLicense: req.body.numberLicense,
		state: req.body.state,
		expiryDate: req.body.expiryDate,
		offlineArchive: req.body.offlineArchive
  }, {
    where: {id: req.params.SoftwareId}
  }).then(software_item => {
    res.status(200).json(software_item);
  }).catch(err_message => {
    res.status(500).json({
			message: err_message
		});
  });
});

/**
 * @swagger
 * /software
 *   post:
 *     description: Create a new Software item.
 *     tags:
 *       - Software
 *     responses:
 *       200:
 *         description: The successfully created Software item.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/Software"
 *       500:
 *         description: A unexpected error on the API.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/Error"
 */
router.post('/', (req, res) => {
  Software.create({
		name: req.body.name,
		producer: req.body.producer,
		licenseId: req.body.licenseId,
		licenseKey: req.body.licenseKey,
		numberLicense: req.body.numberLicense,
		state: req.body.state,
		expiryDate: req.body.expiryDate,
		offlineArchive: req.body.offlineArchive
  }).then(software_item => {
    res.status(200).json(software_item);
  }).catch(err_message => {
    res.status(500).json({
			message: err_message
		});
  });
});

export default router;
