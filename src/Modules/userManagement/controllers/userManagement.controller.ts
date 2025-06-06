import { NextFunction, Request, Response } from "express";
import Container from "typedi";
import { userManagementService } from "../services/userManagement.service";
import { jsonStatus, status } from "utils/helpers/api.responses";
import { HttpException } from "utils/exceptions/httpException";
import { pick, removenull } from "utils/helpers/utilities.services";

export class userManagementController {

    public userService = Container.get(userManagementService)
    public grantPermission = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const t = req.t
            const grantedBy = req.user._id
            const userId = req.params.id
            const { permissionIds } = req.body;
            console.log(`${permissionIds}, ${userId}, ${grantedBy}`)
            if (!userId || !grantedBy || !Array.isArray(permissionIds)) {
                throw new HttpException(status.BadRequest, t('General.error'))
            }
            const result = await this.userService.grantPermission(userId, permissionIds, grantedBy, t)
            res.status(status.OK).json({
                status: jsonStatus.OK,
                message: t('userPermission.granted'),
                data: result
            })


        } catch (error) {
            console.log(error)
            next(error)
        }
    }


    public restricPermission = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const t = req.t
            const grantedBy = req.user._id
            const userId = req.params.id
            const { permissionIds } = req.body;
            if (!userId || !grantedBy || !Array.isArray(permissionIds)) {
                throw new HttpException(status.BadRequest, t('General.error'))
            }
            const result = await this.userService.restricPermission(userId, permissionIds, grantedBy, t)
            res.status(status.OK).json({
                status: jsonStatus.OK,
                message: t('userPermission.restricted'),
                data: result
            })


        } catch (error) {
            console.log(error)
            next(error)
        }
    }




    public revokPermission = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const t = req.t
            const grantedBy = req.user._id
            const userId = req.params.id
            const { permissionIds, isRestricted = false } = req.body;
            if (!userId || !grantedBy || !Array.isArray(permissionIds)) {
                throw new HttpException(status.BadRequest, t('General.error'))
            }
            const result = await this.userService.revokPermission(userId, permissionIds, grantedBy, t, isRestricted)
            res.status(status.OK).json({
                status: jsonStatus.OK,
                message: t('userPermission.revoked'),
                data: result
            })


        } catch (error) {
            console.log(error)
            next(error)
        }
    }

    public createUser = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const t = req.t
            const createdBy = req.user._id
            const userData = pick(req.body, [
                'firstName',
                'lastName',
                'roleId',
                'profileImage',
                "email"
            ])
            removenull(userData)
            const result = await this.userService.createUser(userData, createdBy, t)
            return res.status(status.OK).json({
                status: jsonStatus.OK,
                message: t('General.add_success', { field: t('User.user') }),
                data: result
            })
        } catch (error) {
            next(error)
        }
    }

    public getAllUsers = async (req: Request, res: Response, next: NextFunction) => {
        try {

            const t = req.t
            const {
                page = 1,
                limit = 50,
                search = "",
                role = "",
                sortBy = "firstName",
                sortOrder = "asc",
                ...filters
            } = req.query
            const createdBy = req.user._id
            const result = await this.userService.getAllUsers({
                createdBy,
                page: parseInt(page as string),
                limit: parseInt(limit as string),
                search: search as string,
                roleFilter: role as string,
                sortBy: sortBy as string,
                sortOrder: sortOrder as string,
                filters,
                t,
            });


            return res.status(status.OK).json({
                status: jsonStatus.OK,
                message: t('General.get_success', { field: t('User.user') }),
                data: result.users,
                total: result.total,
                page: result.page,
                totalPage: result.totalPage,
            })
        } catch (error) {
            next(error)
        }
    }

    public getMyProfile = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const t = req.t
            const userId = req.user._id

            const result = await this.userService.getById(userId, t)
            return res.status(status.OK).json({
                status: jsonStatus.OK,
                message: t('General.get_success', { field: t('User.user') }),
                data: result
            })

        } catch (error) {
            next(error)
        }
    }
    public getByUserId = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const t = req.t
            const userId = req.params.id
            const result = await this.userService.getById(userId, t)
            return res.status(status.OK).json({
                status: jsonStatus.OK,
                message: t('General.get_success', { field: t('User.user') }),
                data: result
            })
        } catch (error) {
            next(error)
        }
    }

    public deleteUser = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const userId = req.params.id
            const createdBy = req.user._id
            const t = req.t
            const roleId = req.user.roleId.toString()
            const result = await this.userService.deleteUser(userId, createdBy, roleId, t)
            return res.status(status.OK).json({
                status: jsonStatus.OK,
                message: t('General.delete_success', { field: t('User.user') }),
                data: result
            })

        } catch (error) {
            next(error)
        }
    }


    public updateProfile = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const t = req.t;
            const userId = req.params.id;

            const updateData = pick(req.body, [
                'firstName',
                'lastName',
                'phone',
                'gender',
                'date_of_birth',
                'nationality',
                'emergency_contact_name',
                'emergency_contact_phone',
                'marital_status',
                'address',
                'profileImage',

                //labour 
                'employee_id',
                'skills',
                'health_status',
                'blood_group',
                'fifo_status',
                'documents',
                'visa_status',
                'remarks'
            ]);
            removenull(updateData);

            const result = await this.userService.updateUserProfile(userId, updateData, t);

            return res.status(status.OK).json({
                status: jsonStatus.OK,
                message: t('General.update_success', { field: t('User.profile') }),
                data: result
            });
        } catch (error) {
            next(error);
        }
    };


    public changeStatus = async (req: Request, res: Response, next: NextFunction) => {
        try {

            const t = req.t
            const userId = req.params.id
            const userStatus = req.body.userStatus
            await this.userService.changeStatus(userStatus, userId, t)
            return res.status(status.OK).json({
                status: jsonStatus.OK,
                message: t('User.changeStatus')
            })
        } catch (error) {
            next(error)
        }
    }




}