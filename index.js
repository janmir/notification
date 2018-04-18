import m from "./mithril.js"
import anime from './anime.js'
import { setTimeout, setInterval } from "timers";
import tippy from 'tippy.js'

/*********************One signal initializations************************/
var OneSignal = window.OneSignal// || [];
/*OneSignal.push(()=>{
  OneSignal.init({
    appId: "87a38029-bda5-4a10-a4c9-697492b36d8f",
    autoRegister: false,
    notifyButton: {
        enable: false,
    },
    welcomeNotification: {
       "title": "Notifications",
       "message": "Hey {{ user | default: 'there' }}, Thanks for subscribing!",
    }
  });
});
OneSignal.push(()=>{
  OneSignal.on("subscriptionChange", function(isSubscribed) {
    console.log("subscriptionChange")
    console.log("The user's subscription state is now:", isSubscribed);
    // If the user's subscription state changes during the page's session, update the button text
    fn.doUpdate()
  });
});*/

OneSignal.init({
  appId: "87a38029-bda5-4a10-a4c9-697492b36d8f",
  autoRegister: false,
  notifyButton: {
      enable: false,
  },
  welcomeNotification: {
     "title": "Notifications",
     "message": "Hey {{ user | default: 'there' }}, Thanks for subscribing!",
  }
});
OneSignal.on("subscriptionChange", function(isSubscribed) {
  console.log("SubscriptionChange")
  console.log("The user's subscription state is now:", isSubscribed);
  if(isSubscribed){
    //User
    if(App.user !== ""){
      OneSignal.sendTags({
        user: App.user,
        realm: App.realm,
      }, function(tagsSent) {
        console.log("Tags for user was set.")
      });            
    }    
  }
  fn.doUpdate()
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
  about: "Landing page for notification subscription.",
  credits: `
  Cat Images<br/><i>http://iconka.com/en/</i><br/>
  Cat Puns<br/><i>http://blog.spikepadley.com/post/72332709432/cat-puns</i><br/>
  `,
  help: `
  Push the button!, 
  by pushing it you subscribe to web push 
  notifications from this webapp.
  `,

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
      m(".menu_item",{title:menu.credits},"Credits"),
      m(".menu_item",{title:menu.help},"Help?"),
      //m(".menu_item","with❤️by ;p")
    ]);
  }
}

var message = {
  message:"...",
  view: (vnode)=>{
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
    return  m("div#subButton",{onclick: button.do, className: (App.isSubscribed?"unsubButton":"subButton")}, [
      button.buttonLabel
    ]);
  }
}

var App = {
  user: "",
  realm: "odtr",
  isSubscribed: false,
  hasUnsubscribed: false,

  oninit: (vnode)=>{
    //get paths
    let deco = ""
    
    try {
      let url = new URL(window.location.href);
      deco = window.atob(url.searchParams.get("u") || "")
    }catch(error) {}

    if (deco !== ""){
      deco = decodeURIComponent(deco)
      App.user = deco;
    }

    fn.doUpdate();

    console.log(App)
  },
  view: (vnode)=>{
    console.log("Redraw App:")
    console.log("-----App-----")
    console.log(App)
    console.log("-------------")
    return  m("div#container", [
      m(menu),
      m("div#app",
        [
          m("div#greetings","Purrfect Day, Hooman!"),
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