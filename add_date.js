const MULTI_DAY_START_TIME = "09:00";
const MULTI_DAY_END_TIME = "18:00";

const dateList = document.querySelector('#date-list');
const form = document.querySelector('#add-date-form');


//display one date
function renderDate(doc){
    let li = document.createElement('li');
    let a = document.createElement('a');
    let cross = document.createElement('div');
    cross.textContent = 'x';
    let text_date = doc.data().startDate + "T" + doc.data().startTime + ":00+01:00";
    let start_timestamp = Date.parse(text_date)/1000;
    a.innerText = start_timestamp + doc.data().location;
    a.href = "#";
    li.setAttribute('data-id', doc.id);
    li.appendChild(a);
    li.appendChild(cross);
    dateList.appendChild(li);
    //delete date
    cross.addEventListener('click', (e) => {
        e.stopPropagation();
        let id = e.target.parentElement.getAttribute('data-id');
        db.collection('dates').doc(id).delete();
    });
}

//live refresh of dateList
db.collection('dates').onSnapshot(snapshot => {
    let changes = snapshot.docChanges();
    changes.forEach(change => {
        if(change.type == 'added'){
            renderDate(change.doc);
        } else if (change.type == 'removed'){
            let li = dateList.querySelector('[data-id=' + change.doc.id + ']');
            dateList.removeChild(li);
        }
    });
});

// saving data
form.addEventListener('submit', (e) => {
    e.preventDefault();
    let startDate = form.startDate.value;
    let endDate = form.endDate.value;
    let startTime = form.startTime.value;
    let endTime = form.endTime.value;
    let location = form.location.value;
    let minAge = form.minAge.value;
    let maxAge = form.maxAge.value;
    let maxUsers = form.maxUsers.value;
    let teacher = form.teacher.value;
    let multiDay = form.multiDay.checked;
    
    if (multiDay) {
        startTime = MULTI_DAY_START_TIME;
        endTime = MULTI_DAY_END_TIME;
    }else{
        endDate = startDate;
    }
    let startTimestamp = Date.parse(startDate + "T" + startTime+ ":00+01:00")/1000;
    let endTimestamp = Date.parse(endDate + "T" + endTime+ ":00+01:00")/1000;
    let duration = (endTimestamp-startTimestamp) / 60 / 60;
    if (duration < 1) {
        alert("La séance dure moins d'une heure, vérifier les horaires");
        return;
    }
    db.collection('dates').add({
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
        endTimestamp: endTimestamp,
        duration: duration,
        created: firebase.firestore.FieldValue.serverTimestamp(),
    });
    //form.firstName.value = '';
});

function toggleMultiDay() {
    let checkbox = document.getElementsByName("multiDay")[0];
   if (checkbox.checked) {//if multi day
    document.getElementsByName("endDate")[0].style.display = 'inline-block';
    document.getElementsByName("startTime")[0].style.display = 'none';
    document.getElementsByName("endTime")[0].style.display = 'none';
   }else{//if single day
    document.getElementsByName("endDate")[0].style.display = 'none';
    document.getElementsByName("startTime")[0].style.display = 'inline-block';
    document.getElementsByName("endTime")[0].style.display = 'inline-block';
   }
}

function add30(){
    console.log(form.startTime.value);
}





/* function myDate(date){
    const options = { weekday: 'long', month: 'long', day: 'numeric', hour: 'numeric', minute: 'numeric'};
    return date.toDate().toLocaleDateString('fr-FR', options)
} */