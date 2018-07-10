/*
  Array of team objects from selected league, and array of html paragraphs for
  all of the matches that will take place in theat league.
*/
var currentLeague;
var allMatches = [];

function leagueSelect() {
  allMatches = [];
  var choice = document.getElementById("leagueChoice").value;
  var custom = false;
  switch (choice) {
    case "English Premier League":
      currentLeague = copy(english1);
      break;
    case "Spanish BBVA":
      currentLeague = copy(spain1);
      break;
    case "German Bundesliga":
      currentLeague = copy(german1);
      break;
    case "Italian Serie A":
      currentLeague = copy(italian1);
      break;
    case "French Ligue 1":
      currentLeague = copy(french1);
      break;
    case "Custom League":
      currentLeague = addCustomLeague(document.getElementById("teamCountDropdown").value);
      custom = true;
      break;
  }
  if (!custom) {
    clearScreen();
  } else {
    clearCustom();
  }

  playGames();
  calculateGoalDifference();
  sortTable();
  printTeams();
  teamMatchDropdown();
}

/*
  Check to see if the selected league is the 'Custom League' option and apply
  additional option for selecting number of teams required.
*/
function isCustom() {
  var customTeamDiv = document.getElementById("customTeamChoice");
  if (document.getElementById("leagueChoice").value !== "Custom League") {
    clearScreen();
    document.getElementById("simulateButton").disabled = false;
  } else {
    clearCustom();
    document.getElementById("simulateButton").disabled = true;
    customTeamDiv.innerHTML = "Select number of teams in your custom league: ";
    var teamCountDropdown = document.createElement("select");
    teamCountDropdown.id = "teamCountDropdown";
    var dropdownValue = document.createElement("option");
    dropdownValue.innerHTML = "No. of teams";
    dropdownValue.disabled = true;
    dropdownValue.selected = true;
    teamCountDropdown.appendChild(dropdownValue);
    for (i = 2; i < 25; i++) {
      var option = document.createElement("option");
      option.innerHTML = i;
      teamCountDropdown.appendChild(option);
      customTeamDiv.appendChild(teamCountDropdown);
    }

    document.getElementById("teamCountDropdown").onchange = createTeamInputs;
  }
}

/*
  Create the input fields so the user can enter their custom teams and provide
  a rating for each team.
*/
function createTeamInputs() {
  var teamInputSection = document.getElementById("teamInputs");
  teamInputSection.innerHTML = "";
  var numberSelected = document.getElementById("teamCountDropdown").value;

  for (i = 0; i < numberSelected; i++) {
    var inputName = document.createElement("input");
    var inputRating = document.createElement("input");
    var ratingOutput = document.createElement("span");
    inputRating.type = "range";
    inputRating.min = "0";
    inputRating.max = "10";
    inputRating.value = "5";
    ratingOutput.innerHTML = inputRating.value;
    inputName.id = "customTeam" + i;
    inputRating.id = "customRating" + i;
    ratingOutput.id = "customOutput" + i;
    ratingOutput.value = inputRating.value;
    teamInputSection.appendChild(inputName);
    teamInputSection.appendChild(inputRating);
    teamInputSection.appendChild(ratingOutput);
    teamInputSection.appendChild(document.createElement("br"));
    document.getElementById("customRating" + i).oninput = updateRating;
    document.getElementById("customRating" + i).onchange = updateRating;
  }

  document.getElementById("simulateButton").disabled = false;
}

/*
  Update the rating shown as the user moves the slider.
*/
function updateRating() {
  var customId = document.getElementById(this.id).id.toString();
  var lastChar;
  if (customId.charAt(customId.length - 2) === 'g') {
    lastChar = customId.slice(-1);
  } else {
    lastChar = customId.slice(-2);
  }

  var ratingChange = document.getElementById(this.id).value;
  var newText = document.getElementById("customOutput" + lastChar);
  newText.innerHTML = ratingChange;
}

/*
  Create the custom league based on the user's input.
*/
function addCustomLeague(customTeamCount) {
  var customLeague1 = [];
  for (i = 0; i < customTeamCount; i++) {
    var customTeamString = "customTeam" + i;
    var customRatingString = "customRating" + i;
    var customTeamName = document.getElementById(customTeamString).value;
    var customTeamRating = parseInt(document.getElementById(customRatingString).value);
    customLeague1.push({ name: customTeamName, rating: customTeamRating, played: 0,
      won: 0, drawn: 0, lost: 0, for: 0, against: 0, difference: 0, points: 0, });
  }

  //return array of team objects
  return customLeague1;
}

// Create a full copy of the selected league array.
function copy(o) {
  var output, v, key;
  output = Array.isArray(o) ? [] : {};
  for (key in o) {
    v = o[key];
    output[key] = (typeof v === "object") ? copy(v) : v;
  }

  return output;
}

function playGames() {
  for (i = 0; i < currentLeague.length; i++) {
    for (j = 0; j < currentLeague.length; j++) {
      if (i === j) {
        //Do nothing.
      } else {

        var homeTeam = currentLeague[i];
        var awayTeam = currentLeague[j];
        var homeGoalsCalc = Math.random();
        var awayGoalsCalc = Math.random();
        var homeGoalsBase = [0, 0.189126, 0.4923347, 0.7405876, 0.8836486, 0.95325995, 0.98336568,
          0.994509045, 0.999755162, 0.9999154571, 0.9999762519, 1];
        var awayGoalsBase = [0, 0.338255, 0.700301, 0.89333, 0.9675393, 0.9906832, 0.999742953,
          0.999698712, 0.999960795, 0.9999898624, 0.9999979312, 1];

        // Calculate different scoring ranges for teams that are not equal in rating.
        if (!(currentLeague[i].rating === currentLeague[j].rating)) {
          var ratingDifference = (Math.max(currentLeague[i].rating, currentLeague[j].rating) -
                                  Math.min(currentLeague[i].rating, currentLeague[j].rating));
          var homeGoalsRating = [0];
          var awayGoalsRating = [0];
          if (currentLeague[i].rating > currentLeague[j].rating) {

            for (k = 1; k < homeGoalsBase.length - 1; k++) {
              rangeDifference = homeGoalsBase[k] - homeGoalsBase[k - 1];
              var rangePercentage = rangeDifference * (ratingDifference / 10);
              var adjustedRange = homeGoalsBase[k] - rangePercentage;
              homeGoalsRating.push(adjustedRange);
            }

            homeGoalsRating.push(1);
            homeGoalsBase = homeGoalsRating;

            for (m = 1; m < awayGoalsBase.length - 1; m++) {
              rangeDifference = awayGoalsBase[m] - awayGoalsBase[m - 1];
              var rangePercentageAway = rangeDifference * (ratingDifference / 10);
              var adjustedRangeAway = awayGoalsBase[m] + rangePercentageAway;
              awayGoalsRating.push(adjustedRangeAway);
            }

            awayGoalsRating.push(1);
            awayGoalsBase = awayGoalsRating;

          } else {

            for (m = 1; m < homeGoalsBase.length - 1; m++) {
              rangeDifference = homeGoalsBase[m] - homeGoalsBase[m - 1];
              var rangePercentage2 = rangeDifference * (ratingDifference / 10);
              var adjustedRange2 = homeGoalsBase[m] + rangePercentage2;
              homeGoalsRating.push(adjustedRange2);
            }

            homeGoalsRating.push(1);
            homeGoalsBase = homeGoalsRating;

            for (k = 1; k < awayGoalsBase.length - 1; k++) {
              rangeDifference = awayGoalsBase[k] - awayGoalsBase[k - 1];
              var rangePercentageAway2 = rangeDifference * (ratingDifference / 10);
              var adjustedRangeAway2 = awayGoalsBase[k] - rangePercentageAway2;
              awayGoalsRating.push(adjustedRangeAway2);
            }

            awayGoalsRating.push(1);
            awayGoalsBase = awayGoalsRating;
          }
        }

        // Calculate number of home goals scored.
        if (homeGoalsCalc <= homeGoalsBase[1]) {
          homeGoals = 0;
        } else if (homeGoalsBase[1] < homeGoalsCalc && homeGoalsCalc <= homeGoalsBase[2]) {
          homeGoals = 1;
        } else if (homeGoalsBase[2] < homeGoalsCalc && homeGoalsCalc <= homeGoalsBase[3]) {
          homeGoals = 2;
        } else if (homeGoalsBase[3] < homeGoalsCalc && homeGoalsCalc <= homeGoalsBase[4]) {
          homeGoals = 3;
        } else if (homeGoalsBase[4] < homeGoalsCalc && homeGoalsCalc <= homeGoalsBase[5]) {
          homeGoals = 4;
        } else if (homeGoalsBase[5] < homeGoalsCalc && homeGoalsCalc <= homeGoalsBase[6]) {
          homeGoals = 5;
        } else if (homeGoalsBase[6] < homeGoalsCalc && homeGoalsCalc <= homeGoalsBase[7]) {
          homeGoals = 6;
        } else if (homeGoalsBase[7] < homeGoalsCalc && homeGoalsCalc <= homeGoalsBase[8]) {
          homeGoals = 7;
        } else if (homeGoalsBase[8] < homeGoalsCalc && homeGoalsCalc <= homeGoalsBase[9]) {
          homeGoals = 8;
        } else if (homeGoalsBase[9] < homeGoalsCalc && homeGoalsCalc <= homeGoalsBase[10]) {
          homeGoals = 9;
        } else if (homeGoalsBase[10] < homeGoalsCalc <= 1) {
          homeGoals = 10;
        }

        // Calculate number of away goals scored.
        if (awayGoalsCalc <= awayGoalsBase[1]) {
          awayGoals = 0;
        } else if (awayGoalsBase[1] < awayGoalsCalc && awayGoalsCalc <= awayGoalsBase[2]) {
          awayGoals = 1;
        } else if (awayGoalsBase[2] < awayGoalsCalc && awayGoalsCalc <= awayGoalsBase[3]) {
          awayGoals = 2;
        } else if (awayGoalsBase[3] < awayGoalsCalc && awayGoalsCalc <= awayGoalsBase[4]) {
          awayGoals = 3;
        } else if (awayGoalsBase[4] < awayGoalsCalc && awayGoalsCalc <= awayGoalsBase[5]) {
          awayGoals = 4;
        } else if (awayGoalsBase[5] < awayGoalsCalc && awayGoalsCalc <= awayGoalsBase[6]) {
          awayGoals = 5;
        } else if (awayGoalsBase[6] < awayGoalsCalc && awayGoalsCalc <= awayGoalsBase[7]) {
          awayGoals = 6;
        } else if (awayGoalsBase[7] < awayGoalsCalc && awayGoalsCalc <= awayGoalsBase[8]) {
          awayGoals = 7;
        } else if (awayGoalsBase[8] < awayGoalsCalc && awayGoalsCalc <= awayGoalsBase[9]) {
          awayGoals = 8;
        } else if (awayGoalsBase[9] < awayGoalsCalc && awayGoalsCalc <= awayGoalsBase[10]) {
          awayGoals = 9;
        } else if (awayGoalsBase[10] < awayGoalsCalc <= 1) {
          awayGoals = 10;
        }

        /* Add a paragraph element to the 'allMatches' array,
        which contains the text output for each fixture. */

        var thisGame = currentLeague[i].name + ' ' + homeGoals + ' - ' + awayGoals + ' ' +
         currentLeague[j].name;
        allMatches.push(thisGame);

        // Update team totals after fixture result.
        currentLeague[i].played++;
        currentLeague[j].played++;
        currentLeague[i].for += homeGoals;
        currentLeague[j].for += awayGoals;
        currentLeague[i].against += awayGoals;
        currentLeague[j].against += homeGoals;
        if (homeGoals > awayGoals) {
          currentLeague[i].won++;
          currentLeague[j].lost++;
          currentLeague[i].points += 3;
        } else if (awayGoals > homeGoals) {
          currentLeague[j].won++;
          currentLeague[i].lost++;
          currentLeague[j].points += 3;
        } else {
          currentLeague[i].drawn++;
          currentLeague[j].drawn++;
          currentLeague[i].points++;
          currentLeague[j].points++;
        }
      }
    }
  }
}

// Print the final league table.
function printTeams() {

  // Create table.
  var leagueTable = document.createElement('table');
  leagueTable.id = 'leagueTable';
  var leagueHeader = document.createElement('tr');
  leagueHeader.id = 'leagueHeader';
  document.getElementById('displayTable').appendChild(leagueTable);
  document.getElementById('leagueTable').appendChild(leagueHeader);
  var headerTags = ['P', 'W', 'D', 'L', 'F', 'A', 'GD', 'Pts'];
  var headerTagCount = 0;
  for (i = 0; i < 10; i++) {
    var headerTd = document.createElement('td');
    document.getElementById('leagueHeader').appendChild(headerTd);
    if (i > 1) {
      headerTd.innerHTML = headerTags[headerTagCount];
      headerTagCount++;
    }
  }

  // For each team, create a row in the table.
  var teamCount = 1;
  currentLeague.forEach(function (teams) {

    var teamRow = document.createElement('tr');
    teamRow.id = teams.name;
    var teamDataArray = [];
    var teamData = [teams.name, teams.played, teams.won, teams.drawn, teams.lost, teams.for,
       teams.against, teams.difference, teams.points];

    for (i = 0; i < teamData.length; i++) {
      var teamName = document.createElement('td');
      teamDataArray.push(teamName);
      teamName.innerHTML = teamData[i];
    }

    document.getElementById('leagueTable').appendChild(teamRow);
    var position = document.createElement('td');
    position.innerHTML = teamCount;
    document.getElementById(teams.name).appendChild(position);
    teamDataArray.forEach(function (data) {
      document.getElementById(teams.name).appendChild(data);
    });

    teamCount++;
  });
}

// Calculate each team's goal difference.
function calculateGoalDifference() {
  currentLeague.forEach(function (teams) {
    teams.difference = teams.for - teams.against;
  });
}

// Sort final league table based on points, goal difference and goals for.
function sortTable() {
  currentLeague.sort(function (a, b) {
    if (a.points === b .points) {
      if (a.difference === b.difference) {
        return b.for - a.for;
      } else {
        return b.difference - a.difference;
      }
    } else {
      return b.points - a.points;
    }
  });
}

// Add all of the fixture's text to the body of the page.
function printMatches() {
  allMatches.forEach(function (match) {
    document.getElementById("matches").appendChild(match);
  });
}

// Create a dropdown menu so a team can be selected to view their results.
function teamMatchDropdown() {
  var teamList = document.getElementById("teamSelectMenu");
  teamList.innerHTML = "";
  var dropdown = document.createElement("select");
  dropdown.id = "teamSelect";
  document.getElementById("teamSelectMenu").appendChild(dropdown);
  var disabledOption = document.createElement("option");
  disabledOption.innerHTML = "Select a Team";
  disabledOption.disabled = true;
  disabledOption.selected = true;
  document.getElementById("teamSelect").appendChild(disabledOption);
  currentLeague.forEach(function(team) {
    var teamOption = document.createElement("option");
    teamOption.innerHTML = team.name;
    document.getElementById("teamSelect").appendChild(teamOption);
  });
  var teamMatchSubmit = document.createElement("input");
  teamMatchSubmit.type = "submit";
  teamMatchSubmit.id = "teamMatch";
  document.getElementById("teamSelectMenu").appendChild(teamMatchSubmit);
  teamMatchSubmit.value = "Show Results";
  document.getElementById("teamMatch").addEventListener("click", printMatchesOneTeam);
}

// Display only the selected team's results.
function printMatchesOneTeam() {
  var matchesArea = document.getElementById("matches");
  matchesArea.innerHTML = "";
  var selectedTeam = document.getElementById("teamSelect").value;
  var fixtureHeading = document.createElement("div");
  fixtureHeading.innerHTML = selectedTeam + " Fixtures";
  fixtureHeading.style = "font-size: 24px; font-weight: bold;";
  matchesArea.appendChild(fixtureHeading);
  var matchArray = [];
  allMatches.forEach(function(match) {
    if (match.indexOf(selectedTeam) != -1) {
      matchArray.push(match);
    }
  });
  // Shuffle the array to print matches in a random order.
  var count = matchArray.length, index, temp;
  while(count > 0) {
    index = Math.floor(Math.random() * count);
    count--;
    temp = matchArray[count];
    matchArray[count] = matchArray[index];
    matchArray[index] = temp;
  }
  matchArray.forEach(function(currentTeamMatch) {
    var homeAwayTag = document.createElement("span");
    if (currentTeamMatch.indexOf(selectedTeam) > 0) {
      homeAwayTag.innerHTML = "<strong>A</strong>";
      matchesArea.appendChild(homeAwayTag);
    } else {
      homeAwayTag.innerHTML = "<strong>H</strong>";
      matchesArea.appendChild(homeAwayTag);
    }
    var currentFixture = document.createElement('span');
    currentFixture.innerHTML = currentTeamMatch;
    currentFixture.style = "margin: 10px 0 10px 5px; display: inline-block;";
    matchesArea.appendChild(currentFixture);
    matchesArea.appendChild(document.createElement("br"));
  });
}

// Clear the league table and the matches.
function clearScreen() {
  document.getElementById("displayTable").innerHTML = "";
  document.getElementById("teamSelectMenu").innerHTML = "";
  document.getElementById("matches").innerHTML = "";
  document.getElementById("teamInputs").innerHTML = "";
  document.getElementById("customTeamChoice").innerHTML = "";
}

// Clear screen function for custom leagues only.
function clearCustom() {
  document.getElementById("displayTable").innerHTML = "";
  document.getElementById("matches").innerHTML = "";
  document.getElementById("teamSelectMenu").innerHTML = "";
}
