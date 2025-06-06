import { checkPermissions } from './authMiddleware';
import { routePermissionsMap } from './permissionsMap';

export const permissionInjector = (path: string, method: string) => {
    const normalizedMethod = method.toUpperCase();
    const permission = routePermissionsMap[path]?.[normalizedMethod]
    if (!permission) {
        return (req, res, next) => next();
    }

    return checkPermissions([permission]);
};
