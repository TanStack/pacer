import EmberRouter from '@ember/routing/router'
import { setApplication } from '@ember/test-helpers'
import { setTesting } from '@embroider/macros'
import { start as qunitStart, setupEmberOnerrorValidation } from 'ember-qunit'
import EmberApp from 'ember-strict-application-resolver'
import * as QUnit from 'qunit'
import { setup } from 'qunit-dom'

class Router extends EmberRouter {
  location = 'none'
  rootURL = '/'
}

class TestApp extends EmberApp {
  modules = {
    './router': Router,
    // add any custom services here
    // import.meta.glob('./services/*', { eager: true }),
  }
}

Router.map(function () {})

export function start() {
  setTesting(true)
  setApplication(
    TestApp.create({
      autoboot: false,
      rootElement: '#ember-testing',
    }),
  )
  setup(QUnit.assert)
  setupEmberOnerrorValidation()
  qunitStart()
}
