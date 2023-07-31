// import { debounce } from "lodash"; // bad - do not import all library
import { updateTeamRequest, createTeamRequest, deleteTeamRequest, loadTeamsRequest } from "./middleware";
//import * as middleware from "./middleware";
import "./style.css";
import { $, $$, debounce, filterElements, mask, unmask, sleep } from "./utilities";
// import debounce from "lodash/debounce";

let allTeams = [];
let editId;
const form = "#teamsForm";

function getTeamAsHTML({ id, promotion, members, name, url }) {
  // const displayUrl = url.startsWith("https://github.com/") ? url.substring(19) : url;
  return `<tr>
    <td style="text-align:center"><input type="checkbox" name="selected" value="${id}"</td>
    <td>${promotion}</td>
    <td>${members}</td>
    <td>${name}</td>
    <td><a href="${url}" target="_blank">${url}</a></td>
    <td>
      <button type="button" data-id="${id}" class="action-btn edit-btn">📝</button>
      <button type="button" data-id="${id}" class="action-btn remove-btn">🗑</button>
    </td>
  </tr>`;
}

function getTeamAsHTMLInputs({ id, promotion, members, name, url }) {
  return `<tr>
  <td>&nbsp;</td>
  <td>
    <input type="text" name="promotion" value="${promotion}" 
      placeholder="Enter Promotion" required />
  </td>
  <td>
    <input type="text" name="members" value="${members}" 
      placeholder="Enter Members" required />
  </td>
  <td>
    <input type="text" name="name" value="${name}" 
      placeholder="Enter Project name" required />
  </td>
  <td>
    <input type="text" name="url" value="${url}" 
      placeholder="Enter Url" required />
  </td>
  <td>
    <button type="submit" class="action-btn">💾</button>
    <button type="reset" class="action-btn">✖️</button>
  </td>
</tr>`;
}

let previewDisplayTeams = [];

function displayTeams(teams, editId, force) {
  if (!force && !editId && teams === previewDisplayTeams) {
    console.warn("same teams already displayed");
    return;
  }

  if (force !== true && !editId && teams.length === previewDisplayTeams.length) {
    if (teams.every((team, i) => team === previewDisplayTeams[i])) {
      console.warn("same content");
      return;
    }
  }

  previewDisplayTeams = teams;
  console.warn("displayTeams", teams);
  const teamsHTML = teams.map(team => (team.id === editId ? getTeamAsHTMLInputs(team) : getTeamAsHTML(team)));
  $("#teamsTable tbody").innerHTML = teamsHTML.join("");
}

/**
 *
 * @returns {Promise<{id: string, promotion: string}[]>}
 */
function loadTeams() {
  return loadTeamsRequest().then(teams => {
    allTeams = teams;
    displayTeams(teams);
    return teams;
  });
}

function startEdit(id) {
  editId = id;
  //const team = allTeams.find(team => team.id == id);
  //setTeamValues(team);
  displayTeams(allTeams, id);
  setInputsDisabled(true);
}

function setInputsDisabled(disabled) {
  $$("tfoot input, tfoot button").forEach(el => {
    el.disabled = disabled;
  });
}

function setTeamValues({ promotion, members, name, url }) {
  $("#promotion").value = promotion;
  $("#members").value = members;
  $("input[name=name]").value = name;
  $("input[name=url]").value = url;
}

function getTeamValues() {
  const promotion = $("input[name=promotion]").value;
  const members = $("input[name=members]").value;
  const name = $("input[name=name]").value;
  const url = $("input[name=url]").value;
  return {
    promotion,
    members,
    name: name,
    url: url
  };
}

async function onSubmit(e) {
  e.preventDefault();

  const team = getTeamValues();

  mask(form);
  let status;

  if (editId) {
    team.id = editId;
    //status = await middleware.updateTeamRequest(team);
    status = await updateTeamRequest(team);
    if (status.success) {
      allTeams = allTeams.map(t => {
        if (t.id === editId) {
          console.warn("team", team);
          // return team;
          // return { ...team };
          return {
            ...t,
            ...team
          };
        }
        return t;
      });
    }
  } else {
    status = await createTeamRequest(team);
    if (status.success) {
      //console.info("saved", JSON.parse(JSON.stringify(team)));
      team.id = status.id;
      allTeams = [...allTeams, team];
    }
  }

  if (status.success) {
    displayTeams(allTeams);
    $("#teamsForm").reset();
    unmask(form);
  }
}

async function removeSelected() {
  mask("#main");
  console.time("remove");
  const selected = $$("input[name=selected]:checked");
  const ids = [...selected].map(input => input.value);
  const promises = ids.map(id => deleteTeamRequest(id));
  promises.push(sleep(2000));
  const statuses = await Promise.allSettled(promises); //da un alt promiise care va veni dupa ce se termina toate promisiunil
  console.timeEnd("remove");
  console.log(statuses);

  //metoda veche
  // selected.forEach(input => {
  //   deleteTeamRequest(input.value);
  // });
  await loadTeams();
  unmask("#main");
}

function initEvents() {
  $("#removeSelected").addEventListener("click", debounce(removeSelected, 200));

  $("#searchTeams").addEventListener(
    "input",
    debounce(function () {
      console.info(this.value);
      const teams = filterElements(allTeams, this.value);
      displayTeams(teams);
    }, 400)
  );

  $("#selectAll").addEventListener("input", e => {
    const checkboxes = $$("input[name=selected]");

    checkboxes.forEach(checkbox => {
      checkbox.checked = e.target.checked;
    });
    // if (e.target.checked) {
    //   checkboxes.forEach(element => {
    //     element.checked = true;
    //   });
    // } else {
    //   checkboxes.forEach(element => {
    //     element.checked = false;
    //   });
    // }
  });
  $("#teamsTable tbody").addEventListener("mouseover", e => {
    const cell = e.target.closest("td");
    if (cell) {
      //console.info(cell, cell.offsetWidth < cell.scrollwidth);
      cell.title = cell.offsetWidth < cell.scrollwidth ? cell.textContent : "";
    }
  });

  $("#teamsTable tbody").addEventListener("click", e => {
    if (e.target.matches(".remove-btn")) {
      const id = e.target.dataset.id;
      //console.warn("remove %o", id);
      mask(form);
      deleteTeamRequest(id, async ({ success }) => {
        if (success) {
          await loadTeams();
          unmask(form);
        }
      });
    } else if (e.target.matches(".edit-btn")) {
      const id = e.target.dataset.id;
      startEdit(id);
    }
  });

  $("#teamsForm").addEventListener("submit", onSubmit);
  $("#teamsForm").addEventListener("reset", () => {
    if (editId) {
      editId = undefined;
      displayTeams(allTeams, editId, true);
      console.warn("reset");
      setInputsDisabled(false);
    }
  });
}

initEvents();

(async () => {
  mask(form);
  await loadTeams();
  unmask(form);
})();
