const fs = require('fs')
const path = require('path')

const args = process.argv.splice(2)

function TextScript(_file) {
  this.file = _file
  this.commands = {}

  this.commands.import = (input) => {
    const moduleName = input.command.replace(/^import/i, '').trim()

    let name = /^'(.*)'$/.exec(moduleName)
    name = name === null ? moduleName : name[1]

    const absolutePath = path.resolve(path.dirname(input.file), `${name}.js`)

    // eslint-disable-next-line import/no-dynamic-require, global-require
    require(absolutePath)()
  }

  this.readFile = (file, pwd = '') => {
    const filePath = path.resolve(pwd, file)
    try {
      return fs.readFileSync(filePath).toString()
    } catch (error) {
      throw new Error(`File '${filePath}' not found`)
    }
  }

  this.addCommand = (headers, commands, file) => {
    const headerArray = headers.constructor === Array ? headers : [headers]
    headerArray.forEach((name) => {
      this.commands[name.toLowerCase()] = () => this.processBlock(commands, file)
    })
  }

  /**
   * @argument {string} name
   * @argument {string} file
   */
  this.runCommand = (name, file) => {
    const searchName = `${name.toLowerCase()} `
    const possibleCommands = Object.keys(this.commands)
      .filter(c => searchName.startsWith(`${c} `)) // commands starts with same words

    if (possibleCommands.length === 0) {
      throw new Error(`Command '${name}' not found`)
    }
    const command = possibleCommands.length === 1 ? possibleCommands[0] :
      possibleCommands.reduce((a, b) => ((a.length > b.length) ? a : b))

    this.commands[command]({
      file,
      command: name,
    })
  }

  /**
   * Process lines, create function or run commands on lines
   */
  this.processBlock = (lines, file) => {
    const separatorLine = lines.findIndex(i => /^---/.test(i))
    if (separatorLine > 0) {
      const headers = lines.slice(0, separatorLine)
      this.addCommand(headers, lines.slice(separatorLine + 1), file)
    } else {
      lines.forEach(command => this.runCommand(command, file))
    }
  }

  this.parseFile = (file) => {
    const content = this.readFile(file)

    // block processing
    content.split('\n\n')
      .map(i => i.trim())
      .forEach((block) => {
        const lines = block.split('\n').map(i => i.trim())

        this.processBlock(lines, file)
      })
  }

  this.parseFile(this.file)
}

TextScript(args[0])

module.exports = TextScript
