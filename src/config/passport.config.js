import passport from "passport"
import local from "passport-local"
import {createHash, isValidPassword} from "../views/utils.js"
import UserManager from "../controllers/UserManager.js"
import GitHubStrategy from "passport-github2"

const LocalStrategy= local.Strategy
const userMan = new UserManager()

const initializePassword = () => {
    passport.use("register", new LocalStrategy(
        {passReqToCallback: true, usernameField: "email"},
        async (req,username, password,done) => {
            const{first_name, last_name, email, age, rol} =req.body
            try{
                let user = await userMan.findEmail({email: username})
                if(user){
                    console.log("El usuario ya existe")
                    return done(null, false)
                }

                const hashedPassword = await createHash(password)

                const newUser = {
                    first_name,
                    last_name,
                    email,
                    age,
                    password: hashedPassword,
                    rol
                }

                let result = await userMan.addUser(newUser)
                return done(null,result)
            }catch(error){
                return done ("error"+error)
            }
        }))
        passport.serializeUser((user, done)=>{
            done(null, user._id)
        })
        passport.deserializeUser(async (id,done) =>{
            let user = await userMan.getUserById(id)
            done(null,user)
        })

        passport.use("login", new LocalStrategy({usernemeField: "email"}, async(username, password, done) => {
            try{
                const user = await userMan.findEmail({email:username})
                if(!user){
                    console.log("Usuario no existe")
                    return done(null,false)
                }
                if(!isValidPassword(user, password)) return done(null, false)
                return done(null,user)
            }catch(error){
                return done (error)
            }
        }))

        passport.use("github", new GitHubStrategy)({
            clientId : " Iv1.4305a4c43e80a0f9",
            clientSecret: "a3a549dca6a6ad5c38e0b5db934de4c4aadd0e94",
            callbackUrl: "http://localhost:8080/api/sessions/githubcallback"
        }, async (accessToken, refreshToken, profile, done)=>{
            try {
                let user = await userMan.findEmail({email:profile._jason.email})
                if(!user){
                    let newUser={
                        first_name: profile._json.login,
                        last_name: "github",
                        age:30,
                        email:profile._jason.email,
                        password:"",
                        rol: "usuario"
                    }
                    let result= await userMan.addUser(newUser)
                    done(null,result)
                }
                else{
                    done(null,user)
                }
            }catch(error){
                return done (error)
            }
        } )
}

export default initializePassword