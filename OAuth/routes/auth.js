import express from "express"
import { loginController, logoutController, googleController, googleRedirectController } from "../controllers/loginController.js";
import passport from "passport"

const Router = express.Router();

Router.get('/login', loginController);
Router.get('/logout', logoutController);
Router.get('/google', googleController);
Router.get('/google/redirect', passport.authenticate('google'), googleRedirectController);

export default Router;