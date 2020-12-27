# Contributing to the Cellar API

First of all, thank you for your desire to contribute!
It is sincerely appreciated!

> Note: The primary location for contributing to the project is on GitLab.
> It is mirrored to other locations for visibility.
> If you would like to contribute, start by navigating to [this document on GitLab][contributing-gitlab].

The Cellar team is current lacking in graphical frontend expertise.
If you would like to make significant contributions to this project and are interested in helping maintain it,
please reach out using the contact link on the [Cellar Website][docs-home].


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

The Cellar UI is an angular frontend written in [Typescript][typescript]..
Naturally, you will need the node interpreter.
Use the version listed in the [.nvmrc file][nvmrc].

In fact the easiest way to make sure you are on the right version is to install NVM,
which is a node version manager.  
For Linux and macOS see here: https://github.com/nvm-sh/nvm  
For Windows see here: https://github.com/coreybutler/nvm-windows

This project also makes extensive use of [**GNU Make**][gnu-make].
Make can generally be installed from your Linux distros package manager or on Mac using brew.
For Windows there are multiple ports of Make from which to choose or installing make on Windows subsystem for Linux will likely also work.

[Curl][curl] is used within Makefiles for making http requests.
It can generally be installed from your Linux distros package manager or on Mac using brew.
On Windows curl is usually aliased automatically to another windows native http client.

Finally, working on this project relies heavily on [Docker][docker] and [docker-compose][docker-compose].


### Getting started

Once you have all the above installed, you are ready to start the dependencies.
This is done through make by running `make services`.
This will startup any dependencies required by the API and bootstrap their configuration.
It will also output any relevant secrets into a file called `.env` from which the Cellar API will read secrets.

You can now be able to run the tests.
They can be run either from your IDE or from the terminal using the commands below.
Running the test from make will run them in headless mode.
(This is how the tests run in the CI pipeline.

```shell
make test-unit
make test-e2e
```

> Note: The unit tests do not require the services to be running,
> Only the e2e tests actually require the API and its dependencies to be running.

If all the tests pass, you are ready to begin work!
You can stop the API and its dependencies any time with `make clean-services`.


### Project Structure

This project was initially generated from the angular CLI and is structured accordingly.
Please make sure to follow all linting and formatting rules specified in relevant files, such as [tslint.json][tslint-json]


#### Testing

Similar to most Angular applications, tests are split into two types: unit and end to end (e2e).
However, you may notice that the [package.json][package-json] each of these types has two scripts.
The `test` and `e2e` commands are the usual testing configuration setup by the Angular CLI.
The `test:ci` and `e2e:ci` scripts are equivalent to the other two but run using headless chrome.
This makes it easier to run them in CI pipelines, such as gitlab or from CLI.
These are the ones that are called by other of the `make test-...` commands.


### Versioning

This project uses [semantic versioning][semver], but the version is __NOT__ managed in the [package.json][package-json].
Insead to update the version, change the `APP_VERSION` variable in [`.gitlab-ci.yml`][gitlab-ci].
Then make sure add a list of changes to the [CHANGELOG.md][changelog].
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
[tslint-json]: tslint.json
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
