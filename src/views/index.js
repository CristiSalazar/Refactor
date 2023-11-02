import express from "express"
import prodRouter from "./router/product.routes.js"
import cartRouter from "./router/carts.routes.js"
import ProductManager from "./controllers/ProductManager.js"
import CartManager from "./controllers/CartManager.js"
import mongoose from "mongoose"
import { engine } from "express-handlebars"
import * as path from "path"
import __dirname from "./utils.js"
import userRouter from "./router/user.routes.js"
import MongoStore from "connect-mongo"
import session from "express-session"
import FileStore from "session-file-store"

const app = express()
const PORT = 8080
const product = new ProductManager()
const cart = new CartManager()
const fileStorage = FileStore(session)

app.use(express.json())
app.use(express.urlencoded({extended: true}))


app.listen(PORT,()=>{console.log("Escuchando en puerto 8080")})

mongoose.connect("mongodb+srv://cristinasalazar125:m123456789@cluster0.tomc32z.mongodb.net/?retryWrites=true&w=majority")
.then(()=>{
    console.log("Conectado a la base de datos")
})
.catch(error => {
    console.error("Error al conectarse a la base de datos" + error)
})

app.use(session({
    store: MongoStore.create({
        mongoUrl: "mongodb+srv://cristinasalazar125:m123456789@cluster0.tomc32z.mongodb.net/?retryWrites=true&w=majority",
        mongoOptions: {useNewUrlParser: true, useUnifiedTopology:true}, ttl: 3600
    }),
    secret: "ClaveSecreta",
    resave: false,
    saveUninitialized: false,
}))

app.use("/api/carts", cartRouter)
app.use("/api/products", prodRouter)
app.use("/api/sessions", userRouter)

app.engine("handlebars", engine())
app.set("view engine", "handlebars")
app.set("views", path.resolve(__dirname + "/views"))

app.get("/products", async(req,res)=>{
    if(!req.session.emailUsuario)
    {
        return res.redirect("/login")
    }
    let allProducts = await product.getProducts()
    allProducts = allProducts.map(product => product.toJSON())
    res.render("viewProducts", {
        title: "vista productos",
        products: allProducts,
        email: req.session.emailUsuario,
        rol: req.session.rolUsuario,
    })
})

app.get("/carts/:cid", async(req,res)=>{
    let id = req.params.cid
    let allCarts = await cart.getCartWithProducts(id)
    res.render("viewCart", {
        title: "vista del carro",
        carts: allCarts
    })
})

app.get("/login", async(req,res)=>{
    res.render("login", {
        title: "vista de login",
    })
})

app.get("/register", async(req,res)=>{
    res.render("register", {
        title: "vista de register",
    })
})

app.get("/profile", async(req,res)=>{
    if(!req.session.emailUsuario)
    {
        return res.redirect("/login")
    }
    res.render("profile", {
        title: "vista de profile",
        first_name: req.session.nomUsuario,
        last_name: req.session.apeUsuario,
        email: req.session.emailUsuario,
        rol: req.session.rolUsuario,
    })
})
