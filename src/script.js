/**
 * Core module for text scripting
 */
class TextScript {
  constructor(_file) {
    this.file = _file
    this.commands = {}
  }

  /**
   *
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
   */
  processBlock(lines, input) {
    const separatorLine = lines.findIndex(i => /^---/.test(i))
    if (separatorLine > 0) {
      const headers = lines.slice(0, separatorLine)
      // this.addCommand(headers, lines.slice(separatorLine + 1), file)
      this.addCommand(
        headers,
        // (i) => {
        //   lines.slice(separatorLine + 1).forEach(line => this.runCommand(line, file, i))
        // }
        () => this.processBlock(lines.slice(separatorLine + 1), input),
      )
    } else {
      lines.forEach(command => this.runCommand(command, input))
    }
  }
}

module.exports = TextScript
