const marked = require('marked');
const fs = require('fs');
const fetch = require('node-fetch');
const pathNode = require('path');
var data;

function validarArchivoODirectorio(path, options) {
  return new Promise((resolve, reject)=>{
    if (!path) { 
      console.log('no hay nada');
    } else {
      if (validarTipo(path) === 'file') {
        console.log(validarMarkDown(path));
        console.log(verLinks(validarMarkDown(path)));
      } else {
        console.log('El archivo es extension ' + validarTipo(path));
      }
    }
  });
}

function validarTipo(path) {
  try {
    let stats = fs.statSync(path);
    if (stats.isFile()) {
      return ('file');
    } else if (stats.isDirectory()) { 
      return ('directory');
    } else {
      return ('otro');
    }
  } catch (err) {
    return ('No es un archivo ni directorio');
  }
};

function validarMarkDown(path) {
  let extensionPermitida = /(\.md)$/i;
  if (!extensionPermitida.exec(path)) {
    return 'No es un archivo .MD';
  } else {
    data = fs.readFileSync(path, 'utf8').split('\n');
    return data;
  }
}

function verLinks(data) {
  let links = data.map(element => markdownLinkExtractor(data));
  links = links.filter(element => element.length !== 0);
  if (links.length !== 0) links = links.reduce((elem1, elem2) => elem1.concat(elem2));
  if (validate) {
    mdLinks.validateUrl(links).then((values) =>{
      if (stats) resolve(mdLinks.stats(values));
      else resolve(values);
    });
  } else resolve(links);
}

// Función necesaria para extraer los links usando marked
// (tomada desde biblioteca del mismo nombre y modificada para el ejercicio)
// Recibe texto en markdown y retorna sus links en un arreglo
function markdownLinkExtractor(markdown) {
  const links = [];

  const renderer = new Marked.Renderer();

  // Taken from https://github.com/markedjs/marked/issues/1279
  const linkWithImageSizeSupport = /^!?\[((?:\[[^\[\]]*\]|\\[\[\]]?|`[^`]*`|[^\[\]\\])*?)\]\(\s*(<(?:\\[<>]?|[^\s<>\\])*>|(?:\\[()]?|\([^\s\x00-\x1f()\\]*\)|[^\s\x00-\x1f()\\])*?(?:\s+=(?:[\w%]+)?x(?:[\w%]+)?)?)(?:\s+("(?:\\"?|[^"\\])*"|'(?:\\'?|[^'\\])*'|\((?:\\\)?|[^)\\])*\)))?\s*\)/;

  Marked.InlineLexer.rules.normal.link = linkWithImageSizeSupport;
  Marked.InlineLexer.rules.gfm.link = linkWithImageSizeSupport;
  Marked.InlineLexer.rules.breaks.link = linkWithImageSizeSupport;

  renderer.link = function(href, title, text) {
    links.push({
      href: href,
      text: text,
      title: title,
    });
  };
  renderer.image = function(href, title, text) {
    // Remove image size at the end, e.g. ' =20%x50'
    href = href.replace(/ =\d*%?x\d*%?$/, '');
    links.push({
      href: href,
      text: text,
      title: title,
    });
  };
  Marked(markdown, {renderer: renderer});

  return links;
};
// validarArchivoODirectorio('./md/text.md','');

module.exports = validarArchivoODirectorio('./md/text.md', '');
