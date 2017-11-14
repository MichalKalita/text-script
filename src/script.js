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
   * @argument {object} input
   */
  runCommand(name, input) {
    const searchName = `${name.toLowerCase()} `
    const possibleCommands = Object.keys(this.commands)
      .filter(c => searchName.startsWith(`${c} `)) // commands starts with same words

    if (possibleCommands.length === 0) {
      throw new Error(`Command '${name}' not found`)
    }
    const command = possibleCommands.length === 1 ? possibleCommands[0] :
      possibleCommands.reduce((a, b) => ((a.length > b.length) ? a : b))

    this.commands[command]({
      file: input.file,
      command: name,
      parametr: name.substr(command.length).trim(),
      previous: input,
    })
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
