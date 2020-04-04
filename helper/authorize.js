let jwt = require('jsonwebtoken');
let authorize = (roles = []) => {
    // // roles param can be a single role string (e.g. Role.User or 'User') 
    // // or an array of roles (e.g. [Role.Admin, Role.User] or ['Admin', 'User'])
    // if (typeof roles === 'string') {
    //     roles = [roles];
    // }

    return [
        (req, res, next) => {
            var token = req.headers['x-access-token'];
            if (!token)
                return res.status(403).send({ error: 'No token provided.' });

            jwt.verify(token, 'mohitkadel', function(err, decoded) {
                if (err)
                    return res.status(403).send({ error: 'Failed to authenticate token.' });

                // if everything good, save to request for use in other routes
                req.id = decoded.id;
                next();
            })
        },
        (req, res, next) => {
            // if (roles.length && !roles.includes(req.role)) {
            //     // user's role is not authorized
            //     return res.status(401).json({ message: 'User is not Authorized' });
            // }

            // authentication and authorization successful
            next();
        }
    ];
}

module.exports = authorize;