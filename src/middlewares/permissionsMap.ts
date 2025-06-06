export const routePermissionsMap = {
    '/role': {
        GET: 'role_manage',
        POST: 'role_manage',
        PUT: 'role_manage',
        DELETE: 'role_manage',
    },
    '/permission': {
        GET: 'role_manage',
        POST: 'role_manage',
        PUT: 'role_manage',
        DELETE: 'role_manage',
    },
    '/labour': {
        GET: 'labourer_view',
        POST: 'labourer_create',
        PUT: 'labourer_edit',
        DELETE: 'labourer_delete',
    },
    '/user': {
        POST: 'user_manage',
        GET: 'user_manage',
        PUT: 'user_manage',
        DELETE: 'user_manage'
    },
    '/user/grant': {
        POST: 'role_manage'
    },
    '/user/revoke': {
        POST: 'role_manage',
    },
    '/user/restrict': {
        POST: 'role_manage',
    },
    '/user/permissions': {
        GET: 'role_manage',
    },
    '/labour/verify': {
        POST: 'labour_verification'
    }

};
