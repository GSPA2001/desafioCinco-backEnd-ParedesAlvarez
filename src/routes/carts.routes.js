import { Router } from 'express';
import productModel from '../dao/models/products.model.js';
import cartModel from '../dao/models/carts.model.js';

const router = Router()

router.post('/', async (req, res) => {

    try {
        const cart = req.body
        const addCart = await cartModel.create(cart)
        res.json({ status: 'success', payload: addCart })
    } catch (err) {
        return res.status(500).json({ status: 'error', error: err.message })
    }
})

router.post('/:cid/product/:pid', async (req, res) => {
    try {
        const pid = req.params.pid
        const product = await productModel.findById(pid)
        if (!product) {
            return res.status(404).json({ status: 'error', error: 'Invalid product' })
        }

        const cid = req.params.cid
        const cart = await cartModel.findById(cid)
        if (!cart) {
            return res.status(404).json({ status: 'error', error: 'Invalid cart' })
        }

        const existingProductIndex = cart.products.findIndex(item => item.product.toString() === pid)
        if (existingProductIndex !== -1) {
            cart.products[existingProductIndex].quantity += 1
        } else {
            const newProduct = {
                product: pid,
                quantity: 1,
            }
            cart.products.push(newProduct)
        }
        const result = await cart.save()
        res.status(200).json({ status: "success", payload: result })
    } catch (err) {
        return res.status(500).json({ status: 'error', error: err.message })
    }
})

router.get('/', async (req, res) => {
    try {
        const limit = req.query.limit;
        const carts = await cartModel.find().lean().exec();

        if (limit) {
            const limitedCarts = carts.slice(0, limit);
            res.status(206).json( limitedCarts );
        } else {
            res.status(200).json({ carts: carts });
        } 
    } catch (err) {
        console.log(err);
        res.status(500).json({ status: 'error', error: err.message });
    }
})

router.get('/:cid', async (req, res) => {
    try {
        const cartId = req.params.cid
        const cart = await cartModel.findById(cartId)
        if (!cart) return res.status(404).json({ error: `The cart with id ${cartId} does not exist` })
        res.status(200).json({ status:'success', payload: cart})
    } catch (err) {
        return res.status(500).json({ status: 'error', error: err.message })
    }
})

export default router