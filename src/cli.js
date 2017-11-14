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

function importFile(input) {
  // Command for include script
  if (input.parametr.endsWith('.txt')) {
    const content = readFile(input.parametr, input.file)

    const nextLevelInput = input
    nextLevelInput.file = input.parametr

    // block processing
    content.split('\n\n')
      .map(i => i.trim())
      .forEach((block) => {
        const lines = block.split('\n').map(i => i.trim())

        this.processBlock(lines, nextLevelInput)
      })
  } else {
    const absolutePath = path.resolve(path.dirname(input.file), input.parametr)

    // eslint-disable-next-line import/no-dynamic-require, global-require
    require(absolutePath)(input)
  }
}

program
  .version('0.1.0')

program.command('* <file>')
  .description('Run text scripts')
  .action((file) => {
    console.log(`Running file ${file}`)
    const s = new TextScript(file)
    const importFileBinded = importFile.bind(s)

    s.addCommand('import', importFileBinded)

    s.runCommand(`import ${file}`, { file: '' })
  })

program.parse(process.argv)
