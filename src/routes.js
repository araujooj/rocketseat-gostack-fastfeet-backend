import { Router } from 'express';
import multer from 'multer';
import multerConfig from './config/multer';

import FileController from './app/controllers/FileController';
import UserController from './app/controllers/UserController';
import SessionController from './app/controllers/SessionController';
import RecipientController from './app/controllers/RecipientController';
import DeliveryManController from './app/controllers/DeliveryManController';

import AuthMiddleware from './app/middlewares/auth';

const routes = new Router();
const upload = multer(multerConfig);

routes.post('/sessions', SessionController.store);

routes.post('/users', UserController.store);

routes.use(AuthMiddleware);

routes.put('/users', UserController.update);
routes.get('/users', UserController.index);

routes.post('/recipients', RecipientController.store);
routes.get('/recipients', RecipientController.index);
routes.put('/recipients/:id', RecipientController.update);
routes.delete('/recipients/:id', RecipientController.delete);

routes.post('/deliveryman', DeliveryManController.store);
routes.get('/deliveryman', DeliveryManController.index);
routes.put('/deliveryman/:id', DeliveryManController.update);
routes.delete('/deliveryman/:id', DeliveryManController.delete);

routes.post('/files', upload.single('file'), FileController.store);

export default routes;
