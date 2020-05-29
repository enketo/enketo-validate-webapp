document.addEventListener( 'DOMContentLoaded', () => {
    document.querySelector( '#submit' ).onclick = submit;
    document.querySelector( '#file' ).onchange = disenable;
} );

function disenable( evt ) {
    const file = evt.target.files[ 0 ];
    document.querySelector( '#submit' ).disabled = !file;
}

function submit( evt ) {
    let xhr;
    let formData;
    const form = evt.target.closest( 'form' );
    const fileInput = form.querySelector( '#file' );
    const file = fileInput.files[ 0 ];

    if ( file ) {
        xhr = new window.XMLHttpRequest();
        formData = new window.FormData();
        formData.append( fileInput.name, file );
        xhr.open( 'POST', form.action );

        xhr.onload = () => {
            if ( xhr.status === 200 ) {
                handleResponse( xhr.response );
            } else if ( xhr.status !== 200 ) {
                console.log( `Request failed.  Returned status of ${xhr.status}` );
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
    const enketo = response.enketo || {};
    const odk = response.odk || {};

    enketo.result = createMessage( enketo );
    odk.result = createMessage( odk );

    renderResult( document.querySelector( '.result__enketo' ), enketo.errors, enketo.result, enketo.version, enketo.duration );
    renderResult( document.querySelector( '.result__odk' ), odk.errors, odk.result, odk.version, odk.duration );
}

function createMessage( result ) {
    if ( !result ) {
        return '';
    }
    let message = result.warnings && result.warnings.length ? [ 'Warnings:' ].concat( result.warnings ).concat( '\n\n' ).join( '\n\n' ) : '';
    message += result.errors && result.errors.length ? [ 'Errors:' ].concat( result.errors ).join( '\n\n' ) : '';
    return message;
}

function renderResult( el, errors, content, version, duration ) {
    if ( !el ) {
        return;
    }
    const invalid = errors && errors.length;
    el.classList.remove( 'valid', 'invalid' );
    el.classList.add( invalid ? 'invalid' : 'valid' );
    el.querySelector( 'pre' ).textContent = content + ( invalid ? '' : 'XForm is valid!' );
    el.querySelector( '.version' ).textContent = version ? ` (v${version})` : '';
    el.querySelector( 'footer' ).textContent = duration ? `validation time: ${Math.round(duration/10)/100} seconds` : '';
}