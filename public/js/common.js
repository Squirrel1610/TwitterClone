//globals
var cropper;
var timer;
var selectedUsers = [];

$("#postTextarea, #replyTextarea").keyup((event) => {
  var textbox = $(event.target);
  var value = textbox.val().trim();

  var isModal = textbox.parents(".modal").length == 1;

  var submitButton = isModal ? $("#submitReplyButton") : $("#submitPostButton");

  if (value == "") {
    submitButton.prop("disabled", true);
    return;
  }

  submitButton.prop("disabled", false);
});

//post tweet
$("#submitPostButton, #submitReplyButton").click((event) => {
  var button = $(event.target);

  var isModal = button.parents(".modal").length == 1;
  var textbox = isModal ? $("#replyTextarea") : $("#postTextarea");

  var data = {
    content: textbox.val(),
  };

  if (isModal) {
    var id = button.data().id;
    if (id == null) return alert("Button id is null");
    data.replyTo = id;
  }

  $.post("/api/posts", data, (postData) => {
    if (postData.replyTo) {
      location.reload();
    } else {
      var html = createPostHtml(postData);
      $(".postsContainer").prepend(html);
      textbox.val("");
      button.prop("disabled", true);
    }
  });
});

//like
$(document).on("click", ".likeButton", (event) => {
  var button = $(event.target);
  var postId = getPostIdFromElement(button);

  if (postId === undefined) {
    return;
  }

  $.ajax({
    url: `/api/posts/${postId}/like`,
    type: "PUT",
    success: (postData) => {
      button.find("span").text(postData.likes.length || "");

      if (postData.likes.includes(userLoggedIn._id)) {
        button.addClass("active");
      } else {
        button.removeClass("active");
      }
    },
  });
});

//show reply modal when click comment
$("#replyModal").on("show.bs.modal", (event) => {
  var button = $(event.relatedTarget);
  var postId = getPostIdFromElement(button);

  $("#submitReplyButton").data("id", postId);

  $.get(`/api/posts/${postId}`, (results) => {
    outputPosts(results.postData, $("#originalPostContainer"));
  });
});

//hidden reply modal
$("#replyModal").on("hidden.bs.modal", (event) => {
  $("#originalPostContainer").html("");
});

//retweet
$(document).on("click", ".retweetButton", (event) => {
  var button = $(event.target);
  var postId = getPostIdFromElement(button);

  if (postId === undefined) {
    return;
  }

  $.ajax({
    url: `/api/posts/${postId}/retweet`,
    type: "POST",
    success: (postData) => {
      button.find("span").text(postData.retweetUsers.length || "");

      if (postData.retweetUsers.includes(userLoggedIn._id)) {
        button.addClass("active");
      } else {
        button.removeClass("active");
      }
    },
  });
});

//view post page
$(document).on("click", ".post", (event) => {
  var element = $(event.target);
  var postId = getPostIdFromElement(element);
  if (postId !== undefined && !element.is("button")) {
    window.location.href = "/posts/" + postId;
  }
});

//show modal delete
$("#deletePostModal").on("show.bs.modal", (event) => {
  var button = $(event.relatedTarget);
  var postId = getPostIdFromElement(button);

  $("#deletePostButton").data("id", postId);
});

//delete post
$("#deletePostButton").click((event) => {
  var postId = $(event.target).data("id");

  $.ajax({
    url: `/api/posts/${postId}`,
    type: "DELETE",
    success: (data, status, xhr) => {
      if (xhr.status != 202) {
        alert("Could not delete post");
        return;
      }
      location.reload();
    },
  });
});

//show modal pin post
$("#confirmPinModal").on("show.bs.modal", (event) => {
  var button = $(event.relatedTarget);
  var postId = getPostIdFromElement(button);

  $("#pinPostButton").data("id", postId);
});

//click pin button
$("#pinPostButton").click((event) => {
  var postId = $(event.target).data("id");

  $.ajax({
    url: `/api/posts/${postId}`,
    type: "PUT",
    data: { pinned: true },
    success: (data, status, xhr) => {
      if (xhr.status != 204) {
        alert("Could not pin the post");
        return;
      }
      location.reload();
    },
  });
});

//show modal unpin post
$("#unpinModal").on("show.bs.modal", (event) => {
  var button = $(event.relatedTarget);
  var postId = getPostIdFromElement(button);

  $("#unpinPostButton").data("id", postId);
});

//click unpin button
$("#unpinPostButton").click((event) => {
  var postId = $(event.target).data("id");

  $.ajax({
    url: `/api/posts/${postId}`,
    type: "PUT",
    data: { pinned: false },
    success: (data, status, xhr) => {
      if (xhr.status != 204) {
        alert("Could not pin the post");
        return;
      }
      location.reload();
    },
  });
});

//click follow button
$(document).on("click", ".followButton", (event) => {
  var button = $(event.target);
  var userId = button.data().user;

  $.ajax({
    url: `/api/users/${userId}/follow`,
    type: "PUT",
    success: (data, status, xhr) => {
      if (xhr.status == 404) {
        alert("user not found");
        return;
      }

      var difference = 1;
      if (data.following && data.following.includes(userId)) {
        button.addClass("following");
        button.text("Following");
      } else {
        button.removeClass("following");
        button.text("Follow");
        difference = -1;
      }

      var followersLabel = $("#followersValue");
      if (followersLabel.length != 0) {
        var followersText = followersLabel.text();
        followersText = parseInt(followersText);
        followersLabel.text(followersText + difference);
      }
    },
  });
});

//show modal upload profile
$("#filePhoto").change(function () {
  if (this.files && this.files[0]) {
    var reader = new FileReader();
    reader.onload = (e) => {
      var image = document.getElementById("imagePreview");
      image.src = e.target.result;

      if (cropper !== undefined) {
        cropper.destroy();
      }

      cropper = new Cropper(image, {
        aspectRatio: 1 / 1,
        background: true,
      });
    };
    reader.readAsDataURL(this.files[0]);
  } else {
    console.log("nope");
  }
});

$("#coverPhoto").change(function () {
  if (this.files && this.files[0]) {
    var reader = new FileReader();
    reader.onload = (e) => {
      var image = document.getElementById("coverPreview");
      image.src = e.target.result;

      if (cropper !== undefined) {
        cropper.destroy();
      }

      cropper = new Cropper(image, {
        aspectRatio: 16 / 9,
        background: true,
      });
    };
    reader.readAsDataURL(this.files[0]);
  }
});

//crop and send profile picture to server
$("#imageUploadButton").click((e) => {
  var canvas = cropper.getCroppedCanvas();
  if (canvas == null) {
    alert("Could not upload image. Make sure it is an image file.");
    return;
  }

  canvas.toBlob((blob) => {
    var formData = new FormData();
    formData.append("croppedImage", blob);

    $.ajax({
      url: "/api/users/profilePicture",
      type: "POST",
      data: formData,
      processData: false,
      contentType: false,
      success: () => {
        return location.reload();
      },
    });
  });
});

$("#coverPhotoButton").click((e) => {
  var canvas = cropper.getCroppedCanvas();
  if (canvas == null) {
    alert("Could not upload image. Make sure it is an image file.");
    return;
  }

  canvas.toBlob((blob) => {
    var formData = new FormData();
    formData.append("croppedImage", blob);

    $.ajax({
      url: "/api/users/coverPhoto",
      type: "POST",
      data: formData,
      processData: false,
      contentType: false,
      success: () => {
        return location.reload();
      },
    });
  });
});

//search user in route message
$("#userSearchTextbox").keydown((event) => {
  clearTimeout(timer);
  var textbox = $(event.target);
  var value = textbox.val();

  //keycode == 8 => backspace on keyboard
  if (value == "" && (event.which == 8 || event.keyCode == 8)) {
    //remove user from selection
    selectedUsers.pop();
    updateSelectedUsersHtml();

    $(".resultsContainer").html("");

    if (selectedUsers.length == 0) {
      $("#createChatButton").prop("disabled", true);
    }

    return;
  }

  timer = setTimeout(() => {
    value = textbox.val().trim();

    if (value == "") {
      $(".resultsContainer").html("");
    } else {
      searchUsers(value);
    }
  }, 1000);
});

//click create chat button
$("#createChatButton").click(() => {
  var data = JSON.stringify(selectedUsers);

  $.post("/api/chats", { users: data }, (chat) => {
    if (!chat || !chat._id) return alert("Invalid response from server.");

    window.location.href = `/messages/${chat._id}`;
  });
});

function getPostIdFromElement(element) {
  var isRoot = element.hasClass("post");
  var rootElement = isRoot ? element : element.closest(".post");
  var postId = rootElement.data().id;

  if (postId === undefined) return alert("Post is undefined");

  return postId;
}

function createPostHtml(postData, largeFont = false) {
  if (postData == null) return alert("post object is null");

  var isRetweet = postData.retweetData !== undefined;
  var retweetedBy = isRetweet ? postData.postedBy.username : null;
  postData = isRetweet ? postData.retweetData : postData;

  var postedBy = postData.postedBy;

  if (postedBy._id === undefined) {
    return console.log("User object not populated");
  }

  var displayName = postedBy.firstName + " " + postedBy.lastName;
  var timestamp = timeDifference(new Date(), new Date(postData.createdAt));

  var likeButtonActiveClass = postData.likes.includes(userLoggedIn._id)
    ? "active"
    : "";

  var retweetButtonActiveClass = postData.retweetUsers.includes(
    userLoggedIn._id
  )
    ? "active"
    : "";

  var largeFontClass = largeFont ? "largeFont" : "";

  var retweetText = "";
  if (isRetweet) {
    retweetText = `<span>
                      <i class="fa-solid fa-retweet"></i>
                      Retweeted by <a href='/profile/${retweetedBy}'>@${retweetedBy}</a>
                  </span>`;
  }

  var replyFlag = "";
  if (postData.replyTo && postData.replyTo._id) {
    if (!postData.replyTo._id) {
      return alert("Reply to is not populated");
    } else if (!postData.replyTo.postedBy._id) {
      return alert("Posted by is not populated");
    }

    var replyToUsername = postData.replyTo.postedBy.username;
    replyFlag = `<div class="replyFlag">
                    Replying to <a href="/profile/${replyToUsername}">@${replyToUsername}</a>
                </div>`;
  }

  var buttons = "";

  var pinnedPostText = "";

  if (postData.postedBy._id == userLoggedIn._id) {
    var pinnedClass = "";
    var dataTarget = "#confirmPinModal";

    if (postData.pinned === true) {
      pinnedClass = "active";
      dataTarget = "#unpinModal";
      pinnedPostText =
        "<i class='fa-solid fa-thumbtack'></i> <span> Pinned post</span>";
    }

    buttons = `<button class="pinButton ${pinnedClass}" data-id="${postData._id}" data-toggle="modal" data-target="${dataTarget}"><i class="fa-solid fa-thumbtack"></i></button>
                <button data-id="${postData._id}" data-toggle="modal" data-target="#deletePostModal"><i class="fas fa-times"></i></button>`;
  }
  return `<div class="post ${largeFontClass}" data-id="${postData._id}">
              <div class="postActionContainer">
                ${retweetText}
              </div>
              <div class="mainContentContainer">
                <div class="userImageContainer">
                  <img src="${postedBy.profilePic}">
                </div>
                <div class="postContentContainer">
                  <div class="pinnedPostText">${pinnedPostText}</div>
                  <div class="header">
                    <a href="/profile/${
                      postedBy.username
                    }" class="displayName">${displayName}</a>
                    <span class="username">@${postedBy.username}</span>
                    <span class="date">${timestamp}</span>
                    ${buttons}
                  </div>
                  ${replyFlag}
                  <div class="postBody">
                    <span>${postData.content}</span>
                  </div>
                  <div class="postFooter">
                    <div class="postButtonContainer red">
                      <button class="likeButton ${likeButtonActiveClass}">
                        <i class="fa-solid fa-heart"></i>
                        <span>${postData.likes.length || ""}</span>
                      </button>
                    </div>

                    <div class="postButtonContainer">
                      <button data-toggle="modal" data-target="#replyModal">  
                        <i class="fa-solid fa-comment"></i>
                      </button>
                    </div>

                    <div class="postButtonContainer green">
                      <button class="retweetButton ${retweetButtonActiveClass}">
                        <i class="fa-solid fa-retweet"></i>
                        <span>${postData.retweetUsers.length || ""}</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
              
          </div>`;
}

function timeDifference(current, previous) {
  var msPerMinute = 60 * 1000;
  var msPerHour = msPerMinute * 60;
  var msPerDay = msPerHour * 24;
  var msPerMonth = msPerDay * 30;
  var msPerYear = msPerDay * 365;

  var elapsed = current - previous;

  if (elapsed < msPerMinute) {
    return Math.round(elapsed / 1000) + " seconds ago";
  } else if (elapsed < msPerHour) {
    return Math.round(elapsed / msPerMinute) + " minutes ago";
  } else if (elapsed < msPerDay) {
    return Math.round(elapsed / msPerHour) + " hours ago";
  } else if (elapsed < msPerMonth) {
    return Math.round(elapsed / msPerDay) + " days ago";
  } else if (elapsed < msPerYear) {
    return Math.round(elapsed / msPerMonth) + " months ago";
  } else {
    return Math.round(elapsed / msPerYear) + " years ago";
  }
}

function outputPosts(results, container) {
  container.html("");

  if (!Array.isArray(results)) {
    results = [results];
  }

  results.forEach((result) => {
    var html = createPostHtml(result);
    container.append(html);
  });

  if (results.length == 0) {
    container.append("<span class='noResults'>Nothing to show </span> ");
  }
}

function outputPostsWithReplies(results, container) {
  container.html("");

  if (results.replyTo != undefined && results.replyTo._id !== undefined) {
    var html = createPostHtml(results.replyTo);
    container.append(html);
  }

  var mainPostHtml = createPostHtml(results.postData, true);
  container.append(mainPostHtml);

  results.replies.forEach((result) => {
    var html = createPostHtml(result);
    container.append(html);
  });
}

function outputUsers(results, container) {
  container.html("");

  results.forEach((result) => {
    var html = createUserHtml(result, true);
    container.append(html);
  });

  if (results.length == 0) {
    container.append("<span class='noResults'>No results found</span>");
  }
}

function createUserHtml(userData, showFollowButton) {
  var name = userData.firstName + " " + userData.lastName;

  var isFollowing =
    userLoggedIn.following && userLoggedIn.following.includes(userData._id);

  var text = isFollowing ? "Following" : "Follow";
  var buttonClass = isFollowing ? "followButton following" : "followButton";

  var followButton = "";
  if (showFollowButton && userLoggedIn._id != userData._id) {
    followButton = `<div class"followButtonContainer"
                            <button class="${buttonClass}" data-user="${userData._id}">${text}</button>
                    </div>`;
  }
  return `<div class='user'>
            <div class='userImageContainer'>
                <img src='${userData.profilePic}'>
            </div>
            <div class='userDetailsContainer'>
                <div class='header'>
                    <a href='/profile/${userData.username}'>${name}</a>
                    <span class='username'>@${userData.username}</span>
                </div>
            </div>
            ${followButton}
        </div>`;
}

function searchUsers(searchTerm) {
  $.get("/api/users", { search: searchTerm }, (results) => {
    outputSelectableUsers(results, $(".resultsContainer"));
  });
}

function outputSelectableUsers(results, container) {
  container.html("");

  results.forEach((result) => {
    if (
      result._id == userLoggedIn._id ||
      selectedUsers.some((user) => user._id == result._id)
    ) {
      return;
    }
    var html = createUserHtml(result, false);
    var element = $(html);
    element.click(() => userSelected(result));

    container.append(element);
  });

  if (results.length == 0) {
    container.append("<span class='noResults'>Nothing to show </span> ");
  }
}

function userSelected(user) {
  selectedUsers.push(user);
  console.log(selectedUsers);
  updateSelectedUsersHtml();
  $("#userSearchTextbox").val("").focus();
  $(".resultsContainer").html("");
  $("#createChatButton").prop("disabled", false);
}

function updateSelectedUsersHtml() {
  var elements = [];

  selectedUsers.forEach((user) => {
    var name = user.firstName + " " + user.lastName;
    var userElement = $(`<span class="selectedUser">${name}</span>`);
    elements.push(userElement);
  });

  $(".selectedUser").remove();
  $("#selectedUsers").prepend(elements);
}

function getChatName(chatData) {
  var chatName = chatData.chatName;
  if (!chatName) {
    var otherChatUsers = getOtherChatUsers(chatData.users);
    var namesArray = otherChatUsers.map(
      (user) => user.firstName + " " + user.lastName
    );
    chatName = namesArray.join(", ");
  }

  return chatName;
}

function getOtherChatUsers(users) {
  //inbox
  if (users.length == 1) return users;

  //group chat
  return users.filter((user) => {
    return user._id != userLoggedIn._id;
  });
}
