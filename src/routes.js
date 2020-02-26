import { Router } from 'express';
import multer from 'multer';
import multerConfig from './config/multer';

import FileController from './app/controllers/FileController';
import UserController from './app/controllers/UserController';
import SessionController from './app/controllers/SessionController';
import RecipientController from './app/controllers/RecipientController';
import DeliveryManController from './app/controllers/DeliveryManController';
import DeliveryController from './app/controllers/DeliveryController';
import PackageController from './app/controllers/PackageController';
import FinishController from './app/controllers/FinishController';
import DeliveryProblemsController from './app/controllers/DeliveryProblemsController';

import AuthMiddleware from './app/middlewares/auth';

const routes = new Router();
const upload = multer(multerConfig);

// login
routes.post('/sessions', SessionController.store);

// File upload - Signature or profile pic
routes.post('/files', upload.single('file'), FileController.store);

// Routes unauthenticated to delivery man
routes.get('/deliveryman/:id/to-delivery', PackageController.index);
routes.get('/deliveryman/:id/delivered', PackageController.show);
// Update delivery, withdraw or finish
routes.put('/deliveryman/:id/deliveries/:deliveryId', PackageController.update);
routes.put('/deliveryman/:id/deliveries/:deliveryId/finish', FinishController.update);

// Delivery problems
routes.post('/delivery/:delivery_id/problems', DeliveryProblemsController.store);

routes.use(AuthMiddleware);

// signup and controll of admins
routes.post('/users', UserController.store);
routes.put('/users', UserController.update);
routes.get('/users', UserController.index);

// CRUD For recipients
routes.post('/recipients', RecipientController.store);
routes.get('/recipients', RecipientController.index);
routes.put('/recipients/:id', RecipientController.update);
routes.delete('/recipients/:id', RecipientController.delete);

// CRUD For Delivery Man
routes.post('/deliveryman', DeliveryManController.store);
routes.get('/deliveryman', DeliveryManController.index);
routes.put('/deliveryman/:id', DeliveryManController.update);
routes.delete('/deliveryman/:id', DeliveryManController.delete);

// CRUD For deliveries - Admin Control
routes.post('/deliveries', DeliveryController.store);
routes.get('/deliveries', DeliveryController.index);
routes.get('/deliveries/:id', DeliveryController.show);
routes.put('/deliveries/:id', DeliveryController.update);

// Cancel delivery
routes.delete('/problems/:id/cancel-delivery', DeliveryProblemsController.delete);


export default routes;
