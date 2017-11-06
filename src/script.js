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
   * @param {string} file
   */
  addCommand(headers, commands, file) {
    const headerArray = headers.constructor === Array ? headers : [headers]
    headerArray.forEach((name) => {
      this.commands[name.toLowerCase()] = input => commands(input)
    })
  }

  /**
   * @argument {string} name
   * @argument {string} file
   */
  runCommand(name, file, input) {
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
      parametr: name.substr(command.length).trim(),
      previous: input,
    })
  }

  /**
   * Process lines, create function or run commands on lines
   */
  processBlock(lines, file, input) {
    const separatorLine = lines.findIndex(i => /^---/.test(i))
    if (separatorLine > 0) {
      const headers = lines.slice(0, separatorLine)
      // this.addCommand(headers, lines.slice(separatorLine + 1), file)
      this.addCommand(
        headers,
        // (i) => {
        //   lines.slice(separatorLine + 1).forEach(line => this.runCommand(line, file, i))
        // }
        () => this.processBlock(lines.slice(separatorLine + 1), file, input)
        , file,
      )
    } else {
      lines.forEach(command => this.runCommand(command, file, input))
    }
  }
}

module.exports = TextScript
