import express from 'express';
import Hardware from '../models/hardware.js';
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
};

const documentUpload = multer({storage: documentStorage, limits: {
  filesize: 1024 * 1024 * 5
}, fileFilter: documentFilter});

const fileUpload = multer({storage: fileStorage, limits: {
	filesize: 1024 * 1024 * 5
}, fileFilter: fileFilter});

// init the router
const router = express.Router();

router.get('/', (req, res) => {
  Hardware.findAll().then(hardware_items => {
    res.status(200).json(hardware_items);
  }).catch(err_message => {
    res.status(500).json({
			message: err_message
		});
  });
});

router.get('/:HardwareId', (req, res) => {
  Hardware.findByPk(req.params.HardwareId).then(hardware_item => {
    res.status(200).json(hardware_item);
  }).catch(err_message => {
    res.status(500).json({
			message: err_message
		});
  });
});

router.get('/:HardwareId/barcodes', (req, res) => {
	Hardware.findByPk(req.params.HardwareId, {include: {model: Barcode}}).then(hardware_item => {
		hardware_item.getBarcodes({attributes: {exclude: ['SoftwareId']}}).then(barcode_items => {
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

router.post('/:HardwareId/barcodes', (req, res) => {
	Hardware.findByPk(req.params.HardwareId).then(hardware_item => {
		Barcode.create({
			format: req.body.format,
			code: req.body.barcode,
			HardwareId: hardware_item.id
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

router.delete('/:HardwareId/barcodes/:BarcodeId', (req, res) => {
  Barcode.destroy({where: {id: req.params.BarcodeId}}).then(() => {
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

 router.get('/:HardwareId/comments', (req, res) => {
  Hardware.findByPk(req.params.HardwareId, {include: {model: Comment}}).then(hardware_item => {
    hardware_item.getComments({include: {model: User}, attributes: {exclude: ['SoftwareId', 'HardwareId', 'UserId']}}).then(comment_items => {
      res.status(200).json(comment_items);
    }).catch(err_message => {
			console.log('TEST', err_message);
      res.status(500).json({
				message: err_message
			});
    });
  }).catch(err_message => {
		console.log('TEST2', err_message);
    res.status(500).json({
			message: err_message
		});
  });
});

router.post('/:HardwareId/comments', (req, res) => {
  Hardware.findByPk(req.params.HardwareId).then(hardware_item => {
    Comment.create({
      content: req.body.content,
      HardwareId: hardware_item.id,
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
			message: 'Hardware not found!'
		});
  });
});

router.delete('/:HardwareId/comments/:CommentId', (req, res) => {
	Hardware.findByPk(req.params.HardwareId).then(hardware_item => {
		Comment.destroy({where: {id: req.params.CommentId, HardwareId: hardware_item.id}}).then(() => {
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
			message: 'Hardware not found!'
		});
	});
});

router.get('/:HardwareId/documents', (req, res) => {
  Hardware.findByPk(req.params.HardwareId, {include: {model: Document}}).then(hardware_item => {
    hardware_item.getDocuments().then(document_items => {
      res.status(200).json(document_items);
    }).catch(err_message => {
      res.status(500).json({
				message: err_message
			});
    });
  }).catch(() => {
    res.status(404).json({
			message: 'Hardware not found!'
		});
  });
});

router.post('/:HardwareId/documents', documentUpload.single('document'), (req, res) => {
  Hardware.findByPk(req.params.HardwareId).then(hardware_item => {
    Document.create({
      tags: req.body.tags,
      static_filename: req.file.filename,
			filename: req.file.originalname,
			mime: req.file.mimetype,
			size: req.file.size,
      HardwareId: hardware_item.id
    }).then(document_item => {
      res.status(200).json(document_item);
    }).catch(err_message => {
      res.status(500).json({
				message: err_message
			});
    });
  }).catch(() => {
    res.status(404).json({
			message: 'Hardware not found!'
		});
  });
});

router.delete('/:HardwareId/documents/:DocumentId', (req, res) => {
	Hardware.findByPk(req.params.HardwareId).then(hardware_item => {
		Document.findAll({where: {id: req.params.DocumentId, HardwareId: hardware_item.id}}).then(document_items => {
			const staticDocumentPath = path.resolve() + '/static/documents/'+ document_items[0].static_filename;
			Document.destroy({where: {id: req.params.DocumentId, HardwareId: hardware_item.id}}).then(document_item => {
				fs.unlinkSync(staticDocumentPath);
				res.status(200).json({
					action: 'deleted',
					item_id: document_item.id
				});
			}).catch(err_message => {
				res.status(500).json({
					error: err_message
				});
			});
		}).catch(err_message => {
			res.state(500).json({
				error: err_message
			});
		});
	}).catch(() => {
		res.status(404).json({
			message: 'Hardware not found!'
		});
	});
});

router.get('/:HardwareId/files', (req, res) => {
	Hardware.findByPk(req.params.HardwareId, {include: {model: File}}).then(hardware_item => {
		hardware_item.getFiles().then(file_items => {
			res.status(200).json(file_items);
		}).catch(err_message => {
			res.status(500).json({
				message: err_message
			});
		});
	}).catch(() => {
		res.status(404).json({
			message: 'Hardware not found!'
		});
	});
});

router.post('/:HardwareId/files', fileUpload.single('file'), (req, res) => {
	Hardware.findByPk(req.params.HardwareId).then(hardware_item => {
		File.create({
			description: req.body.description,
			filename: req.file.originalname,
			mime: req.file.mimetype,
			static_filename: req.file.filename,
			size: req.file.size,
			HardwareId: hardware_item.id
		}).then(file_item => {
			res.status(200).json(file_item);
		}).catch(err_message => {
			res.status(500).json({
				message: err_message
			});
		});
	}).catch(() => {
		res.status(404).json({
			message: 'Hardware not found!'
		});
	});
});

router.delete('/:HardwareId/files/:FileId', (req, res) => {
	Hardware.findByPk(req.params.HardwareId).then(hardware_item => {
		File.findAll({where: {id: req.params.FileId, HardwareId: hardware_item.id}}).then(file_item => {
			const staticFilePath = path.resolve() + '/static/files/'+ file_item[0].static_filename;
			File.destroy({where: {id: req.params.FileId, HardwareId: hardware_item.id}}).then(file_item => {
				fs.unlinkSync(staticFilePath);
				res.status(200).json({
					action: 'deleted',
					item_id: file_item.id
				});
			}).catch(err_message => {
				res.status(500).json({
					error: err_message
				});
			});
		}).catch(err_message => {
			res.status(500).json({
				error: err_message
			});
		});
	}).catch(() => {
		res.status(404).json({
			message: 'Hardware not found!'
		});
	});
});

router.get('/:HardwareId/software', (req, res) => {
  Hardware.findByPk(req.params.HardwareId, {include: {model: Software}}).then(hardware_item => {
    hardware_item.getSoftware().then(software_items => {
      res.status(200).json(software_items);
    }).catch(err_message => {
      res.status(500).json({
				message: err_message
			});
    });
  }).catch(() => {
    res.status(404).json({
			message: 'Hardware not found!'
		});
  });
});

router.delete('/:HardwareId/software/:SoftwareId', (req, res) => {
	Hardware.findByPk(req.params.HardwareId).then(hardware_item => {
		hardware_item.removeSoftware(req.params.SoftwareId).then(() => {
			res.status(200).json({
				action: 'rejected',
				item_id: req.params.SoftwareId
			});
		}).catch(err_message => {
			res.status(500).json({
				message: err_message
			});
		});
	}).catch(() => {
		res.status(404).json({
			message: 'Hardware not found!'
		});
	});
});

router.put('/:HardwareId/software/:SoftwareId', (req, res) => {
	Hardware.findByPk(req.params.HardwareId).then(hardware_item => {
		hardware_item.addSoftware(req.params.SoftwareId).then(() => {
			res.status(200).json({
				action: 'assigned',
				item_id: req.params.SoftwareId
			});
		}).catch(err_message => {
			res.status(500).json({
				message: err_message
			});
		});
	}).catch(() => {
		res.status(404).json({
			message: 'Hardware not found!'
		});
	});
});

router.delete('/:HardwareId', (req, res) => {
  Hardware.destroy({where: {id: req.params.HardwareId}}).then(hardware_item => {
    res.status(200).json({
			action: 'deleted',
			item_id: hardware_item.id
		});
  }).catch(err_message => {
    res.status(500).json({
			message: err_message
		});
  });
});

router.put('/:HardwareId', (req, res) => {
	Hardware.update({
		description: req.body.description,
		serialnumber: req.body.serialnumber,
		deviceType: req.body.deviceType,
		purchasedAt: req.body.purchasedAt,
		warrantyAt: req.body.warrantyAt,
		state: req.body.state,
		offlineArchive: req.body.offlineArchive
  }, {
		where: {id: req.params.HardwareId}
  }).then(hardware_item => {
    res.status(200).json(hardware_item);
  }).catch(err_message => {
    res.status(500).json({
			message: err_message
		});
  });
});

router.post('/', (req, res) => {
  Hardware.create({
		description: req.body.description,
		serialnumber: req.body.serialnumber,
		deviceType: req.body.deviceType,
		purchasedAt: req.body.purchasedAt,
		warrantyAt: req.body.warrantyAt,
		state: req.body.state,
		offlineArchive: req.body.offlineArchive
  }).then(hardware_item => {
    res.status(200).json(hardware_item);
	}).catch(err_message => {
		res.status(500).json({
			error: err_message
		});
	});
});

export default router;
