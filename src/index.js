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

function createTeamRequest(team) {
  // POST teams-json/create
  return fetch("http://localhost:3000/teams-json/create", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(team)
  }).then(r => r.json());
}

function getTeamsAsHtml({ id, promotion, members, name, url }) {
  const stringToReplace = "https://github.com/";
  const displayUrl = url.startsWith(stringToReplace) ? ".../" + url.substring(stringToReplace.length) : url;
  const row = `<tr>
    <td>${promotion}</td>
    <td>${members}</td>
    <td>${name}</td>
    <td><a href="${url}" target="_blank">${displayUrl}</a></td>
    <td>
    <a data-id="${id}" class="remove-btn" href="#">✖</a> 
    <a data-id="${id}" class="edit-btn" href="#">&#9998</a></td>
    </tr>`;
  return row;
}

let previewDisplayTeams = [];
function displayTeams(teams) {
  if (previewDisplayTeams === teams) {
    console.warn("same teams already displayed");
    return;
  }
  if (teams.length === previewDisplayTeams) {
    console.log("leng");
    if (teams.every((team, i) => team === previewDisplayTeams[i])) {
      console.warn("sameContent");
      return;
    }
  }
  previewDisplayTeams = teams;
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
  setTeamValues(team);
}

function setTeamValues({ promotion, members, name, url }) {
  $("#promotion").value = promotion;
  $("#members").value = members;
  $("input[name=name]").value = name;
  $("input[name=url]").value = url;
}

function getTeamValues() {
  const promotion = $("#promotion").value;
  const members = $("#members").value;
  const name = $("input[name=name]").value;
  const url = $("input[name=url]").value;
  return {
    promotion,
    members,
    name: name,
    url: url
  };
}

function onSubmit(e) {
  e.preventDefault();
  const team = getTeamValues();
  if (editId) {
    team.id = editId;
    updateTeamRequest(team).then(status => {
      if (status.success) {
        // v 1
        // window.location.reload();

        //v 2
        //loadTeams();

        //v 3
        //const i = allTeams.findIndex(t => t.id === editId);
        //allteams[i] = team;

        //v 4 - schimbam expplicit valorile modificate
        // const edited = allTeams.find(t => t.id === editId);
        // edited.name = team.name;
        // edited.promotion = team.promotion;
        // edited.members = team.members;
        // edited.url = team.url;

        // v 5 - Object.assign

        // allTeams = [...allTeams];
        // const edited = allTeams.find(t => t.id === editId);
        // Object.assign(edited, team);

        // V 6
        allTeams.map(t => {
          if (t.id === editId) {
            // intoarce t cu toate elementele si se schimba numai cele continute in team
            return {
              ...t,
              ...team
            };
          }
          return t;
        });
        displayTeams(allTeams);
        $("#teamsForm").reset();
      }
    });
  } else {
    createTeamRequest(team).then(status => {
      if (status.success) {
        // v1
        // window.location.reload();
        //v 2
        //loadTeams();

        //v3
        console.info("saved", JSON.parse(JSON.stringify(team)));
        team.id = status.id;
        // allTeams.push(team);
        allTeams = [...allTeams, team]; // trebie recreat modificat array-ul
        displayTeams(allTeams);
        $("#teamsForm").reset();
      }
    });
  }
}

function filterElements(elements, search) {
  search = search.toLowerCase();
  return elements.filter(element => {
    return Object.entries(element).some(entry => {
      if (entry[0] !== "id") {
        return entry[1].toLowerCase().includes(search);
      }
    });
  });
}

function filterTeams(allTeams, searchText) {
  return allTeams.filter(team => {
    return Object.entries(team).some(entry => {
      if (entry[0] !== "id") {
        return entry[1].toLowerCase().includes(searchText);
      }
    });
  });
}

function searchTeams(e) {
  let searchText = e.target.value.toLowerCase();
  const teams = filterElements(allTeams, searchText);
  //console.log(teams);
  displayTeams(teams);
}

function initEvents() {
  $("#teamsTable tbody").addEventListener("click", e => {
    if (e.target.matches("a.remove-btn")) {
      const id = e.target.dataset.id;
      deleteTeamRequest(id, ({ success }) => {
        if (success) {
          console.warn("delete done", success``);
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
  $("#teamsForm").addEventListener("reset", () => {
    displayTeams(allTeams);
    console.warn("reset");
    editId = undefined;
  });
  $("#searchTeams").addEventListener("input", searchTeams);
}

loadTeams();
initEvents();
