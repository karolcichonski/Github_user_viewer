import './assets/scss/app.scss';
import $, { each } from 'cash-dom';
require('es6-promise').polyfill();
require('isomorphic-fetch');


export class App {
  initializeApp() {
    const self = this;
    let nameFlag = false;

    $('.username').on('change', function (e) {
      self.checkInputTex();
    });

    $('.load-username').on('click', function (e) {
      nameFlag = self.checkInputTex();
      let userName = $('.username.input').val();
      if (nameFlag && userName.length != 0) {
        $(`#spinner`).removeClass('is-hidden');
        fetch(`https://api.github.com/users/${userName}`)
          .then(response => response.json())
          .then(response => {
            self.profile = response;
            if (response.login){
              self.update_profile();
            }else{
              self.profileNotFound();
            }
          })
          .then(()=>{
              $(`#spinner`).addClass('is-hidden');
              $(`.profile`).removeClass('is-hidden');
          })
      } else {
        $('.username').addClass('redBorder');
        nameFlag = false;
      }
    })
  }

  checkInputTex() {
    const userName = $('.username.input').val();
    const reg = /[^a-z0-9_-]/;
    if (reg.test(userName)) {
      $('.username').addClass('redBorder');
      return false;
    } else {
      $('.username').removeClass('redBorder');
      return true;
    }
  }

  update_profile() {
    this.loadHistory();
    $('#profile-name').text($('.username.input').val());
    $('#profile-image').attr('src', this.profile.avatar_url);
    $('#profile-url').attr('href', this.profile.html_url).text(this.profile.login);
    $('#profile-bio').text(this.profile.bio || '(no information)');
  }

  profileNotFound() {
    console.log("profile not found");
    $('#profile-name').text('Profile not found');
    $('#profile-image').attr('src', 'http://placekitten.com/200/200');
    $('#profile-url').attr('href', "#").text('');
    $('#profile-bio').text('');
    for(let i=0; i<3; i++){
      this.hideHistoryItem(i);
    }
  }

  loadHistory() {
    let userName = $('.username.input').val();
    fetch(`https://api.github.com/users/${userName}/events/public`)
      .then(response => response.json())
      .then(response => this.handleEvents(response))
  }

  handleEvents(apiResponse) {
    let eventCounter = 0;
    const srchEventTable = ["PullRequestEvent", "PullRequestReviewCommentEvent"];
    apiResponse.forEach(singleEvent => {
      if (srchEventTable.indexOf(singleEvent.type)>=0 && eventCounter < 3) {
        this.updateTimeline(singleEvent, eventCounter);
        eventCounter++;
      }
    })

    if (eventCounter < 3) {
      for (let i = 2; i >= eventCounter; i--) {
        this.hideHistoryItem(i);
      }
    }
  }

  updateTimeline(timelineTable, itemNr) {
    this.showHistoryItem(itemNr);
    var dateFormat = require('dateformat');
    let dtime = new Date(timelineTable.created_at);
    let date = dateFormat(dtime, "mmm dd, yyyy");
    let actionType;
    if (timelineTable.payload.action == "created") {
      actionType = `<a href="${timelineTable.payload.comment.url}">comment</a> to`;
    } else {
      actionType = "";
    }

    $(`#timeline${itemNr}`).html(
      `<p class="heading">${date}</p>
    <div class="content">
    <span class="gh-username">
      <img src="${timelineTable.actor.avatar_url}" alt="avatar" />
      <a href="https://github.com/${timelineTable.actor.login}">${timelineTable.actor.display_login}</a>
    </span>
      ${timelineTable.payload.action}
      ${actionType}
    <a href="${timelineTable.payload.pull_request.html_url}">pull request</a>
    <p class="repo-name">
      <a href="https://github.com/${timelineTable.repo.name}">${timelineTable.repo.name}</a>
    </p>
  </div>`
    )
  }

  hideHistoryItem(itemToHide) {
    $(`#timeline-item${itemToHide}`).addClass('is-hidden');
  }

  showHistoryItem(itemToShow) {
    $(`#timeline-item${itemToShow}`).removeClass('is-hidden');
  }
}

