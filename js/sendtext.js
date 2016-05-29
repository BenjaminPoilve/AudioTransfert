var dragDrop = require('drag-drop')
var WebTorrent = require('webtorrent')

var client = new WebTorrent();
var payload;
var btn;
var textbox;
var warningbox;
var transmit;








var TextTransmitter = (function() {
          Quiet.setProfilesPrefix("/js/");
          Quiet.setMemoryInitializerPrefix("/js/");
          Quiet.setLibfecPrefix("/js/");


          function onTransmitFinish() {
              btn = document.querySelector("#emit");
              btn.addEventListener('click', onClick, false);
              btn.disabled = false;
              document.querySelector( "#emit-label" ).innerText="Re-Emit";
          };

          function onClick(e) {
              e.target.removeEventListener(e.type, arguments.callee);
              e.target.disabled = true;
              var originalText = e.target.innerText;

              if (payload === "") {
                  onTransmitFinish();
                  return;
              }
              transmit(Quiet.str2ab(payload), onTransmitFinish);
          };

          function onQuietReady() {
              var profilename = document.querySelector('[data-quiet-profile-name]').getAttribute('data-quiet-profile-name');
              transmit = Quiet.transmitter(profilename);

          };

          function onQuietFail(reason) {
              console.log("quiet failed to initialize: " + reason);

          };

          function onDOMLoad() {

              // ajout de la classe JS à HTML
              document.querySelector("html").classList.add('js');

              // initialisation des variables
              var fileInput  = document.querySelector( ".input-file" ),
                  button     = document.querySelector( ".input-file-trigger" ),
                  the_return = document.querySelector(".file-return"),
                  spinner = document.querySelector(".spinner");
                  loadfiles = document.querySelector("#loadFile");
                  instruction = document.querySelector("#instruction");

              // action lorsque le label est cliqué
              button.addEventListener( "click", function( event ) {
                 fileInput.focus();
                 return false;
              });

              // affiche un retour visuel dès que input:file change
              fileInput.addEventListener( "change", function( event ) {
                  loadFile.innerHTML = '<button type="button" id="emit" style=" background: transparent;\
                  border: none !important;\
                  font-size:1em;" >\
                      <label for="emit" class="input-file-trigger" tabindex="0">Hashing...</label>';
                  instruction.innerHTML ="please wait..";

                  the_return.innerHTML =this.value;
                  spinner.innerHTML = '<img src="./img/hashLoading.gif"  style="margin-left: auto;\
                  margin-right: auto;\
                  display: block;" >';
                  console.log("hashing");
                  console.log(this.files[0]);
                  client.seed( this.files[0], function (torrent) {
                    payload = torrent.magnetURI.split(':')[3];
                    payload= payload.split('&')[0];
                     spinner.style.visibility='hidden';
                     instruction.innerHTML ="Ready To Emit";
                     loadFile.innerHTML = '<button type="button" id="emit" style=" background: transparent;\
                     border: none !important;\
                     font-size:1em;" >\
                         <label for="emit" id= "emit-label" class="input-file-trigger" tabindex="0">Emit</label>';

                    console.log('Client is seeding ' + payload)
                    if (payload === "") {
                        return;
                    }
                     btn = document.querySelector("#emit");
                    btn.addEventListener('click', onClick, false);
                });

              });

                    Quiet.addReadyCallback(onQuietReady, onQuietFail);
                };

                document.addEventListener("DOMContentLoaded", onDOMLoad);


      })();
