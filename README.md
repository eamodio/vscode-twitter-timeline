# Twitter Timeline for VS Code

### Getting the code

```
git clone https://github.com/eamodio/vscode-twitter-timeline.git
```

### Prerequisites

- Install
  - [Git](https://git-scm.com/)
  - [NodeJS](https://nodejs.org/) `>= 10.11.0`
  - [yarn](https://yarnpkg.com/) `>= 1.17.3`
- Create a Twitter app: https://developer.twitter.com/en/apps
  - Set the following environment variables or add them to the `env` in the `.vscode/launch.json` file
  - `"TWITTER_CONSUMER_KEY": "<your-consumer-key-here>"`
  - `"TWITTER_CONSUMER_SECRET": "<your-consumer-secret-here>"`
  - `"TWITTER_ACCESS_TOKEN_KEY": "<your-access-token-here>"`
  - `"TWITTER_ACCESS_TOKEN_SECRET": "<your-access-token-secret-here>"`

### Dependencies

From a terminal, where you have cloned the repository, execute the following command to install the required dependencies:

```
yarn
```

### Build

From a terminal, where you have cloned the repository, execute the following command to build the project from scratch:

```
yarn run build
```

### Watch

During development you can use a watcher to make builds on changes quick and easy. From a terminal, where you have cloned the repository, execute the following command:

```
yarn run watch
```

Or use the provided `watch` task in VS Code, execute the following from the command palette (be sure there is no `>` at the start):

```
task watch
```

This will first do an initial full build and then watch for file changes, compiling those changes incrementally, enabling a fast, iterative coding experience.

👉 **Tip!** You can press <kbd>CMD+SHIFT+B</kbd> (<kbd>CTRL+SHIFT+B</kbd> on Windows, Linux) to start the watch task.

👉 **Tip!** You don't need to stop and restart the development version of Code after each change. You can just execute `Reload Window` from the command palette.

### Formatting

This project uses [prettier](https://prettier.io/) for code formatting. You can run prettier across the code by calling `yarn run pretty` from a terminal.

To format the code as you make changes you can install the [Prettier - Code formatter](https://marketplace.visualstudio.com/items/esbenp.prettier-vscode) extension.

Add the following to your User Settings to run prettier:

```
"editor.formatOnSave": true,
```

### Linting

This project uses [ESLint](https://eslint.org/) for code linting. You can run ESLint across the code by calling `yarn run lint` from a terminal. Warnings from ESLint show up in the `Errors and Warnings` quick box and you can navigate to them from inside VS Code.

To lint the code as you make changes you can install the [ESLint](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint) extension.

### Bundling

To generate a production bundle (without packaging) run the following from a terminal:

```
yarn run bundle
```

To generate a VSIX (installation package) run the following from a terminal:

```
yarn run package
```

### Debugging

#### Using VS Code

1. Open the `vscode-twitter-timeline` folder
2. Ensure the required [dependencies](#dependencies) are installed
3. Choose the `Watch & Launch Extension` launch configuration from the launch dropdown in the Debug viewlet and press `F5`.
