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
              btn.addEventListener('click', onClick, false);
              btn.disabled = false;
              var originalText = btn.innerText;
              btn.innerText = btn.getAttribute('data-quiet-sending-text');
              btn.setAttribute('data-quiet-sending-text', originalText);
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
                    btn = document.querySelector('[data-quiet-send-button]');
                    textbox = document.querySelector('[data-quiet-text-input]');
                    warningbox = document.querySelector('[data-quiet-warning]');
                    dragDrop('body', function (files) {
                            console.log("hashing");
                            client.seed(files, function (torrent) {
                               payload = torrent.magnetURI.split(':')[3];
                              payload= payload.split('&')[0];
                              console.log('Client is seeding ' + payload)
                              if (payload === "") {
                                  return;
                              }
                              btn.addEventListener('click', onClick, false);
                          });
                          });
                    Quiet.addReadyCallback(onQuietReady, onQuietFail);
                };

                document.addEventListener("DOMContentLoaded", onDOMLoad);


      })();
