dayjs.locale('fr');

const MULTI_DAY_START_TIME = "09:00";
const MULTI_DAY_END_TIME = "17:00";
const TEACHERS = ["Jelena", "Jules"];
const GROUPS = ["Tous"];
const DEFAULT_LOCATION = "SAE Faverges";
let selectedName = "";
let selectedSessions = [];
const sessionList = document.querySelector('#session-list');
const form = document.querySelector('#add-session-form');
form.startDate.value = dayjs().format("YYYY-MM-DD");
document.getElementById("date").classList.add("disabled");
document.getElementById("nameInput").focus();



//populate location select form
db.collection('locations').orderBy('name').get().then(snapshot => {
    snapshot.docs.forEach(doc => {
        var option = document.createElement("option");
        option.textContent = doc.data().name;
        option.value = doc.data().name;
        if (doc.data().name == DEFAULT_LOCATION) {
            option.setAttribute("selected", "selected");
        }
        form.location.appendChild(option);
    });
});

//populate name list
db.collection('users').orderBy('firstName').get().then(snapshot => {
    snapshot.docs.forEach(doc => {
        let li = document.createElement("li");
        let a = document.createElement('a');
        a.innerText = doc.data().firstName +" "+doc.data().lastName;
        a.href="#";
        li.setAttribute('id', doc.id);
        li.appendChild(a); 
        nameList.appendChild(li);
        li.addEventListener('click', (e) => {
            e.stopPropagation();
            selectName(doc);
        });
    });
});

//populate GROUPS with unique groups in user collection
db.collection('users').orderBy('group').get().then(snapshot => {
    snapshot.docs.forEach(doc => {
        GROUPS.push(doc.data().group);
    });
    //populate group select form from GROUPS
    unique(GROUPS).forEach(group => {
        var option = document.createElement("option");
        option.textContent = group;
        option.value = group;
        form.group.appendChild(option);
    });
});

//populate teacher select form TEACHERS
TEACHERS.forEach(teacher => {
var option = document.createElement("option");
option.textContent = teacher;
option.value = teacher;
form.teacher.appendChild(option);
});

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

function unique(array) {
    return Array.from(new Set(array));
}

//display one session
function renderSession(doc){
    let li = document.createElement('li');
    let a = document.createElement('a');
    let cross = document.createElement('span');
    cross.textContent = 'x';
    a.innerText = dayjs(new Date(doc.data().startTimestamp)).format("dddd D MMMM H[h]mm") + " à " + doc.data().location;
    a.href = "#";
    li.setAttribute('id', doc.id);
    li.appendChild(a); 
    li.appendChild(cross);
    sessionList.appendChild(li);
    //delete session
    cross.addEventListener('click', (e) => {
        e.stopPropagation();
        let id = e.target.parentElement.getAttribute('id');
        db.collection('sessions').doc(id).delete();
    });
}

//live refresh of sessionList
db.collection('sessions').onSnapshot(snapshot => {
    let changes = snapshot.docChanges();
    changes.forEach(change => {
        if(change.type == 'added'){
            renderSession(change.doc);
        } else if (change.type == 'removed'){
            //let li = sessionList.querySelector('[id=' + change.doc.id + ']');
            let li = document.getElementById(change.doc.id);
            sessionList.removeChild(li);
        }
    });
});

// saving data
form.addEventListener('submit', (e) => {
    e.preventDefault();
    if (confirm("Créer la séance ?")) {
        createSession();
    }
});

function createSession(){
    let session = sessionObject();
    if (!session.startDate) {
        alert("Pas de date"); return;
    }else if (session.duration < 1) {
        alert("La séance dure moins d'une heure, vérifier les horaires"); return;
    }else if(!session.multiDay && !session.startTime){
        alert("Pas d'heure de début"); return;
    }else if(!session.multiDay && !session.endTime){
        alert("Pas d'heure de fin"); return;
    }else if(session.multiDay && !session.endDate){
        alert("Pas de date de fin de stage"); return;
    }
    db.collection('sessions').add(sessionObject()).then(function(docRef) {
        db.collection('sessions').doc(docRef.id).update({
            created: firebase.firestore.FieldValue.serverTimestamp()
        });
    })
    .catch(function(error) {
        console.error("Error adding document: ", error);
    });
}

function toggleMultiDay() {
    
    let checkbox = form.multiDay;
    if (checkbox.checked) {//if multi day
    form.endDate.value = form.startDate.value;
    document.getElementById("date").classList.remove("disabled");
    document.getElementById("time").classList.add("disabled");
    form.startTime.value = MULTI_DAY_START_TIME;
    form.endTime.value = MULTI_DAY_END_TIME;
    }else{//if single day
    form.endDate.value = null;
    document.getElementById("date").classList.add("disabled");
    document.getElementById("time").classList.remove("disabled");
    }
    displayDuration();
}

function addMinutes(){
    //let oldTimestamp = new Date(sessionObject().endTimestamp);
    let newTime = dayjs(sessionObject().endTimestamp).add(30, 'minute').format("HH:mm")
    form.endTime.value = newTime;
    displayDuration();
}

function addDay(){
    let oldDate = new Date(form.endDate.value);
    let nextDate = dayjs(oldDate).add(1, 'day').format("YYYY-MM-DD");
    form.endDate.value = nextDate;
}

function sessionObject(){
    let startDate = form.startDate.value;
    let endDate = form.endDate.value;
    let startTime = form.startTime.value;
    let endTime = form.endTime.value;
    let location = form.location.value;
    let minAge = Number(form.minAge.value);
    let maxAge = Number(form.maxAge.value);
    let maxUsers = Number(form.maxUsers.value);
    let teacher = form.teacher.value;
    let multiDay = form.multiDay.checked;
    let group = form.group.value;

    if (multiDay) {
        startTime = MULTI_DAY_START_TIME;
        endTime = MULTI_DAY_END_TIME;
    }else{
        endDate = startDate;
    }
    let startTimestamp = dayjs(Date.parse(startDate + "T" + startTime+ ":00")).valueOf();
    let endTimestamp = dayjs(Date.parse(endDate + "T" + endTime+ ":00")).valueOf();
    let startDJS = dayjs(new Date(startTimestamp));
    let endDJS = dayjs(new Date(endTimestamp));
    let duration = endDJS.diff(startDJS, "hour", true);
    let durationDays = Math.ceil(endDJS.diff(startDJS, "day", true));
    
    if (!duration) {
        duration = 0;
    }
   
    return {
        startDate: startDate,
        endDate: endDate,
        startTime: startTime,
        endTime: endTime,
        multiDay: multiDay,
        location: location,
        minAge: minAge,
        maxAge: maxAge,
        maxUsers: maxUsers,
        teacher: teacher,
        startTimestamp: startTimestamp,
        //startDJS: startDJS.format(),
        endTimestamp: endTimestamp,
        //endDJS: endDJS.format(),
        duration: duration,
        durationDays: durationDays,
        created: null,
    }
}

function displayDuration(){
    document.getElementById("duration").innerText = sessionObject().duration + "h";
    document.getElementById("durationDays").innerText = sessionObject().durationDays + " jours";
}

function matchStartTime(){
    form.endTime.value = form.startTime.value;
}

function toggleAges(){
    if (form.group.value == "Tous") {
        document.getElementById("ages").classList.remove("disabled");
        document.getElementById("maxUsers").classList.remove("disabled");
    }else{
        document.getElementById("ages").classList.add("disabled");
        document.getElementById("maxUsers").classList.add("disabled");
        form.maxUsers.value = '';
    }
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

function selectName(doc){
    console.log(doc.data().firstName+" selected");
    selectedName = doc.id;
    selectedSessions = [];
    document.getElementById('nameSelection').style.display = 'none';
    document.getElementById('sessionSelection').style.display = '';
    document.getElementById('selectedName').innerText = doc.data().firstName + " " + doc.data().lastName;
    getUpcomingSession(doc.id);
}

function reset(){
    selectedName = '';
    selectedSessions = [];
    document.getElementById('nameSelection').style.display = '';
    document.getElementById('sessionSelection').style.display = 'none';
    document.getElementById("nameInput").focus();
}

function submit(){
    if (confirm("Valider l'inscription ?")) {
        var user = db.collection("users").doc(selectedName);
        user.get().then((doc) => {
            let oldUserSessions = [];
            if (doc.data().sessions) {
                oldUserSessions = doc.data().sessions;
            }
            let oldAndNew = oldUserSessions.concat(selectedSessions);
            oldAndNew = unique(oldAndNew);
            console.log(oldAndNew);
            return user.update({
                sessions: oldAndNew
            })
        }).catch((error) => {
            console.log("Error getting document:", error);
        });
    }//end if  
}
