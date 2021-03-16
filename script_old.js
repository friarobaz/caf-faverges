const userList = document.querySelector('#user-list');
const dateList = document.querySelector('#date-list');

// create element & render cafe
function renderUser(doc){
    let user = document.createElement('li');
    let link = document.createElement('a');
    link.innerText = doc.data().lastName + " " + doc.data().firstName;
    link.href = "#";

    user.setAttribute('data-id', doc.id);

    user.appendChild(link);
    userList.appendChild(user);
}

function myDate(date){
  const options = { weekday: 'long', month: 'long', day: 'numeric', hour: 'numeric', minute: 'numeric'};
  return date.toDate().toLocaleDateString('fr-FR', options)
}

function renderDate(doc){
  let date = document.createElement('li');
  let link = document.createElement('a');
  
  link.innerText = myDate(doc.data().start) + "\n" + myDate(doc.data().end);
  link.href = "#";

  date.setAttribute('data-id', doc.id);

  date.appendChild(link);
  dateList.appendChild(date);
}


// real-time listener
db.collection('users').orderBy('lastName').onSnapshot(snapshot => {
    let changes = snapshot.docChanges();
    changes.forEach(change => {
        //console.log(change.doc.data());
        if(change.type == 'added'){
            renderUser(change.doc);
        }
    });
});
db.collection('dates').onSnapshot(snapshot => {
  let changes = snapshot.docChanges();
  changes.forEach(change => {
      //console.log(change.doc.data());
      if(change.type == 'added'){
          renderDate(change.doc);
      }
  });
});

function toggle(id) {
    document.getElementById(id).classList.toggle("show");
  }
  
  // Close the dropdown menu if the user clicks outside of it
  window.onclick = function(event) {
    if (!event.target.matches('.dropButton')) {
      var dropdowns = document.getElementsByClassName("dropdown-content");
      var i;
      for (i = 0; i < dropdowns.length; i++) {
        var openDropdown = dropdowns[i];
        if (openDropdown.classList.contains('show')) {
          openDropdown.classList.remove('show');
        }
      }
    }
  }

