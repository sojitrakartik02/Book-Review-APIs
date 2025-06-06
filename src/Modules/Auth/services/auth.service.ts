import User from '../../Auth/models/auth.model';
import {
    createJWT,
    hashPassword,
    comparePassword,
    verifyJWT,
    isPasswordSecure,
    generateOTP,
    parseDurationToMs,
    hashToken,
    compareToken,
} from '../../../utils/helpers/utilities.services';
import { IUser, StatusEnum } from '../../Auth/interfaces/auth.interface';
import { Service } from 'typedi';
import { HttpException } from '../../../utils/exceptions/httpException';
import { sendOtpEmail } from '../../../utils/mail/mailer';
import {
    FORGOT_PASSWORD_TOKEN_EXPIRY,
    REMEMBER_ME_TOKEN_EXPIRY,
    SECRET_KEY,
    REFRESH_TOKEN,
    OTP_LENGTH,
    OTP_EXPIRY_TIME_MIN,
    TOKEN_EXPIRY,
    RESET_WINDOW_MINUTES,
    LOGIN_ATTEMPT,
    REFRESH_TOKEN_EXPIRY,

} from '../../../config/index';
import { status } from '../../../utils/helpers/api.responses';
import { sign } from 'jsonwebtoken';
import { TFunction } from 'i18next';

@Service()
export class AuthService {

    public async signup(email: string, userName: string | undefined, password: string, t: TFunction): Promise<{ user: any; token: string, refreshToken?: string }> {
        try {
            const normalizedEmail = email.toLowerCase();
            const existingUser = await User.findOne({
                email: { $regex: new RegExp(`^${normalizedEmail}$`, 'i') },
                isDeleted: false,
            });
            if (existingUser) {
                throw new HttpException(status.ResourceExist, t('General.already_exist', { field: t('User.email') }));
            }
            const passwordHash = await hashPassword(password);

            const user = new User({
                email: email.toLowerCase(),
                accountSetting: {
                    userName,
                    passwordHash,

                },
                status: StatusEnum.ACTIVE,
                createdAt: new Date(),
                hasAcceptedTerms: true
            });
            await user.save();


            const { accessToken, refreshToken, sessionId } = createJWT(user, TOKEN_EXPIRY);

            const hashedRefreshToken = refreshToken ? await hashToken(refreshToken) : null;
            const refreshTokenExpiry = refreshToken
                ? new Date(Date.now() + parseDurationToMs(REFRESH_TOKEN_EXPIRY))
                : null;
            await User.updateOne(
                { _id: user._id },
                {
                    $set: {
                        token: accessToken,
                        tokenExpiry: new Date(Date.now() + parseDurationToMs(TOKEN_EXPIRY)),
                        refreshToken: hashedRefreshToken,
                        refreshTokenExpiry,
                        sessionId,
                        failedLoginAttempts: 0,
                        lockUntil: false,
                    },
                }
            );
            return {
                user: {
                    _id: user._id.toString(),
                    email: user.email,
                    accountSetting:
                        { userName: user.accountSetting.userName },
                    status: user.status,
                },
                token: accessToken,
                refreshToken: refreshToken || undefined,
            };
        } catch (error) {
            if (error instanceof HttpException) throw error;
            throw new HttpException(status.InternalServerError, t('General.error'));

        }
    }

    public async login(
        email: string,
        password: string,
        isRememberMe: boolean,
        hasAcceptedTerms: boolean,
        t: TFunction
    ): Promise<{ user: Partial<IUser>; token: string; refreshToken: string }> {
        try {
            const user = await User.findOne({
                email: { $regex: new RegExp(`^${email}$`, 'i') },
                isDeleted: false,
                status: (StatusEnum.ACTIVE || StatusEnum.INACTIVE)
            })

            if (!user) {
                throw new HttpException(status.NotFound, t('General.invalid', { field: t('User.loginFailed') }));
            }
            if (!hasAcceptedTerms) {
                throw new HttpException(status.Forbidden, t('User.mustAcceptTerms'))
            }

            if (user.lockUntil) {
                throw new HttpException(
                    status.Unauthorized,
                    t('User.AccountLock')
                );
            }

            const isPasswordValid = await comparePassword(password, user.accountSetting.passwordHash);
            if (!isPasswordValid) {
                user.failedLoginAttempts = (user.failedLoginAttempts || 0) + 1;
                const remainingAttempts = Number(LOGIN_ATTEMPT) - user.failedLoginAttempts;

                if (user.failedLoginAttempts >= Number(LOGIN_ATTEMPT)) {
                    user.lockUntil = true
                    await user.save();

                    throw new HttpException(
                        status.Unauthorized,
                        t('User.AccountLock')
                    );
                } else {
                    await user.save();
                    throw new HttpException(
                        status.Unauthorized,
                        t('User.emailOrpassword', { count: remainingAttempts })
                    );
                }
            }

            const jwtExpiry = isRememberMe ? REMEMBER_ME_TOKEN_EXPIRY : TOKEN_EXPIRY;
            const expiryDate = new Date(Date.now() + parseDurationToMs(jwtExpiry));

            const { accessToken, refreshToken, sessionId } = createJWT(user, jwtExpiry);
            const hashedRefreshToken = await hashToken(refreshToken);
            const refreshTokenExpiry = new Date(Date.now() + parseDurationToMs(REFRESH_TOKEN_EXPIRY));

            await User.updateOne(
                { _id: user._id },
                {
                    $set: {
                        'accountSetting.lastLogin': new Date(),
                        token: accessToken,
                        refreshToken: hashedRefreshToken,
                        refreshTokenExpiry,
                        tokenExpiry: expiryDate,
                        sessionId,
                        failedLoginAttempts: 0,
                        lockUntil: false,
                        isRememberMe,
                        status: StatusEnum.ACTIVE,
                        hasAcceptedTerms: true
                    },
                }
            );


            return {
                user: {
                    _id: user._id.toString(),
                    email: user.email,
                    fullName: user.fullName,

                    status: StatusEnum.ACTIVE,
                },
                token: accessToken,
                refreshToken,
            };
        } catch (error) {
            console.log(error)
            if (error instanceof HttpException) throw error;

            throw new HttpException(
                status.InternalServerError,
                t('General.error')
            );
        }
    }



    public async logout(userId: string, t: TFunction): Promise<boolean> {
        try {
            if (!userId) {
                throw new HttpException(status.Unauthorized, t('General.not_found', { field: t('User.user') }));
            }

            await User.updateOne(
                { _id: userId },
                {
                    token: null,
                    tokenExpiry: null,
                    refreshToken: null,
                    refreshTokenExpiry: null,
                    sessionId: null,
                    forgotPassword: null,
                    forgotpasswordTokenExpiry: null,
                    status: StatusEnum.INACTIVE,
                    hasAcceptedTerms: false
                }
            );
            return true;
        } catch (error) {
            if (error instanceof HttpException) throw error;
            throw new HttpException(status.InternalServerError, t('General.error'));
        }
    }

    public async forgotPassword(email: string, t: TFunction): Promise<void> {
        try {
            const user = await User.findOne({ email });
            if (!user) {
                throw new HttpException(status.NotFound, t('General.not_found', { field: t('User.email') }));
            }

            const otp = generateOTP(Number(OTP_LENGTH));
            const otpExpiresAt = new Date(Date.now() + parseDurationToMs(OTP_EXPIRY_TIME_MIN));

            const forgotpasswordToken = sign(
                { email, otp, _id: user._id, password: user.accountSetting.passwordHash },
                SECRET_KEY,
                { expiresIn: '5m' }
            );
            const forgotTokenExpiry = new Date(Date.now() + parseDurationToMs(FORGOT_PASSWORD_TOKEN_EXPIRY));

            await Promise.all([
                User.updateOne(
                    { _id: user._id },
                    {
                        otp,
                        otpExpiresAt,
                        otpCreatedAt: new Date(),
                        isVerifiedOtp: false,
                        forgotPassword: forgotpasswordToken,
                        forgotpasswordTokenExpiry: forgotTokenExpiry,
                        isFirstTimeResetPassword: null
                    }
                ),
                sendOtpEmail(user.email, otp, user.accountSetting.userName ?? email, false),
            ]);
        } catch (error) {
            if (error instanceof HttpException) throw error;
            throw new HttpException(status.InternalServerError, t('General.error'));
        }
    }

    public async resendOtp(email: string, t: TFunction): Promise<void> {
        try {
            const user = await User.findOne({ email, isVerifiedOtp: false });
            if (!user) {
                throw new HttpException(
                    status.NotFound,
                    t('General.not_found', { filed: t('User.user') }))

            }

            const otp = generateOTP(Number(OTP_LENGTH));
            const otpExpiresAt = new Date(Date.now() + parseDurationToMs(OTP_EXPIRY_TIME_MIN) * 60 * 1000);

            const forgotpasswordToken = sign(
                { email: user.email, otp, _id: user._id, password: user.accountSetting.passwordHash },
                SECRET_KEY,
                { expiresIn: '5m' }
            );
            const forgotpasswordTokenExpiry = new Date(Date.now() + parseDurationToMs(FORGOT_PASSWORD_TOKEN_EXPIRY));

            await Promise.all([
                User.updateOne(
                    { _id: user._id },
                    {
                        otp,
                        otpExpiresAt,
                        otpCreatedAt: new Date(),
                        isVerifiedOtp: false,
                        forgotPassword: forgotpasswordToken,
                        forgotpasswordTokenExpiry: forgotpasswordTokenExpiry,
                    }
                ),
                sendOtpEmail(user.email, otp, user.accountSetting.userName ?? user.email, true),
            ]);


        } catch (error) {
            if (error instanceof HttpException) throw error;
            throw new HttpException(status.InternalServerError, t('General.error'));
        }
    }

    public async verifyOTP(email: string, otp: string, t: TFunction): Promise<void> {
        try {
            if (!email || !otp) {
                throw new HttpException(
                    status.BadRequest,
                    t('General.invalid', { field: t('User.otp') })
                );
            }
            const user = await User.findOne({ email, isVerifiedOtp: false });
            if (!user) {
                throw new HttpException(
                    status.NotFound,
                    t('General.invalid', { field: t('User.email') })
                );
            }

            verifyJWT(user.forgotPassword, t);

            if (user.forgotpasswordTokenExpiry && new Date() > user.forgotpasswordTokenExpiry) {
                throw new HttpException(status.Unauthorized, t('General.invalid', { field: t('User.token') }));
            }

            if (new Date() > user.otpExpiresAt) {
                await User.updateOne(
                    { _id: user._id },
                    { otp: null, otpExpiresAt: null, otpCreatedAt: null }
                );
                throw new HttpException(status.BadRequest, t('User.otpExpired'));
            }
            if (user.otp !== otp) {
                throw new HttpException(status.BadRequest, t('General.invalid', { field: t('User.otp') }));
            }

            await User.updateOne(
                { _id: user._id },
                {
                    otp: null,
                    otpExpiresAt: null,
                    otpCreatedAt: null,
                    isVerifiedOtp: true,
                    isVerifyOtpAt: new Date(),
                    isFirstTimeResetPassword: null
                }
            );
        } catch (error) {
            if (error instanceof HttpException) throw error;
            throw new HttpException(status.InternalServerError, t('General.error'));
        }
    }

    public async resetPassword(
        email: string,
        newPassword: string,
        confirmPassword: string,
        t: TFunction
    ): Promise<void> {
        try {
            const [user, passwordHash] = await Promise.all([
                User.findOne({ email, isVerifiedOtp: true }),
                hashPassword(newPassword),
            ]);

            if (!user) {
                throw new HttpException(status.Unauthorized, t('General.invalid', { field: t('User.user') }));
            }

            const resetWindowExpiry = new Date(
                user.isVerifyOtpAt.getTime() + parseDurationToMs(RESET_WINDOW_MINUTES)
            );


            if (new Date() > resetWindowExpiry && user.isFirstTimeResetPassword !== true) {
                throw new HttpException(status.Unauthorized, t('General.invalid', { field: t('User.token') }));
            }

            if (!newPassword || !confirmPassword) {
                throw new HttpException(status.BadRequest, t('General.invalid', { field: t('User.password') }));
            }

            if (newPassword !== confirmPassword) {
                throw new HttpException(
                    status.BadRequest,
                    t('General.does_not_match', { field: t('User.password'), match: t('User.match') })
                );
            }

            const isValidPassword = isPasswordSecure(newPassword);
            if (!isValidPassword) {
                throw new HttpException(status.BadRequest, t('User.passwordInvalid'));
            }

            if (await comparePassword(newPassword, user.accountSetting.passwordHash)) {
                throw new HttpException(status.BadRequest, t('User.YouCanNotUsePrevious'));
            }


            const updateFields: any = {
                'accountSetting.passwordHash': passwordHash,
                passwordUpdatedAt: new Date(),
            };


            await User.updateOne(
                { _id: user._id },
                {
                    $set: updateFields,
                    $unset: {
                        isVerifiedOtp: "",
                        isVerifyOtpAt: "",
                        forgotPassword: "",
                        forgotpasswordTokenExpiry: "",
                        token: "",
                        tokenExpiry: "",
                        refreshToken: "",
                        refreshTokenExpiry: "",
                        sessionId: "",
                        isFirstTimeResetPassword: "",
                        failedLoginAttempts: "",
                        lockUntil: false,
                    }
                }
            );





        } catch (error) {
            console.log(error)
            if (error instanceof HttpException) throw error;
            throw new HttpException(status.InternalServerError, t('General.error'));
        }
    }


    public async refreshAccessToken(refreshToken: string, t: TFunction): Promise<{ accessToken: string; refreshToken: string }> {
        try {
            const decoded = verifyJWT(refreshToken, t, REFRESH_TOKEN);
            const user = await User.findById(decoded._id)

            if (!user || !user.refreshToken || !user.sessionId) {
                throw new HttpException(status.Unauthorized, t('General.invalid', { field: t('User.refreshToken') }));
            }

            if (user.sessionId !== decoded.sessionId) {
                throw new HttpException(status.Unauthorized, t('General.sessionExpired'));
            }

            const isValidRefreshToken = await compareToken(refreshToken, user.refreshToken);
            if (!isValidRefreshToken) {
                throw new HttpException(status.Unauthorized, t('General.invalid', { field: t('User.refreshToken') }));
            }

            if (user.refreshTokenExpiry && new Date() > user.refreshTokenExpiry) {
                await User.updateOne(
                    { _id: user._id },
                    { refreshToken: null, refreshTokenExpiry: null, sessionId: null }
                );
                throw new HttpException(status.Unauthorized, t('General.invalid', { field: t('User.refreshToken') }));
            }

            const { accessToken, refreshToken: newRefreshToken, sessionId } = createJWT(user, TOKEN_EXPIRY);
            const hashedNewRefreshToken = await hashToken(newRefreshToken);
            const newRefreshTokenExpiry = new Date(Date.now() + parseDurationToMs(REFRESH_TOKEN_EXPIRY));
            const tokenEx = user.isRememberMe ? parseDurationToMs(REMEMBER_ME_TOKEN_EXPIRY) : parseDurationToMs(TOKEN_EXPIRY);

            await User.updateOne(
                { _id: user._id },
                {
                    token: accessToken,
                    refreshToken: hashedNewRefreshToken,
                    refreshTokenExpiry: newRefreshTokenExpiry,
                    sessionId,
                    tokenExpiry: new Date(Date.now() + tokenEx),
                }
            );

            return { accessToken, refreshToken: newRefreshToken };
        } catch (error) {
            if (error instanceof HttpException) throw error;
            throw new HttpException(status.Unauthorized, t('General.invalid', { field: t('User.refreshToken') }));
        }
    }

}
