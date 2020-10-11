const express = require('express')
const BodyParser = require('body-parser')
const cors = require('cors')
const morgan = require('morgan')
const dotenv = require('dotenv')
const mongoose = require('mongoose')

// establishing environment variable
dotenv.config()

// importing routes
const authRouter = require('./routes/auth')
const productRouter = require('./routes/product')
const orderRouter = require('./routes/order')
const addressRouter = require('./routes/address')
const viewRouter = require('./routes/view')

const errorHandler = require('./middleware/errorHandler')

// setting up mongoose database
mongoose.set('useCreateIndex', true)
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})

// logger for incoming requests
const logger = morgan('dev', {
  // skip: function (req, res) { return res.statusCode < 400 }
})


const app = express()

// middleware
app.use(logger)
app.use(cors())
app.use(BodyParser.json())

// setting static folder to "public"
app.use(express.static('public'))

// including routes
app.use('/api/auth', authRouter)
app.use('/api/product', productRouter)
app.use('/api/order', orderRouter)
app.use('/api/address', addressRouter)

// view route
app.use('/', viewRouter)

// Error handler middleware
app.use(errorHandler);

// setting port
port = process.env.PORT || 8000

// establishing server
app.listen(port, () => {
  console.log(`Listening at port ${port}`)
})
// module.exports = app;