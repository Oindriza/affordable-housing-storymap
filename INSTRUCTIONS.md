# Project Instructions

## Samples

Find examples from previous years and elsewhere on the internet at https://github.com/Weitzman-MUSA-JavaScript/story-map-project-examples

## Timeline

This project will be our focus for the first four weeks of the course -- in week 5 we will start a new project focused on dashboards.

### Step 1: Choose a topic and data source(s)

Choose a topic that is fruitfully explained with some combination of narrative and geographic elements. Think about what data you want to tell a story about. Whatever data you use, **be sure to include citations somewhere in your app interface**. You can choose a dataset from any of a number of sources, for example:

* Use data you've been working with for another class
* Create your own dataset (check out [geojson.io](https://geojson.io))
* Find data from an open data repository...

#### OpenDataPhilly.org

OpenDataPhilly has lots of Philadelphia-specific data, like:

- [Neighborhood Boundaries](https://opendataphilly.org/dataset/philadelphia-neighborhoods)
- Historic [Streets](https://opendataphilly.org/dataset/historic-streets), [Districts](https://opendataphilly.org/dataset/philadelphia-registered-historic-districts), or [Properties](https://opendataphilly.org/dataset/philadelphia-registered-historic-sites)
- [School Information](https://opendataphilly.org/dataset/school-information-data)
- [PA Horticultural Society Land Care](https://opendataphilly.org/dataset/land-care)

#### Other open data portals

Many other cities, counties, states, and countries have dedicated data portals as well. Here are a couple of lists of state-sponsored open data sites:

- [Data.gov - Open Government](https://data.gov/open-gov/)
- [Open Knowledge Foundation - DataPortals.org](https://dataportals.org/)

#### Independently compiled data sources

Sources like [Stop Demolishing Philly](https://www.stopdemolishingphilly.com/map/) or other privately compiled data sources.


Use one of the template story maps in the _templates/_ folder, modified as you see fit, to explain your topic. For example, open [templates/scrollytelly/](templates/scrollytelly/) and copy the contents to the root folder in this repository. You can then modify the HTML, CSS, JavaScript, and data to suit your needs.

### Step 2: Think about slide content

Your story will have multiple slides, each with a title, some additional text, maybe images, and geographic data.

### Step 3: Design and build your story map

* If you are using one of the templates in this repository, copy the contents to the root folder in this repository (e.g., copy everything from [templates/scrollytelly/](templates/scrollytelly/)). You can then modify the HTML, CSS, JavaScript, and data in the root folder to suit your needs. You can also start from a different template if you prefer. For example, Juan Francisco Saldarriaga (PointsUnknown)'s [tutorial](https://pointsunknown.nyc/web%20mapping/mapbox/2021/07/20/11A_MapboxStorytelling.html) has been popular in the past.

* For the templates in this folder, your slide content will go straight into your HTML, and your map features will go in to separate GeoJSON files in the [data/](data/) folder. Each slide will have a corresponding GeoJSON file in the [data/](data/) folder. For example, if you have a slide in your HTML with an `id` of `housing-1`, then you should have a corresponding `housing-1.json` file in the [data/](data/) folder (the choice of `id` is up to you, but it should be descriptive). You can use [geojson.io](https://geojson.io) to create and edit GeoJSON files.

* By default, the map will zoom to the bounds of the features in each slide's GeoJSON file. If you want to set a custom bounding box for a slide, you can do so by adding a `bbox` property to the slide's `FeatureCollection` in the GeoJSON file. The `bbox` property should be an array of four numbers: `[minLng, minLat, maxLng, maxLat]`. For example:

  ```json
  {
    "type": "FeatureCollection",
    "bbox": [-75.2803, 39.8670, -75.1403, 39.9670],
    "features": [
      ...
    ]
  }
  ```

  You can read more about the `bbox` property in the [GeoJSON specification](https://tools.ietf.org/html/rfc7946#section-5).

* You do not need to edit the JavaScript code in the `slidedeck.js` file unless you want to change the way the slides work. You may, however, want to edit the JavaScript code in the `index.js` file to change your map's base tiles by updating the `baseTileLayer` definition, or to change your slides' symbology by updating `slideOptions`.

  The `slideOptions` object in `index.js` defines how each slide's GeoJSON layer will be created. You can do things like change the color of points, lines, and polygons, using icons instead of circles to represent points, or add popups to features. You can read more about the options available in the [Leaflet documentation](https://leafletjs.com/reference.html#geojson).

  If you do want to edit the `slideOptions` for a particular slide, you can copy the value of the `defaultOptions` object from the `updateDataLayer` function in `slidedeck.js` as a starting point. For example, if you want to change the symbology for a slide with an `id` of `housing-1`, you can do something like this in `index.js`:

  ```js
  const slideOptions = {
    'housing-1': {
      pointToLayer: (p, latlng) => L.marker(latlng, {
        icon: L.icon({
          iconUrl: 'path/to/housing/icon.png',
          iconSize: [25, 41],
          iconAnchor: [12, 41],
        })
      }),
      onEachFeature: (feature, layer) => {
        const n = feature.properties.numberOfUnits;
        layer.bindTooltip(`${n} units`);
      }
    },
    ...
  };
  ```

### Step 4: Check your code

* Be sure that your JavaScript and CSS code are properly linted. You can use [ESLint](https://eslint.org/) for JavaScript and [Stylelint](https://stylelint.io/) for CSS.

* Check that your story map works well on both desktop and mobile browsers.

* Verify that your story map is free from major accessibility issues. You can use tools like Axe (https://www.deque.com/axe/), and attempt to navigate your site using only a keyboard or using a screen reader.

### Step 5: Submit your story map

Commit your code and push it to your repository on GitHub. Set up GitHub pages on the repository and submit a new pull request into the original project repository in the class organization.

#### Submission Checklist

- [ ] Pushed latest code to the `main` branch of your repository
- [ ] Updated the `README.md` file with a description of your project, and data citations.
- [ ] Linted JS and CSS code
- [ ] Verified a11y of your site
- [ ] Turned on GitHub Pages for the repository and verified that your site works when deployed
- [ ] Submitted a pull request to the original repository in the class organization
- [ ] In the PR **title**, included your name at least
- [ ] In the PR **description**, included a brief description of your topic, and your target audience