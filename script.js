const TEACHERS = ['Jelena', 'Jules'];
const USER_TYPES = [ // YOU CAN CHANGE NAMES BUT KEEP POSITIONS
    {name: "Administrateur", password: "admin", userSelectionNeeded: false}, //can do all actions, keep at position 0 in array
    {name: "Parent ou élève de l'école d'escalade", userSelectionNeeded: true, authorizedActions:[3,2]},
    {name: "Moniteur", password: "m", userSelectionNeeded: true, authorizedActions:[0,1,4,5]},
    {name: "Membre du comité directeur du CAF", password: "CAF", userSelectionNeeded: false, authorizedActions:[4]},
] 
const ACTIONS = [
    {name: "Créer une séance", function: createSession}, //0
    {name: "Modifier une séance", function: modifySession}, //1
    {name: "Voir les statistiques de l'élève", function: viewUserStats}, //2
    {name: "S'inscrire à une séance", function: signUp}, //3
    {name: "Voir les statistiques globales", function: viewGlobalStats}, //4
    {name: "Facturer", function: bill}, //5
];
const PAGES = [userTypeSelection, checkPassword, userSelection, actionSelection, actionPage];
const MAIN = document.getElementById("main");
let currentUserType = null; //index
let currentUser = null; //doc object or text
let currentAction = null; //index
let currentPage = 0;
let lastPage = 0;
let forward = true;
//####################################################################################################################

displayPage(0);

//####################################################################################################################

function displayPage(pageNumber){
    forward = currentPage - lastPage >= 0;
    console.log("#######################################")
    console.log(`Current page: ${currentPage} (from ${lastPage}) forward: ${forward}`);
    console.log(`Current userType: ${currentUserType}`);
    if (currentUser) {
        console.log(`Current user: ${currentUser.data().firstName} ${currentUser.data().lastName}`);
        console.log(`Id: ${currentUser.id}`);
    }else{console.log("No user selected")};
    MAIN.innerHTML = '';
    let section = document.createElement("section");
    section.setAttribute('id', `page_${pageNumber}`);
    MAIN.appendChild(section);
    PAGES[pageNumber](section);
    if (pageNumber>0) {
        createBackButton(MAIN);
    }
}
//========================================= PAGE 1 (userType selection) =========================
function userTypeSelection(target){
    currentUserType = null;
    createUserTypeMenu(target);
}
function createUserTypeMenu(target){
    function addUserTypeToList (userTypeIndex, ul){
        let li = document.createElement('li');
        let a = document.createElement('a');
        a.innerText = USER_TYPES[userTypeIndex].name;
        a.href = "#";
        li.setAttribute('id', "userType_"+userTypeIndex);
        li.appendChild(a);
        ul.appendChild(li);
        li.addEventListener('click', (e) => {
            e.stopPropagation();
            lastPage = currentPage;
            currentPage++;
            currentUserType = userTypeIndex;
            console.log("going to next page");
            console.log(`UserType selected: ${USER_TYPES[currentUserType].name}`);
            displayPage(currentPage);
        });
    }
    let container = document.createElement('div');
    container.setAttribute('id', "userTypeMenu");
    let txt = document.createElement('div');
    txt.innerText = "Vous êtes qui ?";
    let ul = document.createElement('ul');
    ul.setAttribute('id', "userTypeList");
    container.appendChild(txt); //display text
    container.appendChild(ul); //display user type list
    target.appendChild(container);
    //add all users except for admin
    for (let i = 1; i < USER_TYPES.length; i++) {
        addUserTypeToList(i, ul);
    }
    addUserTypeToList(0, ul); //add admin
    //container.style.display = '';
}
//========================================= PAGE 2 (password check) =========================
function checkPassword(target){
    if (forward) {
        if (USER_TYPES[currentUserType].password){//if password protected
            console.log("Checking password");
            createPasswordForm(target, f => {
                currentPage++;
                displayPage(currentPage)
                return;
            });
        }else{
            console.log("This userType doesn't need a password");
            lastPage = currentPage;
            currentPage++;
            displayPage(currentPage);
            return;
        }
    }else{//backwards
        console.log("No need to check password going backwards");
        lastPage = currentPage;
        currentPage--;
        displayPage(currentPage);
        return;
    }
}
function createPasswordForm(target, functionIfRight){
    console.log("Creating password form");
    let passwordForm = document.createElement("form");
    let label = document.createElement("label");
    label.setAttribute('for', 'input');
    label.innerText = "Mot de passe : ";
    let input = document.createElement("input");
    input.setAttribute('name', 'input');
    input.setAttribute('placeholder', 'Mot de passe');
    input.setAttribute('type', 'password');
    let button = document.createElement("button");
    button.innerText = "OK";
    passwordForm.appendChild(label);
    passwordForm.appendChild(input);
    passwordForm.appendChild(button);
    target.appendChild(passwordForm);
    input.focus();
    passwordForm.addEventListener('submit', (e) => {
        e.preventDefault();
        if (input.value.toLocaleUpperCase() == USER_TYPES[currentUserType].password.toUpperCase()) {
            passwordForm.remove();
            functionIfRight();
        }else{
            console.log("Mauvais mot de passe");
            alert("Mauvais mot de passe");
            input.value = '';
        }
        
    });
}
//========================================= PAGE 3 (user selection) =========================
function userSelection(target){
    currentUser = null;
    if (USER_TYPES[currentUserType].userSelectionNeeded) { //if selection needed
        if (currentUserType == 2) { //if teacher
            createTeacherMenu(target);
        }else if (currentUserType == 1) {//if parent of kid
            createNameList(target);
        }
    }else{ //if CAF or admin
        console.log("no user selection needed, skip");
        if (forward) {
            currentUser = USER_TYPES[currentUserType].name;
            lastPage = currentPage;
            currentPage++;
            displayPage(currentPage);
        }else{//backwards
            lastPage = currentPage;
            currentPage--;
            displayPage(currentPage);
        }
    }
}
function createTeacherMenu(target){
    function addTeacherToList (teacherIndex, ul){
        let li = document.createElement('li');
        let a = document.createElement('a');
        a.innerText = TEACHERS[teacherIndex];
        a.href = "#";
        li.setAttribute('id', TEACHERS[teacherIndex]);
        li.appendChild(a);
        ul.appendChild(li);
        li.addEventListener('click', (e) => {
            e.stopPropagation();
            lastPage = currentPage;
            currentPage++;
            console.log("going to next page")
            console.log(`Teacher selected: ${TEACHERS[teacherIndex]}`);
            currentUser = TEACHERS[teacherIndex];
            displayPage(currentPage, 2);
        });
    }
    let container = document.createElement('div');
    container.setAttribute('id', "teacherMenu");
    let txt = document.createElement('div');
    txt.innerText = "Quel moniteur es-tu ?";
    let ul = document.createElement('ul');
    ul.setAttribute('id', "teacherList");
    container.appendChild(txt); //display text
    container.appendChild(ul); //display user type list
    target.appendChild(container);
    //add all teacher
    for (let i = 0; i < TEACHERS.length; i++) {
        addTeacherToList(i, ul);
    }
}
function createNameList(target){
    let txt = document.createElement('div');
    txt.innerText = 'Cliquez sur un nom'
    let input = document.createElement('input');
    input.setAttribute('name', 'input');
    input.setAttribute('id', 'nameInput');
    input.placeholder = 'Nom';
    input.setAttribute('onInput', 'sortNames()')
    let label = document.createElement('label');
    label.setAttribute = ('for', 'input');
    label.innerText = ('Trier les noms : ');
    let ul = document.createElement('ul');
    ul.setAttribute('id', 'nameList');
    let wait = document.createElement('li');
    wait.innerText = "Veuillez patienter...";
    ul.appendChild(wait);
    target.appendChild(txt);
    target.appendChild(label);
    target.appendChild(input);
    target.appendChild(ul);
    db.collection('users').orderBy('firstName').get().then(snapshot => {
        snapshot.docs.forEach(doc => {
            let li = document.createElement("li");
            let a = document.createElement('a');
            a.innerText = doc.data().firstName +" "+doc.data().lastName;
            a.href="#";
            li.setAttribute('id', doc.id);
            li.appendChild(a); 
            ul.appendChild(li);
            li.addEventListener('click', (e) => {
                e.stopPropagation();
                currentUser = doc;
                lastPage = currentPage;
                currentPage++;
                displayPage(currentPage)
            });
        });
        target.appendChild(ul);
        wait.remove();
    });  
}
function sortNames() {
    let input, filter, nameList, names, a, i, txtValue;
    input = document.getElementById('nameInput');
    filter = input.value.toUpperCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    nameList = document.getElementById("nameList");
    names = nameList.getElementsByTagName('li');
  
    // Loop through all list items, and hide those who don't match the search query
    for (i = 0; i < names.length; i++) {
      a = names[i].getElementsByTagName("a")[0];
      txtValue = a.textContent || a.innerText;
      if (txtValue.toUpperCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").indexOf(filter) > -1) {
        names[i].style.display = "";
      } else {
        names[i].style.display = "none";
      }
    }
  }
//========================================= PAGE 4 (action selection) =========================
function actionSelection(target){
    let h1 = document.createElement('h1');
    h1.innerText = `${currentUser.data().firstName} ${currentUser.data().lastName}`;
    target.appendChild(h1);
    if (document.getElementById("actionMenu")) {
        document.getElementById("actionMenu").remove();
    }
    createActionMenu(target);
}
function createActionMenu(target){ 
    function addActionToList(actionIndex, ul){
        let action = ACTIONS[actionIndex];
        let li = document.createElement('li');
        let a = document.createElement('a');
        a.innerText = action.name;
        a.href = "#";
        li.setAttribute('id', "action_"+actionIndex);
        li.appendChild(a);
        ul.appendChild(li);
        li.addEventListener('click', (e) => {
            e.stopPropagation();
            currentAction = actionIndex;
            lastPage = currentPage;
            currentPage++;
            displayPage(currentPage);
        });
    }
    function authorizedActions(userTypeIndex){//return array of indexes
        if (userTypeIndex == 0) { //if admin
            let result = [];
            for (let i = 0; i < ACTIONS.length; i++) {
                result.push(i);
            }
            return result; //return array with all ACTIONS
        }else if (userTypeIndex) {
            if (userTypeIndex>=ACTIONS.length){//if index doesn't exit in ACTIONS array
                console.log("Ne trouve pas l'utilisateur, index trop grand");
                return [];
            }else{//if everything is normal
                return USER_TYPES[userTypeIndex].authorizedActions; //return array of indexes
            }
        }else{//if index is undefined
            console.log("Erreur, pas d'index d'utilisateur choisi");
            return [];
        }
    }
    let container = document.createElement('div');
    container.setAttribute('id', "actionMenu");
    let txt = document.createElement('div');
    txt.innerText = "Voici les actions possible en tant que "+USER_TYPES[currentUserType].name;
    let ul = document.createElement('ul');
    ul.setAttribute('id', "authorizedActionList");
    container.appendChild(txt); //display text
    container.appendChild(ul); //display action list
    target.appendChild(container);
    authorizedActions(currentUserType).forEach(actionIndex => addActionToList(actionIndex, ul));
}
//========================================= PAGE 5 (action page) =============================
function actionPage(target){
    console.log("Welcome to the action page");
    console.log("action selected: "+ACTIONS[currentAction].name);
    ACTIONS[currentAction].function();
}
//@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@--- ACTIONS ---@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@

//========================================= ACTION 1 (create session) =============================
function createSession(){

}
//========================================= ACTION 2 (modify session) =============================
function modifySession(){

}
//========================================= ACTION 3 (view User stats) =============================
function viewUserStats(){

}
//========================================= ACTION 4 (signup) =============================
function signUp(){
    console.log("Signing up");

}
function getUpcomingSession(id){
    //populate upcoming session
    let upcomingSessions = document.getElementById("upcomingSessions");
    upcomingSessions.textContent ='';
    db.collection('sessions').orderBy('startTimestamp').get().then(snapshot => {
        snapshot.docs.forEach(doc => {
            let timeLeft = doc.data().startTimestamp - Date.now();
            if (timeLeft>0) {
                let li = document.createElement("li");
                let a = document.createElement('a');
                let span = document.createElement('span');
                span.innerText = " Annuler";
                a.innerText = dayjs(new Date(doc.data().startTimestamp)).format("dddd D MMMM H[h]mm") + " à " + doc.data().location;
                a.href="#";
                li.setAttribute('id', doc.id);
                li.appendChild(a); 
                li.appendChild(span);
                upcomingSessions.appendChild(li);
                //if you click on session
                a.addEventListener('click', (e) => {
                    e.stopPropagation();
                    selectedSessions.push(doc.id);
                    e.path[1].style.background = 'chartreuse';
                    selectedSessions = unique(selectedSessions);
                    console.log(selectedSessions);
                });
                //if you click on ANNULER
                span.addEventListener('click', (e) => {
                    e.stopPropagation();                    
                    const index = selectedSessions.indexOf(doc.id)
                    if (index > -1) {
                        selectedSessions.splice(index, 1);
                        e.path[1].style.background = '';
                      }
                });//end click
            }//end if timeLeft
        });//end forEach
    });
}
//========================================= ACTION 5 (view global stats) =============================
function viewGlobalStats(){

}
//========================================= ACTION 6 (bill) =============================
function bill(){
    
}
//########################################## GENERIC FUNCTIONS ######################################

function createBackButton(container){
    
    if (document.getElementById('backButton')) {
        document.getElementById('backButton').remove();
    }
    let button = document.createElement('button');
    button.setAttribute('id', 'backButton');
    button.innerText = `Retour à la page ${currentPage-1}`;
    container.appendChild(button);
    button.addEventListener('click', (e) => {
        e.stopPropagation();
        if (currentPage > 0) {
            lastPage = currentPage;
            currentPage--;
        }
        displayPage(currentPage);
    });
}
function hideChildren(target){ // unused
    for (let i = 0; i < target.children.length; i++) {
        target.children[i].style.display = 'none';
    }
}
function unique(array) { // unused
    return Array.from(new Set(array));
}