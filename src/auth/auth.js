import passport from 'passport';
import LocalStrategy from 'passport-local';
import GStrategy from 'passport-jwt';
import GExtractJwt from 'passport-jwt';
import User from '../models/user.js';

const JwtStrategy = GStrategy.Strategy;
const ExtractJwt = GExtractJwt.ExtractJwt;

passport.use('signup', new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password',
    passReqToCallback: true
}, async (req, email, password, done) => {
    try {
        console.log(req.body);
        const user = await User.create({
            email: email,
            password: password,
            firstname: req.body.firstname,
            lastname: req.body.lastname
        });

        return done(null, user);
    } catch (error) {
        done(error);
    }
}));

passport.use('login', new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password'
}, async (email, password, done) => {
    try {
        const user_item = await User.findOne({where: {email: email}});

        if (!user_item) {
            return done(null, false, {message: 'User not found'});
        }

        const validate = await user_item.IsValidPassword(password);

        if (!validate) {
            return done(null, false, {message: 'Wrong password'});
        }

        return done(null, user_item, {message: 'Logged in Successfully'});
    } catch(error) {
        return done(error);
    }
}));

passport.use(new JwtStrategy ({
    secretOrKey: 'a secret key',
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken()
  }, async (token, done) => {
    try {
        return done(null, token.user);
    } catch (error) {
        done(error);
    }
}));