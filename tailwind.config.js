module.exports = {
  purge: {
  	enabled: !process.env.ROLLUP_WATCH,
  	content: ['./public/index.html', './src/**/*.svelte'],
  	options: {
  		defaultExtractor: content => [
  			...(content.match(/[^<>"'`\s]*[^<>"'`\s:]/g) || []),
        ...(content.match(/(?<=class:)[^=>\/\s]*/g) || []),
  		],
  	},
  },
  darkMode: false, // or 'media' or 'class'
  theme: {
    fontFamily : {
      'sans': ['ui-sans-serif', 'system-ui'],
      'serif': ['ui-serif', 'Georgia'],
      'mono': ['ui-monospace', 'SFMono-Regular'],
      'display': ['Oswald'],
      'body': ['futura pt', 'futura', 'helvetica', 'arial', 'Open Sans', 'system-ui', 'ui-sans-serif'],
    },
    minWidth: {
     '0': '0',
     '1/4': '25%',
     '1/3': '33.33%',
     '1/2': '50%',
     '2/3': '66.66%',
     '3/4': '75%',
     'full': '100%',
    },
    maxWidth: {
     '0': '0',
     '1/4': '25%',
     '1/3': '33.33%',
     '1/2': '50%',
     '2/3': '66.66%',
     '3/4': '75%',
     'full': '100%',
     '100px': '100px',
     '150px': '150px',
     '200px': '200px',
    },
    minHeight: {
     '0': '0',
     '1/4': '25%',
     '1/3': '33.33%',
     '1/2': '50%',
     '2/3': '66.66%',
     '3/4': '75%',
     'full': '100%',
     'screen': '100vh',
    },
    maxHeight: {
     '0': '0',
     '1/4': '25%',
     '1/3': '33.33%',
     '1/2': '50%',
     '2/3': '66.66%',
     '3/4': '75%',
     'full': '100%',
     'screen': '100vh',
    },
    extend: {
      colors: {
        aurora: {
          light: "#a5de77",
          DEFAULT: "#76bc21",
          dark : "#66a21c"
        },
        lake: {
          light : {
            DEFAULT : "hsl(207, 43%, 92%)",
            interact : "hsl(207, 48%, 87%)"
          },
          DEFAULT: "#236092",
          dark : "#1b486d"
        },
        midnight: "#0a2240",
      },
    },
  },
  variants: {
    extend: {
      transform:['active'],
      scale: ['active'],
    },
  },
  plugins: [],
  future: {
    purgeLayersByDefault: true,
    removeDeprecatedGapUtilities: true,
  },
}
