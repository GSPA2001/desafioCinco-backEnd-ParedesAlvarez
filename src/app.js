import express from 'express'
import handlebars from 'express-handlebars'
import mongoose from 'mongoose'
import { Server } from 'socket.io'
import { __dirname, PORT } from './utils.js'

import productsRouter from './routes/products.routes.js'
import cartsRouter from './routes/carts.routes.js'
import viewsRouter from './routes/views.routes.js'
import messageModel from './dao/models/messages.model.js'

// Configuración de express

const app = express()

app.use(express.json())
const mongoose_URL = 'mongodb+srv://coder_55605:Probemosesto@cluster0.zxe3ha2.mongodb.net/desafio-5'
const mongoDBName = 'ecommerce'

app.engine('handlebars', handlebars.engine())
app.set('view engine', 'handlebars')
app.set('views', __dirname + '/views')
app.use(express.static(__dirname + '/public'))

// Configuración de rutas
app.get('/', (req,res) => res.render('index', { name: 'Tutor' }))
app.use('/api/products', productsRouter)
app.use('/api/carts', cartsRouter)
app.use('/home', viewsRouter)

// Configuración de Mongoose
mongoose.set('strictQuery', false)

// Conexión a MongoDB y inicio servidor
mongoose.connect(mongoose_URL, {dbName: mongoDBName})
.then(() => {
    console.log('MongoDB connected 🔌')
    const httpServer = app.listen(PORT, () => console.log(`Listening ...✅`))

    // Configuración de socket.io
    const io = new Server(httpServer)

    app.set('socketio', io)

    io.on('connection', async socket => {
        console.log('Successful connection 🚀')
        socket.on('productList', data => {
            io.emit('updatedProducts', data)
        })
        
        let messages = (await messageModel.find()) ? await messageModel.find() : []
        
        socket.broadcast.emit('alerta')
        socket.emit('logs', messages)
        socket.on('message', data => {
            messages.push(data)
            messageModel.create(messages)
            io.emit('logs', messages)
        })
    })
}) 
.catch(e => console.error('Error to connect 🚨🚨🚨'))