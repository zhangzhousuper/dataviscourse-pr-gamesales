async function loadData () {
  const mapData = await d3.json('../data/world.json');
  const vgsalesData = await d3.csv('../data/vgsales.csv');
  return { mapData,vgsalesData };
}

loadData().then((loadedData) => {  

  const mapData = loadedData.mapData;
  const vgsalesData = loadedData.vgsalesData;
  
  const worldMap = new MapVis(mapData, vgsalesData);
  // const cw = new cwVis(vgsalesData);

});
