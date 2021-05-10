# ANT - Rookie of the Year Page

To run this project on your local dev environment, go ahead and clone this repo.

*Note that you will need to have [Node.js](https://nodejs.org) installed.*


## Get started

Install the dependencies...

```bash
cd tw21-roy
npm install
```

...then start [Rollup](https://rollupjs.org):

```bash
npm run dev
```

Navigate to [localhost:5000](http://localhost:5000). You should see the page running. Edit a component file in `src`, save it, and reload the page to see your changes.

## Building and running in production mode

To create an optimised version of the page:

```bash
npm run build
```

You can run the newly built app with `npm run start`. To deploy on production, you'll need to upload the new bundled files in the Timberwolves AWS server. Copy the index.html file in `public` and paste it into the text editor in your Drupal blank slate page. Make sure file references are all matching correctly.
