ODK XForm Validation web application
==============

A simple application that provides a web interface for the following [ODK XForm](https://opendatakit.github.io/xforms-spec/) validators:

1. [Enketo Validate](https://github.com/enketo/enketo-validate)
2. [ODK Validate](http://docs.opendatakit.org/validate/)

See live here: [validate.enketo.org](https://validate.enketo.org)

This app is not production-ready and is not meant to be. It was meant as tool for the development of [Enketo Validate](https://github.com/enketo/enketo-validate) to provide an easier way for testers to compare the tools without having to use the command-line.

### Pre-requisites

1. NodeJS version as required by [Enketo Validate](https://github.com/enketo/enketo-validate)
2. Java version as required by [ODK Validate](http://docs.opendatakit.org/validate/)

### Install

1. Clone repo
2. Run `npm install`

### Use

1. `npm start` 
2. go to http://localhost:3000
