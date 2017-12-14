/* global document, window, console*/
'use strict';

document.addEventListener( 'DOMContentLoaded', function() {
    document.querySelector( '#submit' ).onclick = submit;
    document.querySelector( '#file' ).onchange = disenable;
} );


function disenable( evt ) {
    var file = evt.target.files[ 0 ];
    document.querySelector( '#submit' ).disabled = !file;
}

function submit( evt ) {
    var xhr;
    var formData;
    var form = evt.target.closest( 'form' );
    var fileInput = form.querySelector( '#file' );
    var file = fileInput.files[ 0 ];

    if ( file ) {
        xhr = new window.XMLHttpRequest();
        formData = new window.FormData();
        formData.append( fileInput.name, file );
        xhr.open( 'POST', form.action );

        xhr.onload = function() {
            if ( xhr.status === 200 ) {
                handleResponse( xhr.response );
            } else if ( xhr.status !== 200 ) {
                console.log( 'Request failed.  Returned status of ' + xhr.status );
            }
            form.classList.remove( 'busy' );
        };
        xhr.responseType = 'json';
        xhr.send( formData );
        form.classList.add( 'busy' );
        document.querySelector( '#submit' ).disabled = true;
    }

    return false;
}

function handleResponse( response ) {
    var enketo = response.enketo || {};
    var odk = response.odk || {};

    enketo.result = createMessage( enketo );
    odk.result = createMessage( odk );

    renderResult( document.querySelector( '.result__enketo' ), enketo.errors, enketo.result );
    renderResult( document.querySelector( '.result__odk' ), odk.errors, odk.result );
}

function createMessage( result ) {
    var message = result.warnings && result.warnings.length ? [ 'Warnings:' ].concat( result.warnings ).concat( '\n\n' ).join( '\n' ) : '';
    message += result.errors && result.errors.length ? [ 'Errors:' ].concat( result.errors ).join( '\n\n' ) : '';
    return message;
}

function renderResult( el, errors, content ) {
    var invalid = errors && errors.length;
    el.classList.remove( 'valid', 'invalid' );
    el.classList.add( invalid ? 'invalid' : 'valid' );
    el.querySelector( 'pre' ).textContent = content + ( invalid ? '' : 'XForm is valid!' );
}
