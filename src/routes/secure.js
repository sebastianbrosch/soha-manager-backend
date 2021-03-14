import express from 'express';
import User from '../models/user.js';

const router = express.Router();

router.get('/:id', (req, res) => {
    User.findByPk(req.params.id).then(user_item => {
        res.status(200).json(user_item);
    }).catch(err => {
        res.status(500).json({error: err});
    });
});

export default router;