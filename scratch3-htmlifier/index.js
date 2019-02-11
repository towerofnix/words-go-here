'use strict';

process.on('unhandledRejection', error => {
    console.log('unhandled error:', error);
    process.exit(1);
});

const fetch = require('node-fetch');
const runBenchmark = require('./hacky-file-getter');
const util = require('util');
const fs = require('fs');
const readFile = util.promisify(fs.readFile);
const { minify } = require('terser');

const scratchURLs = [
  'https://llk.github.io/scratch-vm/vendor.js',
  'https://llk.github.io/scratch-vm/scratch-storage.js',
  'https://llk.github.io/scratch-vm/scratch-render.js',
  'https://llk.github.io/scratch-vm/scratch-svg-renderer.js',
  'https://llk.github.io/scratch-vm/scratch-vm.js',
  './benchmark.js'
];

function getDataURL(url) {
  return fetch(url).then(r => r.buffer()).then(b => 'data:application/octet-stream;base64,' + b.toString('base64'));
}

function minifyScripts(scripts) { // so the "Minifying..." log shows
    console.log('Minifying...');
    const result = minify(scripts, {});
    if (result.error) {
        console.log('Error during minifying:', result.error);
        return result;
    } else {
        console.log('Minified:', result.code.length);
        return result;
    }
}

function downloadAsHTML(title, id, username, quick = false, log = console.log) {
  log('Getting asset URLs...');
  return runBenchmark(id).then(({assets, projectJSON}) => {
    log('Getting assets...');
    return Promise.all([
      Promise.all((quick ? ['./benchmark.js'] : scratchURLs).map(url => {
        if (url.startsWith('./')) {
          return readFile(url).then(r => r.toString());
        } else {
          return fetch(url).then(r => r.text());
        }
      })).then(scripts => {
        log('Scratch scripts obtained...');
        return scripts.join('\n');
      }),
      readFile(quick ? './template-quick.html' : './template.html').then(r => r.toString()),
      getDataURL(projectJSON).then(data => projectJSON = data),
      ...Object.keys(assets).map(assetId => getDataURL(assets[assetId]).then(data => assets[assetId] = data))
    ]).then(async ([scripts, html]) => {
      scripts = `const PROJECT_JSON = "${projectJSON}";\nconst ASSETS = ${JSON.stringify(assets)};\nconst DESIRED_USERNAME = ${JSON.stringify(username)};\n` + scripts;
      if (!quick) {
        log('Minifying...');
        scripts = await minifyScripts(scripts);
        if (scripts.error) throw scripts.error;
        else scripts = scripts.code;
      }
      log('Done!');
      return html.replace('{TITLE}', () => title).replace('{SCRIPTS}', () => scripts);
        // using function because $& will get set to '{SCRIPTS}' >:(
    });
  });
}

const title = "Deltarune Test";
const id = '285336669';
const usernameValue = '';
const quick = false;

downloadAsHTML(title, id, usernameValue, quick).then(html => {
    console.log('Writing...');
    require('fs').writeFileSync('project.html', html);
    console.log('Done.');
    process.exit(0);
}).catch(err => {
    console.error(err);
});
