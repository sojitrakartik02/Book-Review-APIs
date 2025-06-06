import { App } from './app'
import { AuthRoute } from './Modules/Auth/routes/auth.route'
import { userManagementRoute } from 'Modules/userManagement/routes/userManagement.route'


const app = new App([
    new AuthRoute(),

    new userManagementRoute(),

])


app.listen()   