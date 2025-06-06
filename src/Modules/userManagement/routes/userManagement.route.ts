import { Router } from "express";
import { Routes } from "interface/routes.interface";
import { permissionInjector } from "middlewares/permissionInjector";
import { userManagementController } from "../controllers/userManagement.controller";
import { authMiddleware, isAdmin, restrictToSelfOrAdminCreator } from "middlewares/authMiddleware";

export class userManagementRoute implements Routes {
    public path = '/user'
    public router = Router();
    public userManagementController = new userManagementController()

    constructor() {
        this.initializeRoutes()
    }
    public initializeRoutes() {
        this.router.post(`${this.path}/grant/:id`, permissionInjector(`${this.path}/grant`, 'POST'), this.userManagementController.grantPermission);
        this.router.post(`${this.path}/revok/:id`, permissionInjector(`${this.path}/revoke`, 'POST'), this.userManagementController.revokPermission);
        this.router.post(`${this.path}/restrict/:id`, permissionInjector(`${this.path}/restrict`, 'POST'), this.userManagementController.restricPermission);
        this.router.get(`${this.path}/:id`, authMiddleware, this.userManagementController.getByUserId)
        this.router.get(`${this.path}/Me`, authMiddleware, this.userManagementController.getMyProfile)
        this.router.post(`${this.path}`, permissionInjector(`${this.path}`, 'POST'), this.userManagementController.createUser)
        this.router.get(`${this.path}`, permissionInjector(`${this.path}`, 'GET'), this.userManagementController.getAllUsers)
        this.router.delete(`${this.path}/:id`, permissionInjector(`${this.path}`, 'DELETE'), this.userManagementController.deleteUser)
        this.router.put(`${this.path}/:id`, authMiddleware, restrictToSelfOrAdminCreator, this.userManagementController.updateProfile)
        this.router.patch(`${this.path}/changeStatus/:id`, isAdmin, this.userManagementController.changeStatus)


    }
}