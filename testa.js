    const stats1 = {};
   function extractActions1(content) {
    const lines = content.split('\n');
    const actions1 = {};

    for (const line of lines) {
        if (line.includes('returns') || line.includes('powers up') || line.includes('pops') || line.includes('tags')) {
            const parts = line.split(/\s+/);
            const timestamp = parts[0];
            let action, name;
            let nameIndex = -1;

            if (line.includes('returns')) {
                action = 'returns';
                nameIndex = parts.indexOf('returns') - 1;
            } else if (line.includes('powers up')) {
                action = 'powerUps';
                nameIndex = parts.indexOf('powers') - 1;
            } else if (line.includes('pops')) {
                action = 'pops';
                nameIndex = parts.indexOf('pops') - 1;
            } else {
                action = 'tags';
                nameIndex = parts.indexOf('tags') - 1;
            }

            // Extract the full name
            name = parts.slice(1, nameIndex + 1).join(' ');
            

            if (!actions1[name]) {
                actions1[name] = [];
            }
            teamNumber = stats[name].team; 
            actions1[name].push({ timestamp, action, teamNumber});
            addStats(name, action);
        }
    }
findMatchingActions(actions1, actions);
findMatchingActions1(actions1, actions);
    console.log(actions1);
    console.log(stats1);
   console.log(actions);
    return actions1;
}
    function addStats(name, action) {
        if (!stats1[name]) {
            stats1[name] = {
                returns: 0,
                powerUps: 0,
                pops: 0,
                tags: 0,
                quickReturns: 0,
                keyReturns: 0
            };
        }

        stats1[name][action]++;
    }

function findMatchingActions(actions1, actions) {

  // Convert timestamp strings to seconds for easy comparison
  function timestampToSeconds(timestamp) {
    const parts = timestamp.split(':');
    return parseInt(parts[0]) * 60 + parseFloat(parts[1]);
  }

  // Loop through each property (name) in actions1
  Object.keys(actions1).forEach(name1 => {
    actions1[name1].forEach(returnAction => {
      
      if (returnAction.action === 'returns') {
        const returnTime = timestampToSeconds(returnAction.timestamp);
        const returnName = name1;
        // Loop through each property (name) in actions
        Object.keys(actions).forEach(name2 => {
          actions[name2].forEach(grabAction => {
            const grabTime = timestampToSeconds(grabAction.timestamp);
            if (grabAction.action === 'grab' && grabAction.teamNumber !== returnAction.teamNumber && Math.abs(grabTime - returnTime) < 2) {
              addStats(returnName, 'quickReturns');
            }
          });
        });
      }
    });
  });
}
function findMatchingActions1(actions1, actions) {

  // Convert timestamp strings to seconds for easy comparison
  function timestampToSeconds(timestamp) {
    const parts = timestamp.split(':');
    return parseInt(parts[0]) * 60 + parseFloat(parts[1]);
  }

  // Loop through each property (name) in actions1
  Object.keys(actions1).forEach(name1 => {
    actions1[name1].forEach(returnAction => {
      
      if (returnAction.action === 'returns') {
        const returnTime = timestampToSeconds(returnAction.timestamp);
        const returnName = name1;
        // Loop through each property (name) in actions
        Object.keys(actions).forEach(name2 => {
          actions[name2].forEach(captureAction => {
            const captureTime = timestampToSeconds(captureAction.timestamp);
            if (captureAction.action === 'capture' && captureAction.teamNumber == returnAction.teamNumber && Math.abs(captureTime - returnTime) < 3) {
              addStats(returnName, 'keyReturns');
            }
          });
        });
      }
    });
  });
}


