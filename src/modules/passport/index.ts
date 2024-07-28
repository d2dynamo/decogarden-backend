import passport from "passport";
import localStrategy from "./localStrategy";

passport.use(localStrategy);

export default passport;
