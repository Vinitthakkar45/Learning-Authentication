import express from "express"
import {profileController, checkAuth} from "../controllers/profileController.js"
const Router = express.Router();

Router.get('/',checkAuth,profileController);

export default Router;