(async () => {
  try {
    const mm = await import('music-metadata');
    console.log(Object.keys(mm));
  } catch (e) {
    console.error(e);
  }
})();
