const dns = require('dns');
dns.setServers(['1.1.1.1','8.8.8.8'])

const connectDB = require('./db')

const express =  require('express');
const cors = require('cors');

require('dotenv').config();



const app = express();

app.use(express.json())

const userRouter = require('./routers/users')
const eventRouter = require('./routers/events')
const corsOptions = {
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
};

app.use(cors(corsOptions));
app.use('/users', userRouter);
app.use('/events', eventRouter);
const PORT = process.env.PORT;
app.listen(PORT, () => {
    console.log(`My server is running at http://localhost:${PORT}`);
})
connectDB();