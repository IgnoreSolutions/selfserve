module.exports = {
  site: {
    title: 'VSAT ResQ',
    description: 'Satellite rescue services.',
    basePath: process.env.NODE_ENV === 'production' ? '/nanogen' : '',
  },
  build: {
    outputPath: process.env.NODE_ENV === 'production' ? './docs' : './public'
  }
};
