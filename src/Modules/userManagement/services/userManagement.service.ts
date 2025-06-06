import { aws, FRONTEND_URL, TOKEN_EXPIRY } from "config";
import { TFunction } from "i18next";
import { IAttachment } from "Modules/Attachment/interfaces/attcahment.interface";
import { GetAllUsersParams, InviteStatusEnum, IUser, IUserResponse, ROLES, StatusEnum } from "Modules/Auth/interfaces/auth.interface";
import User from "Modules/Auth/models/auth.model";
import Permission from "Modules/Permission/models/Permission.model";
import mongoose, { Types } from "mongoose";
import { Service, Container } from "typedi";
import { HttpException } from "utils/exceptions/httpException";
import { status } from "utils/helpers/api.responses";
import { createJWT, generateRandomPassword, parseDurationToMs, sanitiseString } from "utils/helpers/utilities.services";
import { resetPasswordEmail, sendDeactivationEmail, sendReactivationEmail } from "utils/mail/mailer";
import { AttachmentService } from "Modules/Attachment/services/attachment.service";
import bcrypt from 'bcryptjs'
import Role from "Modules/Role/models/role.model";
import Labour from "Modules/Labour/models/labour.model";
import crypto from 'crypto'
import { LabourService } from "Modules/Labour/services/labour.service";
import { LabourDocument, VerificationStatusEnum } from "Modules/Labour/interfaces/labour.interface";

@Service()
export class userManagementService {

    public attachmentService = Container.get(AttachmentService)
    public labourProfileService = Container.get(LabourService)

    public async grantPermission(userId: string, permissionIds: string[], grantedBy: string, t: TFunction) {
        try {
            const user = await User.findOne({ _id: userId, isDeleted: false });
            const permission = await Permission.find({ _id: { $in: permissionIds } });
            if (!user || permission.length !== permissionIds.length) {
                throw new HttpException(status.NotFound, t('General.not_found', { field: t('User.user') }));
            }

            // Check if any permissionIds exist in restrictedPermissions
            const restrictedIds = user.restrictedPermissions.map(p => p.permissionId.toString());
            const conflict = permissionIds.filter(id => restrictedIds.includes(id));
            if (conflict.length > 0) {
                throw new HttpException(status.BadRequest, t('userPermission.remove_from_restricted_first'));
            }

            const existingId = user.permissions.map(p => p.permissionId.toString());
            const newPermisssion = permissionIds.filter(id => !existingId.includes(id));

            newPermisssion.forEach(id => {
                user.permissions.push({ permissionId: new mongoose.Types.ObjectId(id), grantedBy: new mongoose.Types.ObjectId(grantedBy) });
            });
            await user.save();
            return {
                granted: newPermisssion,
                total: user.permissions.length
            };
        } catch (error) {
            console.log(error);
            if (error instanceof HttpException) throw error;
            throw new HttpException(status.InternalServerError, t('General.error'));
        }
    }


    public async restricPermission(userId: string, permissionIds: string[], grantedBy: string, t: TFunction) {
        try {
            const user = await User.findOne({ _id: userId, isDeleted: false })
            const permission = await Permission.find({ _id: { $in: permissionIds } });
            if (!user || permission.length !== permissionIds.length) {
                throw new HttpException(status.NotFound, t('General.not_found', { field: t('User.user') }));
            }

            // Check if any permissionIds exist in granted permissions
            const grantedIds = user.permissions.map(p => p.permissionId.toString());
            const conflict = permissionIds.filter(id => grantedIds.includes(id));
            if (conflict.length > 0) {
                throw new HttpException(status.BadRequest, t('userPermission.revoke_from_granted_first'));
            }

            const existingId = user.restrictedPermissions.map(p => p.permissionId.toString());
            const newPermission = permissionIds
                .map(id => id.toString())
                .filter(id => !existingId.includes(id));

            newPermission.forEach(id => {
                user.restrictedPermissions.push({ permissionId: new mongoose.Types.ObjectId(id), grantedBy: new mongoose.Types.ObjectId(grantedBy) });
            });
            await user.save();
            return {
                granted: newPermission,
                total: user.restrictedPermissions.length
            };
        } catch (error) {
            console.log(error);
            if (error instanceof HttpException) throw error;
            throw new HttpException(status.InternalServerError, t('General.error'));
        }
    }




    public async revokPermission(userId: string, permissionIds: string[], grantedBy: string, t: TFunction, isRestricted: boolean) {
        try {
            const user = await User.findOne({ _id: userId, isDeleted: false });
            if (!user) {
                throw new HttpException(status.NotFound, t('General.not_found', { field: t('User.user') }));
            }

            const targetArray = isRestricted ? user.restrictedPermissions : user.permissions;
            const existingPermissionIds = targetArray.map(p => p.permissionId.toString());
            const toBeRemoved = permissionIds.filter(id => existingPermissionIds.includes(id));

            if (toBeRemoved.length === 0) {
                throw new HttpException(status.BadRequest, isRestricted ? t('userPermission.none_to_revoke_restricted') : t('userPermission.none_to_revoke'));
            }

            // Filter out revoked permissions from target array
            if (isRestricted) {
                user.restrictedPermissions = user.restrictedPermissions.filter(perm => !toBeRemoved.includes(perm.permissionId.toString()));
            } else {
                user.permissions = user.permissions.filter(perm => !toBeRemoved.includes(perm.permissionId.toString()));
            }

            await user.save();

            return {
                revoked: toBeRemoved.length,
                remaining: isRestricted ? user.restrictedPermissions.length : user.permissions.length
            };
        } catch (error) {
            console.log(error);
            if (error instanceof HttpException) throw error;
            throw new HttpException(status.InternalServerError, t('General.error'));
        }
    }

    private generateRandomPassword(length: number = 12): string {
        return crypto.randomBytes(length).toString("hex").slice(0, length);
    }

    public async createUser(data: Partial<IUser>, createdBy: string, t: TFunction) {
        try {
            const [existingUser, role] = await Promise.all([

                User.findOne({ email: data.email }).populate('roleId'),
                Role.findById(data.roleId)
            ])
            const isLabour = role.name.toLowerCase() === ROLES.LABOUR.toLowerCase()
            if (existingUser?.isDeleted === true) {
                const resetTokenResult = createJWT(existingUser, parseDurationToMs(TOKEN_EXPIRY))
                const resetToken =
                    typeof resetTokenResult === 'string'
                        ? resetTokenResult :
                        resetTokenResult.accessToken
                const resetTokenExpiry = new Date(Date.now() + parseDurationToMs(TOKEN_EXPIRY))
                await User.updateOne(
                    { email: data.email, isDeleted: true },
                    {
                        $set: {
                            isDeleted: false,
                            deletedAt: null,
                            createdAt: Date.now(),
                            passwordUpdatedAt: null,
                            forgotPassword: resetToken,
                            forgotpasswordTokenExpiry: resetTokenExpiry,
                            isFirstTimeResetPassword: true,
                            isVerifiedOtp: true,
                            isVerifyOtpAt: Date.now(),
                            createdBy: createdBy,
                            firstName: data.firstName,
                            lastName: data.lastName,
                            profileImage: data.profileImage,
                            lockUntil: false,
                            status: StatusEnum.INACTIVE,
                            invitedAt: Date.now(),
                            inviteStatus: InviteStatusEnum.WAITING_TO_ACCEPT
                        },
                        $unset: {
                            token: "",
                            tokenExpiry: "",
                            refreshToken: "",
                            refreshTokenExpiry: "",
                            sessionId: ""
                        }
                    }
                )


                const reactivaedUser = await User.findOne({ email: data.email }).select('_id inviteStatus email firstName lastName roleId status isDeleted joiningDate accountSetting.userName')
                    .populate<{ profileImage: IAttachment }>("profileImage").lean()
                const resetLink = `${FRONTEND_URL}/auth/reset-password/change?token=${resetToken}`
                await resetPasswordEmail(existingUser.email, resetLink, data.firstName + data.lastName)
                if (data.profileImage) {
                    await this.attachmentService.updateIsTemporaryFalse(data.profileImage.toString(), t)
                }
                if (isLabour) {
                    const labourExists = await Labour.findOne({ userId: reactivaedUser._id, isDeleted: true })
                    if (!labourExists) {
                        await Labour.create({
                            userId: reactivaedUser._id,
                            verification_status: VerificationStatusEnum.PENDING
                        });
                    } else if (labourExists.isDeleted) {
                        labourExists.isDeleted = false;
                        labourExists.deletedAt = null
                        await labourExists.save();
                    }

                }
                return {
                    ...reactivaedUser,
                    profileImage: reactivaedUser.profileImage ?
                        {
                            _id: reactivaedUser.profileImage._id,
                            filename: reactivaedUser.profileImage.filename,
                            url: `${aws.S3_BASE_URL}/${reactivaedUser.profileImage.key}`
                        } :
                        null
                }

            }
            if (existingUser) {
                throw new HttpException(status.ResourceExist, t('General.already_exist', { field: t('User.email') }))
            }



            const randomPassword = this.generateRandomPassword();
            const hashedPassword = await bcrypt.hash(randomPassword, 10);


            const newUser = await User.create({
                email: data.email,
                firstName: data.firstName,
                lastName: data.lastName,
                roleId: role._id,
                accountSetting: { passwordHash: hashedPassword },
                inviteStatus: InviteStatusEnum.WAITING_TO_ACCEPT,
                invitedAt: Date.now(),
                joiningDate: Date.now(),
                createdAt: Date.now(),
                createdBy: createdBy.toString(),
                profileImage: data.profileImage,
                status: StatusEnum.INACTIVE

            })
            const resetTokenResult = createJWT(newUser, parseDurationToMs(TOKEN_EXPIRY))
            const resetToken =
                typeof resetTokenResult === 'string'
                    ? resetTokenResult :
                    resetTokenResult.accessToken
            const resetTokenExpiry = new Date(Date.now() + parseDurationToMs(TOKEN_EXPIRY))
            newUser.forgotPassword = resetToken;
            newUser.forgotpasswordTokenExpiry = resetTokenExpiry;
            newUser.isFirstTimeResetPassword = true;
            newUser.isVerifiedOtp = true;
            newUser.isVerifyOtpAt = new Date();

            await newUser.save();


            const userData = await User.findById(newUser._id).select("_id email inviteStatus firstName lastName roleId` accountSetting.userName"
            )
                .populate<{
                    profileImage: IAttachment;
                }>("profileImage")
                .lean();


            const fName = data.firstName + (data.lastName ?? "");
            const resetLink = `${FRONTEND_URL}/auth/reset-password/change?token=${resetToken}`;
            await resetPasswordEmail(newUser.email, resetLink, fName);

            // change -> isTemp:false for images
            if (data.profileImage) {

                await this.attachmentService.updateIsTemporaryFalse(userData.profileImage._id.toString(), t)
            }

            if (isLabour) {
                await Labour.create({
                    userId: newUser._id,
                    verification_status: VerificationStatusEnum.PENDING
                });
            }
            return {
                ...userData,
                profileImage: userData.profileImage
                    ? {
                        _id: userData.profileImage._id,
                        filename: userData.profileImage.filename,
                        url: `${aws.S3_BASE_URL}/${userData.profileImage.key}`
                    } : null
            }

        } catch (error) {
            console.log(error)
            if (error instanceof HttpException) throw error;
            throw new HttpException(status.InternalServerError, t('General.errorCreating', { field: t('User.user') }))
        }
    }


    public async getAllUsers(params: GetAllUsersParams): Promise<any> {
        const { createdBy, page, limit, search, roleFilter, sortBy, sortOrder, filters, t } = params;

        try {
            const user = await User.findById(createdBy).lean()
            if (!user) throw new HttpException(status.NotFound, t('General.not_found', { field: t('User.user') }))
            const role = await Role.findById(user.roleId).lean()
            if (!role) throw new HttpException(status.NotFound, t('General.not_found', { field: t('Role.role') }))
            const skip = (page - 1) * limit
            const nameRegex = new RegExp(sanitiseString(search.trim()), 'i')
            const roleRegex = roleFilter ? new RegExp(sanitiseString(search as string), 'i') : null
            const emailRegex = new RegExp(sanitiseString(search.trim()), 'i')
            const baseFilter: any = {
                isDeleted: false,
                // status: StatusEnum.ACTIVE,
                $or: [
                    { firstName: nameRegex },
                    { lastName: nameRegex },
                    { email: emailRegex },
                    {
                        $expr: {
                            $regexMatch: {
                                input: { $concat: ['$firstName', ' ', 'lastName'] },
                                regex: nameRegex
                            }
                        }
                    },
                    { 'accountSetting.userName': nameRegex }
                ]
            }
            for (const [key, value] of Object.entries(filters)) {
                if (
                    !['page', 'limit', 'search', 'role', 'sortBy', 'sortOrder'].includes(key) &&
                    typeof value === 'string'
                ) {
                    const val = sanitiseString(value)
                    if (value.trim()) {
                        baseFilter[key] = new RegExp(val, 'i')
                    }
                }
            }

            const pipeline: any[] = [
                { $match: baseFilter },
                {
                    $lookup: {
                        from: 'roles',
                        localField: 'roleId',
                        foreignField: '_id',
                        as: 'role'
                    }
                },
                {
                    $lookup: {
                        from: 'attachments',
                        localField: 'profileImage',
                        foreignField: '_id',
                        as: 'profileImageData'
                    }
                },
                {
                    $unwind: {
                        path: '$profileImageData',
                        preserveNullAndEmptyArrays: true
                    }
                },
                { $unwind: '$role' },
                { $match: { 'role.name': { $nin: [ROLES.ADMIN, ROLES.SUPER_ADMIN] } } }
            ]

            if (roleRegex) {
                pipeline.push({
                    $match: { 'role.name': { $regex: roleRegex } }
                })
            }
            pipeline.push(
                {
                    $addFields: {
                        roleName: '$role.name'
                    }
                },
                {
                    $addFields: {
                        profileImage: {
                            $cond: {
                                if: { $ne: ['$profileImageData', null] },
                                then: {
                                    _id: { $toString: '$profileImageData._id' },
                                    filename: '$profileImageData.filename',
                                    url: {
                                        $concat: [aws.S3_BASE_URL, '/', '$profileImageData.key']
                                    }
                                },
                                else: null
                            }
                        }
                    }

                },
                {
                    $sort: {
                        ...(sortBy === 'roleName'
                            ? { roleName: sortOrder === 'desc' ? -1 : 1, firstName: 1 }
                            : { [sortBy]: sortOrder === 'desc' ? -1 : 1 }
                        )
                    }
                },
                { $skip: skip },
                { $limit: limit },
                {
                    $project: {
                        _id: 1,
                        email: 1,
                        firstName: 1,
                        lastName: 1,
                        roleName: 1,
                        profileImage: 1,
                        status: 1,
                        inviteStatus: 1,
                        fullName: 1
                    }
                }
            )
            const countPipeline = [
                ...pipeline.slice(0, pipeline.findIndex(p => '$sort' in p || '$skip' in p || '$limit' in p)),
                { $count: 'total' }
            ]
            const [users, totalResult] = await Promise.all([
                User.aggregate(pipeline),
                User.aggregate(countPipeline)
            ])

            const total = totalResult[0]?.total || 0;
            return {
                users,
                total,
                page,
                totalPage: Math.ceil(total / limit)


            }


        } catch (error) {
            console.log(error)
            if (error instanceof HttpException) throw error;
            throw new HttpException(status.InternalServerError, t('General.errorFetching', { field: t('User.user') }))
        }
    }

    public async getById(userId: string, t: TFunction): Promise<any> {
        try {
            if (!userId) {
                throw new HttpException(
                    status.BadRequest, t('General.not_found', { field: t('User.user') })
                );
            }
            const userData = await User.findById(userId)
                .select([
                    '_id',
                    'email',
                    'firstName',
                    'lastName',
                    'fullName',
                    'phone',
                    'address',
                    'gender',
                    'date_of_birth',
                    'age',
                    'nationality',
                    'marital_status',
                    'emergency_contact_name',
                    'emergency_contact_phone',
                    'joiningDate',
                    'status',
                    'inviteStatus',
                    'accountSetting.userName',
                    'accountSetting.lastLogin',
                    'roleId',
                    'profileImage',
                    'notificationPreferences',
                    'createdBy',
                ])
                .populate<{ profileImage: IAttachment }>('profileImage').lean()
            const roleData = await Role.findById(userData.roleId)
            if (!userData) {
                t('General.not_found', { field: t('User.user') })
            }
            let labourData = null;
            if (roleData?.name.toLowerCase() === ROLES.LABOUR.toLowerCase()) {
                const labour = await Labour.findOne({ userId })
                    .select('_id employee_id skills health_status blood_group fifo_status documents visa_status remarks')
                    .populate<{ documents: IAttachment[] }>('documents')
                    .lean();

                if (labour) {
                    labourData = {
                        _id: labour._id,
                        employee_id: labour.employee_id,
                        skills: labour.skills,
                        health_status: labour.health_status,
                        blood_group: labour.blood_group,
                        fifo_status: labour.fifo_status,
                        documents: Array.isArray(labour.documents)
                            ? labour.documents.map(doc => ({
                                _id: doc._id,
                                filename: doc.filename,
                                url: `${aws.S3_BASE_URL}/${doc.key}`
                            }))
                            : [],
                        visa_status: labour.visa_status,
                        remarks: labour.remarks,
                    };
                }
            }



            return {
                ...userData,
                profileImage: userData.profileImage
                    ? {
                        _id: userData.profileImage._id.toString(),
                        filename: userData.profileImage.filename,
                        url: `${aws.S3_BASE_URL}/${userData.profileImage.key}`
                    }
                    : null,
                roleName: roleData.name,
                labour: labourData
                // && {
                //     ...labourData,
                //     documents: Array.isArray(labourData.documents)
                //         ? labourData.documents.map((doc: any) => ({
                //             _id: doc._id,
                //             filename: doc.filename,
                //             url: `${aws.S3_BASE_URL}/${doc.key}`
                //         }))
                //         : []
                // }


            }
        } catch (error) {
            if (error instanceof HttpException) throw error
            throw new HttpException(status.InternalServerError, t('General.errorFetching', { field: t('User.user') }))
        }
    }


    public async deleteUser(userId: string, createdBy: string, roleId: string, t: TFunction) {
        try {
            const requesterRole = await Role.findById(roleId);
            const isAdmin = [ROLES.ADMIN.toLowerCase(), ROLES.SUPER_ADMIN.toLowerCase()].includes(requesterRole?.name?.toLocaleLowerCase());

            const user = await User.findOne({
                _id: userId,
                ...(isAdmin ? {} : { createdBy }),
                isDeleted: false,
            }).populate('roleId');

            if (!user) {
                throw new HttpException(
                    status.NotFound,
                    t('General.not_found', { field: t('User.user') })
                );
            }

            const targetRole = (user.roleId as any).name;

            if (targetRole?.toLocaleLowerCase() === ROLES.STAFF.toLocaleLowerCase() && !isAdmin) {
                throw new HttpException(
                    status.Forbidden,
                    t('Role.permission_denied')
                );
            }

            const result = await User.updateOne(
                { _id: userId, ...(isAdmin ? {} : { createdBy }), isDeleted: false },
                {
                    $set: {
                        isDeleted: true,
                        deletedAt: new Date(),
                        token: null,
                        tokenExpiry: null,
                        forgotPassword: null,
                        forgotpasswordTokenExpiry: null,
                        status: StatusEnum.DEACTIVATED,
                        sessionId: null
                    },
                }
            );

            if (result.modifiedCount === 0) {
                throw new HttpException(
                    status.NotFound,
                    t('General.not_found', { field: t('User.user') })
                );
            }

            if (targetRole?.toUpperCase() === ROLES.LABOUR.toUpperCase()) {
                await Labour.updateOne({ userId }, { $set: { isDeleted: true, deletedAt: new Date() } });
            }

            return { deletedCount: result.modifiedCount };

        } catch (error) {
            if (error instanceof HttpException) throw error;
            throw new HttpException(status.InternalServerError, t('General.errorDeleting', { field: t('User.user') }));
        }
    }


    public async updateUserProfile(userId: string, data: any, t: TFunction) {
        try {
            const user = await User.findById(userId).populate<{ profileImage: IAttachment }>('profileImage');
            console.log(user)
            if (!user) {
                throw new HttpException(status.NotFound, t('General.not_found', { field: t('User.user') }));
            }

            const isNewImage = data.profileImage && data.profileImage.toString() !== user.profileImage?._id?.toString();
            Object.assign(user, {
                firstName: data.firstName !== undefined ? data.firstName : user.firstName,
                lastName: data.lastName !== undefined ? data.lastName : user.lastName,
                phone: data.phone !== undefined ? data.phone : user.phone,
                gender: data.gender !== undefined ? data.gender : user.gender,
                date_of_birth: data.date_of_birth !== undefined ? data.date_of_birth : user.date_of_birth,
                nationality: data.nationality !== undefined ? data.nationality : user.nationality,
                emergency_contact_name: data.emergency_contact_name !== undefined ? data.emergency_contact_name : user.emergency_contact_name,
                emergency_contact_phone: data.emergency_contact_phone !== undefined ? data.emergency_contact_phone : user.emergency_contact_phone,
                marital_status: data.marital_status !== undefined ? data.marital_status : user.marital_status,
                address: data.address !== undefined ? data.address : user.address,
                profileImage: data.profileImage ? new Types.ObjectId(data.profileImage) : user.profileImage,
            });

            await user.save();


            const role = await Role.findById(user.roleId);
            if (role?.name.toLowerCase() === ROLES.LABOUR.toLowerCase()) {
                await this.labourProfileService.updateLabourProfile(userId, data, t);
            }

            if (isNewImage) {
                await this.attachmentService.updateIsTemporaryFalse(data.profileImage!.toString(), t);
            }

            const updatedUser = await User.findById(userId)
                .select('_id email firstName lastName phone gender date_of_birth profileImage')
                .populate<{ profileImage: IAttachment }>('profileImage')
                .lean();

            let labourData = null;

            if (role?.name.toLowerCase() === ROLES.LABOUR.toLowerCase()) {
                const updatedLabour = await Labour.findOne({ userId })
                    .select('_id employee_id skills health_status blood_group fifo_status documents visa_status remarks')
                    .populate<{ documents: IAttachment[] }>('documents')
                    .lean();


                if (updatedLabour) {
                    labourData = {
                        _id: updatedLabour._id,
                        employee_id: updatedLabour.employee_id,
                        skills: updatedLabour.skills,
                        health_status: updatedLabour.health_status,
                        blood_group: updatedLabour.blood_group,
                        fifo_status: updatedLabour.fifo_status,
                        visa_status: updatedLabour.visa_status,
                        remarks: updatedLabour.remarks,
                        documents: Array.isArray(updatedLabour.documents)
                            ? updatedLabour.documents.map(doc => ({
                                _id: doc._id,
                                filename: doc.filename,
                                url: `${aws.S3_BASE_URL}/${doc.key}`
                            }))
                            : []
                    };
                }
            }


            return {
                ...updatedUser,
                profileImage: updatedUser?.profileImage
                    ? {
                        _id: updatedUser.profileImage._id,
                        filename: updatedUser.profileImage.filename,
                        url: `${aws.S3_BASE_URL}/${updatedUser.profileImage.key}`
                    }
                    : null,
                labour: labourData
            };


        } catch (error) {
            console.error(error);
            if (error instanceof HttpException) throw error;
            throw new HttpException(status.InternalServerError, t('General.errorUpdating', { field: t('User.profile') }));
        }
    }



    public async changeStatus(userStatus: string, userId: string, t: TFunction) {
        const user = await User.findById(userId);
        if (!user) {
            throw new HttpException(status.NotFound, t('General.not_found', { field: t('User.user') }));
        }

        const normalizedStatus = userStatus.toLowerCase();

        let newStatus: string;
        if (normalizedStatus === StatusEnum.ACTIVE.toLowerCase()) {
            newStatus = StatusEnum.ACTIVE; // Assign correct case
        } else if (normalizedStatus === StatusEnum.INACTIVE.toLowerCase()) {
            newStatus = StatusEnum.INACTIVE;
        } else {
            throw new HttpException(status.BadRequest, t('User.invalidStatus'));
        }

        if (user.status === newStatus) {
            throw new HttpException(
                status.BadRequest,
                newStatus === StatusEnum.INACTIVE
                    ? t('User.alreadyINACTIVE')
                    : t('User.alreadyActive')
            );
        }

        user.status = newStatus;
        await user.save();

        if (newStatus === StatusEnum.INACTIVE) {
            await sendDeactivationEmail(user.email, `${user.firstName} ${user.lastName}`);
        } else if (newStatus === StatusEnum.ACTIVE) {
            await sendReactivationEmail(user.email, `${user.firstName} ${user.lastName}`);
        }

        return true;
    }








}