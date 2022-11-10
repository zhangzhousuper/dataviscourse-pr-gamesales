d3.json("../data/vgsales.json").then(data => {
  console.log(data);
    
  let table = new achievementChart(data);


});
