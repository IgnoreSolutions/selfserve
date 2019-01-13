import Selfserve from './Selfserve';
import * as BlogController from './controllers/BlogController';
import {Router} from 'express';
import * as TestingController from './controllers/testing';
import { ServerAuth } from './BlogBackend_Mongo';

const cms: Selfserve = new Selfserve();

/**
 * Modify this array to add more routes/endpoints to Express.
 */
const routes:any[] = [
    BlogController,
    TestingController
]

routes.forEach((route: any) => {
    console.log("adding route: " + route.Endpoint);
    if(route.Endpoint.trim())
    {
        if(typeof(route.Controller) == typeof(Router))
            cms.useRouter(route.Endpoint, route.Controller);
    }
});

try
{
    ServerAuth.initServerAuth();
    cms.startServer();
}
catch(exc)
{
    console.log('a critical error has happened');
    console.log(exc);
    console.log('fix it axiom@ignoresolutions.xyz');
}