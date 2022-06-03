$(document).ready(() => {
  $.get("/api/notifications", (data) => {
    console.log(data);
    outputNotificationList(data, $(".resultsContainer"));
  });
});

$("#markNotificationAsRead").click(() => markNotificationAsOpened());
