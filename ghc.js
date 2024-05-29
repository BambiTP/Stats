 const stats = {};
const lastAction = {};
        // Function to handle file input
        // Function to handle file input
async function getFiles() {
    const folderPath = 'stats/matches';

    try {
        // Fetch the list of files in the specified folder from the GitHub repository
        const response = await fetch(`https://bambitp.github.io/${folderPath}`);
        const fileList = await response.text();

        // Assuming the fileList is in a format that can be split into individual file names
        const files = fileList.split('\n');

        // Iterate through each file
        for (const file of files) {
            if (file.trim() !== '') {
                // Fetch the contents of each file
                const fileResponse = await fetch(`https://bambitp.github.io/${folderPath}/${file}`);
                const fileContent = await fileResponse.text();

                // Send the file name and file content to the handleFileSelect function
                handleFileSelect(file, fileContent);
            }
        }
    } catch (error) {
        console.error('Error fetching files:', error);
    }
}


function handleFileSelect(fileName, fileContent) {
    const file = fileContent.target.files[0];
    const reader = new FileReader();

    reader.onload = function(file) {
        const content = fileContent.target.result;
        const teams = extractTeam(content); // Extract teams first
        const actions = extractActions(content, teams); // Pass teams object to extractActions
        calculateTotalGrabholdForEachArray(actions);
        console.log('Team Map:', teams);
        
        // Call extractActions1 last
        const actions1 = extractActions1(content);
    };

    reader.readAsText(file);
}

 const actions = {};
        // Extract actions from the content of the file
        // Extract actions from the content of the file
function extractActions(content, teams) {
    const lines = content.split('\n');
   

    for (const line of lines) {
        if (line.includes('grabs flag') || line.includes('drops flag') || line.includes('captures flag') || line.includes('ends in')) {
            const parts = line.split(/\s+/);
            const timestamp = parts[0];
            let action, name;
            let nameIndex = -1;

            if (line.includes('grabs flag')) {
                action = 'grab';
                nameIndex = parts.indexOf('grabs') - 1;
            } else if (line.includes('drops flag')) {
                action = 'drop';
                nameIndex = parts.indexOf('drops') - 1;
            } else if (line.includes('captures flag')) {
                action = 'capture';
                nameIndex = parts.indexOf('captures') - 1;
            } else {
                action = 'ends in';
                nameIndex = parts.indexOf('ends') - 1;
            }

            // Extract the full name
            name = parts.slice(1, nameIndex + 1).join(' ');

            // Check if the name exists in team1 or team2 and assign the team number
            const teamNumber = getTeamNumber(name, teams);

            if (!actions[name]) {
                actions[name] = [];
            }

            actions[name].push({ timestamp, action, teamNumber });
        }
    } 
    return actions;
}
function getTeamNumber(name, teams) {
    const { team1, team2 } = teams;
    if (team1.hasOwnProperty(name)) {
        return 1;
    } else if (team2.hasOwnProperty(name)) {
        return 2;
    } else {
        // If the player's name is not found in either team, return null or any default value you prefer
        return null;
    }
}
      const team1 = {};
    const team2 = {};     // Extract teams from the content of the file
function extractTeam(content) {
    const lines = content.split('\n');
 

    for (const line of lines) {
        if (line.includes('starts in team') || line.includes('ends in team')) {
            const parts = line.split(/\s+/);
            const nameIndex = parts.indexOf('starts') !== -1 ? parts.indexOf('starts') : parts.indexOf('ends');
            const name = parts.slice(1, nameIndex).join(' '); // Concatenate first and last name
            const teamIndex = parts.indexOf('team');
            const team = parseInt(parts[teamIndex + 1]); // Extract team number

            if (team === 1) {
                team1[name] = team;
            } else if (team === 2) {
                team2[name] = team;
            }
        }
    }

    return { team1, team2 };
}

        // Calculate total hold for each array
 function calculateTotalGrabholdForEachArray(actions) {
    const handoffPotentials = []; // Array to store handoff potential details
    const allGrabActions = []; // Array to store all grab actions
    const allHandoffs = [];
    const allRegrabs = [];
    const regrabPotentials = [];
    for (const arrayName in actions) {
        if (Object.hasOwnProperty.call(actions, arrayName)) {
            const array = actions[arrayName];
            let captureHold = 0, dropHold = 0, keptHold = 0;
            let totalGrabs = 0, totalDrops = 0, totalCaptures = 0, totalKept = 0, falccidGrabs = 0, handoffPotential = 0, handoffGiven = 0, handoffReceived = 0, GoodHandoffReceived = 0, GoodHandoffGiven = 0, CapHandoffGiven = 0,CapHandoffReceived = 0, team = 0, regrabPotential = 0, regrabReceived = 0, regrabGiven = 0, CapRegrabReceived = 0, CapRegrabGiven = 0, GoodRegrabReceived = 0, GoodRegrabGiven = 0;

            for (let i = 0; i < array.length; i++) {
                if (array[i].action === 'grab' && i + 1 < array.length) {
                    const grabTimestamp = array[i].timestamp;
                    const nextAction = array[i + 1].action;
                    const nextTimestamp = array[i + 1].timestamp;
                    const hold = convertTimestampToSeconds(nextTimestamp) - convertTimestampToSeconds(grabTimestamp);

                    // Push grab action details to allGrabActions array
                    allGrabActions.push({
                        timestamp: grabTimestamp,
                        playerName: arrayName,
                        teamNumber: array[i].teamNumber
                    });
team = array[i].teamNumber;
                    if (nextAction === 'capture') {
                        captureHold += hold;
                        totalCaptures++;
                    } else if (nextAction === 'drop' || nextAction === 'capture' ) {
                        dropHold += hold;
                        totalDrops++;
                        if (hold <= 2) {
                            falccidGrabs++;
                        }
                      if (hold <= 3) {
    handoffPotential++;
    // Check for potential handoff and save details
    handoffPotentials.push({
        timestamp: array[i + 1].timestamp,
        playerName: arrayName, // Using arrayName as playerName
        teamNumber: array[i + 1].teamNumber,
        hold: hold
    });
}

if (hold >= 5) {
    regrabPotential++;
    // Check for potential regrab and save details
    regrabPotentials.push({
        timestamp: array[i + 1].timestamp,
        playerName: arrayName,
        teamNumber: array[i + 1].teamNumber,
        hold : hold
    });
}
                    }
else if (nextAction === 'ends in') {
                        keptHold += hold;
                        totalKept++;
                    }
                    totalGrabs++;
                }
            }
            // Initialize handoff stats for the player
            stats[arrayName] = {
                captureHold: convertSecondsToMinutesSeconds(captureHold),
                dropHold: convertSecondsToMinutesSeconds(dropHold),
                keptHold: convertSecondsToMinutesSeconds(keptHold),
                totalHold: convertSecondsToMinutesSeconds(captureHold + dropHold + keptHold),
                captures: totalCaptures,
                drops: totalDrops,
                grabs: totalGrabs,
                keptFlags: totalKept,
                falccidGrabs: falccidGrabs,
                handoffPotential: handoffPotential,
                handoffReceived: handoffReceived, // Initialize handoff received
                handoffGiven: handoffGiven, // Initialize handoff given
                GoodHandoffReceived: GoodHandoffReceived,
                GoodHandoffGiven: GoodHandoffGiven,
                CapHandoffGiven: CapHandoffGiven,
                CapHandoffReceived: CapHandoffReceived,
                team: team, 
                regrabPotential: regrabPotential,
                regrabReceived: regrabReceived,
                regrabGiven: regrabGiven,
                CapRegrabReceived:CapRegrabReceived,
                CapRegrabGiven:CapRegrabGiven,
                GoodRegrabReceived:GoodRegrabReceived,
                GoodRegrabGiven:GoodRegrabGiven,
            };
        }
    }
 for (const regrab of regrabPotentials) {
        const regrabTimestamp = convertTimestampToSeconds(regrab.timestamp);
        for (const graber of allGrabActions) {
            const graberTimestamp = convertTimestampToSeconds(graber.timestamp);
            const timeDiff = graberTimestamp - regrabTimestamp;
            if (timeDiff >= 0 && timeDiff <= 2) {
                if (graber.teamNumber === regrab.teamNumber) {
                    // Increment handoff received for the grabber and handoff given for the dropper
                    stats[graber.playerName].regrabReceived++;
                    stats[regrab.playerName].regrabGiven++;
allRegrabs.push({
                        RegrabGTimestamp: regrab.timestamp,
                        RegrabGPlayerName: regrab.playerName,
                        teamNumber: regrab.teamNumber,
                        RegrabRTimestamp: graber.timestamp,
                        RegrabRName: graber.playerName,
                        RegrabHold: regrab.hold
                    });
                    
                }
            }
        }
    }
    // Process handoff potentials and grab actions
    for (const handoff of handoffPotentials) {
        const handoffTimestamp = convertTimestampToSeconds(handoff.timestamp);
        for (const grab of allGrabActions) {
            const grabTimestamp = convertTimestampToSeconds(grab.timestamp);
            const timeDiff = grabTimestamp - handoffTimestamp;
            if (timeDiff >= 0 && timeDiff <= 2) {
                if (grab.teamNumber === handoff.teamNumber) {
                    // Increment handoff received for the grabber and handoff given for the dropper
                    stats[grab.playerName].handoffReceived++;
                    stats[handoff.playerName].handoffGiven++;
allHandoffs.push({
                        dropTimestamp: handoff.timestamp,
                        dropPlayerName: handoff.playerName,
                        teamNumber: handoff.teamNumber,
                        giveTimestamp: grab.timestamp,
                        giveName: grab.playerName,
                        handoffHold: handoff.hold
                    });
                    
                }
            }
        }
    }
aprocessHandoffs(allHandoffs, actions, stats);
aprocessRegrabs(allRegrabs, actions, stats) ;
    console.log('Stats:', stats);
}

        // Convert timestamp to seconds
        function convertTimestampToSeconds(timestamp) {
            const [minutes, seconds] = timestamp.split(':').map(parseFloat);
            return minutes * 60 + seconds;
        }

        // Convert seconds to minutes and seconds format
        function convertSecondsToMinutesSeconds(seconds) {
            const totalMinutes = seconds / 60;
            const minutes = Math.floor(totalMinutes);
            const remainingSeconds = Math.ceil((totalMinutes - minutes) * 60);
            const roundedSeconds = Math.ceil(remainingSeconds * 100) / 100;
            return `${minutes}:${roundedSeconds < 10 ? '0' : ''}${roundedSeconds >= 60 ? '00' : roundedSeconds}`;
        }

        // Add event listener to file input element
document.getElementById('fileInput').addEventListener('change', handleFileSelect, false);
        // Parse map function
        function parseMap(text) {
            // Find the portion of the text between "MAP" and "TIMELINE"
            const startIndex = text.indexOf("MAP") + 3;
            const endIndex = text.indexOf("TIMELINE");
            const mapText = text.substring(startIndex, endIndex).trim();

            // Extract Map Name
            const mapNameStartIndex = text.indexOf("Map Name:") + 9;
            const mapNameEndIndex = text.indexOf("\n", mapNameStartIndex);
            const mapName = text.substring(mapNameStartIndex, mapNameEndIndex).trim();

            // Split the map text into lines
            const lines = mapText.split('\n');

            // Filter out blank lines and lines containing "Map Name" or "Map Width"
            const filteredLines = lines.filter(line => line.trim() !== '' && !line.includes("Map Name") && !line.includes("Map Width"));

            // Calculate the width of the map
            const width = filteredLines.reduce((maxWidth, line) => Math.max(maxWidth, line.length * 40), 0);

            // Extract the height of the map
            const height = filteredLines.length * 40;

            // Find the coordinates of the ⚑ symbol
            const flagCoordinates = [];
            filteredLines.forEach((line, y) => {
                let x = -1;
                while ((x = line.indexOf('⚑', x + 1)) !== -1) {
                    // Adjust coordinates to start from 0
                    flagCoordinates.push({ x: x * 40, y: (height - 1 - y) * 40 });
                }
            });

            // Determine the x values of flags
            const flagXValues = flagCoordinates.map(flag => flag.x);

            // Determine the x value of the flag with the highest and lowest x values
            const maxX = Math.max(...flagXValues);
            const minX = Math.min(...flagXValues);

            // Label flags based on x values
            const labeledFlags = flagCoordinates.map(flag => ({
                x: flag.x,
                y: flag.y,
                color: flag.x === maxX ? '2' : '1'
            }));

            // Create an object named after the map name to store parsed data
            const mapData = { name: mapName, height, width, flagCoordinates: labeledFlags };

            return mapData;
        }

        // Function to handle file input change
        document.getElementById('fileInput').addEventListener('change', function(e) {
            const file = e.target.files[0];
            if (!file) return;

            const reader = new FileReader();
            reader.onload = function(e) {
                const text = e.target.result;
                const parsedMap = parseMap(text);
                console.log(parsedMap); // Log the parsed map object to the console
                document.getElementById('ascii-map').textContent = JSON.stringify(parsedMap, null, 2);
            };
            reader.readAsText(file);
        });
function aprocessHandoffs(allHandoffs, actions, stats) {
    for (const handoff of allHandoffs) {
        const { giveName, giveTimestamp, dropPlayerName } = handoff;
       
        // Find the array of actions for the player who gave the handoff
        const playerActions = actions[giveName];

       

        // Find the action corresponding to the giveTimestamp
        const giveAction = playerActions.find(action => action.timestamp === giveTimestamp);

      

        if (giveAction) {
            // Find the index of the giveAction
            const giveIndex = playerActions.indexOf(giveAction);

            // Get the next action after the give action
            const nextAction = playerActions[giveIndex + 1];

           

            if (nextAction) {
                const { timestamp: nextTimestamp, action: nextActionType } = nextAction;

               

                // Calculate hold time
                const holdTime = convertTimestampToSeconds(nextTimestamp) - convertTimestampToSeconds(giveTimestamp);

                // Check if hold time is greater than 5 seconds and the next action is a drop
                if (holdTime > 5 && (nextActionType === 'drop' || nextActionType === 'capture' || nextActionType === 'ends in')) {
                    // Increment stats for good handoff received and given
                    stats[giveName].GoodHandoffReceived++;
                    stats[dropPlayerName].GoodHandoffGiven++;

               if (nextActionType === 'capture') {
                  stats[giveName].CapHandoffReceived++;
                  stats[dropPlayerName].CapHandoffGiven++;
                }
            } 
    }

}}}
function aprocessRegrabs(allRegrabs, actions, stats) {
    for (const regrab of allRegrabs) {
        const { RegrabRName, RegrabRTimestamp,  RegrabGPlayerName } = regrab;
    

        // Find the array of actions for the player who gave the handoff
        const playerActions = actions[RegrabRName];

    
        // Find the action corresponding to the giveTimestamp
        const giveAction = playerActions.find(action => action.timestamp === RegrabRTimestamp);


        if (giveAction) {
            // Find the index of the giveAction
            const giveIndex = playerActions.indexOf(giveAction);

            // Get the next action after the give action
            const nextAction = playerActions[giveIndex + 1];

   

            if (nextAction) {
                const { timestamp: nextTimestamp, action: nextActionType } = nextAction;

          

                // Calculate hold time
                const holdTime = convertTimestampToSeconds(nextTimestamp) - convertTimestampToSeconds(RegrabRTimestamp);

                // Check if hold time is greater than 5 seconds and the next action is a drop
                if (holdTime > 5 && (nextActionType === 'drop'|| nextActionType === 'ends in')) {
                    // Increment stats for good handoff received and given
                    stats[RegrabRName].GoodRegrabReceived++;
                    stats[RegrabGPlayerName].GoodRegrabGiven++;
}
               if (nextActionType === 'capture') {
                  stats[RegrabRName].CapRegrabReceived++;
                  stats[RegrabGPlayerName].CapRegrabGiven++;
            stats[RegrabRName].GoodRegrabReceived++;
                    stats[RegrabGPlayerName].GoodRegrabGiven++;
                }
    }

}}}
// Call this function after you have called `extractActions` and `calculateTotalGrabholdForEachArray`
// Example usage:
// processHandoffs(allHandoffs, actions, stats);
