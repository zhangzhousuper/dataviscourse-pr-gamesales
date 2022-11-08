// ******* DATA LOADING *******
// We took care of that for you
async function loadData () {
    console.log(1)
    const mapData = await d3.json('./data/world.json');
    return { mapData };
  }

//******* APPLICATION MOUNTING *******
loadData().then((loadedData) => {  
    
    // Store the loaded data into the globalApplicationState
    const mapData = loadedData.mapData;
    // Creates the view objects with the global state passed in 
    const worldMap = new MapVis(mapData);
  
});
  