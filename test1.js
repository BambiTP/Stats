

        // Function to combine properties of two objects
        function combineObjects(obj1, obj2) {
            var combinedStats = {};

            // Iterate over properties of stats1
            for (var prop in obj1) {
                // Check if property exists in obj2 and both properties are objects
                if (obj2.hasOwnProperty(prop) && typeof obj1[prop] === 'object' && typeof obj2[prop] === 'object') {
                    // Recursively combine nested objects
                    combinedStats[prop] = combineObjects(obj1[prop], obj2[prop]);
                } else {
                    combinedStats[prop] = obj1[prop];
                }
            }

            // Iterate over properties of stats2
            for (var prop in obj2) {
                // Skip properties already present in combinedStats
                if (!combinedStats.hasOwnProperty(prop)) {
                    combinedStats[prop] = obj2[prop];
                }
            }

            return combinedStats;
        }

        // Function to combine stats1 and stats2 when the button is clicked
        document.getElementById("combineButton").addEventListener("click", function() {
            // Create the stats3 object by combining properties of stats1 and stats2
            var stats3 = combineObjects(stats, stats1);
console.log('Actions:', actions);
console.log('Team 1:', team1);
console.log('Team 2:', team2);
            // Log the stats3 object to the console
            console.log(stats3);
        });
