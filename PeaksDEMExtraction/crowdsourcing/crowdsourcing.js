let currentIndex = -1;

function activatePeak(index) {
  currentIndex = index;

  activateDeactivatePrevNext();

  clearInfo();

  const oldPeak = $('#fp-list .active');
  oldPeak.removeClass('active');

  const newPeak = $("#fp-list").find("[data-index='" + index + "']");
  newPeak.addClass('active');

  const newPeakValue = anonymousPeaks[index];

  $("#pid").html(newPeakValue.id);
  $("#pcoord").html(newPeakValue.estimatedCoord.lat + ',' + newPeakValue.estimatedCoord.lon);

  lookAt(newPeakValue.estimatedCoord, "yellow");
}

function nextPeak() {
  if (currentIndex < anonymousPeaks.length - 1) {
    activatePeak(currentIndex + 1);
    animateToPeakInList(currentIndex + 1, 150)
  }
}

function prevPeak() {
  if (currentIndex > 0) {
    activatePeak(currentIndex - 1);
    animateToPeakInList(currentIndex - 1, 80)
  }
}

function animateToPeakInList(index, offset) {
  $('#fp-list').animate({
    scrollTop: $("#fp-list").find("[data-index='" + index + "']").get(0).offsetTop - offset
  }, 2000);
}

function activateDeactivatePrevNext() {
  $('#btn-prev').prop("disabled", currentIndex <= 0);
  $('#btn-next').prop("disabled", anonymousPeaks ? (currentIndex >= anonymousPeaks.length - 1) : true);
}

function clearInfo() {
  const btnNo = $('#btn-no');
  const btnYes = $('#btn-yes');
  btnYes.removeClass("btn-success")
  btnYes.removeClass("active")
  btnNo.removeClass("btn-danger")
  btnNo.removeClass("active")

  $('#pname').val('');
}

function enableButtonsEffects() {
  const btnNo = $('#btn-no');
  const btnYes = $('#btn-yes');
  btnNo.click(function() {
    if (!btnNo.hasClass("active")) {
      btnNo.addClass("btn-danger")
      btnNo.addClass("active")
      btnYes.removeClass("btn-success")
      btnYes.removeClass("active")
    } else {
      btnNo.removeClass("btn-danger")
      btnNo.removeClass("active")
    }
  });
  btnYes.click(function() {
    if (!btnYes.hasClass("active")) {
      btnYes.addClass("btn-success")
      btnYes.addClass("active")
      btnNo.removeClass("btn-danger")
      btnNo.removeClass("active")
    } else {
      btnYes.removeClass("btn-success")
      btnYes.removeClass("active")
    }
  });
}

function savePeak() {
  const btnNo = $('#btn-no');
  const btnYes = $('#btn-yes');

  if (btnNo.hasClass('active') || btnYes.hasClass('active')) {

    const currentPeak = anonymousPeaks[currentIndex];
    const yes = btnYes.hasClass('active');
    const name = $('#pname').val();

    const obj = {
      id: currentPeak.id,
      coord: currentPeak.estimatedCoord,
      yes: yes,
      name: name
    }

    // TODO: Store obj

    console.log(obj);

  } else {
    alert ('Select YES or NO')
  }
}

$(document).ready(function() {

  activateDeactivatePrevNext();

  enableButtonsEffects();

  $('#btn-prev').on('click', prevPeak);
  $('#btn-next').on('click', nextPeak);
  $('#btn-save').on('click', savePeak);
})
