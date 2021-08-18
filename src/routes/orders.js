import express from 'express';
import Order from '../models/order.js';

// init the router
const router = express.Router();

router.get('/', (req, res) => {
	Order.findAll().then(order_items => {
		res.status(200).json(order_items);
  }).catch(err_message => {
    res.status(500).json({
			message: err_message
		});
  });
});

router.post('/', (req, res) => {
  Order.create({
		product_count: req.body.productCount,
		product_name: req.body.productName,
		product_url: req.body.productUrl,
		done_at: req.body.doneAt
  }).then(order_item => {
    res.status(200).json(order_item);
  }).catch(err_message => {
    res.status(500).json({
			message: err_message
		});
  });
});

router.put('/:id', (req, res) => {
	Order.update({
		product_count: req.body.productCount,
		product_name: req.body.productName,
		product_url: req.body.productUrl,
		done_at: req.body.doneAt
	}, {
    where: {id: req.params.id}
  }).then(order_item => {
		res.status(200).json(order_item);
	}).catch(err_message => {
		res.status(500).json({
			message: err_message
		});
	});
});

router.delete('/:id', (req, res) => {
	Order.destroy({where: {id: req.params.id}}).then((order_item) => {
    res.status(200).json({
			action: 'deleted',
			item_id: req.params.id
		});
  }).catch(err_message => {
    res.status(500).json({
			message: err_message
		});
  });
});

export default router;
