import { args, BaseCommand, flags } from '@adonisjs/core/build/standalone'
import { string } from '@ioc:Adonis/Core/Helpers'
import { join } from 'path'

export default class Crud extends BaseCommand {
  public filesTypes = {
    model: 'model',
    controller: 'controller',
  }

  public validators = {
    request: 'request',
  }

  /**
   * Command name is used to run the command
   */
  public static commandName = 'crud'

  /**
   * Command description is displayed in the "help" output
   */
  public static description = 'Generates a whole CRUD flow to your new Entity'

  public static settings = {
    /**
     * Set the following value to true, if you want to load the application
     * before running the command. Don't forget to call `node ace generate:manifest`
     * afterwards.
     */
    loadApp: false,

    /**
     * Set the following value to true, if you want this command to keep running until
     * you manually decide to exit the process. Don't forget to call
     * `node ace generate:manifest` afterwards.
     */
    stayAlive: false,
  }

  @args.string({ description: 'Name of the Entity for CRUD' })
  public name: string

  @flags.boolean({ alias: 'i', description: 'Enable interactive mode' })
  public interactive: boolean

  public async genereteFactory(extendedProps) {
    const name = string.pluralize(string.pascalCase(this.name))
    this.generator
      .addFile(this.name, {
        // force filename to be plural
        form: 'singular',

        // define ".ts" extension when not already defined
        extname: '.ts',

        // re-format the name to "pascalCase"
        pattern: 'pascalcase',

        suffix: 'Factory',
        // Do not pluralize when model name matches one of the following
        formIgnoreList: ['Home', 'Auth', 'Login'],
      })
      .appRoot(this.application.appRoot)
      .destinationDir('database/factories')
      .useMustache()
      .stub(join(__dirname, './templates/factory.txt'))
      .apply({ name, ...extendedProps })
  }

  public async genereteTest(extendedProps) {
    const open = '{'
    const close = '}'

    this.generator
      .addFile(this.name, {
        // force filename to be plural
        form: 'plural',

        // define ".ts" extension when not already defined
        extname: '.spec.ts',

        // re-format the name to "pascalCase"
        pattern: 'camelcase',

        // Do not pluralize when model name matches one of the following
        formIgnoreList: ['Home', 'Auth', 'Login'],
      })
      .appRoot(this.application.appRoot)
      .destinationDir('tests/functional')
      .useMustache()
      .stub(join(__dirname, './templates/test.txt'))
      .apply({ open, close, ...extendedProps })
  }

  public async generateMigration(extendedProps) {
    const name = string.pluralize(string.pascalCase(this.name))
    const tableName = string.pluralize(string.snakeCase(this.name.toLowerCase()))
    this.generator
      .addFile(this.name, {
        // force filename to be plural
        form: 'plural',

        // define ".ts" extension when not already defined
        extname: '.ts',

        // re-format the name to "pascalCase"
        pattern: 'snakecase',

        prefix: `${new Date().getTime()}_`,

        // Do not pluralize when model name matches one of the following
        formIgnoreList: ['Home', 'Auth', 'Login'],
      })
      .appRoot(this.application.appRoot)
      .destinationDir('database/migrations')
      .useMustache()
      .stub(join(__dirname, './templates/migration.txt'))
      .apply({ name, tableName, ...extendedProps })
  }

  /*

  public async generateRoute(extendedProps) {
    const name = string.pluralize(string.pascalCase(this.name))
    const route = string.pluralize(string.dashCase(this.name.toLowerCase()))
    this.generator
      .addFile(this.name, {
        // force filename to be plural
        form: 'plural',

        // define ".ts" extension when not already defined
        extname: '.ts',

        // re-format the name to "pascalCase"
        pattern: 'camelcase',

        // Do not pluralize when model name matches one of the following
        formIgnoreList: ['home', 'auth', 'login', 'signup'],
      })
      .appRoot(this.application.appRoot)
      .destinationDir('start/routes')
      .useMustache()
      .stub(join(__dirname, './templates/route.txt'))
      .apply({ name, route, ...extendedProps })
  }
  */

  public async generateValidators(validatorType, extendedProps) {
    const name = string.singularize(string.pascalCase(this.name))
    const template = './templates/' + validatorType + 'Validator.txt'

    this.generator
      .addFile(name, {
        // force filename to be plural
        form: 'singular',

        // define ".ts" extension when not already defined
        extname: '.ts',

        // re-format the name to "pascalCase"
        pattern: 'pascalcase',

        suffix: string.pascalCase(validatorType) + 'Validator',

        // Do not pluralize when model name matches one of the following
        formIgnoreList: ['Home', 'Auth', 'Login', 'Signup'],
      })
      .appRoot(this.application.appRoot)
      .destinationDir('app/Validators')
      .useMustache()
      .stub(join(__dirname, template))
      .apply({ name, ...extendedProps })
  }

  public async generateCommon(fileType, extendedProps) {
    const name = string.pluralize(string.pascalCase(this.name))
    const folder = string.pluralize(string.pascalCase(fileType))
    const table = string.pluralize(string.snakeCase(this.name.toLowerCase()))

    const destination = 'app/' + (folder === 'Controllers' ? 'Controllers/Http/' : folder)
    const template = './templates/' + fileType + '.txt'

    this.generator
      .addFile(this.name, {
        // force filename to be plural
        form: 'singular',

        // define ".ts" extension when not already defined
        extname: '.ts',

        // re-format the name to "pascalCase"
        pattern: 'pascalcase',

        ...(fileType !== this.filesTypes.model && { suffix: string.pascalCase(fileType) }),

        // Do not pluralize when model name matches one of the following
        formIgnoreList: ['Home', 'Auth', 'Login'],
      })
      .appRoot(this.application.appRoot)
      .destinationDir(destination)
      .useMustache()
      .stub(join(__dirname, template))
      .apply({ name, table, ...extendedProps })
  }

  public async generateFiles(fileType, extendedProps) {
    this.generateCommon(fileType, extendedProps)
  }

  public async run() {
    this.logger.info('Creating CRUD for ' + this.name)

    const PLURAL = string.pluralize(string.snakeCase(this.name).toUpperCase())
    const Plural = string.pluralize(string.pascalCase(this.name))
    const plural = string.pluralize(string.camelCase(this.name))
    const SINGULAR = string.singularize(string.snakeCase(this.name).toUpperCase())
    const Singular = string.singularize(string.pascalCase(this.name))
    const singular = string.singularize(string.camelCase(this.name))

    const extendedProps = { PLURAL, Plural, plural, Singular, singular, SINGULAR }

    this.generateMigration(extendedProps)
    // this.generateRoute(extendedProps)
    this.genereteFactory(extendedProps)
    this.genereteTest(extendedProps)

    await Promise.all(
      Object.values(this.validators).map(async (validatorType) => {
        return this.generateValidators(validatorType, extendedProps)
      })
    )

    await Promise.all(
      Object.values(this.filesTypes).map(async (fileType) => {
        return this.generateFiles(fileType, extendedProps)
      })
    )

    await this.generator.run()
  }
}
