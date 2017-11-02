const fs = require('fs')
const path = require('path')

const args = process.argv.splice(process.execArgv.length + 2)

function readFile(file, pwd = '') {
  const filePath = path.resolve(pwd, file)
  try {
    const content = fs.readFileSync(filePath)
    return content.toString()
  } catch (error) {
    throw new Error(`File '${filePath}' not found`)
  }
}

function commandImport(module, sourceFile) {
  let name = /^'(.*)'$/.exec(module)
  name = name === null ? module : name[1]

  const absolutePath = path.resolve(path.dirname(sourceFile), `${name}.js`)

  // eslint-disable-next-line import/no-dynamic-require, global-require
  require(absolutePath)()
}

function parseFile(file) {
  const content = readFile(file)

  /*
  header << headers
  header2
  ------- << separator
  Go one
  Go two << commands
  */

  // block processing
  content.split('\n\n')
    .map(i => i.trim())
    .forEach((block) => {
      // command processing
      block.split('\n')
        .map(i => i.trim())
        .forEach((command) => {
          if (command.toLowerCase().startsWith('import')) {
            commandImport(command.replace(/^import/i, '').trim(), file)
          } else {
            console.log(command)
          }
        })
    })
}

parseFile(args[0])
