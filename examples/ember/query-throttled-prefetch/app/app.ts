import Application from 'ember-strict-application-resolver'
import './app.css'
export default class App extends Application {
  modules = {
    ...import.meta.glob('./router.*', { eager: true }),
    ...import.meta.glob('./templates/**/*', { eager: true }),
  }
}
