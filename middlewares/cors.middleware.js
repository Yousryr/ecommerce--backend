const cors = require('cors');
const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || [];

const corsOptions = {
    origin: function (origin, callback) {
        if (!origin) {
            return callback(null, true);
        } else {
            if (allowedOrigins.includes(origin) || allowedOrigins.length === 0) {
                return callback(null, true);
            } else {
                return callback(new Error('CORS policy: origin not allowed'));
            }
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
};

module.exports = cors(corsOptions);
