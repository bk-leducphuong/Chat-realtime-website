import express from 'express';
import { getAPIusers, createUser, updateUser, deleteUser } from '../controller/APIcontroller.js';

let router = express.Router();

// This code below will create a router as a module, loads a middleware function in it, defines some routes, and mounts the router module on a path in the main app.
const initAPIRoute = (app) => {
    router.get('/users', getAPIusers); // mehtod GET -> read data
    router.post('/create-user', createUser) // method POST -> create data
    router.put('/update-user', updateUser); // mehtod PUT -> update data
    router.delete('/delete-user/:No', deleteUser); // method DELETE -> delete data
    return app.use('/api/v1/', router)
}

export default initAPIRoute;