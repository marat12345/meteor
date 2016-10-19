import { Mongo } from 'meteor/mongo';
import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import { DDPRateLimiter } from 'meteor/ddp-rate-limiter';

const AUTH_METHODS = [
    'login',
    'logout',
    'logoutOtherClients',
    'removeOtherTokens',
    'configureLoginService',
    'changePassword',
    'forgotPassword',
    'resetPassword',
    'verifyEmail',
    'createUser',
    'loginWithoutPassword',
];

// Only allow 3 login attempts per connection per 1 second
DDPRateLimiter.addRule({
    name(name) {
        return _.contains(AUTH_METHODS, name);
    },

    // Rate limit per connection ID
    connectionId() { return true; },
}, 3, 1000);

const PRED_METHODS = [
    'get_names'
];

// Only allow 2 method queries per connection per 1 second
DDPRateLimiter.addRule({
    name(name) {
        return _.contains(PRED_METHODS, name);
    },

    // Rate limit per connection ID
    connectionId() { return true; },
}, 2, 1000);