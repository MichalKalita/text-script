#!/usr/bin/env node

const program = require('commander')
const TextScript = require('./script')
const fs = require('fs')
const path = require('path')


function readFile(file, pwd = '') {
  const filePath = path.resolve(pwd, file)
  try {
    return fs.readFileSync(filePath).toString()
  } catch (error) {
    throw new Error(`File '${filePath}' not found`)
  }
}

program
  .version('0.1.0')

program.command('* <file>')
  .description('Run text scripts')
  .action((file) => {
    console.log(`Running file ${file}`)
    const s = new TextScript(file)


    s.addCommand('import', (input) => {
      // Command for include script
      try {
        const content = readFile(input.parametr)

        // block processing
        content.split('\n\n')
          .map(i => i.trim())
          .forEach((block) => {
            const lines = block.split('\n').map(i => i.trim())

            s.processBlock(lines, { file })
          })
      } catch (e) {
        const moduleName = input.command.replace(/^import/i, '').trim()

        let name = /^'?(.*)(\.txt)?'?$/.exec(moduleName)
        name = name === null ? moduleName : name[1]

        const absolutePath = path.resolve(path.dirname(input.file), name)

        // eslint-disable-next-line import/no-dynamic-require, global-require
        require(absolutePath)(input)
      }
    })


    s.runCommand(`import ${file}`, file)
  })

program.parse(process.argv)
