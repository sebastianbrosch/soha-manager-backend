import express from 'express';
import Software from '../models/software.js';
import Comment from '../models/comment.js';
import Document from '../models/document.js';
import multer from 'multer';
import Hardware from '../models/hardware.js';
import User from '../models/user.js';
import Barcode from '../models/barcode.js';
import fs, { stat } from 'fs';
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


router.get('/', (req, res) => {
	Software.findAll().then(software_items => {
		res.status(200).json(software_items);
  }).catch(err_message => {
    res.status(500).json({
			error: err_message
		});
  });
});

router.post('/', (req, res) => {
  Software.create({
		name: req.body.name,
		licenseKey: req.body.licenseKey,
		licensePassword: req.body.licensePassword,
		licenseAmount: req.body.licenseAmount,
		state: req.body.state,
		offlineArchive: req.body.offlineArchive,
		expiresAt: req.body.expiresAt
  }).then(software_item => {
    res.status(200).json(software_item);
  }).catch(err_message => {
    res.status(500).json({
			error: err_message
		});
  });
});

router.put('/:SoftwareId', (req, res) => {
  Software.update({
		name: req.body.name,
		licenseKey: req.body.licenseKey,
		licensePassword: req.body.licensePassword,
		licenseAmount: req.body.licenseAmount,
		state: req.body.state,
		offlineArchive: req.body.offlineArchive,
		expiresAt: req.body.expiresAt
  }, {
    where: {id: req.params.SoftwareId}
  }).then(() => {
    res.status(200).json({
			success: 'updated',
			id: req.params.SoftwareId
		});
  }).catch(err_message => {
    res.status(500).json({
			error: err_message
		});
  });
});

router.delete('/:SoftwareId', (req, res) => {
  Software.destroy({where: {id: req.params.SoftwareId}}).then(software_item => {
    res.status(200).json({
			success: 'deleted',
			id: req.params.SoftwareId
		});
  }).catch(err_message => {
    res.status(500).json({
			error: err_message
		});
  });
});

router.get('/:SoftwareId', (req, res) => {
  Software.findByPk(req.params.SoftwareId).then(software_item => {
    res.status(200).json(software_item);
  }).catch(err_message => {
    res.status(500).json({
			message: err_message
		});
  });
});

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

router.delete('/:SoftwareId/barcodes/:BarcodeId', (req, res) => {
  Barcode.destroy({where: {id: req.params.BarcodeId}}).then((barcode_item) => {
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

router.put('/:id/users', async (req, res) => {
	if (req.body.users) {
		await Software.findByPk(req.params.id).then(async (item) => {
			item.addUsers(req.body.users).then(() => {
				res.status(200).json({
					'added': req.params.users
				});
			});
		}).catch(() => {
			res.status(404).json({
				'error': 'Software not found!'
			});
		});
	}
});

router.delete('/:id/users', async (req, res) => {
	if (req.body.users) {
		await Software.findByPk(req.params.id).then(async (item) => {
			item.removeUsers(req.body.users).then(() => {
				res.status(200).json({
					'removed': req.params.users
				});
			});
		}).catch(() => {
			res.status(404).json({
				'error': 'Software not found!'
			});
		});
	}
})

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

router.post('/:SoftwareId/documents', documentUpload.single('document'), (req, res) => {
  Software.findByPk(req.params.SoftwareId).then(software_item => {
    Document.create({
      tags: req.body.tags,
			static_filename: req.file.filename,
			filename: req.file.originalname,
			mime: req.file.mimetype,
			size: req.file.size,
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

router.delete('/:SoftwareId/documents/:DocumentId', (req, res) => {
	Software.findByPk(req.params.SoftwareId).then(software_item => {
		Document.findAll({where: {id: req.params.DocumentId, SoftwareId: software_item.id}}).then(document_items => {
			const staticDocumentPath = path.resolve() + '/static/documents/'+ document_items[0].static_filename;
			Document.destroy({where: {id: req.params.DocumentId, SoftwareId: software_item.id}}).then(document_item => {
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
			message: 'Software not found!'
		});
	});
});

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

router.post('/:SoftwareId/files', fileUpload.single('file'), (req, res) => {
	Software.findByPk(req.params.SoftwareId).then(software_item => {
		File.create({
			description: req.body.description,
			filename: req.file.originalname,
			mime: req.file.mimetype,
			static_filename: req.file.filename,
			size: req.file.size,
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

router.delete('/:SoftwareId/files/:FileId', (req, res) => {
	Software.findByPk(req.params.SoftwareId).then(software_item => {
		File.findAll({where: {id: req.params.FileId, SoftwareId: software_item.id}}).then(file_item => {
			const staticFilePath = path.resolve() + '/static/files/'+ file_item[0].static_filename;
			File.destroy({where: {id: req.params.FileId, SoftwareId: software_item.id}}).then(file_item => {
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
			message: 'Software not found!'
		});
	});
});

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

export default router;
