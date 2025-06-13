const escapeHTML = (() => {
    const txtNode = document.createTextNode('');
    const txtParent = document.createElement('span');
    txtParent.appendChild(txtNode);
    return function (text) {
        txtNode.nodeValue = text;
        return txtParent.innerHTML;
    }
})();

function slugify(text) {
  return text
    .toString()                           // Cast to string (optional)
    .normalize('NFKD')            // The normalize() using NFKD method returns the Unicode Normalization Form of a given string.
    .toLowerCase()                  // Convert the string to lowercase letters
    .trim()                                  // Remove whitespace from both sides of a string (optional)
    .replace(/\s+/g, '-')            // Replace spaces with -
    .replace(/[^\w\-]+/g, '')     // Remove all non-word chars
    .replace(/\-\-+/g, '-');        // Replace multiple - with single -
}

function quoteattr(s, preserveCR) {
    preserveCR = preserveCR ? '&#13;' : '\n';
    return ('' + s) /* Forces the conversion to string. */
        .replace(/&/g, '&amp;') /* This MUST be the 1st replacement. */
        .replace(/'/g, '&apos;') /* The 4 other predefined entities, required. */
        .replace(/"/g, '&quot;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        /*
        You may add other replacements here for HTML only 
        (but it's not necessary).
        Or for XML, only if the named entities are defined in its DTD.
        */ 
        .replace(/\r\n/g, preserveCR) /* Must be before the next replacement. */
        .replace(/[\r\n]/g, preserveCR);
        ;
}

function escapeSingleQuotes(str) {
    return str.replace(/'/g, "\\'");
}

jQuery.fn.prependText = function(txt) {
    return this.prepend(document.createTextNode(txt));
};
jQuery.fn.appendText = function(txt) {
    return this.append(document.createTextNode(txt));
};
