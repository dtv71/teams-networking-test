import "./style.css";
// starting the app
function loadTeams() {
  fetch("teams.json")
    .then(r => r.json())
    .then(teams => {
      console.warn(teams);
    });
}

loadTeams();
