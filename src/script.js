/**
 * Core module for text scripting
 */
class TextScript {
  constructor() {
    this.commands = {}
  }

  /**
   * Add command to list
   * @param {string[]} headers
   * @param {function} commands
   */
  addCommand(headers, commands) {
    const headerArray = headers.constructor === Array ? headers : [headers]
    headerArray.forEach((name) => {
      this.commands[name.toLowerCase()] = input => commands(input)
    })
  }

  /**
   * Run command from list, command must be added firstly
   * @argument {string} name
   * @argument {object} defaultInput
   */
  runCommand(name, defaultInput = {}) {
    const searchName = `${name.toLowerCase()} `
    const possibleCommands = Object.keys(this.commands)
      .filter(c => searchName.startsWith(`${c} `)) // commands starts with same words

    if (possibleCommands.length === 0) {
      throw new Error(`Command '${name}' not found`)
    }
    const command = possibleCommands.length === 1 ? possibleCommands[0] :
      possibleCommands.reduce((a, b) => ((a.length > b.length) ? a : b))

    const input = defaultInput
    // command name founded in list of commands
    input.command = command
    // source file
    input.file = defaultInput.file
    // used parametr in calling function
    input.parametr = name.substr(command.length).trim()
    // actual level
    input.level = defaultInput.level ? defaultInput.level + 1 : 0
    // input from previous level
    input.levelUp = defaultInput

    this.commands[command](input)
  }

  /**
   * Process lines, create function or run commands on lines
   * @argument {string[]} lines
   * @argument {object} input
   */
  processBlock(lines, input) {
    const separatorLine = lines.findIndex(i => /^---/.test(i))
    if (separatorLine > 0) {
      const headers = lines.slice(0, separatorLine)
      this.addCommand(
        headers,
        () => this.processBlock(lines.slice(separatorLine + 1), input),
      )
    } else {
      lines.forEach(command => this.runCommand(command, input))
    }
  }
}

module.exports = TextScript
