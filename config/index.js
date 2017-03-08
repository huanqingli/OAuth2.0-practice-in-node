/**
 * Created by Muc on 17/2/21.
 */
module.exports = {
    port: 3002,
    session: {
        secret: 'loginTest',
        key: 'loginTest',
        maxAge: null
    },
    mongodb: 'mongodb://localhost:27017/login_test'
};