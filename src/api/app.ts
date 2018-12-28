import express from "express"
import { Routes } from './routes'
import fileupload from 'express-fileupload'

class App {
    public app: express.Application
    public routes = new Routes()

    constructor() {
        this.app = express()
        this.config()
    }

    private config(): void {
        this.app.use(fileupload())
        this.app.use(express.static('./component'))
        this.routes.set(this.app)
    }
}

export default new App().app