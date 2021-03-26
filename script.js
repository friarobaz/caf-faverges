dayjs.locale('fr');
const HOURS_PER_DAY = 8;
const HOUR_RATE = 4.6;
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
    {name: "S'inscrire à des séances", function: signUpPage}, //3
    {name: "Voir les statistiques globales", function: viewGlobalStats}, //4
    {name: "Facturer", function: bill}, //5
    {name: "Pointer une séance", function: point}, //6
];
const PAGES = [userTypeSelection, checkPassword, userSelection, userDashboard, actionPage];
const MAIN = document.getElementById("main");
let currentUserType = null; //index
let currentUser = null; //doc object or text
let currentAction = null; //index
let currentSession = null //doc object
let currentPage = 0;
let lastPage = 0;
let forward = true;
let selectedSessions = [];//array of doc objects
//####################################################################################################################
displayPage(0);

//####################################################################################################################

function displayPage(pageNumber){
    forward = currentPage - lastPage >= 0;
    console.log("#######################################")
    console.log(`Current page: ${currentPage} (from ${lastPage}) forward: ${forward}`);
    console.log(`Current userType: ${currentUserType}`);
    if (currentUserType == 1 && currentUser) {
        console.log(`Current user: ${currentUser.data().firstName} ${currentUser.data().lastName}`);
        console.log(`Id: ${currentUser.id}`);
    }else{console.log("No user selected")};
    MAIN.innerHTML = '';
    let section = document.createElement("section");
    section.setAttribute('id', `page_${pageNumber}`);
    MAIN.appendChild(section);
    PAGES[pageNumber](section, currentUser);
    createBackButton(MAIN);
    
}
//========================================= PAGE 0 (userType selection) =========================
function userTypeSelection(target){
    currentUserType = null;
    createUserTypeMenu(target);
}
function createUserTypeMenu(target){
    function addUserTypeToList (userTypeIndex, ul){
        let li = document.createElement('li');
        let button = document.createElement('button');
        button.innerText = USER_TYPES[userTypeIndex].name;
        li.setAttribute('id', "userType_"+userTypeIndex);
        li.appendChild(button);
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
    let txt = document.createElement('h1');
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
//========================================= PAGE 1 (password check) =========================
function checkPassword(target){
    if (forward) {
        if (USER_TYPES[currentUserType].password){//if password protected
            console.log("Checking password");
            createPasswordForm(target, () => {
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
//========================================= PAGE 2 (user selection) =========================
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
    let h1 = document.createElement('h1');
    h1.innerText = "Nom de l'élève";
    let input = document.createElement('input');
    input.setAttribute('name', 'input');
    input.setAttribute('id', 'nameInput');
    input.placeholder = 'Nom';
    input.setAttribute('onInput', 'sortNames()')
    let label = document.createElement('label');
    label.setAttribute = ('for', 'input');
    label.innerHtml = ('Trier les noms : <br>');
    let ul = document.createElement('ul');
    ul.setAttribute('id', 'nameList');
    let wait = document.createElement('li');
    wait.innerText = "Veuillez patienter...";
    ul.appendChild(wait);
    target.appendChild(h1);
    target.appendChild(label);
    target.appendChild(input);
    target.appendChild(ul);
    db.collection('users').orderBy('firstName').get().then(snapshot => {
        snapshot.docs.forEach(doc => {
            let li = document.createElement("li");
            let button = document.createElement('button');
            button.innerText = doc.data().firstName +" "+doc.data().lastName;
            li.setAttribute('id', doc.id);
            li.appendChild(button); 
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
      a = names[i].getElementsByTagName("button")[0];
      txtValue = a.textContent || a.innerText;
      if (txtValue.toUpperCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").indexOf(filter) > -1) {
        names[i].style.display = "";
      } else {
        names[i].style.display = "none";
      }
    }
  }
//========================================= PAGE 3 (action selection) =========================
function userDashboard(target, user){
    let h1 = document.createElement('h1');
    if (currentUserType == 1) {
        h1.innerText = `${user.data().firstName} ${user.data().lastName}`;
    }else if(currentUserType == 2){
        h1.innerText = user;
    }else{
        h1.innerText = USER_TYPES[currentUserType].name;
    }
    target.appendChild(h1);
    if (document.getElementById("actionMenu")) {
        document.getElementById("actionMenu").remove();
    }
    createActionMenu(target);
    if (currentUserType == 1) {
        displaySessionList(target, false, true, user, "signedUp", false, true, false, false);
    }else if(currentUserType == 2 || currentUserType == 0){//teacher or admin
        displaySessionList(target, true, true, false, false, false, false, true, true);
    }else{
        displaySessionList(target, true, true, false, false, false, false, false, false);
    }
    
}
function createActionMenu(target){ 
    function addActionToList(actionIndex, ul){
        let action = ACTIONS[actionIndex];
        let li = document.createElement('li');
        let button = document.createElement('button');
        button.innerText = action.name;
        li.setAttribute('id', "action_"+actionIndex);
        li.appendChild(button);
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
    let ul = document.createElement('ul');
    ul.setAttribute('id', "authorizedActionList");
    container.appendChild(ul); //display action list
    target.appendChild(container);
    authorizedActions(currentUserType).forEach(actionIndex => addActionToList(actionIndex, ul));
}

//========================================= PAGE 4 (action page) =============================
function actionPage(target, user){
    console.log("Welcome to the action page");
    console.log("action selected: "+ACTIONS[currentAction].name);
    ACTIONS[currentAction].function(target, user);
}
//@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
//@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@--- ACTIONS ---@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
//@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@


//========================================= ACTION 0 (create session) =============================
function createSession(){

}
//========================================= ACTION 1 (modify session) =============================
function modifySession(){

}
//========================================= ACTION 2 (view User stats) =============================
function viewUserStats(target, user){
    let h1 = document.createElement('h1');
    h1.innerText = `${user.data().firstName} ${user.data().lastName}`;
    target.appendChild(h1);
    let signedUp = 0;
    var attended = 0;
    let canceled = 0;
    let name = user.data().firstName;
    // ############### SEANCES
    let sessionsStats = document.createElement('div');
    sessionsStats.classList.add('statList');
    let h3_sessions = document.createElement('h3');
    h3_sessions.innerText = "Séances"
    sessionsStats.appendChild(h3_sessions);
    let signedUpDIV = document.createElement("div");
    sessionsStats.appendChild(signedUpDIV)
    let attendedDIV = document.createElement("div");
    sessionsStats.appendChild(attendedDIV);
    let canceledDIV = document.createElement("div");
    sessionsStats.appendChild(canceledDIV);

    db.collection('sessions').where('signedUp', 'array-contains', user.id).get().then(snapshot=>{
        signedUp = snapshot.size;
        signedUpDIV.innerHTML = `${name} s'est inscrit(e) à <b>${signedUp}</b> séance(s).`;
    });
    db.collection('sessions').where('canceled', 'array-contains', user.id).get().then(snapshot=>{
        canceled = snapshot.size;
        canceledDIV.innerHTML = `${name} a annulé <b>${canceled}</b> séance(s).`;
    });
    target.appendChild(sessionsStats);
    //€
    let moneyStats = document.createElement('div');
    moneyStats.classList.add('statList');
    let h3_money = document.createElement('h3');
    h3_money.innerText = "Paiement"
    moneyStats.appendChild(h3_money);
    let hourRateDIV = document.createElement('div');
    hourRateDIV.innerHTML = `Taux horaire :  <b>${HOUR_RATE} €</b>`;
    moneyStats.appendChild(hourRateDIV);
    let paidDIV = document.createElement('div');
    paidDIV.innerHTML = `Vous avez payé  <b>${user.data().paid} €</b>`;
    moneyStats.appendChild(paidDIV);
    target.appendChild(moneyStats);
    // ############### HEURES
    let hoursStats = document.createElement('div');
    hoursStats.classList.add('statList');
    let h3_hours = document.createElement('h3');
    h3_hours.innerText = "Heures"
    hoursStats.appendChild(h3_hours);
    var attendedHours = 0;
    db.collection('sessions').where('attended', 'array-contains', user.id).get().then(snapshot=>{
        attended = snapshot.size;
        attendedDIV.innerHTML = `${name} a participé à <b>${attended}</b> séance(s).`;
        snapshot.docs.forEach(session=>{
            let duration = session.data().duration;
            let durationDays = session.data().durationDays;
            if (durationDays > 1) {
                duration = HOURS_PER_DAY*durationDays;
            }
            attendedHours += duration;
        })
    }).then(()=>{
        let paidHours = Math.ceil(user.data().paid/HOUR_RATE);
        let remainingHours = paidHours - attendedHours;
        let paidHoursDIV = document.createElement('div');
        paidHoursDIV.innerHTML = `Vous avez payé pour <b>${paidHours}</b> heures de cours.`;
        hoursStats.appendChild(paidHoursDIV);
        let attendedHoursDIV = document.createElement('div');
        attendedHoursDIV.innerHTML = `${name} a pris <b>${attendedHours}</b> heures de cours.`;
        hoursStats.appendChild(attendedHoursDIV);
        let remainingHoursDIV = document.createElement('div');
        if (remainingHours>=0) {
            remainingHoursDIV.innerHTML = `Il lui reste <b>${remainingHours}</b> heures de cours.`;
        }else{
            remainingHoursDIV.innerHTML = `Vous avez dépassé votre quotas d'heures.`;
        }
        
        hoursStats.appendChild(remainingHoursDIV);
        target.appendChild(hoursStats);
    });

}
//========================================= ACTION 3 (signup) =============================
function signUpPage(target){
    displaySessionList(target, false, true, false, false, true, false, false, false);
}
function signUp(user, session){
    console.log(`Signing up ${currentUser.data().firstName} to ${session.data().startDate}`);
    return db.collection('sessions').doc(session.id).update({
        signedUp: firebase.firestore.FieldValue.arrayUnion(user.id)
    })
    .then(() => {
        console.log("Document successfully updated!");
    })
    .catch((error) => {
        console.error("Error updating document: ", error);
    });
}
function unSignUp (user, session){
    console.log(`UnSigning up ${currentUser.data().firstName} to ${session.data().startDate}`);
    return db.collection('sessions').doc(session.id).update({
        signedUp: firebase.firestore.FieldValue.arrayRemove(user.id)
    })
    .then(() => {
        console.log("Document successfully updated!");
    })
    .catch((error) => {
        console.error("Error updating document: ", error);
    });
}
//========================================= ACTION 4 (view global stats) =============================
function viewGlobalStats(){

}
//========================================= ACTION 5 (bill) =============================
function bill(){
    
}
//========================================= ACTION 6 (point) =============================
function point(target){
    let div = document.createElement('div');
    div.style.marginBottom = "20px";
    displaySession(currentSession, div, false, false, false, false);
    target.appendChild(div);
    var ul = document.createElement('ul');
    target.appendChild(ul);
    currentSession.data().signedUp.forEach(userId =>{
        let li = document.createElement('li');
        let button = document.createElement('button');
        li.setAttribute('id', userId);
        if (userAttended(userId, currentSession)) {
            li.classList.add('selected');
        }
        
        db.collection('users').doc(userId).get().then(user =>{
            button.innerText = user.data().firstName + " " + user.data().lastName;
            li.appendChild(button);
            ul.appendChild(li);
            li.addEventListener('click', (e) => {
                e.stopPropagation();
                li.classList.toggle('selected');
            });
        });
    })
    let submitButton = document.createElement('button');
    submitButton.innerText = "Valider";
    target.appendChild(submitButton);
    submitButton.addEventListener('click', (e) => {
        var selectedUsers = [];
        e.stopPropagation();
        let selectedDivs = document.getElementsByClassName('selected');
        for (div of selectedDivs) {
            selectedUsers.push(div.id)
        }
        console.log(selectedUsers);
        return db.collection('sessions').doc(currentSession.id).update({
            attended: selectedUsers
        })
        .then(() => {
            console.log("Document successfully updated!");
        })
        .catch((error) => {
            console.error("Error updating document: ", error);
        });
    });


}
//########################################## GENERIC FUNCTIONS ######################################

function createBackButton(container){
    
    if (document.getElementById('backButton')) {
        document.getElementById('backButton').remove();
    }
    if (currentPage >0) {
        let button = document.createElement('button');
        button.setAttribute('id', 'backButton');
        /* button.innerText = `Retour à la page ${currentPage-1}`; */
        button.innerText = 'Retour';
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
}
function displaySession(session, ul, showSignUp, showUnSignUp, showPoint, showCancel){
    let s = session.data();
    
    if (document.getElementById(session.id)) {
        var li = document.getElementById(session.id);
        //li.innerHTML = '';
    }else{
        var li = document.createElement('li');
        li.classList.add("session");
        if (session.data().startTimestamp <= Date.now()) {
            li.classList.add("past");
        }else{
            li.classList.add("future");
        }
        li.setAttribute('id', session.id);
        ul.appendChild(li);
    }
    
    let top = document.createElement('div');
    top.classList.add("top");
    let bottom = document.createElement('div');
    bottom.classList.add("bottom");
    bottom.classList.add("hidden");
    let time = document.createElement('div');
    time.innerText = getTiming(session);
    let title = document.createElement('div');
    if (s.title) {
        title.innerText = s.title;
    }else{
        title.innerText = s.location;
    }
    let signUps = document.createElement('span');
    let signedUpUsers = [];
    if (session.data().signedUp) {
        signedUpUsers = session.data().signedUp;
    }
    signUps.innerText = signedUpUsers.length;
    
    signUps.classList.add('signUps');
    let spotsLeft = document.createElement('div');
    let maxUsers = document.createElement('span');
    maxUsers.innerText = `/${s.maxUsers}`;
    spotsLeft.appendChild(signUps);
    spotsLeft.appendChild(maxUsers);
    let age = document.createElement('div');
    age.innerText = `Âges : ${s.minAge}-${s.maxAge} ans`;
    let teacher = document.createElement('div');
    teacher.innerText = `Moniteur : ${s.teacher}`;
    let spots = document.createElement('div');
    spots.innerText = `Places : ${s.maxUsers}`;
    let description = document.createElement('div');
    description.innerText = `${s.description}`;

    //user list
    let usersContainer = document.createElement('div');
    let usersTitle = document.createElement('div');
    usersTitle.innerText = `Inscrits :`;
    usersTitle.style.fontWeight = 'bold';
    usersTitle.style.marginBottom = '10px';
    let userList = document.createElement('ul');
    signedUpUsers.forEach(userId =>{
        let li = document.createElement('li');
        li.setAttribute('class', userId);
        db.collection('users').doc(userId).get().then(doc =>{
            li.innerText = doc.data().firstName + " " + doc.data().lastName;
            userList.appendChild(li);
        });
    })
    
    let signUpButton = document.createElement('button');
    signUpButton.innerText = "S'inscrire";
    signUpButton.classList.add('signUpButton');
    signUpButton.style.display = 'none';
    let unSignUpButton = document.createElement('button');
    unSignUpButton.innerText = "Se désinscrire";
    unSignUpButton.classList.add('unSignUpButton');
    unSignUpButton.style.display = 'none';
    let pointButton = document.createElement('button');
    pointButton.innerText = "Pointer";
    pointButton.classList.add('pointButton');
    pointButton.style.display = 'none';
    let cancelButton = document.createElement('button');
    cancelButton.innerText = "Annuler";
    cancelButton.classList.add('cancelButton');
    cancelButton.style.display = 'none';
    let buttons = document.createElement('div');
    let infos = document.createElement('div');
    top.appendChild(time);
    top.appendChild(title);
    top.appendChild(spotsLeft);
    infos.appendChild(age);
    infos.appendChild(teacher);
    infos.appendChild(spots);
    buttons.appendChild(signUpButton);
    buttons.appendChild(unSignUpButton);
    buttons.appendChild(pointButton);
    buttons.appendChild(cancelButton);
    if (showSignUp) {
        signUpButton.style.display = '';
    }
    if (showUnSignUp) {
        unSignUpButton.style.display = '';
    }
    if (showPoint && session.data().startTimestamp <= Date.now()) {
        pointButton.style.display = '';
    }
    if (showCancel && session.data().startTimestamp >= Date.now()) {
        cancelButton.style.display = '';
    }
    if (s.description) {
        bottom.appendChild(description);
        description.style.gridArea = '2/1/2/3';
        description.style.marginBottom = '20px';
    }
    bottom.appendChild(infos)
    infos.style.gridArea = '1/1';
    infos.style.marginBottom = '20px';
    bottom.appendChild(buttons);
    buttons.style.gridArea = '1/2';
    usersContainer.appendChild(usersTitle);
    usersContainer.appendChild(userList);
    bottom.appendChild(usersContainer);
    usersContainer.style.gridArea = '3/1/3/3';
    li.appendChild(top);
    li.appendChild(bottom);
    //ul.appendChild(li);
    
    if (isUserInSession(currentUser, session)) {
        li.classList.add('signedUp');
        signUpButton.style.display = 'none';
        unSignUpButton.style.display = '';
    }
    signUpButton.addEventListener('click', (e) => {
        e.stopPropagation();       
        let x = document.getElementById(session.id).getElementsByClassName('signUps')[0].innerText;
        document.getElementById(session.id).getElementsByClassName('signUps')[0].innerText = Number(x)+1;
        signUp(currentUser, session);
        li.classList.add('signedUp');
        signUpButton.style.display = 'none';
        unSignUpButton.style.display = '';
        let tmpUserName = document.createElement('li');
        tmpUserName.textContent = currentUser.data().firstName +" "+currentUser.data().lastName;
        tmpUserName.setAttribute('class', currentUser.id);
        userList.appendChild(tmpUserName);
    });
    unSignUpButton.addEventListener('click', (e) => {
        e.stopPropagation();        
        if (confirm("Êtes vous sûrs ?")) {
            let x = document.getElementById(session.id).getElementsByClassName('signUps')[0].innerText;
            document.getElementById(session.id).getElementsByClassName('signUps')[0].innerText = Number(x)-1;
            unSignUp(currentUser, session);
            li.classList.remove('signedUp');
            signUpButton.style.display = '';
            unSignUpButton.style.display = 'none';
            document.getElementById(session.id).getElementsByClassName(currentUser.id)[0].remove();
            if (currentPage == 3) {
                document.getElementById(session.id).remove();
                if (document.getElementById(session.data().startDate).children.length <= 1) {
                    document.getElementById(session.data().startDate).remove();
                }
            }
        }
    });
    pointButton.addEventListener('click', (e) => {
        e.stopPropagation();        
        currentSession = session;
        currentAction = 6;
        currentPage = 4;
        displayPage(currentPage);
    });
    cancelButton.addEventListener('click', (e) => {
        e.stopPropagation();        
        
    });
    top.addEventListener('click', (e) => {
        e.stopPropagation();
        bottom.classList.toggle('hidden');
    });
}
async function displaySessionList(target, past, future, user, status, signUp, unSignUp, modify, cancel){
  /*   if (document.getElementById('sessionList')) {
        document.getElementById('sessionList').remove();
    } */
    var sessionsArray = [];
    var div = document.createElement('div');
    div.setAttribute('id', 'sessionList');
    target.appendChild(div);
    var ul = document.createElement('ul');
    if (user && status) {
        let txt = document.createElement('div');
        txt.innerText = `Séances auxquelles ${user.data().firstName} est inscrit(e) :`;
        div.appendChild(txt);
        sessionsArray = await getUserSessions(past, future, user, status);
    }else{
        sessionsArray = await getAllSessions(past, future);
    }
    div.appendChild(ul);
    if (sessionsArray) {
        sessionsArray.forEach(session=>{
            if (document.getElementById(session.data().startDate)){
                var destination = document.getElementById(session.data().startDate);
                
            }else{
                var li = document.createElement('li');
                let h3 = document.createElement('h3');
                h3.innerText = dayjs(session.data().startTimestamp).format("dddd D MMMM");
                li.appendChild(h3)
                li.setAttribute('id', session.data().startDate);
                li.classList.add('dateContainer');
                ul.appendChild(li);
                var destination = li;
            }
            displaySession(session, destination, signUp, unSignUp, modify, cancel)
        })//end for each
    }else{
        let txt = document.createElement('div');
        txt.innerText = `Aucune séance trouvée`;
        txt.style.color = 'grey';
        txt.style.marginTop = '20px';
        div.appendChild(txt);
    }     
}
function getUserSessions(past, future, user, status){
    var resultArray = [];
    let operator = '';
    let date;
    if(!future && !past){ //if nothing
        console.log("Error: you must chose future or past sessions");
    }else if (future && past) { //if everything
        console.log("all");
        operator = '>='; 
        date = 0;
    }else if(future && !past){ //if future
        console.log("future");
        operator = '>='; 
        date = Date.now();
    }else if(!future && past){ //if past
        console.log("past");
        operator = '<'; 
        date = Date.now();
    }
    return db.collection('sessions').orderBy('startTimestamp').where('startTimestamp', operator, date)
    .where(status, 'array-contains', user.id).get().then(snapshot => {
        if (snapshot.size) {
            console.log (`${snapshot.size} sessions found`);
            snapshot.docs.forEach(session => {
                resultArray.push(session);
            });//end forEach
            return resultArray;
        }else{
            console.log (`No session found`);
        }
    });
}
function getAllSessions(past, future){//returns array of sessions
    var resultArray = [];
    let operator = '';
    let date;
    let limit = 100;
    if(!future && !past){ //if nothing
        console.log("Error: you must chose future or past sessions");
    }else if (future && past) { //if everything
        console.log("all");
        operator = '>='; 
        date = 0;
        limit = 10;
    }else if(future && !past){ //if future
        console.log("future");
        operator = '>='; 
        date = Date.now();
    }else if(!future && past){ //if past
        console.log("past");
        operator = '<'; 
        date = Date.now();
    }
    return db.collection('sessions').orderBy('startTimestamp').limit(limit).where('startTimestamp', operator, date)
    .get().then(snapshot => {
        if (snapshot.size) {
            console.log (`${snapshot.size} sessions found`);
            snapshot.docs.forEach(session => {
                resultArray.push(session);
            });//end forEach
            return resultArray;
        }else{
            console.log (`No session found`);
        }
    });
}
function getTiming(session){
    function getSimpleTime(timestamp){
        let hours = dayjs(timestamp).format("HH");
        let minutes = dayjs(timestamp).format("mm");
        if (minutes == "00") {
            minutes = "";
        }
        return `${hours}h${minutes}`
    }
    let A = session.data().startTimestamp;
    let B = session.data().endTimestamp;
    let multi = session.data().multiDay;
    if (multi) {
        let month_A = dayjs(A).format("MMMM");
        let month_B = dayjs(B).format("MMMM");
        if (month_A == month_B) {
            return `${dayjs(A).format("D")} au ${dayjs(B).format("D MMMM")}`;
        }else{
            return `${dayjs(A).format("D MMMM")} au ${dayjs(B).format("D MMMM")}`;
        }
    }else{ //if single day
        return `${getSimpleTime(A)} à ${getSimpleTime(B)}`
    }
}
function delSessions(){
    db.collection("sessions")
    .get()
    .then(res => {
        res.forEach(element => {
        if (confirm("sur? ATTENTIONS !")) {
            element.ref.delete();
        }
        });
    });
}
function isUserInSession(user, session){
    if (session.data().signedUp) {
        if (session.data().signedUp.indexOf(user.id)>-1) {
            return true;
        }else{
            return false;
        }
    }
}
function userAttended(userId, session){
    if (session.data().attended) {
        if (session.data().attended.indexOf(userId)>-1) {
            return true;
        }else{
            return false;
        }
    }
}
// TO DO
/*
focus on input field 
*/



/* function removeChildren(target){ // unused
    for (let i = 0; i < target.children.length; i++) {
        target.children[i].style.display = 'none';
    }
}
function unique(array) { // unused
    return Array.from(new Set(array));
} */

/* function createUpcomingSessionMenu(target){ //ADD AGE RESTRICTION
    function addSessionToList (session, ul){
        let a = document.createElement('a');
        a.innerText = title(session);
        a.href = "#";
        let checkbox = document.createElement('input');
        checkbox.setAttribute('type', 'checkbox');
        checkbox.checked = false;
        var li = document.createElement('li');
        li.setAttribute('id', session.id);
        li.appendChild(a); 
        li.appendChild(checkbox);
        ul.appendChild(li);

        checkbox.addEventListener('change', (e) => {
            e.stopPropagation();
            if (e.path[0].checked) {
                li.style.background = 'chartreuse';
                selectedSessions.push(session);
                //selectedSessions = unique(selectedSessions); //inutile 
            } else {
                e.path[1].style.background = '';
                const index = selectedSessions.indexOf(session)
                if (index > -1) {
                    selectedSessions.splice(index, 1);
                    e.path[1].style.background = '';
                }
            }
            console.log(selectedSessions);
        });
    }
    db.collection('sessions').orderBy('startTimestamp').get().then(snapshot => {
        var ul = document.createElement('ul');
        snapshot.docs.forEach(doc => {
            if (doc.data().startTimestamp>Date.now()) { //if session is in future
                addSessionToList(doc,ul);
            }//end if future
        });//end forEach
        target.appendChild(ul);
        let button = document.createElement('button');
        button.innerText = "Valider";
        target.appendChild(button);
        button.addEventListener('click', (e) => {
            e.stopPropagation();
            signUpUserToSelectedSessions(currentUser)
        });//end click button
    });//end snapshot, don't put anything after
} */