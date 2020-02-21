var easyMDE = new EasyMDE({minHeight:'100%', toolbar: false, status: false, inputStyle: 'contenteditable', cmOptions: {}});

/*
const _log = function(message) {
  var el = document.createElement('div');
  var tn = document.createTextNode(message);
  el.appendChild(tn);
  document.getElementById('log').appendChild(el);
}
*/

const messageActions = {
  SET_CONTENT: (data) => { if (data.content) { easyMDE.value(data.content); } },
  // GET_CONTENT: (data) => { postMessage({action: 'GET_CONTENT_RESPONSE', content: easyMDE.value()}) },
//  REQUEST_WINDOW_HEIGHT: (data) => { postWindowHeight(); },
//  BLUR: (data) => { easyMDE.codemirror.input.blur() },
};

const postMessage = function(data) {
  var message = JSON.stringify(data);
//  _log(`Posting message: ${message}`);
  window.ReactNativeWebView.postMessage(message);
};

const handleIncomingMessage = function(event) {
//  _log(`Received message: ${event.data}`);
  var msgData = JSON.parse(event.data), 
    action = messageActions[msgData.action];
  if (action) action(msgData);
};

const handleResize = function() {
  // document.getElementById('dim').firstChild.textContent = document.documentElement.clientHeight;
  // document.getElementById('dim').style.height=`${document.documentElement.clientHeight}px`;
  document.getElementById('wrap').style.height=`${document.documentElement.clientHeight}px`;
  easyMDE.codemirror.getScrollerElement().style.minHeight=`${document.documentElement.clientHeight}px`;
}

const handleChanges = function(instance, changes) {
  postMessage({action: 'CHANGES_EVENT', content: easyMDE.value(), changes: changes});
}

document.addEventListener("message", handleIncomingMessage, false);
window.addEventListener("message", handleIncomingMessage, false);

window.addEventListener("resize", handleResize);

easyMDE.codemirror.on("changes", handleChanges);

handleResize();
