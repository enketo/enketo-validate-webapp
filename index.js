'use strict';

const port = 3000;
const connect = require( 'connect' );
const http = require( 'http' );
const serveStatic = require( 'serve-static' );
const busboy = require( 'connect-busboy' );
const enketoValidator = require( 'enketo-validate' );
const odkValidator = require( './src/odk-validate' );

let app = connect();

app.use( serveStatic( 'public' ) );
app.use( busboy() );

// Receive an XForm file and validate it in both validators
app.use( '/validate', ( req, res, next ) => {
    let enketo = {};
    let odk = {};
    let xform = '';

    if ( req.busboy && req.url === '/' ) {
        req.busboy.on( 'file', ( fieldname, file ) => {
            file
                .on( 'data', d => xform += d )
                .setEncoding( 'utf8' );
        } );
        req.busboy.on( 'finish', () => {
            const start = Date.now();
            enketo = enketoValidator.validate( xform );
            enketo.duration = Date.now() - start; // TODO: THIS CAN BE REMOVED WHEN ENKETO-VALIDATE STARTS INCLUDING THIS
            odkValidator.validate( xform )
                .then( o => odk = o )
                .catch( e => {
                    console.error( 'something went wrong during ODK Validation', e );
                    odk.errors = [ e ];
                } )
                .then( () => {
                    res.writeHead( 200, { 'Content-Type': 'application/json' } );
                    res.write( JSON.stringify( { enketo, odk } ) );
                    res.end();
                } );

        } );
        req.pipe( req.busboy );
    } else if ( req.busboy && req.url === '/oc' ) {
        req.busboy.on( 'file', ( fieldname, file ) => {
            file
                .on( 'data', d => xform += d )
                .setEncoding( 'utf8' );
        } );
        req.busboy.on( 'finish', () => {
            const start = Date.now();
            enketo = enketoValidator.validate( xform, { openclinica: true } );
            enketo.duration = Date.now() - start;
            res.writeHead( 200, { 'Content-Type': 'application/json' } );
            res.write( JSON.stringify( { enketo } ) );
            res.end();
        } );
        req.pipe( req.busboy );
    } else {
        next();
    }
} );

const server = http.createServer( app ).listen( port );

console.log( `launched server on port: ${port}` );