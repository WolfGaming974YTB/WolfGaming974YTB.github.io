
let username, password;
const authEndpoint = 'https://zone01normandie.org/api/auth/signin';
const graphqlEndpoint = 'https://zone01normandie.org/api/graphql-engine/v1/graphql';
var data, data2;
var token;

function Logout() {
  const form = document.getElementById('LogForm');
  const Graph = document.getElementById("AllGraph");

  GraphSkillGo = document.getElementById('graphContainer')
  GraphSkillGo.innerHTML = "";
  GraphXp = document.getElementById('graphContainerProgress')
  GraphXp.innerHTML = "";
  password = document.getElementById('password');
  password.value = ""
  token = ""
  data = ""
  data2 = ""
  var allGraphDiv = document.getElementById("Profile");
  var imgElement = allGraphDiv.querySelector("img");
  console.log(imgElement)
  if (imgElement) {
    allGraphDiv.removeChild(imgElement);
  }
  form.style.display = ""
  Graph.style.display = "none"
  localStorage.removeItem('token');
}

function FunctionLogAPI() {
  username = document.getElementById('username').value;
  password = document.getElementById('password').value;
  erreurmessage = document.getElementById("erreurmessage");
  form = document.getElementById('LogForm')
  Graph = document.getElementById("AllGraph")
  let login = async function () {
    const headers = new Headers();
    headers.append('Authorization', 'Basic ' + btoa(username + ':' + password));
    try {
      const response = await fetch(authEndpoint, {
        method: 'POST',
        headers: headers
      });
      const token = await response.json();
      if (response.ok) {
        console.log("ok")
        localStorage.setItem('token', token);
        erreurmessage.style.display = "none"
        form.style.display = "none"
        Graph.style.display = ""

        makeGraphQLRequest(token);
      } else {
        console.log("no", token.message);
        erreurmessage.style.display = ""
        
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };
  login();
}
async function makeGraphQLRequest(token) {
  const headers = new Headers();
  headers.append('Authorization', 'Bearer ' + token);
  try {
    const query = `
    query {
      transaction(where: { type: { _eq: "skill_go" } }, order_by: { amount: asc }) {
        createdAt
        amount
        type
      }
      user {
        xps (where: { originEventId: { _is_null : false } } ) {
          path
          originEventId
          amount
        }
        attrs
      }
    }
    `;
    const response = await fetch(graphqlEndpoint, {
      method: 'POST',
      headers: headers,
      body: JSON.stringify({ query })
    });
    data = await response.json();
    const { transaction, user } = data.data;
    console.log(transaction)
    Information(user);
    generateGraphProgress(user);
    generateGraphTransaction(transaction);
  } catch (error) {
    console.error('Error:', error);
  }
}
function Information(user) {
  firstname = user[0].attrs.firstName
  lastname = user[0].attrs.lastName
  mail = user[0].attrs.email
  images = user[0].attrs.image
  Profile = document.getElementById("Profile")
  Nom = document.getElementById("Lastname")
  Prenom = document.getElementById("Firstname")
  Mail = document.getElementById("email")
  Nom.innerHTML = lastname
  Prenom.innerHTML = firstname
  Mail.innerHTML = mail
  var imagejavascript = document.createElement("img");
  imagejavascript.src = images;
  Profile.appendChild(imagejavascript)
}
var update = 0
function generateGraphProgress(Progressdata) {
  const svgWidth = 400;
  const svgHeight = 300;
  const xAxisName = "Temps\n";
  const yAxisName = "\nXP";
  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.setAttribute("width", svgWidth);
  svg.setAttribute("height", svgHeight);
  var value = 0
  var test = 0
  const amounts = Progressdata[0].xps.map((item) => {
    if (item.path.includes("/rouen/div-01/") && !item.path.includes("/rouen/div-01/piscine-js/") && !item.path.includes("/rouen/div-01/piscine-rust/")) {
      value += item.amount
      console.log(item.path, item.amount, item.originEventId)
      test++
    }
  });
  console.log(test)
  console.log(amounts)
  const xAxisText = document.createElementNS("http://www.w3.org/2000/svg", "text");
  xAxisText.setAttribute("x", svgWidth / 2);
  xAxisText.setAttribute("y", svgHeight - 5);
  xAxisText.setAttribute("text-anchor", "middle");
  xAxisText.textContent = xAxisName;
  const yAxisText = document.createElementNS("http://www.w3.org/2000/svg", "text");
  yAxisText.setAttribute("transform", `rotate(-90) translate(${-svgHeight / 2}, 15)`);
  yAxisText.setAttribute("text-anchor", "middle");
  yAxisText.textContent = yAxisName;
  svg.appendChild(xAxisText);
  svg.appendChild(yAxisText);
  console.log(Progressdata[0])
  const pathData = Progressdata[0].xps.map((item, index) => {
    if (item.path.includes("/rouen/div-01/") && !item.path.includes("/rouen/div-01/piscine-js/") && !item.path.includes("/rouen/div-01/piscine-rust/")) {
      update += item.amount
      const x = (index / (Progressdata[0].xps.length - 1)) * svgWidth;
      const y = svgHeight - (update / value) * svgHeight;
      return `${x},${y}`;
    }
  }).join(" ");
  const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
  path.setAttribute("d", `M ${pathData}`);
  path.setAttribute("fill", "none");
  path.setAttribute("stroke", "steelblue");
  svg.appendChild(path);
  const graphContainerProgress = document.getElementById("graphContainerProgress");
  graphContainerProgress.appendChild(svg);
  const XPTotal = document.getElementById("XPTotal")
  XPTotal.innerHTML = "Total XP : " + value
}

function generateGraphTransaction(transactionData) {
  const svgWidth = 400;
  const svgHeight = 300;
  const barPadding = 5;
  const xAxisName = "Temps\n";
  const yAxisName = "\nPourcentage";
  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.setAttribute("width", svgWidth);
  svg.setAttribute("height", svgHeight);
  const maxValue = Math.max(...transactionData.map(item => item.amount));
  const xAxisText = document.createElementNS("http://www.w3.org/2000/svg", "text");
  xAxisText.setAttribute("x", svgWidth / 2);
  xAxisText.setAttribute("y", svgHeight - 5);
  xAxisText.setAttribute("text-anchor", "middle");
  xAxisText.textContent = xAxisName;
  const yAxisText = document.createElementNS("http://www.w3.org/2000/svg", "text");
  yAxisText.setAttribute("transform", `rotate(-90) translate(${-svgHeight / 2}, 15)`);
  yAxisText.setAttribute("text-anchor", "middle");
  yAxisText.textContent = yAxisName;
  svg.appendChild(xAxisText);
  svg.appendChild(yAxisText);
  transactionData.forEach((item, index) => {
    const barHeight = (item.amount / maxValue) * svgHeight;
    const barWidth = (svgWidth / transactionData.length) - barPadding;
    const x = index * (barWidth + barPadding);
    const y = svgHeight - barHeight;
    const rect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
    rect.setAttribute("x", x);
    rect.setAttribute("y", y);
    rect.setAttribute("width", barWidth);
    rect.setAttribute("height", barHeight);
    rect.setAttribute("fill", "steelblue");
    svg.appendChild(rect);
  });
  const graphContainer = document.getElementById("graphContainer");
  graphContainer.appendChild(svg);
}

window.onload = function () {
  const storedToken = localStorage.getItem('token');
  const form = document.getElementById('LogForm');
  const Graph = document.getElementById("AllGraph");

  if (storedToken) {
    makeGraphQLRequest(storedToken);
    form.style.display = "none";
    Graph.style.display = "";
  }
};
