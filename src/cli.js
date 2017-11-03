#!/usr/bin/env node

const program = require('commander')
const textScript = require('./index')

program
  .version('0.1.0')

program.command('* <file>')
  .description('Run text scripts')
  .action((file) => {
    console.log(`Running file ${file}`)
    textScript(file)
  })

program.parse(process.argv)
