import './assets/scss/app.scss';
import $, { each } from 'cash-dom';
require('es6-promise').polyfill();
require('isomorphic-fetch');


export class App {
  initializeApp() {
    const self = this;
    let nameFlag=false;

    $('.username').on('change', function (e) {
      self.checkInputTex();
    });

    $('.load-username').on('click', function (e) {
      nameFlag=self.checkInputTex();
      let userName = $('.username.input').val();
      if (nameFlag && userName.length != 0){
        fetch(`https://api.github.com/users/${userName}`)
          .then(response => response.json())
          .then(response => {
            self.profile = response;
            self.update_profile();
          })
      }else{
        $('.username').addClass('redBorder');
        nameFlag = false;
      }
    })
  }

  checkInputTex(){
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
    $('#profile-name').text($('.username.input').val());
    $('#profile-image').attr('src', this.profile.avatar_url);
    $('#profile-url').attr('href', this.profile.html_url).text(this.profile.login);
    $('#profile-bio').text(this.profile.bio || '(no information)');
  }
}

