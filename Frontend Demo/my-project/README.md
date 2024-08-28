# E-UI SDK my-project

Insert description of the project: "E-UI SDK my-project" here.

## Setup

### Install the dependencies

```bash
npm install
```

### Build the project

```bash
npm run build
```

### Start the server (with source maps)

```bash
npm start
```

### Linting the project

```bash
npm run lint
```

### Linting extra folders

Add the following to package.json for each new folder which requires linting:

#### Adding Components to linting

```javascript
"lint": "eslint client/apps/**/*.js client/components/**/*.js --fix"
```

#### Adding Plugins to linting

```javascript
"lint": "eslint client/apps/**/*.js client/plugins/**/*.js --fix"
```

#### Adding Panels to linting

```javascript
"lint": "eslint client/apps/**/*.js client/panels/**/*.js --fix"
```

### Run tests in Headless Chrome and Firefox (with test coverage)

```bash
npm test
```

### Run tests in the browser

```bash
npm run test:browser
```

### Run tests in the terminal (with test coverage)

```bash
npm run test:chrome
npm run test:firefox
```

### Run tests in dev mode (with source maps)

```bash
npm run test:chrome:dev
npm run test:firefox:dev
```

### How to use

Add the following to `package.json` in your application:

```javascript
...
"dependencies": {
    ...
    "@<enm>/my-project": "0.0.0",
    ...
  }
...
```

This project uses eslint (extending Airbnb with some [custom rules](.eslintrc.js)).
