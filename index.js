import m from "./mithril.js"
import anime from './anime.js'
import { setTimeout, setInterval } from "timers";

/*********************One signal initializations************************/
var OneSignal = window.OneSignal || [];
OneSignal.push(function() {
  OneSignal.init({
    appId: "87a38029-bda5-4a10-a4c9-697492b36d8f",
    autoRegister: false,
    notifyButton: {
        enable: true,
    },
    welcomeNotification: {
      "title": "Notifications",
      "message": "Thanks for subscribing!",
    },
  });
});
/*********************Functions************************/
var fn = {
  onManageWebPushSubscriptionButtonClicked: function (event) {
    fn.getSubscriptionState().then(function(state) {
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
    });
    event.preventDefault();
  },
  updateMangeWebPushSubscriptionButton: function (buttonSelector) {
    var hideWhenSubscribed = false;
    var subscribeText = "Subscribe to Notifications";
    var unsubscribeText = "Unsubscribe from Notifications";

    fn.getSubscriptionState().then(function(state) {
        var buttonText = !state.isPushEnabled || state.isOptedOut ? subscribeText : unsubscribeText;

        var element = document.querySelector(buttonSelector);
        if (element === null) {
            return;
        }

        element.removeEventListener('click', fn.onManageWebPushSubscriptionButtonClicked);
        element.addEventListener('click', fn.onManageWebPushSubscriptionButtonClicked);
        element.textContent = buttonText;

        if (state.hideWhenSubscribed && state.isPushEnabled) {
            element.style.display = "none";
        } else {
            element.style.display = "";
        }
    });
  },
  getSubscriptionState: function() {
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
  }
}

/*********************Components************************/
var message = {
  view: (vnode)=>{
    return  m("div#message",[
      "Let's get subscrib'n, Push the button meow(now)!"
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
  do: ()=>{
    alert("something");
  },
  view: (vnode)=>{
    return  m("div#subButton",{onclick: button.do}, ["Subscribe"]);
  }
}

var App = {
  view: (vnode)=>{
    console.log("Redraw:", vnode);
    
    return  m("div#app",[
      m("div#greetings","Purr-fect day to you, Hooman!"),
      m("div#purr_container",[
        m(purr),
        m("div#count", 1)
      ]),
      m(message),
      m(button)
    ]);
  }
}

//Mount it baby one more time.
m.mount(document.getElementById("root"), App);