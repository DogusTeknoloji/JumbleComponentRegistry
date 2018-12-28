import { Request, Response } from "express";
import AdmZip from 'adm-zip'
import fs from 'fs'
import _ from 'lodash'

export class Routes {
    public set(app: any): void {
        app.route('/')
            .get((req: Request, res: Response) => {
                const registry = require('../../registry.json')

                res.status(200).send(registry.components)
            })

        app.route('/register')
            .post((req: Request, res: Response) => {
                const registry = require('../../registry.json')

                const files = <any>req.files
                if (Object.keys(files).length == 0) {
                    return res.status(400).send({ success: false, data: 'Invalid package.' })
                }

                let pkg = files.pkg

                pkg.mv('./package/package.zip', (err: any) => {
                    if (err)
                        return res.status(500).send({ success: false, data: err })

                    const zip = new AdmZip('./package/package.zip')
                    const componentDefinition = JSON.parse(zip.readAsText('component.json'))
                    const componentName = componentDefinition.name
                    const componentVersion = componentDefinition.version
                    console.log('Version:', componentVersion)
                    const componentDir = `./component/${componentDefinition.name}`
                    if (!fs.existsSync(componentDir)) {
                        fs.mkdirSync(componentDir)
                    }
                    zip.extractAllTo(`${componentDir}/${componentDefinition.version}`)
                    fs.unlinkSync('./package/package.zip')

                    let component = _.find(registry.components, c => c.name === componentName)
                    if (!component) {
                        component = {
                            name: componentName,
                            versions: {}
                        }
                        registry.components.push(component)
                    }
                    component.versions[componentVersion] = {
                        dependencies: componentDefinition.dependencies
                    }

                    fs.writeFileSync('./registry.json', JSON.stringify(registry))

                    return res.send({ success: true })
                })

                return res.status(500)
            })
    }
}