import { Document, FlattenMaps, Types } from "mongoose";
import userStatus from '../../userManagement/constant/userStatus.json'
import { TFunction } from "i18next";


export const StatusEnum = {
    ACTIVE: userStatus.statuses[0],
    INACTIVE: userStatus.statuses[1],
    DEACTIVATED: userStatus.statuses[2],
};


export interface IUser {
    _id?: string
    email: string;
    failedLoginAttempts: number;
    lockUntil?: boolean;
    lastPasswordChange: Date;
    token?: string;
    tokenExpiry?: Date
    fullName?: string;
    otp?: string;
    otpExpiresAt?: Date;
    otpCreatedAt?: Date;
    isVerifiedOtp?: boolean;
    isVerifyOtpAt?: Date;
    failedOtpAttempts?: number;

    joiningDate?: Date;
    isDeleted?: boolean;
    deletedAt?: Date;
    hasAcceptedTerms: boolean
    forgotPassword?: string;
    forgotpasswordTokenExpiry?: Date;
    isFirstTimeResetPassword?: boolean;
    isPasswordUpdate?: boolean;
    passwordUpdatedAt?: Date;

    createdAt?: Date;
    updatedAt?: Date;
    accountSetting: {
        userName?: string;
        passwordHash?: string;
        lastLogin?: Date;
    };

    sessionId: string
    refreshToken: string
    refreshTokenExpiry: Date
    isRememberMe: boolean


    inviteStatus?: (typeof userStatus.inviteStatuses)[number]
    invitedAt: Date
    acceptedInviteAt: Date
    status?: (typeof userStatus.statuses)[number]

}




export interface DataStoredInToken {
    _id: string;
    role: string;
    email: string;
    passwordHash: string;
    sessionId: string;

}


export interface TokenData {
    token: string;
    expiresIn: string;
}




export interface GetAllUsersParams {
    page?: number;
    limit?: number;
    search?: string;
    roleFilter?: string;
    sortBy?: string;
    sortOrder?: string;
    filters?: Record<string, any>;
    t: TFunction;
}
