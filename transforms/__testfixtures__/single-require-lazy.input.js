/**
 * Comment above first node
 */
require('top');

async function asyncFnDeclaration() {
  const lazyLoadedAsync = require('lazy-loaded-async');
}

function syncFn() {
  const lazyLoadedSync = require('lazy-loaded-sync');
}

const asyncFnDefinition = async function() {
  const lazyLoadedAsync = require('lazy-loaded-async');
}

require('bottom');
