
// passport in config 

import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import AuthService from "../services/implementation/AuthService";
import dotenv from "dotenv";
dotenv.config();

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      callbackURL: process.env.GOOGLE_CALLBACK_URL!,
    },
    async (token, _refreshToken, profile, done) => {
      try {
        const user = await AuthService.findOrCreate(profile);

        if (!user) {
          return done(null, false); 
        }

        done(null, user as Express.User); 
      } catch (error) {
        done(error, false);
      }
    }
  )
);
