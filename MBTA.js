var obj;
pred_Arr = new Array;
(function(){
   var f = function() {
       console.log('Updating MBTA Predictions...');
        var promise1 = new Promise(function(resolve, reject) {
            var MBTA = new XMLHttpRequest(); //MBTA Predictions API Request
            var url = "https://api-v3.mbta.com/predictions/?filter[route]=85,89,90,95,101,Orange&filter[radius]=0.008&filter[latitude]=42.392977&filter[longitude]=-71.082278&sort=departure_time";
            MBTA.open("GET", url, true);
            MBTA.setRequestHeader('x-api-key', 'APIKEY'); //replace APIKEY with your MBTA API key
            //MBTA.addEventListener("load", mbtaListener);
            MBTA.onreadystatechange = function()
            {
                if(MBTA.readyState == 4 && MBTA.status == 200) { //MBTA API call SUCCESS
                    pred_Arr = []; //Initialize Array of Predictions
                    obj = JSON.parse(MBTA.responseText); //Store output in obj
                    //console.log(obj);
                    var curr_time = new Date(new Date().getTime() - new Date().getTimezoneOffset() * 60000).toISOString();
                    stop_id2name = new Array(30); //Store up to 30 final data points
                    for (let i = 0; i<100; i++) { //for first 50 data points
                        var dep_time = obj.data[i].attributes.departure_time;
                        //console.log(dep_time);
                        if (dep_time !== null && dep_time > curr_time) { //if departure time exists and is after current time
                            var stopName;
                            console.log(stopName);
                            stop_id2name[i] = new XMLHttpRequest(); //API Call to convert Stop ID to friendly name of the stop
                            var id = obj.data[i].relationships.stop.data.id;
                            let url_stops = "https://api-v3.mbta.com/stops/" + id; //pass stopID to MBTA API
                            //stop_id2name.open("GET", url_stops, true);
                            stop_id2name[i].open("GET", url_stops);
                            stop_id2name[i].setRequestHeader('x-api-key', 'APIKEY'); //replace APIKEY with your MBTA API key
                            //dep_time = dep_time.slice(11,16);
                            stop_id2name[i].onreadystatechange = function()
                            {
                                if(stop_id2name[i].readyState == 4 && stop_id2name[i].status == 200) { //Stop ID -> Name API Call SUCCESS
                                    console.log('Getting MBTA Prediction Data...')
                                        out = JSON.parse(stop_id2name[i].responseText); //Store output in out
                                        //console.log(out);
                                        stopName = out.data.attributes.name; //get actual stop name
                                        var prediction = new Object;
                                        prediction.dep_time = obj.data[i].attributes.departure_time.match(/(?<=T)\d\d:\d\d/)[0]; //Convert departure time to hh:mm
                                        prediction.trip = obj.data[i].relationships.trip.data.id;
                                        prediction.route = obj.data[i].relationships.route.data.id;
                                        if (obj.data[i].attributes.direction_id == 1) {
                                            prediction.direction = "In"; //Inbound
                                        } else {
                                            prediction.direction = "Out"; //Outbound
                                        } 
                                        let stop = obj.data[i].relationships.stop.data.id;
                                        prediction.stop = stopName;
                                        //console.log(prediction);
                                        pred_Arr.push(prediction); //Push current prediction to Prediction Array
                                        //console.log(pred_Arr);
                                   if (pred_Arr.length) { //When the Prediction Array has at least length 1
                                       pred_Arr.sort((a,b) => a.dep_time.localeCompare(b.dep_time)); //Sort by departure time
                                       //console.log(pred_Arr);
                                       console.log('Storing...');
                                       setValue("Predicted Stops",pred_Arr) //Sets prop to match pred_Arr
                                        for (j=0; j<5;j++) { //Store first 5 data points into HTML table
                                            if (pred_Arr[j]) {
                                                /*var trainImg = document.createElement("img");
                                                trainImg.setAttribute('src', 'https://www.pngitem.com/pimgs/m/219-2198579_boston-mbta-t-symbol-hd-png-download.png');
                                                trainImg.setAttribute('alt', 'T');
                                                trainImg.width = '100';
                                                trainImg.height = 'auto';
                                                var busImg = document.createElement("img");
                                                busImg.setAttribute('src', 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/32/Icon-mode-bus-default.svg/120px-Icon-mode-bus-default.svg.png');
                                                busImg.setAttribute('alt', 'Bus');
                                                busImg.width = '100';
                                                busImg.height = 'auto';
                                                if (pred_Arr == 'Orange') {
                                                    document.getElementById('sym_r' + j).appendChild(busImg);
                                                } else {
                                                    document.getElementById('sym_r' + j).appendChild(trainImg);
                                                }*/
                                                document.getElementById('line_r' + j).innerHTML = pred_Arr[j].route;
                                                document.getElementById('dir_r' + j).innerHTML = pred_Arr[j].direction;
                                                document.getElementById('stop_r' + j).innerHTML = pred_Arr[j].stop;
                                                document.getElementById('etd_r' + j).innerHTML = pred_Arr[j].dep_time;
                                            }
                                        }
                                   }
                                }
                            }//end stop_id2name
                            stop_id2name[i].send(); //Send Stop ID -> Name API Call
                        }
                        if (pred_Arr.length) {
                            resolve(obj);
                            //console.log(pred_Arr);
                            //console.log(pred_Arr[0]);
                            //console.log(pred_Arr.length);
                        }
                    }//end for loop
                }
            } //end MBTA
            MBTA.send(); //Send MBTA API Call
        })
   };
   window.setInterval(f, 30000); //Run every 30 seconds
   f(); //Initial Run
})();
