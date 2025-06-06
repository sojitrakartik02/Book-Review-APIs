import { BookRoute } from 'Modules/Book/routes/book.routes'
import { App } from './app'
import { AuthRoute } from './Modules/Auth/routes/auth.route'
import { ReviewRoute } from 'Modules/Review/routes/review.route'


const app = new App([
    new AuthRoute(),

    new BookRoute(),
    new ReviewRoute()

])


app.listen()   