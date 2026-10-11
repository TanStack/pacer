module.exports = {
  test_page: 'tests/index.html?hidepassed',
  cwd: 'dist-tests',
  disable_watching: true,
  launch_in_ci: [process.env.TESTEM_BROWSER || 'Chrome'],
  browser_args: {
    Chrome: {
      ci: ['--headless=new', '--disable-dev-shm-usage', '--no-sandbox'],
    },
  },
}
