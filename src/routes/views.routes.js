import { Router } from 'express';
import productModel from '../dao/models/products.model.js';
import messageModel from '../dao/models/messages.model.js';

const router = Router()

// Ruta para renderizar la página principal
router.get('/', async (req, res) => {
    try {
        const allProducts = await productModel.find().lean().exec();
        console.log(allProducts.map(item => item._id));
        res.render('home', { allProducts });
    } catch (err) {
        console.error(err);
        res.status(500).json({ status: 'error', error: err.message });
    }
})

// Ruta para la página de productos en tiempo real
router.get('/realTimeProducts', async (req, res) => {
    try {
        const allProducts = await productModel.find().lean().exec();
        res.render('realTimeProducts', { allProducts })
    } catch (err) {
        console.log(err);
        res.status(500).json({ status: 'error', error: err.message });
    }
})

// Ruta para la página de chat
router.get('/chat', async (req, res) => {
    try {
        const messages = await messageModel.find().lean().exec();
        res.render('chat', { messages });
    } catch (err) {
        console.log(err);
        res.status(500).json({ status: 'error', error: err.message });
    }
})

export default router