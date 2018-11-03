import m from "./mithril.js"
import anime from './anime.js'
import { setTimeout, setInterval } from "timers";
import tippy from 'tippy.js'
import load from './static/loading.svg';

/*function Particle( x, y, radius ) {
  this.init( x, y, radius );
}

Particle.prototype = {

  init: function( x, y, radius ) {
      this.alive = true;
      this.radius = radius || 10;
      this.wander = 0.25;
      this.theta = random( TWO_PI );
      this.drag = 0.92;
      this.color = '#fff';
      this.x = x || 0.0;
      this.y = y || 0.0;
      this.vx = 0.0;
      this.vy = 0.0;
  },

  move: function() {
      this.x += this.vx;
      this.y += this.vy;
      this.vx *= this.drag;
      this.vy *= this.drag;
      this.theta += random( -0.5, 0.5 ) * this.wander;
      this.vx += sin( this.theta ) * 0.1;
      this.vy += cos( this.theta ) * 0.1;
      this.radius *= 0.96;
      this.alive = this.radius > 0.5;
  },

  draw: function( ctx ) {
      ctx.beginPath();
      ctx.arc( this.x, this.y, this.radius, 0, TWO_PI );
      ctx.fillStyle = this.color;
      ctx.fill();
  }
};

var MAX_PARTICLES = 100;
var COLOURS = [ '#69D2E7', '#A7DBD8', '#E0E4CC', '#F38630', '#FA6900', '#FF4E50', '#F9D423' ];
var particles = [];
var pool = [];
var cnvs = Sketch.create({
  container: document.body,
  retina: 'auto'
});
cnvs.spawn = function( x, y ) {
  var particle, theta, force;

  if ( particles.length >= MAX_PARTICLES ){
    pool.push( particles.shift() );
  }

  particle = pool.length ? pool.pop() : new Particle();
  particle.init( x, y, random( 5, 20 ) );
  particle.wander = random( 0.5, 2.0 );
  particle.color = random( COLOURS );
  particle.drag = random( 0.9, 0.99 );
  theta = random( TWO_PI );
  force = random( 2, 8 );
  particle.vx = sin( theta ) * force;
  particle.vy = cos( theta ) * force;
  particles.push( particle );
};

cnvs.update = function() {
  var i, particle;
  for ( i = particles.length - 1; i >= 0; i-- ) {
      particle = particles[i];
      if ( particle.alive ) particle.move();
      else pool.push( particles.splice( i, 1 )[0] );
  }
};

cnvs.draw = function() {
  cnvs.globalCompositeOperation  = 'lighter';
  for ( var i = particles.length - 1; i >= 0; i-- ) {
      particles[i].draw( cnvs );
  }
};*/

/*********************One signal initializations************************/
var OneSignal = window.OneSignal; // || [];
var doc = document;
var DEV = false;
var appID = "87a38029-bda5-4a10-a4c9-697492b36d8f"; 
var appIDLocal = "68b454f0-c235-4466-9ed8-44a032534073";

OneSignal.init({
  appId: DEV ? appIDLocal:appID,
  autoRegister: false,
  notifyButton: {
      enable: false,
  },
  welcomeNotification: {
     "title": "meow",
     "message": "Hey {{ user | default: 'there' }}, Thanks for subscribing!"
     + (App.realm == "odtr")?" You will now start receiving odtr timeout notifications.":" ",
  }
});

OneSignal.on("subscriptionChange", function(isSubscribed) {
  console.log("SubscriptionChange:", isSubscribed)
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
      console.log("%cGetSubscriptionState:","color:deepskyblue;font-weight:bold" ,state)
 
      App.isSubscribed = state.isPushEnabled;
      App.hasUnsubscribed = state.isOptedOut;
      App.setNewValues();
      
      m.redraw();
    });
  },
  getRandomInt: (max)=>{
    return Math.floor(Math.random() * Math.floor(max));
  }
}

/*********************Components************************/
var form = {
  user: "",
  realm: "",
  disable: false,
  select_title: "Select which service to subscribe to. default \"odtr\"",
  input_title: "Your username on that service. e.g \"user.name\"",
  onChange: (event)=>{
    event.target.classList.add("edited")
    console.log(event.target.id, event.target.value)
    switch(event.target.id){
      case "realm":{
        App.realm = event.target.value
      }break;
      case "user":{
        App.user = event.target.value
      }break;
    }

    if (App.user == "" || App.realm == ""){
      event.redraw = false
    }else{
      button.oncreate();
    }
  },
  oncreate: (vnode)=>{
    tippy("#form > *",{
      trigger: 'mouseenter',
      animateFill: true,
      arrow: true,
      arrowType: 'large',
      distance: 10,
      placement: 'right',
      size: 'large',
      maxWidth: '15em'
    });
  },
  view: (vnode)=>{
    return m("fieldset#fieldset", {disabled:form.disable}, 
      m("form#form",[
      m("select#realm",{name: "realm", onchange: form.onChange, title:form.select_title},[
        m("option", {disabled:true, selected:true, value:""}, "Realm"),
        m("option", {value: "odtr"}, "ODTR"),
      ]),
      m("input#user", {
        name: "user", placeholder: "Username", onchange: form.onChange, title:form.input_title
      }),
    ]));
  }
}

var menu = {
  about: `
  <div style="text-align:left">
  This is a landing page for notification subscription. 
  Just read the Help section if you're
  a bit confused 😕.
  <br/><br/>
  <b>Disclamer</b>
  <br/>
  THE WEB APPLICATION IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE APPLICATION OR THE USE OR OTHER DEALINGS IN THE APPLICATION. <br/><br/>FURTHERMORE, THIS WEB APPLICATION IS NOT AFFILIATED WITH, ENDORSED BY, OR IN ANY OTHER WAY ASSOCIATED WITH ADVANCED WORLD SYSTEMS INC..
  </div>
  `,
  credits: `
  <div style="text-align:left">
  <b>😻 Cat Images</b><br/><i style="background-color:lightgray">http://iconka.com/en/</i><br/><br/>
  <b>😽 Cat Puns</b><br/><i style="background-color:lightgray">http://blog.spikepadley.com/post/72332709432/cat-puns</i><br/><br/>
  <b>🐈 Cat Quotes</b><br/><i style="background-color:lightgray">https://www.pinterest.com/pin/73394668911177177</i>
  </div>
  `,
  pricing: `
  <ul id="price">
  <li><img src="https://notif.janmir.me/static/icon0.png"><div><div class="name">
  Daku mata miming
  </div><div class="desc">
  Daku ni siya og mata O_O.
  </div><div class="price">
  ¥ 1,000
  </div></div></li>
  <li><img src="https://notif.janmir.me/static/icon4.png"><div><div class="name">
  Chill miming
  </div><div class="desc">
  Chill so mahal.
  </div><div class="price">
  ¥ 1,000,000
  </div></div></li>
  <li><img src="https://notif.janmir.me/static/icon7.png"><div><div class="name">
  Loner miming
  </div><div class="desc">
  Soo so sad T_T
  </div><div class="price">
  ¥ 999,000
  </div></div></li>
  <li><img src="https://notif.janmir.me/static/icon10.png"><div><div class="name">
  Chubby miming
  </div><div class="desc">
  Busog.
  </div><div class="price">
  ¥ 100
  </div></div></li>
  <li><img src="https://notif.janmir.me/static/icon17.png"><div><div class="name">
  Grumpy miming
  </div><div class="desc">
  Bad-tempered and irritable.
  </div><div class="price">
  ¥ 2,500
  </div></div></li>
  </ul>
  `,
  help: `
  <div style="text-align:left">
  <b style="font-size:1.2em">🚀What is this?</b><br/>
  This is a web notification service for random things. 
  Currently here are/is the service(s) available for you
  to subscribe to...I call them realms. 
  <ul>
  <li><b>odtr</b></li>
  <i>
  This service notifies you to time-out. That's it 😆.
  Notifications are created every 9:46AM JST and will be delivered to
  you at exactly 9 hours after, so if you're late, you won't receiving any. Am sorry 😜.
  </i>
  <li>(more to come...or not HAHAHAHA 🤣 )</li>
  </ul> 
  <b style="font-size:1.2em">🎎What should I do?</b><br/>
  Push the button!, 
  by pushing it you subscribe/un-subscribe to push 
  notifications from this web application (notif.janmir.me).<br/><br/>
  <b style="font-size:1.2em">🏮Wait what?</b><br/>
  Seriously? Ummm okay here's what it looks like.<br/><br/>
  In Windows...
  <div style="text-align:center;margin:1em auto">
  <img src="./static/notification.png"/>
  </div>
  So, if you subscribe to "odtr" it would say something like - <i>"Hey! You can 
  time-out now".</i>
  Got it? Good. 🤩<br/>
  By the way, this only works on Chrome Browsers
  for Mac and Windows. So don't close your Chrome..you can close this website tho, 
  it will still work<br/><br/>
  <b style="font-size:1.2em">🏯Persistence</b><br/>
  By default, Chrome notifications will persist on Windows PC until 
  the user dismisses or clicks the notification. On Mac, they will 
  disappear roughly after 20 seconds.<br/>
  Clearing browsing data e.g cookies, history would stop the app from
  working (notification won't pop-up anymore). To fix this, you need to re-enable 
  your subscription by visiting this web application again.
  <br/><br/>
  <b style="font-size:1.2em">🎀Other FAQs - Frequently Answered Questions</b><br/>
  <ul>
  <li><b>Why all the miming?</b></li>
  Because you know...
  </ul> 
  </div>
  `,
  makeTemplate: (tmp)=>{
    const template = document.createElement('div')
    template.innerHTML = tmp;
    return template;
  },
  oncreate: (vnode)=>{
    
    tippy("#about",{
      trigger: 'click',
      html: menu.makeTemplate(menu.about),
      animateFill: true,
      arrow: true,
      arrowType: 'large',
      theme: "light",
      distance: 1,
      maxWidth:'20em',
      animation: 'perspective',
      interactive: true,
      onShow: (instance)=>{
        instance.reference.classList.add("menu_selected");
      },
      onHide: (instance)=>{        
        instance.reference.classList.remove("menu_selected");
      }
    });
    tippy("#credits",{
      trigger: 'click',
      html: menu.makeTemplate(menu.credits),
      animateFill: true,
      arrow: true,
      arrowType: 'large',
      theme: "light",
      distance: 1,
      maxWidth:'20em',
      animation: 'perspective',
      interactive: true,
      onShow: (instance)=>{
        instance.reference.classList.add("menu_selected");
        let h = doc.getElementById("heart")
        h.classList.add("redHeart")
      },
      onHide: (instance)=>{        
        instance.reference.classList.remove("menu_selected");
        let h = doc.getElementById("heart")
        h.classList.remove("redHeart")
      }
    });
    tippy("#pricing",{
      trigger: 'click',
      html: menu.makeTemplate(menu.pricing),
      animateFill: true,
      arrow: true,
      arrowType: 'large',
      theme: "light",
      distance: 1,
      maxWidth:'20em',
      animation: 'perspective',
      interactive: true,
      onShow: (instance)=>{
        instance.reference.classList.add("menu_selected");
      },
      onHide: (instance)=>{        
        instance.reference.classList.remove("menu_selected");
      }
    });
    tippy("#help",{
      trigger: 'click',
      html: menu.makeTemplate(menu.help),
      animateFill: true,
      arrow: true,
      arrowType: 'large',
      theme: "light",
      distance: 1,
      maxWidth:'38em',
      animation: 'perspective',
      interactive: true,
      onShow: (instance)=>{
        instance.reference.classList.add("menu_selected");
      },
      onHide: (instance)=>{        
        instance.reference.classList.remove("menu_selected");
      }
    });
  },
  view: (vnode)=>{
    return  m("div#menu",[
      m("#about.menu_item", "About"),
      m("#help.menu_item", "Help"),
      m("#pricing.menu_item", "Pricing"),
      m("#credits.menu_item", [m("span#heart","❤"), "Credits"]),
    ]);
  }
}

var message = {
  message:"...",
  message_subscribe: "\"Let's get subscrib'n, hit that subscribe button meow(now)!\"",
  message_resubscribe: "\"Changed your mind? Told you t'was a bad idea.\"",
  message_unsubscribe: "\"Choo Choo! close this now, you're already subscribed. Don't touch anything.\"",
  view: (vnode)=>{
    return  m("div#message",[
      message.message
    ]);
  }
}

var purr = {
  purrs: ["acrobat.gif","purr.gif","banjo.gif","sleepy.gif","knead.gif"],
  purrIndex: 0,
  view: (vnode)=>{
    return  m("div#purr",[
      m("img", {
        src: "./static/" + purr.purrs[purr.purrIndex]
      })
    ]);
  }
}

var button = {
  buttonLabel:"...",
  oncreate: (vnode)=>{
    let button = doc.getElementById('subButton');
    if(!App.isSubscribed && !App.hasUnsubscribed){
      if (App.user == "" || App.realm == ""){
        button.classList.add("button-disabled");
      }else if(App.user != "" && App.realm != ""){
        button.classList.remove("button-disabled");
      }
    }
  },
  showHideLoad: (show)=>{
    let button_loading = doc.querySelector(".loading");
    let button_text = doc.querySelector(".button_text");
    let button = doc.getElementById('subButton');
    let _ = null;

    if(show){ 
      console.log("show loading");
      _ = (button_loading != null)?button_loading.style.display = "inline-block":'';
      _ = (button_text != null)?button_text.style.display = "none":'';
      _ = (button_text != null)?button.classList.add("button-disabled"):'';
      form.disable = true;
  
    }else{
      console.log("hide loading");
      _ = (button_loading != null)?button_loading.style.display = "none":'';
      _ = (button_text != null)?button_text.style.display = "inline-block":'';
      _ = (button != null)?button.classList.remove("button-disabled"):'';
    }
  },
  do: (event)=>{
    console.log("%cValue:","font-weight:bold;color:darkred",App)

    button.showHideLoad(true);      

    if (DEV){
      setTimeout(()=>{
        App.isSubscribed = !App.isSubscribed;
        App.hasUnsubscribed = !App.isSubscribed;
  
        App.setNewValues();
        
        m.redraw();
      },2000)
    }else{
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
    }
  },
  view: (vnode)=>{
    return  m("div#subButton.ripple",{onclick: button.do, className: (App.isSubscribed?"unsubButton":"subButton")}, [
      m("img.loading", {src: "/static/loading.svg"}),
      m(".button_text", button.buttonLabel)
    ]);
  }
}

var App = {
  greetings: "Purrfect day, Hooman!",
  isSubscribed: null,
  hasUnsubscribed: null,
  showForm: true,

  user: "",
  realm: "odtr",

  punnyQuotes: ["You are purrrfect, I'm not kitten you :3",
                "When I'm with you I'm feline good :P",
                "I think you're really purrretty :*",
                "You are kinda pawsome..",
                "Today, I would've been clawful without you. Fur-real!"],
  quoteIndex: 0,

  oninit: (vnode)=>{
    App.quoteIndex = fn.getRandomInt(App.punnyQuotes.length);

    //get paths
    let _user = ""
    let _realm = ""
    
    try {
      let url = new URL(window.location.href);
      _user = window.atob(url.searchParams.get("u") || "")
      _realm = window.atob(url.searchParams.get("r") || "")
    }catch(error) {}

    if (_user !== ""){
      _user = decodeURIComponent(_user)
      App.user = _user;
    }

    if (_realm !== ""){
      _realm = decodeURIComponent(_realm)
      App.realm = _realm;
    }

    if(App.realm != "" && App.user != ""){
      App.showForm = false;
    }

    setTimeout(()=>{fn.doUpdate();},2100)
  },
  oncreate:()=>{
    return
    setTimeout(()=>{
      let ifr = document.querySelector('iframe');
      ifr.parentNode.removeChild(ifr);
    }, 1000)
  },
  onupdate:(vnode)=>{
    let toHide = doc.querySelector('.toHide')
    let theApp = doc.querySelector('#app')
    let theLoad = doc.querySelector('#app svg')
    
    if(toHide != null && theApp != null){
      anime({
        targets: toHide,
        opacity: [
          { value: 1, duration: 1000, easing: 'linear' }
        ],
        begin: ()=>{
          toHide.style.display = "block"
          theLoad.style.display = "none"
          if(!App.showForm){
            theApp.style.height = "8em"
          }else{
            theApp.style.height = "15em"
          }
        },
        complete: ()=>{
          /*
          for (let i = 0; i < 100; i++ ) {
            let x = ( cnvs.width * 0.5 ) + random( -100, 100 );
            let y = ( cnvs.height * 0.5 ) + random( -100, 100 );
            cnvs.spawn( x, y );
          }

          cnvs.clear();
          console.log(cnvs)
          */
        }
      });
    }
  },
  setNewValues:()=>{
    if (App.isSubscribed){
      message.message = message.message_unsubscribe;
      button.buttonLabel = "Unsubscribe";
      button.showHideLoad(false);
      purr.purrIndex = 3;
    }else{
      if(App.hasUnsubscribed){
        message.message = message.message_resubscribe;
        button.buttonLabel = "Re-Subscribe";
        button.showHideLoad(false);
        purr.purrIndex = 4;
      }else{
        message.message = message.message_subscribe;
        button.buttonLabel = "Subscribe";
        purr.purrIndex = 1;
      }
    }
  },
  view: (vnode)=>{
    if(App.isSubscribed || App.hasUnsubscribed){
      App.showForm = false;
    }

    let theForm = null;
    if(App.showForm){
      theForm = m(".inner_form",[
        m("#but_first", "But first! fill this up."),
        m(form),
      ]);
    }

    let theBody = null;
    if (App.isSubscribed != null && App.hasUnsubscribed != null){
      theBody = m(".toHide",[
        m("div#greetings", App.greetings),
        m(message),
        theForm,
        m(button),
      ]);

      console.log("%cRedraw App:","color:olive;font-weight:bold",App)
    }

    return  m("div#container", [
      m(menu),
      m("div#app",
        [
          m("div#purr_container",[
            m("#catName", "Mingming"),
            m("#catQuote", App.punnyQuotes[App.quoteIndex]),
            m("#purrBorder",[
              m(purr),
              m("div#count", 1)
            ]
            ),
          ]),
          m.trust(load),
          theBody
        ])
      ]);
  }
}

//Mount it baby one more time.
m.mount(document.getElementById("root"), App);