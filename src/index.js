import "./style.css";
// starting the app
function loadTeams() {
  const request = fetch("teams.json");
  const response = request.then(r => r.json());
  console.warn("response", response);
  const r2 = response.then(result => {
    console.warn(result);
  });
}

loadTeams();
