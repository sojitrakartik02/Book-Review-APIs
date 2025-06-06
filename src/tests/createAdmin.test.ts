import { App } from '../app';
import { AuthRoute } from '../Modules/Auth/routes/auth.route';
import User from '../Modules/Auth/models/auth.model';
import Role from '../Modules/Role/models/role.model';
import { connectDatabase } from '../database/index';
import mongoose, { Types } from 'mongoose';
import { hashPassword } from '../utils/helpers/utilities.services';
import { InviteStatusEnum, StatusEnum } from '../Modules/Auth/interfaces/auth.interface';


describe('User Authentication Tests', () => {
    let app: App;

    beforeAll(async () => {
        await connectDatabase();
        app = new App([new AuthRoute()]);

    }, 10000);

    afterAll(async () => {

        await new Promise(resolve => app.httpServer.close(resolve));
        if (mongoose.connection.readyState) {
            await mongoose.connection.close();
        }
    }, 10000);

    it('should login a user, update their own role to admin, and verify', async () => {



        const pmcRole = await Role.findOne({ name: 'Super Admin' })
        const passwordHash = await hashPassword('Kartiksojitra@123');

        const AdminIser = new User({
            email: `kartikninjatechnolabs@gmail.com`,
            fullName: `Kartik sojitra`,
            joiningDate: new Date(),
            roleId: pmcRole._id,
            firstName: 'Kartik',
            lastName: "Ninja",
            inviteStatus: InviteStatusEnum.ACCEPTED,
            invitedAt: new Date(),
            acceptedInviteAt: new Date(),
            isDeleted: false,
            deletedAt: null,
            status: StatusEnum.ACTIVE,
            accountSetting: {
                passwordHash: passwordHash,
                userName: "kartikninja"
            },
            profileImage: new Types.ObjectId('6842873a96591fc3285d0b72')
        });

        await AdminIser.save();

    }, 10000);
});