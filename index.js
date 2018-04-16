import m from "./mithril.js"
import anime from './anime.js'
import { setTimeout, setInterval } from "timers";
import tippy from 'tippy.js'
// import {OneSignal} from 'https://cdn.onesignal.com/sdks/OneSignalSDK.js'

/*********************One signal initializations************************/
var OneSignal = window.OneSignal || [];
OneSignal.push(function() {
  OneSignal.init({
    appId: "87a38029-bda5-4a10-a4c9-697492b36d8f",
    allowLocalhostAsSecureOrigin: true,
    autoRegister: false,
    notifyButton: {
        enable: true,
    },
    welcomeNotification: {
       "title": "Notifications",
       "message": "Thanks for subscribing!",
    }
  });
  OneSignal.on("subscriptionChange", function(isSubscribed) {
    console.log("subscriptionChange")
    // If the user's subscription state changes during the page's session, update the button text
    m.redraw()
  });

});
/*********************Functions************************/
var fn = {
  getSubscriptionState: function() {
    console.log("getSubscriptionState")
    return Promise.all([
      OneSignal.isPushNotificationsEnabled(),
      OneSignal.isOptedOut()
    ]).then(function(result) {
        var isPushEnabled = result[0];
        var isOptedOut = result[1];

        return {
            isPushEnabled: isPushEnabled,
            isOptedOut: isOptedOut
        };
    });
  },
  doUpdate: ()=>{
    fn.getSubscriptionState().then(function(state) {
      console.log("oninit:getSubscriptionState")
      console.log(state)
  
      App.isSubscribed = state.isPushEnabled;
      App.hasUnsubscribed = state.isOptedOut;
      m.redraw();
    });
  }
}

/*********************Components************************/
var menu = {
  about: "This is about message",
  oncreate: (vnode)=>{
    tippy(".menu_item",{
      trigger: 'click',
      arrow: true,
      arrowType: 'round',
      animateFill: true,
      distance: 1,
    })
  },
  view: (vnode)=>{
    return  m("div#menu",[
      m(".menu_item",{title:menu.about},"About"),
      m(".menu_item","Credits"),
      m(".menu_item","Help?"),
      //m(".menu_item","with❤️by ;p")
    ]);
  }
}

var message = {
  message:"Let's get subscrib'n, Push the button meow(now)!",
  oninit: (vnode)=>{
    console.log("Init message:")
  },
  oncreate:(vnode)=>{
    console.log("Oncreate")
  },
  onupdate(vnode){
    console.log("onupdate")
  },
  view: (vnode)=>{
    console.log("Redraw message:")

    if (App.isSubscribed){
      message.message = "You are already subscribed, off you go..."
    }

    return  m("div#message",[
      message.message
    ]);
  }
}

var purr = {
  view: (vnode)=>{
    return  m("div#purr",[
      m("img", {
        src: "./static/catpurr.gif"
      })
    ]);
  }
}

var button = {
  buttonLabel:"Subscribe",
  oninit: (vnode)=>{
    console.log("Init button:")
  },
  do: ()=>{
    fn.getSubscriptionState().then(function(state) {
      console.log("do:getSubscriptionState")
      console.log(state)
      if (state.isPushEnabled) {
          /* Subscribed, opt them out */
          OneSignal.setSubscription(false);
      } else {
          if (state.isOptedOut) {
              /* Opted out, opt them back in */
              OneSignal.setSubscription(true);
          } else {
              /* Unsubscribed, subscribe them */
              OneSignal.registerForPushNotifications();
          }
      }

      fn.doUpdate()
    });
  },
  oncreate:(vnode)=>{
    console.log("Oncreate")
  },
  onupdate(vnode){
    console.log("onupdate")
  },

  view: (vnode)=>{
    console.log("Redraw button:")

    if (App.isSubscribed){
      button.buttonLabel = "Unsubscribe"
    }

    return  m("div#subButton",{onclick: button.do}, [
      button.buttonLabel
    ]);
  }
}

var App = {
  isSubscribed: false,
  hasUnsubscribed: false,
  oninit: (vnode)=>{
    console.log("Init app:")
    fn.doUpdate()
  },
  oncreate:(vnode)=>{
    console.log("Oncreate")
  },
  onupdate(vnode){
    console.log("onupdate")
  },

  view: (vnode)=>{
    console.log("Redraw App:")
    console.log(App)
    return  m("div#container", [
      m(menu),
      m("div#app",
        [
          m("div#greetings","Purr-fect day to you, Hooman!"),
          m("div#purr_container",[
            m(purr),
            m("div#count", 1)
          ]),
          m(message),
          m(button)
        ])
      ]);
  }
}

//Mount it baby one more time.
m.mount(document.getElementById("root"), App);