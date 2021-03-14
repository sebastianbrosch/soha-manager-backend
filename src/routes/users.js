import express, { response } from 'express';
import User from '../models/user.js';
import Hardware from '../models/hardware.js';
import Software from '../models/software.js';

const router = express.Router();

/**
 * @openapi
 * /users/:
 *   get:
 *     description: Get all users.
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: Returns all users.
 */
router.get('/', (req, res) => {
    User.findAll().then(users => {
        res.status(200).json(users);
    }).catch(err => {
        res.status(500).json({error: err});
    });
});

router.get('/:uid/hardware', (req, res) => {
	User.findByPk(req.params.uid, {include: {model: Hardware}}).then(userItem => {
		userItem.getHardware().then((hardwareItems) => {
			res.status(200).json(hardwareItems);
		});
	}).catch(err => {
		res.status(500).json({error: err});
	});
});

router.get('/:uid/software', (req, res) => {
	User.findByPk(req.params.uid, {include: {model: Software}}).then(userItem => {
		userItem.getSoftware().then((softwareItems) => {
			res.status(200).json(softwareItems);
		});
	}).catch(err => {
		res.status(500).json({error: err});
	});
});

/**
 * @openapi
 * /users/:
 *   post:
 *     description: Create a new user.
 *     produces:
 *       - application/json
 *     consumes:
 *       - application/json
 *     parameters:
 *      - in: body
 *        name: user
 *        description: The user to create.
 *        schema:
 *          type: object
 *          required:
 *            - email
 *            - password
 *          properties:
 *            email:
 *              type: string
 *            password:
 *              type: string
 *            firstname:
 *              type: string
 *            lastname:
 *              type: string
 *     responses:
 *       200:
 *         description: Returns the created user.
 */
router.post('/', (req, res) => {
    User.create({
        email: req.body.email,
        password: req.body.password,
        firstname: req.body.firstname,
        lastname: req.body.lastname
    }).then(user_item => {
        res.status(200).json(user_item);
    }).catch(err => {
        res.status(500).json({error: err});
    });
});

router.delete('/:uid', (req, res) => {
    User.destroy({
        where: {
            id: req.params.uid
        }
    }).then(() => {
        res.status(200).json({deleted: req.params.id});
    }).catch(err => {
        res.status(500).json({error: err});
    });
});

// update the hardware item
router.put('/:uid', async (req, res) => {

	if (req.body.hardwareAdd) {
	await	User.findByPk(req.params.uid).then(async item => {
			 await item.addHardware(req.body.hardwareAdd);
		})
	}

	if (req.body.hardwareRemove) {
	await	User.findByPk(req.params.uid).then(async item => {
		 await item.removeHardware(req.body.hardwareRemove);
		})
	}

	if (req.body.softwareAdd) {
	 	await User.findByPk(req.params.uid).then(async (item) => {
			await item.addSoftware(req.body.softwareAdd);
		});
	}

	if (req.body.softwareRemove) {
		await User.findByPk(req.params.uid).then(async (item) => {
			await item.removeSoftware(req.body.softwareRemove);
		});
	}

  await User.update({
    email: req.body.email,
		password: req.body.password,
		firstname: req.body.firstname,
		lastname: req.body.lastname
  }, {
    where: { id: req.params.uid }
  }).then(() => {
		console.log('user updated');
    res.status(200).json({updated: req.params.uid});
  }).catch(err => {
    res.status(500).json({error: err});
  });
});


export default router;
