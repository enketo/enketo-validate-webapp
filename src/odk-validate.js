'use strict';

const execFile = require( 'child_process' ).execFile;
const tmp = require( 'tmp' );
const fs = require( 'fs' );

function validate( xform ) {
    return _saveTmpFile( xform )
        .then( _runODKValidateJar );
}

function _runODKValidateJar( xformPath ) {
    return new Promise( ( resolve, reject ) => {
        execFile( 'java', [ '-jar', 'lib/ODK_Validate_1.7.0.jar', xformPath ], ( error, stdout, stderr ) => {
            let warnings = [];
            let errors = [];
            let messages = _cleanupErrors( stderr );
            if ( error ) {
                if ( messages.length ) {
                    errors = messages;
                } else {
                    errors = [ error.message || 'An unknown error occurred while running ODK Validate' ];
                }
            } else {
                warnings = messages;
            }

            resolve( { warnings, errors } );
        } );
    } );
}

/**
 * Save to a temporary file and return the absolute path
 * @param  {string} xform XForm string
 * @return {string}       XForm file path
 */
function _saveTmpFile( xform ) {
    return new Promise( ( resolve, reject ) => {
        tmp.file( ( err, path ) => {
            if ( err ) {
                reject( err );
            }
            fs.appendFile( path, xform );
            resolve( path );
        } );
    } );
}

/**
 * Partially ported from pyxform, though not checked for errors.
 * Excludes xlsform-specific syntax changes of /data/to/node to ${node}
 * 
 * @param  {string} error_message stderr output from ODK Validate
 * @return {<string>}             array of cleanup output lines
 */
function _cleanupErrors( error_message ) {
    let k = [];
    let lastline = '';

    error_message.split( '\n' ).forEach( line => {
        // has a java filename( with line number )
        let has_java_filename = line.indexOf( '.java:' ) !== -1;
        // starts with '    at java class path or method path'
        let is_a_java_method = line.indexOf( '\tat' ) !== -1;
        // is the same as the last line
        let is_duplicate = ( line === lastline );

        lastline = line;

        if ( !has_java_filename && !is_a_java_method && !is_duplicate ) {
            // remove java.lang.RuntimeException
            if ( line.startsWith( 'java.lang.RuntimeException: ' ) ) {
                line = line.replace( 'java.lang.RuntimeException: ', '' );
            }
            // remove org.javarosa.xpath.XPathUnhandledException
            if ( line.startsWith( 'org.javarosa.xpath.XPathUnhandledException: ' ) ) {
                line = line.replace( 'org.javarosa.xpath.XPathUnhandledException: ', '' );
            }
            // remove java.lang.NullPointerException
            if ( line.startsWith( 'java.lang.NullPointerException' ) ) {
                return;
            }

            k.push( line );
        }
    } );

    return k;
}


module.exports = {
    validate: validate
};
