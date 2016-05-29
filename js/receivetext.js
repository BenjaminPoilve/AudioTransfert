var client = new WebTorrent()
var magnetURI = '9603665a935d973614016cd45aec9cb2b76e33b5'
var spinner;
var instruction;
var downloadLink;


function startTorrent(magnet){
client.add('magnet:?xt=urn:btih:'+magnet+'&tr=wss%3A%2F%2Ftracker.webtorrent.io', function (torrent) {
  // Got torrent metadata!
  console.log('Client is downloading:', torrent.infoHash)
  spinner.innerHTML = '<img src="./img/hashLoading.gif"  style="margin-left: auto;\
  margin-right: auto;\
  display: block;" >';
  instruction.innerHTML ="Downloading..";

  torrent.files.forEach(function (file) {
    // Display the file by appending it to the DOM. Supports video, audio, images, and
    // more. Specify a container element (CSS selector or reference to DOM node).
    file.getBlobURL(function (err, url) {
        window.clearInterval(display);
        instruction.innerHTML ="Done!";
        spinner.innerHTML = '<br>';
        if (err) throw err
        var a = document.createElement('a')
        a.download = file.name
        a.href = url
        a.textContent =  "Get the file"
        spinner.innerHTML = '<a download="'+file.name+'" href="'+url+'">Get the file</a> ';
})
  })
  var display = setInterval(DisplayProgress, 1000, torrent);

})
}

function DisplayProgress(torrent) {
    instruction.innerHTML ="Downloading.. "+ Math.trunc(torrent.progress *100 )+ "%";

}



var TextReceiver = (function() {
    Quiet.setProfilesPrefix("/js/");
    Quiet.setMemoryInitializerPrefix("/js/");
    Quiet.setLibfecPrefix("/js/");
    var target;
    var content = new ArrayBuffer(0);

    function onReceive(recvPayload) {
        content = Quiet.mergeab(content, recvPayload);
        target.textContent = Quiet.ab2str(content);
		console.log( Quiet.ab2str(content).length);


		if( Quiet.ab2str(content).length==40){
		 startTorrent(Quiet.ab2str(content));
		}
    };

    function onReceiverCreateFail(reason) {
        console.log("failed to create quiet receiver: " + reason);
        console.log("Sorry, it looks like this example is not supported by your browser. Please give permission to use the microphone or try again in Google Chrome or Microsoft Edge.")
    };

    function onReceiveFail(num_fails) {
        console.log("We didn't quite get that. It looks like you tried to transmit something. You may need to move the transmitter closer to the receiver and set the volume to 50%.");
    };

    function onQuietReady() {
        var profilename = document.querySelector('[data-quiet-profile-name]').getAttribute('data-quiet-profile-name');
        Quiet.receiver(profilename, onReceive, onReceiverCreateFail, onReceiveFail);
    };

    function onQuietFail(reason) {
        console.log("quiet failed to initialize: " + reason);
      console.log("Sorry, it looks like there was a problem with this example (" + reason + ")");
    };

    function onDOMLoad() {
        target = document.querySelector('[data-quiet-receive-text-target]');

         spinner = document.querySelector(".spinner");
         instruction = document.querySelector("#instruction");
         downloadLink = document.querySelector("#downloadLink");


        Quiet.addReadyCallback(onQuietReady, onQuietFail);
    };

    document.addEventListener("DOMContentLoaded", onDOMLoad);
})();
