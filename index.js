import m from "./mithril.js"
import anime from './anime.js'
import { setTimeout, setInterval } from "timers";
import tippy from 'tippy.js'
// import {OneSignal} from 'https://cdn.onesignal.com/sdks/OneSignalSDK.js'

console.log("Load v2...")

/*********************One signal initializations************************/
var OneSignal = window.OneSignal || [];
OneSignal.push(function() {
  OneSignal.init({
    appId: "87a38029-bda5-4a10-a4c9-697492b36d8f",
    autoRegister: false,
    notifyButton: {
        enable: false,
    },
    welcomeNotification: {
       "title": "Notifications",
       "message": "Thanks for subscribing!",
    }
  });
  OneSignal.on("subscriptionChange", function(isSubscribed) {
    console.log("subscriptionChange")
    console.log("The user's subscription state is now:", isSubscribed);
    // If the user's subscription state changes during the page's session, update the button text
    fn.doUpdate()
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

      if (App.isSubscribed){
        message.message = "You are already subscribed, off you go..."
        button.buttonLabel = "Unsubscribe"
      }else{
        message.message = "Let's get subscrib'n, Push the button meow(now)!"
        button.buttonLabel = "Subscribe"
      }
  
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
  message:"...",
  view: (vnode)=>{
    console.log("Redraw message:")

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
  buttonLabel:"...",
  do: ()=>{
    fn.getSubscriptionState().then(function(state) {
      if (state.isPushEnabled) {
        console.log("UNSUBSCRIBE")
          /* Subscribed, opt them out */
          OneSignal.setSubscription(false);

          setTimeout(()=>{
            location.reload();
          },1000)
      } else {
          console.log("SUBSCRIBE")
          if (state.isOptedOut) {
            console.log("SUBSCRIBE:OPT-IN")
            /* Opted out, opt them back in */
              OneSignal.setSubscription(true);
          } else {
            console.log("SUBSCRIBE:REGISTER")
            /* Unsubscribed, subscribe them */
              OneSignal.registerForPushNotifications();
          }
      }
    });
  },
  view: (vnode)=>{
    return  m("div#subButton",{onclick: button.do}, [
      button.buttonLabel
    ]);
  }
}

var App = {
  isSubscribed: false,
  hasUnsubscribed: false,

  oninit: (vnode)=>{
    fn.doUpdate();
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