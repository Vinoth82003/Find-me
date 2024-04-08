// admin.js
console.log("admin.js");

function displayTable(teams){
    let tbody = document.querySelector(".tbody");
    tbody.innerHTML = "";
    let index = 1;
    if (teams.length != 0) {
        teams.forEach(team => {
            let tr = document.createElement("tr")
            tr.className = `${team.gameOver ? 'done' : ''}`
            tr.className = `${team.malpractice.length >0 ?"malpractice":"" }`
            tr.innerHTML = (`
                <td> ${index ++} </td>
                <td> ${team.team_name} </td>
                <td> ${team.currentRound} </td>
                <td> ${team.score} </td>
                <td> ${team.images_found} </td>
                <td> ${team.attempts} </td>
                <td> ${team.gameOver ? 'Yes' : 'No'} </td>
                <td> ${team.malpractice.join(', ') } </td>
                <td> ${team.login_punches.join(', ')} </td>
                <td> ${team.logout_punches.join(', ')} </td>
                <td> ${team.gameOverTime? team.gameOverTime: "not finished"} </td>
            `)
            tbody.appendChild(tr);
        });
    }else{
    tbody.innerHTML = ` <tr>
                            <td colspan="11" style="text-align:center">No Participants Yet</td>
                        </tr>`
    }

}

function displayAdmin(admins){
    let ul = document.querySelector(".side_menu");
    ul.innerHTML = '<li class="menu_title">Other Admins</li>';
    admins.forEach(admin => {
        let li = document.createElement("li");
        li.className = "admin_name"
        li.innerHTML = `${admin.name} 
                        <div class="${admin.isActive?"online":"offline"} ball"></div>
                        <p class="logtime ${admin.isActive?"online":"offline"} ">${admin.isActive?admin.loginTime:admin.logoutTime}<p/>
        </li>`;
        ul.appendChild(li)
    });
}

// Function to fetch updated data from the server
function fetchData() {
    console.log("called")
    fetch('/teamData')
        .then(response => response.json())
        .then(data => {
            // Replace the content of the table with the updated data
            // document.querySelector('body').innerHTML = data;
            let teams = data.teams;
            let admins = data.admins;
            document.querySelector(".tag").innerHTML = `${data.currentAdmin} <div class="online ball"></div>`;
            console.log(admins);
            displayTable(teams);
            displayAdmin(admins)
            
        })
        .catch(error => console.error('Error fetching data:', error));
}

fetchData()
// Function to refresh data every 5 seconds
function refreshData() {
    
    setInterval(fetchData, 1000); // 5000 milliseconds = 5 seconds
}

// Call the refreshData function when the page loads
window.addEventListener('load', refreshData);
