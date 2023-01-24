let allTimeTableEditable = false;
let reviewandProjectTableEditable = false;
let timedTableEditable = false;


function AllTimeEdit() {
  var table = document.getElementById("alltimetable");
	var rws = table.rows;
	var cols = table.rows[0].cells.length;
	var cell;
  if(!allTimeTableEditable)
  {
    allTimeTableEditable = true;
    cell=rws[0].insertCell(cols);
    cell.innerHTML = 'Value';
	  for(var i=1;i<rws.length;i++){
		  cell = rws[i].insertCell(cols);
		  cell.innerHTML = '<input type="text" placeholder="Enter Value">';
	  }
    let alltimesavebtn = document.createElement("button");
    $(alltimesavebtn).addClass("btn btn-primary");
    $(alltimesavebtn).html('Save all-time badges');
    $(alltimesavebtn).attr('style', 'float: right; margin-top: 10px;');
    $(alltimesavebtn).attr('id','alltimesavebtn');
    alltimesavebtn.addEventListener('click', function(){
      let alltimeBadgesNamesandVals = new Map();
      for (var i=1; i<rws.length; i++){
        var badgeName = table.rows[i].cells[1].innerText;
        var val = table.rows[i].cells[cols].children[0].value;
        alltimeBadgesNamesandVals.set(badgeName, val);
      }
      $.post('badges/editAllTimeVals',
      {
        vals: JSON.stringify(alltimeBadgesNamesandVals.entries())
      },
      function(data)
      {
        alert(data);
      });
    });
    $("#alltimebadges").append(alltimesavebtn);
  }
  else
  {
    allTimeTableEditable = false;
    $('#alltimesavebtn').remove();
    for( var i=0; i<rws.length; i++){
      rws[i].deleteCell(cols-1);
    }  
  }
  

}

function ReviewAndProjectEdit() {
  var table = document.getElementById("reviewandprojecttable");
	var rws = table.rows;
	var cols = table.rows[0].cells.length;
	var cell;
  if(!reviewandProjectTableEditable)
  {
    reviewandProjectTableEditable = true;
    cell=rws[0].insertCell(cols);
    cell.innerHTML = 'Value';
    for(var i=1;i<rws.length;i++){
      cell = rws[i].insertCell(cols);
      cell.innerHTML = '<input type="text" placeholder="Enter Value">';
    }
    let reviewandprojectsavebtn = document.createElement("button");
    $(reviewandprojectsavebtn).addClass("btn btn-primary");
    $(reviewandprojectsavebtn).html('Save review-and-project badges');
    $(reviewandprojectsavebtn).attr('style', 'float: right; margin-top: 10px;');
    $(reviewandprojectsavebtn).attr('id','reviewandprojectsavebtn');
    reviewandprojectsavebtn.addEventListener('click', function(){
      let revandprojNamesandVals = new Map();
      for (var i=1; i<rws.length; i++){
        var badgeName = table.rows[i].cells[1].innerText;
        var val = table.rows[i].cells[cols].children[0].value;
        revandprojNamesandVals.set(badgeName, val);
      }
      $.post('badges' + 'editreviewandprojectvals', revandprojNamesandVals);
    });
    $("reviewandprojectbadges").append(reviewandprojectsavebtn);
  }
  else
  {
    reviewandProjectTableEditable = false;
    $('#reviewandprojectsavebtn').remove();
    for( var i=0; i<rws.length; i++){
      rws[i].deleteCell(cols-1);
    }
  }
}

function TimedEdit() {
  var table = document.getElementById("timedtable");
	var rws = table.rows;
	var cols = table.rows[0].cells.length;
	var cell;
  if(!timedTableEditable)
  {
    timedTableEditable = true;
    cell=rws[0].insertCell(cols);
    cell.innerHTML = 'Value';
    for(var i=1;i<rws.length;i++){
      cell = rws[i].insertCell(cols);
      cell.innerHTML = '<input type="text" id="badgevalue" placeholder="Enter Value">';
    }
    let timedsavebtn = document.createElement("button");
    $(timedsavebtn).addClass("btn btn-primary");
    $(timedsavebtn).html('Save timed badges');
    $(timedsavebtn).attr('style', 'float: right; margin-top: 10px;');
    $(timedsavebtn).attr('id','reviewandprojectsavebtn');
    timedsavebtn.addEventListener('click', function(){
      let timedBadgesNamesandVals = new Map ();
      for (var i=1; i<rws.length; i++){
        var badgeName = table.rows[i].cells[2].innerText;
        var val = table.rows[i].cells[cols].children[0].value;
        timedBadgesNamesandVals.set(badgeName, val);
      }
      $.post('badges' + 'edittimedvals', timedBadgesNamesandVals);
    });
    $("#timedbadges").append(timedsavebtn);
  }
  else
  {
    timedTableEditable = false;
    $('#reviewandprojectsavebtn').remove();
    for( var i=0; i<rws.length; i++){
      rws[i].deleteCell(cols-1);
    }
  }
}