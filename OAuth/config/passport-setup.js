import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import db from "./database-setup.js"
import env from "dotenv";
env.config();

passport.serializeUser((user, done) => {
    done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
    const user = await db.query("SELECT * FROM users WHERE id = $1", [id]);
    done(null, user.rows[0]);
});

passport.use(new GoogleStrategy(
    {
        callbackURL: '/auth/google/redirect',
        clientID: process.env.clientID,
        clientSecret: process.env.clientSecret
    },
    async (accessToken, refreshToken, profile, done) => {
        const name = profile.name.givenName;
        const google_id = profile.id;
        const picture = profile.photos[0].value;
        const email = profile.emails[0].value;

        const result = await db.query("select * from users where google_id= $1", [google_id]);
        if (result.rows.length > 0) {
            done(null, result.rows[0]);
        } else {
            const newUser = await db.query(
                "INSERT INTO users (email, name, google_id, image) VALUES ($1, $2, $3, $4) RETURNING *",
                [email, name, google_id, picture]
            );
            done(null, newUser.rows[0]);
        }
    }));

export default passport;