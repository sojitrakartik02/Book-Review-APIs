import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../../Auth/services/auth.service';
import Container from 'typedi';
import { status, jsonStatus } from '../../../utils/helpers/api.responses';
import { pick, removenull, verifyJWT } from '../../../utils/helpers/utilities.services';
import { HttpException } from '../../../utils/exceptions/httpException';

export class AuthController {
    public authService = Container.get(AuthService);

    public signup = async (req: Request, res: Response, next: NextFunction) => {
        try {
            req.body = pick(req.body, ['email', 'username', 'password']);
            removenull(req.body);

            const { email, username, password } = req.body;

            const { user, token } = await this.authService.signup(email, username, password, req.t);
            return res.status(status.Create).json({
                status: jsonStatus.Create,
                message: req.t('User.succ_signup'),
                data: {
                    ...user,
                    accessToken: token,
                },
            });
        } catch (error) {
            next(error);
        }
    };

    public login = async (req: Request, res: Response, next: NextFunction) => {
        try {
            req.body = pick(req.body, ['email', 'password', 'isRememberMe', 'hasAcceptedTerms']);
            removenull(req.body);
            const { email, password, isRememberMe = false, hasAcceptedTerms } = req.body;

            const { user, token: accessToken, refreshToken } = await this.authService.login(email.toLowerCase(), password, isRememberMe, hasAcceptedTerms, req.t);
            return res.status(status.OK).json({
                status: jsonStatus.OK,
                message: req.t('User.succ_login'),
                data: {
                    ...user,
                    accessToken,
                    refreshToken,
                },
            });
        } catch (error) {
            next(error);
        }
    };

    public forgotPassword = async (req: Request, res: Response, next: NextFunction) => {
        try {
            req.body = pick(req.body, ['email']);
            removenull(req.body);

            const { email } = req.body;
            await this.authService.forgotPassword(email, req.t);
            return res.status(status.OK).json({
                status: jsonStatus.OK,
                message: req.t('User.OTP_sent_succ'),
            });
        } catch (error) {
            next(error);
        }
    };

    public resendOtp = async (req: Request, res: Response, next: NextFunction) => {
        try {
            req.body = pick(req.body, ['email']);
            removenull(req.body);

            const { email } = req.body;
            await this.authService.resendOtp(email, req.t);
            return res.status(status.OK).json({
                status: jsonStatus.OK,
                message: req.t('User.resentotp'),
            });
        } catch (error) {
            next(error);
        }
    };

    public verifyOTP = async (req: Request, res: Response, next: NextFunction) => {
        try {
            req.body = pick(req.body, ['otp', 'email']);
            removenull(req.body);

            const { email, otp } = req.body;
            await this.authService.verifyOTP(email, otp, req.t);
            return res.status(status.OK).json({
                status: jsonStatus.OK,
                message: req.t('User.verification_success'),
            });
        } catch (error) {
            next(error);
        }
    };

    public resetPassword = async (req: Request, res: Response, next: NextFunction) => {
        try {
            req.body = pick(req.body, ['newPassword', 'confirmPassword', 'email', 'token']);
            removenull(req.body);

            let { newPassword, confirmPassword, email, token } = req.body;

            if (!email && token) {
                const decoded = verifyJWT(token, req.t) as { email: string };
                email = decoded.email;
            }

            await this.authService.resetPassword(email, newPassword, confirmPassword, req.t);
            return res.status(status.OK).json({
                status: jsonStatus.OK,
                message: req.t('User.reset_password'),
            });
        } catch (error) {
            next(error);
        }
    };


    public logout = async (req: Request, res: Response, next: NextFunction) => {
        try {
            if (!req.user) {
                throw new HttpException(status.Unauthorized, req.t('General.invalid', { field: req.t('User.user') }));
            }

            await this.authService.logout(req.user._id, req.t);
            return res.status(status.OK).json({
                status: jsonStatus.OK,
                message: req.t('User.succ_logout'),
            });
        } catch (error) {
            next(error);
        }
    };

    public refreshToken = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { refreshToken } = req.body;
            const data = await this.authService.refreshAccessToken(refreshToken, req.t);
            return res.status(status.OK).json({
                status: jsonStatus.OK,
                message: req.t('User.refresh_success'),
                data,
            });
        } catch (error) {
            next(error);
        }
    };
}