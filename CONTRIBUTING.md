# Contributing to the Cellar UI

First of all, thank you for your desire to contribute!
It is sincerely appreciated!

> Note: The primary location for contributing to the project is on GitLab.
> It is mirrored to other locations for visibility.
> If you would like to contribute, start by navigating to [this document on GitLab][contributing-gitlab].


## Reporting Issues

Reporting issues is a great way to contribute!
We appreciate detailed issue reports.
However, before reporting an issue, please make sure it doesn't already exist in the [issues list][issues-list].

If an issue does exist, please refrain from commenting "+1" or similar comments.
That said, if you have addditional context, such as new ways to reproduce an issue, please to leave a comment.

When reporting an issue, make sure to follow the [bug issue template][issues-bug].
Make sure not to include any sensitive information.
You may replace any sensitive information that appears in logs you share with the word "REDACTED".


## Requesting New Datastores or Cryptography Engines

Features related to datastores or cryptography engines begin in the API.

To request a new datastore or cryptography engine,
follow the instructions in the [Cellar API contributing documentation][contributing-api-gitlab].


## Requesting Other Features

For any other feature requests, please create a [feature request issue][issues-feature-request].
Explain in as much detail as possible why you need the feature and how it would work.
Feature requests will be evaluated on a case by case basis.

Keep in mind that Cellar is built on the principle of minimalism.
It aspires to be a lightweight layer to facilitate secret sharing through existing secure platforms.
It is not intended to replace or replicate the features of a password manager or other feature rich, account based secret sharing platforms.


## Developing the Cellar UI

The Cellar UI is a web frontend built on top of the Cellar API.
Before working on the Cellar UI, make sure you are familiar with the [purpose of Cellar][docs-home] and the [components that make up Cellar][docs-application-structure]


### Local Developer Dependencies

The Cellar UI is a React frontend written in [TypeScript][typescript] using [Vite][vite] as the build tool.
Naturally, you will need the node interpreter.
Use the version listed in the [.nvmrc file][nvmrc].

The easiest way to make sure you are on the right version is to install NVM,
which is a node version manager.
For Linux and macOS see here: https://github.com/nvm-sh/nvm
For Windows see here: https://github.com/coreybutler/nvm-windows

This project also makes extensive use of [**GNU Make**][gnu-make].
Make can generally be installed from your Linux distro's package manager or on Mac using brew.
For Windows there are multiple ports of Make from which to choose or installing make on Windows subsystem for Linux will likely also work.

[Curl][curl] is used within Makefiles for making http requests.
It can generally be installed from your Linux distro's package manager or on Mac using brew.
On Windows curl is usually aliased automatically to another windows native http client.

Finally, working on this project relies heavily on [Docker][docker] and [docker-compose][docker-compose].


### Getting started

Once you have all the above installed, you are ready to start the dependencies.
This is done through make by running `make services`.
This will startup any dependencies required by the API and bootstrap their configuration.
It will also output any relevant secrets into a file called `.env` from which the Cellar API will read secrets.

You should now be able to run the tests.
They can be run either from your IDE or from the terminal using the commands below.
Running the test with `make` will run them in headless mode.
(This is how the tests run in the CI pipeline.)

```shell
make test-unit
make test-e2e
```

> Note: The unit tests do not require the services to be running,
> Only the e2e tests actually require the API and its dependencies to be running.

> Note: While the e2e tests do require the UI to be running,
> they will automatically start the UI themselves when run in headless mode.

If all the tests pass, you are ready to begin work!
You can stop the API and its dependencies any time:

```shell
make clean-services
```


### Project Structure

This project uses React with Vite and follows a component-based architecture.
Please make sure to follow all linting and formatting rules specified in the ESLint and Prettier configurations.

Any scripts related to directly working with the UI are found in the [package.json][package-json],
but a few important ones are called out in the sections below.

#### Running

Before attempting to run the API make sure you have installed and are using the correct version of node:
```shell
nvm install
nvm use
```

Then install all the necessary UI source dependencies.

```shell
npm install
```

Finally, you can run the UI development server:

```shell
npm run dev
```

You should now be able to load the UI in your browser at http://localhost:5173.

The development server supports hot module replacement (HMR) for a smooth development experience.

If you need to reference the endpoints available in the Cellar API,
you can load the swagger page at http://localhost:5173/api/swagger/index.html.


#### Testing

Tests are split into two types: unit and end-to-end (E2E).

**Unit tests** use [Vitest][vitest] with [React Testing Library][react-testing-library] and can be run with:
```shell
make test-unit
npm run test
```

**E2E tests** use [Playwright][playwright] and test across multiple browsers (Chromium, Firefox, WebKit) and viewports.
E2E tests can be run with:
```shell
make test-e2e
npm run test:e2e
```

The E2E tests support running in Docker for consistent environments:
```shell
make test-e2e-docker-all
```

All tests are designed to run in CI pipelines and are automatically executed on GitLab.


### Versioning

This project uses [semantic versioning][semver], but the version is __NOT__ managed in the [package.json][package-json].
Instead to update the version, change the `APP_VERSION` variable in [`.gitlab-ci.yml`][gitlab-ci].
Then make sure to add a list of changes to the [CHANGELOG.md][changelog].
Tagging and release will be handled automatically through the [CI/CD pipelines][pipelines] in GitLab.


### Updating API Dependency Version

To update the version of the API on which this project relies:
- Start by updating the tag of the API image in the [docker-compose file][docker-compose-yml].
- Then restart the services: `make services`.
- Make any necessary changes to the code and tests.
- Lastly, change the `API_VERSION` variable in the [gitlab-ci][gitlab-ci] file.


### Final Thoughts

- Documentation is hard and keeping it up to date is harder.
  Contributions that help keep this and other documentation clear, concise, and up to date are both welcome and appreciated.
- Tests are mandatory. Code changes will not be accepted without new or updated tests nor without all tests passing.


[gitlab-ci]: .gitlab-ci.yml
[changelog]: CHANGELOG.md
[package-json]: package.json
[nvmrc]: .nvmrc
[docker-compose-yml]: docker-compose.yml

[contributing-gitlab]: https://gitlab.com/cellar-app/cellar-ui/-/blob/main/CONTRIBUTING.md
[contributing-api-gitlab]: https://gitlab.com/cellar-app/cellar-api/-/blob/main/CONTRIBUTING.md

[docs-application-structure]: https://cellar-app.io/basics/application-structure/
[docs-home]: https://cellar-app.io/

[issues-list]: https://gitlab.com/cellar-app/cellar-ui/-/issues
[issues-bug]: https://gitlab.com/cellar-app/cellar-ui/-/issues/new
[issues-feature-request]: https://gitlab.com/cellar-app/cellar-ui/-/issues/new

[pipelines]: https://gitlab.com/cellar-app/cellar-ui/-/pipelines

[gnu-make]: https://www.gnu.org/software/make/
[docker]: https://www.docker.com/
[docker-compose]: https://docs.docker.com/compose/
[curl]: https://curl.se/
[semver]: https://semver.org/
[node]: https://nodejs.org/en/
[typescript]: https://www.typescriptlang.org/
[vite]: https://vite.dev/
[vitest]: https://vitest.dev/
[react-testing-library]: https://testing-library.com/docs/react-testing-library/intro/
[playwright]: https://playwright.dev/
