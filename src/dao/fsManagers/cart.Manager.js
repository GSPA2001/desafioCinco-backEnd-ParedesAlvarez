import fs from 'fs'
import { __dirname } from '../../utils.js'
import { productManager } from './productManager.js'

class CartManager {
    #path
    #format
    constructor(path) {
        this.#path = path
        this.#format = 'utf-8'
        this.carts = []
    }

    async getCarts() {
        try {
            const data = await fs.promises.readFile(this.#path, this.#format);
            return JSON.parse(data);
        } catch (error) {
            console.log('Error: file not found');
            return [];
        }
    }

    async getCartById(id) {
        const carts = await this.getCarts();
        const cart = carts.find(item => item.id === id);
        return cart;
    }

    async #generateId() {
        const carts = await this.getCarts()
        return carts.length === 0 ? 1 : carts[carts.length - 1].id + 1
    }

    async addCart(products = []) {
        const carts = await this.getCarts();
        const newCart = {
            id: await this.#generateId(),
            products: products
        };
        carts.push(newCart);
        await fs.promises.writeFile(this.#path, JSON.stringify(carts, null, '\t'));
        this.carts = carts;
        return newCart;
    }

    async addProductsToCart(cartId, productId) {
        const products = productManager.getProductById(productId);
        if (!products) {
            return `Error: the product with id:${productId} does not exist`;
        }

        let carts = await this.getCarts();
        const cart = await this.getCartsById(cartId);
        
        if (!cart) {
            return null;
        }
        const productExistsInCart = cart.products.find(item => item.product === productId);

        if (productExistsInCart) {
            productExistsInCart.quantity++;
        } else {
            const product = {
                product: productId,
                quantity: 1,
            };
            cart.products.push(product);
        }

        const cartIndex = carts.findIndex(item => item.id === cartId);

        if (cartIndex !== -1) {
            carts[cartIndex] = cart;
        }

        await fs.promises.writeFile(this.#path, JSON.stringify(carts, null, "\t"));
        return cart;
    }
}

export const cartManager = new CartManager(`${__dirname}../../api/carts.json`)