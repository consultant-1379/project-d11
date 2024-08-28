const express = require('express');
const path = require('path');
const fs = require('fs');

const containerRoot = path.join(__dirname, '../node_modules/@eui/container');
const clientRoot = path.join(__dirname, '../client');

/**
 * This function is used to give preference to my components over
 * components with the same name from E-UI SDK.
 *
 * @function applyOverride
 * @param {Array} override - array of my components
 * @param {Array} original - array of E-UI SDK components
 */
function applyOverride(override, original) {
  if (!override) {
    return;
  }
  override.forEach((component) => {
    const index = original.indexOf(component);
    if (index > -1) {
      original.splice(index, 1);
    }
  });
}

/**
 * Safely read the contents of the directory (components/panels/plugins)
 * and retrieve a list of components. If the directory is not found
 * it issues a warning to the console and moves on.
 *
 * @function readMyDirectory
 * @param {String} directoryPath - directory path in my client
 */
function readMyDirectory(directoryPath) {
  if (fs.existsSync(directoryPath)) {
    return fs.readdirSync(directoryPath);
  }
  console.warn(`${directoryPath} is not found, skipping...`);
  return [];
}

/**
 * Get the list of components/panels defined in the client.
 * Do a deep inspection to check if they are valid.
 * Valid items must have a config.json file. Developers may just
 * want to add a locale to a component/panel provided by the Container.
 *
 * @function overrideList
 * @param {String} overridePath - path to the user defined system panel or component
 */
const overrideList = (overridePath) => {
  const items = readMyDirectory(overridePath);
  const myItems = [];
  items.forEach((item) => {
    // only override a panel/component if it has a config.json file
    if (fs.existsSync(`${overridePath}/${item}/config.json`)) {
      myItems.push(item);
    }
  });
  return myItems;
};

/**
 * Get the list of panels defined in the client.
 * Do a deep inspection to check if they are valid panels.
 * Valid panels must have a config.json file. Developers may just
 * want to add a locale to a system panel provided by the Container.
 *
 * @function readMyPanels
 */
const readMyPanels = () => overrideList(`${clientRoot}/panels/`);

/**
 * Get the list of components defined in the client.
 * Do a deep inspection to check if they are valid components.
 * Valid components must have a config.json file. Developers may just
 * want to add a locale to a component provided by the Container.
 *
 * @function readMyComponents
 */
const readMyComponents = () => overrideList(`${clientRoot}/components/`);

/**
 * Get a list of components, panels and plugins from the E-UI SDK Container
 *
 * @function getEUISDKComponents
 */
function getEUISDKComponents() {
  const euisdkComponents = fs.readdirSync(`${containerRoot}/components/`);
  const euisdkPanels = fs.readdirSync(`${containerRoot}/panels/`);
  const euisdkPlugins = fs.readdirSync(`${containerRoot}/plugins/`);

  return { euisdkComponents, euisdkPanels, euisdkPlugins };
}

/**
 * Get a list of my components, panels and plugins from my client
 *
 * @function getMyComponents
 */
function getMyComponents() {
  const myComponents = readMyComponents();
  const myPanels = readMyPanels();
  const myPlugins = readMyDirectory(`${clientRoot}/plugins/`);

  return { myComponents, myPanels, myPlugins };
}

const { euisdkComponents, euisdkPanels, euisdkPlugins } = getEUISDKComponents();
const { myComponents, myPanels, myPlugins } = getMyComponents();

// Where conflicts exist client takes priority
applyOverride(myComponents, euisdkComponents);
applyOverride(myPanels, euisdkPanels);
applyOverride(myPlugins, euisdkPlugins);


function init(app) {
  /**
   * assets
   */
  app.use('/assets/fonts', express.static(path.join(__dirname, '../node_modules/@eui/theme/0/fonts')));
  app.use('/assets/css', express.static(`${containerRoot}/assets/css/`));
  app.use('/assets/icons', express.static(`${containerRoot}/assets/icons`));
  app.use('/assets/img', express.static(`${containerRoot}/assets/img`));
  app.use('/assets/favicon.ico', express.static(`${containerRoot}/assets/favicon.ico`));

  /**
   * libs
   */
  app.use('/libs/system.js', express.static(`${containerRoot}/libs/system.js`));
  app.use('/libs/@eui/', (req, res, next) => {
    // Use original url to preserve query for cache breaking
    const { originalUrl } = req;

    // This enables sourcemaps to be available for E-UI SDK packages in dev environment
    if (originalUrl.indexOf('Main.js') !== -1) {
      res.redirect(originalUrl.replace('Main.js', 'Main.debug.js'));
    } else if (originalUrl.indexOf('umd.js') !== -1) {
      // all umd files pass through this including container
      res.redirect(originalUrl.replace('umd', 'umd.debug'));
    } else {
      express.static(path.join(__dirname, '../node_modules/@eui/'))(req, res, next);
    }
  });
  app.use('/libs/@eui/container/', express.static(`${containerRoot}/libs/@eui/container/`));

  /**
   * Locale routes
   */
  app.use('/:folder/:component/locale/:localeFile', (req, res, next) => {
    // route for locales of non-sharable components, incl. app, panel, plugins
    const { folder, component, localeFile } = req.params;

    // If this fails to find locale file in client folder then the reRoute is hit to container folder
    // Should be no requests unless component defined in externals.config or provided by E-UI SDK container
    express.static(`${clientRoot}/${folder}/${component}/locale/${localeFile}`)(req, res, next);
  });

  app.use('/:folder/:component/:version/locale/:localeFile', (req, res, next) => {
    // route for locales of shareable components + any future versioning of apps, panels, etc...
    const { folder, component, localeFile } = req.params;

    // If this fails to find locale file in client folder then the reRoute is hit to container folder
    // Should be no requests unless component defined in externals.config or provided by E-UI SDK container
    express.static(`${clientRoot}/${folder}/${component}/locale/${localeFile}`)(req, res, next);
  });

  /**
   * routing for my components
   */
  app.use('/components/:component/:version/config.json', (req, res, next) => {
    // shareable only - e.g. myComponent/0/config.json
    const { component } = req.params;

    // config.json file not copied in dev must route to original, if not here will try the container reRoute
    express.static(`${clientRoot}/components/${component}/config.json`)(req, res, next);
  });

  app.use('/components/:component/config.json', (req, res, next) => {
    // Non-shareable - e.g. myComponent/config.json
    const { component } = req.params;

    // config.json file not copied in dev must route to original, if not here will try the container reRoute
    express.static(`${clientRoot}/components/${component}/config.json`)(req, res, next);
  });

  /**
   * routing for components/panels/plugins provided by container lib
   * provides access to source maps for development
   */
  app.use('/:folder/:component', (req, res, next) => {
    const { folder, component } = req.params;

    function reRoute(fileName) {
      const { originalUrl } = req;
      if (originalUrl.indexOf(`${fileName}.js`) !== -1) {
        res.redirect(originalUrl.replace(`${fileName}.js`, `${fileName}.debug.js`));
      } else {
        express.static(`${containerRoot}/${folder}/${component}`)(req, res, next);
      }
    }

    // Route all requests to container library where the client is not fully overriding component
    // All requests involving locale extension would have been filtered out by this stage
    if (folder === 'components' && euisdkComponents.indexOf(component) !== -1) {
      reRoute('Main');
    } else if (folder === 'panels' && euisdkPanels.indexOf(component) !== -1) {
      reRoute('Panel');
    } else if (folder === 'plugins' && euisdkPlugins.indexOf(component) !== -1) {
      reRoute('index');
    } else {
      next();
    }
  });
}

module.exports = {
  init,
};
