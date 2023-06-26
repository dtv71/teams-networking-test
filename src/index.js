import "./style.css";

let allTeams = [];
let editId;
function $(selector) {
  return document.querySelector(selector);
}

function deleteTeamRequest(id) {
  return fetch("http://localhost:3000/teams-json/delete", {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ id: id })
  }).then(r => r.json());
}

function updateTeamRequest(team) {
  // PUT teams-json/update
  return fetch("http://localhost:3000/teams-json/update", {
    method: "PUT",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(team)
  }).then(r => r.json());
}

function getTeamsAsHtml(team) {
  const row = `<tr>
    <td>${team.promotion}</td>
    <td>${team.members}</td>
    <td>${team.name}</td>
    <td><a href="${team.url}" target="_blank">${team.url}</a></td>
    <td>
    <a data-id="${team.id}" class="remove-btn" href="#">✖</a> 
    <a data-id="${team.id}" class="edit-btn" href="#">&#9998</a></td>
    </tr>`;
  return row;
}
function displayTeams(teams) {
  const teamsHTML = teams.map(getTeamsAsHtml);
  const tbody = $("#teamsTable tbody");
  tbody.innerHTML = teamsHTML.join("");
}

function loadTeams() {
  fetch("http://localhost:3000/teams-json", {
    method: "GET",
    headers: {
      "Content-Type": "appplication/json"
    }
  })
    .then(r => r.json())
    .then(teams => {
      allTeams = teams;
      displayTeams(teams);
    });
}

function startEdit(id) {
  editId = id;
  const team = allTeams.find(team => team.id == id);
  console.log(team);
  $("#promotion").value = team.promotion;
  $("#members").value = team.members;
  $("input[name=name]").value = team.name;
  $("input[name=url]").value = team.url;
}

function onSubmit(e) {
  e.preventDefault();
  const promotion = $("#promotion").value;
  const members = $("#members").value;
  const name = $("input[name=name]").value;
  const url = $("input[name=url]").value;
  const team = {
    id: editId,
    promotion,
    members,
    name: name,
    url: url
  };
  console.warn("submit", team);
  updateTeamRequest(team).then(status => {
    if (status.success) {
      window.location.reload();
    }
  });
}
function initEvents() {
  $("#teamsTable tbody").addEventListener("click", e => {
    if (e.target.matches("a.remove-btn")) {
      const id = e.target.dataset.id;
      deleteTeamRequest(id).then(status => {
        if (status.success) {
          console.warn("delete done", status);
          loadTeams();
        }
      });
    } else if (e.target.matches("a.edit-btn")) {
      const id = e.target.dataset.id;

      startEdit(id);
      // console.warn("edit", e.target.parentNode);
    }
  });
  $("#teamsForm").addEventListener("submit", onSubmit);
}

loadTeams();
initEvents();
