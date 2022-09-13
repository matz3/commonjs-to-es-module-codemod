/**
 * Comment above first node
 */
require('top');

async function asyncFnDeclaration() {
  const {
    default: lazyLoadedAsync
  } = await import('lazy-loaded-async');
}

function syncFn() {
  const lazyLoadedSync = require('lazy-loaded-sync');
}

const asyncFnDefinition = async function() {
  const {
    default: lazyLoadedAsync
  } = await import('lazy-loaded-async');
}

require('bottom');
