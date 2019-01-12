import Selfserve from './Selfserve';
import * as BlogController from './controllers/BlogController';
import {Router} from 'express';

const cms: Selfserve = new Selfserve();

/**
 * Modify this array to add more routes/endpoints to Express.
 */
const routes:Router[] = [
    BlogController.BlogController
]

routes.forEach((route: Router) => {
    if(typeof(BlogController.BlogController) == typeof(Router))
        cms.useRouter(BlogController.Endpoint, route);
});

try
{
    cms.startServer();
}
catch(exc)
{
    console.log('a critical error has happened');
    console.log(exc);
    console.log('fix it axiom@ignoresolutions.xyz');
}