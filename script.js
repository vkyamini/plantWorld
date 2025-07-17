
var APIkey = "2b10bdGJyGcIsj0daQ5zu6j4lO"; // plantnet key (images/500 Limit,needs localhost)
var Apikey = "sk-yxsV687012eecdd4311381";// perenial key (Query 100 per day)
let UploadedImage; // stores the uploaded image
let query; 
let Queryid = [];
let count = 0;


// add operation
var renderPlants = document.getElementById("renderPlants"); // diaply plants based on search base
var summary = document.getElementById("summary"); // will display the uploaded images result
var result = document.getElementById('results'); // shows preview
var imageInput = document.getElementById('imageInput'); // gets image from input field
var searchBtn = document.getElementById("searchBtn"); // search Btn
var plantName = document.getElementById("plantName"); // query from input text
var previewimg = document.createElement('img') // display img for preview
var ImageHeading = document.createElement("h3") // preview heading
var Idebutton =  document.createElement("button"); // starts the fetc function
var nextbtn = document.createElement("button");
var prevbtn = document.createElement("button");
var showplants =  document.createElement('button');

// creating classes for styling
summary.classList.add('summary')
result.classList.add('result')
nextbtn.classList.add('nextbtn')
prevbtn.classList.add('prevbtn')
Idebutton.classList.add('Idebutton')
previewimg.classList.add('previewimg')


imageInput.addEventListener("change",()=>{// uploads image frm input and has preview option
   
    UploadedImage = imageInput.files[0];
    if (!UploadedImage) return;

    const reader = new FileReader();

    reader.onloadend = () => {

        summary.innerHTML = "";
        result.innerHTML="";
       
        ImageHeading.innerHTML = "Image Preview"
        previewimg.src= reader.result; // result includes base64 + type
        previewimg.style.width = "400px";
        previewimg.style.height = "400px";
        summary.append(ImageHeading); // image heading
        summary.append(previewimg); // preview of the image
        result.append(Idebutton); // append Identify button
        Idebutton.innerHTML = "Identify"
      };
    
      reader.readAsDataURL(UploadedImage);
   
});

Idebutton.addEventListener("click",()=>{ // shows all data of plants from the image uploaded
    console.log("started identifying");

    result.innerHTML =  " 🔍 Searching.....";
       // const file = document.getElementById("imageInput").files[0];
        const formData = new FormData();
        formData.append("images", UploadedImage);

        
        fetch(`https://my-api.plantnet.org/v2/identify/all?api-key=${APIkey}&include-related-images=true`,{
            method: "POST",
            body: formData
        }).then(res => res.json())
        .then(data=>{

            console.log(data); 
            summary.innerHTML =  "";
            result.innerHTML = "";
            const PlantDisplayDeatils = {
                bestMatch: data.bestMatch,
                predictedOrgan: data.predictedOrgans[0].organ,
                match:data.predictedOrgans[0].score,
                indsscore:"",
                scientificname:"",
                img:"", // calling it within the function
                gbifid:"", // calling it within the function
                commonNames:"", // calling it within the function
            }

            console.log(data.remainingIdentificationRequests);
            console.log(PlantDisplayDeatils);
            //let's set all the object variables

            var headings = document.createElement('h3');
            headings.innerHTML ="List of plants found: " +data.results.length;
            summary.append(headings);

            if(data.bestMatch){
                var bestMatch = document.createElement('p');
                bestMatch.innerHTML ='<strong> 🌿 Name: </strong>'+ PlantDisplayDeatils.bestMatch;
                summary.append(bestMatch);
                stringname = PlantDisplayDeatils.bestMatch;

            }
            if(data.predictedOrgans[0] !== null){
                var predictedOrgans = document.createElement('p');
                var score = document.createElement('p');
                var convertscore = (PlantDisplayDeatils.match* 100).toFixed(2);
                score.innerHTML =`<strong> Match Score: </strong>`+ convertscore +`%`;
                predictedOrgans.innerHTML =`<strong>  Predicted From: </strong>`+ PlantDisplayDeatils.predictedOrgan;
                summary.append(predictedOrgans);
                summary.append(score);
            }

            if(data && data.results && data.results.length > 0){ // all resurring data of the plants
                let plantListsresults = data.results

                plantListsresults.forEach((plantList)=>{ // all details in the plant card
                    var plantcard = document.createElement('div')
                    plantcard.classList.add('plant-card')
                    var gibitid = document.createElement('a');
                    var img = document.createElement('img');
                    var indsscore = document.createElement('p');
                    var commonNames = document.createElement('p');
                    var scientificName = document.createElement('p');
                    
                    
                    gibitid.href = `https://www.gbif.org/species/${plantList.gbif.id}`
                    gibitid.style.color = "green";
                    gibitid.textContent = "📎 Click ME - See More Details"; 
                    gibitid.target = "_blank"; 

                    if(plantList.species.commonNames.length !== 0){
                        commonNames.innerHTML =`<strong> Common Names: </strong>` +plantList.species.commonNames.join(", ");
                    }else{commonNames.innerHTM =`<strong> Common Names: </strong>`+PlantDisplayDeatils.bestMatch;}

                    if(plantList.images.length !== 0){
                        let plantlistimgs = plantList.images;
                        plantlistimgs.forEach((imgs)=>{
                        img.src = imgs.url.o
                        img.style.width = "350px";
                        img.style.height = "350px";
                        img.style.borderRadius = "8px";
                        })
                    }
                    if(plantList.species.scientificName !== null ){
                        PlantDisplayDeatils.scientificname = plantList.species.scientificName;
                        scientificName.innerHTML = `<strong>🔬 Scientific Name: </strong>`+plantList.species.scientificName;
                    }

                    if(plantList.score !== null){
                        PlantDisplayDeatils.indsscore = plantList.score;
                        let temscore = (plantList.score * 100).toFixed(2);
                        indsscore.innerHTML =`<strong>📊 Probability Score: </strong>`+ temscore +`%`;
                    }
                    summary.append(plantcard);
                    plantcard.append(gibitid);
                    plantcard.append(commonNames);
                    plantcard.append(indsscore)
                    plantcard.append(scientificName);
                    plantcard.append(img);
                });
            }
        }).catch(err => {
            console.error("Error:", err);
            summary.innerHTML = `❌ ${err.message}`;
          });    
})

searchBtn.addEventListener("click",()=>{ // receiving the input and passing query
   query = plantName.value.trim();
   if(!query) return
   console.log(query);
   fetchPlantDetails()
})

nextbtn.addEventListener("click",()=>{
    renderPlants.innerHTML = "";
    summary.innerHTML = "";
    count++;
    RenderPlants();
    

})

prevbtn.addEventListener("click",()=>{
    if(count !== 0 ){
      renderPlants.innerHTML = "";
      summary.innerHTML = "";
      count--;
    }
    RenderPlants();
})

function fetchPlantDetails(){ // get Id and pass it to array and called next API to display
    console.log("triggered")
    fetch(`https://perenual.com/api/v2/species-list?key=${Apikey}&q=${query}`,{
     }).then(response => {
            if (!response.ok) throw new Error("Network response was not ok");
            return response.json();
          })
          .then(data => {
            console.log("🌿 Plant Search Results:", data);
            summary.innerHTML = "🌿 Searching..."
            var datares = data.data;
            // collect all thei id

            if (datares.length > 1){
               for(let i=0;i<datares.length;i++){
                    Queryid.push(datares[i].id);
                }
            }
            RenderPlants();
        }).catch(err => {
            console.error("Error:", err);
            summary.innerHTML = `❌ ${err.message}`;
          });   
        summary.innerHTML = " 🌳 Retriving data :)"   
         
}

function RenderPlants(){ // display's list of plants one by one
    console.log("Rendering triggered")
    //Queryid = [];
    fetch(`https://perenual.com/api/v2/species/details/${Queryid[count]}?key=${Apikey}`,{
    }).then(response => {
           if (!response.ok) throw new Error("Network response was not ok");
           return response.json();
         })
         .then(data => {
           console.log("......... Plant Search Results:", data);
           const PlantOBj ={
            name:"",
            type:"",
            attracts:[],
            careLevel:"",
            cycle:"",
            thumbnailImg:"",
            description:"",
            drought_tolerant:"",
            edible_fruit:"",
            edible_leaf:"",
            flowering_season:"",
            growth_rate:"",
            dimensions:"",
            harvest_season:"",
            hardiness:"",
            hardiness_location:"",
            indoor:"",
            thorny:"",
            tropical:"",
            hybrid:"",
            invasive:"",
            maintenance:"",
            medicinal:"",
            origin:[],
            pest_susceptibility:[],
            poisonous_to_humans:"",
            poisonous_to_pets:"",
            propagation:[],
            pruning_month:[],
            soil:[],
            sunlight:[],
            watering:"",
            watering_general_benchmark:"",
            careGUides:"",
        }

        // create Objects

        if(data.common_name !== null){ // name
            PlantOBj.name = data.common_name;
        }

        if(data.type !== null){ // type
            PlantOBj.type = data.type;
        }
        
        if(data.attracts.length > 1){ // attracts
            PlantOBj.attracts = data.attracts.join(", ");
        }
        if(data.care_level !== null){ // careLevel
            PlantOBj.careLevel = data.care_level;
        }

        if(data.cycle !== null){// cycle
            PlantOBj.cycle = data.cycle;
        }

        if(data.default_image !== null){ // thumbnaiImg
            PlantOBj.thumbnailImg = data.default_image.thumbnail;

        }
        if(data.description !== null){ //description
            PlantOBj.description = data.description;
        }
        if(data.dimensions && data.dimensions.length > 0){ // dimension
            PlantOBj.dimensions = {
                min_value:data.dimensions[0].min_value,
                max_value:data.dimensions[0].min_value,
                type:data.dimensions[0].type,
                unit:data.dimensions[0].unit,
            }
        }
        if(data.drought_tolerant !== null){ // drought_tolerant
            PlantOBj.drought_tolerant = data.drought_tolerant;
        }
        if(data.edible_fruit !== null){// edible_fruit
            PlantOBj.edible_fruit = data.edible_fruit;
        }
        if(data.edible_leaf !== null){ // edible_leaf
            PlantOBj.edible_leaf = data.edible_leaf;
        }
        if(data.flowering_season !== null){ // flowering_season

            PlantOBj.flowering_season = data.flowering_season;

        }
        if(data.growth_rate !== null){ //growth_rate
            PlantOBj.growth_rate = data.growth_rate;
        }
        if(data.harvest_season !== null){ //harvest season
            PlantOBj.harvest_season = data.harvest_season;
        }
        if(data.hardiness !== null){ // hardiness
            PlantOBj.hardiness = {
                min:data.hardiness.min,
                max:data.hardiness.max,
            }
        }
        if(data.hardiness_location !== null){ // hardiness location
            PlantOBj.hardiness_location = {
                full_iframe:data.hardiness_location.full_iframe,
                full_url:data.hardiness_location.full_url,
            }
        }
       
        if(data.indoor !== null){  //indoor
            PlantOBj.indoor = data.indoor;
        }
        if(data.thorny !== null){ //thorny:"",
            PlantOBj.thorny = data.thorny;
        }
        if(data.tropical !== null){ //  tropical:"",
            PlantOBj.tropical = data.tropical;
        }
        if(data.hybrid !== null){ // hybrid:"",
            PlantOBj.hybrid = data.hybrid;
        }
        if(data.invasive !== null){ // invasive
            PlantOBj.invasive = data.invasive;
        }
        if(data.maintenance !== null){ //  maintenance:"",
            PlantOBj.maintenance = data.maintenance;
        }
        if(data.medicinal !== null){ //  medicinal:"",
            PlantOBj.method = data.medicinal;
        }
       if(data.origin.length > 1){ //origin
        PlantOBj.origin = data.origin.join(", ")
       }
       if(data.pest_susceptibility.length > 1){ //pest_susceptibility
        PlantOBj.pest_susceptibility = data.pest_susceptibility.join(", ")
       }
       if(data.poisonous_to_humans !== null){ //poisonous_to_humans
        PlantOBj.poisonous_to_humans = data.poisonous_to_humans;
       }
       if(data. poisonous_to_pets !== null){ //poisonous_to_pets
        PlantOBj.poisonous_to_pets = data. poisonous_to_pets;
       }
       if(data.propagation.length > 0){// propagation
        PlantOBj.propagation = data.propagation.join(", ")
       }
       if(data.pruning_month.length > 0){ // pruning_month
        PlantOBj.pruning_month = data.pruning_month.join(", ");
       }
       if(data.soil.length > 0){ // soil
        PlantOBj.soil = data.soil.join(", ")
        }
       if(data.sunlight.length > 0){ // sunlight
        PlantOBj.sunlight = data.sunlight;
       }
       if(data.watering !== null){ // watering
        PlantOBj.watering = data.watering;
       }
       if(data.watering_general_benchmark !== null){ // watering bench mark
        PlantOBj.watering_general_benchmark = {
            unit:data.watering_general_benchmark.unit,
            numdays:data.watering_general_benchmark.value,

        }
       }
       if(data.care_guides !== null){ // care guide
        PlantOBj.careGUides = data.care_guides;
       }

       const emojiMap = { //********* emojis **********/
        name: "🌿 Name:",
        type: "🌱 Type:",
        attracts: "🦋 Attracts:",
        careLevel: "🧑‍🌾 Care Level:",
        cycle: "♻️ Cycle:",
        thumbnailImg: "🖼️ Image:",
        description: "📖 Description:",
        drought_tolerant: "☀️ Drought Tolerant:",
        edible_fruit: "🍓 Edible Fruit:",
        edible_leaf: "🥬 Edible Leaf:",
        flowering_season: "🌸 Flowering Season:",
        growth_rate: "📈 Growth Rate:",
        dimensions: "📏 Dimensions:",
        harvest_season: "🌾 Harvest Season:",
        hardiness: "❄️ Hardiness Zone:",
        hardiness_location: "🗺️ Hardiness Location:",
        indoor: "🏠 Indoor:",
        thorny: "🌵 Thorny:",
        tropical: "🌴 Tropical:",
        hybrid: "🧪 Hybrid:",
        invasive: "🚫 Invasive:",
        maintenance: "🔧 Maintenance:",
        medicinal: "💊 Medicinal:",
        origin: "📍 Origin:",
        pest_susceptibility: "🐛 Pests:",
        poisonous_to_humans: "☠️ Poisonous to Humans:",
        poisonous_to_pets: "🐕 Poisonous to Pets:",
        propagation: "🌱 Propagation:",
        pruning_month: "✂️ Pruning Months:",
        soil: "🪨 Soil Type:",
        sunlight: "☀️ Sunlight:",
        watering: "🚿 Watering:",
        watering_general_benchmark: "📆 Watering Frequency:",
        careGUides: "📚 Care Guide:"
      };

      function getHardinessExplanation(zone) {
        const explanations = {
          "1": "🥶 Extremely cold, suitable only for the most cold-hardy plants (Alaska-like).",
          "2": "❄️ Very cold winters, only arctic-tolerant species survive.",
          "3": "🌨️ Cold winters, short growing season. Great for alpine plants.",
          "4": "⛄ Cold but manageable. Hardy perennials do well here.",
          "5": "🌬️ Cool climate. Apples, berries, and cold-season vegetables thrive.",
          "6": "🍁 Mildly cold winters. Roses, lilies, and many herbs grow well.",
          "7": "🌤️ Moderate winters, long growing season. Most garden plants love it.",
          "8": "☀️ Warm climate. Citrus, olives, and lavender flourish here.",
          "9": "🔥 Hot and mild winters. Ideal for tropical and Mediterranean plants.",
          "10": "🌴 Very warm. Almost frost-free. Great for bananas, palms, hibiscus.",
          "11": "🏝️ Tropical. Year-round warmth. Exotic plants thrive.",
          "12": "🌞 Ultra-tropical. Rarely any temperature drop.",
          "13": "💧 Hot and humid. Only tropical rainforest plants survive."
        };
      
        return explanations[zone] || "No explanation available.";
      }
           console.log(PlantOBj);
           summary.innerHTML = "";

           
    // Display the plants--------------------------------------------------------------

           if(PlantOBj.name !== ""){
            var plantname = document.createElement('p');
            plantname.innerHTML ='<strong>🌿 Name:</strong>' +PlantOBj.name;
            renderPlants.append(plantname);
           }
           if(PlantOBj.type !== ""){
            var planttype = document.createElement('p');
            planttype.innerHTML ='<strong>🌱 Type:</strong>' +PlantOBj.type;
            renderPlants.append(planttype);
          }
          if(PlantOBj.attracts.length > 1){
            var attarcts = document.createElement('p');
            attarcts.innerHTML = `<strong>🦋 This plant attracts: </strong>`+ PlantOBj.attracts;
          }
          if(PlantOBj.thumbnailImg !== ""){
            var plantthumbnailImg = document.createElement('img');
            plantthumbnailImg.src = PlantOBj.thumbnailImg;
            plantthumbnailImg.style.width = "300px";
            plantthumbnailImg.style.height = "300px";
            plantthumbnailImg.style.borderRadius = "8px";
            renderPlants.append(plantthumbnailImg);
         }
         if(PlantOBj.description !== ""){
            var plantdis = document.createElement('p');
            plantdis.innerHTML =`<strong>📖 Description: </strong>` +PlantOBj.description;
            renderPlants.append(plantdis);
         }
         var caringHeader = document.createElement('h3');
         caringHeader.innerHTML = `<strong> CARE TIPS </strong>`
         caringHeader.style.textDecoration = "underline";
         caringHeader.style.fontWeight = "bold"; 
         var createcardiv = document.createElement('div');
         createcardiv.classList.add('createcardiv')
         createcardiv.append(caringHeader);
         renderPlants.append(createcardiv)

         if(PlantOBj.indoor === "true"){
            var plantinddor = document.createElement('p');
            plantinddor.innerHTML = " 🏠 This is an indoor plant";
            createcardiv.append(plantinddor);
         }else{
            var plantinddor = document.createElement('p');
            plantinddor.innerHTML = " 🌞 This is an Outdoor plant";
            createcardiv.append(plantinddor);
         }
         if(PlantOBj.careLevel !== ""){
            var plantcarelevel = document.createElement('p');
            plantcarelevel.innerHTML = `<strong>🧑‍🌾 Care Level: </strong>`+PlantOBj.careLevel;
            createcardiv.append(plantcarelevel);
        }
        if(PlantOBj.careGUides !== ""){
            var careguideurl = document.createElement('a');
            careguideurl.href = PlantOBj.careGUides;
            careguideurl.textContent = "📎 Click ME - Care Guide"; 
            careguideurl.target = "_blank";
            createcardiv.append(careguideurl);
        }
        if(PlantOBj.maintenance !== null){
            var plantmaintenance = document.createElement('p');
            plantmaintenance.innerHTML = `<strong>🔧 Maintenance: </strong>`+PlantOBj.maintenance
            createcardiv.append(plantmaintenance);
        }
        if(PlantOBj.soil.length > 0){
            var plantsoil = document.createElement('p');
            plantsoil.innerHTML = `<strong>🪨 Soil:</strong>`+PlantOBj.soil
            createcardiv.append(plantsoil);

        }
        if(PlantOBj.sunlight !== ""){
            var plantsun = document.createElement('p');
            plantsun.innerHTML = `<strong>☀️ Sunlight: </strong>`+PlantOBj.sunlight
            createcardiv.append(plantsun);
            
        }
        if(PlantOBj.watering !== ""){
            var planwatering = document.createElement('p');
            planwatering.innerHTML = `<strong>🚿 Watering: </strong>`+PlantOBj.watering
            createcardiv.append(planwatering);
        }
        if (PlantOBj.watering_general_benchmark && PlantOBj.watering_general_benchmark.numdays){
            var wateringBenchmark = document.createElement('p');
            wateringBenchmark.innerHTML = `<strong>📆  Watering Frequency:</strong> ${PlantOBj.watering_general_benchmark.numdays} ${PlantOBj.watering_general_benchmark.unit}`;
            createcardiv.append(wateringBenchmark);
        }
        if(PlantOBj.pruning_month !== ""){
            var planypruningmonth = document.createElement('p');
            planypruningmonth.innerHTML = `<strong>✂️ Pruning Months:</strong>`+PlantOBj.pruning_month;
            createcardiv.append(planypruningmonth);
        }
        if(PlantOBj.propagation !== ""){
            var plantpropagation = document.createElement('p');
            plantpropagation.innerHTML = `<strong>🌱 Propagation: </strong>`+PlantOBj.propagation;
            createcardiv.append(plantpropagation);
        }
        if(PlantOBj.harvest_season !== ""){
            var plantharvest_season = document.createElement('p');
            plantharvest_season.innerHTML =`<strong>🌾 Harvest Season:</strong>`+PlantOBj.harvest_season;
            createcardiv.append(plantharvest_season);
        }
        var plantheaderHeader = document.createElement('h3');
        plantheaderHeader.innerHTML = `<strong> plant Anatomy  </strong>`
        plantheaderHeader.style.textDecoration = "underline";
        plantheaderHeader.style.fontWeight = "bold"; 
        var plantanatomydiv = document.createElement('div');
        plantanatomydiv.classList.add('plantanatomydiv')
        plantanatomydiv.append(plantheaderHeader);
        renderPlants.append(plantanatomydiv)

        if(PlantOBj.origin !== ""){
            var plantorigin = document.createElement('p');
            plantorigin.innerHTML = PlantOBj.origin;
            plantanatomydiv.append(plantorigin);
        }

        if(PlantOBj.growth_rate !== ""){
            var plantgrowth_rate = document.createElement('p');
            plantgrowth_rate.innerHTML = `<strong>📈 Growth rate: </strong>`+PlantOBj.growth_rate;
            plantanatomydiv.append(plantgrowth_rate);
        }
        if(PlantOBj.drought_tolerant === "true"){
            var plantgrought = document.createElement('p');
            plantgrought.innerHTML = `<strong>☀️ This plant is Drought Tolerant:</strong>`;
            plantanatomydiv.append(plantgrought);
        }
        if(PlantOBj.edible_fruit === true){
            var plantediblefruits = document.createElement('p');
            plantediblefruits.innerHTML =  "🍓 Contains Edible fruits";
            plantanatomydiv.append(plantediblefruits)
        }else{
            var plantediblefruits = document.createElement('p');
            plantediblefruits.innerHTML =  "🍓Does not Contains Edible fruits";
            plantanatomydiv.append(plantediblefruits)
        }
        if(PlantOBj.edible_leaf === true){
            var plantedibleaf = document.createElement('p');
            plantedibleaf.innerHTML =  "🥬 Contains Edible leaf";
            plantanatomydiv.append(plantedibleaf)
        }else{
            var plantedibleaf = document.createElement('p');
            plantedibleaf.innerHTML =  "🥬 Does not Contains Edible leaf";
            plantanatomydiv.append(plantedibleaf)
        }
        if(PlantOBj.flowering_season !== ""){
            var plantflowering_season = document.createElement('p');
            plantflowering_season.innerHTML = `<strong>🌸 Flowering Season: </strong>`+PlantOBj.flowering_season
            plantanatomydiv.append(plantflowering_season);
        }
        if(PlantOBj.dimensions && PlantOBj.dimensions.max_value && PlantOBj.dimensions.min_value){
            var plantdim = document.createElement('p');
            plantdim.innerHTML = `<strong>Dimension:</strong> Height can be from Minimum ${PlantOBj.dimensions.min_value}" "${PlantOBj.dimensions.unit} to Maximun ${PlantOBj.dimensions.max_value}" "${PlantOBj.dimensions.unit}`;
            plantanatomydiv.append(plantdim);
            }
       if (PlantOBj.hardiness && PlantOBj.hardiness.min === PlantOBj.hardiness.max) {
         const hardinessMin = PlantOBj.hardiness.min;
         const hardinessMax = PlantOBj.hardiness.max;
         const p = document.createElement('p');
         p.innerHTML = `🌡️ <strong>Hardiness Zone:</strong> ${hardinessMin} to ${hardinessMax}<br/>${getHardinessExplanation(hardinessMin)}`;
        plantanatomydiv.appendChild(p);       
        }
        if (PlantOBj.hardiness_location?.full_iframe) {
                const wrapper = document.createElement('div');
                wrapper.innerHTML = PlantOBj.hardiness_location.full_iframe;

                wrapper.style.display = "inline-block";
                wrapper.style.margin = "0";
                wrapper.style.padding = "0";
                wrapper.style.textAlign = "center";
                
                const iframe = wrapper.querySelector('iframe');
                if (iframe) {
                  iframe.style.width = "400px";
                  iframe.style.height = "200px";
                  iframe.style.margin = "0";
                  iframe.style.padding = "0";
                  iframe.style.border = "none";
                  iframe.style.borderRadius = "12px";
                  iframe.style.boxShadow = "0 2px 8px rgba(0,0,0,0.2)";
                }
              
                plantanatomydiv.appendChild(wrapper);
        }
        if (PlantOBj.hardiness && PlantOBj.hardiness.min !== PlantOBj.hardiness.max) {
                const hardinessMin = PlantOBj.hardiness.min;
                const hardinessMax = PlantOBj.hardiness.max;
              
                const p = document.createElement('p');
                p.innerHTML = `
                  🌡️ <strong>Hardiness Zones:</strong> ${hardinessMin} to ${hardinessMax}<br/>
                  <strong>Zone ${hardinessMin}:</strong> ${getHardinessExplanation(hardinessMin)}<br/>
                  <strong>Zone ${hardinessMax}:</strong> ${getHardinessExplanation(hardinessMax)}
                `;
                plantanatomydiv.appendChild(p);
        }   
        if(PlantOBj.thorny === "false"){
        var plantthorny = document.createElement('p');
        plantthorny.innerHTML=" 🌵 This plant does not have thorn"
        plantanatomydiv.append(plantthorny);
        }else{
             var plantthorny = document.createElement('p');
        plantthorny.innerHTML=" 🌵 This plant contains thorn"
        plantanatomydiv.append(plantthorny);
        }
        if(PlantOBj.invasive === "false"){
            var invasep = document.createElement('p')
            invasep.innerHTML =" 🚫 This plant is invasive"
            plantanatomydiv.append(invasep);
        }else{
            var invasep = document.createElement('p')
            invasep.innerHTML =" 🔸 This plant is not invasive"
            plantanatomydiv.append(invasep);
        }
        if(PlantOBj.medicinal === "true"){
            var medplant = document.createElement('p')
            medplant.innerHTML =" 💊 This plant is medicinal"
            plantanatomydiv.append(medplant);
        }else{
            var medplant = document.createElement('p')
            medplant.innerHTML =" 🚫 This plant is not medicinal"
            plantanatomydiv.append(medplant);
        }
        if(PlantOBj.poisonous_to_humans === "false"){
            var p = document.createElement('p')
            p.innerHTML = "☠️ Poisonous to Humans"
            plantanatomydiv.append(p);
        }else{
            var p = document.createElement('p')
            p.innerHTML = "👩‍🌾 / 👨‍🌾 Not Poisonous to Humans";
            plantanatomydiv.append(p);
        }
        if(PlantOBj.poisonous_to_pets === "false"){
            var p = document.createElement('p')
            p.innerHTML = " ☠️ Poisonous to pets"
            plantanatomydiv.append(p);
        }else{
            var p = document.createElement('p')
            p.innerHTML = "🐕 Not Poisonous to pets";
            plantanatomydiv.append(p);
        }
        if(PlantOBj.pest_susceptibility.length > 0){
            var p = document.createElement('p');
            p.innerHTML =`<strong>🐛 Pests:</strong>`+ PlantOBj.pest_susceptibility;
            renderPlants.append(p);
        }
           //----------Append button------------->
              summary.append(nextbtn);
              nextbtn.innerHTML=" Next ➡️   ";
              summary.append(prevbtn);
              prevbtn.innerHTML="Previous ⬅️";
            //----------Append button------------->
          
          
        }).catch(err => {
            console.error("Error:", err);
            summary.innerHTML = `❌ ${err.message}`;
          });      
        
}

