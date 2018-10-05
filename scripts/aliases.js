#!/usr/bin/env node
const program = require('commander');
const fs = require('fs');
const glob = require('glob');
const parser = require('jsdoc3-parser');
const os = require('os');

/**
 * write to file callback
 * @param {String} err - null|String if there is an error while writing to file
 */
const writeToFileCallback = (err) => {
    if (err) {
        console.error('Error while creating translation files : %s', err);
    }
};

let aliasesCreated = 0;
/**
 * clear previously created aliases
 */
const clearAliases = () => {
    fs.writeFile('src/index.js', '', 'utf8', writeToFileCallback);
    aliasesCreated = 0;
};

/**
 * write aliases import and export statements into aliases.js file as global variable
 * @param {String[]} _imports
 * @param {String[]} _exports
 * @param {String[]} _aliases
 */
const writeAliases = (_imports, _exports, _aliases) => {
    for (let i = 0; i < _imports.length; i++) {
        fs.appendFileSync('src/index.js', _imports[i], 'utf8', writeToFileCallback);
    }

    for (let i = 0; i < _exports.length; i++) {
        fs.appendFileSync('src/index.js', `${_exports[i]}`, 'utf8', writeToFileCallback);
    }

    fs.appendFileSync('src/index.js', `export default {${os.EOL}`, 'utf8', writeToFileCallback);
    for (let i = 0; i < _aliases.length; i++) {
        fs.appendFileSync('src/index.js', `${_aliases[i]},${os.EOL}`, 'utf8', writeToFileCallback);
    }
    fs.appendFileSync('src/index.js', `};${os.EOL}`, 'utf8', writeToFileCallback);
};

/**
 * create alias import and export statements
 * @param {String} profile - current profile to create aliases for
 * @param {String} alias - alias name for current service
 * @param {String} name - service name
 * @param {String} file - service path
 * @param {Array<String>} _imports - import statements
 * @param {Array<String>} _exports - export statements
 * @param {Array<String>} _aliases - aliases statements
 * @param {Number} length - length of vendor services
 */
const createAlias = (profile, alias, name, file, _imports, _exports, _aliases, length) => {
    if (alias && name) {
        const fileRelativePath = file.replace('src', '.');
        const filePathWithoutJs = fileRelativePath.replace('.js', '');
        _imports.push(`import ${name} from '${filePathWithoutJs}';${os.EOL}`);

        let currentExport = `const ${alias} = new ${name}()`;
        currentExport = length > 0 ? `${currentExport};` : currentExport;
        _exports.push(currentExport + os.EOL);

        _aliases.push(alias);
        aliasesCreated++;
    }
};

/**
 * create an alias for a vendor specific implementation using it's jsdoc
 * @param {String} profile
 * @param {String} file
 * @param {Array<String>} _imports
 * @param {Array<String>} _exports
 * @param {Array<String>} _aliases
 * @param {Number} filesLength
 * @param {Object} error
 * @param {Object} ast
 */
const createVendorAlias = (profile, file, _imports, _exports, _aliases, filesLength, error, ast) => {
    createAlias(profile, ast[0].alias, ast[0].name, file, _imports, _exports, _aliases, filesLength);
    if (filesLength === aliasesCreated) {
        writeAliases(_imports, _exports, _aliases);
    }
};

/**
 * find vendor implementations for services
 * @param {String} profile - current profile to create aliases for
 * @param {Array<String>} _imports - import statements
 * @param {Array<String>} _exports - export statements
 * @param {Array<String>} _aliases
 */
const findVendorFilesFor = (profile, _imports, _exports, _aliases) => {
    const managers = glob.sync('src/managers/**/*.js');
    let files = glob.sync(`src/vendors/${profile}/services/**/*.js`);
    if (files && files.length > 0) {
        if (managers && managers.length > 0) {
            // add managers into aliases
            files = files.concat(managers);
        }
        const filesLength = files.length;
        for (let i = 0; i < filesLength; i++) {
            const currentFile = files[i];
            parser(currentFile, createVendorAlias.bind(null, profile, currentFile, _imports, _exports, _aliases, filesLength));
        }
    }
};

/**
 * main algorithm for this program
 * gets profile and create aliases for services for that profile
 * @param {String} profile - current profile to create aliases for
 */
const runnable = (profile) => {
    clearAliases();
    const _imports = [];
    const _exports = [];
    const _aliases = [];
    findVendorFilesFor(profile, _imports, _exports, _aliases);
};

program
    .version('1.0.0')
    .usage('node scripts/aliases.js <profile>')
    .arguments('<profile>')
    .action(runnable)
    .parse(process.argv);
