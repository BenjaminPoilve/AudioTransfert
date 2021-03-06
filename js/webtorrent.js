! function(e) {
    if ("object" == typeof exports && "undefined" != typeof module) module.exports = e();
    else if ("function" == typeof define && define.amd) define([], e);
    else {
        var t;
        t = "undefined" != typeof window ? window : "undefined" != typeof global ? global : "undefined" != typeof self ? self : this, t.WebTorrent = e()
    }
}(function() {
    var e;
    return function t(e, n, r) {
        function o(s, a) {
            if (!n[s]) {
                if (!e[s]) {
                    var c = "function" == typeof require && require;
                    if (!a && c) return c(s, !0);
                    if (i) return i(s, !0);
                    var u = new Error("Cannot find module '" + s + "'");
                    throw u.code = "MODULE_NOT_FOUND", u
                }
                var f = n[s] = {
                    exports: {}
                };
                e[s][0].call(f.exports, function(t) {
                    var n = e[s][1][t];
                    return o(n ? n : t)
                }, f, f.exports, t, e, n, r)
            }
            return n[s].exports
        }
        for (var i = "function" == typeof require && require, s = 0; s < r.length; s++) o(r[s]);
        return o
    }({
        1: [
            function(e, t, n) {
                (function(e) {
                    t.exports = function(t, n) {
                        var r = [];
                        t.on("data", function(e) {
                            r.push(e)
                        }), t.once("end", function() {
                            n && n(null, e.concat(r)), n = null
                        }), t.once("error", function(e) {
                            n && n(e), n = null
                        })
                    }
                }).call(this, e("buffer").Buffer)
            }, {
                buffer: 25
            }
        ],
        2: [
            function(e, t, n) {
                function r(e, t) {
                    s.Readable.call(this, t), this.destroyed = !1, this._torrent = e._torrent;
                    var n = t && t.start || 0,
                        r = t && t.end && t.end < e.length ? t.end : e.length - 1,
                        o = e._torrent.pieceLength;
                    this._startPiece = (n + e.offset) / o | 0, this._endPiece = (r + e.offset) / o | 0, this._piece = this._startPiece, this._offset = n + e.offset - this._startPiece * o, this._missing = r - n + 1, this._reading = !1, this._notifying = !1, this._criticalLength = Math.min(1048576 / o | 0, 2)
                }
                t.exports = r;
                var o = e("debug")("webtorrent:file-stream"),
                    i = e("inherits"),
                    s = e("readable-stream");
                i(r, s.Readable), r.prototype._read = function() {
                    this._reading || (this._reading = !0, this._notify())
                }, r.prototype._notify = function() {
                    var e = this;
                    if (e._reading && 0 !== e._missing) {
                        if (!e._torrent.bitfield.get(e._piece)) return e._torrent.critical(e._piece, e._piece + e._criticalLength);
                        if (!e._notifying) {
                            e._notifying = !0;
                            var t = e._piece;
                            e._torrent.store.get(t, function(n, r) {
                                if (e._notifying = !1, !e.destroyed) {
                                    if (n) return e.destroy(n);
                                    o("read %s (length %s) (err %s)", t, r.length, n && n.message), e._offset && (r = r.slice(e._offset), e._offset = 0), e._missing < r.length && (r = r.slice(0, e._missing)), e._missing -= r.length, o("pushing buffer of length %s", r.length), e._reading = !1, e.push(r), 0 === e._missing && e.push(null)
                                }
                            }), e._piece += 1
                        }
                    }
                }, r.prototype.destroy = function() {
                    this.destroyed || (this.destroyed = !0, this._torrent.destroyed || this._torrent.deselect(this._startPiece, this._endPiece, !0))
                }
            }, {
                debug: 68,
                inherits: 76,
                "readable-stream": 106
            }
        ],
        3: [
            function(e, t, n) {
                (function(n) {
                    function r(e, t) {
                        i.call(this), this._torrent = e, this.name = t.name, this.path = t.path, this.length = t.length, this.offset = t.offset, this.done = !1;
                        var n = t.offset,
                            r = n + t.length - 1;
                        this._startPiece = n / this._torrent.pieceLength | 0, this._endPiece = r / this._torrent.pieceLength | 0, 0 === this.length && (this.done = !0, this.emit("done"))
                    }
                    t.exports = r;
                    var o = e("end-of-stream"),
                        i = e("events").EventEmitter,
                        s = e("./file-stream"),
                        a = e("inherits"),
                        c = e("path"),
                        u = e("render-media"),
                        f = e("readable-stream"),
                        d = e("stream-to-blob-url"),
                        h = e("stream-with-known-length-to-buffer");
                    a(r, i), r.prototype.select = function(e) {
                        0 !== this.length && this._torrent.select(this._startPiece, this._endPiece, e)
                    }, r.prototype.deselect = function() {
                        0 !== this.length && this._torrent.deselect(this._startPiece, this._endPiece, !1)
                    }, r.prototype.createReadStream = function(e) {
                        var t = this;
                        if (0 === this.length) {
                            var r = new f.PassThrough;
                            return n.nextTick(function() {
                                r.end()
                            }), r
                        }
                        var i = new s(t, e);
                        return t._torrent.select(i._startPiece, i._endPiece, !0, function() {
                            i._notify()
                        }), o(i, function() {
                            t._torrent.deselect(i._startPiece, i._endPiece, !0)
                        }), i
                    }, r.prototype.getBuffer = function(e) {
                        h(this.createReadStream(), this.length, e)
                    }, r.prototype.getBlobURL = function(e) {
                        if ("undefined" == typeof window) throw new Error("browser-only method");
                        var t = u.mime[c.extname(this.name).toLowerCase()];
                        d(this.createReadStream(), t, e)
                    }, r.prototype.appendTo = function(e, t) {
                        if ("undefined" == typeof window) throw new Error("browser-only method");
                        u.append(this, e, t)
                    }, r.prototype.renderTo = function(e, t) {
                        if ("undefined" == typeof window) throw new Error("browser-only method");
                        u.render(this, e, t)
                    }
                }).call(this, e("_process"))
            }, {
                "./file-stream": 2,
                _process: 33,
                "end-of-stream": 71,
                events: 29,
                inherits: 76,
                path: 32,
                "readable-stream": 106,
                "render-media": 109,
                "stream-to-blob-url": 138,
                "stream-with-known-length-to-buffer": 141
            }
        ],
        4: [
            function(e, t, n) {
                function r(e, t) {
                    function n(e) {
                        e.on("have", function(e) {
                            r.pieces[e] += 1
                        }), e.on("bitfield", function() {
                            r.recalculate()
                        }), e.on("close", function() {
                            for (var t = 0; t < r.numPieces; ++t) r.pieces[t] -= e.peerPieces.get(t)
                        })
                    }
                    var r = this;
                    r.pieces = [], r.swarm = e, r.numPieces = t, r.swarm.wires.forEach(n), r.swarm.on("wire", function(e) {
                        r.recalculate(), n(e)
                    }), r.recalculate()
                }
                t.exports = r, r.prototype.recalculate = function() {
                    for (var e = this, t = 0; t < e.numPieces; ++t) e.pieces[t] = 0;
                    e.swarm.wires.forEach(function(t) {
                        for (var n = 0; n < e.numPieces; ++n) e.pieces[n] += t.peerPieces.get(n)
                    })
                }, r.prototype.getRarestPiece = function(e) {
                    var t = this,
                        n = [],
                        r = 1 / 0;
                    e = e || function() {
                        return !0
                    };
                    for (var o = 0; o < t.numPieces; ++o)
                        if (e(o)) {
                            var i = t.pieces[o];
                            i === r ? n.push(o) : r > i && (n = [o], r = i)
                        }
                    return n.length > 0 ? n[Math.random() * n.length | 0] : -1
                }
            }, {}
        ],
        5: [
            function(e, t, n) {
                (function(n, r) {
                    function o(e, t, n) {
                        p.call(this), h.enabled || this.setMaxListeners(0), this.client = t, this._debugId = this.client.peerId.slice(32), this._debug("new torrent"), this.announce = n.announce, this.urlList = n.urlList, this.path = n.path, this._store = n.store || y, this._getAnnounceOpts = n.getAnnounceOpts, this.strategy = n.strategy || "sequential", this.maxWebConns = n.maxWebConns, this._rechokeNumSlots = n.uploads === !1 || 0 === n.uploads ? 0 : +n.uploads || 10, this._rechokeOptimisticWire = null, this._rechokeOptimisticTime = 0, this._rechokeIntervalId = null, this.ready = !1, this.destroyed = !1, this.metadata = null, this.store = null, this.numBlockedPeers = 0, this.files = null, this.done = !1, this._amInterested = !1, this.pieces = [], this._selections = [], this._critical = [], this._servers = [], null !== e && this._onTorrentId(e)
                    }

                    function i(e, t) {
                        return Math.ceil(2 + t * e.downloadSpeed() / B.BLOCK_LENGTH)
                    }

                    function s(e) {
                        return Math.random() * e | 0
                    }

                    function a() {}
                    t.exports = o;
                    var c = e("addr-to-ip-port"),
                        u = e("bitfield"),
                        f = e("chunk-store-stream/write"),
                        d = e("cpus"),
                        h = e("debug")("webtorrent:torrent"),
                        l = e("torrent-discovery"),
                        p = e("events").EventEmitter,
                        m = e("xtend"),
                        g = e("xtend/mutable"),
                        y = e("fs-chunk-store"),
                        _ = e("immediate-chunk-store"),
                        v = e("inherits"),
                        b = e("multistream"),
                        w = e("os"),
                        E = e("run-parallel"),
                        k = e("run-parallel-limit"),
                        x = e("parse-torrent"),
                        S = e("path"),
                        I = e("path-exists"),
                        B = e("torrent-piece"),
                        A = e("pump"),
                        C = e("random-iterate"),
                        L = e("re-emitter"),
                        T = e("simple-sha1"),
                        R = e("bittorrent-swarm"),
                        U = e("uniq"),
                        P = e("ut_metadata"),
                        O = e("ut_pex"),
                        M = e("./file"),
                        j = e("./rarity-map"),
                        D = e("./server"),
                        H = 131072,
                        N = 3e4,
                        q = 5e3,
                        z = 3 * B.BLOCK_LENGTH,
                        W = .5,
                        F = 1,
                        Y = 1e4,
                        V = 2,
                        $ = "function" == typeof I.sync ? S.join(I.sync("/tmp") ? "/tmp" : w.tmpDir(), "webtorrent") : "/tmp/webtorrent";
                    v(o, p), Object.defineProperty(o.prototype, "timeRemaining", {
                        get: function() {
                            return this.done ? 0 : 0 === this.downloadSpeed ? 1 / 0 : (this.length - this.downloaded) / this.downloadSpeed * 1e3
                        }
                    }), Object.defineProperty(o.prototype, "downloaded", {
                        get: function() {
                            if (!this.bitfield) return 0;
                            for (var e = 0, t = 0, n = this.pieces.length; n > t; ++t)
                                if (this.bitfield.get(t)) e += t === n - 1 ? this.lastPieceLength : this.pieceLength;
                                else {
                                    var r = this.pieces[t];
                                    e += r.length - r.missing
                                }
                            return e
                        }
                    }), Object.defineProperty(o.prototype, "received", {
                        get: function() {
                            return this.swarm ? this.swarm.downloaded : 0
                        }
                    }), Object.defineProperty(o.prototype, "uploaded", {
                        get: function() {
                            return this.swarm ? this.swarm.uploaded : 0
                        }
                    }), Object.defineProperty(o.prototype, "downloadSpeed", {
                        get: function() {
                            return this.swarm ? this.swarm.downloadSpeed() : 0
                        }
                    }), Object.defineProperty(o.prototype, "uploadSpeed", {
                        get: function() {
                            return this.swarm ? this.swarm.uploadSpeed() : 0
                        }
                    }), Object.defineProperty(o.prototype, "progress", {
                        get: function() {
                            return this.length ? this.downloaded / this.length : 0
                        }
                    }), Object.defineProperty(o.prototype, "ratio", {
                        get: function() {
                            return this.uploaded / (this.downloaded || 1)
                        }
                    }), Object.defineProperty(o.prototype, "numPeers", {
                        get: function() {
                            return this.swarm ? this.swarm.numPeers : 0
                        }
                    }), Object.defineProperty(o.prototype, "torrentFileBlobURL", {
                        get: function() {
                            if ("undefined" == typeof window) throw new Error("browser-only property");
                            return this.torrentFile ? URL.createObjectURL(new Blob([this.torrentFile], {
                                type: "application/x-bittorrent"
                            })) : null
                        }
                    }), o.prototype._onTorrentId = function(e) {
                        var t = this;
                        if (!t.destroyed) {
                            var r;
                            try {
                                r = x(e)
                            } catch (o) {}
                            r ? (t.infoHash = r.infoHash, n.nextTick(function() {
                                t.destroyed || t._onParsedTorrent(r)
                            })) : x.remote(e, function(e, n) {
                                return t.destroyed ? void 0 : e ? t._onError(e) : void t._onParsedTorrent(n)
                            })
                        }
                    }, o.prototype._onParsedTorrent = function(e) {
                        var t = this;
                        if (!t.destroyed) {
                            if (t._processParsedTorrent(e), !t.infoHash) return t._onError(new Error("Malformed torrent data: No info hash"));
                            t.path || (t.path = S.join($, t.infoHash)), t.swarm = new R(t.infoHash, t.client.peerId, {
                                handshake: {
                                    dht: t["private"] ? !1 : !! t.client.dht
                                },
                                maxConns: t.client.maxConns
                            }), t.swarm.on("error", t._onError.bind(t)), t.swarm.on("wire", t._onWire.bind(t)), t.swarm.on("download", function(e) {
                                t.client._downloadSpeed(e), t.client.emit("download", e), t.emit("download", e)
                            }), t.swarm.on("upload", function(e) {
                                t.client._uploadSpeed(e), t.client.emit("upload", e), t.emit("upload", e)
                            }), t.swarm.listen(t.client.torrentPort, t._onSwarmListening.bind(t)), t.emit("infoHash", t.infoHash)
                        }
                    }, o.prototype._processParsedTorrent = function(e) {
                        this.announce && (e.announce = e.announce.concat(this.announce)), this.client.tracker && r.WEBTORRENT_ANNOUNCE && !this["private"] && (e.announce = e.announce.concat(r.WEBTORRENT_ANNOUNCE)), this.urlList && (e.urlList = e.urlList.concat(this.urlList)), U(e.announce), U(e.urlList), g(this, e), this.magnetURI = x.toMagnetURI(e), this.torrentFile = x.toTorrentFile(e)
                    }, o.prototype._onSwarmListening = function() {
                        var e = this;
                        if (!e.destroyed) {
                            e.swarm.server && (e.client.torrentPort = e.swarm.address().port);
                            var t = {
                                rtcConfig: e.client._rtcConfig,
                                wrtc: e.client._wrtc,
                                getAnnounceOpts: function() {
                                    var t = {
                                        uploaded: e.uploaded,
                                        downloaded: e.downloaded,
                                        left: Math.max(e.length - e.downloaded, 0)
                                    };
                                    return e._getAnnounceOpts && (t = m(t, e._getAnnounceOpts())), t
                                }
                            };
                            e.discovery = new l({
                                announce: e.announce,
                                dht: !e["private"] && e.client.dht,
                                tracker: e.client.tracker && t,
                                peerId: e.client.peerId,
                                port: e.client.torrentPort
                            }), e.discovery.on("error", e._onError.bind(e)), e.discovery.on("peer", e.addPeer.bind(e)), L(e.discovery, e, ["trackerAnnounce", "dhtAnnounce", "warning"]), e.info ? e._onMetadata(e) : e.discovery.setTorrent(e.infoHash), e.emit("listening", e.client.torrentPort)
                        }
                    }, o.prototype._onMetadata = function(e) {
                        var t = this;
                        if (!t.metadata && !t.destroyed) {
                            t._debug("got metadata");
                            var n;
                            if (e && e.infoHash) n = e;
                            else try {
                                n = x(e)
                            } catch (r) {
                                return t._onError(r)
                            }
                            t._processParsedTorrent(n), t.metadata = t.torrentFile, t.discovery.setTorrent(t), t.urlList && t.urlList.forEach(t.addWebSeed.bind(t)), t.rarityMap = new j(t.swarm, t.pieces.length), t.store = new _(new t._store(t.pieceLength, {
                                files: t.files.map(function(e) {
                                    return {
                                        path: S.join(t.path, e.path),
                                        length: e.length,
                                        offset: e.offset
                                    }
                                }),
                                length: t.length
                            })), t.files = t.files.map(function(e) {
                                return new M(t, e)
                            }), t._hashes = t.pieces, t.pieces = t.pieces.map(function(e, n) {
                                var r = n === t.pieces.length - 1 ? t.lastPieceLength : t.pieceLength;
                                return new B(r)
                            }), t._reservations = t.pieces.map(function() {
                                return []
                            }), t.bitfield = new u(t.pieces.length), t.swarm.wires.forEach(function(e) {
                                e.ut_metadata && e.ut_metadata.setMetadata(t.metadata), t._onWireWithMetadata(e)
                            }), t._debug("verifying existing torrent data"), k(t.pieces.map(function(e, n) {
                                return function(e) {
                                    t.store.get(n, function(r, o) {
                                        return r ? e(null) : void T(o, function(r) {
                                            if (r === t._hashes[n]) {
                                                if (!t.pieces[n]) return;
                                                t._debug("piece verified %s", n), t.pieces[n] = null, t._reservations[n] = null, t.bitfield.set(n, !0)
                                            } else t._debug("piece invalid %s", n);
                                            e(null)
                                        })
                                    })
                                }
                            }), d().length, function(e) {
                                return e ? t._onError(e) : (t._debug("done verifying"), void t._onStore())
                            }), t.emit("metadata")
                        }
                    }, o.prototype._onStore = function() {
                        var e = this;
                        e.destroyed || (e._debug("on store"), e.select(0, e.pieces.length - 1, !1), e._rechokeIntervalId = setInterval(e._rechoke.bind(e), Y), e._rechokeIntervalId.unref && e._rechokeIntervalId.unref(), e.ready = !0, e.emit("ready"), e._checkDone())
                    }, o.prototype.destroy = function(e) {
                        var t = this;
                        if (!t.destroyed) {
                            t.destroyed = !0, t._debug("destroy"), t.client.remove(t), t._rechokeIntervalId && (clearInterval(t._rechokeIntervalId), t._rechokeIntervalId = null);
                            var n = [];
                            t._servers.forEach(function(e) {
                                n.push(function(t) {
                                    e.destroy(t)
                                })
                            }), t.swarm && n.push(function(e) {
                                t.swarm.destroy(e)
                            }), t.discovery && n.push(function(e) {
                                t.discovery.stop(e)
                            }), t.store && n.push(function(e) {
                                t.store.close(e)
                            }), E(n, e)
                        }
                    }, o.prototype.addPeer = function(e) {
                        function t() {
                            var t = n.swarm.addPeer(e);
                            t ? n.emit("peer", e) : n.emit("invalidPeer", e)
                        }
                        var n = this;
                        if (n.destroyed) throw new Error("torrent is destroyed");
                        if (n.client.blocked) {
                            var r;
                            if ("string" == typeof e) {
                                var o;
                                try {
                                    o = c(e)
                                } catch (i) {
                                    return n.emit("invalidPeer", e), !1
                                }
                                r = o[0]
                            } else "string" == typeof e.remoteAddress && (r = e.remoteAddress); if (r && n.client.blocked.contains(r)) return n.numBlockedPeers += 1, n.emit("blockedPeer", e), !1
                        }
                        return n.swarm ? t() : n.once("listening", t), !0
                    }, o.prototype.addWebSeed = function(e) {
                        if (this.destroyed) throw new Error("torrent is destroyed");
                        this._debug("add web seed %s", e), this.swarm.addWebSeed(e, this)
                    }, o.prototype.select = function(e, t, n, r) {
                        var o = this;
                        if (o.destroyed) throw new Error("torrent is destroyed");
                        if (e > t || 0 > e || t >= o.pieces.length) throw new Error("invalid selection ", e, ":", t);
                        n = Number(n) || 0, o._debug("select %s-%s (priority %s)", e, t, n), o._selections.push({
                            from: e,
                            to: t,
                            offset: 0,
                            priority: n,
                            notify: r || a
                        }), o._selections.sort(function(e, t) {
                            return t.priority - e.priority
                        }), o._updateSelections()
                    }, o.prototype.deselect = function(e, t, n) {
                        var r = this;
                        if (r.destroyed) throw new Error("torrent is destroyed");
                        n = Number(n) || 0, r._debug("deselect %s-%s (priority %s)", e, t, n);
                        for (var o = 0; o < r._selections.length; ++o) {
                            var i = r._selections[o];
                            if (i.from === e && i.to === t && i.priority === n) {
                                r._selections.splice(o--, 1);
                                break
                            }
                        }
                        r._updateSelections()
                    }, o.prototype.critical = function(e, t) {
                        var n = this;
                        if (n.destroyed) throw new Error("torrent is destroyed");
                        n._debug("critical %s-%s", e, t);
                        for (var r = e; t >= r; ++r) n._critical[r] = !0;
                        n._updateSelections()
                    }, o.prototype._onWire = function(e, t) {
                        var r = this;
                        if (r._debug("got wire %s (%s)", e._debugId, t || "Unknown"), t) {
                            var o = c(t);
                            e.remoteAddress = o[0], e.remotePort = o[1]
                        }
                        r.client.dht && r.client.dht.listening && e.on("port", function(n) {
                            if (!r.destroyed && !r.client.dht.destroyed) {
                                if (!e.remoteAddress) return r._debug("ignoring PORT from peer with no address");
                                if (0 === n || n > 65536) return r._debug("ignoring invalid PORT from peer");
                                r._debug("port: %s (from %s)", n, t), r.client.dht.addNode({
                                    host: e.remoteAddress,
                                    port: n
                                })
                            }
                        }), e.on("timeout", function() {
                            r._debug("wire timeout (%s)", t), e.destroy()
                        }), e.setTimeout(N, !0), e.setKeepAlive(!0), e.use(P(r.metadata)), e.ut_metadata.on("warning", function(e) {
                            r._debug("ut_metadata warning: %s", e.message)
                        }), r.metadata || (e.ut_metadata.on("metadata", function(e) {
                            r._debug("got metadata via ut_metadata"), r._onMetadata(e)
                        }), e.ut_metadata.fetch()), "function" != typeof O || r["private"] || (e.use(O()), e.ut_pex.on("peer", function(e) {
                            r._debug("ut_pex: got peer: %s (from %s)", e, t), r.addPeer(e)
                        }), e.ut_pex.on("dropped", function(e) {
                            var n = r.swarm._peers[e];
                            n && !n.connected && (r._debug("ut_pex: dropped peer: %s (from %s)", e, t), r.swarm.removePeer(e))
                        })), r.emit("wire", e, t), r.metadata && n.nextTick(function() {
                            r._onWireWithMetadata(e)
                        })
                    }, o.prototype._onWireWithMetadata = function(e) {
                        function t() {
                            r.destroyed || e.destroyed || (r.swarm.numQueued > 2 * (r.swarm.numConns - r.swarm.numPeers) && e.amInterested ? e.destroy() : (o = setTimeout(t, q), o.unref && o.unref()))
                        }

                        function n() {
                            if (e.peerPieces.length === r.pieces.length) {
                                for (; i < r.pieces.length; ++i)
                                    if (!e.peerPieces.get(i)) return;
                                e.isSeeder = !0, e.choke()
                            }
                        }
                        var r = this,
                            o = null,
                            i = 0;
                        e.on("bitfield", function() {
                            n(), r._update()
                        }), e.on("have", function() {
                            n(), r._update()
                        }), e.once("interested", function() {
                            e.unchoke()
                        }), e.on("close", function() {
                            clearTimeout(o)
                        }), e.on("choke", function() {
                            clearTimeout(o), o = setTimeout(t, q), o.unref && o.unref()
                        }), e.on("unchoke", function() {
                            clearTimeout(o), r._update()
                        }), e.on("request", function(t, n, o, i) {
                            return o > H ? e.destroy() : void(r.pieces[t] || r.store.get(t, {
                                offset: n,
                                length: o
                            }, i))
                        }), e.bitfield(r.bitfield), e.interested(), e.peerExtensions.dht && r.client.dht && r.client.dht.listening && e.port(r.client.dht.address().port), o = setTimeout(t, q), o.unref && o.unref(), e.isSeeder = !1, n()
                    }, o.prototype._updateSelections = function() {
                        var e = this;
                        if (e.swarm && !e.destroyed) {
                            if (!e.metadata) return e.once("metadata", e._updateSelections.bind(e));
                            n.nextTick(e._gcSelections.bind(e)), e._updateInterest(), e._update()
                        }
                    }, o.prototype._gcSelections = function() {
                        for (var e = this, t = 0; t < e._selections.length; t++) {
                            for (var n = e._selections[t], r = n.offset; e.bitfield.get(n.from + n.offset) && n.from + n.offset < n.to;) n.offset++;
                            r !== n.offset && n.notify(), n.to === n.from + n.offset && e.bitfield.get(n.from + n.offset) && (e._selections.splice(t--, 1), n.notify(), e._updateInterest())
                        }
                        e._selections.length || e.emit("idle")
                    }, o.prototype._updateInterest = function() {
                        var e = this,
                            t = e._amInterested;
                        e._amInterested = !! e._selections.length, e.swarm.wires.forEach(function(t) {
                            e._amInterested ? t.interested() : t.uninterested()
                        }), t !== e._amInterested && (e._amInterested ? e.emit("interested") : e.emit("uninterested"))
                    }, o.prototype._update = function() {
                        var e = this;
                        if (!e.destroyed)
                            for (var t, n = C(e.swarm.wires); t = n();) e._updateWire(t)
                    }, o.prototype._updateWire = function(e) {
                        function t(t, n, r, o) {
                            return function(i) {
                                return i >= t && n >= i && !(i in r) && e.peerPieces.get(i) && (!o || o(i))
                            }
                        }

                        function n() {
                            if (!e.requests.length)
                                for (var n = a._selections.length; n--;) {
                                    var r, o = a._selections[n];
                                    if ("rarest" === a.strategy)
                                        for (var i = o.from + o.offset, s = o.to, c = s - i + 1, u = {}, f = 0, d = t(i, s, u); c > f && (r = a.rarityMap.getRarestPiece(d), !(0 > r));) {
                                            if (a._request(e, r, !1)) return;
                                            u[r] = !0, f += 1
                                        } else
                                            for (r = o.to; r >= o.from + o.offset; --r)
                                                if (e.peerPieces.get(r) && a._request(e, r, !1)) return
                                }
                        }

                        function r() {
                            var t = e.downloadSpeed() || 1;
                            if (t > z) return function() {
                                return !0
                            };
                            var n = Math.max(1, e.requests.length) * B.BLOCK_LENGTH / t,
                                r = 10,
                                o = 0;
                            return function(e) {
                                if (!r || a.bitfield.get(e)) return !0;
                                for (var i = a.pieces[e].missing; o < a.swarm.wires.length; o++) {
                                    var s = a.swarm.wires[o],
                                        c = s.downloadSpeed();
                                    if (!(z > c) && !(t >= c) && s.peerPieces.get(e) && !((i -= c * n) > 0)) return r--, !1
                                }
                                return !0
                            }
                        }

                        function o(e) {
                            for (var t = e, n = e; n < a._selections.length && a._selections[n].priority; n++) t = n;
                            var r = a._selections[e];
                            a._selections[e] = a._selections[t], a._selections[t] = r
                        }

                        function s(n) {
                            if (e.requests.length >= u) return !0;
                            for (var i = r(), s = 0; s < a._selections.length; s++) {
                                var c, f = a._selections[s];
                                if ("rarest" === a.strategy)
                                    for (var d = f.from + f.offset, h = f.to, l = h - d + 1, p = {}, m = 0, g = t(d, h, p, i); l > m && (c = a.rarityMap.getRarestPiece(g), !(0 > c));) {
                                        for (; a._request(e, c, a._critical[c] || n););
                                        if (!(e.requests.length < u)) return f.priority && o(s), !0;
                                        p[c] = !0, m++
                                    } else
                                        for (c = f.from + f.offset; c <= f.to; c++)
                                            if (e.peerPieces.get(c) && i(c)) {
                                                for (; a._request(e, c, a._critical[c] || n););
                                                if (!(e.requests.length < u)) return f.priority && o(s), !0
                                            }
                            }
                            return !1
                        }
                        var a = this;
                        if (!e.peerChoking) {
                            if (!e.downloaded) return n();
                            var c = i(e, W);
                            if (!(e.requests.length >= c)) {
                                var u = i(e, F);
                                s(!1) || s(!0)
                            }
                        }
                    }, o.prototype._rechoke = function() {
                        function e(e, t) {
                            return e.downloadSpeed !== t.downloadSpeed ? t.downloadSpeed - e.downloadSpeed : e.uploadSpeed !== t.uploadSpeed ? t.uploadSpeed - e.uploadSpeed : e.wire.amChoking !== t.wire.amChoking ? e.wire.amChoking ? 1 : -1 : e.salt - t.salt
                        }
                        var t = this;
                        t._rechokeOptimisticTime > 0 ? t._rechokeOptimisticTime -= 1 : t._rechokeOptimisticWire = null;
                        var n = [];
                        t.swarm.wires.forEach(function(e) {
                            e.isSeeder || e === t._rechokeOptimisticWire || n.push({
                                wire: e,
                                downloadSpeed: e.downloadSpeed(),
                                uploadSpeed: e.uploadSpeed(),
                                salt: Math.random(),
                                isChoked: !0
                            })
                        }), n.sort(e);
                        for (var r = 0, o = 0; o < n.length && r < t._rechokeNumSlots; ++o) n[o].isChoked = !1, n[o].wire.peerInterested && (r += 1);
                        if (!t._rechokeOptimisticWire && o < n.length && t._rechokeNumSlots) {
                            var i = n.slice(o).filter(function(e) {
                                return e.wire.peerInterested
                            }),
                                a = i[s(i.length)];
                            a && (a.isChoked = !1, t._rechokeOptimisticWire = a.wire, t._rechokeOptimisticTime = V)
                        }
                        n.forEach(function(e) {
                            e.wire.amChoking !== e.isChoked && (e.isChoked ? e.wire.choke() : e.wire.unchoke())
                        })
                    }, o.prototype._hotswap = function(e, t) {
                        var n = this,
                            r = e.downloadSpeed();
                        if (r < B.BLOCK_LENGTH) return !1;
                        if (!n._reservations[t]) return !1;
                        var o = n._reservations[t];
                        if (!o) return !1;
                        var i, s, a = 1 / 0;
                        for (s = 0; s < o.length; s++) {
                            var c = o[s];
                            if (c && c !== e) {
                                var u = c.downloadSpeed();
                                u >= z || 2 * u > r || u > a || (i = c, a = u)
                            }
                        }
                        if (!i) return !1;
                        for (s = 0; s < o.length; s++) o[s] === i && (o[s] = null);
                        for (s = 0; s < i.requests.length; s++) {
                            var f = i.requests[s];
                            f.piece === t && n.pieces[t].cancel(f.offset / B.BLOCK_SIZE | 0)
                        }
                        return n.emit("hotswap", i, e, t), !0
                    }, o.prototype._request = function(e, t, r) {
                        function o() {
                            n.nextTick(function() {
                                s._update()
                            })
                        }
                        var s = this,
                            a = e.requests.length,
                            c = "webSeed" === e.type;
                        if (s.bitfield.get(t)) return !1;
                        var u = i(e, F);
                        if (c && (u > 2 && (u -= 2), s.maxWebConns && (u = Math.min(u, s.maxWebConns))), a >= u) return !1;
                        var f = s.pieces[t],
                            d = c ? f.reserveRemaining() : f.reserve();
                        if (-1 === d && r && s._hotswap(e, t) && (d = c ? f.reserveRemaining() : f.reserve()), -1 === d) return !1;
                        var h = s._reservations[t];
                        h || (h = s._reservations[t] = []);
                        var l = h.indexOf(null); - 1 === l && (l = h.length), h[l] = e;
                        var p = f.chunkOffset(d),
                            m = c ? f.chunkLengthRemaining(d) : f.chunkLength(d);
                        return e.request(t, p, m, function g(n, r) {
                            if (!s.ready) return s.once("ready", function() {
                                g(n, r)
                            });
                            if (h[l] === e && (h[l] = null), f !== s.pieces[t]) return o();
                            if (n) return s._debug("error getting piece %s (offset: %s length: %s) from %s: %s", t, p, m, e.remoteAddress + ":" + e.remotePort, n.message), c ? f.cancelRemaining(d) : f.cancel(d), void o();
                            if (s._debug("got piece %s (offset: %s length: %s) from %s", t, p, m, e.remoteAddress + ":" + e.remotePort), !f.set(d, r, e)) return o();
                            var i = f.flush();
                            T(i, function(e) {
                                if (e === s._hashes[t]) {
                                    if (!s.pieces[t]) return;
                                    s._debug("piece verified %s", t), s.pieces[t] = null, s._reservations[t] = null, s.bitfield.set(t, !0), s.store.put(t, i), s.swarm.wires.forEach(function(e) {
                                        e.have(t)
                                    }), s._checkDone()
                                } else s.pieces[t] = new B(f.length), s.emit("warning", new Error("Piece " + t + " failed verification"));
                                o()
                            })
                        }), !0
                    }, o.prototype._checkDone = function() {
                        var e = this;
                        if (!e.destroyed) {
                            e.files.forEach(function(t) {
                                if (!t.done) {
                                    for (var n = t._startPiece; n <= t._endPiece; ++n)
                                        if (!e.bitfield.get(n)) return;
                                    t.done = !0, t.emit("done"), e._debug("file done: " + t.name)
                                }
                            });
                            for (var t = !0, n = 0; n < e._selections.length; n++) {
                                for (var r = e._selections[n], o = r.from; o <= r.to; o++)
                                    if (!e.bitfield.get(o)) {
                                        t = !1;
                                        break
                                    }
                                if (!t) break
                            }!e.done && t && (e.done = !0, e.emit("done"), e._debug("torrent done: " + e.infoHash), e.discovery.tracker && e.discovery.tracker.complete()), e._gcSelections()
                        }
                    }, o.prototype.load = function(e, t) {
                        var n = this;
                        if (n.destroyed) throw new Error("torrent is destroyed");
                        if (!n.ready) return n.once("ready", function() {
                            n.load(e, t)
                        });
                        Array.isArray(e) || (e = [e]), t || (t = a);
                        var r = new b(e),
                            o = new f(n.store, n.pieceLength);
                        A(r, o, function(e) {
                            return e ? t(e) : (n.pieces.forEach(function(e, t) {
                                n.pieces[t] = null, n._reservations[t] = null, n.bitfield.set(t, !0)
                            }), n._checkDone(), void t(null))
                        })
                    }, o.prototype.createServer = function(e) {
                        if ("function" != typeof D) throw new Error("node.js-only method");
                        if (this.destroyed) throw new Error("torrent is destroyed");
                        var t = new D(this, e);
                        return this._servers.push(t), t
                    }, o.prototype.pause = function() {
                        this.destroyed || this.swarm.pause()
                    }, o.prototype.resume = function() {
                        this.destroyed || this.swarm.resume()
                    }, o.prototype._onError = function(e) {
                        var t = this;
                        t._debug("torrent error: %s", e.message || e), t.destroy(), t.emit("error", e)
                    }, o.prototype._debug = function() {
                        var e = [].slice.call(arguments);
                        e[0] = "[" + this._debugId + "] " + e[0], h.apply(null, e)
                    }
                }).call(this, e("_process"), "undefined" != typeof global ? global : "undefined" != typeof self ? self : "undefined" != typeof window ? window : {})
            }, {
                "./file": 3,
                "./rarity-map": 4,
                "./server": 24,
                _process: 33,
                "addr-to-ip-port": 6,
                bitfield: 7,
                "bittorrent-swarm": 8,
                "chunk-store-stream/write": 49,
                cpus: 50,
                debug: 68,
                events: 29,
                "fs-chunk-store": 77,
                "immediate-chunk-store": 75,
                inherits: 76,
                multistream: 78,
                os: 24,
                "parse-torrent": 79,
                path: 32,
                "path-exists": 24,
                pump: 89,
                "random-iterate": 92,
                "re-emitter": 93,
                "run-parallel": 127,
                "run-parallel-limit": 126,
                "simple-sha1": 135,
                "torrent-discovery": 144,
                "torrent-piece": 145,
                uniq: 146,
                ut_metadata: 147,
                ut_pex: 24,
                xtend: 152,
                "xtend/mutable": 153
            }
        ],
        6: [
            function(e, t, n) {
                var r = /^\[?([^\]]+)\]?:(\d+)$/,
                    o = {}, i = 0;
                t.exports = function(e) {
                    if (1e5 === i && t.exports.reset(), !o[e]) {
                        var n = r.exec(e);
                        if (!n) throw new Error("invalid addr: " + e);
                        o[e] = [n[1], Number(n[2])], i += 1
                    }
                    return o[e]
                }, t.exports.reset = function() {
                    o = {}, i = 0
                }
            }, {}
        ],
        7: [
            function(e, t, n) {
                (function(e) {
                    function n(e, t) {
                        return this instanceof n ? (0 === arguments.length && (e = 0), this.grow = t && (isFinite(t.grow) && r(t.grow) || t.grow) || 0, "number" != typeof e && void 0 !== e || (e = new o(r(e)), e.fill && !e._isBuffer && e.fill(0)), void(this.buffer = e)) : new n(e, t)
                    }

                    function r(e) {
                        var t = e >> 3;
                        return e % 8 !== 0 && t++, t
                    }
                    var o = "undefined" != typeof e ? e : "undefined" != typeof Int8Array ? Int8Array : function(e) {
                            for (var t = new Array(e), n = 0; e > n; n++) t[n] = 0
                        };
                    n.prototype.get = function(e) {
                        var t = e >> 3;
                        return t < this.buffer.length && !! (this.buffer[t] & 128 >> e % 8)
                    }, n.prototype.set = function(e, t) {
                        var n = e >> 3;
                        t || 1 === arguments.length ? (this.buffer.length < n + 1 && this._grow(Math.max(n + 1, Math.min(2 * this.buffer.length, this.grow))), this.buffer[n] |= 128 >> e % 8) : n < this.buffer.length && (this.buffer[n] &= ~(128 >> e % 8))
                    }, n.prototype._grow = function(e) {
                        if (this.buffer.length < e && e <= this.grow) {
                            var t = new o(e);
                            if (t.fill && t.fill(0), this.buffer.copy) this.buffer.copy(t, 0);
                            else
                                for (var n = 0; n < this.buffer.length; n++) t[n] = this.buffer[n];
                            this.buffer = t
                        }
                    }, "undefined" != typeof t && (t.exports = n)
                }).call(this, e("buffer").Buffer)
            }, {
                buffer: 25
            }
        ],
        8: [
            function(e, t, n) {
                (function(n, r) {
                    function o(e, t, n) {
                        var i = this;
                        return i instanceof o ? (a.call(i), i.infoHash = "string" == typeof e ? e : e.toString("hex"), i.infoHashBuffer = new r(i.infoHash, "hex"), i.peerId = "string" == typeof t ? t : t.toString("hex"), i.peerIdBuffer = new r(i.peerId, "hex"), n || (n = {}), s("new swarm (i %s p %s)", i.infoHash, i.peerId), i.handshakeOpts = n.handshake, i.maxConns = Number(n.maxConns) || l, i.destroyed = !1, i.listening = !1, i.paused = !1, i.server = null, i.wires = [], i._queue = [], i._peers = {}, i._peersLength = 0, i._port = 0, i.downloaded = 0, i.uploaded = 0, i.downloadSpeed = f(), void(i.uploadSpeed = f())) : new o(e, t, n)
                    }
                    t.exports = o;
                    var i = e("addr-to-ip-port"),
                        s = e("debug")("bittorrent-swarm"),
                        a = e("events").EventEmitter,
                        c = e("inherits"),
                        u = e("net"),
                        f = e("speedometer"),
                        d = e("./lib/peer"),
                        h = e("./lib/tcp-pool"),
                        l = 55,
                        p = [1e3, 5e3, 15e3];
                    c(o, a), Object.defineProperty(o.prototype, "ratio", {
                        get: function() {
                            var e = this;
                            return e.uploaded / e.downloaded || 0
                        }
                    }), Object.defineProperty(o.prototype, "numQueued", {
                        get: function() {
                            var e = this;
                            return e._queue.length + (e._peersLength - e.numConns)
                        }
                    }), Object.defineProperty(o.prototype, "numConns", {
                        get: function() {
                            var e = this,
                                t = 0;
                            for (var n in e._peers) {
                                var r = e._peers[n];
                                r && r.connected && (t += 1)
                            }
                            return t
                        }
                    }), Object.defineProperty(o.prototype, "numPeers", {
                        get: function() {
                            var e = this;
                            return e.wires.length
                        }
                    }), o.prototype.addPeer = function(e) {
                        var t = this,
                            n = t._addPeer(e);
                        return !!n
                    }, o.prototype._addPeer = function(e) {
                        var t = this;
                        if (t.destroyed) return e && e.destroy && e.destroy(new Error("swarm already destroyed")), null;
                        if ("string" == typeof e && !t._validAddr(e)) return s("ignoring invalid peer %s (from swarm.addPeer)", e), null;
                        var n = e && e.id || e;
                        if (t._peers[n]) return null;
                        s("addPeer %s", n);
                        var r;
                        if ("string" == typeof e) r = d.createTCPOutgoingPeer(e, t);
                        else {
                            if (t.paused) return e.destroy(new Error("swarm paused")), null;
                            r = d.createWebRTCPeer(e, t)
                        }
                        return t._peers[r.id] = r, t._peersLength += 1, "string" == typeof e && (t._queue.push(r), t._drain()), r
                    }, o.prototype.addWebSeed = function(e, t) {
                        var n = this;
                        if (!n.destroyed) {
                            if (!/^https?:\/\/.+/.test(e)) return void s("ignoring invalid web seed %s (from swarm.addWebSeed)", e);
                            if (!n._peers[e]) {
                                s("addWebSeed %s", e);
                                var r = d.createWebSeedPeer(e, t, n);
                                n._peers[r.id] = r, n._peersLength += 1
                            }
                        }
                    }, o.prototype._addIncomingPeer = function(e) {
                        var t = this;
                        return t.destroyed ? e.destroy(new Error("swarm already destroyed")) : t.paused ? e.destroy(new Error("swarm paused")) : t._validAddr(e.addr) ? (s("_addIncomingPeer %s", e.id), t._peers[e.id] = e, void(t._peersLength += 1)) : e.destroy(new Error("invalid addr " + e.addr + " (from incoming)"))
                    }, o.prototype.removePeer = function(e) {
                        var t = this,
                            n = t._peers[e];
                        n && (s("removePeer %s", e), t._peers[e] = null, t._peersLength -= 1, n.destroy(), t._drain())
                    }, o.prototype.pause = function() {
                        var e = this;
                        e.destroyed || (s("pause"), e.paused = !0)
                    }, o.prototype.resume = function() {
                        var e = this;
                        e.destroyed || (s("resume"), e.paused = !1, e._drain())
                    }, o.prototype.listen = function(e, t, r) {
                        var o = this;
                        if ("function" == typeof t && (r = t, t = void 0), o.listening) throw new Error("swarm already listening");
                        if (r && o.once("listening", r), "function" == typeof h) {
                            o._port = e || h.getDefaultListenPort(o.infoHash), o._hostname = t, s("listen %s", e);
                            var i = h.addSwarm(o);
                            o.server = i.server
                        } else n.nextTick(function() {
                            o._onListening(0)
                        })
                    }, o.prototype._onListening = function(e) {
                        var t = this;
                        t._port = e, t.listening = !0, t.emit("listening")
                    }, o.prototype.address = function() {
                        var e = this;
                        return e.listening ? e.server ? e.server.address() : {
                            port: 0,
                            family: "IPv4",
                            address: "127.0.0.1"
                        } : null
                    }, o.prototype.destroy = function(e) {
                        var t = this;
                        if (!t.destroyed) {
                            t.destroyed = !0, t.listening = !1, t.paused = !1, e && t.once("close", e), s("destroy");
                            for (var r in t._peers) t.removePeer(r);
                            "function" == typeof h ? h.removeSwarm(t, function() {
                                t.emit("close")
                            }) : n.nextTick(function() {
                                t.emit("close")
                            })
                        }
                    }, o.prototype._drain = function() {
                        var e = this;
                        if (s("_drain numConns %s maxConns %s", e.numConns, e.maxConns), !("function" != typeof u.connect || e.destroyed || e.paused || e.numConns >= e.maxConns)) {
                            s("drain (%s queued, %s/%s peers)", e.numQueued, e.numPeers, e.maxConns);
                            var t = e._queue.shift();
                            if (t) {
                                s("tcp connect attempt to %s", t.addr);
                                var n = i(t.addr),
                                    r = {
                                        host: n[0],
                                        port: n[1]
                                    };
                                e._hostname && (r.localAddress = e._hostname);
                                var o = t.conn = u.connect(r);
                                o.once("connect", function() {
                                    t.onConnect()
                                }), o.once("error", function(e) {
                                    t.destroy(e)
                                }), t.setConnectTimeout(), o.on("close", function() {
                                    if (!e.destroyed) {
                                        if (t.retries >= p.length) return void s("conn %s closed: will not re-add (max %s attempts)", t.addr, p.length);
                                        var n = p[t.retries];
                                        s("conn %s closed: will re-add to queue in %sms (attempt %s)", t.addr, n, t.retries + 1);
                                        var r = setTimeout(function() {
                                            var n = e._addPeer(t.addr);
                                            n && (n.retries = t.retries + 1)
                                        }, n);
                                        r.unref && r.unref()
                                    }
                                })
                            }
                        }
                    }, o.prototype._onError = function(e) {
                        var t = this;
                        t.emit("error", e), t.destroy()
                    }, o.prototype._validAddr = function(e) {
                        var t, n = this;
                        try {
                            t = i(e)
                        } catch (r) {
                            return !1
                        }
                        var o = t[0],
                            s = t[1];
                        return s > 0 && 65535 > s && !("127.0.0.1" === o && s === n._port)
                    }
                }).call(this, e("_process"), e("buffer").Buffer)
            }, {
                "./lib/peer": 9,
                "./lib/tcp-pool": 24,
                _process: 33,
                "addr-to-ip-port": 24,
                buffer: 25,
                debug: 68,
                events: 29,
                inherits: 76,
                net: 24,
                speedometer: 137
            }
        ],
        9: [
            function(e, t, n) {
                function r(e, t) {
                    var n = this;
                    n.id = e, n.type = t, i("new Peer %s", e), n.addr = null, n.conn = null, n.swarm = null, n.wire = null, n.connected = !1, n.destroyed = !1, n.timeout = null, n.retries = 0, n.sentHandshake = !1
                }

                function o() {}
                var i = e("debug")("bittorrent-swarm:peer"),
                    s = e("./webconn"),
                    a = e("bittorrent-protocol"),
                    c = 25e3,
                    u = 25e3;
                n.createWebRTCPeer = function(e, t) {
                    var n = new r(e.id, "webrtc");
                    return n.conn = e, n.swarm = t, n.conn.connected ? n.onConnect() : (n.conn.once("connect", function() {
                        n.onConnect()
                    }), n.conn.once("error", function(e) {
                        n.destroy(e)
                    }), n.setConnectTimeout()), n
                }, n.createTCPIncomingPeer = function(e) {
                    var t = e.remoteAddress + ":" + e.remotePort,
                        n = new r(t, "tcpIncoming");
                    return n.conn = e, n.addr = t, n.onConnect(), n
                }, n.createTCPOutgoingPeer = function(e, t) {
                    var n = new r(e, "tcpOutgoing");
                    return n.addr = e, n.swarm = t, n
                }, n.createWebSeedPeer = function(e, t, n) {
                    var o = new r(e, "webSeed");
                    return o.swarm = n, o.conn = new s(e, t), o.onConnect(), o
                }, r.prototype.onConnect = function() {
                    var e = this;
                    if (!e.destroyed) {
                        e.connected = !0, i("Peer %s connected", e.id), clearTimeout(e.connectTimeout);
                        var t = e.conn;
                        t.once("end", function() {
                            e.destroy()
                        }), t.once("close", function() {
                            e.destroy()
                        }), t.once("finish", function() {
                            e.destroy()
                        }), t.once("error", function(t) {
                            e.destroy(t)
                        });
                        var n = e.wire = new a;
                        n.type = e.type, n.once("end", function() {
                            e.destroy()
                        }), n.once("close", function() {
                            e.destroy()
                        }), n.once("finish", function() {
                            e.destroy()
                        }), n.once("error", function(t) {
                            e.destroy(t)
                        }), n.once("handshake", function(t, n) {
                            e.onHandshake(t, n)
                        }), e.setHandshakeTimeout(), t.pipe(n).pipe(t), e.swarm && !e.sentHandshake && e.handshake()
                    }
                }, r.prototype.onHandshake = function(e, t) {
                    var n = this;
                    if (n.swarm) {
                        if (n.swarm.destroyed) return n.destroy(new Error("swarm already destroyed"));
                        if (e !== n.swarm.infoHash) return n.destroy(new Error("unexpected handshake info hash for this swarm"));
                        if (t === n.swarm.peerId) return n.destroy(new Error("refusing to handshake with self"));
                        i("Peer %s got handshake %s", n.id, e),
                        clearTimeout(n.handshakeTimeout), n.retries = 0, n.wire.on("download", function(e) {
                            n.destroyed || (n.swarm.downloaded += e, n.swarm.downloadSpeed(e), n.swarm.emit("download", e))
                        }), n.wire.on("upload", function(e) {
                            n.destroyed || (n.swarm.uploaded += e, n.swarm.uploadSpeed(e), n.swarm.emit("upload", e))
                        }), n.swarm.wires.push(n.wire);
                        var r = n.addr;
                        !r && n.conn.remoteAddress && (r = n.conn.remoteAddress + ":" + n.conn.remotePort), n.swarm.emit("wire", n.wire, r), n.swarm && !n.swarm.destroyed && (n.sentHandshake || n.handshake())
                    }
                }, r.prototype.handshake = function() {
                    var e = this;
                    e.wire.handshake(e.swarm.infoHash, e.swarm.peerId, e.swarm.handshakeOpts), e.sentHandshake = !0
                }, r.prototype.setConnectTimeout = function() {
                    var e = this;
                    clearTimeout(e.connectTimeout), e.connectTimeout = setTimeout(function() {
                        e.destroy(new Error("connect timeout"))
                    }, c), e.connectTimeout.unref && e.connectTimeout.unref()
                }, r.prototype.setHandshakeTimeout = function() {
                    var e = this;
                    clearTimeout(e.handshakeTimeout), e.handshakeTimeout = setTimeout(function() {
                        e.destroy(new Error("handshake timeout"))
                    }, u), e.handshakeTimeout.unref && e.handshakeTimeout.unref()
                }, r.prototype.destroy = function(e) {
                    var t = this;
                    if (!t.destroyed) {
                        t.destroyed = !0, t.connected = !1, i("destroy %s (error: %s)", t.id, e && (e.message || e)), clearTimeout(t.connectTimeout), clearTimeout(t.handshakeTimeout);
                        var n = t.swarm,
                            r = t.conn,
                            s = t.wire;
                        if (t.conn = null, t.swarm = null, t.wire = null, n && s) {
                            var a = n.wires.indexOf(s);
                            a >= 0 && n.wires.splice(a, 1)
                        }
                        r && (r.on("error", o), r.destroy()), s && s.destroy(), n && n.removePeer(t.id)
                    }
                }
            }, {
                "./webconn": 10,
                "bittorrent-protocol": 11,
                debug: 68
            }
        ],
        10: [
            function(e, t, n) {
                function r(e, t) {
                    var n = this;
                    u.call(this), n.url = e, n.webPeerId = c.sync(e), n.parsedTorrent = t, n.setKeepAlive(!0), n.on("handshake", function(e, t) {
                        n.handshake(e, n.webPeerId);
                        for (var r = n.parsedTorrent.pieces.length, i = new o(r), s = 0; r >= s; s++) i.set(s, !0);
                        n.bitfield(i)
                    }), n.on("choke", function() {
                        i("choke")
                    }), n.on("unchoke", function() {
                        i("unchoke")
                    }), n.once("interested", function() {
                        i("interested"), n.unchoke()
                    }), n.on("uninterested", function() {
                        i("uninterested")
                    }), n.on("bitfield", function() {
                        i("bitfield")
                    }), n.on("request", function(e, t, r, o) {
                        i("request pieceIndex=%d offset=%d length=%d", e, t, r), n.httpRequest(e, t, r, o)
                    })
                }
                t.exports = r;
                var o = e("bitfield"),
                    i = e("debug")("bittorrent-swarm:webconn"),
                    s = e("simple-get"),
                    a = e("inherits"),
                    c = e("simple-sha1"),
                    u = e("bittorrent-protocol");
                a(r, u), r.prototype.httpRequest = function(e, t, n, r) {
                    var o = this,
                        a = e * o.parsedTorrent.pieceLength,
                        c = a + t,
                        u = c + n - 1;
                    i("Requesting pieceIndex=%d offset=%d length=%d start=%d end=%d", e, t, n, c, u);
                    var f = {
                        url: o.url,
                        method: "GET",
                        headers: {
                            "user-agent": "WebTorrent (http://webtorrent.io)",
                            range: "bytes=" + c + "-" + u
                        }
                    };
                    s.concat(f, function(e, t, n) {
                        return e ? r(e) : t.statusCode < 200 || t.statusCode >= 300 ? r(new Error("Unexpected HTTP status code " + t.statusCode)) : (i("Got data of length %d", n.length), void r(null, n))
                    })
                }
            }, {
                bitfield: 7,
                "bittorrent-protocol": 11,
                debug: 68,
                inherits: 76,
                "simple-get": 128,
                "simple-sha1": 135
            }
        ],
        11: [
            function(e, t, n) {
                (function(n) {
                    function r(e, t, n, r) {
                        this.piece = e, this.offset = t, this.length = n, this.callback = r
                    }

                    function o() {
                        return this instanceof o ? (l.Duplex.call(this), this._debugId = f(32), this._debug("new wire"), this.peerId = null, this.peerIdBuffer = null, this.amChoking = !0, this.amInterested = !1, this.peerChoking = !0, this.peerInterested = !1, this.peerPieces = new a(0, {
                            grow: p
                        }), this.peerExtensions = {}, this.requests = [], this.peerRequests = [], this.extendedMapping = {}, this.peerExtendedMapping = {}, this.extendedHandshake = {}, this.peerExtendedHandshake = {}, this._ext = {}, this._nextExt = 1, this.uploaded = 0, this.downloaded = 0, this.uploadSpeed = h(), this.downloadSpeed = h(), this._keepAliveInterval = null, this._timeout = null, this._timeoutMs = 0, this.destroyed = !1, this._finished = !1, this._parserSize = 0, this._parser = null, this._buffer = [], this._bufferSize = 0, this.on("finish", this._onFinish), void this._parseHandshake()) : new o
                    }

                    function i(e, t, n, r) {
                        for (var o = 0; o < e.length; o++) {
                            var i = e[o];
                            if (i.piece === t && i.offset === n && i.length === r) return 0 === o ? e.shift() : e.splice(o, 1), i
                        }
                        return null
                    }
                    t.exports = o;
                    var s = e("bencode"),
                        a = e("bitfield"),
                        c = e("debug")("bittorrent-protocol"),
                        u = e("xtend"),
                        f = e("hat"),
                        d = e("inherits"),
                        h = e("speedometer"),
                        l = e("readable-stream"),
                        p = 4e5,
                        m = new n("BitTorrent protocol"),
                        g = new n([0, 0, 0, 0]),
                        y = new n([0, 0, 0, 1, 0]),
                        _ = new n([0, 0, 0, 1, 1]),
                        v = new n([0, 0, 0, 1, 2]),
                        b = new n([0, 0, 0, 1, 3]),
                        w = [0, 0, 0, 0, 0, 0, 0, 0],
                        E = [0, 0, 0, 3, 9, 0, 0];
                    d(o, l.Duplex), o.prototype.setKeepAlive = function(e) {
                        this._debug("setKeepAlive %s", e), clearInterval(this._keepAliveInterval), e !== !1 && (this._keepAliveInterval = setInterval(this.keepAlive.bind(this), 6e4))
                    }, o.prototype.setTimeout = function(e, t) {
                        this._debug("setTimeout ms=%d unref=%s", e, t), this._clearTimeout(), this._timeoutMs = e, this._timeoutUnref = !! t, this._updateTimeout()
                    }, o.prototype.destroy = function() {
                        this.destroyed || (this.destroyed = !0, this._debug("destroy"), this.emit("close"), this.end())
                    }, o.prototype.end = function() {
                        this._debug("end"), this._onUninterested(), this._onChoke(), l.Duplex.prototype.end.apply(this, arguments)
                    }, o.prototype.use = function(e) {
                        function t() {}
                        var n = e.prototype.name;
                        if (!n) throw new Error('Extension class requires a "name" property on the prototype');
                        this._debug("use extension.name=%s", n);
                        var r = this._nextExt,
                            o = new e(this);
                        "function" != typeof o.onHandshake && (o.onHandshake = t), "function" != typeof o.onExtendedHandshake && (o.onExtendedHandshake = t), "function" != typeof o.onMessage && (o.onMessage = t), this.extendedMapping[r] = n, this._ext[n] = o, this[n] = o, this._nextExt += 1
                    }, o.prototype.keepAlive = function() {
                        this._debug("keep-alive"), this._push(g)
                    }, o.prototype.handshake = function(e, t, r) {
                        var o, i;
                        if ("string" == typeof e ? o = new n(e, "hex") : (o = e, e = o.toString("hex")), "string" == typeof t ? i = new n(t, "hex") : (i = t, t = i.toString("hex")), 20 !== o.length || 20 !== i.length) throw new Error("infoHash and peerId MUST have length 20");
                        this._debug("handshake i=%s p=%s exts=%o", e, t, r);
                        var s = new n(w);
                        s[5] |= 16, r && r.dht && (s[7] |= 1), this._push(n.concat([m, s, o, i])), this._handshakeSent = !0, this.peerExtensions.extended && !this._extendedHandshakeSent && this._sendExtendedHandshake()
                    }, o.prototype._sendExtendedHandshake = function() {
                        var e = u(this.extendedHandshake);
                        e.m = {};
                        for (var t in this.extendedMapping) {
                            var n = this.extendedMapping[t];
                            e.m[n] = Number(t)
                        }
                        this.extended(0, s.encode(e)), this._extendedHandshakeSent = !0
                    }, o.prototype.choke = function() {
                        this.amChoking || (this.amChoking = !0, this._debug("choke"), this.peerRequests.splice(0, this.peerRequests.length), this._push(y))
                    }, o.prototype.unchoke = function() {
                        this.amChoking && (this.amChoking = !1, this._debug("unchoke"), this._push(_))
                    }, o.prototype.interested = function() {
                        this.amInterested || (this.amInterested = !0, this._debug("interested"), this._push(v))
                    }, o.prototype.uninterested = function() {
                        this.amInterested && (this.amInterested = !1, this._debug("uninterested"), this._push(b))
                    }, o.prototype.have = function(e) {
                        this._debug("have %d", e), this._message(4, [e], null)
                    }, o.prototype.bitfield = function(e) {
                        this._debug("bitfield"), n.isBuffer(e) || (e = e.buffer), this._message(5, [], e)
                    }, o.prototype.request = function(e, t, n, o) {
                        return o || (o = function() {}), this._finished ? o(new Error("wire is closed")) : this.peerChoking ? o(new Error("peer is choking")) : (this._debug("request index=%d offset=%d length=%d", e, t, n), this.requests.push(new r(e, t, n, o)), this._updateTimeout(), void this._message(6, [e, t, n], null))
                    }, o.prototype.piece = function(e, t, n) {
                        this._debug("piece index=%d offset=%d", e, t), this.uploaded += n.length, this.uploadSpeed(n.length), this.emit("upload", n.length), this._message(7, [e, t], n)
                    }, o.prototype.cancel = function(e, t, n) {
                        this._debug("cancel index=%d offset=%d length=%d", e, t, n), this._callback(i(this.requests, e, t, n), new Error("request was cancelled"), null), this._message(8, [e, t, n], null)
                    }, o.prototype.port = function(e) {
                        this._debug("port %d", e);
                        var t = new n(E);
                        t.writeUInt16BE(e, 5), this._push(t)
                    }, o.prototype.extended = function(e, t) {
                        if (this._debug("extended ext=%s", e), "string" == typeof e && this.peerExtendedMapping[e] && (e = this.peerExtendedMapping[e]), "number" != typeof e) throw new Error("Unrecognized extension: " + e);
                        var r = new n([e]),
                            o = n.isBuffer(t) ? t : s.encode(t);
                        this._message(20, [], n.concat([r, o]))
                    }, o.prototype._read = function() {}, o.prototype._message = function(e, t, r) {
                        var o = r ? r.length : 0,
                            i = new n(5 + 4 * t.length);
                        i.writeUInt32BE(i.length + o - 4, 0), i[4] = e;
                        for (var s = 0; s < t.length; s++) i.writeUInt32BE(t[s], 5 + 4 * s);
                        this._push(i), r && this._push(r)
                    }, o.prototype._push = function(e) {
                        return this._finished ? void 0 : this.push(e)
                    }, o.prototype._onKeepAlive = function() {
                        this._debug("got keep-alive"), this.emit("keep-alive")
                    }, o.prototype._onHandshake = function(e, t, n) {
                        var r = e.toString("hex"),
                            o = t.toString("hex");
                        this._debug("got handshake i=%s p=%s exts=%o", r, o, n), this.peerId = o, this.peerIdBuffer = t, this.peerExtensions = n, this.emit("handshake", r, o, n);
                        var i;
                        for (i in this._ext) this._ext[i].onHandshake(r, o, n);
                        n.extended && this._handshakeSent && !this._extendedHandshakeSent && this._sendExtendedHandshake()
                    }, o.prototype._onChoke = function() {
                        for (this.peerChoking = !0, this._debug("got choke"), this.emit("choke"); this.requests.length;) this._callback(this.requests.shift(), new Error("peer is choking"), null)
                    }, o.prototype._onUnchoke = function() {
                        this.peerChoking = !1, this._debug("got unchoke"), this.emit("unchoke")
                    }, o.prototype._onInterested = function() {
                        this.peerInterested = !0, this._debug("got interested"), this.emit("interested")
                    }, o.prototype._onUninterested = function() {
                        this.peerInterested = !1, this._debug("got uninterested"), this.emit("uninterested")
                    }, o.prototype._onHave = function(e) {
                        this.peerPieces.get(e) || (this._debug("got have %d", e), this.peerPieces.set(e, !0), this.emit("have", e))
                    }, o.prototype._onBitField = function(e) {
                        this.peerPieces = new a(e), this._debug("got bitfield"), this.emit("bitfield", this.peerPieces)
                    }, o.prototype._onRequest = function(e, t, n) {
                        if (!this.amChoking) {
                            this._debug("got request index=%d offset=%d length=%d", e, t, n);
                            var o = function(r, o) {
                                return s === i(this.peerRequests, e, t, n) ? r ? this._debug("error satisfying request index=%d offset=%d length=%d (%s)", e, t, n, r.message) : void this.piece(e, t, o) : void 0
                            }.bind(this),
                                s = new r(e, t, n, o);
                            this.peerRequests.push(s), this.emit("request", e, t, n, o)
                        }
                    }, o.prototype._onPiece = function(e, t, n) {
                        this._debug("got piece index=%d offset=%d", e, t), this._callback(i(this.requests, e, t, n.length), null, n), this.downloaded += n.length, this.downloadSpeed(n.length), this.emit("download", n.length), this.emit("piece", e, t, n)
                    }, o.prototype._onCancel = function(e, t, n) {
                        this._debug("got cancel index=%d offset=%d length=%d", e, t, n), i(this.peerRequests, e, t, n), this.emit("cancel", e, t, n)
                    }, o.prototype._onPort = function(e) {
                        this._debug("got port %d", e), this.emit("port", e)
                    }, o.prototype._onExtended = function(e, t) {
                        if (0 === e) {
                            var n;
                            try {
                                n = s.decode(t)
                            } catch (r) {
                                this._debug("ignoring invalid extended handshake: %s", r.message || r)
                            }
                            if (!n) return;
                            this.peerExtendedHandshake = n;
                            var o;
                            if ("object" == typeof n.m)
                                for (o in n.m) this.peerExtendedMapping[o] = Number(n.m[o].toString());
                            for (o in this._ext) this.peerExtendedMapping[o] && this._ext[o].onExtendedHandshake(this.peerExtendedHandshake);
                            this._debug("got extended handshake"), this.emit("extended", "handshake", this.peerExtendedHandshake)
                        } else this.extendedMapping[e] && (e = this.extendedMapping[e], this._ext[e] && this._ext[e].onMessage(t)), this._debug("got extended message ext=%s", e), this.emit("extended", e, t)
                    }, o.prototype._onTimeout = function() {
                        this._debug("request timed out"), this._callback(this.requests.shift(), new Error("request has timed out"), null), this.emit("timeout")
                    }, o.prototype._write = function(e, t, r) {
                        for (this._bufferSize += e.length, this._buffer.push(e); this._bufferSize >= this._parserSize;) {
                            var o = 1 === this._buffer.length ? this._buffer[0] : n.concat(this._buffer);
                            this._bufferSize -= this._parserSize, this._buffer = this._bufferSize ? [o.slice(this._parserSize)] : [], this._parser(o.slice(0, this._parserSize))
                        }
                        r(null)
                    }, o.prototype._callback = function(e, t, n) {
                        e && (this._clearTimeout(), this.peerChoking || this._finished || this._updateTimeout(), e.callback(t, n))
                    }, o.prototype._clearTimeout = function() {
                        this._timeout && (clearTimeout(this._timeout), this._timeout = null)
                    }, o.prototype._updateTimeout = function() {
                        this._timeoutMs && this.requests.length && !this._timeout && (this._timeout = setTimeout(this._onTimeout.bind(this), this._timeoutMs), this._timeoutUnref && this._timeout.unref && this._timeout.unref())
                    }, o.prototype._parse = function(e, t) {
                        this._parserSize = e, this._parser = t
                    }, o.prototype._onMessageLength = function(e) {
                        var t = e.readUInt32BE(0);
                        t > 0 ? this._parse(t, this._onMessage) : (this._onKeepAlive(), this._parse(4, this._onMessageLength))
                    }, o.prototype._onMessage = function(e) {
                        switch (this._parse(4, this._onMessageLength), e[0]) {
                            case 0:
                                return this._onChoke();
                            case 1:
                                return this._onUnchoke();
                            case 2:
                                return this._onInterested();
                            case 3:
                                return this._onUninterested();
                            case 4:
                                return this._onHave(e.readUInt32BE(1));
                            case 5:
                                return this._onBitField(e.slice(1));
                            case 6:
                                return this._onRequest(e.readUInt32BE(1), e.readUInt32BE(5), e.readUInt32BE(9));
                            case 7:
                                return this._onPiece(e.readUInt32BE(1), e.readUInt32BE(5), e.slice(9));
                            case 8:
                                return this._onCancel(e.readUInt32BE(1), e.readUInt32BE(5), e.readUInt32BE(9));
                            case 9:
                                return this._onPort(e.readUInt16BE(1));
                            case 20:
                                return this._onExtended(e.readUInt8(1), e.slice(2));
                            default:
                                return this._debug("got unknown message"), this.emit("unknownmessage", e)
                        }
                    }, o.prototype._parseHandshake = function() {
                        this._parse(1, function(e) {
                            var t = e.readUInt8(0);
                            this._parse(t + 48, function(e) {
                                var n = e.slice(0, t);
                                return "BitTorrent protocol" !== n.toString() ? (this._debug("Error: wire not speaking BitTorrent protocol (%s)", n.toString()), void this.end()) : (e = e.slice(t), this._onHandshake(e.slice(8, 28), e.slice(28, 48), {
                                    dht: !! (1 & e[7]),
                                    extended: !! (16 & e[5])
                                }), void this._parse(4, this._onMessageLength))
                            }.bind(this))
                        }.bind(this))
                    }, o.prototype._onFinish = function() {
                        for (this._finished = !0, this.push(null); this.read(););
                        for (clearInterval(this._keepAliveInterval), this._parse(Number.MAX_VALUE, function() {}), this.peerRequests = []; this.requests.length;) this._callback(this.requests.shift(), new Error("wire was closed"), null)
                    }, o.prototype._debug = function() {
                        var e = [].slice.call(arguments);
                        e[0] = "[" + this._debugId + "] " + e[0], c.apply(null, e)
                    }
                }).call(this, e("buffer").Buffer)
            }, {
                bencode: 12,
                bitfield: 7,
                buffer: 25,
                debug: 68,
                hat: 74,
                inherits: 76,
                "readable-stream": 106,
                speedometer: 137,
                xtend: 152
            }
        ],
        12: [
            function(e, t, n) {
                t.exports = {
                    encode: e("./lib/encode"),
                    decode: e("./lib/decode")
                }
            }, {
                "./lib/decode": 13,
                "./lib/encode": 15
            }
        ],
        13: [
            function(e, t, n) {
                (function(n) {
                    function r(e, t) {
                        return r.position = 0, r.encoding = t || null, r.data = n.isBuffer(e) ? e : new n(e), r.next()
                    }
                    var o = e("./dict");
                    r.position = 0, r.data = null, r.encoding = null, r.next = function() {
                        switch (r.data[r.position]) {
                            case 100:
                                return r.dictionary();
                            case 108:
                                return r.list();
                            case 105:
                                return r.integer();
                            default:
                                return r.bytes()
                        }
                    }, r.find = function(e) {
                        for (var t = r.position, n = r.data.length, o = r.data; n > t;) {
                            if (o[t] === e) return t;
                            t++
                        }
                        throw new Error('Invalid data: Missing delimiter "' + String.fromCharCode(e) + '" [0x' + e.toString(16) + "]")
                    }, r.dictionary = function() {
                        r.position++;
                        for (var e = new o; 101 !== r.data[r.position];) e.binarySet(r.bytes(), r.next());
                        return r.position++, e
                    }, r.list = function() {
                        r.position++;
                        for (var e = []; 101 !== r.data[r.position];) e.push(r.next());
                        return r.position++, e
                    }, r.integer = function() {
                        var e = r.find(101),
                            t = r.data.toString("ascii", r.position + 1, e);
                        return r.position += e + 1 - r.position, parseInt(t, 10)
                    }, r.bytes = function() {
                        var e = r.find(58),
                            t = parseInt(r.data.toString("ascii", r.position, e), 10),
                            n = ++e + t;
                        return r.position = n, r.encoding ? r.data.toString(r.encoding, e, n) : r.data.slice(e, n)
                    }, t.exports = r
                }).call(this, e("buffer").Buffer)
            }, {
                "./dict": 14,
                buffer: 25
            }
        ],
        14: [
            function(e, t, n) {
                var r = t.exports = function() {
                    Object.defineProperty(this, "_keys", {
                        enumerable: !1,
                        value: []
                    })
                };
                r.prototype.binaryKeys = function() {
                    return this._keys.slice()
                }, r.prototype.binarySet = function(e, t) {
                    this._keys.push(e), this[e] = t
                }
            }, {}
        ],
        15: [
            function(e, t, n) {
                (function(e) {
                    function n(t) {
                        var r = [];
                        return n._encode(r, t), e.concat(r)
                    }
                    n._floatConversionDetected = !1, n._encode = function(t, r) {
                        if (e.isBuffer(r)) return t.push(new e(r.length + ":")), void t.push(r);
                        switch (typeof r) {
                            case "string":
                                n.bytes(t, r);
                                break;
                            case "number":
                                n.number(t, r);
                                break;
                            case "object":
                                r.constructor === Array ? n.list(t, r) : n.dict(t, r)
                        }
                    };
                    var r = new e("e"),
                        o = new e("d"),
                        i = new e("l");
                    n.bytes = function(t, n) {
                        t.push(new e(e.byteLength(n) + ":" + n))
                    }, n.number = function(t, r) {
                        var o = 2147483648,
                            i = r / o << 0,
                            s = r % o << 0,
                            a = i * o + s;
                        t.push(new e("i" + a + "e")), a === r || n._floatConversionDetected || (n._floatConversionDetected = !0, console.warn('WARNING: Possible data corruption detected with value "' + r + '":', 'Bencoding only defines support for integers, value was converted to "' + a + '"'), console.trace())
                    }, n.dict = function(e, t) {
                        e.push(o);
                        for (var i, s = 0, a = Object.keys(t).sort(), c = a.length; c > s; s++) i = a[s], n.bytes(e, i), n._encode(e, t[i]);
                        e.push(r)
                    }, n.list = function(e, t) {
                        var o = 0,
                            s = t.length;
                        for (e.push(i); s > o; o++) n._encode(e, t[o]);
                        e.push(r)
                    }, t.exports = n
                }).call(this, e("buffer").Buffer)
            }, {
                buffer: 25
            }
        ],
        16: [
            function(e, t, n) {
                (function(n, r) {
                    function o(e, t, a, c) {
                        var u = this;
                        if (!(u instanceof o)) return new o(e, t, a, c);
                        s.call(u), c || (c = {}), u.peerId = "string" == typeof e ? e : e.toString("hex"), u.peerIdBuffer = new r(u.peerId, "hex"), u._peerIdBinary = u.peerIdBuffer.toString("binary"), u.infoHash = "string" == typeof a.infoHash ? a.infoHash : a.infoHash.toString("hex"), u.infoHashBuffer = new r(u.infoHash, "hex"), u._infoHashBinary = u.infoHashBuffer.toString("binary"), u.torrentLength = a.length, u.destroyed = !1, u._port = t, u._rtcConfig = c.rtcConfig, u._wrtc = c.wrtc, u._getAnnounceOpts = c.getAnnounceOpts, i("new client %s", u.infoHash);
                        var f = !! u._wrtc || "undefined" != typeof window,
                            l = "string" == typeof a.announce ? [a.announce] : null == a.announce ? [] : a.announce;
                        l = l.map(function(e) {
                            return e = e.toString(), "/" === e[e.length - 1] && (e = e.substring(0, e.length - 1)), e
                        }), l = d(l), u._trackers = l.map(function(e) {
                            var t = h.parse(e).protocol;
                            return "http:" !== t && "https:" !== t || "function" != typeof p ? "udp:" === t && "function" == typeof m ? new m(u, e) : "ws:" !== t && "wss:" !== t || !f ? (n.nextTick(function() {
                                var t = new Error("unsupported tracker protocol for " + e);
                                u.emit("warning", t)
                            }), null) : new g(u, e) : new p(u, e)
                        }).filter(Boolean)
                    }
                    t.exports = o;
                    var i = e("debug")("bittorrent-tracker"),
                        s = e("events").EventEmitter,
                        a = e("xtend"),
                        c = e("inherits"),
                        u = e("once"),
                        f = e("run-parallel"),
                        d = e("uniq"),
                        h = e("url"),
                        l = e("./lib/common"),
                        p = e("./lib/client/http-tracker"),
                        m = e("./lib/client/udp-tracker"),
                        g = e("./lib/client/websocket-tracker");
                    c(o, s), o.scrape = function(e, t, n) {
                        n = u(n);
                        var i = new r("01234567890123456789"),
                            s = 6881,
                            a = {
                                infoHash: Array.isArray(t) ? t[0] : t,
                                announce: [e]
                            }, c = new o(i, s, a);
                        c.once("error", n);
                        var f = Array.isArray(t) ? t.length : 1,
                            d = {};
                        c.on("scrape", function(e) {
                            if (f -= 1, d[e.infoHash] = e, 0 === f) {
                                c.destroy();
                                var t = Object.keys(d);
                                1 === t.length ? n(null, d[t[0]]) : n(null, d)
                            }
                        }), t = Array.isArray(t) ? t.map(function(e) {
                            return new r(e, "hex")
                        }) : new r(t, "hex"), c.scrape({
                            infoHash: t
                        })
                    }, o.prototype.start = function(e) {
                        var t = this;
                        i("send `start`"), e = t._defaultAnnounceOpts(e), e.event = "started", t._announce(e), t._trackers.forEach(function(e) {
                            e.setInterval()
                        })
                    }, o.prototype.stop = function(e) {
                        var t = this;
                        i("send `stop`"), e = t._defaultAnnounceOpts(e), e.event = "stopped", t._announce(e)
                    }, o.prototype.complete = function(e) {
                        var t = this;
                        i("send `complete`"), e || (e = {}), null == e.downloaded && null != t.torrentLength && (e.downloaded = t.torrentLength), e = t._defaultAnnounceOpts(e), e.event = "completed", t._announce(e)
                    }, o.prototype.update = function(e) {
                        var t = this;
                        i("send `update`"), e = t._defaultAnnounceOpts(e), e.event && delete e.event, t._announce(e)
                    }, o.prototype._announce = function(e) {
                        var t = this;
                        t._trackers.forEach(function(t) {
                            t.announce(e)
                        })
                    }, o.prototype.scrape = function(e) {
                        var t = this;
                        i("send `scrape`"), e || (e = {}), t._trackers.forEach(function(t) {
                            t.scrape(e)
                        })
                    }, o.prototype.setInterval = function(e) {
                        var t = this;
                        i("setInterval %d", e), t._trackers.forEach(function(t) {
                            t.setInterval(e)
                        })
                    }, o.prototype.destroy = function(e) {
                        var t = this;
                        if (!t.destroyed) {
                            t.destroyed = !0, i("destroy");
                            var n = t._trackers.map(function(e) {
                                return function(t) {
                                    e.destroy(t)
                                }
                            });
                            f(n, e), t._trackers = []
                        }
                    }, o.prototype._defaultAnnounceOpts = function(e) {
                        var t = this;
                        return e || (e = {}), null == e.numwant && (e.numwant = l.DEFAULT_ANNOUNCE_PEERS), null == e.uploaded && (e.uploaded = 0), null == e.downloaded && (e.downloaded = 0), null == e.left && null != t.torrentLength && (e.left = t.torrentLength - e.downloaded), t._getAnnounceOpts && (e = a(e, t._getAnnounceOpts())), e
                    }
                }).call(this, e("_process"), e("buffer").Buffer)
            }, {
                "./lib/client/http-tracker": 24,
                "./lib/client/udp-tracker": 24,
                "./lib/client/websocket-tracker": 18,
                "./lib/common": 19,
                _process: 33,
                buffer: 25,
                debug: 68,
                events: 29,
                inherits: 76,
                once: 21,
                "run-parallel": 127,
                uniq: 146,
                url: 45,
                xtend: 152
            }
        ],
        17: [
            function(e, t, n) {
                function r(e, t) {
                    var n = this;
                    o.call(n), n.client = e, n.announceUrl = t, n.interval = null, n.destroyed = !1
                }
                t.exports = r;
                var o = e("events").EventEmitter,
                    i = e("inherits");
                i(r, o), r.prototype.setInterval = function(e) {
                    var t = this;
                    if (null == e && (e = t.DEFAULT_ANNOUNCE_INTERVAL), clearInterval(t.interval), e) {
                        var n = t.announce.bind(t, t.client._defaultAnnounceOpts());
                        t.interval = setInterval(n, e), t.interval.unref && t.interval.unref()
                    }
                }
            }, {
                events: 29,
                inherits: 76
            }
        ],
        18: [
            function(e, t, n) {
                function r(e, t, n) {
                    var r = this;
                    h.call(r, e, t), i("new websocket tracker %s", t), r.peers = {}, r.socket = null, r.reconnecting = !1, r._openSocket()
                }

                function o() {}
                t.exports = r;
                var i = e("debug")("bittorrent-tracker:websocket-tracker"),
                    s = e("xtend"),
                    a = e("hat"),
                    c = e("inherits"),
                    u = e("simple-peer"),
                    f = e("simple-websocket"),
                    d = e("../common"),
                    h = e("./tracker"),
                    l = {}, p = 3e4,
                    m = 5e3,
                    g = 5e4;
                c(r, h), r.prototype.DEFAULT_ANNOUNCE_INTERVAL = 3e4, r.prototype.announce = function(e) {
                    var t = this;
                    if (!t.destroyed && !t.reconnecting) {
                        if (!t.socket.connected) return t.socket.once("connect", t.announce.bind(t, e));
                        var n = Math.min(e.numwant, 10);
                        t._generateOffers(n, function(r) {
                            var o = s(e, {
                                numwant: n,
                                info_hash: t.client._infoHashBinary,
                                peer_id: t.client._peerIdBinary,
                                offers: r
                            });
                            t._trackerId && (o.trackerid = t._trackerId), t._send(o)
                        })
                    }
                }, r.prototype.scrape = function(e) {
                    var t = this;
                    t.destroyed || t.reconnecting || t._onSocketError(new Error("scrape not supported " + t.announceUrl))
                }, r.prototype.destroy = function(e) {
                    var t = this;
                    if (!t.destroyed) {
                        t.destroyed = !0, clearInterval(t.interval), delete l[t.announceUrl], t.socket.removeListener("connect", t._onSocketConnectBound), t.socket.removeListener("data", t._onSocketDataBound), t.socket.removeListener("close", t._onSocketCloseBound), t.socket.removeListener("error", t._onSocketErrorBound), t._onSocketConnectBound = null, t._onSocketErrorBound = null, t._onSocketDataBound = null, t._onSocketCloseBound = null, t.socket.on("error", o);
                        try {
                            t.socket.destroy(e)
                        } catch (n) {
                            e && e()
                        }
                        t.socket = null
                    }
                }, r.prototype._openSocket = function() {
                    var e = this;
                    e.destroyed = !1, e._onSocketConnectBound = e._onSocketConnect.bind(e), e._onSocketErrorBound = e._onSocketError.bind(e), e._onSocketDataBound = e._onSocketData.bind(e), e._onSocketCloseBound = e._onSocketClose.bind(e), e.socket = l[e.announceUrl], e.socket || (e.socket = l[e.announceUrl] = new f(e.announceUrl), e.socket.on("connect", e._onSocketConnectBound)), e.socket.on("data", e._onSocketDataBound), e.socket.on("close", e._onSocketCloseBound), e.socket.on("error", e._onSocketErrorBound)
                }, r.prototype._onSocketConnect = function() {
                    var e = this;
                    e.destroyed || e.reconnecting && (e.reconnecting = !1, e.announce(e.client._defaultAnnounceOpts()))
                }, r.prototype._onSocketData = function(e) {
                    var t = this;
                    if (!t.destroyed) {
                        try {
                            e = JSON.parse(e)
                        } catch (n) {
                            return void t.client.emit("warning", new Error("Invalid tracker response"))
                        }
                        if (e.info_hash !== t.client._infoHashBinary) return void i("ignoring websocket data from %s for %s (looking for %s: reused socket)", t.announceUrl, d.binaryToHex(e.info_hash), t.client.infoHash);
                        if (!e.peer_id || e.peer_id !== t.client._peerIdBinary) {
                            i("received %s from %s for %s", JSON.stringify(e), t.announceUrl, t.client.infoHash);
                            var r = e["failure reason"];
                            if (r) return t.client.emit("warning", new Error(r));
                            var o = e["warning message"];
                            o && t.client.emit("warning", new Error(o));
                            var s = e.interval || e["min interval"];
                            s && t.setInterval(1e3 * s);
                            var a = e["tracker id"];
                            a && (t._trackerId = a), null != e.complete && t.client.emit("update", {
                                announce: t.announceUrl,
                                complete: e.complete,
                                incomplete: e.incomplete
                            });
                            var c;
                            if (e.offer && e.peer_id && (i("creating peer (from remote offer)"), c = new u({
                                trickle: !1,
                                config: t.client._rtcConfig,
                                wrtc: t.client._wrtc
                            }), c.id = d.binaryToHex(e.peer_id), c.once("signal", function(n) {
                                var r = {
                                    info_hash: t.client._infoHashBinary,
                                    peer_id: t.client._peerIdBinary,
                                    to_peer_id: e.peer_id,
                                    answer: n,
                                    offer_id: e.offer_id
                                };
                                t._trackerId && (r.trackerid = t._trackerId), t._send(r)
                            }), c.signal(e.offer), t.client.emit("peer", c)), e.answer && e.peer_id) {
                                var f = d.binaryToHex(e.offer_id);
                                c = t.peers[f], c ? (c.id = d.binaryToHex(e.peer_id), c.signal(e.answer), t.client.emit("peer", c), clearTimeout(c.trackerTimeout), c.trackerTimeout = null, delete t.peers[f]) : i("got unexpected answer: " + JSON.stringify(e.answer))
                            }
                        }
                    }
                }, r.prototype._onSocketClose = function() {
                    var e = this;
                    e.destroyed || (e.destroy(), e._startReconnectTimer())
                }, r.prototype._onSocketError = function(e) {
                    var t = this;
                    t.destroyed || (t.destroy(), t.client.emit("warning", e), t._startReconnectTimer())
                }, r.prototype._startReconnectTimer = function() {
                    var e = this,
                        t = Math.floor(Math.random() * p) + m;
                    e.reconnecting = !0;
                    var n = setTimeout(function() {
                        e._openSocket()
                    }, t);
                    n.unref && n.unref(), i("reconnecting socket in %s ms", t)
                }, r.prototype._send = function(e) {
                    var t = this;
                    if (!t.destroyed) {
                        var n = JSON.stringify(e);
                        i("send %s", n), t.socket.send(n)
                    }
                }, r.prototype._generateOffers = function(e, t) {
                    function n() {
                        var e = a(160);
                        i("creating peer (from _generateOffers)");
                        var t = o.peers[e] = new u({
                            initiator: !0,
                            trickle: !1,
                            config: o.client._rtcConfig,
                            wrtc: o.client._wrtc
                        });
                        t.once("signal", function(t) {
                            s.push({
                                offer: t,
                                offer_id: d.hexToBinary(e)
                            }), r()
                        }), t.trackerTimeout = setTimeout(function() {
                            i("tracker timeout: destroying peer"), t.trackerTimeout = null, delete o.peers[e], t.destroy()
                        }, g)
                    }

                    function r() {
                        s.length === e && (i("generated %s offers", e), t(s))
                    }
                    var o = this,
                        s = [];
                    i("generating %s offers", e);
                    for (var c = 0; e > c; ++c) n()
                }
            }, {
                "../common": 19,
                "./tracker": 17,
                debug: 68,
                hat: 74,
                inherits: 76,
                "simple-peer": 131,
                "simple-websocket": 22,
                xtend: 152
            }
        ],
        19: [
            function(e, t, n) {
                (function(t) {
                    var r = e("xtend/mutable");
                    n.DEFAULT_ANNOUNCE_PEERS = 50, n.MAX_ANNOUNCE_PEERS = 82, n.binaryToHex = function(e) {
                        return new t(e, "binary").toString("hex")
                    }, n.hexToBinary = function(e) {
                        return new t(e, "hex").toString("binary")
                    };
                    var o = e("./common-node");
                    r(n, o)
                }).call(this, e("buffer").Buffer)
            }, {
                "./common-node": 24,
                buffer: 25,
                "xtend/mutable": 153
            }
        ],
        20: [
            function(e, t, n) {
                function r(e, t) {
                    function n() {
                        for (var t = new Array(arguments.length), n = 0; n < t.length; n++) t[n] = arguments[n];
                        var r = e.apply(this, t),
                            o = t[t.length - 1];
                        return "function" == typeof r && r !== o && Object.keys(o).forEach(function(e) {
                            r[e] = o[e]
                        }), r
                    }
                    if (e && t) return r(e)(t);
                    if ("function" != typeof e) throw new TypeError("need wrapper function");
                    return Object.keys(e).forEach(function(t) {
                        n[t] = e[t]
                    }), n
                }
                t.exports = r
            }, {}
        ],
        21: [
            function(e, t, n) {
                function r(e) {
                    var t = function() {
                        return t.called ? t.value : (t.called = !0, t.value = e.apply(this, arguments))
                    };
                    return t.called = !1, t
                }
                var o = e("wrappy");
                t.exports = o(r), r.proto = r(function() {
                    Object.defineProperty(Function.prototype, "once", {
                        value: function() {
                            return r(this)
                        },
                        configurable: !0
                    })
                })
            }, {
                wrappy: 20
            }
        ],
        22: [
            function(e, t, n) {
                (function(n) {
                    function r(e, t) {
                        var n = this;
                        return n instanceof r ? (t || (t = {}), o("new websocket: %s %o", e, t), t.allowHalfOpen = !1, null == t.highWaterMark && (t.highWaterMark = 1048576), s.Duplex.call(n, t), n.url = e, n.connected = !1, n.destroyed = !1, n._maxBufferedAmount = t.highWaterMark, n._chunk = null, n._cb = null, n._interval = null, n._ws = new c(n.url), n._ws.binaryType = "arraybuffer", n._ws.onopen = n._onOpen.bind(n), n._ws.onmessage = n._onMessage.bind(n), n._ws.onclose = n._onClose.bind(n), n._ws.onerror = function() {
                            n._onError(new Error("connection error to " + n.url))
                        }, void n.on("finish", function() {
                            n.connected ? setTimeout(function() {
                                n._destroy()
                            }, 100) : n.once("connect", function() {
                                setTimeout(function() {
                                    n._destroy()
                                }, 100)
                            })
                        })) : new r(e, t)
                    }
                    t.exports = r;
                    var o = e("debug")("simple-websocket"),
                        i = e("inherits"),
                        s = e("readable-stream"),
                        a = e("ws"),
                        c = "undefined" != typeof window ? window.WebSocket : a;
                    i(r, s.Duplex), r.WEBSOCKET_SUPPORT = !! c, r.prototype.send = function(e) {
                        var t = this,
                            n = e.length || e.byteLength || e.size;
                        t._ws.send(e), o("write: %d bytes", n)
                    }, r.prototype.destroy = function(e) {
                        var t = this;
                        t._destroy(null, e)
                    }, r.prototype._destroy = function(e, t) {
                        var n = this;
                        if (!n.destroyed) {
                            if (t && n.once("close", t), o("destroy (error: %s)", e && e.message), this.readable = this.writable = !1, n._readableState.ended || n.push(null), n._writableState.finished || n.end(), n.connected = !1, n.destroyed = !0, clearInterval(n._interval), n._interval = null, n._chunk = null, n._cb = null, n._ws) {
                                var r = n._ws,
                                    i = function() {
                                        r.onclose = null, n.emit("close")
                                    };
                                if (r.readyState === c.CLOSED) i();
                                else try {
                                    r.onclose = i, r.close()
                                } catch (e) {
                                    i()
                                }
                                r.onopen = null, r.onmessage = null, r.onerror = null
                            }
                            n._ws = null, e && n.emit("error", e)
                        }
                    }, r.prototype._read = function() {}, r.prototype._write = function(e, t, n) {
                        var r = this;
                        if (r.destroyed) return n(new Error("cannot write after socket is destroyed"));
                        if (r.connected) {
                            try {
                                r.send(e)
                            } catch (i) {
                                return r._onError(i)
                            }
                            "function" != typeof a && r._ws.bufferedAmount > r._maxBufferedAmount ? (o("start backpressure: bufferedAmount %d", r._ws.bufferedAmount), r._cb = n) : n(null)
                        } else o("write before connect"), r._chunk = e, r._cb = n
                    }, r.prototype._onMessage = function(e) {
                        var t = this;
                        if (!t.destroyed) {
                            var r = e.data;
                            o("read: %d bytes", r.byteLength || r.length), r instanceof ArrayBuffer && (r = new n(r)), t.push(r)
                        }
                    }, r.prototype._onOpen = function() {
                        var e = this;
                        if (!e.connected && !e.destroyed) {
                            if (e.connected = !0, e._chunk) {
                                try {
                                    e.send(e._chunk)
                                } catch (t) {
                                    return e._onError(t)
                                }
                                e._chunk = null, o('sent chunk from "write before connect"');
                                var n = e._cb;
                                e._cb = null, n(null)
                            }
                            "function" != typeof a && (e._interval = setInterval(function() {
                                if (e._cb && e._ws && !(e._ws.bufferedAmount > e._maxBufferedAmount)) {
                                    o("ending backpressure: bufferedAmount %d", e._ws.bufferedAmount);
                                    var t = e._cb;
                                    e._cb = null, t(null)
                                }
                            }, 150), e._interval.unref && e._interval.unref()), o("connect"), e.emit("connect")
                        }
                    }, r.prototype._onClose = function() {
                        var e = this;
                        e.destroyed || (o("on close"), e._destroy())
                    }, r.prototype._onError = function(e) {
                        var t = this;
                        t.destroyed || (o("error: %s", e.message || e), t._destroy(e))
                    }
                }).call(this, e("buffer").Buffer)
            }, {
                buffer: 25,
                debug: 68,
                inherits: 76,
                "readable-stream": 106,
                ws: 24
            }
        ],
        23: [
            function(e, t, n) {}, {}
        ],
        24: [
            function(e, t, n) {
                arguments[4][23][0].apply(n, arguments)
            }, {
                dup: 23
            }
        ],
        25: [
            function(e, t, n) {
                (function(t) {
                    "use strict";

                    function r() {
                        try {
                            var e = new Uint8Array(1);
                            return e.foo = function() {
                                return 42
                            }, 42 === e.foo() && "function" == typeof e.subarray && 0 === e.subarray(1, 1).byteLength
                        } catch (t) {
                            return !1
                        }
                    }

                    function o() {
                        return i.TYPED_ARRAY_SUPPORT ? 2147483647 : 1073741823
                    }

                    function i(e) {
                        return this instanceof i ? (i.TYPED_ARRAY_SUPPORT || (this.length = 0, this.parent = void 0), "number" == typeof e ? s(this, e) : "string" == typeof e ? a(this, e, arguments.length > 1 ? arguments[1] : "utf8") : c(this, e)) : arguments.length > 1 ? new i(e, arguments[1]) : new i(e)
                    }

                    function s(e, t) {
                        if (e = m(e, 0 > t ? 0 : 0 | g(t)), !i.TYPED_ARRAY_SUPPORT)
                            for (var n = 0; t > n; n++) e[n] = 0;
                        return e
                    }

                    function a(e, t, n) {
                        "string" == typeof n && "" !== n || (n = "utf8");
                        var r = 0 | _(t, n);
                        return e = m(e, r), e.write(t, n), e
                    }

                    function c(e, t) {
                        if (i.isBuffer(t)) return u(e, t);
                        if (X(t)) return f(e, t);
                        if (null == t) throw new TypeError("must start with number, buffer, array or string");
                        if ("undefined" != typeof ArrayBuffer) {
                            if (t.buffer instanceof ArrayBuffer) return d(e, t);
                            if (t instanceof ArrayBuffer) return h(e, t)
                        }
                        return t.length ? l(e, t) : p(e, t)
                    }

                    function u(e, t) {
                        var n = 0 | g(t.length);
                        return e = m(e, n), t.copy(e, 0, 0, n), e
                    }

                    function f(e, t) {
                        var n = 0 | g(t.length);
                        e = m(e, n);
                        for (var r = 0; n > r; r += 1) e[r] = 255 & t[r];
                        return e
                    }

                    function d(e, t) {
                        var n = 0 | g(t.length);
                        e = m(e, n);
                        for (var r = 0; n > r; r += 1) e[r] = 255 & t[r];
                        return e
                    }

                    function h(e, t) {
                        return t.byteLength, i.TYPED_ARRAY_SUPPORT ? (e = new Uint8Array(t), e.__proto__ = i.prototype) : e = d(e, new Uint8Array(t)), e
                    }

                    function l(e, t) {
                        var n = 0 | g(t.length);
                        e = m(e, n);
                        for (var r = 0; n > r; r += 1) e[r] = 255 & t[r];
                        return e
                    }

                    function p(e, t) {
                        var n, r = 0;
                        "Buffer" === t.type && X(t.data) && (n = t.data, r = 0 | g(n.length)), e = m(e, r);
                        for (var o = 0; r > o; o += 1) e[o] = 255 & n[o];
                        return e
                    }

                    function m(e, t) {
                        i.TYPED_ARRAY_SUPPORT ? (e = new Uint8Array(t), e.__proto__ = i.prototype) : e.length = t;
                        var n = 0 !== t && t <= i.poolSize >>> 1;
                        return n && (e.parent = J), e
                    }

                    function g(e) {
                        if (e >= o()) throw new RangeError("Attempt to allocate Buffer larger than maximum size: 0x" + o().toString(16) + " bytes");
                        return 0 | e
                    }

                    function y(e, t) {
                        if (!(this instanceof y)) return new y(e, t);
                        var n = new i(e, t);
                        return delete n.parent, n
                    }

                    function _(e, t) {
                        "string" != typeof e && (e = "" + e);
                        var n = e.length;
                        if (0 === n) return 0;
                        for (var r = !1;;) switch (t) {
                            case "ascii":
                            case "binary":
                            case "raw":
                            case "raws":
                                return n;
                            case "utf8":
                            case "utf-8":
                                return W(e).length;
                            case "ucs2":
                            case "ucs-2":
                            case "utf16le":
                            case "utf-16le":
                                return 2 * n;
                            case "hex":
                                return n >>> 1;
                            case "base64":
                                return V(e).length;
                            default:
                                if (r) return W(e).length;
                                t = ("" + t).toLowerCase(), r = !0
                        }
                    }

                    function v(e, t, n) {
                        var r = !1;
                        if (t = 0 | t, n = void 0 === n || n === 1 / 0 ? this.length : 0 | n, e || (e = "utf8"), 0 > t && (t = 0), n > this.length && (n = this.length), t >= n) return "";
                        for (;;) switch (e) {
                            case "hex":
                                return T(this, t, n);
                            case "utf8":
                            case "utf-8":
                                return B(this, t, n);
                            case "ascii":
                                return C(this, t, n);
                            case "binary":
                                return L(this, t, n);
                            case "base64":
                                return I(this, t, n);
                            case "ucs2":
                            case "ucs-2":
                            case "utf16le":
                            case "utf-16le":
                                return R(this, t, n);
                            default:
                                if (r) throw new TypeError("Unknown encoding: " + e);
                                e = (e + "").toLowerCase(), r = !0
                        }
                    }

                    function b(e, t, n, r) {
                        n = Number(n) || 0;
                        var o = e.length - n;
                        r ? (r = Number(r), r > o && (r = o)) : r = o;
                        var i = t.length;
                        if (i % 2 !== 0) throw new Error("Invalid hex string");
                        r > i / 2 && (r = i / 2);
                        for (var s = 0; r > s; s++) {
                            var a = parseInt(t.substr(2 * s, 2), 16);
                            if (isNaN(a)) throw new Error("Invalid hex string");
                            e[n + s] = a
                        }
                        return s
                    }

                    function w(e, t, n, r) {
                        return $(W(t, e.length - n), e, n, r)
                    }

                    function E(e, t, n, r) {
                        return $(F(t), e, n, r)
                    }

                    function k(e, t, n, r) {
                        return E(e, t, n, r)
                    }

                    function x(e, t, n, r) {
                        return $(V(t), e, n, r)
                    }

                    function S(e, t, n, r) {
                        return $(Y(t, e.length - n), e, n, r)
                    }

                    function I(e, t, n) {
                        return 0 === t && n === e.length ? G.fromByteArray(e) : G.fromByteArray(e.slice(t, n))
                    }

                    function B(e, t, n) {
                        n = Math.min(e.length, n);
                        for (var r = [], o = t; n > o;) {
                            var i = e[o],
                                s = null,
                                a = i > 239 ? 4 : i > 223 ? 3 : i > 191 ? 2 : 1;
                            if (n >= o + a) {
                                var c, u, f, d;
                                switch (a) {
                                    case 1:
                                        128 > i && (s = i);
                                        break;
                                    case 2:
                                        c = e[o + 1], 128 === (192 & c) && (d = (31 & i) << 6 | 63 & c, d > 127 && (s = d));
                                        break;
                                    case 3:
                                        c = e[o + 1], u = e[o + 2], 128 === (192 & c) && 128 === (192 & u) && (d = (15 & i) << 12 | (63 & c) << 6 | 63 & u, d > 2047 && (55296 > d || d > 57343) && (s = d));
                                        break;
                                    case 4:
                                        c = e[o + 1], u = e[o + 2], f = e[o + 3], 128 === (192 & c) && 128 === (192 & u) && 128 === (192 & f) && (d = (15 & i) << 18 | (63 & c) << 12 | (63 & u) << 6 | 63 & f, d > 65535 && 1114112 > d && (s = d))
                                }
                            }
                            null === s ? (s = 65533, a = 1) : s > 65535 && (s -= 65536, r.push(s >>> 10 & 1023 | 55296), s = 56320 | 1023 & s), r.push(s), o += a
                        }
                        return A(r)
                    }

                    function A(e) {
                        var t = e.length;
                        if (Z >= t) return String.fromCharCode.apply(String, e);
                        for (var n = "", r = 0; t > r;) n += String.fromCharCode.apply(String, e.slice(r, r += Z));
                        return n
                    }

                    function C(e, t, n) {
                        var r = "";
                        n = Math.min(e.length, n);
                        for (var o = t; n > o; o++) r += String.fromCharCode(127 & e[o]);
                        return r
                    }

                    function L(e, t, n) {
                        var r = "";
                        n = Math.min(e.length, n);
                        for (var o = t; n > o; o++) r += String.fromCharCode(e[o]);
                        return r
                    }

                    function T(e, t, n) {
                        var r = e.length;
                        (!t || 0 > t) && (t = 0), (!n || 0 > n || n > r) && (n = r);
                        for (var o = "", i = t; n > i; i++) o += z(e[i]);
                        return o
                    }

                    function R(e, t, n) {
                        for (var r = e.slice(t, n), o = "", i = 0; i < r.length; i += 2) o += String.fromCharCode(r[i] + 256 * r[i + 1]);
                        return o
                    }

                    function U(e, t, n) {
                        if (e % 1 !== 0 || 0 > e) throw new RangeError("offset is not uint");
                        if (e + t > n) throw new RangeError("Trying to access beyond buffer length")
                    }

                    function P(e, t, n, r, o, s) {
                        if (!i.isBuffer(e)) throw new TypeError("buffer must be a Buffer instance");
                        if (t > o || s > t) throw new RangeError("value is out of bounds");
                        if (n + r > e.length) throw new RangeError("index out of range")
                    }

                    function O(e, t, n, r) {
                        0 > t && (t = 65535 + t + 1);
                        for (var o = 0, i = Math.min(e.length - n, 2); i > o; o++) e[n + o] = (t & 255 << 8 * (r ? o : 1 - o)) >>> 8 * (r ? o : 1 - o)
                    }

                    function M(e, t, n, r) {
                        0 > t && (t = 4294967295 + t + 1);
                        for (var o = 0, i = Math.min(e.length - n, 4); i > o; o++) e[n + o] = t >>> 8 * (r ? o : 3 - o) & 255
                    }

                    function j(e, t, n, r, o, i) {
                        if (n + r > e.length) throw new RangeError("index out of range");
                        if (0 > n) throw new RangeError("index out of range")
                    }

                    function D(e, t, n, r, o) {
                        return o || j(e, t, n, 4, 3.4028234663852886e38, -3.4028234663852886e38), K.write(e, t, n, r, 23, 4), n + 4
                    }

                    function H(e, t, n, r, o) {
                        return o || j(e, t, n, 8, 1.7976931348623157e308, -1.7976931348623157e308), K.write(e, t, n, r, 52, 8), n + 8
                    }

                    function N(e) {
                        if (e = q(e).replace(Q, ""), e.length < 2) return "";
                        for (; e.length % 4 !== 0;) e += "=";
                        return e
                    }

                    function q(e) {
                        return e.trim ? e.trim() : e.replace(/^\s+|\s+$/g, "")
                    }

                    function z(e) {
                        return 16 > e ? "0" + e.toString(16) : e.toString(16)
                    }

                    function W(e, t) {
                        t = t || 1 / 0;
                        for (var n, r = e.length, o = null, i = [], s = 0; r > s; s++) {
                            if (n = e.charCodeAt(s), n > 55295 && 57344 > n) {
                                if (!o) {
                                    if (n > 56319) {
                                        (t -= 3) > -1 && i.push(239, 191, 189);
                                        continue
                                    }
                                    if (s + 1 === r) {
                                        (t -= 3) > -1 && i.push(239, 191, 189);
                                        continue
                                    }
                                    o = n;
                                    continue
                                }
                                if (56320 > n) {
                                    (t -= 3) > -1 && i.push(239, 191, 189), o = n;
                                    continue
                                }
                                n = (o - 55296 << 10 | n - 56320) + 65536
                            } else o && (t -= 3) > -1 && i.push(239, 191, 189); if (o = null, 128 > n) {
                                if ((t -= 1) < 0) break;
                                i.push(n)
                            } else if (2048 > n) {
                                if ((t -= 2) < 0) break;
                                i.push(n >> 6 | 192, 63 & n | 128)
                            } else if (65536 > n) {
                                if ((t -= 3) < 0) break;
                                i.push(n >> 12 | 224, n >> 6 & 63 | 128, 63 & n | 128)
                            } else {
                                if (!(1114112 > n)) throw new Error("Invalid code point");
                                if ((t -= 4) < 0) break;
                                i.push(n >> 18 | 240, n >> 12 & 63 | 128, n >> 6 & 63 | 128, 63 & n | 128)
                            }
                        }
                        return i
                    }

                    function F(e) {
                        for (var t = [], n = 0; n < e.length; n++) t.push(255 & e.charCodeAt(n));
                        return t
                    }

                    function Y(e, t) {
                        for (var n, r, o, i = [], s = 0; s < e.length && !((t -= 2) < 0); s++) n = e.charCodeAt(s), r = n >> 8, o = n % 256, i.push(o), i.push(r);
                        return i
                    }

                    function V(e) {
                        return G.toByteArray(N(e))
                    }

                    function $(e, t, n, r) {
                        for (var o = 0; r > o && !(o + n >= t.length || o >= e.length); o++) t[o + n] = e[o];
                        return o
                    }
                    var G = e("base64-js"),
                        K = e("ieee754"),
                        X = e("isarray");
                    n.Buffer = i, n.SlowBuffer = y, n.INSPECT_MAX_BYTES = 50, i.poolSize = 8192;
                    var J = {};
                    i.TYPED_ARRAY_SUPPORT = void 0 !== t.TYPED_ARRAY_SUPPORT ? t.TYPED_ARRAY_SUPPORT : r(), i._augment = function(e) {
                        return e.__proto__ = i.prototype, e
                    }, i.TYPED_ARRAY_SUPPORT ? (i.prototype.__proto__ = Uint8Array.prototype, i.__proto__ = Uint8Array, "undefined" != typeof Symbol && Symbol.species && i[Symbol.species] === i && Object.defineProperty(i, Symbol.species, {
                        value: null,
                        configurable: !0
                    })) : (i.prototype.length = void 0, i.prototype.parent = void 0), i.isBuffer = function(e) {
                        return !(null == e || !e._isBuffer)
                    }, i.compare = function(e, t) {
                        if (!i.isBuffer(e) || !i.isBuffer(t)) throw new TypeError("Arguments must be Buffers");
                        if (e === t) return 0;
                        for (var n = e.length, r = t.length, o = 0, s = Math.min(n, r); s > o && e[o] === t[o];)++o;
                        return o !== s && (n = e[o], r = t[o]), r > n ? -1 : n > r ? 1 : 0
                    }, i.isEncoding = function(e) {
                        switch (String(e).toLowerCase()) {
                            case "hex":
                            case "utf8":
                            case "utf-8":
                            case "ascii":
                            case "binary":
                            case "base64":
                            case "raw":
                            case "ucs2":
                            case "ucs-2":
                            case "utf16le":
                            case "utf-16le":
                                return !0;
                            default:
                                return !1
                        }
                    }, i.concat = function(e, t) {
                        if (!X(e)) throw new TypeError("list argument must be an Array of Buffers.");
                        if (0 === e.length) return new i(0);
                        var n;
                        if (void 0 === t)
                            for (t = 0, n = 0; n < e.length; n++) t += e[n].length;
                        var r = new i(t),
                            o = 0;
                        for (n = 0; n < e.length; n++) {
                            var s = e[n];
                            s.copy(r, o), o += s.length
                        }
                        return r
                    }, i.byteLength = _, i.prototype._isBuffer = !0, i.prototype.toString = function() {
                        var e = 0 | this.length;
                        return 0 === e ? "" : 0 === arguments.length ? B(this, 0, e) : v.apply(this, arguments)
                    }, i.prototype.equals = function(e) {
                        if (!i.isBuffer(e)) throw new TypeError("Argument must be a Buffer");
                        return this === e ? !0 : 0 === i.compare(this, e)
                    }, i.prototype.inspect = function() {
                        var e = "",
                            t = n.INSPECT_MAX_BYTES;
                        return this.length > 0 && (e = this.toString("hex", 0, t).match(/.{2}/g).join(" "), this.length > t && (e += " ... ")), "<Buffer " + e + ">"
                    }, i.prototype.compare = function(e) {
                        if (!i.isBuffer(e)) throw new TypeError("Argument must be a Buffer");
                        return this === e ? 0 : i.compare(this, e)
                    }, i.prototype.indexOf = function(e, t) {
                        function n(e, t, n) {
                            for (var r = -1, o = 0; n + o < e.length; o++)
                                if (e[n + o] === t[-1 === r ? 0 : o - r]) {
                                    if (-1 === r && (r = o), o - r + 1 === t.length) return n + r
                                } else r = -1;
                            return -1
                        }
                        if (t > 2147483647 ? t = 2147483647 : -2147483648 > t && (t = -2147483648), t >>= 0, 0 === this.length) return -1;
                        if (t >= this.length) return -1;
                        if (0 > t && (t = Math.max(this.length + t, 0)), "string" == typeof e) return 0 === e.length ? -1 : String.prototype.indexOf.call(this, e, t);
                        if (i.isBuffer(e)) return n(this, e, t);
                        if ("number" == typeof e) return i.TYPED_ARRAY_SUPPORT && "function" === Uint8Array.prototype.indexOf ? Uint8Array.prototype.indexOf.call(this, e, t) : n(this, [e], t);
                        throw new TypeError("val must be string, number or Buffer")
                    }, i.prototype.write = function(e, t, n, r) {
                        if (void 0 === t) r = "utf8", n = this.length, t = 0;
                        else if (void 0 === n && "string" == typeof t) r = t, n = this.length, t = 0;
                        else if (isFinite(t)) t = 0 | t, isFinite(n) ? (n = 0 | n, void 0 === r && (r = "utf8")) : (r = n, n = void 0);
                        else {
                            var o = r;
                            r = t, t = 0 | n, n = o
                        }
                        var i = this.length - t;
                        if ((void 0 === n || n > i) && (n = i), e.length > 0 && (0 > n || 0 > t) || t > this.length) throw new RangeError("attempt to write outside buffer bounds");
                        r || (r = "utf8");
                        for (var s = !1;;) switch (r) {
                            case "hex":
                                return b(this, e, t, n);
                            case "utf8":
                            case "utf-8":
                                return w(this, e, t, n);
                            case "ascii":
                                return E(this, e, t, n);
                            case "binary":
                                return k(this, e, t, n);
                            case "base64":
                                return x(this, e, t, n);
                            case "ucs2":
                            case "ucs-2":
                            case "utf16le":
                            case "utf-16le":
                                return S(this, e, t, n);
                            default:
                                if (s) throw new TypeError("Unknown encoding: " + r);
                                r = ("" + r).toLowerCase(), s = !0
                        }
                    }, i.prototype.toJSON = function() {
                        return {
                            type: "Buffer",
                            data: Array.prototype.slice.call(this._arr || this, 0)
                        }
                    };
                    var Z = 4096;
                    i.prototype.slice = function(e, t) {
                        var n = this.length;
                        e = ~~e, t = void 0 === t ? n : ~~t, 0 > e ? (e += n, 0 > e && (e = 0)) : e > n && (e = n), 0 > t ? (t += n, 0 > t && (t = 0)) : t > n && (t = n), e > t && (t = e);
                        var r;
                        if (i.TYPED_ARRAY_SUPPORT) r = this.subarray(e, t), r.__proto__ = i.prototype;
                        else {
                            var o = t - e;
                            r = new i(o, void 0);
                            for (var s = 0; o > s; s++) r[s] = this[s + e]
                        }
                        return r.length && (r.parent = this.parent || this), r
                    }, i.prototype.readUIntLE = function(e, t, n) {
                        e = 0 | e, t = 0 | t, n || U(e, t, this.length);
                        for (var r = this[e], o = 1, i = 0; ++i < t && (o *= 256);) r += this[e + i] * o;
                        return r
                    }, i.prototype.readUIntBE = function(e, t, n) {
                        e = 0 | e, t = 0 | t, n || U(e, t, this.length);
                        for (var r = this[e + --t], o = 1; t > 0 && (o *= 256);) r += this[e + --t] * o;
                        return r
                    }, i.prototype.readUInt8 = function(e, t) {
                        return t || U(e, 1, this.length), this[e]
                    }, i.prototype.readUInt16LE = function(e, t) {
                        return t || U(e, 2, this.length), this[e] | this[e + 1] << 8
                    }, i.prototype.readUInt16BE = function(e, t) {
                        return t || U(e, 2, this.length), this[e] << 8 | this[e + 1]
                    }, i.prototype.readUInt32LE = function(e, t) {
                        return t || U(e, 4, this.length), (this[e] | this[e + 1] << 8 | this[e + 2] << 16) + 16777216 * this[e + 3]
                    }, i.prototype.readUInt32BE = function(e, t) {
                        return t || U(e, 4, this.length), 16777216 * this[e] + (this[e + 1] << 16 | this[e + 2] << 8 | this[e + 3])
                    }, i.prototype.readIntLE = function(e, t, n) {
                        e = 0 | e, t = 0 | t, n || U(e, t, this.length);
                        for (var r = this[e], o = 1, i = 0; ++i < t && (o *= 256);) r += this[e + i] * o;
                        return o *= 128, r >= o && (r -= Math.pow(2, 8 * t)), r
                    }, i.prototype.readIntBE = function(e, t, n) {
                        e = 0 | e, t = 0 | t, n || U(e, t, this.length);
                        for (var r = t, o = 1, i = this[e + --r]; r > 0 && (o *= 256);) i += this[e + --r] * o;
                        return o *= 128, i >= o && (i -= Math.pow(2, 8 * t)), i
                    }, i.prototype.readInt8 = function(e, t) {
                        return t || U(e, 1, this.length), 128 & this[e] ? -1 * (255 - this[e] + 1) : this[e]
                    }, i.prototype.readInt16LE = function(e, t) {
                        t || U(e, 2, this.length);
                        var n = this[e] | this[e + 1] << 8;
                        return 32768 & n ? 4294901760 | n : n
                    }, i.prototype.readInt16BE = function(e, t) {
                        t || U(e, 2, this.length);
                        var n = this[e + 1] | this[e] << 8;
                        return 32768 & n ? 4294901760 | n : n
                    }, i.prototype.readInt32LE = function(e, t) {
                        return t || U(e, 4, this.length), this[e] | this[e + 1] << 8 | this[e + 2] << 16 | this[e + 3] << 24
                    }, i.prototype.readInt32BE = function(e, t) {
                        return t || U(e, 4, this.length), this[e] << 24 | this[e + 1] << 16 | this[e + 2] << 8 | this[e + 3]
                    }, i.prototype.readFloatLE = function(e, t) {
                        return t || U(e, 4, this.length), K.read(this, e, !0, 23, 4)
                    }, i.prototype.readFloatBE = function(e, t) {
                        return t || U(e, 4, this.length), K.read(this, e, !1, 23, 4)
                    }, i.prototype.readDoubleLE = function(e, t) {
                        return t || U(e, 8, this.length), K.read(this, e, !0, 52, 8)
                    }, i.prototype.readDoubleBE = function(e, t) {
                        return t || U(e, 8, this.length), K.read(this, e, !1, 52, 8)
                    }, i.prototype.writeUIntLE = function(e, t, n, r) {
                        e = +e, t = 0 | t, n = 0 | n, r || P(this, e, t, n, Math.pow(2, 8 * n), 0);
                        var o = 1,
                            i = 0;
                        for (this[t] = 255 & e; ++i < n && (o *= 256);) this[t + i] = e / o & 255;
                        return t + n
                    }, i.prototype.writeUIntBE = function(e, t, n, r) {
                        e = +e, t = 0 | t, n = 0 | n, r || P(this, e, t, n, Math.pow(2, 8 * n), 0);
                        var o = n - 1,
                            i = 1;
                        for (this[t + o] = 255 & e; --o >= 0 && (i *= 256);) this[t + o] = e / i & 255;
                        return t + n
                    }, i.prototype.writeUInt8 = function(e, t, n) {
                        return e = +e, t = 0 | t, n || P(this, e, t, 1, 255, 0), i.TYPED_ARRAY_SUPPORT || (e = Math.floor(e)), this[t] = 255 & e, t + 1
                    }, i.prototype.writeUInt16LE = function(e, t, n) {
                        return e = +e, t = 0 | t, n || P(this, e, t, 2, 65535, 0), i.TYPED_ARRAY_SUPPORT ? (this[t] = 255 & e, this[t + 1] = e >>> 8) : O(this, e, t, !0), t + 2
                    }, i.prototype.writeUInt16BE = function(e, t, n) {
                        return e = +e, t = 0 | t, n || P(this, e, t, 2, 65535, 0), i.TYPED_ARRAY_SUPPORT ? (this[t] = e >>> 8, this[t + 1] = 255 & e) : O(this, e, t, !1), t + 2
                    }, i.prototype.writeUInt32LE = function(e, t, n) {
                        return e = +e, t = 0 | t, n || P(this, e, t, 4, 4294967295, 0), i.TYPED_ARRAY_SUPPORT ? (this[t + 3] = e >>> 24, this[t + 2] = e >>> 16, this[t + 1] = e >>> 8, this[t] = 255 & e) : M(this, e, t, !0), t + 4
                    }, i.prototype.writeUInt32BE = function(e, t, n) {
                        return e = +e, t = 0 | t, n || P(this, e, t, 4, 4294967295, 0), i.TYPED_ARRAY_SUPPORT ? (this[t] = e >>> 24, this[t + 1] = e >>> 16, this[t + 2] = e >>> 8, this[t + 3] = 255 & e) : M(this, e, t, !1), t + 4
                    }, i.prototype.writeIntLE = function(e, t, n, r) {
                        if (e = +e, t = 0 | t, !r) {
                            var o = Math.pow(2, 8 * n - 1);
                            P(this, e, t, n, o - 1, -o)
                        }
                        var i = 0,
                            s = 1,
                            a = 0 > e ? 1 : 0;
                        for (this[t] = 255 & e; ++i < n && (s *= 256);) this[t + i] = (e / s >> 0) - a & 255;
                        return t + n
                    }, i.prototype.writeIntBE = function(e, t, n, r) {
                        if (e = +e, t = 0 | t, !r) {
                            var o = Math.pow(2, 8 * n - 1);
                            P(this, e, t, n, o - 1, -o)
                        }
                        var i = n - 1,
                            s = 1,
                            a = 0 > e ? 1 : 0;
                        for (this[t + i] = 255 & e; --i >= 0 && (s *= 256);) this[t + i] = (e / s >> 0) - a & 255;
                        return t + n
                    }, i.prototype.writeInt8 = function(e, t, n) {
                        return e = +e, t = 0 | t, n || P(this, e, t, 1, 127, -128), i.TYPED_ARRAY_SUPPORT || (e = Math.floor(e)), 0 > e && (e = 255 + e + 1), this[t] = 255 & e, t + 1
                    }, i.prototype.writeInt16LE = function(e, t, n) {
                        return e = +e, t = 0 | t, n || P(this, e, t, 2, 32767, -32768), i.TYPED_ARRAY_SUPPORT ? (this[t] = 255 & e, this[t + 1] = e >>> 8) : O(this, e, t, !0), t + 2
                    }, i.prototype.writeInt16BE = function(e, t, n) {
                        return e = +e, t = 0 | t, n || P(this, e, t, 2, 32767, -32768), i.TYPED_ARRAY_SUPPORT ? (this[t] = e >>> 8, this[t + 1] = 255 & e) : O(this, e, t, !1), t + 2
                    }, i.prototype.writeInt32LE = function(e, t, n) {
                        return e = +e, t = 0 | t, n || P(this, e, t, 4, 2147483647, -2147483648), i.TYPED_ARRAY_SUPPORT ? (this[t] = 255 & e, this[t + 1] = e >>> 8, this[t + 2] = e >>> 16, this[t + 3] = e >>> 24) : M(this, e, t, !0), t + 4
                    }, i.prototype.writeInt32BE = function(e, t, n) {
                        return e = +e, t = 0 | t, n || P(this, e, t, 4, 2147483647, -2147483648), 0 > e && (e = 4294967295 + e + 1), i.TYPED_ARRAY_SUPPORT ? (this[t] = e >>> 24, this[t + 1] = e >>> 16, this[t + 2] = e >>> 8, this[t + 3] = 255 & e) : M(this, e, t, !1), t + 4
                    }, i.prototype.writeFloatLE = function(e, t, n) {
                        return D(this, e, t, !0, n)
                    }, i.prototype.writeFloatBE = function(e, t, n) {
                        return D(this, e, t, !1, n)
                    }, i.prototype.writeDoubleLE = function(e, t, n) {
                        return H(this, e, t, !0, n)
                    }, i.prototype.writeDoubleBE = function(e, t, n) {
                        return H(this, e, t, !1, n)
                    }, i.prototype.copy = function(e, t, n, r) {
                        if (n || (n = 0), r || 0 === r || (r = this.length), t >= e.length && (t = e.length), t || (t = 0), r > 0 && n > r && (r = n), r === n) return 0;
                        if (0 === e.length || 0 === this.length) return 0;
                        if (0 > t) throw new RangeError("targetStart out of bounds");
                        if (0 > n || n >= this.length) throw new RangeError("sourceStart out of bounds");
                        if (0 > r) throw new RangeError("sourceEnd out of bounds");
                        r > this.length && (r = this.length), e.length - t < r - n && (r = e.length - t + n);
                        var o, s = r - n;
                        if (this === e && t > n && r > t)
                            for (o = s - 1; o >= 0; o--) e[o + t] = this[o + n];
                        else if (1e3 > s || !i.TYPED_ARRAY_SUPPORT)
                            for (o = 0; s > o; o++) e[o + t] = this[o + n];
                        else Uint8Array.prototype.set.call(e, this.subarray(n, n + s), t);
                        return s
                    }, i.prototype.fill = function(e, t, n) {
                        if (e || (e = 0), t || (t = 0), n || (n = this.length), t > n) throw new RangeError("end < start");
                        if (n !== t && 0 !== this.length) {
                            if (0 > t || t >= this.length) throw new RangeError("start out of bounds");
                            if (0 > n || n > this.length) throw new RangeError("end out of bounds");
                            var r;
                            if ("number" == typeof e)
                                for (r = t; n > r; r++) this[r] = e;
                            else {
                                var o = W(e.toString()),
                                    i = o.length;
                                for (r = t; n > r; r++) this[r] = o[r % i]
                            }
                            return this
                        }
                    };
                    var Q = /[^+\/0-9A-Za-z-_]/g
                }).call(this, "undefined" != typeof global ? global : "undefined" != typeof self ? self : "undefined" != typeof window ? window : {})
            }, {
                "base64-js": 26,
                ieee754: 27,
                isarray: 28
            }
        ],
        26: [
            function(e, t, n) {
                "use strict";

                function r() {
                    var e, t = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/",
                        n = t.length;
                    for (e = 0; n > e; e++) c[e] = t[e];
                    for (e = 0; n > e; ++e) u[t.charCodeAt(e)] = e;
                    u["-".charCodeAt(0)] = 62, u["_".charCodeAt(0)] = 63
                }

                function o(e) {
                    var t, n, r, o, i, s, a = e.length;
                    if (a % 4 > 0) throw new Error("Invalid string. Length must be a multiple of 4");
                    i = "=" === e[a - 2] ? 2 : "=" === e[a - 1] ? 1 : 0, s = new f(3 * a / 4 - i), r = i > 0 ? a - 4 : a;
                    var c = 0;
                    for (t = 0, n = 0; r > t; t += 4, n += 3) o = u[e.charCodeAt(t)] << 18 | u[e.charCodeAt(t + 1)] << 12 | u[e.charCodeAt(t + 2)] << 6 | u[e.charCodeAt(t + 3)], s[c++] = (16711680 & o) >> 16, s[c++] = (65280 & o) >> 8, s[c++] = 255 & o;
                    return 2 === i ? (o = u[e.charCodeAt(t)] << 2 | u[e.charCodeAt(t + 1)] >> 4, s[c++] = 255 & o) : 1 === i && (o = u[e.charCodeAt(t)] << 10 | u[e.charCodeAt(t + 1)] << 4 | u[e.charCodeAt(t + 2)] >> 2, s[c++] = o >> 8 & 255, s[c++] = 255 & o), s
                }

                function i(e) {
                    return c[e >> 18 & 63] + c[e >> 12 & 63] + c[e >> 6 & 63] + c[63 & e]
                }

                function s(e, t, n) {
                    for (var r, o = [], s = t; n > s; s += 3) r = (e[s] << 16) + (e[s + 1] << 8) + e[s + 2], o.push(i(r));
                    return o.join("")
                }

                function a(e) {
                    for (var t, n = e.length, r = n % 3, o = "", i = [], a = 16383, u = 0, f = n - r; f > u; u += a) i.push(s(e, u, u + a > f ? f : u + a));
                    return 1 === r ? (t = e[n - 1], o += c[t >> 2], o += c[t << 4 & 63], o += "==") : 2 === r && (t = (e[n - 2] << 8) + e[n - 1], o += c[t >> 10], o += c[t >> 4 & 63], o += c[t << 2 & 63], o += "="), i.push(o), i.join("")
                }
                n.toByteArray = o, n.fromByteArray = a;
                var c = [],
                    u = [],
                    f = "undefined" != typeof Uint8Array ? Uint8Array : Array;
                r()
            }, {}
        ],
        27: [
            function(e, t, n) {
                n.read = function(e, t, n, r, o) {
                    var i, s, a = 8 * o - r - 1,
                        c = (1 << a) - 1,
                        u = c >> 1,
                        f = -7,
                        d = n ? o - 1 : 0,
                        h = n ? -1 : 1,
                        l = e[t + d];
                    for (d += h, i = l & (1 << -f) - 1, l >>= -f, f += a; f > 0; i = 256 * i + e[t + d], d += h, f -= 8);
                    for (s = i & (1 << -f) - 1, i >>= -f, f += r; f > 0; s = 256 * s + e[t + d], d += h, f -= 8);
                    if (0 === i) i = 1 - u;
                    else {
                        if (i === c) return s ? NaN : (l ? -1 : 1) * (1 / 0);
                        s += Math.pow(2, r), i -= u
                    }
                    return (l ? -1 : 1) * s * Math.pow(2, i - r)
                }, n.write = function(e, t, n, r, o, i) {
                    var s, a, c, u = 8 * i - o - 1,
                        f = (1 << u) - 1,
                        d = f >> 1,
                        h = 23 === o ? Math.pow(2, -24) - Math.pow(2, -77) : 0,
                        l = r ? 0 : i - 1,
                        p = r ? 1 : -1,
                        m = 0 > t || 0 === t && 0 > 1 / t ? 1 : 0;
                    for (t = Math.abs(t), isNaN(t) || t === 1 / 0 ? (a = isNaN(t) ? 1 : 0, s = f) : (s = Math.floor(Math.log(t) / Math.LN2), t * (c = Math.pow(2, -s)) < 1 && (s--, c *= 2), t += s + d >= 1 ? h / c : h * Math.pow(2, 1 - d), t * c >= 2 && (s++, c /= 2), s + d >= f ? (a = 0, s = f) : s + d >= 1 ? (a = (t * c - 1) * Math.pow(2, o), s += d) : (a = t * Math.pow(2, d - 1) * Math.pow(2, o), s = 0)); o >= 8; e[n + l] = 255 & a, l += p, a /= 256, o -= 8);
                    for (s = s << o | a, u += o; u > 0; e[n + l] = 255 & s, l += p, s /= 256, u -= 8);
                    e[n + l - p] |= 128 * m
                }
            }, {}
        ],
        28: [
            function(e, t, n) {
                var r = {}.toString;
                t.exports = Array.isArray || function(e) {
                    return "[object Array]" == r.call(e)
                }
            }, {}
        ],
        29: [
            function(e, t, n) {
                function r() {
                    this._events = this._events || {}, this._maxListeners = this._maxListeners || void 0
                }

                function o(e) {
                    return "function" == typeof e
                }

                function i(e) {
                    return "number" == typeof e
                }

                function s(e) {
                    return "object" == typeof e && null !== e
                }

                function a(e) {
                    return void 0 === e
                }
                t.exports = r, r.EventEmitter = r, r.prototype._events = void 0, r.prototype._maxListeners = void 0, r.defaultMaxListeners = 10, r.prototype.setMaxListeners = function(e) {
                    if (!i(e) || 0 > e || isNaN(e)) throw TypeError("n must be a positive number");
                    return this._maxListeners = e, this
                }, r.prototype.emit = function(e) {
                    var t, n, r, i, c, u;
                    if (this._events || (this._events = {}), "error" === e && (!this._events.error || s(this._events.error) && !this._events.error.length)) {
                        if (t = arguments[1], t instanceof Error) throw t;
                        throw TypeError('Uncaught, unspecified "error" event.')
                    }
                    if (n = this._events[e], a(n)) return !1;
                    if (o(n)) switch (arguments.length) {
                        case 1:
                            n.call(this);
                            break;
                        case 2:
                            n.call(this, arguments[1]);
                            break;
                        case 3:
                            n.call(this, arguments[1], arguments[2]);
                            break;
                        default:
                            i = Array.prototype.slice.call(arguments, 1), n.apply(this, i)
                    } else if (s(n))
                        for (i = Array.prototype.slice.call(arguments, 1), u = n.slice(), r = u.length, c = 0; r > c; c++) u[c].apply(this, i);
                    return !0
                }, r.prototype.addListener = function(e, t) {
                    var n;
                    if (!o(t)) throw TypeError("listener must be a function");
                    return this._events || (this._events = {}), this._events.newListener && this.emit("newListener", e, o(t.listener) ? t.listener : t), this._events[e] ? s(this._events[e]) ? this._events[e].push(t) : this._events[e] = [this._events[e], t] : this._events[e] = t, s(this._events[e]) && !this._events[e].warned && (n = a(this._maxListeners) ? r.defaultMaxListeners : this._maxListeners, n && n > 0 && this._events[e].length > n && (this._events[e].warned = !0, console.error("(node) warning: possible EventEmitter memory leak detected. %d listeners added. Use emitter.setMaxListeners() to increase limit.", this._events[e].length), "function" == typeof console.trace && console.trace())), this
                }, r.prototype.on = r.prototype.addListener, r.prototype.once = function(e, t) {
                    function n() {
                        this.removeListener(e, n), r || (r = !0, t.apply(this, arguments))
                    }
                    if (!o(t)) throw TypeError("listener must be a function");
                    var r = !1;
                    return n.listener = t, this.on(e, n), this
                }, r.prototype.removeListener = function(e, t) {
                    var n, r, i, a;
                    if (!o(t)) throw TypeError("listener must be a function");
                    if (!this._events || !this._events[e]) return this;
                    if (n = this._events[e], i = n.length, r = -1, n === t || o(n.listener) && n.listener === t) delete this._events[e], this._events.removeListener && this.emit("removeListener", e, t);
                    else if (s(n)) {
                        for (a = i; a-- > 0;)
                            if (n[a] === t || n[a].listener && n[a].listener === t) {
                                r = a;
                                break
                            }
                        if (0 > r) return this;
                        1 === n.length ? (n.length = 0, delete this._events[e]) : n.splice(r, 1), this._events.removeListener && this.emit("removeListener", e, t)
                    }
                    return this
                }, r.prototype.removeAllListeners = function(e) {
                    var t, n;
                    if (!this._events) return this;
                    if (!this._events.removeListener) return 0 === arguments.length ? this._events = {} : this._events[e] && delete this._events[e], this;
                    if (0 === arguments.length) {
                        for (t in this._events) "removeListener" !== t && this.removeAllListeners(t);
                        return this.removeAllListeners("removeListener"), this._events = {}, this
                    }
                    if (n = this._events[e], o(n)) this.removeListener(e, n);
                    else if (n)
                        for (; n.length;) this.removeListener(e, n[n.length - 1]);
                    return delete this._events[e], this
                }, r.prototype.listeners = function(e) {
                    var t;
                    return t = this._events && this._events[e] ? o(this._events[e]) ? [this._events[e]] : this._events[e].slice() : []
                }, r.prototype.listenerCount = function(e) {
                    if (this._events) {
                        var t = this._events[e];
                        if (o(t)) return 1;
                        if (t) return t.length
                    }
                    return 0
                }, r.listenerCount = function(e, t) {
                    return e.listenerCount(t)
                }
            }, {}
        ],
        30: [
            function(e, t, n) {
                var r = e("http"),
                    o = t.exports;
                for (var i in r) r.hasOwnProperty(i) && (o[i] = r[i]);
                o.request = function(e, t) {
                    return e || (e = {}), e.scheme = "https", e.protocol = "https:", r.request.call(this, e, t)
                }
            }, {
                http: 39
            }
        ],
        31: [
            function(e, t, n) {
                t.exports = function(e) {
                    return !(null == e || !(e._isBuffer || e.constructor && "function" == typeof e.constructor.isBuffer && e.constructor.isBuffer(e)))
                }
            }, {}
        ],
        32: [
            function(e, t, n) {
                (function(e) {
                    function t(e, t) {
                        for (var n = 0, r = e.length - 1; r >= 0; r--) {
                            var o = e[r];
                            "." === o ? e.splice(r, 1) : ".." === o ? (e.splice(r, 1), n++) : n && (e.splice(r, 1), n--)
                        }
                        if (t)
                            for (; n--; n) e.unshift("..");
                        return e
                    }

                    function r(e, t) {
                        if (e.filter) return e.filter(t);
                        for (var n = [], r = 0; r < e.length; r++) t(e[r], r, e) && n.push(e[r]);
                        return n
                    }
                    var o = /^(\/?|)([\s\S]*?)((?:\.{1,2}|[^\/]+?|)(\.[^.\/]*|))(?:[\/]*)$/,
                        i = function(e) {
                            return o.exec(e).slice(1)
                        };
                    n.resolve = function() {
                        for (var n = "", o = !1, i = arguments.length - 1; i >= -1 && !o; i--) {
                            var s = i >= 0 ? arguments[i] : e.cwd();
                            if ("string" != typeof s) throw new TypeError("Arguments to path.resolve must be strings");
                            s && (n = s + "/" + n, o = "/" === s.charAt(0))
                        }
                        return n = t(r(n.split("/"), function(e) {
                            return !!e
                        }), !o).join("/"), (o ? "/" : "") + n || "."
                    }, n.normalize = function(e) {
                        var o = n.isAbsolute(e),
                            i = "/" === s(e, -1);
                        return e = t(r(e.split("/"), function(e) {
                            return !!e
                        }), !o).join("/"), e || o || (e = "."), e && i && (e += "/"), (o ? "/" : "") + e
                    }, n.isAbsolute = function(e) {
                        return "/" === e.charAt(0)
                    }, n.join = function() {
                        var e = Array.prototype.slice.call(arguments, 0);
                        return n.normalize(r(e, function(e, t) {
                            if ("string" != typeof e) throw new TypeError("Arguments to path.join must be strings");
                            return e
                        }).join("/"))
                    }, n.relative = function(e, t) {
                        function r(e) {
                            for (var t = 0; t < e.length && "" === e[t]; t++);
                            for (var n = e.length - 1; n >= 0 && "" === e[n]; n--);
                            return t > n ? [] : e.slice(t, n - t + 1)
                        }
                        e = n.resolve(e).substr(1), t = n.resolve(t).substr(1);
                        for (var o = r(e.split("/")), i = r(t.split("/")), s = Math.min(o.length, i.length), a = s, c = 0; s > c; c++)
                            if (o[c] !== i[c]) {
                                a = c;
                                break
                            }
                        for (var u = [], c = a; c < o.length; c++) u.push("..");
                        return u = u.concat(i.slice(a)), u.join("/")
                    }, n.sep = "/", n.delimiter = ":", n.dirname = function(e) {
                        var t = i(e),
                            n = t[0],
                            r = t[1];
                        return n || r ? (r && (r = r.substr(0, r.length - 1)), n + r) : "."
                    }, n.basename = function(e, t) {
                        var n = i(e)[2];
                        return t && n.substr(-1 * t.length) === t && (n = n.substr(0, n.length - t.length)), n
                    }, n.extname = function(e) {
                        return i(e)[3]
                    };
                    var s = "b" === "ab".substr(-1) ? function(e, t, n) {
                            return e.substr(t, n)
                        } : function(e, t, n) {
                            return 0 > t && (t = e.length + t), e.substr(t, n)
                        }
                }).call(this, e("_process"))
            }, {
                _process: 33
            }
        ],
        33: [
            function(e, t, n) {
                function r() {
                    f = !1, a.length ? u = a.concat(u) : d = -1, u.length && o()
                }

                function o() {
                    if (!f) {
                        var e = setTimeout(r);
                        f = !0;
                        for (var t = u.length; t;) {
                            for (a = u, u = []; ++d < t;) a && a[d].run();
                            d = -1, t = u.length
                        }
                        a = null, f = !1, clearTimeout(e)
                    }
                }

                function i(e, t) {
                    this.fun = e, this.array = t
                }

                function s() {}
                var a, c = t.exports = {}, u = [],
                    f = !1,
                    d = -1;
                c.nextTick = function(e) {
                    var t = new Array(arguments.length - 1);
                    if (arguments.length > 1)
                        for (var n = 1; n < arguments.length; n++) t[n - 1] = arguments[n];
                    u.push(new i(e, t)), 1 !== u.length || f || setTimeout(o, 0)
                }, i.prototype.run = function() {
                    this.fun.apply(null, this.array)
                }, c.title = "browser", c.browser = !0, c.env = {}, c.argv = [], c.version = "", c.versions = {}, c.on = s, c.addListener = s, c.once = s, c.off = s, c.removeListener = s, c.removeAllListeners = s, c.emit = s, c.binding = function(e) {
                    throw new Error("process.binding is not supported")
                }, c.cwd = function() {
                    return "/"
                }, c.chdir = function(e) {
                    throw new Error("process.chdir is not supported")
                }, c.umask = function() {
                    return 0
                }
            }, {}
        ],
        34: [
            function(t, n, r) {
                (function(t) {
                    ! function(o) {
                        function i(e) {
                            throw new RangeError(P[e])
                        }

                        function s(e, t) {
                            for (var n = e.length, r = []; n--;) r[n] = t(e[n]);
                            return r
                        }

                        function a(e, t) {
                            var n = e.split("@"),
                                r = "";
                            n.length > 1 && (r = n[0] + "@", e = n[1]), e = e.replace(U, ".");
                            var o = e.split("."),
                                i = s(o, t).join(".");
                            return r + i
                        }

                        function c(e) {
                            for (var t, n, r = [], o = 0, i = e.length; i > o;) t = e.charCodeAt(o++), t >= 55296 && 56319 >= t && i > o ? (n = e.charCodeAt(o++), 56320 == (64512 & n) ? r.push(((1023 & t) << 10) + (1023 & n) + 65536) : (r.push(t), o--)) : r.push(t);
                            return r
                        }

                        function u(e) {
                            return s(e, function(e) {
                                var t = "";
                                return e > 65535 && (e -= 65536, t += j(e >>> 10 & 1023 | 55296), e = 56320 | 1023 & e), t += j(e)
                            }).join("")
                        }

                        function f(e) {
                            return 10 > e - 48 ? e - 22 : 26 > e - 65 ? e - 65 : 26 > e - 97 ? e - 97 : k
                        }

                        function d(e, t) {
                            return e + 22 + 75 * (26 > e) - ((0 != t) << 5)
                        }

                        function h(e, t, n) {
                            var r = 0;
                            for (e = n ? M(e / B) : e >> 1, e += M(e / t); e > O * S >> 1; r += k) e = M(e / O);
                            return M(r + (O + 1) * e / (e + I))
                        }

                        function l(e) {
                            var t, n, r, o, s, a, c, d, l, p, m = [],
                                g = e.length,
                                y = 0,
                                _ = C,
                                v = A;
                            for (n = e.lastIndexOf(L), 0 > n && (n = 0), r = 0; n > r; ++r) e.charCodeAt(r) >= 128 && i("not-basic"), m.push(e.charCodeAt(r));
                            for (o = n > 0 ? n + 1 : 0; g > o;) {
                                for (s = y, a = 1, c = k; o >= g && i("invalid-input"), d = f(e.charCodeAt(o++)), (d >= k || d > M((E - y) / a)) && i("overflow"), y += d * a, l = v >= c ? x : c >= v + S ? S : c - v, !(l > d); c += k) p = k - l, a > M(E / p) && i("overflow"), a *= p;
                                t = m.length + 1, v = h(y - s, t, 0 == s), M(y / t) > E - _ && i("overflow"), _ += M(y / t), y %= t, m.splice(y++, 0, _)
                            }
                            return u(m)
                        }

                        function p(e) {
                            var t, n, r, o, s, a, u, f, l, p, m, g, y, _, v, b = [];
                            for (e = c(e), g = e.length, t = C, n = 0, s = A, a = 0; g > a; ++a) m = e[a], 128 > m && b.push(j(m));
                            for (r = o = b.length, o && b.push(L); g > r;) {
                                for (u = E, a = 0; g > a; ++a) m = e[a], m >= t && u > m && (u = m);
                                for (y = r + 1, u - t > M((E - n) / y) && i("overflow"), n += (u - t) * y, t = u, a = 0; g > a; ++a)
                                    if (m = e[a], t > m && ++n > E && i("overflow"), m == t) {
                                        for (f = n, l = k; p = s >= l ? x : l >= s + S ? S : l - s, !(p > f); l += k) v = f - p, _ = k - p, b.push(j(d(p + v % _, 0))), f = M(v / _);
                                        b.push(j(d(f, 0))), s = h(n, y, r == o), n = 0, ++r
                                    }++n, ++t
                            }
                            return b.join("")
                        }

                        function m(e) {
                            return a(e, function(e) {
                                return T.test(e) ? l(e.slice(4).toLowerCase()) : e
                            })
                        }

                        function g(e) {
                            return a(e, function(e) {
                                return R.test(e) ? "xn--" + p(e) : e
                            })
                        }
                        var y = "object" == typeof r && r && !r.nodeType && r,
                            _ = "object" == typeof n && n && !n.nodeType && n,
                            v = "object" == typeof t && t;
                        v.global !== v && v.window !== v && v.self !== v || (o = v);
                        var b, w, E = 2147483647,
                            k = 36,
                            x = 1,
                            S = 26,
                            I = 38,
                            B = 700,
                            A = 72,
                            C = 128,
                            L = "-",
                            T = /^xn--/,
                            R = /[^\x20-\x7E]/,
                            U = /[\x2E\u3002\uFF0E\uFF61]/g,
                            P = {
                                overflow: "Overflow: input needs wider integers to process",
                                "not-basic": "Illegal input >= 0x80 (not a basic code point)",
                                "invalid-input": "Invalid input"
                            }, O = k - x,
                            M = Math.floor,
                            j = String.fromCharCode;
                        if (b = {
                            version: "1.3.2",
                            ucs2: {
                                decode: c,
                                encode: u
                            },
                            decode: l,
                            encode: p,
                            toASCII: g,
                            toUnicode: m
                        }, "function" == typeof e && "object" == typeof e.amd && e.amd) e("punycode", function() {
                            return b
                        });
                        else if (y && _)
                            if (n.exports == y) _.exports = b;
                            else
                                for (w in b) b.hasOwnProperty(w) && (y[w] = b[w]);
                            else o.punycode = b
                    }(this)
                }).call(this, "undefined" != typeof global ? global : "undefined" != typeof self ? self : "undefined" != typeof window ? window : {})
            }, {}
        ],
        35: [
            function(e, t, n) {
                "use strict";

                function r(e, t) {
                    return Object.prototype.hasOwnProperty.call(e, t)
                }
                t.exports = function(e, t, n, i) {
                    t = t || "&", n = n || "=";
                    var s = {};
                    if ("string" != typeof e || 0 === e.length) return s;
                    var a = /\+/g;
                    e = e.split(t);
                    var c = 1e3;
                    i && "number" == typeof i.maxKeys && (c = i.maxKeys);
                    var u = e.length;
                    c > 0 && u > c && (u = c);
                    for (var f = 0; u > f; ++f) {
                        var d, h, l, p, m = e[f].replace(a, "%20"),
                            g = m.indexOf(n);
                        g >= 0 ? (d = m.substr(0, g), h = m.substr(g + 1)) : (d = m, h = ""), l = decodeURIComponent(d), p = decodeURIComponent(h), r(s, l) ? o(s[l]) ? s[l].push(p) : s[l] = [s[l], p] : s[l] = p
                    }
                    return s
                };
                var o = Array.isArray || function(e) {
                        return "[object Array]" === Object.prototype.toString.call(e)
                    }
            }, {}
        ],
        36: [
            function(e, t, n) {
                "use strict";

                function r(e, t) {
                    if (e.map) return e.map(t);
                    for (var n = [], r = 0; r < e.length; r++) n.push(t(e[r], r));
                    return n
                }
                var o = function(e) {
                    switch (typeof e) {
                        case "string":
                            return e;
                        case "boolean":
                            return e ? "true" : "false";
                        case "number":
                            return isFinite(e) ? e : "";
                        default:
                            return ""
                    }
                };
                t.exports = function(e, t, n, a) {
                    return t = t || "&", n = n || "=", null === e && (e = void 0), "object" == typeof e ? r(s(e), function(s) {
                        var a = encodeURIComponent(o(s)) + n;
                        return i(e[s]) ? r(e[s], function(e) {
                            return a + encodeURIComponent(o(e))
                        }).join(t) : a + encodeURIComponent(o(e[s]))
                    }).join(t) : a ? encodeURIComponent(o(a)) + n + encodeURIComponent(o(e)) : ""
                };
                var i = Array.isArray || function(e) {
                        return "[object Array]" === Object.prototype.toString.call(e)
                    }, s = Object.keys || function(e) {
                        var t = [];
                        for (var n in e) Object.prototype.hasOwnProperty.call(e, n) && t.push(n);
                        return t
                    }
            }, {}
        ],
        37: [
            function(e, t, n) {
                "use strict";
                n.decode = n.parse = e("./decode"), n.encode = n.stringify = e("./encode")
            }, {
                "./decode": 35,
                "./encode": 36
            }
        ],
        38: [
            function(e, t, n) {
                function r() {
                    o.call(this)
                }
                t.exports = r;
                var o = e("events").EventEmitter,
                    i = e("inherits");
                i(r, o), r.Readable = e("readable-stream/readable.js"), r.Writable = e("readable-stream/writable.js"), r.Duplex = e("readable-stream/duplex.js"), r.Transform = e("readable-stream/transform.js"), r.PassThrough = e("readable-stream/passthrough.js"), r.Stream = r, r.prototype.pipe = function(e, t) {
                    function n(t) {
                        e.writable && !1 === e.write(t) && u.pause && u.pause()
                    }

                    function r() {
                        u.readable && u.resume && u.resume()
                    }

                    function i() {
                        f || (f = !0, e.end())
                    }

                    function s() {
                        f || (f = !0, "function" == typeof e.destroy && e.destroy())
                    }

                    function a(e) {
                        if (c(), 0 === o.listenerCount(this, "error")) throw e
                    }

                    function c() {
                        u.removeListener("data", n), e.removeListener("drain", r), u.removeListener("end", i), u.removeListener("close", s), u.removeListener("error", a), e.removeListener("error", a), u.removeListener("end", c), u.removeListener("close", c), e.removeListener("close", c)
                    }
                    var u = this;
                    u.on("data", n), e.on("drain", r), e._isStdio || t && t.end === !1 || (u.on("end", i), u.on("close", s));
                    var f = !1;
                    return u.on("error", a), e.on("error", a), u.on("end", c), u.on("close", c), e.on("close", c), e.emit("pipe", u), e
                }
            }, {
                events: 29,
                inherits: 76,
                "readable-stream/duplex.js": 94,
                "readable-stream/passthrough.js": 105,
                "readable-stream/readable.js": 106,
                "readable-stream/transform.js": 107,
                "readable-stream/writable.js": 108
            }
        ],
        39: [
            function(e, t, n) {
                (function(t) {
                    var r = e("./lib/request"),
                        o = e("xtend"),
                        i = e("builtin-status-codes"),
                        s = e("url"),
                        a = n;
                    a.request = function(e, n) {
                        e = "string" == typeof e ? s.parse(e) : o(e);
                        var i = -1 === t.location.protocol.search(/^https?:$/) ? "http:" : "",
                            a = e.protocol || i,
                            c = e.hostname || e.host,
                            u = e.port,
                            f = e.path || "/";
                        c && -1 !== c.indexOf(":") && (c = "[" + c + "]"), e.url = (c ? a + "//" + c : "") + (u ? ":" + u : "") + f, e.method = (e.method || "GET").toUpperCase(), e.headers = e.headers || {};
                        var d = new r(e);
                        return n && d.on("response", n), d
                    }, a.get = function(e, t) {
                        var n = a.request(e, t);
                        return n.end(), n
                    }, a.Agent = function() {}, a.Agent.defaultMaxSockets = 4, a.STATUS_CODES = i, a.METHODS = ["CHECKOUT", "CONNECT", "COPY", "DELETE", "GET", "HEAD", "LOCK", "M-SEARCH", "MERGE", "MKACTIVITY", "MKCOL", "MOVE", "NOTIFY", "OPTIONS", "PATCH", "POST", "PROPFIND", "PROPPATCH", "PURGE", "PUT", "REPORT", "SEARCH", "SUBSCRIBE", "TRACE", "UNLOCK", "UNSUBSCRIBE"]
                }).call(this, "undefined" != typeof global ? global : "undefined" != typeof self ? self : "undefined" != typeof window ? window : {})
            }, {
                "./lib/request": 41,
                "builtin-status-codes": 43,
                url: 45,
                xtend: 152
            }
        ],
        40: [
            function(e, t, n) {
                (function(e) {
                    function t(e) {
                        try {
                            return i.responseType = e, i.responseType === e
                        } catch (t) {}
                        return !1
                    }

                    function r(e) {
                        return "function" == typeof e
                    }
                    n.fetch = r(e.fetch) && r(e.ReadableByteStream), n.blobConstructor = !1;
                    try {
                        new Blob([new ArrayBuffer(1)]), n.blobConstructor = !0
                    } catch (o) {}
                    var i = new e.XMLHttpRequest;
                    i.open("GET", e.location.host ? "/" : "https://example.com");
                    var s = "undefined" != typeof e.ArrayBuffer,
                        a = s && r(e.ArrayBuffer.prototype.slice);
                    n.arraybuffer = s && t("arraybuffer"), n.msstream = !n.fetch && a && t("ms-stream"), n.mozchunkedarraybuffer = !n.fetch && s && t("moz-chunked-arraybuffer"), n.overrideMimeType = r(i.overrideMimeType), n.vbArray = r(e.VBArray), i = null
                }).call(this, "undefined" != typeof global ? global : "undefined" != typeof self ? self : "undefined" != typeof window ? window : {})
            }, {}
        ],
        41: [
            function(e, t, n) {
                (function(n, r, o) {
                    function i(e) {
                        return a.fetch ? "fetch" : a.mozchunkedarraybuffer ? "moz-chunked-arraybuffer" : a.msstream ? "ms-stream" : a.arraybuffer && e ? "arraybuffer" : a.vbArray && e ? "text:vbarray" : "text"
                    }

                    function s(e) {
                        try {
                            var t = e.status;
                            return null !== t && 0 !== t
                        } catch (n) {
                            return !1
                        }
                    }
                    var a = e("./capability"),
                        c = e("inherits"),
                        u = e("./response"),
                        f = e("stream"),
                        d = e("to-arraybuffer"),
                        h = u.IncomingMessage,
                        l = u.readyStates,
                        p = t.exports = function(e) {
                            var t = this;
                            f.Writable.call(t), t._opts = e, t._body = [], t._headers = {}, e.auth && t.setHeader("Authorization", "Basic " + new o(e.auth).toString("base64")),
                            Object.keys(e.headers).forEach(function(n) {
                                t.setHeader(n, e.headers[n])
                            });
                            var n;
                            if ("prefer-streaming" === e.mode) n = !1;
                            else if ("allow-wrong-content-type" === e.mode) n = !a.overrideMimeType;
                            else {
                                if (e.mode && "default" !== e.mode && "prefer-fast" !== e.mode) throw new Error("Invalid value for opts.mode");
                                n = !0
                            }
                            t._mode = i(n), t.on("finish", function() {
                                t._onFinish()
                            })
                        };
                    c(p, f.Writable), p.prototype.setHeader = function(e, t) {
                        var n = this,
                            r = e.toLowerCase(); - 1 === m.indexOf(r) && (n._headers[r] = {
                                name: e,
                                value: t
                            })
                    }, p.prototype.getHeader = function(e) {
                        var t = this;
                        return t._headers[e.toLowerCase()].value
                    }, p.prototype.removeHeader = function(e) {
                        var t = this;
                        delete t._headers[e.toLowerCase()]
                    }, p.prototype._onFinish = function() {
                        var e = this;
                        if (!e._destroyed) {
                            var t, i = e._opts,
                                s = e._headers;
                            if ("POST" !== i.method && "PUT" !== i.method && "PATCH" !== i.method || (t = a.blobConstructor ? new r.Blob(e._body.map(function(e) {
                                return d(e)
                            }), {
                                type: (s["content-type"] || {}).value || ""
                            }) : o.concat(e._body).toString()), "fetch" === e._mode) {
                                var c = Object.keys(s).map(function(e) {
                                    return [s[e].name, s[e].value]
                                });
                                r.fetch(e._opts.url, {
                                    method: e._opts.method,
                                    headers: c,
                                    body: t,
                                    mode: "cors",
                                    credentials: i.withCredentials ? "include" : "same-origin"
                                }).then(function(t) {
                                    e._fetchResponse = t, e._connect()
                                }, function(t) {
                                    e.emit("error", t)
                                })
                            } else {
                                var u = e._xhr = new r.XMLHttpRequest;
                                try {
                                    u.open(e._opts.method, e._opts.url, !0)
                                } catch (f) {
                                    return void n.nextTick(function() {
                                        e.emit("error", f)
                                    })
                                }
                                "responseType" in u && (u.responseType = e._mode.split(":")[0]), "withCredentials" in u && (u.withCredentials = !! i.withCredentials), "text" === e._mode && "overrideMimeType" in u && u.overrideMimeType("text/plain; charset=x-user-defined"), Object.keys(s).forEach(function(e) {
                                    u.setRequestHeader(s[e].name, s[e].value)
                                }), e._response = null, u.onreadystatechange = function() {
                                    switch (u.readyState) {
                                        case l.LOADING:
                                        case l.DONE:
                                            e._onXHRProgress()
                                    }
                                }, "moz-chunked-arraybuffer" === e._mode && (u.onprogress = function() {
                                    e._onXHRProgress()
                                }), u.onerror = function() {
                                    e._destroyed || e.emit("error", new Error("XHR error"))
                                };
                                try {
                                    u.send(t)
                                } catch (f) {
                                    return void n.nextTick(function() {
                                        e.emit("error", f)
                                    })
                                }
                            }
                        }
                    }, p.prototype._onXHRProgress = function() {
                        var e = this;
                        s(e._xhr) && !e._destroyed && (e._response || e._connect(), e._response._onXHRProgress())
                    }, p.prototype._connect = function() {
                        var e = this;
                        e._destroyed || (e._response = new h(e._xhr, e._fetchResponse, e._mode), e.emit("response", e._response))
                    }, p.prototype._write = function(e, t, n) {
                        var r = this;
                        r._body.push(e), n()
                    }, p.prototype.abort = p.prototype.destroy = function() {
                        var e = this;
                        e._destroyed = !0, e._response && (e._response._destroyed = !0), e._xhr && e._xhr.abort()
                    }, p.prototype.end = function(e, t, n) {
                        var r = this;
                        "function" == typeof e && (n = e, e = void 0), f.Writable.prototype.end.call(r, e, t, n)
                    }, p.prototype.flushHeaders = function() {}, p.prototype.setTimeout = function() {}, p.prototype.setNoDelay = function() {}, p.prototype.setSocketKeepAlive = function() {};
                    var m = ["accept-charset", "accept-encoding", "access-control-request-headers", "access-control-request-method", "connection", "content-length", "cookie", "cookie2", "date", "dnt", "expect", "host", "keep-alive", "origin", "referer", "te", "trailer", "transfer-encoding", "upgrade", "user-agent", "via"]
                }).call(this, e("_process"), "undefined" != typeof global ? global : "undefined" != typeof self ? self : "undefined" != typeof window ? window : {}, e("buffer").Buffer)
            }, {
                "./capability": 40,
                "./response": 42,
                _process: 33,
                buffer: 25,
                inherits: 76,
                stream: 38,
                "to-arraybuffer": 44
            }
        ],
        42: [
            function(e, t, n) {
                (function(t, r, o) {
                    var i = e("./capability"),
                        s = e("inherits"),
                        a = e("stream"),
                        c = n.readyStates = {
                            UNSENT: 0,
                            OPENED: 1,
                            HEADERS_RECEIVED: 2,
                            LOADING: 3,
                            DONE: 4
                        }, u = n.IncomingMessage = function(e, n, r) {
                            function s() {
                                h.read().then(function(e) {
                                    if (!c._destroyed) {
                                        if (e.done) return void c.push(null);
                                        c.push(new o(e.value)), s()
                                    }
                                })
                            }
                            var c = this;
                            if (a.Readable.call(c), c._mode = r, c.headers = {}, c.rawHeaders = [], c.trailers = {}, c.rawTrailers = [], c.on("end", function() {
                                t.nextTick(function() {
                                    c.emit("close")
                                })
                            }), "fetch" === r) {
                                c._fetchResponse = n, c.statusCode = n.status, c.statusMessage = n.statusText;
                                for (var u, f, d = n.headers[Symbol.iterator](); u = (f = d.next()).value, !f.done;) c.headers[u[0].toLowerCase()] = u[1], c.rawHeaders.push(u[0], u[1]);
                                var h = n.body.getReader();
                                s()
                            } else {
                                c._xhr = e, c._pos = 0, c.statusCode = e.status, c.statusMessage = e.statusText;
                                var l = e.getAllResponseHeaders().split(/\r?\n/);
                                if (l.forEach(function(e) {
                                    var t = e.match(/^([^:]+):\s*(.*)/);
                                    if (t) {
                                        var n = t[1].toLowerCase();
                                        "set-cookie" === n ? (void 0 === c.headers[n] && (c.headers[n] = []), c.headers[n].push(t[2])) : void 0 !== c.headers[n] ? c.headers[n] += ", " + t[2] : c.headers[n] = t[2], c.rawHeaders.push(t[1], t[2])
                                    }
                                }), c._charset = "x-user-defined", !i.overrideMimeType) {
                                    var p = c.rawHeaders["mime-type"];
                                    if (p) {
                                        var m = p.match(/;\s*charset=([^;])(;|$)/);
                                        m && (c._charset = m[1].toLowerCase())
                                    }
                                    c._charset || (c._charset = "utf-8")
                                }
                            }
                        };
                    s(u, a.Readable), u.prototype._read = function() {}, u.prototype._onXHRProgress = function() {
                        var e = this,
                            t = e._xhr,
                            n = null;
                        switch (e._mode) {
                            case "text:vbarray":
                                if (t.readyState !== c.DONE) break;
                                try {
                                    n = new r.VBArray(t.responseBody).toArray()
                                } catch (i) {}
                                if (null !== n) {
                                    e.push(new o(n));
                                    break
                                }
                            case "text":
                                try {
                                    n = t.responseText
                                } catch (i) {
                                    e._mode = "text:vbarray";
                                    break
                                }
                                if (n.length > e._pos) {
                                    var s = n.substr(e._pos);
                                    if ("x-user-defined" === e._charset) {
                                        for (var a = new o(s.length), u = 0; u < s.length; u++) a[u] = 255 & s.charCodeAt(u);
                                        e.push(a)
                                    } else e.push(s, e._charset);
                                    e._pos = n.length
                                }
                                break;
                            case "arraybuffer":
                                if (t.readyState !== c.DONE) break;
                                n = t.response, e.push(new o(new Uint8Array(n)));
                                break;
                            case "moz-chunked-arraybuffer":
                                if (n = t.response, t.readyState !== c.LOADING || !n) break;
                                e.push(new o(new Uint8Array(n)));
                                break;
                            case "ms-stream":
                                if (n = t.response, t.readyState !== c.LOADING) break;
                                var f = new r.MSStreamReader;
                                f.onprogress = function() {
                                    f.result.byteLength > e._pos && (e.push(new o(new Uint8Array(f.result.slice(e._pos)))), e._pos = f.result.byteLength)
                                }, f.onload = function() {
                                    e.push(null)
                                }, f.readAsArrayBuffer(n)
                        }
                        e._xhr.readyState === c.DONE && "ms-stream" !== e._mode && e.push(null)
                    }
                }).call(this, e("_process"), "undefined" != typeof global ? global : "undefined" != typeof self ? self : "undefined" != typeof window ? window : {}, e("buffer").Buffer)
            }, {
                "./capability": 40,
                _process: 33,
                buffer: 25,
                inherits: 76,
                stream: 38
            }
        ],
        43: [
            function(e, t, n) {
                t.exports = {
                    100: "Continue",
                    101: "Switching Protocols",
                    102: "Processing",
                    200: "OK",
                    201: "Created",
                    202: "Accepted",
                    203: "Non-Authoritative Information",
                    204: "No Content",
                    205: "Reset Content",
                    206: "Partial Content",
                    207: "Multi-Status",
                    208: "Already Reported",
                    226: "IM Used",
                    300: "Multiple Choices",
                    301: "Moved Permanently",
                    302: "Found",
                    303: "See Other",
                    304: "Not Modified",
                    305: "Use Proxy",
                    307: "Temporary Redirect",
                    308: "Permanent Redirect",
                    400: "Bad Request",
                    401: "Unauthorized",
                    402: "Payment Required",
                    403: "Forbidden",
                    404: "Not Found",
                    405: "Method Not Allowed",
                    406: "Not Acceptable",
                    407: "Proxy Authentication Required",
                    408: "Request Timeout",
                    409: "Conflict",
                    410: "Gone",
                    411: "Length Required",
                    412: "Precondition Failed",
                    413: "Payload Too Large",
                    414: "URI Too Long",
                    415: "Unsupported Media Type",
                    416: "Range Not Satisfiable",
                    417: "Expectation Failed",
                    418: "I'm a teapot",
                    421: "Misdirected Request",
                    422: "Unprocessable Entity",
                    423: "Locked",
                    424: "Failed Dependency",
                    425: "Unordered Collection",
                    426: "Upgrade Required",
                    428: "Precondition Required",
                    429: "Too Many Requests",
                    431: "Request Header Fields Too Large",
                    500: "Internal Server Error",
                    501: "Not Implemented",
                    502: "Bad Gateway",
                    503: "Service Unavailable",
                    504: "Gateway Timeout",
                    505: "HTTP Version Not Supported",
                    506: "Variant Also Negotiates",
                    507: "Insufficient Storage",
                    508: "Loop Detected",
                    509: "Bandwidth Limit Exceeded",
                    510: "Not Extended",
                    511: "Network Authentication Required"
                }
            }, {}
        ],
        44: [
            function(e, t, n) {
                var r = e("buffer").Buffer;
                t.exports = function(e) {
                    if (e instanceof Uint8Array) {
                        if (0 === e.byteOffset && e.byteLength === e.buffer.byteLength) return e.buffer;
                        if ("function" == typeof e.buffer.slice) return e.buffer.slice(e.byteOffset, e.byteOffset + e.byteLength)
                    }
                    if (r.isBuffer(e)) {
                        for (var t = new Uint8Array(e.length), n = e.length, o = 0; n > o; o++) t[o] = e[o];
                        return t.buffer
                    }
                    throw new Error("Argument must be a Buffer")
                }
            }, {
                buffer: 25
            }
        ],
        45: [
            function(e, t, n) {
                "use strict";

                function r() {
                    this.protocol = null, this.slashes = null, this.auth = null, this.host = null, this.port = null, this.hostname = null, this.hash = null, this.search = null, this.query = null, this.pathname = null, this.path = null, this.href = null
                }

                function o(e, t, n) {
                    if (e && u.isObject(e) && e instanceof r) return e;
                    var o = new r;
                    return o.parse(e, t, n), o
                }

                function i(e) {
                    return u.isString(e) && (e = o(e)), e instanceof r ? e.format() : r.prototype.format.call(e)
                }

                function s(e, t) {
                    return o(e, !1, !0).resolve(t)
                }

                function a(e, t) {
                    return e ? o(e, !1, !0).resolveObject(t) : t
                }
                var c = e("punycode"),
                    u = e("./util");
                n.parse = o, n.resolve = s, n.resolveObject = a, n.format = i, n.Url = r;
                var f = /^([a-z0-9.+-]+:)/i,
                    d = /:[0-9]*$/,
                    h = /^(\/\/?(?!\/)[^\?\s]*)(\?[^\s]*)?$/,
                    l = ["<", ">", '"', "`", " ", "\r", "\n", " "],
                    p = ["{", "}", "|", "\\", "^", "`"].concat(l),
                    m = ["'"].concat(p),
                    g = ["%", "/", "?", ";", "#"].concat(m),
                    y = ["/", "?", "#"],
                    _ = 255,
                    v = /^[+a-z0-9A-Z_-]{0,63}$/,
                    b = /^([+a-z0-9A-Z_-]{0,63})(.*)$/,
                    w = {
                        javascript: !0,
                        "javascript:": !0
                    }, E = {
                        javascript: !0,
                        "javascript:": !0
                    }, k = {
                        http: !0,
                        https: !0,
                        ftp: !0,
                        gopher: !0,
                        file: !0,
                        "http:": !0,
                        "https:": !0,
                        "ftp:": !0,
                        "gopher:": !0,
                        "file:": !0
                    }, x = e("querystring");
                r.prototype.parse = function(e, t, n) {
                    if (!u.isString(e)) throw new TypeError("Parameter 'url' must be a string, not " + typeof e);
                    var r = e.indexOf("?"),
                        o = -1 !== r && r < e.indexOf("#") ? "?" : "#",
                        i = e.split(o),
                        s = /\\/g;
                    i[0] = i[0].replace(s, "/"), e = i.join(o);
                    var a = e;
                    if (a = a.trim(), !n && 1 === e.split("#").length) {
                        var d = h.exec(a);
                        if (d) return this.path = a, this.href = a, this.pathname = d[1], d[2] ? (this.search = d[2], t ? this.query = x.parse(this.search.substr(1)) : this.query = this.search.substr(1)) : t && (this.search = "", this.query = {}), this
                    }
                    var l = f.exec(a);
                    if (l) {
                        l = l[0];
                        var p = l.toLowerCase();
                        this.protocol = p, a = a.substr(l.length)
                    }
                    if (n || l || a.match(/^\/\/[^@\/]+@[^@\/]+/)) {
                        var S = "//" === a.substr(0, 2);
                        !S || l && E[l] || (a = a.substr(2), this.slashes = !0)
                    }
                    if (!E[l] && (S || l && !k[l])) {
                        for (var I = -1, B = 0; B < y.length; B++) {
                            var A = a.indexOf(y[B]); - 1 !== A && (-1 === I || I > A) && (I = A)
                        }
                        var C, L;
                        L = -1 === I ? a.lastIndexOf("@") : a.lastIndexOf("@", I), -1 !== L && (C = a.slice(0, L), a = a.slice(L + 1), this.auth = decodeURIComponent(C)), I = -1;
                        for (var B = 0; B < g.length; B++) {
                            var A = a.indexOf(g[B]); - 1 !== A && (-1 === I || I > A) && (I = A)
                        } - 1 === I && (I = a.length), this.host = a.slice(0, I), a = a.slice(I), this.parseHost(), this.hostname = this.hostname || "";
                        var T = "[" === this.hostname[0] && "]" === this.hostname[this.hostname.length - 1];
                        if (!T)
                            for (var R = this.hostname.split(/\./), B = 0, U = R.length; U > B; B++) {
                                var P = R[B];
                                if (P && !P.match(v)) {
                                    for (var O = "", M = 0, j = P.length; j > M; M++) O += P.charCodeAt(M) > 127 ? "x" : P[M];
                                    if (!O.match(v)) {
                                        var D = R.slice(0, B),
                                            H = R.slice(B + 1),
                                            N = P.match(b);
                                        N && (D.push(N[1]), H.unshift(N[2])), H.length && (a = "/" + H.join(".") + a), this.hostname = D.join(".");
                                        break
                                    }
                                }
                            }
                        this.hostname.length > _ ? this.hostname = "" : this.hostname = this.hostname.toLowerCase(), T || (this.hostname = c.toASCII(this.hostname));
                        var q = this.port ? ":" + this.port : "",
                            z = this.hostname || "";
                        this.host = z + q, this.href += this.host, T && (this.hostname = this.hostname.substr(1, this.hostname.length - 2), "/" !== a[0] && (a = "/" + a))
                    }
                    if (!w[p])
                        for (var B = 0, U = m.length; U > B; B++) {
                            var W = m[B];
                            if (-1 !== a.indexOf(W)) {
                                var F = encodeURIComponent(W);
                                F === W && (F = escape(W)), a = a.split(W).join(F)
                            }
                        }
                    var Y = a.indexOf("#"); - 1 !== Y && (this.hash = a.substr(Y), a = a.slice(0, Y));
                    var V = a.indexOf("?");
                    if (-1 !== V ? (this.search = a.substr(V), this.query = a.substr(V + 1), t && (this.query = x.parse(this.query)), a = a.slice(0, V)) : t && (this.search = "", this.query = {}), a && (this.pathname = a), k[p] && this.hostname && !this.pathname && (this.pathname = "/"), this.pathname || this.search) {
                        var q = this.pathname || "",
                            $ = this.search || "";
                        this.path = q + $
                    }
                    return this.href = this.format(), this
                }, r.prototype.format = function() {
                    var e = this.auth || "";
                    e && (e = encodeURIComponent(e), e = e.replace(/%3A/i, ":"), e += "@");
                    var t = this.protocol || "",
                        n = this.pathname || "",
                        r = this.hash || "",
                        o = !1,
                        i = "";
                    this.host ? o = e + this.host : this.hostname && (o = e + (-1 === this.hostname.indexOf(":") ? this.hostname : "[" + this.hostname + "]"), this.port && (o += ":" + this.port)), this.query && u.isObject(this.query) && Object.keys(this.query).length && (i = x.stringify(this.query));
                    var s = this.search || i && "?" + i || "";
                    return t && ":" !== t.substr(-1) && (t += ":"), this.slashes || (!t || k[t]) && o !== !1 ? (o = "//" + (o || ""), n && "/" !== n.charAt(0) && (n = "/" + n)) : o || (o = ""), r && "#" !== r.charAt(0) && (r = "#" + r), s && "?" !== s.charAt(0) && (s = "?" + s), n = n.replace(/[?#]/g, function(e) {
                        return encodeURIComponent(e)
                    }), s = s.replace("#", "%23"), t + o + n + s + r
                }, r.prototype.resolve = function(e) {
                    return this.resolveObject(o(e, !1, !0)).format()
                }, r.prototype.resolveObject = function(e) {
                    if (u.isString(e)) {
                        var t = new r;
                        t.parse(e, !1, !0), e = t
                    }
                    for (var n = new r, o = Object.keys(this), i = 0; i < o.length; i++) {
                        var s = o[i];
                        n[s] = this[s]
                    }
                    if (n.hash = e.hash, "" === e.href) return n.href = n.format(), n;
                    if (e.slashes && !e.protocol) {
                        for (var a = Object.keys(e), c = 0; c < a.length; c++) {
                            var f = a[c];
                            "protocol" !== f && (n[f] = e[f])
                        }
                        return k[n.protocol] && n.hostname && !n.pathname && (n.path = n.pathname = "/"), n.href = n.format(), n
                    }
                    if (e.protocol && e.protocol !== n.protocol) {
                        if (!k[e.protocol]) {
                            for (var d = Object.keys(e), h = 0; h < d.length; h++) {
                                var l = d[h];
                                n[l] = e[l]
                            }
                            return n.href = n.format(), n
                        }
                        if (n.protocol = e.protocol, e.host || E[e.protocol]) n.pathname = e.pathname;
                        else {
                            for (var p = (e.pathname || "").split("/"); p.length && !(e.host = p.shift()););
                            e.host || (e.host = ""), e.hostname || (e.hostname = ""), "" !== p[0] && p.unshift(""), p.length < 2 && p.unshift(""), n.pathname = p.join("/")
                        } if (n.search = e.search, n.query = e.query, n.host = e.host || "", n.auth = e.auth, n.hostname = e.hostname || e.host, n.port = e.port, n.pathname || n.search) {
                            var m = n.pathname || "",
                                g = n.search || "";
                            n.path = m + g
                        }
                        return n.slashes = n.slashes || e.slashes, n.href = n.format(), n
                    }
                    var y = n.pathname && "/" === n.pathname.charAt(0),
                        _ = e.host || e.pathname && "/" === e.pathname.charAt(0),
                        v = _ || y || n.host && e.pathname,
                        b = v,
                        w = n.pathname && n.pathname.split("/") || [],
                        p = e.pathname && e.pathname.split("/") || [],
                        x = n.protocol && !k[n.protocol];
                    if (x && (n.hostname = "", n.port = null, n.host && ("" === w[0] ? w[0] = n.host : w.unshift(n.host)), n.host = "", e.protocol && (e.hostname = null, e.port = null, e.host && ("" === p[0] ? p[0] = e.host : p.unshift(e.host)), e.host = null), v = v && ("" === p[0] || "" === w[0])), _) n.host = e.host || "" === e.host ? e.host : n.host, n.hostname = e.hostname || "" === e.hostname ? e.hostname : n.hostname, n.search = e.search, n.query = e.query, w = p;
                    else if (p.length) w || (w = []), w.pop(), w = w.concat(p), n.search = e.search, n.query = e.query;
                    else if (!u.isNullOrUndefined(e.search)) {
                        if (x) {
                            n.hostname = n.host = w.shift();
                            var S = n.host && n.host.indexOf("@") > 0 ? n.host.split("@") : !1;
                            S && (n.auth = S.shift(), n.host = n.hostname = S.shift())
                        }
                        return n.search = e.search, n.query = e.query, u.isNull(n.pathname) && u.isNull(n.search) || (n.path = (n.pathname ? n.pathname : "") + (n.search ? n.search : "")), n.href = n.format(), n
                    }
                    if (!w.length) return n.pathname = null, n.search ? n.path = "/" + n.search : n.path = null, n.href = n.format(), n;
                    for (var I = w.slice(-1)[0], B = (n.host || e.host || w.length > 1) && ("." === I || ".." === I) || "" === I, A = 0, C = w.length; C >= 0; C--) I = w[C], "." === I ? w.splice(C, 1) : ".." === I ? (w.splice(C, 1), A++) : A && (w.splice(C, 1), A--);
                    if (!v && !b)
                        for (; A--; A) w.unshift("..");
                    !v || "" === w[0] || w[0] && "/" === w[0].charAt(0) || w.unshift(""), B && "/" !== w.join("/").substr(-1) && w.push("");
                    var L = "" === w[0] || w[0] && "/" === w[0].charAt(0);
                    if (x) {
                        n.hostname = n.host = L ? "" : w.length ? w.shift() : "";
                        var S = n.host && n.host.indexOf("@") > 0 ? n.host.split("@") : !1;
                        S && (n.auth = S.shift(), n.host = n.hostname = S.shift())
                    }
                    return v = v || n.host && w.length, v && !L && w.unshift(""), w.length ? n.pathname = w.join("/") : (n.pathname = null, n.path = null), u.isNull(n.pathname) && u.isNull(n.search) || (n.path = (n.pathname ? n.pathname : "") + (n.search ? n.search : "")), n.auth = e.auth || n.auth, n.slashes = n.slashes || e.slashes, n.href = n.format(), n
                }, r.prototype.parseHost = function() {
                    var e = this.host,
                        t = d.exec(e);
                    t && (t = t[0], ":" !== t && (this.port = t.substr(1)), e = e.substr(0, e.length - t.length)), e && (this.hostname = e)
                }
            }, {
                "./util": 46,
                punycode: 34,
                querystring: 37
            }
        ],
        46: [
            function(e, t, n) {
                "use strict";
                t.exports = {
                    isString: function(e) {
                        return "string" == typeof e
                    },
                    isObject: function(e) {
                        return "object" == typeof e && null !== e
                    },
                    isNull: function(e) {
                        return null === e
                    },
                    isNullOrUndefined: function(e) {
                        return null == e
                    }
                }
            }, {}
        ],
        47: [
            function(e, t, n) {
                (function(n) {
                    function r(e, t) {
                        return this instanceof r ? (i.call(this), t || (t = {}), "object" == typeof e && (t = e, e = t.size), this.size = e || 512, t.nopad ? this._zeroPadding = !1 : this._zeroPadding = s(t.zeroPadding, !0), this._buffered = [], void(this._bufferedBytes = 0)) : new r(e, t)
                    }
                    var o = e("inherits"),
                        i = e("readable-stream").Transform,
                        s = e("defined");
                    t.exports = r, o(r, i), r.prototype._transform = function(e, t, r) {
                        for (this._bufferedBytes += e.length, this._buffered.push(e); this._bufferedBytes >= this.size;) {
                            var o = n.concat(this._buffered);
                            this._bufferedBytes -= this.size, this.push(o.slice(0, this.size)), this._buffered = [o.slice(this.size, o.length)]
                        }
                        r()
                    }, r.prototype._flush = function() {
                        if (this._bufferedBytes && this._zeroPadding) {
                            var e = new n(this.size - this._bufferedBytes);
                            e.fill(0), this._buffered.push(e), this.push(n.concat(this._buffered)), this._buffered = null
                        } else this._bufferedBytes && (this.push(n.concat(this._buffered)), this._buffered = null);
                        this.push(null)
                    }
                }).call(this, e("buffer").Buffer)
            }, {
                buffer: 25,
                defined: 48,
                inherits: 76,
                "readable-stream": 106
            }
        ],
        48: [
            function(e, t, n) {
                t.exports = function() {
                    for (var e = 0; e < arguments.length; e++)
                        if (void 0 !== arguments[e]) return arguments[e]
                }
            }, {}
        ],
        49: [
            function(e, t, n) {
                function r(e, t, n) {
                    function i(t) {
                        a.destroyed || (e.put(c, t), c += 1)
                    }
                    var a = this;
                    if (!(a instanceof r)) return new r(e, t, n);
                    if (s.Writable.call(a, n), n || (n = {}), !e || !e.put || !e.get) throw new Error("First argument must be an abstract-chunk-store compliant store");
                    if (t = Number(t), !t) throw new Error("Second argument must be a chunk length");
                    a._blockstream = new o(t, {
                        zeroPadding: !1
                    }), a._blockstream.on("data", i).on("error", function(e) {
                        a.destroy(e)
                    });
                    var c = 0;
                    a.on("finish", function() {
                        this._blockstream.end()
                    })
                }
                t.exports = r;
                var o = e("block-stream2"),
                    i = e("inherits"),
                    s = e("readable-stream");
                i(r, s.Writable), r.prototype._write = function(e, t, n) {
                    this._blockstream.write(e, t, n)
                }, r.prototype.destroy = function(e) {
                    this.destroyed || (this.destroyed = !0, e && this.emit("error", e), this.emit("close"))
                }
            }, {
                "block-stream2": 47,
                inherits: 76,
                "readable-stream": 106
            }
        ],
        50: [
            function(e, t, n) {
                t.exports = function r() {
                    for (var e = navigator.hardwareConcurrency || 1, r = [], t = 0; e > t; t++) r.push({
                        model: "",
                        speed: 0,
                        times: {
                            user: 0,
                            nice: 0,
                            sys: 0,
                            idle: 0,
                            irq: 0
                        }
                    });
                    return r
                }
            }, {}
        ],
        51: [
            function(e, t, n) {
                (function(n, r, o) {
                    function i(e, t, n) {
                        return "function" == typeof t ? i(e, null, t) : (t = t ? I(t) : {}, void a(e, t, function(e, r, o) {
                            return e ? n(e) : (t.singleFileTorrent = o, void l(r, t, n))
                        }))
                    }

                    function s(e, t, n) {
                        return "function" == typeof t ? s(e, null, t) : (t = t ? I(t) : {}, void a(e, t, n))
                    }

                    function a(e, t, r) {
                        function i() {
                            P(e.map(function(e) {
                                return function(n) {
                                    var r = {};
                                    if (m(e)) r.getStream = _(e), r.length = e.size;
                                    else if (o.isBuffer(e)) r.getStream = v(e), r.length = e.length;
                                    else {
                                        if (!y(e)) {
                                            if ("string" == typeof e) {
                                                if ("function" != typeof C.stat) throw new Error("filesystem paths do not work in the browser");
                                                var i = a > 1 || u;
                                                return void c(e, i, n)
                                            }
                                            throw new Error("invalid input type")
                                        }
                                        if (!t.pieceLength) throw new Error("must specify `pieceLength` option if input is Stream");
                                        r.getStream = w(e, r), r.length = 0
                                    }
                                    r.path = e.path, n(null, r)
                                }
                            }), function(e, t) {
                                return e ? r(e) : (t = A(t), void r(null, t, u))
                            })
                        }
                        if (Array.isArray(e) && 0 === e.length) throw new Error("invalid input type");
                        g(e) && (e = Array.prototype.slice.call(e)), Array.isArray(e) || (e = [e]), e = e.map(function(e) {
                            return m(e) && "string" == typeof e.path ? e.path : e
                        }), 1 !== e.length || "string" == typeof e[0] || e[0].name || (e[0].name = t.name);
                        var s = null;
                        if (e.forEach(function(t, n) {
                            if ("string" != typeof t) {
                                var r = t.fullPath || t.name;
                                if (!r) throw new Error("missing required `fullPath` or `name` property on input");
                                t.path = r.split("/"), t.path[0] || t.path.shift(), t.path.length < 2 ? s = null : 0 === n && e.length > 1 ? s = t.path[0] : t.path[0] !== s && (s = null)
                            }
                        }), e = e.filter(function(e) {
                            if ("string" == typeof e) return !0;
                            var t = e.path[e.path.length - 1];
                            return d(t) && T.not(t)
                        }), s && e.forEach(function(e) {
                            "string" != typeof e && e.path.shift()
                        }), !t.name && s && (t.name = s), !t.name && e[0] && e[0].name && (t.name = e[0].name), t.name || "string" != typeof e[0] || (t.name = S.basename(e[0])), void 0 === t.name) throw new Error("missing option 'name' and unable to infer it from input[0].name");
                        var a = e.reduce(function(e, t) {
                            return e + Number("string" == typeof t)
                        }, 0),
                            u = 1 === e.length;
                        if (1 === e.length && "string" == typeof e[0]) {
                            if ("function" != typeof C.stat) throw new Error("filesystem paths do not work in the browser");
                            L(e[0], function(e, t) {
                                return e ? r(e) : (u = t, void i())
                            })
                        } else n.nextTick(function() {
                            i()
                        })
                    }

                    function c(e, t, n) {
                        f(e, u, function(r, o) {
                            return r ? n(r) : (o = Array.isArray(o) ? A(o) : [o], e = S.normalize(e), t && (e = e.slice(0, e.lastIndexOf(S.sep) + 1)), e[e.length - 1] !== S.sep && (e += S.sep), o.forEach(function(t) {
                                t.getStream = b(t.path), t.path = t.path.replace(e, "").split(S.sep)
                            }), void n(null, o))
                        })
                    }

                    function u(e, t) {
                        t = U(t), C.stat(e, function(n, r) {
                            if (n) return t(n);
                            var o = {
                                length: r.size,
                                path: e
                            };
                            t(null, o)
                        })
                    }

                    function f(e, t, n) {
                        C.readdir(e, function(r, o) {
                            r && "ENOTDIR" === r.code ? t(e, n) : r ? n(r) : P(o.filter(d).filter(T.not).map(function(n) {
                                return function(r) {
                                    f(S.join(e, n), t, r)
                                }
                            }), n)
                        })
                    }

                    function d(e) {
                        return "." !== e[0]
                    }

                    function h(e, t, n) {
                        function r(e) {
                            f += e.length;
                            var t = l;
                            O(e, function(e) {
                                u[t] = e, h -= 1, c()
                            }), h += 1, l += 1
                        }

                        function i() {
                            p = !0, c()
                        }

                        function s(e) {
                            a(), n(e)
                        }

                        function a() {
                            m.removeListener("error", s), g.removeListener("data", r), g.removeListener("end", i), g.removeListener("error", s)
                        }

                        function c() {
                            p && 0 === h && (a(), n(null, new o(u.join(""), "hex"), f))
                        }
                        n = U(n);
                        var u = [],
                            f = 0,
                            d = e.map(function(e) {
                                return e.getStream
                            }),
                            h = 0,
                            l = 0,
                            p = !1,
                            m = new R(d),
                            g = new k(t, {
                                zeroPadding: !1
                            });
                        m.on("error", s), m.pipe(g).on("data", r).on("end", i).on("error", s)
                    }

                    function l(e, n, o) {
                        var i = n.announceList;
                        i || ("string" == typeof n.announce ? i = [
                            [n.announce]
                        ] : Array.isArray(n.announce) && (i = n.announce.map(function(e) {
                            return [e]
                        }))), i || (i = []), r.WEBTORRENT_ANNOUNCE && ("string" == typeof r.WEBTORRENT_ANNOUNCE ? i.push([
                            [r.WEBTORRENT_ANNOUNCE]
                        ]) : Array.isArray(r.WEBTORRENT_ANNOUNCE) && (i = i.concat(r.WEBTORRENT_ANNOUNCE.map(function(e) {
                            return [e]
                        })))), void 0 === n.announce && void 0 === n.announceList && (i = i.concat(t.exports.announceList)), "string" == typeof n.urlList && (n.urlList = [n.urlList]);
                        var s = {
                            info: {
                                name: n.name
                            },
                            "creation date": Number(n.creationDate) || Date.now(),
                            encoding: "UTF-8"
                        };
                        0 !== i.length && (s.announce = i[0][0], s["announce-list"] = i), void 0 !== n.comment && (s.comment = n.comment), void 0 !== n.createdBy && (s["created by"] = n.createdBy), void 0 !== n["private"] && (s.info["private"] = Number(n["private"])), void 0 !== n.sslCert && (s.info["ssl-cert"] = n.sslCert), void 0 !== n.urlList && (s["url-list"] = n.urlList);
                        var a = n.pieceLength || x(e.reduce(p, 0));
                        s.info["piece length"] = a, h(e, a, function(t, r, i) {
                            return t ? o(t) : (s.info.pieces = r, e.forEach(function(e) {
                                delete e.getStream
                            }), n.singleFileTorrent ? s.info.length = i : s.info.files = e, void o(null, E.encode(s)))
                        })
                    }

                    function p(e, t) {
                        return e + t.length
                    }

                    function m(e) {
                        return "undefined" != typeof Blob && e instanceof Blob
                    }

                    function g(e) {
                        return "function" == typeof FileList && e instanceof FileList
                    }

                    function y(e) {
                        return "object" == typeof e && null != e && "function" == typeof e.pipe
                    }

                    function _(e) {
                        return function() {
                            return new B(e)
                        }
                    }

                    function v(e) {
                        return function() {
                            var t = new M.PassThrough;
                            return t.end(e), t
                        }
                    }

                    function b(e) {
                        return function() {
                            return C.createReadStream(e)
                        }
                    }

                    function w(e, t) {
                        return function() {
                            var n = new M.Transform;
                            return n._transform = function(e, n, r) {
                                t.length += e.length, this.push(e), r()
                            }, e.pipe(n), n
                        }
                    }
                    t.exports = i, t.exports.parseInput = s, t.exports.announceList = [
                        ["udp://tracker.openbittorrent.com:80"],
                        ["udp://tracker.internetwarriors.net:1337"],
                        ["udp://tracker.leechers-paradise.org:6969"],
                        ["udp://tracker.coppersurfer.tk:6969"],
                        ["udp://exodus.desync.com:6969"],
                        ["wss://tracker.webtorrent.io"],
                        ["wss://tracker.btorrent.xyz"],
                        ["wss://tracker.openwebtorrent.com"],
                        ["wss://tracker.fastcast.nz"]
                    ];
                    var E = e("bencode"),
                        k = e("block-stream2"),
                        x = e("piece-length"),
                        S = e("path"),
                        I = e("xtend"),
                        B = e("filestream/read"),
                        A = e("flatten"),
                        C = e("fs"),
                        L = e("is-file"),
                        T = e("junk"),
                        R = e("multistream"),
                        U = e("once"),
                        P = e("run-parallel"),
                        O = e("simple-sha1"),
                        M = e("readable-stream")
                }).call(this, e("_process"), "undefined" != typeof global ? global : "undefined" != typeof self ? self : "undefined" != typeof window ? window : {}, e("buffer").Buffer)
            }, {
                _process: 33,
                bencode: 52,
                "block-stream2": 56,
                buffer: 25,
                "filestream/read": 60,
                flatten: 61,
                fs: 23,
                "is-file": 62,
                junk: 63,
                multistream: 78,
                once: 65,
                path: 32,
                "piece-length": 66,
                "readable-stream": 106,
                "run-parallel": 127,
                "simple-sha1": 135,
                xtend: 152
            }
        ],
        52: [
            function(e, t, n) {
                arguments[4][12][0].apply(n, arguments)
            }, {
                "./lib/decode": 53,
                "./lib/encode": 55,
                dup: 12
            }
        ],
        53: [
            function(e, t, n) {
                arguments[4][13][0].apply(n, arguments)
            }, {
                "./dict": 54,
                buffer: 25,
                dup: 13
            }
        ],
        54: [
            function(e, t, n) {
                arguments[4][14][0].apply(n, arguments)
            }, {
                dup: 14
            }
        ],
        55: [
            function(e, t, n) {
                arguments[4][15][0].apply(n, arguments)
            }, {
                buffer: 25,
                dup: 15
            }
        ],
        56: [
            function(e, t, n) {
                arguments[4][47][0].apply(n, arguments)
            }, {
                buffer: 25,
                defined: 57,
                dup: 47,
                inherits: 76,
                "readable-stream": 106
            }
        ],
        57: [
            function(e, t, n) {
                arguments[4][48][0].apply(n, arguments)
            }, {
                dup: 48
            }
        ],
        58: [
            function(e, t, n) {
                (function(n) {
                    var r = e("is-typedarray").strict;
                    t.exports = function(e) {
                        if (r(e)) {
                            var t = new n(e.buffer);
                            return e.byteLength !== e.buffer.byteLength && (t = t.slice(e.byteOffset, e.byteOffset + e.byteLength)), t
                        }
                        return new n(e)
                    }
                }).call(this, e("buffer").Buffer)
            }, {
                buffer: 25,
                "is-typedarray": 59
            }
        ],
        59: [
            function(e, t, n) {
                function r(e) {
                    return o(e) || i(e)
                }

                function o(e) {
                    return e instanceof Int8Array || e instanceof Int16Array || e instanceof Int32Array || e instanceof Uint8Array || e instanceof Uint8ClampedArray || e instanceof Uint16Array || e instanceof Uint32Array || e instanceof Float32Array || e instanceof Float64Array
                }

                function i(e) {
                    return a[s.call(e)]
                }
                t.exports = r, r.strict = o, r.loose = i;
                var s = Object.prototype.toString,
                    a = {
                        "[object Int8Array]": !0,
                        "[object Int16Array]": !0,
                        "[object Int32Array]": !0,
                        "[object Uint8Array]": !0,
                        "[object Uint8ClampedArray]": !0,
                        "[object Uint16Array]": !0,
                        "[object Uint32Array]": !0,
                        "[object Float32Array]": !0,
                        "[object Float64Array]": !0
                    }
            }, {}
        ],
        60: [
            function(e, t, n) {
                function r(e, t) {
                    var n = this;
                    return this instanceof r ? (t = t || {}, o.call(this, t), this._offset = 0, this._ready = !1, this._file = e, this._size = e.size, this._chunkSize = t.chunkSize || Math.max(this._size / 1e3, 204800), this.reader = new FileReader, void this._generateHeaderBlocks(e, t, function(e, t) {
                        return e ? n.emit("error", e) : (Array.isArray(t) && t.forEach(function(e) {
                            n.push(e)
                        }), n._ready = !0, void n.emit("_ready"))
                    })) : new r(e, t)
                }
                var o = e("readable-stream").Readable,
                    i = e("inherits"),
                    s = e("typedarray-to-buffer");
                i(r, o), t.exports = r, r.prototype._generateHeaderBlocks = function(e, t, n) {
                    n(null, [])
                }, r.prototype._read = function() {
                    if (!this._ready) return void this.once("_ready", this._read.bind(this));
                    var e = this,
                        t = this.reader,
                        n = this._offset,
                        r = this._offset + this._chunkSize;
                    return r > this._size && (r = this._size), n === this._size ? (this.destroy(), void this.push(null)) : (t.onload = function() {
                        e._offset = r, e.push(s(t.result))
                    }, t.onerror = function() {
                        e.emit("error", t.error)
                    }, void t.readAsArrayBuffer(this._file.slice(n, r)))
                }, r.prototype.destroy = function() {
                    if (this._file = null, this.reader) {
                        this.reader.onload = null, this.reader.onerror = null;
                        try {
                            this.reader.abort()
                        } catch (e) {}
                    }
                    this.reader = null
                }
            }, {
                inherits: 76,
                "readable-stream": 106,
                "typedarray-to-buffer": 58
            }
        ],
        61: [
            function(e, t, n) {
                t.exports = function(e, t) {
                    function n(e, r) {
                        return e.reduce(function(e, o) {
                            return Array.isArray(o) && t > r ? e.concat(n(o, r + 1)) : e.concat(o)
                        }, [])
                    }
                    return t = "number" == typeof t ? t : 1 / 0, t ? n(e, 1) : Array.isArray(e) ? e.map(function(e) {
                        return e
                    }) : e
                }
            }, {}
        ],
        62: [
            function(e, t, n) {
                "use strict";

                function r(e) {
                    return o.existsSync(e) && o.statSync(e).isFile()
                }
                var o = e("fs");
                t.exports = function(e, t) {
                    return t ? void o.stat(e, function(e, n) {
                        return e ? t(e) : t(null, n.isFile())
                    }) : r(e)
                }, t.exports.sync = r
            }, {
                fs: 23
            }
        ],
        63: [
            function(e, t, n) {
                "use strict";
                n.re = /^npm-debug\.log$|^\..*\.swp$|^\.DS_Store$|^\.AppleDouble$|^\.LSOverride$|^Icon[\r\?]?|^\._.*|^\.Spotlight-V100$|\.Trashes|^__MACOSX$|~$|^Thumbs\.db$|^ehthumbs\.db$|^Desktop\.ini$/, n.is = function(e) {
                    return n.re.test(e)
                }, n.not = n.isnt = function(e) {
                    return !n.is(e)
                }
            }, {}
        ],
        64: [
            function(e, t, n) {
                arguments[4][20][0].apply(n, arguments)
            }, {
                dup: 20
            }
        ],
        65: [
            function(e, t, n) {
                arguments[4][21][0].apply(n, arguments)
            }, {
                dup: 21,
                wrappy: 64
            }
        ],
        66: [
            function(e, t, n) {
                for (var r = e("closest-to"), o = [], i = 14; 22 >= i; i++) o.push(Math.pow(2, i));
                t.exports = function(e) {
                    return r(e / Math.pow(2, 10), o)
                }
            }, {
                "closest-to": 67
            }
        ],
        67: [
            function(e, t, n) {
                t.exports = function(e, t) {
                    var n = 1 / 0,
                        r = 0,
                        o = null;
                    t.sort(function(e, t) {
                        return e - t
                    });
                    for (var i = 0, s = t.length; s > i && (r = Math.abs(e - t[i]), !(r >= n)); i++) n = r, o = t[i];
                    return o
                }
            }, {}
        ],
        68: [
            function(e, t, n) {
                function r() {
                    return "WebkitAppearance" in document.documentElement.style || window.console && (console.firebug || console.exception && console.table) || navigator.userAgent.toLowerCase().match(/firefox\/(\d+)/) && parseInt(RegExp.$1, 10) >= 31
                }

                function o() {
                    var e = arguments,
                        t = this.useColors;
                    if (e[0] = (t ? "%c" : "") + this.namespace + (t ? " %c" : " ") + e[0] + (t ? "%c " : " ") + "+" + n.humanize(this.diff), !t) return e;
                    var r = "color: " + this.color;
                    e = [e[0], r, "color: inherit"].concat(Array.prototype.slice.call(e, 1));
                    var o = 0,
                        i = 0;
                    return e[0].replace(/%[a-z%]/g, function(e) {
                        "%%" !== e && (o++, "%c" === e && (i = o))
                    }), e.splice(i, 0, r), e
                }

                function i() {
                    return "object" == typeof console && console.log && Function.prototype.apply.call(console.log, console, arguments)
                }

                function s(e) {
                    try {
                        null == e ? n.storage.removeItem("debug") : n.storage.debug = e
                    } catch (t) {}
                }

                function a() {
                    var e;
                    try {
                        e = n.storage.debug
                    } catch (t) {}
                    return e
                }

                function c() {
                    try {
                        return window.localStorage
                    } catch (e) {}
                }
                n = t.exports = e("./debug"), n.log = i, n.formatArgs = o, n.save = s, n.load = a, n.useColors = r, n.storage = "undefined" != typeof chrome && "undefined" != typeof chrome.storage ? chrome.storage.local : c(), n.colors = ["lightseagreen", "forestgreen", "goldenrod", "dodgerblue", "darkorchid", "crimson"], n.formatters.j = function(e) {
                    return JSON.stringify(e)
                }, n.enable(a())
            }, {
                "./debug": 69
            }
        ],
        69: [
            function(e, t, n) {
                function r() {
                    return n.colors[f++ % n.colors.length]
                }

                function o(e) {
                    function t() {}

                    function o() {
                        var e = o,
                            t = +new Date,
                            i = t - (u || t);
                        e.diff = i, e.prev = u, e.curr = t, u = t, null == e.useColors && (e.useColors = n.useColors()), null == e.color && e.useColors && (e.color = r());
                        var s = Array.prototype.slice.call(arguments);
                        s[0] = n.coerce(s[0]), "string" != typeof s[0] && (s = ["%o"].concat(s));
                        var a = 0;
                        s[0] = s[0].replace(/%([a-z%])/g, function(t, r) {
                            if ("%%" === t) return t;
                            a++;
                            var o = n.formatters[r];
                            if ("function" == typeof o) {
                                var i = s[a];
                                t = o.call(e, i), s.splice(a, 1), a--
                            }
                            return t
                        }), "function" == typeof n.formatArgs && (s = n.formatArgs.apply(e, s));
                        var c = o.log || n.log || console.log.bind(console);
                        c.apply(e, s)
                    }
                    t.enabled = !1, o.enabled = !0;
                    var i = n.enabled(e) ? o : t;
                    return i.namespace = e, i
                }

                function i(e) {
                    n.save(e);
                    for (var t = (e || "").split(/[\s,]+/), r = t.length, o = 0; r > o; o++) t[o] && (e = t[o].replace(/\*/g, ".*?"), "-" === e[0] ? n.skips.push(new RegExp("^" + e.substr(1) + "$")) : n.names.push(new RegExp("^" + e + "$")))
                }

                function s() {
                    n.enable("")
                }

                function a(e) {
                    var t, r;
                    for (t = 0, r = n.skips.length; r > t; t++)
                        if (n.skips[t].test(e)) return !1;
                    for (t = 0, r = n.names.length; r > t; t++)
                        if (n.names[t].test(e)) return !0;
                    return !1
                }

                function c(e) {
                    return e instanceof Error ? e.stack || e.message : e
                }
                n = t.exports = o, n.coerce = c, n.disable = s, n.enable = i, n.enabled = a, n.humanize = e("ms"), n.names = [], n.skips = [], n.formatters = {};
                var u, f = 0
            }, {
                ms: 70
            }
        ],
        70: [
            function(e, t, n) {
                function r(e) {
                    if (e = "" + e, !(e.length > 1e4)) {
                        var t = /^((?:\d+)?\.?\d+) *(milliseconds?|msecs?|ms|seconds?|secs?|s|minutes?|mins?|m|hours?|hrs?|h|days?|d|years?|yrs?|y)?$/i.exec(e);
                        if (t) {
                            var n = parseFloat(t[1]),
                                r = (t[2] || "ms").toLowerCase();
                            switch (r) {
                                case "years":
                                case "year":
                                case "yrs":
                                case "yr":
                                case "y":
                                    return n * d;
                                case "days":
                                case "day":
                                case "d":
                                    return n * f;
                                case "hours":
                                case "hour":
                                case "hrs":
                                case "hr":
                                case "h":
                                    return n * u;
                                case "minutes":
                                case "minute":
                                case "mins":
                                case "min":
                                case "m":
                                    return n * c;
                                case "seconds":
                                case "second":
                                case "secs":
                                case "sec":
                                case "s":
                                    return n * a;
                                case "milliseconds":
                                case "millisecond":
                                case "msecs":
                                case "msec":
                                case "ms":
                                    return n
                            }
                        }
                    }
                }

                function o(e) {
                    return e >= f ? Math.round(e / f) + "d" : e >= u ? Math.round(e / u) + "h" : e >= c ? Math.round(e / c) + "m" : e >= a ? Math.round(e / a) + "s" : e + "ms"
                }

                function i(e) {
                    return s(e, f, "day") || s(e, u, "hour") || s(e, c, "minute") || s(e, a, "second") || e + " ms"
                }

                function s(e, t, n) {
                    return t > e ? void 0 : 1.5 * t > e ? Math.floor(e / t) + " " + n : Math.ceil(e / t) + " " + n + "s"
                }
                var a = 1e3,
                    c = 60 * a,
                    u = 60 * c,
                    f = 24 * u,
                    d = 365.25 * f;
                t.exports = function(e, t) {
                    return t = t || {}, "string" == typeof e ? r(e) : t["long"] ? i(e) : o(e)
                }
            }, {}
        ],
        71: [
            function(e, t, n) {
                var r = e("once"),
                    o = function() {}, i = function(e) {
                        return e.setHeader && "function" == typeof e.abort
                    }, s = function(e) {
                        return e.stdio && Array.isArray(e.stdio) && 3 === e.stdio.length
                    }, a = function(e, t, n) {
                        if ("function" == typeof t) return a(e, null, t);
                        t || (t = {}), n = r(n || o);
                        var c = e._writableState,
                            u = e._readableState,
                            f = t.readable || t.readable !== !1 && e.readable,
                            d = t.writable || t.writable !== !1 && e.writable,
                            h = function() {
                                e.writable || l()
                            }, l = function() {
                                d = !1, f || n()
                            }, p = function() {
                                f = !1, d || n()
                            }, m = function(e) {
                                n(e ? new Error("exited with error code: " + e) : null)
                            }, g = function() {
                                return (!f || u && u.ended) && (!d || c && c.ended) ? void 0 : n(new Error("premature close"))
                            }, y = function() {
                                e.req.on("finish", l)
                            };
                        return i(e) ? (e.on("complete", l), e.on("abort", g), e.req ? y() : e.on("request", y)) : d && !c && (e.on("end", h), e.on("close", h)), s(e) && e.on("exit", m), e.on("end", p), e.on("finish", l), t.error !== !1 && e.on("error", n), e.on("close", g),
                        function() {
                            e.removeListener("complete", l), e.removeListener("abort", g), e.removeListener("request", y), e.req && e.req.removeListener("finish", l), e.removeListener("end", h), e.removeListener("close", h), e.removeListener("finish", l), e.removeListener("exit", m), e.removeListener("end", p), e.removeListener("error", n), e.removeListener("close", g)
                        }
                    };
                t.exports = a
            }, {
                once: 73
            }
        ],
        72: [
            function(e, t, n) {
                arguments[4][20][0].apply(n, arguments)
            }, {
                dup: 20
            }
        ],
        73: [
            function(e, t, n) {
                arguments[4][21][0].apply(n, arguments)
            }, {
                dup: 21,
                wrappy: 72
            }
        ],
        74: [
            function(e, t, n) {
                var r = t.exports = function(e, t) {
                    if (t || (t = 16), void 0 === e && (e = 128), 0 >= e) return "0";
                    for (var n = Math.log(Math.pow(2, e)) / Math.log(t), o = 2; n === 1 / 0; o *= 2) n = Math.log(Math.pow(2, e / o)) / Math.log(t) * o;
                    for (var i = n - Math.floor(n), s = "", o = 0; o < Math.floor(n); o++) {
                        var a = Math.floor(Math.random() * t).toString(t);
                        s = a + s
                    }
                    if (i) {
                        var c = Math.pow(t, i),
                            a = Math.floor(Math.random() * c).toString(t);
                        s = a + s
                    }
                    var u = parseInt(s, t);
                    return u !== 1 / 0 && u >= Math.pow(2, e) ? r(e, t) : s
                };
                r.rack = function(e, t, n) {
                    var o = function(o) {
                        var s = 0;
                        do {
                            if (s++ > 10) {
                                if (!n) throw new Error("too many ID collisions, use more bits");
                                e += n
                            }
                            var a = r(e, t)
                        } while (Object.hasOwnProperty.call(i, a));
                        return i[a] = o, a
                    }, i = o.hats = {};
                    return o.get = function(e) {
                        return o.hats[e]
                    }, o.set = function(e, t) {
                        return o.hats[e] = t, o
                    }, o.bits = e || 128, o.base = t || 16, o
                }
            }, {}
        ],
        75: [
            function(e, t, n) {
                (function(e) {
                    function n(e) {
                        if (!(this instanceof n)) return new n(e);
                        if (this.store = e, this.chunkLength = e.chunkLength, !this.store || !this.store.get || !this.store.put) throw new Error("First argument must be abstract-chunk-store compliant");
                        this.mem = []
                    }

                    function r(t, n, r) {
                        e.nextTick(function() {
                            t && t(n, r)
                        })
                    }
                    t.exports = n, n.prototype.put = function(e, t, n) {
                        var r = this;
                        r.mem[e] = t, r.store.put(e, t, function(t) {
                            r.mem[e] = null, n && n(t)
                        })
                    }, n.prototype.get = function(e, t, n) {
                        if ("function" == typeof t) return this.get(e, null, t);
                        var o = t && t.offset || 0,
                            i = t && t.length && o + t.length,
                            s = this.mem[e];
                        return s ? r(n, null, t ? s.slice(o, i) : s) : void this.store.get(e, t, n)
                    }, n.prototype.close = function(e) {
                        this.store.close(e)
                    }, n.prototype.destroy = function(e) {
                        this.store.destroy(e)
                    }
                }).call(this, e("_process"))
            }, {
                _process: 33
            }
        ],
        76: [
            function(e, t, n) {
                "function" == typeof Object.create ? t.exports = function(e, t) {
                    e.super_ = t, e.prototype = Object.create(t.prototype, {
                        constructor: {
                            value: e,
                            enumerable: !1,
                            writable: !0,
                            configurable: !0
                        }
                    })
                } : t.exports = function(e, t) {
                    e.super_ = t;
                    var n = function() {};
                    n.prototype = t.prototype, e.prototype = new n, e.prototype.constructor = e
                }
            }, {}
        ],
        77: [
            function(e, t, n) {
                (function(e) {
                    function n(e, t) {
                        if (!(this instanceof n)) return new n(e, t);
                        if (t || (t = {}), this.chunkLength = Number(e), !this.chunkLength) throw new Error("First argument must be a chunk length");
                        this.chunks = [], this.closed = !1, this.length = Number(t.length) || 1 / 0, this.length !== 1 / 0 && (this.lastChunkLength = this.length % this.chunkLength || this.chunkLength, this.lastChunkIndex = Math.ceil(this.length / this.chunkLength) - 1)
                    }

                    function r(t, n, r) {
                        e.nextTick(function() {
                            t && t(n, r)
                        })
                    }
                    t.exports = n, n.prototype.put = function(e, t, n) {
                        if (this.closed) return r(n, new Error("Storage is closed"));
                        var o = e === this.lastChunkIndex;
                        return o && t.length !== this.lastChunkLength ? r(n, new Error("Last chunk length must be " + this.lastChunkLength)) : o || t.length === this.chunkLength ? (this.chunks[e] = t, void r(n, null)) : r(n, new Error("Chunk length must be " + this.chunkLength))
                    }, n.prototype.get = function(e, t, n) {
                        if ("function" == typeof t) return this.get(e, null, t);
                        if (this.closed) return r(n, new Error("Storage is closed"));
                        var o = this.chunks[e];
                        if (!o) return r(n, new Error("Chunk not found"));
                        if (!t) return r(n, null, o);
                        var i = t.offset || 0,
                            s = t.length || o.length - i;
                        r(n, null, o.slice(i, s + i))
                    }, n.prototype.close = n.prototype.destroy = function(e) {
                        return this.closed ? r(e, new Error("Storage is closed")) : (this.closed = !0, this.chunks = null, void r(e, null))
                    }
                }).call(this, e("_process"))
            }, {
                _process: 33
            }
        ],
        78: [
            function(e, t, n) {
                function r(e, t) {
                    return this instanceof r ? (s.Readable.call(this, t), this.destroyed = !1, this._drained = !1, this._forwarding = !1, this._current = null, this._queue = "function" == typeof e ? e : e.map(o), void this._next()) : new r(e, t)
                }

                function o(e) {
                    if (!e || "function" == typeof e || e._readableState) return e;
                    var t = (new s.Readable).wrap(e);
                    return e.destroy && (t.destroy = e.destroy.bind(e)), t
                }
                t.exports = r;
                var i = e("inherits"),
                    s = e("readable-stream");
                i(r, s.Readable), r.obj = function(e) {
                    return new r(e, {
                        objectMode: !0,
                        highWaterMark: 16
                    })
                }, r.prototype._read = function() {
                    this._drained = !0, this._forward()
                }, r.prototype._forward = function() {
                    if (!this._forwarding && this._drained && this._current) {
                        this._forwarding = !0;
                        for (var e; null !== (e = this._current.read());) this._drained = this.push(e);
                        this._forwarding = !1
                    }
                }, r.prototype.destroy = function(e) {
                    this.destroyed || (this.destroyed = !0, this._current && this._current.destroy && this._current.destroy(), "function" != typeof this._queue && this._queue.forEach(function(e) {
                        e.destroy && e.destroy()
                    }), e && this.emit("error", e), this.emit("close"))
                }, r.prototype._next = function() {
                    var e = this;
                    if (e._current = null, "function" == typeof e._queue) e._queue(function(t, n) {
                        return t ? e.destroy(t) : void e._gotNextStream(o(n))
                    });
                    else {
                        var t = e._queue.shift();
                        "function" == typeof t && (t = o(t())), e._gotNextStream(t)
                    }
                }, r.prototype._gotNextStream = function(e) {
                    function t() {
                        i._forward()
                    }

                    function n() {
                        e._readableState.ended || i.destroy()
                    }

                    function r() {
                        i._current = null, e.removeListener("readable", t), e.removeListener("end", r), e.removeListener("error", o), e.removeListener("close", n), i._next()
                    }

                    function o(e) {
                        i.destroy(e)
                    }
                    var i = this;
                    return e ? (i._current = e, i._forward(), e.on("readable", t), e.on("end", r), e.on("error", o), void e.on("close", n)) : (i.push(null), void i.destroy())
                }
            }, {
                inherits: 76,
                "readable-stream": 106
            }
        ],
        79: [
            function(e, t, n) {
                (function(n, r) {
                    function o(e) {
                        if ("string" == typeof e && /magnet:/.test(e)) return f(e);
                        if ("string" == typeof e && (/^[a-f0-9]{40}$/i.test(e) || /^[a-z2-7]{32}$/i.test(e))) return f("magnet:?xt=urn:btih:" + e);
                        if (n.isBuffer(e) && 20 === e.length) return f("magnet:?xt=urn:btih:" + e.toString("hex"));
                        if (n.isBuffer(e)) return d(e);
                        if (e && e.infoHash) return e.announce || (e.announce = []), "string" == typeof e.announce && (e.announce = [e.announce]), e.urlList || (e.urlList = []), e;
                        throw new Error("Invalid torrent identifier")
                    }

                    function i(e, t) {
                        function n(e) {
                            try {
                                i = o(e)
                            } catch (n) {
                                return t(n)
                            }
                            i && i.infoHash ? t(null, i) : t(new Error("Invalid torrent identifier"))
                        }
                        var i;
                        if ("function" != typeof t) throw new Error("second argument must be a Function");
                        try {
                            i = o(e)
                        } catch (f) {}
                        i && i.infoHash ? r.nextTick(function() {
                            t(null, i)
                        }) : s(e) ? a(e, function(e, r) {
                            return e ? t(new Error("Error converting Blob: " + e.message)) : void n(r)
                        }) : "function" == typeof u && /^https?:/.test(e) ? u.concat({
                            url: e,
                            headers: {
                                "user-agent": "WebTorrent (http://webtorrent.io)"
                            }
                        }, function(e, r, o) {
                            return e ? t(new Error("Error downloading torrent: " + e.message)) : void n(o)
                        }) : "function" == typeof c.readFile && "string" == typeof e ? c.readFile(e, function(e, r) {
                            return e ? t(new Error("Invalid torrent identifier")) : void n(r)
                        }) : r.nextTick(function() {
                            t(new Error("Invalid torrent identifier"))
                        })
                    }

                    function s(e) {
                        return "undefined" != typeof Blob && e instanceof Blob
                    }
                    t.exports = o, t.exports.remote = i;
                    var a = e("blob-to-buffer"),
                        c = e("fs"),
                        u = e("simple-get"),
                        f = e("magnet-uri"),
                        d = e("parse-torrent-file");
                    t.exports.toMagnetURI = f.encode, t.exports.toTorrentFile = d.encode
                }).call(this, {
                    isBuffer: e("../browserify/node_modules/insert-module-globals/node_modules/is-buffer/index.js")
                }, e("_process"))
            }, {
                "../browserify/node_modules/insert-module-globals/node_modules/is-buffer/index.js": 31,
                _process: 33,
                "blob-to-buffer": 80,
                fs: 23,
                "magnet-uri": 81,
                "parse-torrent-file": 84,
                "simple-get": 128
            }
        ],
        80: [
            function(e, t, n) {
                (function(e) {
                    t.exports = function(t, n) {
                        function r(t) {
                            o.removeEventListener("loadend", r, !1), t.error ? n(t.error) : n(null, new e(o.result))
                        }
                        if ("undefined" == typeof Blob || !(t instanceof Blob)) throw new Error("first argument must be a Blob");
                        if ("function" != typeof n) throw new Error("second argument must be a function");
                        var o = new FileReader;
                        o.addEventListener("loadend", r, !1), o.readAsArrayBuffer(t)
                    }
                }).call(this, e("buffer").Buffer)
            }, {
                buffer: 25
            }
        ],
        81: [
            function(e, t, n) {
                (function(n) {
                    function r(e) {
                        var t = {}, r = e.split("magnet:?")[1],
                            o = r && r.length >= 0 ? r.split("&") : [];
                        o.forEach(function(e) {
                            var n = e.split("=");
                            if (2 === n.length) {
                                var r = n[0],
                                    o = n[1];
                                if ("dn" === r && (o = decodeURIComponent(o).replace(/\+/g, " ")), "tr" !== r && "xs" !== r && "as" !== r && "ws" !== r || (o = decodeURIComponent(o)), "kt" === r && (o = decodeURIComponent(o).split("+")), t[r])
                                    if (Array.isArray(t[r])) t[r].push(o);
                                    else {
                                        var i = t[r];
                                        t[r] = [i, o]
                                    } else t[r] = o
                            }
                        });
                        var s;
                        if (t.xt) {
                            var c = Array.isArray(t.xt) ? t.xt : [t.xt];
                            c.forEach(function(e) {
                                if (s = e.match(/^urn:btih:(.{40})/)) t.infoHash = s[1].toLowerCase();
                                else if (s = e.match(/^urn:btih:(.{32})/)) {
                                    var r = i.decode(s[1]);
                                    t.infoHash = new n(r, "binary").toString("hex")
                                }
                            })
                        }
                        return t.infoHash && (t.infoHashBuffer = new n(t.infoHash, "hex")), t.dn && (t.name = t.dn), t.kt && (t.keywords = t.kt), "string" == typeof t.tr ? t.announce = [t.tr] : Array.isArray(t.tr) ? t.announce = t.tr : t.announce = [], t.urlList = [], ("string" == typeof t.as || Array.isArray(t.as)) && (t.urlList = t.urlList.concat(t.as)), ("string" == typeof t.ws || Array.isArray(t.ws)) && (t.urlList = t.urlList.concat(t.ws)), a(t.announce), a(t.urlList), t
                    }

                    function o(e) {
                        e = s(e), e.infoHashBuffer && (e.xt = "urn:btih:" + e.infoHashBuffer.toString("hex")), e.infoHash && (e.xt = "urn:btih:" + e.infoHash), e.name && (e.dn = e.name), e.keywords && (e.kt = e.keywords), e.announce && (e.tr = e.announce), e.urlList && (e.ws = e.urlList, delete e.as);
                        var t = "magnet:?";
                        return Object.keys(e).filter(function(e) {
                            return 2 === e.length
                        }).forEach(function(n, r) {
                            var o = Array.isArray(e[n]) ? e[n] : [e[n]];
                            o.forEach(function(e, o) {
                                !(r > 0 || o > 0) || "kt" === n && 0 !== o || (t += "&"), "dn" === n && (e = encodeURIComponent(e).replace(/%20/g, "+")), "tr" !== n && "xs" !== n && "as" !== n && "ws" !== n || (e = encodeURIComponent(e)), "kt" === n && (e = encodeURIComponent(e)), t += "kt" === n && o > 0 ? "+" + e : n + "=" + e
                            })
                        }), t
                    }
                    t.exports = r, t.exports.decode = r, t.exports.encode = o;
                    var i = e("thirty-two"),
                        s = e("xtend"),
                        a = e("uniq")
                }).call(this, e("buffer").Buffer)
            }, {
                buffer: 25,
                "thirty-two": 82,
                uniq: 146,
                xtend: 152
            }
        ],
        82: [
            function(e, t, n) {
                var r = e("./thirty-two");
                n.encode = r.encode, n.decode = r.decode
            }, {
                "./thirty-two": 83
            }
        ],
        83: [
            function(e, t, n) {
                (function(e) {
                    function t(e) {
                        var t = Math.floor(e.length / 5);
                        return e.length % 5 == 0 ? t : t + 1
                    }
                    var r = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567",
                        o = [255, 255, 26, 27, 28, 29, 30, 31, 255, 255, 255, 255, 255, 255, 255, 255, 255, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 255, 255, 255, 255, 255, 255, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 255, 255, 255, 255, 255];
                    n.encode = function(n) {
                        e.isBuffer(n) || (n = new e(n));
                        for (var o = 0, i = 0, s = 0, a = 0, c = new e(8 * t(n)); o < n.length;) {
                            var u = n[o];
                            s > 3 ? (a = u & 255 >> s, s = (s + 5) % 8, a = a << s | (o + 1 < n.length ? n[o + 1] : 0) >> 8 - s, o++) : (a = u >> 8 - (s + 5) & 31, s = (s + 5) % 8, 0 == s && o++), c[i] = r.charCodeAt(a), i++
                        }
                        for (o = i; o < c.length; o++) c[o] = 61;
                        return c
                    }, n.decode = function(t) {
                        var n, r = 0,
                            i = 0,
                            s = 0;
                        e.isBuffer(t) || (t = new e(t));
                        for (var a = new e(Math.ceil(5 * t.length / 8)), c = 0; c < t.length && 61 != t[c]; c++) {
                            var u = t[c] - 48;
                            if (!(u < o.length)) throw new Error("Invalid input - it is not base32 encoded string");
                            i = o[u], 3 >= r ? (r = (r + 5) % 8, 0 == r ? (n |= i, a[s] = n, s++, n = 0) : n |= 255 & i << 8 - r) : (r = (r + 5) % 8, n |= 255 & i >>> r, a[s] = n, s++, n = 255 & i << 8 - r)
                        }
                        return a.slice(0, s)
                    }
                }).call(this, e("buffer").Buffer)
            }, {
                buffer: 25
            }
        ],
        84: [
            function(e, t, n) {
                (function(n) {
                    function r(e) {
                        n.isBuffer(e) && (e = c.decode(e)), a(e.info, "info"), a(e.info["name.utf-8"] || e.info.name, "info.name"), a(e.info["piece length"], "info['piece length']"), a(e.info.pieces, "info.pieces"), e.info.files ? e.info.files.forEach(function(e) {
                            a("number" == typeof e.length, "info.files[0].length"), a(e["path.utf-8"] || e.path, "info.files[0].path")
                        }) : a("number" == typeof e.info.length, "info.length");
                        var t = {};
                        t.info = e.info, t.infoBuffer = c.encode(e.info), t.infoHash = f.sync(t.infoBuffer), t.infoHashBuffer = new n(t.infoHash, "hex"), t.name = (e.info["name.utf-8"] || e.info.name).toString(), void 0 !== e.info["private"] && (t["private"] = !! e.info["private"]), e["creation date"] && (t.created = new Date(1e3 * e["creation date"])), e["created by"] && (t.createdBy = e["created by"].toString()), n.isBuffer(e.comment) && (t.comment = e.comment.toString()), t.announce = [], e["announce-list"] && e["announce-list"].length ? e["announce-list"].forEach(function(e) {
                            e.forEach(function(e) {
                                t.announce.push(e.toString())
                            })
                        }) : e.announce && t.announce.push(e.announce.toString()), n.isBuffer(e["url-list"]) && (e["url-list"] = e["url-list"].length > 0 ? [e["url-list"]] : []), t.urlList = (e["url-list"] || []).map(function(e) {
                            return e.toString()
                        }), d(t.announce), d(t.urlList);
                        var r = e.info.files || [e.info];
                        t.files = r.map(function(e, n) {
                            var o = [].concat(t.name, e["path.utf-8"] || e.path || []).map(function(e) {
                                return e.toString()
                            });
                            return {
                                path: u.join.apply(null, [u.sep].concat(o)).slice(1),
                                name: o[o.length - 1],
                                length: e.length,
                                offset: r.slice(0, n).reduce(i, 0)
                            }
                        }), t.length = r.reduce(i, 0);
                        var o = t.files[t.files.length - 1];
                        return t.pieceLength = e.info["piece length"], t.lastPieceLength = (o.offset + o.length) % t.pieceLength || t.pieceLength, t.pieces = s(e.info.pieces), t
                    }

                    function o(e) {
                        var t = {
                            info: e.info
                        };
                        return t["announce-list"] = e.announce.map(function(e) {
                            return t.announce || (t.announce = e), e = new n(e, "utf8"), [e]
                        }), e.created && (t["creation date"] = e.created.getTime() / 1e3 | 0), e.urlList && (t["url-list"] = e.urlList), c.encode(t)
                    }

                    function i(e, t) {
                        return e + t.length
                    }

                    function s(e) {
                        for (var t = [], n = 0; n < e.length; n += 20) t.push(e.slice(n, n + 20).toString("hex"));
                        return t
                    }

                    function a(e, t) {
                        if (!e) throw new Error("Torrent is missing required field: " + t)
                    }
                    t.exports = r, t.exports.decode = r, t.exports.encode = o;
                    var c = e("bencode"),
                        u = e("path"),
                        f = e("simple-sha1"),
                        d = e("uniq")
                }).call(this, e("buffer").Buffer)
            }, {
                bencode: 85,
                buffer: 25,
                path: 32,
                "simple-sha1": 135,
                uniq: 146
            }
        ],
        85: [
            function(e, t, n) {
                arguments[4][12][0].apply(n, arguments)
            }, {
                "./lib/decode": 86,
                "./lib/encode": 88,
                dup: 12
            }
        ],
        86: [
            function(e, t, n) {
                arguments[4][13][0].apply(n, arguments)
            }, {
                "./dict": 87,
                buffer: 25,
                dup: 13
            }
        ],
        87: [
            function(e, t, n) {
                arguments[4][14][0].apply(n, arguments)
            }, {
                dup: 14
            }
        ],
        88: [
            function(e, t, n) {
                arguments[4][15][0].apply(n, arguments)
            }, {
                buffer: 25,
                dup: 15
            }
        ],
        89: [
            function(e, t, n) {
                var r = e("once"),
                    o = e("end-of-stream"),
                    i = e("fs"),
                    s = function() {}, a = function(e) {
                        return "function" == typeof e
                    }, c = function(e) {
                        return (e instanceof(i.ReadStream || s) || e instanceof(i.WriteStream || s)) && a(e.close)
                    }, u = function(e) {
                        return e.setHeader && a(e.abort)
                    }, f = function(e, t, n, i) {
                        i = r(i);
                        var s = !1;
                        e.on("close", function() {
                            s = !0
                        }), o(e, {
                            readable: t,
                            writable: n
                        }, function(e) {
                            return e ? i(e) : (s = !0, void i())
                        });
                        var f = !1;
                        return function(t) {
                            return s || f ? void 0 : (f = !0, c(e) ? e.close() : u(e) ? e.abort() : a(e.destroy) ? e.destroy() : void i(t || new Error("stream was destroyed")))
                        }
                    }, d = function(e) {
                        e()
                    }, h = function(e, t) {
                        return e.pipe(t)
                    }, l = function() {
                        var e = Array.prototype.slice.call(arguments),
                            t = a(e[e.length - 1] || s) && e.pop() || s;
                        if (Array.isArray(e[0]) && (e = e[0]), e.length < 2) throw new Error("pump requires two streams per minimum");
                        var n, r = e.map(function(o, i) {
                                var s = i < e.length - 1,
                                    a = i > 0;
                                return f(o, s, a, function(e) {
                                    n || (n = e), e && r.forEach(d), s || (r.forEach(d), t(n))
                                })
                            });
                        return e.reduce(h)
                    };
                t.exports = l
            }, {
                "end-of-stream": 71,
                fs: 23,
                once: 91
            }
        ],
        90: [
            function(e, t, n) {
                arguments[4][20][0].apply(n, arguments)
            }, {
                dup: 20
            }
        ],
        91: [
            function(e, t, n) {
                arguments[4][21][0].apply(n, arguments)
            }, {
                dup: 21,
                wrappy: 90
            }
        ],
        92: [
            function(e, t, n) {
                var r = function(e) {
                    var t = 0;
                    return function() {
                        if (t === e.length) return null;
                        var n = e.length - t,
                            r = Math.random() * n | 0,
                            o = e[t + r],
                            i = e[t];
                        return e[t] = o, e[t + r] = i, t++, o
                    }
                };
                t.exports = r
            }, {}
        ],
        93: [
            function(e, t, n) {
                function r(e, t, n) {
                    Array.isArray(n) || (n = [n]);
                    var r = [];
                    return n.forEach(function(n) {
                        var o = function() {
                            var e = [].slice.call(arguments);
                            e.unshift(n), t.emit.apply(t, e)
                        };
                        r.push(o), e.on(n, o)
                    }),
                    function() {
                        n.forEach(function(t, n) {
                            e.removeListener(t, r[n])
                        })
                    }
                }

                function o(e, t) {
                    var n = new i;
                    return r(e, n, t), n
                }
                t.exports = r, t.exports.filter = o;
                var i = e("events").EventEmitter
            }, {
                events: 29
            }
        ],
        94: [
            function(e, t, n) {
                t.exports = e("./lib/_stream_duplex.js")
            }, {
                "./lib/_stream_duplex.js": 95
            }
        ],
        95: [
            function(e, t, n) {
                "use strict";

                function r(e) {
                    return this instanceof r ? (u.call(this, e), f.call(this, e), e && e.readable === !1 && (this.readable = !1), e && e.writable === !1 && (this.writable = !1), this.allowHalfOpen = !0, e && e.allowHalfOpen === !1 && (this.allowHalfOpen = !1), void this.once("end", o)) : new r(e)
                }

                function o() {
                    this.allowHalfOpen || this._writableState.ended || a(i, this)
                }

                function i(e) {
                    e.end()
                }
                var s = Object.keys || function(e) {
                        var t = [];
                        for (var n in e) t.push(n);
                        return t
                    };
                t.exports = r;
                var a = e("process-nextick-args"),
                    c = e("core-util-is");
                c.inherits = e("inherits");
                var u = e("./_stream_readable"),
                    f = e("./_stream_writable");
                c.inherits(r, u);
                for (var d = s(f.prototype), h = 0; h < d.length; h++) {
                    var l = d[h];
                    r.prototype[l] || (r.prototype[l] = f.prototype[l])
                }
            }, {
                "./_stream_readable": 97,
                "./_stream_writable": 99,
                "core-util-is": 100,
                inherits: 76,
                "process-nextick-args": 102
            }
        ],
        96: [
            function(e, t, n) {
                "use strict";

                function r(e) {
                    return this instanceof r ? void o.call(this, e) : new r(e)
                }
                t.exports = r;
                var o = e("./_stream_transform"),
                    i = e("core-util-is");
                i.inherits = e("inherits"), i.inherits(r, o), r.prototype._transform = function(e, t, n) {
                    n(null, e)
                }
            }, {
                "./_stream_transform": 98,
                "core-util-is": 100,
                inherits: 76
            }
        ],
        97: [
            function(e, t, n) {
                (function(n) {
                    "use strict";

                    function r(t, n) {
                        P = P || e("./_stream_duplex"), t = t || {}, this.objectMode = !! t.objectMode, n instanceof P && (this.objectMode = this.objectMode || !! t.readableObjectMode);
                        var r = t.highWaterMark,
                            o = this.objectMode ? 16 : 16384;
                        this.highWaterMark = r || 0 === r ? r : o, this.highWaterMark = ~~this.highWaterMark, this.buffer = [], this.length = 0, this.pipes = null, this.pipesCount = 0, this.flowing = null, this.ended = !1, this.endEmitted = !1, this.reading = !1, this.sync = !0, this.needReadable = !1, this.emittedReadable = !1, this.readableListening = !1, this.defaultEncoding = t.defaultEncoding || "utf8", this.ranOut = !1, this.awaitDrain = 0, this.readingMore = !1, this.decoder = null, this.encoding = null, t.encoding && (U || (U = e("string_decoder/").StringDecoder), this.decoder = new U(t.encoding), this.encoding = t.encoding)
                    }

                    function o(t) {
                        return P = P || e("./_stream_duplex"), this instanceof o ? (this._readableState = new r(t, this), this.readable = !0, t && "function" == typeof t.read && (this._read = t.read), void A.call(this)) : new o(t)
                    }

                    function i(e, t, n, r, o) {
                        var i = u(t, n);
                        if (i) e.emit("error", i);
                        else if (null === n) t.reading = !1, f(e, t);
                        else if (t.objectMode || n && n.length > 0)
                            if (t.ended && !o) {
                                var a = new Error("stream.push() after EOF");
                                e.emit("error", a)
                            } else if (t.endEmitted && o) {
                            var a = new Error("stream.unshift() after end event");
                            e.emit("error", a)
                        } else !t.decoder || o || r || (n = t.decoder.write(n)), o || (t.reading = !1), t.flowing && 0 === t.length && !t.sync ? (e.emit("data", n), e.read(0)) : (t.length += t.objectMode ? 1 : n.length, o ? t.buffer.unshift(n) : t.buffer.push(n), t.needReadable && d(e)), l(e, t);
                        else o || (t.reading = !1);
                        return s(t)
                    }

                    function s(e) {
                        return !e.ended && (e.needReadable || e.length < e.highWaterMark || 0 === e.length)
                    }

                    function a(e) {
                        return e >= O ? e = O : (e--, e |= e >>> 1, e |= e >>> 2, e |= e >>> 4, e |= e >>> 8, e |= e >>> 16, e++), e
                    }

                    function c(e, t) {
                        return 0 === t.length && t.ended ? 0 : t.objectMode ? 0 === e ? 0 : 1 : null === e || isNaN(e) ? t.flowing && t.buffer.length ? t.buffer[0].length : t.length : 0 >= e ? 0 : (e > t.highWaterMark && (t.highWaterMark = a(e)), e > t.length ? t.ended ? t.length : (t.needReadable = !0, 0) : e)
                    }

                    function u(e, t) {
                        var n = null;
                        return B.isBuffer(t) || "string" == typeof t || null === t || void 0 === t || e.objectMode || (n = new TypeError("Invalid non-string/buffer chunk")), n
                    }

                    function f(e, t) {
                        if (!t.ended) {
                            if (t.decoder) {
                                var n = t.decoder.end();
                                n && n.length && (t.buffer.push(n), t.length += t.objectMode ? 1 : n.length)
                            }
                            t.ended = !0, d(e)
                        }
                    }

                    function d(e) {
                        var t = e._readableState;
                        t.needReadable = !1, t.emittedReadable || (T("emitReadable", t.flowing), t.emittedReadable = !0, t.sync ? S(h, e) : h(e))
                    }

                    function h(e) {
                        T("emit readable"), e.emit("readable"), v(e)
                    }

                    function l(e, t) {
                        t.readingMore || (t.readingMore = !0, S(p, e, t))
                    }

                    function p(e, t) {
                        for (var n = t.length; !t.reading && !t.flowing && !t.ended && t.length < t.highWaterMark && (T("maybeReadMore read 0"), e.read(0), n !== t.length);) n = t.length;
                        t.readingMore = !1
                    }

                    function m(e) {
                        return function() {
                            var t = e._readableState;
                            T("pipeOnDrain", t.awaitDrain), t.awaitDrain && t.awaitDrain--, 0 === t.awaitDrain && C(e, "data") && (t.flowing = !0, v(e))
                        }
                    }

                    function g(e) {
                        T("readable nexttick read 0"), e.read(0)
                    }

                    function y(e, t) {
                        t.resumeScheduled || (t.resumeScheduled = !0, S(_, e, t))
                    }

                    function _(e, t) {
                        t.reading || (T("resume read 0"), e.read(0)), t.resumeScheduled = !1, e.emit("resume"), v(e), t.flowing && !t.reading && e.read(0)
                    }

                    function v(e) {
                        var t = e._readableState;
                        if (T("flow", t.flowing), t.flowing)
                            do var n = e.read(); while (null !== n && t.flowing)
                    }

                    function b(e, t) {
                        var n, r = t.buffer,
                            o = t.length,
                            i = !! t.decoder,
                            s = !! t.objectMode;
                        if (0 === r.length) return null;
                        if (0 === o) n = null;
                        else if (s) n = r.shift();
                        else if (!e || e >= o) n = i ? r.join("") : 1 === r.length ? r[0] : B.concat(r, o), r.length = 0;
                        else if (e < r[0].length) {
                            var a = r[0];
                            n = a.slice(0, e), r[0] = a.slice(e)
                        } else if (e === r[0].length) n = r.shift();
                        else {
                            n = i ? "" : new B(e);
                            for (var c = 0, u = 0, f = r.length; f > u && e > c; u++) {
                                var a = r[0],
                                    d = Math.min(e - c, a.length);
                                i ? n += a.slice(0, d) : a.copy(n, c, 0, d), d < a.length ? r[0] = a.slice(d) : r.shift(), c += d
                            }
                        }
                        return n
                    }

                    function w(e) {
                        var t = e._readableState;
                        if (t.length > 0) throw new Error("endReadable called on non-empty stream");
                        t.endEmitted || (t.ended = !0, S(E, t, e))
                    }

                    function E(e, t) {
                        e.endEmitted || 0 !== e.length || (e.endEmitted = !0, t.readable = !1, t.emit("end"))
                    }

                    function k(e, t) {
                        for (var n = 0, r = e.length; r > n; n++) t(e[n], n)
                    }

                    function x(e, t) {
                        for (var n = 0, r = e.length; r > n; n++)
                            if (e[n] === t) return n;
                        return -1
                    }
                    t.exports = o;
                    var S = e("process-nextick-args"),
                        I = e("isarray"),
                        B = e("buffer").Buffer;
                    o.ReadableState = r;
                    var A, C = (e("events"), function(e, t) {
                            return e.listeners(t).length
                        });
                    ! function() {
                        try {
                            A = e("stream")
                        } catch (t) {} finally {
                            A || (A = e("events").EventEmitter)
                        }
                    }();
                    var B = e("buffer").Buffer,
                        L = e("core-util-is");
                    L.inherits = e("inherits");
                    var T, R = e("util");
                    T = R && R.debuglog ? R.debuglog("stream") : function() {};
                    var U;
                    L.inherits(o, A);
                    var P, P;
                    o.prototype.push = function(e, t) {
                        var n = this._readableState;
                        return n.objectMode || "string" != typeof e || (t = t || n.defaultEncoding, t !== n.encoding && (e = new B(e, t), t = "")), i(this, n, e, t, !1)
                    }, o.prototype.unshift = function(e) {
                        var t = this._readableState;
                        return i(this, t, e, "", !0)
                    }, o.prototype.isPaused = function() {
                        return this._readableState.flowing === !1
                    }, o.prototype.setEncoding = function(t) {
                        return U || (U = e("string_decoder/").StringDecoder), this._readableState.decoder = new U(t), this._readableState.encoding = t, this
                    };
                    var O = 8388608;
                    o.prototype.read = function(e) {
                        T("read", e);
                        var t = this._readableState,
                            n = e;
                        if (("number" != typeof e || e > 0) && (t.emittedReadable = !1), 0 === e && t.needReadable && (t.length >= t.highWaterMark || t.ended)) return T("read: emitReadable", t.length, t.ended), 0 === t.length && t.ended ? w(this) : d(this), null;
                        if (e = c(e, t), 0 === e && t.ended) return 0 === t.length && w(this), null;
                        var r = t.needReadable;
                        T("need readable", r), (0 === t.length || t.length - e < t.highWaterMark) && (r = !0, T("length less than watermark", r)), (t.ended || t.reading) && (r = !1, T("reading or ended", r)), r && (T("do read"), t.reading = !0, t.sync = !0, 0 === t.length && (t.needReadable = !0), this._read(t.highWaterMark), t.sync = !1), r && !t.reading && (e = c(n, t));
                        var o;
                        return o = e > 0 ? b(e, t) : null, null === o && (t.needReadable = !0, e = 0), t.length -= e, 0 !== t.length || t.ended || (t.needReadable = !0), n !== e && t.ended && 0 === t.length && w(this), null !== o && this.emit("data", o), o
                    }, o.prototype._read = function(e) {
                        this.emit("error", new Error("not implemented"))
                    }, o.prototype.pipe = function(e, t) {
                        function r(e) {
                            T("onunpipe"), e === d && i()
                        }

                        function o() {
                            T("onend"), e.end()
                        }

                        function i() {
                            T("cleanup"), e.removeListener("close", c), e.removeListener("finish", u), e.removeListener("drain", g), e.removeListener("error", a), e.removeListener("unpipe", r), d.removeListener("end", o), d.removeListener("end", i), d.removeListener("data", s), y = !0, !h.awaitDrain || e._writableState && !e._writableState.needDrain || g()
                        }

                        function s(t) {
                            T("ondata");
                            var n = e.write(t);
                            !1 === n && (1 !== h.pipesCount || h.pipes[0] !== e || 1 !== d.listenerCount("data") || y || (T("false write response, pause", d._readableState.awaitDrain), d._readableState.awaitDrain++), d.pause())
                        }

                        function a(t) {
                            T("onerror", t), f(), e.removeListener("error", a), 0 === C(e, "error") && e.emit("error", t)
                        }

                        function c() {
                            e.removeListener("finish", u), f()
                        }

                        function u() {
                            T("onfinish"), e.removeListener("close", c), f()
                        }

                        function f() {
                            T("unpipe"), d.unpipe(e)
                        }
                        var d = this,
                            h = this._readableState;
                        switch (h.pipesCount) {
                            case 0:
                                h.pipes = e;
                                break;
                            case 1:
                                h.pipes = [h.pipes, e];
                                break;
                            default:
                                h.pipes.push(e)
                        }
                        h.pipesCount += 1, T("pipe count=%d opts=%j", h.pipesCount, t);
                        var l = (!t || t.end !== !1) && e !== n.stdout && e !== n.stderr,
                            p = l ? o : i;
                        h.endEmitted ? S(p) : d.once("end", p), e.on("unpipe", r);
                        var g = m(d);
                        e.on("drain", g);
                        var y = !1;
                        return d.on("data", s), e._events && e._events.error ? I(e._events.error) ? e._events.error.unshift(a) : e._events.error = [a, e._events.error] : e.on("error", a), e.once("close", c), e.once("finish", u), e.emit("pipe", d), h.flowing || (T("pipe resume"), d.resume()), e
                    }, o.prototype.unpipe = function(e) {
                        var t = this._readableState;
                        if (0 === t.pipesCount) return this;
                        if (1 === t.pipesCount) return e && e !== t.pipes ? this : (e || (e = t.pipes), t.pipes = null, t.pipesCount = 0, t.flowing = !1, e && e.emit("unpipe", this), this);
                        if (!e) {
                            var n = t.pipes,
                                r = t.pipesCount;
                            t.pipes = null, t.pipesCount = 0, t.flowing = !1;
                            for (var o = 0; r > o; o++) n[o].emit("unpipe", this);
                            return this
                        }
                        var o = x(t.pipes, e);
                        return -1 === o ? this : (t.pipes.splice(o, 1), t.pipesCount -= 1, 1 === t.pipesCount && (t.pipes = t.pipes[0]), e.emit("unpipe", this), this)
                    }, o.prototype.on = function(e, t) {
                        var n = A.prototype.on.call(this, e, t);
                        if ("data" === e && !1 !== this._readableState.flowing && this.resume(), "readable" === e && this.readable) {
                            var r = this._readableState;
                            r.readableListening || (r.readableListening = !0, r.emittedReadable = !1, r.needReadable = !0, r.reading ? r.length && d(this, r) : S(g, this))
                        }
                        return n
                    }, o.prototype.addListener = o.prototype.on, o.prototype.resume = function() {
                        var e = this._readableState;
                        return e.flowing || (T("resume"), e.flowing = !0, y(this, e)), this
                    }, o.prototype.pause = function() {
                        return T("call pause flowing=%j", this._readableState.flowing), !1 !== this._readableState.flowing && (T("pause"), this._readableState.flowing = !1, this.emit("pause")), this
                    }, o.prototype.wrap = function(e) {
                        var t = this._readableState,
                            n = !1,
                            r = this;
                        e.on("end", function() {
                            if (T("wrapped end"), t.decoder && !t.ended) {
                                var e = t.decoder.end();
                                e && e.length && r.push(e)
                            }
                            r.push(null)
                        }), e.on("data", function(o) {
                            if (T("wrapped data"), t.decoder && (o = t.decoder.write(o)), (!t.objectMode || null !== o && void 0 !== o) && (t.objectMode || o && o.length)) {
                                var i = r.push(o);
                                i || (n = !0, e.pause())
                            }
                        });
                        for (var o in e) void 0 === this[o] && "function" == typeof e[o] && (this[o] = function(t) {
                            return function() {
                                return e[t].apply(e, arguments)
                            }
                        }(o));
                        var i = ["error", "close", "destroy", "pause", "resume"];
                        return k(i, function(t) {
                            e.on(t, r.emit.bind(r, t))
                        }), r._read = function(t) {
                            T("wrapped _read", t), n && (n = !1, e.resume())
                        }, r
                    }, o._fromList = b
                }).call(this, e("_process"))
            }, {
                "./_stream_duplex": 95,
                _process: 33,
                buffer: 25,
                "core-util-is": 100,
                events: 29,
                inherits: 76,
                isarray: 101,
                "process-nextick-args": 102,
                "string_decoder/": 103,
                util: 24
            }
        ],
        98: [
            function(e, t, n) {
                "use strict";

                function r(e) {
                    this.afterTransform = function(t, n) {
                        return o(e, t, n)
                    }, this.needTransform = !1, this.transforming = !1, this.writecb = null, this.writechunk = null
                }

                function o(e, t, n) {
                    var r = e._transformState;
                    r.transforming = !1;
                    var o = r.writecb;
                    if (!o) return e.emit("error", new Error("no writecb in Transform class"));
                    r.writechunk = null, r.writecb = null, null !== n && void 0 !== n && e.push(n), o && o(t);
                    var i = e._readableState;
                    i.reading = !1, (i.needReadable || i.length < i.highWaterMark) && e._read(i.highWaterMark)
                }

                function i(e) {
                    if (!(this instanceof i)) return new i(e);
                    a.call(this, e), this._transformState = new r(this);
                    var t = this;
                    this._readableState.needReadable = !0, this._readableState.sync = !1, e && ("function" == typeof e.transform && (this._transform = e.transform), "function" == typeof e.flush && (this._flush = e.flush)), this.once("prefinish", function() {
                        "function" == typeof this._flush ? this._flush(function(e) {
                            s(t, e)
                        }) : s(t)
                    })
                }

                function s(e, t) {
                    if (t) return e.emit("error", t);
                    var n = e._writableState,
                        r = e._transformState;
                    if (n.length) throw new Error("calling transform done when ws.length != 0");
                    if (r.transforming) throw new Error("calling transform done when still transforming");
                    return e.push(null)
                }
                t.exports = i;
                var a = e("./_stream_duplex"),
                    c = e("core-util-is");
                c.inherits = e("inherits"), c.inherits(i, a), i.prototype.push = function(e, t) {
                    return this._transformState.needTransform = !1, a.prototype.push.call(this, e, t)
                }, i.prototype._transform = function(e, t, n) {
                    throw new Error("not implemented")
                }, i.prototype._write = function(e, t, n) {
                    var r = this._transformState;
                    if (r.writecb = n, r.writechunk = e, r.writeencoding = t, !r.transforming) {
                        var o = this._readableState;
                        (r.needTransform || o.needReadable || o.length < o.highWaterMark) && this._read(o.highWaterMark)
                    }
                }, i.prototype._read = function(e) {
                    var t = this._transformState;
                    null !== t.writechunk && t.writecb && !t.transforming ? (t.transforming = !0, this._transform(t.writechunk, t.writeencoding, t.afterTransform)) : t.needTransform = !0
                }
            }, {
                "./_stream_duplex": 95,
                "core-util-is": 100,
                inherits: 76
            }
        ],
        99: [
            function(e, t, n) {
                "use strict";

                function r() {}

                function o(e, t, n) {
                    this.chunk = e, this.encoding = t, this.callback = n, this.next = null
                }

                function i(t, n) {
                    B = B || e("./_stream_duplex"), t = t || {}, this.objectMode = !! t.objectMode, n instanceof B && (this.objectMode = this.objectMode || !! t.writableObjectMode);
                    var r = t.highWaterMark,
                        o = this.objectMode ? 16 : 16384;
                    this.highWaterMark = r || 0 === r ? r : o, this.highWaterMark = ~~this.highWaterMark, this.needDrain = !1, this.ending = !1, this.ended = !1, this.finished = !1;
                    var i = t.decodeStrings === !1;
                    this.decodeStrings = !i, this.defaultEncoding = t.defaultEncoding || "utf8", this.length = 0, this.writing = !1, this.corked = 0, this.sync = !0, this.bufferProcessing = !1, this.onwrite = function(e) {
                        p(n, e)
                    }, this.writecb = null, this.writelen = 0, this.bufferedRequest = null, this.lastBufferedRequest = null, this.pendingcb = 0, this.prefinished = !1, this.errorEmitted = !1
                }

                function s(t) {
                    return B = B || e("./_stream_duplex"), this instanceof s || this instanceof B ? (this._writableState = new i(t, this), this.writable = !0, t && ("function" == typeof t.write && (this._write = t.write), "function" == typeof t.writev && (this._writev = t.writev)), void S.call(this)) : new s(t)
                }

                function a(e, t) {
                    var n = new Error("write after end");
                    e.emit("error", n), E(t, n)
                }

                function c(e, t, n, r) {
                    var o = !0;
                    if (!k.isBuffer(n) && "string" != typeof n && null !== n && void 0 !== n && !t.objectMode) {
                        var i = new TypeError("Invalid non-string/buffer chunk");
                        e.emit("error", i), E(r, i), o = !1
                    }
                    return o
                }

                function u(e, t, n) {
                    return e.objectMode || e.decodeStrings === !1 || "string" != typeof t || (t = new k(t, n)), t
                }

                function f(e, t, n, r, i) {
                    n = u(t, n, r), k.isBuffer(n) && (r = "buffer");
                    var s = t.objectMode ? 1 : n.length;
                    t.length += s;
                    var a = t.length < t.highWaterMark;
                    if (a || (t.needDrain = !0), t.writing || t.corked) {
                        var c = t.lastBufferedRequest;
                        t.lastBufferedRequest = new o(n, r, i), c ? c.next = t.lastBufferedRequest : t.bufferedRequest = t.lastBufferedRequest
                    } else d(e, t, !1, s, n, r, i);
                    return a
                }

                function d(e, t, n, r, o, i, s) {
                    t.writelen = r, t.writecb = s, t.writing = !0, t.sync = !0, n ? e._writev(o, t.onwrite) : e._write(o, i, t.onwrite), t.sync = !1
                }

                function h(e, t, n, r, o) {
                    --t.pendingcb, n ? E(o, r) : o(r), e._writableState.errorEmitted = !0, e.emit("error", r)
                }

                function l(e) {
                    e.writing = !1, e.writecb = null, e.length -= e.writelen, e.writelen = 0
                }

                function p(e, t) {
                    var n = e._writableState,
                        r = n.sync,
                        o = n.writecb;
                    if (l(n), t) h(e, n, r, t, o);
                    else {
                        var i = _(n);
                        i || n.corked || n.bufferProcessing || !n.bufferedRequest || y(e, n), r ? E(m, e, n, i, o) : m(e, n, i, o)
                    }
                }

                function m(e, t, n, r) {
                    n || g(e, t), t.pendingcb--, r(), b(e, t)
                }

                function g(e, t) {
                    0 === t.length && t.needDrain && (t.needDrain = !1, e.emit("drain"))
                }

                function y(e, t) {
                    t.bufferProcessing = !0;
                    var n = t.bufferedRequest;
                    if (e._writev && n && n.next) {
                        for (var r = [], o = []; n;) o.push(n.callback), r.push(n), n = n.next;
                        t.pendingcb++, t.lastBufferedRequest = null, d(e, t, !0, t.length, r, "", function(e) {
                            for (var n = 0; n < o.length; n++) t.pendingcb--, o[n](e)
                        })
                    } else {
                        for (; n;) {
                            var i = n.chunk,
                                s = n.encoding,
                                a = n.callback,
                                c = t.objectMode ? 1 : i.length;
                            if (d(e, t, !1, c, i, s, a), n = n.next, t.writing) break
                        }
                        null === n && (t.lastBufferedRequest = null)
                    }
                    t.bufferedRequest = n, t.bufferProcessing = !1
                }

                function _(e) {
                    return e.ending && 0 === e.length && null === e.bufferedRequest && !e.finished && !e.writing
                }

                function v(e, t) {
                    t.prefinished || (t.prefinished = !0, e.emit("prefinish"))
                }

                function b(e, t) {
                    var n = _(t);
                    return n && (0 === t.pendingcb ? (v(e, t), t.finished = !0, e.emit("finish")) : v(e, t)), n
                }

                function w(e, t, n) {
                    t.ending = !0, b(e, t), n && (t.finished ? E(n) : e.once("finish", n)), t.ended = !0
                }
                t.exports = s;
                var E = e("process-nextick-args"),
                    k = e("buffer").Buffer;
                s.WritableState = i;
                var x = e("core-util-is");
                x.inherits = e("inherits");
                var S, I = {
                        deprecate: e("util-deprecate")
                    };
                ! function() {
                    try {
                        S = e("stream")
                    } catch (t) {} finally {
                        S || (S = e("events").EventEmitter)
                    }
                }();
                var k = e("buffer").Buffer;
                x.inherits(s, S);
                var B;
                i.prototype.getBuffer = function() {
                    for (var e = this.bufferedRequest, t = []; e;) t.push(e), e = e.next;
                    return t
                },
                function() {
                    try {
                        Object.defineProperty(i.prototype, "buffer", {
                            get: I.deprecate(function() {
                                return this.getBuffer()
                            }, "_writableState.buffer is deprecated. Use _writableState.getBuffer instead.")
                        })
                    } catch (e) {}
                }();
                var B;
                s.prototype.pipe = function() {
                    this.emit("error", new Error("Cannot pipe. Not readable."))
                }, s.prototype.write = function(e, t, n) {
                    var o = this._writableState,
                        i = !1;
                    return "function" == typeof t && (n = t, t = null), k.isBuffer(e) ? t = "buffer" : t || (t = o.defaultEncoding), "function" != typeof n && (n = r), o.ended ? a(this, n) : c(this, o, e, n) && (o.pendingcb++, i = f(this, o, e, t, n)), i
                }, s.prototype.cork = function() {
                    var e = this._writableState;
                    e.corked++
                }, s.prototype.uncork = function() {
                    var e = this._writableState;
                    e.corked && (e.corked--, e.writing || e.corked || e.finished || e.bufferProcessing || !e.bufferedRequest || y(this, e))
                }, s.prototype.setDefaultEncoding = function(e) {
                    if ("string" == typeof e && (e = e.toLowerCase()), !(["hex", "utf8", "utf-8", "ascii", "binary", "base64", "ucs2", "ucs-2", "utf16le", "utf-16le", "raw"].indexOf((e + "").toLowerCase()) > -1)) throw new TypeError("Unknown encoding: " + e);
                    this._writableState.defaultEncoding = e
                }, s.prototype._write = function(e, t, n) {
                    n(new Error("not implemented"))
                }, s.prototype._writev = null, s.prototype.end = function(e, t, n) {
                    var r = this._writableState;
                    "function" == typeof e ? (n = e, e = null, t = null) : "function" == typeof t && (n = t, t = null), null !== e && void 0 !== e && this.write(e, t), r.corked && (r.corked = 1, this.uncork()), r.ending || r.finished || w(this, r, n)
                }
            }, {
                "./_stream_duplex": 95,
                buffer: 25,
                "core-util-is": 100,
                events: 29,
                inherits: 76,
                "process-nextick-args": 102,
                "util-deprecate": 104
            }
        ],
        100: [
            function(e, t, n) {
                (function(e) {
                    function t(e) {
                        return Array.isArray ? Array.isArray(e) : "[object Array]" === g(e)
                    }

                    function r(e) {
                        return "boolean" == typeof e
                    }

                    function o(e) {
                        return null === e
                    }

                    function i(e) {
                        return null == e
                    }

                    function s(e) {
                        return "number" == typeof e
                    }

                    function a(e) {
                        return "string" == typeof e
                    }

                    function c(e) {
                        return "symbol" == typeof e
                    }

                    function u(e) {
                        return void 0 === e
                    }

                    function f(e) {
                        return "[object RegExp]" === g(e)
                    }

                    function d(e) {
                        return "object" == typeof e && null !== e
                    }

                    function h(e) {
                        return "[object Date]" === g(e)
                    }

                    function l(e) {
                        return "[object Error]" === g(e) || e instanceof Error
                    }

                    function p(e) {
                        return "function" == typeof e
                    }

                    function m(e) {
                        return null === e || "boolean" == typeof e || "number" == typeof e || "string" == typeof e || "symbol" == typeof e || "undefined" == typeof e
                    }

                    function g(e) {
                        return Object.prototype.toString.call(e)
                    }
                    n.isArray = t, n.isBoolean = r, n.isNull = o, n.isNullOrUndefined = i, n.isNumber = s, n.isString = a, n.isSymbol = c, n.isUndefined = u, n.isRegExp = f, n.isObject = d, n.isDate = h, n.isError = l, n.isFunction = p, n.isPrimitive = m, n.isBuffer = e.isBuffer
                }).call(this, {
                    isBuffer: e("../../../../browserify/node_modules/insert-module-globals/node_modules/is-buffer/index.js")
                })
            }, {
                "../../../../browserify/node_modules/insert-module-globals/node_modules/is-buffer/index.js": 31
            }
        ],
        101: [
            function(e, t, n) {
                t.exports = Array.isArray || function(e) {
                    return "[object Array]" == Object.prototype.toString.call(e)
                }
            }, {}
        ],
        102: [
            function(e, t, n) {
                (function(e) {
                    "use strict";

                    function n(t) {
                        for (var n = new Array(arguments.length - 1), r = 0; r < n.length;) n[r++] = arguments[r];
                        e.nextTick(function() {
                            t.apply(null, n)
                        })
                    }!e.version || 0 === e.version.indexOf("v0.") || 0 === e.version.indexOf("v1.") && 0 !== e.version.indexOf("v1.8.") ? t.exports = n : t.exports = e.nextTick
                }).call(this, e("_process"))
            }, {
                _process: 33
            }
        ],
        103: [
            function(e, t, n) {
                function r(e) {
                    if (e && !c(e)) throw new Error("Unknown encoding: " + e)
                }

                function o(e) {
                    return e.toString(this.encoding)
                }

                function i(e) {
                    this.charReceived = e.length % 2, this.charLength = this.charReceived ? 2 : 0
                }

                function s(e) {
                    this.charReceived = e.length % 3, this.charLength = this.charReceived ? 3 : 0
                }
                var a = e("buffer").Buffer,
                    c = a.isEncoding || function(e) {
                        switch (e && e.toLowerCase()) {
                            case "hex":
                            case "utf8":
                            case "utf-8":
                            case "ascii":
                            case "binary":
                            case "base64":
                            case "ucs2":
                            case "ucs-2":
                            case "utf16le":
                            case "utf-16le":
                            case "raw":
                                return !0;
                            default:
                                return !1
                        }
                    }, u = n.StringDecoder = function(e) {
                        switch (this.encoding = (e || "utf8").toLowerCase().replace(/[-_]/, ""), r(e), this.encoding) {
                            case "utf8":
                                this.surrogateSize = 3;
                                break;
                            case "ucs2":
                            case "utf16le":
                                this.surrogateSize = 2, this.detectIncompleteChar = i;
                                break;
                            case "base64":
                                this.surrogateSize = 3, this.detectIncompleteChar = s;
                                break;
                            default:
                                return void(this.write = o)
                        }
                        this.charBuffer = new a(6), this.charReceived = 0, this.charLength = 0
                    };
                u.prototype.write = function(e) {
                    for (var t = ""; this.charLength;) {
                        var n = e.length >= this.charLength - this.charReceived ? this.charLength - this.charReceived : e.length;
                        if (e.copy(this.charBuffer, this.charReceived, 0, n), this.charReceived += n, this.charReceived < this.charLength) return "";
                        e = e.slice(n, e.length), t = this.charBuffer.slice(0, this.charLength).toString(this.encoding);
                        var r = t.charCodeAt(t.length - 1);
                        if (!(r >= 55296 && 56319 >= r)) {
                            if (this.charReceived = this.charLength = 0, 0 === e.length) return t;
                            break
                        }
                        this.charLength += this.surrogateSize, t = ""
                    }
                    this.detectIncompleteChar(e);
                    var o = e.length;
                    this.charLength && (e.copy(this.charBuffer, 0, e.length - this.charReceived, o), o -= this.charReceived), t += e.toString(this.encoding, 0, o);
                    var o = t.length - 1,
                        r = t.charCodeAt(o);
                    if (r >= 55296 && 56319 >= r) {
                        var i = this.surrogateSize;
                        return this.charLength += i, this.charReceived += i, this.charBuffer.copy(this.charBuffer, i, 0, i), e.copy(this.charBuffer, 0, 0, i), t.substring(0, o)
                    }
                    return t
                }, u.prototype.detectIncompleteChar = function(e) {
                    for (var t = e.length >= 3 ? 3 : e.length; t > 0; t--) {
                        var n = e[e.length - t];
                        if (1 == t && n >> 5 == 6) {
                            this.charLength = 2;
                            break
                        }
                        if (2 >= t && n >> 4 == 14) {
                            this.charLength = 3;
                            break
                        }
                        if (3 >= t && n >> 3 == 30) {
                            this.charLength = 4;
                            break
                        }
                    }
                    this.charReceived = t
                }, u.prototype.end = function(e) {
                    var t = "";
                    if (e && e.length && (t = this.write(e)), this.charReceived) {
                        var n = this.charReceived,
                            r = this.charBuffer,
                            o = this.encoding;
                        t += r.slice(0, n).toString(o)
                    }
                    return t
                }
            }, {
                buffer: 25
            }
        ],
        104: [
            function(e, t, n) {
                (function(e) {
                    function n(e, t) {
                        function n() {
                            if (!o) {
                                if (r("throwDeprecation")) throw new Error(t);
                                r("traceDeprecation") ? console.trace(t) : console.warn(t), o = !0
                            }
                            return e.apply(this, arguments)
                        }
                        if (r("noDeprecation")) return e;
                        var o = !1;
                        return n
                    }

                    function r(t) {
                        try {
                            if (!e.localStorage) return !1
                        } catch (n) {
                            return !1
                        }
                        var r = e.localStorage[t];
                        return null == r ? !1 : "true" === String(r).toLowerCase()
                    }
                    t.exports = n
                }).call(this, "undefined" != typeof global ? global : "undefined" != typeof self ? self : "undefined" != typeof window ? window : {})
            }, {}
        ],
        105: [
            function(e, t, n) {
                t.exports = e("./lib/_stream_passthrough.js")
            }, {
                "./lib/_stream_passthrough.js": 96
            }
        ],
        106: [
            function(e, t, n) {
                var r = function() {
                    try {
                        return e("stream")
                    } catch (t) {}
                }();
                n = t.exports = e("./lib/_stream_readable.js"), n.Stream = r || n, n.Readable = n, n.Writable = e("./lib/_stream_writable.js"), n.Duplex = e("./lib/_stream_duplex.js"), n.Transform = e("./lib/_stream_transform.js"), n.PassThrough = e("./lib/_stream_passthrough.js")
            }, {
                "./lib/_stream_duplex.js": 95,
                "./lib/_stream_passthrough.js": 96,
                "./lib/_stream_readable.js": 97,
                "./lib/_stream_transform.js": 98,
                "./lib/_stream_writable.js": 99
            }
        ],
        107: [
            function(e, t, n) {
                t.exports = e("./lib/_stream_transform.js")
            }, {
                "./lib/_stream_transform.js": 98
            }
        ],
        108: [
            function(e, t, n) {
                t.exports = e("./lib/_stream_writable.js")
            }, {
                "./lib/_stream_writable.js": 99
            }
        ],
        109: [
            function(e, t, n) {
                function r(e, t, n) {
                    a(e), "string" == typeof t && (t = document.querySelector(t)), i(e, function(n) {
                        if (t.nodeName !== n.toUpperCase()) {
                            var r = l.extname(e.name).toLowerCase();
                            throw new Error('Cannot render "' + r + '" inside a "' + t.nodeName.toLowerCase() + '" element, expected "' + n + '"')
                        }
                        return t
                    }, n)
                }

                function o(e, t, n) {
                    function r(e) {
                        var n = o(e);
                        return n.controls = !0, n.autoplay = !0, n.play(), t.appendChild(n), n
                    }

                    function o(e) {
                        var n = document.createElement(e);
                        return t.appendChild(n), n
                    }
                    if (n || (n = function() {}), a(e), "string" == typeof t && (t = document.querySelector(t)), t && ("VIDEO" === t.nodeName || "AUDIO" === t.nodeName)) throw new Error("Invalid video/audio node argument. Argument must be root element that video/audio tag will be appended to.");
                    i(e, function(e) {
                        return "video" === e || "audio" === e ? r(e) : o(e)
                    }, function(e, t) {
                        e && t && t.remove(), n(e, t)
                    })
                }

                function i(e, t, n) {
                    function r() {
                        function n() {
                            f("Use `videostream` package for " + e.name), d(), x.addEventListener("error", a), x.addEventListener("playing", o), m(e, x)
                        }

                        function r() {
                            f("Use MediaSource API for " + e.name), d(), x.addEventListener("error", u), x.addEventListener("playing", o);
                            var t = new h(x),
                                n = t.createWriteStream(c(e.name));
                            e.createReadStream().pipe(n), I && (x.currentTime = I)
                        }

                        function i() {
                            f("Use Blob URL for " + e.name), d(), x.addEventListener("error", _), x.addEventListener("playing", o), s(e, function(e, t) {
                                return e ? _(e) : (x.src = t, void(I && (x.currentTime = I)))
                            })
                        }

                        function a(e) {
                            f("videostream error: fallback to MediaSource API: %o", e.message || e), x.removeEventListener("error", a), x.removeEventListener("playing", o), r()
                        }

                        function u(e) {
                            f("MediaSource API error: fallback to Blob URL: %o", e.message || e), x.removeEventListener("error", u), x.removeEventListener("playing", o), i()
                        }

                        function d() {
                            x || (x = t(l), x.addEventListener("progress", function() {
                                I = x.currentTime
                            }))
                        }
                        var l = y.indexOf(S) >= 0 ? "video" : "audio";
                        k ? g.indexOf(S) >= 0 ? n() : r() : i()
                    }

                    function o() {
                        x.removeEventListener("playing", o), n(null, x)
                    }

                    function i() {
                        x = t("audio"), s(e, function(e, t) {
                            return e ? _(e) : (x.addEventListener("error", _), x.addEventListener("playing", o), void(x.src = t))
                        })
                    }

                    function a() {
                        x = t("img"), s(e, function(t, r) {
                            return t ? _(t) : (x.src = r, x.alt = e.name, void n(null, x))
                        })
                    }

                    function u() {
                        x = t("iframe"), s(e, function(e, t) {
                            return e ? _(e) : (x.src = t, ".pdf" !== S && (x.sandbox = "allow-forms allow-scripts"), void n(null, x))
                        })
                    }

                    function p() {
                        function t() {
                            d(r) ? (f('File extension "%s" appears ascii, so will render.', S), u()) : (f('File extension "%s" appears non-ascii, will not render.', S), n(new Error('Unsupported file type "' + S + '": Cannot append to DOM')))
                        }
                        f('Unknown file extension "%s" - will attempt to render into iframe', S);
                        var r = "";
                        e.createReadStream({
                            start: 0,
                            end: 1e3
                        }).setEncoding("utf8").on("data", function(e) {
                            r += e
                        }).on("end", t).on("error", n)
                    }

                    function _(t) {
                        t.message = 'Error rendering file "' + e.name + '": ' + t.message, f(t.message), n(t)
                    }
                    n || (n = function() {});
                    var x, S = l.extname(e.name).toLowerCase(),
                        I = 0;
                    v.indexOf(S) >= 0 ? r() : b.indexOf(S) >= 0 ? i() : w.indexOf(S) >= 0 ? a() : E.indexOf(S) >= 0 ? u() : p()
                }

                function s(e, t) {
                    var n = l.extname(e.name).toLowerCase();
                    p(e.createReadStream(), u[n], t)
                }

                function a(e) {
                    if (null == e) throw new Error("file cannot be null or undefined");
                    if ("string" != typeof e.name) throw new Error("missing or invalid file.name property");
                    if ("function" != typeof e.createReadStream) throw new Error("missing or invalid file.createReadStream property")
                }

                function c(e) {
                    var t = l.extname(e).toLowerCase();
                    return {
                        ".m4a": 'audio/mp4; codecs="mp4a.40.5"',
                        ".m4v": 'video/mp4; codecs="avc1.640029, mp4a.40.5"',
                        ".mp3": "audio/mpeg",
                        ".mp4": 'video/mp4; codecs="avc1.640029, mp4a.40.5"',
                        ".webm": 'video/webm; codecs="vorbis, vp8"'
                    }[t]
                }
                n.render = r, n.append = o;
                var u = n.mime = e("./lib/mime.json"),
                    f = e("debug")("render-media"),
                    d = e("is-ascii"),
                    h = e("mediasource"),
                    l = e("path"),
                    p = e("stream-to-blob-url"),
                    m = e("videostream"),
                    g = [".mp4", ".m4v", ".m4a"],
                    y = [".mp4", ".m4v", ".webm"],
                    _ = [".m4a", ".mp3"],
                    v = y.concat(_),
                    b = [".wav", ".aac", ".ogg", ".oga"],
                    w = [".jpg", ".jpeg", ".png", ".gif", ".bmp"],
                    E = [".css", ".html", ".js", ".md", ".pdf", ".txt"],
                    k = "undefined" != typeof window && window.MediaSource
            }, {
                "./lib/mime.json": 110,
                debug: 68,
                "is-ascii": 111,
                mediasource: 112,
                path: 32,
                "stream-to-blob-url": 138,
                videostream: 125
            }
        ],
        110: [
            function(e, t, n) {
                t.exports = {
                    ".3gp": "video/3gpp",
                    ".aac": "audio/aac",
                    ".aif": "audio/x-aiff",
                    ".aiff": "audio/x-aiff",
                    ".atom": "application/atom+xml",
                    ".avi": "video/x-msvideo",
                    ".bmp": "image/bmp",
                    ".bz2": "application/x-bzip2",
                    ".conf": "text/plain",
                    ".css": "text/css",
                    ".csv": "text/csv",
                    ".diff": "text/x-diff",
                    ".doc": "application/msword",
                    ".flv": "video/x-flv",
                    ".gif": "image/gif",
                    ".gz": "application/x-gzip",
                    ".htm": "text/html",
                    ".html": "text/html",
                    ".ico": "image/vnd.microsoft.icon",
                    ".ics": "text/calendar",
                    ".iso": "application/octet-stream",
                    ".jar": "application/java-archive",
                    ".jpeg": "image/jpeg",
                    ".jpg": "image/jpeg",
                    ".js": "application/javascript",
                    ".json": "application/json",
                    ".less": "text/css",
                    ".log": "text/plain",
                    ".m3u": "audio/x-mpegurl",
                    ".m4a": "audio/mp4",
                    ".m4v": "video/mp4",
                    ".manifest": "text/cache-manifest",
                    ".markdown": "text/x-markdown",
                    ".mathml": "application/mathml+xml",
                    ".md": "text/x-markdown",
                    ".mid": "audio/midi",
                    ".midi": "audio/midi",
                    ".mov": "video/quicktime",
                    ".mp3": "audio/mpeg",
                    ".mp4": "video/mp4",
                    ".mp4v": "video/mp4",
                    ".mpeg": "video/mpeg",
                    ".mpg": "video/mpeg",
                    ".odp": "application/vnd.oasis.opendocument.presentation",
                    ".ods": "application/vnd.oasis.opendocument.spreadsheet",
                    ".odt": "application/vnd.oasis.opendocument.text",
                    ".oga": "audio/ogg",
                    ".ogg": "application/ogg",
                    ".pdf": "application/pdf",
                    ".png": "image/png",
                    ".pps": "application/vnd.ms-powerpoint",
                    ".ppt": "application/vnd.ms-powerpoint",
                    ".ps": "application/postscript",
                    ".psd": "image/vnd.adobe.photoshop",
                    ".qt": "video/quicktime",
                    ".rar": "application/x-rar-compressed",
                    ".rdf": "application/rdf+xml",
                    ".rss": "application/rss+xml",
                    ".rtf": "application/rtf",
                    ".svg": "image/svg+xml",
                    ".svgz": "image/svg+xml",
                    ".swf": "application/x-shockwave-flash",
                    ".tar": "application/x-tar",
                    ".tbz": "application/x-bzip-compressed-tar",
                    ".text": "text/plain",
                    ".tif": "image/tiff",
                    ".tiff": "image/tiff",
                    ".torrent": "application/x-bittorrent",
                    ".ttf": "application/x-font-ttf",
                    ".txt": "text/plain",
                    ".wav": "audio/wav",
                    ".webm": "video/webm",
                    ".wma": "audio/x-ms-wma",
                    ".wmv": "video/x-ms-wmv",
                    ".xls": "application/vnd.ms-excel",
                    ".xml": "application/xml",
                    ".yaml": "text/yaml",
                    ".yml": "text/yaml",
                    ".zip": "application/zip"
                }
            }, {}
        ],
        111: [
            function(e, t, n) {
                var r = 127;
                t.exports = function(e) {
                    for (var t = 0, n = e.length; n > t; ++t)
                        if (e.charCodeAt(t) > r) return !1;
                    return !0
                }
            }, {}
        ],
        112: [
            function(e, t, n) {
                function r(e, t) {
                    var n = this;
                    if (!(n instanceof r)) return new r(e, t);
                    if (!c) throw new Error("web browser lacks MediaSource support");
                    t || (t = {}), n._bufferDuration = t.bufferDuration || u, n._elem = e, n._mediaSource = new c, n._streams = [], n.detailedError = null, n._errorHandler = function() {
                        n._elem.removeEventListener("error", n._errorHandler);
                        var e = n._streams.slice();
                        e.forEach(function(e) {
                            e.destroy(n._elem.error)
                        })
                    }, n._elem.addEventListener("error", n._errorHandler), n._elem.src = window.URL.createObjectURL(n._mediaSource)
                }

                function o(e, t) {
                    var n = this;
                    if (s.Writable.call(n), n._wrapper = e, n._elem = e._elem, n._mediaSource = e._mediaSource, n._allStreams = e._streams, n._allStreams.push(n), n._bufferDuration = e._bufferDuration, n._sourceBuffer = null, n._openHandler = n._onSourceOpen.bind(n), n._flowHandler = n._flow.bind(n), "string" == typeof t) n._type = t, "open" === n._mediaSource.readyState ? n._createSourceBuffer() : n._mediaSource.addEventListener("sourceopen", n._openHandler);
                    else if (null === t._sourceBuffer) t.destroy(), n._type = t._type, n._mediaSource.addEventListener("sourceopen", n._openHandler);
                    else {
                        if (!t._sourceBuffer) throw new Error("The argument to MediaElementWrapper.createWriteStream must be a string or a previous stream returned from that function");
                        t.destroy(), n._type = t._type, n._sourceBuffer = t._sourceBuffer, n._sourceBuffer.addEventListener("updateend", n._flowHandler)
                    }
                    n._elem.addEventListener("timeupdate", n._flowHandler), n.on("error", n._wrapper.error.bind(n._wrapper)), n.on("finish", function() {
                        if (!n.destroyed && (n._finished = !0, n._allStreams.every(function(e) {
                            return e._finished
                        }))) try {
                            n._mediaSource.endOfStream()
                        } catch (e) {}
                    })
                }
                t.exports = r;
                var i = e("inherits"),
                    s = e("readable-stream"),
                    a = e("to-arraybuffer"),
                    c = "undefined" != typeof window && window.MediaSource,
                    u = 60;
                r.prototype.createWriteStream = function(e) {
                    var t = this;
                    return new o(t, e)
                }, r.prototype.error = function(e) {
                    var t = this;
                    t.detailedError || (t.detailedError = e);
                    try {
                        t._mediaSource.endOfStream("decode")
                    } catch (e) {}
                }, i(o, s.Writable), o.prototype._onSourceOpen = function() {
                    var e = this;
                    e.destroyed || (e._mediaSource.removeEventListener("sourceopen", e._openHandler), e._createSourceBuffer())
                }, o.prototype.destroy = function(e) {
                    var t = this;
                    t.destroyed || (t.destroyed = !0, t._allStreams.splice(t._allStreams.indexOf(t), 1), t._mediaSource.removeEventListener("sourceopen", t._openHandler), t._elem.removeEventListener("timeupdate", t._flowHandler), t._sourceBuffer && (t._sourceBuffer.removeEventListener("updateend", t._flowHandler), "open" === t._mediaSource.readyState && t._sourceBuffer.abort()), e && t.emit("error", e), t.emit("close"))
                }, o.prototype._createSourceBuffer = function() {
                    var e = this;
                    if (!e.destroyed)
                        if (c.isTypeSupported(e._type)) {
                            if (e._sourceBuffer = e._mediaSource.addSourceBuffer(e._type), e._sourceBuffer.addEventListener("updateend", e._flowHandler), e._cb) {
                                var t = e._cb;
                                e._cb = null, t()
                            }
                        } else e.destroy(new Error("The provided type is not supported"))
                }, o.prototype._write = function(e, t, n) {
                    var r = this;
                    if (!r.destroyed) {
                        if (!r._sourceBuffer) return void(r._cb = function(o) {
                            return o ? n(o) : void r._write(e, t, n)
                        });
                        if (r._sourceBuffer.updating) return n(new Error("Cannot append buffer while source buffer updating"));
                        try {
                            r._sourceBuffer.appendBuffer(a(e))
                        } catch (o) {
                            return void r.destroy(o)
                        }
                        r._cb = n
                    }
                }, o.prototype._flow = function() {
                    var e = this;
                    if (!e.destroyed && e._sourceBuffer && !e._sourceBuffer.updating && !("open" === e._mediaSource.readyState && e._getBufferDuration() > e._bufferDuration) && e._cb) {
                        var t = e._cb;
                        e._cb = null, t()
                    }
                };
                var f = 0;
                o.prototype._getBufferDuration = function() {
                    for (var e = this, t = e._sourceBuffer.buffered, n = e._elem.currentTime, r = -1, o = 0; o < t.length; o++) {
                        var i = t.start(o),
                            s = t.end(o) + f;
                        if (i > n) break;
                        (r >= 0 || s >= n) && (r = s)
                    }
                    var a = r - n;
                    return 0 > a && (a = 0), a
                }
            }, {
                inherits: 76,
                "readable-stream": 106,
                "to-arraybuffer": 113
            }
        ],
        113: [
            function(e, t, n) {
                arguments[4][44][0].apply(n, arguments)
            }, {
                buffer: 25,
                dup: 44
            }
        ],
        114: [
            function(e, t, n) {
                (function(n) {
                    function r(e) {
                        var t = this;
                        a.call(t), t._tracks = [], t._fragmentSequence = 1, t._file = e, t._decoder = null, t._findMoov(0)
                    }

                    function o(e, t) {
                        var n = this;
                        n._entries = e, n._countName = t || "count", n._index = 0, n._offset = 0, n.value = n._entries[0]
                    }

                    function i() {
                        return {
                            version: 0,
                            flags: 0,
                            entries: []
                        }
                    }
                    var s = e("binary-search"),
                        a = e("events").EventEmitter,
                        c = e("inherits"),
                        u = e("mp4-stream"),
                        f = e("mp4-box-encoding"),
                        d = e("range-slice-stream");
                    t.exports = r, c(r, a), r.prototype._findMoov = function(e) {
                        var t = this;
                        t._decoder && t._decoder.destroy(), t._decoder = u.decode();
                        var n = t._file.createReadStream({
                            start: e
                        });
                        n.pipe(t._decoder), t._decoder.once("box", function(r) {
                            "moov" === r.type ? t._decoder.decode(function(e) {
                                n.destroy();
                                try {
                                    t._processMoov(e)
                                } catch (r) {
                                    r.message = "Cannot parse mp4 file: " + r.message, t.emit("error", r)
                                }
                            }) : (n.destroy(), t._findMoov(e + r.length))
                        })
                    }, o.prototype.inc = function() {
                        var e = this;
                        e._offset++, e._offset >= e._entries[e._index][e._countName] && (e._index++, e._offset = 0), e.value = e._entries[e._index]
                    }, r.prototype._processMoov = function(e) {
                        var t = this,
                            r = e.traks;
                        t._tracks = [], t._hasVideo = !1, t._hasAudio = !1;
                        for (var s = 0; s < r.length; s++) {
                            var a, c, u = r[s],
                                d = u.mdia.minf.stbl,
                                h = d.stsd.entries[0],
                                l = u.mdia.hdlr.handlerType;
                            if ("vide" === l && "avc1" === h.type) {
                                if (t._hasVideo) continue;
                                t._hasVideo = !0, a = "avc1", h.avcC && (a += "." + h.avcC.mimeCodec), c = 'video/mp4; codecs="' + a + '"'
                            } else {
                                if ("soun" !== l || "mp4a" !== h.type) continue;
                                if (t._hasAudio) continue;
                                t._hasAudio = !0, a = "mp4a", h.esds && h.esds.mimeCodec && (a += "." + h.esds.mimeCodec), c = 'audio/mp4; codecs="' + a + '"'
                            }
                            var p = [],
                                m = 0,
                                g = 0,
                                y = 0,
                                _ = 0,
                                v = 0,
                                b = 0,
                                w = new o(d.stts.entries),
                                E = null;
                            d.ctts && (E = new o(d.ctts.entries));
                            for (var k = 0;;) {
                                var x = d.stsc.entries[v],
                                    S = d.stsz.entries[m],
                                    I = w.value.duration,
                                    B = E ? E.value.compositionOffset : 0,
                                    A = !0;
                                if (d.stss && (A = d.stss.entries[k] === m + 1), p.push({
                                    size: S,
                                    duration: I,
                                    dts: b,
                                    presentationOffset: B,
                                    sync: A,
                                    offset: _ + d.stco.entries[y]
                                }), m++, m >= d.stsz.entries.length) break;
                                if (g++, _ += S, g >= x.samplesPerChunk) {
                                    g = 0, _ = 0, y++;
                                    var C = d.stsc.entries[v + 1];
                                    C && y + 1 >= C.firstChunk && v++
                                }
                                b += I, w.inc(), E && E.inc(), A && k++
                            }
                            u.mdia.mdhd.duration = 0, u.tkhd.duration = 0;
                            var L = x.sampleDescriptionId,
                                T = {
                                    type: "moov",
                                    mvhd: e.mvhd,
                                    traks: [{
                                        tkhd: u.tkhd,
                                        mdia: {
                                            mdhd: u.mdia.mdhd,
                                            hdlr: u.mdia.hdlr,
                                            elng: u.mdia.elng,
                                            minf: {
                                                vmhd: u.mdia.minf.vmhd,
                                                smhd: u.mdia.minf.smhd,
                                                dinf: u.mdia.minf.dinf,
                                                stbl: {
                                                    stsd: d.stsd,
                                                    stts: i(),
                                                    ctts: i(),
                                                    stsc: i(),
                                                    stsz: i(),
                                                    stco: i(),
                                                    stss: i()
                                                }
                                            }
                                        }
                                    }],
                                    mvex: {
                                        mehd: {
                                            fragmentDuration: e.mvhd.duration
                                        },
                                        trexs: [{
                                            trackId: u.tkhd.trackId,
                                            defaultSampleDescriptionIndex: L,
                                            defaultSampleDuration: 0,
                                            defaultSampleSize: 0,
                                            defaultSampleFlags: 0
                                        }]
                                    }
                                };
                            t._tracks.push({
                                trackId: u.tkhd.trackId,
                                timeScale: u.mdia.mdhd.timeScale,
                                samples: p,
                                currSample: null,
                                currTime: null,
                                moov: T,
                                mime: c
                            })
                        }
                        if (0 === t._tracks.length) return void t.emit("error", new Error("no playable tracks"));
                        e.mvhd.duration = 0, t._ftyp = {
                            type: "ftyp",
                            brand: "iso5",
                            brandVersion: 0,
                            compatibleBrands: ["iso5"]
                        };
                        var R = f.encode(t._ftyp),
                            U = t._tracks.map(function(e) {
                                var t = f.encode(e.moov);
                                return {
                                    mime: e.mime,
                                    init: n.concat([R, t])
                                }
                            });
                        t.emit("ready", U)
                    }, r.prototype.seek = function(e) {
                        var t = this;
                        if (!t._tracks) throw new Error("Not ready yet; wait for 'ready' event");
                        t._fileStream && (t._fileStream.destroy(), t._fileStream = null);
                        var n = -1;
                        if (t._tracks.map(function(r, o) {
                            function i(e) {
                                s.destroyed || s.box(e.moof, function(n) {
                                    if (n) return t.emit("error", n);
                                    if (!s.destroyed) {
                                        var a = r.inStream.slice(e.ranges);
                                        a.pipe(s.mediaData(e.length, function(e) {
                                            if (e) return t.emit("error", e);
                                            if (!s.destroyed) {
                                                var n = t._generateFragment(o);
                                                return n ? void i(n) : s.finalize()
                                            }
                                        }))
                                    }
                                })
                            }
                            r.outStream && r.outStream.destroy(), r.inStream && (r.inStream.destroy(), r.inStream = null);
                            var s = r.outStream = u.encode(),
                                a = t._generateFragment(o, e);
                            return a ? ((-1 === n || a.ranges[0].start < n) && (n = a.ranges[0].start), void i(a)) : s.finalize()
                        }), n >= 0) {
                            var r = t._fileStream = t._file.createReadStream({
                                start: n
                            });
                            t._tracks.forEach(function(e) {
                                e.inStream = new d(n), r.pipe(e.inStream)
                            })
                        }
                        return t._tracks.map(function(e) {
                            return e.outStream
                        })
                    }, r.prototype._findSampleBefore = function(e, t) {
                        var n = this,
                            r = n._tracks[e],
                            o = Math.floor(r.timeScale * t),
                            i = s(r.samples, o, function(e, t) {
                                var n = e.dts + e.presentationOffset;
                                return n - t
                            });
                        for (-1 === i ? i = 0 : 0 > i && (i = -i - 2); !r.samples[i].sync;) i--;
                        return i
                    };
                    var h = 1;
                    r.prototype._generateFragment = function(e, t) {
                        var n, r = this,
                            o = r._tracks[e];
                        if (n = void 0 !== t ? r._findSampleBefore(e, t) : o.currSample, n >= o.samples.length) return null;
                        for (var i = o.samples[n].dts, s = 0, a = [], c = n; c < o.samples.length; c++) {
                            var u = o.samples[c];
                            if (u.sync && u.dts - i >= o.timeScale * h) break;
                            s += u.size;
                            var f = a.length - 1;
                            0 > f || a[f].end !== u.offset ? a.push({
                                start: u.offset,
                                end: u.offset + u.size
                            }) : a[f].end += u.size
                        }
                        return o.currSample = c, {
                            moof: r._generateMoof(e, n, c),
                            ranges: a,
                            length: s
                        }
                    }, r.prototype._generateMoof = function(e, t, n) {
                        for (var r = this, o = r._tracks[e], i = [], s = t; n > s; s++) {
                            var a = o.samples[s];
                            i.push({
                                sampleDuration: a.duration,
                                sampleSize: a.size,
                                sampleFlags: a.sync ? 33554432 : 16842752,
                                sampleCompositionTimeOffset: a.presentationOffset
                            })
                        }
                        var c = {
                            type: "moof",
                            mfhd: {
                                sequenceNumber: r._fragmentSequence++
                            },
                            trafs: [{
                                tfhd: {
                                    flags: 131072,
                                    trackId: o.trackId
                                },
                                tfdt: {
                                    baseMediaDecodeTime: o.samples[t].dts
                                },
                                trun: {
                                    flags: 3841,
                                    dataOffset: 8,
                                    entries: i
                                }
                            }]
                        };
                        return c.trafs[0].trun.dataOffset += f.encodingLength(c), c
                    }
                }).call(this, e("buffer").Buffer)
            }, {
                "binary-search": 115,
                buffer: 25,
                events: 29,
                inherits: 76,
                "mp4-box-encoding": 118,
                "mp4-stream": 122,
                "range-slice-stream": 124
            }
        ],
        115: [
            function(e, t, n) {
                t.exports = function(e, t, n, r, o) {
                    var i, s;
                    if (void 0 === r) r = 0;
                    else if (r = 0 | r, 0 > r || r >= e.length) throw new RangeError("invalid lower bound");
                    if (void 0 === o) o = e.length - 1;
                    else if (o = 0 | o, r > o || o >= e.length) throw new RangeError("invalid upper bound");
                    for (; o >= r;)
                        if (i = r + (o - r >> 1), s = +n(e[i], t), 0 > s) r = i + 1;
                        else {
                            if (!(s > 0)) return i;
                            o = i - 1
                        }
                    return~ r
                }
            }, {}
        ],
        116: [
            function(e, t, n) {
                (function(t) {
                    function r(e, t, n) {
                        for (var r = t; n > r; r++) e[r] = 0
                    }

                    function o(e, t, n) {
                        t.writeUInt32BE(Math.floor((e.getTime() + g) / 1e3), n)
                    }

                    function i(e, t, n) {
                        t.writeUInt16BE(Math.floor(e) % 65536, n), t.writeUInt16BE(Math.floor(256 * e * 256) % 65536, n + 2)
                    }

                    function s(e, t, n) {
                        t[n] = Math.floor(e) % 256, t[n + 1] = Math.floor(256 * e) % 256
                    }

                    function a(e, t, n) {
                        e || (e = [0, 0, 0, 0, 0, 0, 0, 0, 0]);
                        for (var r = 0; r < e.length; r++) i(e[r], t, n + 4 * r)
                    }

                    function c(e, n, r) {
                        var o = new t(e, "utf8");
                        o.copy(n, r), n[r + o.length] = 0
                    }

                    function u(e) {
                        for (var t = new Array(e.length / 4), n = 0; n < t.length; n++) t[n] = d(e, 4 * n);
                        return t
                    }

                    function f(e, t) {
                        return new Date(1e3 * e.readUInt32BE(t) - g)
                    }

                    function d(e, t) {
                        return e.readUInt16BE(t) + e.readUInt16BE(t + 2) / 65536
                    }

                    function h(e, t) {
                        return e[t] + e[t + 1] / 256
                    }

                    function l(e, t, n) {
                        var r;
                        for (r = 0; n > r && 0 !== e[t + r]; r++);
                        return e.toString("utf8", t, t + r)
                    }
                    var p = e("./index"),
                        m = e("./descriptor"),
                        g = 20828448e5;
                    n.fullBoxes = {};
                    var y = ["mvhd", "tkhd", "mdhd", "vmhd", "smhd", "stsd", "esds", "stsz", "stco", "stss", "stts", "ctts", "stsc", "dref", "elst", "hdlr", "mehd", "trex", "mfhd", "tfhd", "tfdt", "trun"];
                    y.forEach(function(e) {
                        n.fullBoxes[e] = !0
                    }), n.ftyp = {}, n.ftyp.encode = function(e, r, o) {
                        r = r ? r.slice(o) : new t(n.ftyp.encodingLength(e));
                        var i = e.compatibleBrands || [];
                        r.write(e.brand, 0, 4, "ascii"), r.writeUInt32BE(e.brandVersion, 4);
                        for (var s = 0; s < i.length; s++) r.write(i[s], 8 + 4 * s, 4, "ascii");
                        return n.ftyp.encode.bytes = 8 + 4 * i.length, r
                    }, n.ftyp.decode = function(e, t) {
                        e = e.slice(t);
                        for (var n = e.toString("ascii", 0, 4), r = e.readUInt32BE(4), o = [], i = 8; i < e.length; i += 4) o.push(e.toString("ascii", i, i + 4));
                        return {
                            brand: n,
                            brandVersion: r,
                            compatibleBrands: o
                        }
                    }, n.ftyp.encodingLength = function(e) {
                        return 8 + 4 * (e.compatibleBrands || []).length
                    }, n.mvhd = {}, n.mvhd.encode = function(e, c, u) {
                        return c = c ? c.slice(u) : new t(96), o(e.ctime || new Date, c, 0), o(e.mtime || new Date, c, 4), c.writeUInt32BE(e.timeScale || 0, 8), c.writeUInt32BE(e.duration || 0, 12), i(e.preferredRate || 0, c, 16), s(e.preferredVolume || 0, c, 20), r(c, 22, 32), a(e.matrix, c, 32), c.writeUInt32BE(e.previewTime || 0, 68), c.writeUInt32BE(e.previewDuration || 0, 72), c.writeUInt32BE(e.posterTime || 0, 76), c.writeUInt32BE(e.selectionTime || 0, 80), c.writeUInt32BE(e.selectionDuration || 0, 84), c.writeUInt32BE(e.currentTime || 0, 88), c.writeUInt32BE(e.nextTrackId || 0, 92), n.mvhd.encode.bytes = 96, c
                    }, n.mvhd.decode = function(e, t) {
                        return e = e.slice(t), {
                            ctime: f(e, 0),
                            mtime: f(e, 4),
                            timeScale: e.readUInt32BE(8),
                            duration: e.readUInt32BE(12),
                            preferredRate: d(e, 16),
                            preferredVolume: h(e, 20),
                            matrix: u(e.slice(32, 68)),
                            previewTime: e.readUInt32BE(68),
                            previewDuration: e.readUInt32BE(72),
                            posterTime: e.readUInt32BE(76),
                            selectionTime: e.readUInt32BE(80),
                            selectionDuration: e.readUInt32BE(84),
                            currentTime: e.readUInt32BE(88),
                            nextTrackId: e.readUInt32BE(92)
                        }
                    }, n.mvhd.encodingLength = function(e) {
                        return 96
                    }, n.tkhd = {}, n.tkhd.encode = function(e, i, s) {
                        return i = i ? i.slice(s) : new t(80), o(e.ctime || new Date, i, 0), o(e.mtime || new Date, i, 4), i.writeUInt32BE(e.trackId || 0, 8), r(i, 12, 16), i.writeUInt32BE(e.duration || 0, 16), r(i, 20, 28), i.writeUInt16BE(e.layer || 0, 28), i.writeUInt16BE(e.alternateGroup || 0, 30), i.writeUInt16BE(e.volume || 0, 32), a(e.matrix, i, 36), i.writeUInt32BE(e.trackWidth || 0, 72), i.writeUInt32BE(e.trackHeight || 0, 76), n.tkhd.encode.bytes = 80, i
                    }, n.tkhd.decode = function(e, t) {
                        return e = e.slice(t), {
                            ctime: f(e, 0),
                            mtime: f(e, 4),
                            trackId: e.readUInt32BE(8),
                            duration: e.readUInt32BE(16),
                            layer: e.readUInt16BE(28),
                            alternateGroup: e.readUInt16BE(30),
                            volume: e.readUInt16BE(32),
                            matrix: u(e.slice(36, 72)),
                            trackWidth: e.readUInt32BE(72),
                            trackHeight: e.readUInt32BE(76)
                        }
                    }, n.tkhd.encodingLength = function(e) {
                        return 80
                    }, n.mdhd = {}, n.mdhd.encode = function(e, r, i) {
                        return r = r ? r.slice(i) : new t(20), o(e.ctime || new Date, r, 0), o(e.mtime || new Date, r, 4), r.writeUInt32BE(e.timeScale || 0, 8), r.writeUInt32BE(e.duration || 0, 12), r.writeUInt16BE(e.language || 0, 16), r.writeUInt16BE(e.quality || 0, 18), n.mdhd.encode.bytes = 20, r
                    }, n.mdhd.decode = function(e, t) {
                        return e = e.slice(t), {
                            ctime: f(e, 0),
                            mtime: f(e, 4),
                            timeScale: e.readUInt32BE(8),
                            duration: e.readUInt32BE(12),
                            language: e.readUInt16BE(16),
                            quality: e.readUInt16BE(18)
                        }
                    }, n.mdhd.encodingLength = function(e) {
                        return 20
                    }, n.vmhd = {}, n.vmhd.encode = function(e, r, o) {
                        r = r ? r.slice(o) : new t(8), r.writeUInt16BE(e.graphicsMode || 0, 0);
                        var i = e.opcolor || [0, 0, 0];
                        return r.writeUInt16BE(i[0], 2), r.writeUInt16BE(i[1], 4), r.writeUInt16BE(i[2], 6), n.vmhd.encode.bytes = 8, r
                    }, n.vmhd.decode = function(e, t) {
                        return e = e.slice(t), {
                            graphicsMode: e.readUInt16BE(0),
                            opcolor: [e.readUInt16BE(2), e.readUInt16BE(4), e.readUInt16BE(6)]
                        }
                    }, n.vmhd.encodingLength = function(e) {
                        return 8
                    }, n.smhd = {}, n.smhd.encode = function(e, o, i) {
                        return o = o ? o.slice(i) : new t(4), o.writeUInt16BE(e.balance || 0, 0), r(o, 2, 4), n.smhd.encode.bytes = 4, o
                    }, n.smhd.decode = function(e, t) {
                        return e = e.slice(t), {
                            balance: e.readUInt16BE(0)
                        }
                    }, n.smhd.encodingLength = function(e) {
                        return 4
                    }, n.stsd = {}, n.stsd.encode = function(e, r, o) {
                        r = r ? r.slice(o) : new t(n.stsd.encodingLength(e));
                        var i = e.entries || [];
                        r.writeUInt32BE(i.length, 0);
                        for (var s = 4, a = 0; a < i.length; a++) {
                            var c = i[a];
                            p.encode(c, r, s), s += p.encode.bytes
                        }
                        return n.stsd.encode.bytes = s, r
                    }, n.stsd.decode = function(e, t, n) {
                        e = e.slice(t);
                        for (var r = e.readUInt32BE(0), o = new Array(r), i = 4, s = 0; r > s; s++) {
                            var a = p.decode(e, i, n);
                            o[s] = a, i += a.length
                        }
                        return {
                            entries: o
                        }
                    }, n.stsd.encodingLength = function(e) {
                        var t = 4;
                        if (!e.entries) return t;
                        for (var n = 0; n < e.entries.length; n++) t += p.encodingLength(e.entries[n]);
                        return t
                    }, n.avc1 = n.VisualSampleEntry = {}, n.VisualSampleEntry.encode = function(e, o, i) {
                        o = o ? o.slice(i) : new t(n.VisualSampleEntry.encodingLength(e)), r(o, 0, 6), o.writeUInt16BE(e.dataReferenceIndex || 0, 6), r(o, 8, 24), o.writeUInt16BE(e.width || 0, 24), o.writeUInt16BE(e.height || 0, 26), o.writeUInt32BE(e.hResolution || 4718592, 28), o.writeUInt32BE(e.vResolution || 4718592, 32), r(o, 36, 40), o.writeUInt16BE(e.frameCount || 1, 40);
                        var s = e.compressorName || "",
                            a = Math.min(s.length, 31);
                        o.writeUInt8(a, 42), o.write(s, 43, a, "utf8"), o.writeUInt16BE(e.depth || 24, 74), o.writeInt16BE(-1, 76);
                        var c = 78,
                            u = e.children || [];
                        u.forEach(function(e) {
                            p.encode(e, o, c), c += p.encode.bytes
                        }), n.VisualSampleEntry.encode.bytes = c
                    }, n.VisualSampleEntry.decode = function(e, t, n) {
                        e = e.slice(t);
                        for (var r = n - t, o = Math.min(e.readUInt8(42), 31), i = {
                                dataReferenceIndex: e.readUInt16BE(6),
                                width: e.readUInt16BE(24),
                                height: e.readUInt16BE(26),
                                hResolution: e.readUInt32BE(28),
                                vResolution: e.readUInt32BE(32),
                                frameCount: e.readUInt16BE(40),
                                compressorName: e.toString("utf8", 43, 43 + o),
                                depth: e.readUInt16BE(74),
                                children: []
                            }, s = 78; r - s >= 8;) {
                            var a = p.decode(e, s, r);
                            i.children.push(a), i[a.type] = a, s += a.length
                        }
                        return i
                    }, n.VisualSampleEntry.encodingLength = function(e) {
                        var t = 78,
                            n = e.children || [];
                        return n.forEach(function(e) {
                            t += p.encodingLength(e)
                        }), t
                    }, n.avcC = {}, n.avcC.encode = function(e, r, o) {
                        r = r ? r.slice(o) : t(e.buffer.length), e.buffer.copy(r), n.avcC.encode.bytes = e.buffer.length
                    }, n.avcC.decode = function(e, n, r) {
                        return e = e.slice(n, r), {
                            mimeCodec: e.toString("hex", 1, 4),
                            buffer: new t(e)
                        }
                    }, n.avcC.encodingLength = function(e) {
                        return e.buffer.length
                    }, n.mp4a = n.AudioSampleEntry = {}, n.AudioSampleEntry.encode = function(e, o, i) {
                        o = o ? o.slice(i) : new t(n.AudioSampleEntry.encodingLength(e)), r(o, 0, 6), o.writeUInt16BE(e.dataReferenceIndex || 0, 6), r(o, 8, 16), o.writeUInt16BE(e.channelCount || 2, 16), o.writeUInt16BE(e.sampleSize || 16, 18), r(o, 20, 24), o.writeUInt32BE(e.sampleRate || 0, 24);
                        var s = 28,
                            a = e.children || [];
                        a.forEach(function(e) {
                            p.encode(e, o, s), s += p.encode.bytes
                        }), n.AudioSampleEntry.encode.bytes = s
                    }, n.AudioSampleEntry.decode = function(e, t, n) {
                        e = e.slice(t, n);
                        for (var r = n - t, o = {
                                dataReferenceIndex: e.readUInt16BE(6),
                                channelCount: e.readUInt16BE(16),
                                sampleSize: e.readUInt16BE(18),
                                sampleRate: e.readUInt32BE(24),
                                children: []
                            }, i = 28; r - i >= 8;) {
                            var s = p.decode(e, i, r);
                            o.children.push(s), o[s.type] = s, i += s.length
                        }
                        return o
                    }, n.AudioSampleEntry.encodingLength = function(e) {
                        var t = 28,
                            n = e.children || [];
                        return n.forEach(function(e) {
                            t += p.encodingLength(e)
                        }), t
                    }, n.esds = {}, n.esds.encode = function(e, r, o) {
                        r = r ? r.slice(o) : t(e.buffer.length), e.buffer.copy(r, 0), n.esds.encode.bytes = e.buffer.length
                    }, n.esds.decode = function(e, n, r) {
                        e = e.slice(n, r);
                        var o = m.Descriptor.decode(e, 0, e.length),
                            i = "ESDescriptor" === o.tagName ? o : {}, s = i.DecoderConfigDescriptor || {}, a = s.oti || 0,
                            c = s.DecoderSpecificInfo || {}, u = c ? (248 & c.buffer.readUInt8(0)) >> 3 : 0,
                            f = null;
                        return a && (f = a.toString(16), u && (f += "." + u)), {
                            mimeCodec: f,
                            buffer: new t(e.slice(0))
                        }
                    }, n.esds.encodingLength = function(e) {
                        return e.buffer.length
                    }, n.stsz = {}, n.stsz.encode = function(e, r, o) {
                        var i = e.entries || [];
                        r = r ? r.slice(o) : t(n.stsz.encodingLength(e)), r.writeUInt32BE(0, 0), r.writeUInt32BE(i.length, 4);
                        for (var s = 0; s < i.length; s++) r.writeUInt32BE(i[s], 4 * s + 8);
                        return n.stsz.encode.bytes = 8 + 4 * i.length, r
                    }, n.stsz.decode = function(e, t) {
                        e = e.slice(t);
                        for (var n = e.readUInt32BE(0), r = e.readUInt32BE(4), o = new Array(r), i = 0; r > i; i++) 0 === n ? o[i] = e.readUInt32BE(4 * i + 8) : o[i] = n;
                        return {
                            entries: o
                        }
                    }, n.stsz.encodingLength = function(e) {
                        return 8 + 4 * e.entries.length
                    }, n.stss = n.stco = {}, n.stco.encode = function(e, r, o) {
                        var i = e.entries || [];
                        r = r ? r.slice(o) : new t(n.stco.encodingLength(e)), r.writeUInt32BE(i.length, 0);
                        for (var s = 0; s < i.length; s++) r.writeUInt32BE(i[s], 4 * s + 4);
                        return n.stco.encode.bytes = 4 + 4 * i.length, r
                    }, n.stco.decode = function(e, t) {
                        e = e.slice(t);
                        for (var n = e.readUInt32BE(0), r = new Array(n), o = 0; n > o; o++) r[o] = e.readUInt32BE(4 * o + 4);
                        return {
                            entries: r
                        }
                    }, n.stco.encodingLength = function(e) {
                        return 4 + 4 * e.entries.length
                    }, n.stts = {}, n.stts.encode = function(e, r, o) {
                        var i = e.entries || [];
                        r = r ? r.slice(o) : new t(n.stts.encodingLength(e)), r.writeUInt32BE(i.length, 0);
                        for (var s = 0; s < i.length; s++) {
                            var a = 8 * s + 4;
                            r.writeUInt32BE(i[s].count || 0, a), r.writeUInt32BE(i[s].duration || 0, a + 4)
                        }
                        return n.stts.encode.bytes = 4 + 8 * e.entries.length,
                        r
                    }, n.stts.decode = function(e, t) {
                        e = e.slice(t);
                        for (var n = e.readUInt32BE(0), r = new Array(n), o = 0; n > o; o++) {
                            var i = 8 * o + 4;
                            r[o] = {
                                count: e.readUInt32BE(i),
                                duration: e.readUInt32BE(i + 4)
                            }
                        }
                        return {
                            entries: r
                        }
                    }, n.stts.encodingLength = function(e) {
                        return 4 + 8 * e.entries.length
                    }, n.ctts = {}, n.ctts.encode = function(e, r, o) {
                        var i = e.entries || [];
                        r = r ? r.slice(o) : new t(n.ctts.encodingLength(e)), r.writeUInt32BE(i.length, 0);
                        for (var s = 0; s < i.length; s++) {
                            var a = 8 * s + 4;
                            r.writeUInt32BE(i[s].count || 0, a), r.writeUInt32BE(i[s].compositionOffset || 0, a + 4)
                        }
                        return n.ctts.encode.bytes = 4 + 8 * i.length, r
                    }, n.ctts.decode = function(e, t) {
                        e = e.slice(t);
                        for (var n = e.readUInt32BE(0), r = new Array(n), o = 0; n > o; o++) {
                            var i = 8 * o + 4;
                            r[o] = {
                                count: e.readUInt32BE(i),
                                compositionOffset: e.readInt32BE(i + 4)
                            }
                        }
                        return {
                            entries: r
                        }
                    }, n.ctts.encodingLength = function(e) {
                        return 4 + 8 * e.entries.length
                    }, n.stsc = {}, n.stsc.encode = function(e, r, o) {
                        var i = e.entries || [];
                        r = r ? r.slice(o) : new t(n.stsc.encodingLength(e)), r.writeUInt32BE(i.length, 0);
                        for (var s = 0; s < i.length; s++) {
                            var a = 12 * s + 4;
                            r.writeUInt32BE(i[s].firstChunk || 0, a), r.writeUInt32BE(i[s].samplesPerChunk || 0, a + 4), r.writeUInt32BE(i[s].sampleDescriptionId || 0, a + 8)
                        }
                        return n.stsc.encode.bytes = 4 + 12 * i.length, r
                    }, n.stsc.decode = function(e, t) {
                        e = e.slice(t);
                        for (var n = e.readUInt32BE(0), r = new Array(n), o = 0; n > o; o++) {
                            var i = 12 * o + 4;
                            r[o] = {
                                firstChunk: e.readUInt32BE(i),
                                samplesPerChunk: e.readUInt32BE(i + 4),
                                sampleDescriptionId: e.readUInt32BE(i + 8)
                            }
                        }
                        return {
                            entries: r
                        }
                    }, n.stsc.encodingLength = function(e) {
                        return 4 + 12 * e.entries.length
                    }, n.dref = {}, n.dref.encode = function(e, r, o) {
                        r = r ? r.slice(o) : new t(n.dref.encodingLength(e));
                        var i = e.entries || [];
                        r.writeUInt32BE(i.length, 0);
                        for (var s = 4, a = 0; a < i.length; a++) {
                            var c = i[a],
                                u = (c.buf ? c.buf.length : 0) + 4 + 4;
                            r.writeUInt32BE(u, s), s += 4, r.write(c.type, s, 4, "ascii"), s += 4, c.buf && (c.buf.copy(r, s), s += c.buf.length)
                        }
                        return n.dref.encode.bytes = s, r
                    }, n.dref.decode = function(e, t) {
                        e = e.slice(t);
                        for (var n = e.readUInt32BE(0), r = new Array(n), o = 4, i = 0; n > i; i++) {
                            var s = e.readUInt32BE(o),
                                a = e.toString("ascii", o + 4, o + 8),
                                c = e.slice(o + 8, o + s);
                            o += s, r[i] = {
                                type: a,
                                buf: c
                            }
                        }
                        return {
                            entries: r
                        }
                    }, n.dref.encodingLength = function(e) {
                        var t = 4;
                        if (!e.entries) return t;
                        for (var n = 0; n < e.entries.length; n++) {
                            var r = e.entries[n].buf;
                            t += (r ? r.length : 0) + 4 + 4
                        }
                        return t
                    }, n.elst = {}, n.elst.encode = function(e, r, o) {
                        var s = e.entries || [];
                        r = r ? r.slice(o) : new t(n.elst.encodingLength(e)), r.writeUInt32BE(s.length, 0);
                        for (var a = 0; a < s.length; a++) {
                            var c = 12 * a + 4;
                            r.writeUInt32BE(s[a].trackDuration || 0, c), r.writeUInt32BE(s[a].mediaTime || 0, c + 4), i(s[a].mediaRate || 0, r, c + 8)
                        }
                        return n.elst.encode.bytes = 4 + 12 * s.length, r
                    }, n.elst.decode = function(e, t) {
                        e = e.slice(t);
                        for (var n = e.readUInt32BE(0), r = new Array(n), o = 0; n > o; o++) {
                            var i = 12 * o + 4;
                            r[o] = {
                                trackDuration: e.readUInt32BE(i),
                                mediaTime: e.readInt32BE(i + 4),
                                mediaRate: d(e, i + 8)
                            }
                        }
                        return {
                            entries: r
                        }
                    }, n.elst.encodingLength = function(e) {
                        return 4 + 12 * e.entries.length
                    }, n.hdlr = {}, n.hdlr.encode = function(e, r, o) {
                        r = r ? r.slice(o) : new t(n.hdlr.encodingLength(e));
                        var i = 21 + (e.name || "").length;
                        return r.fill(0, 0, i), r.write(e.handlerType || "", 4, 4, "ascii"), c(e.name || "", r, 20), n.hdlr.encode.bytes = i, r
                    }, n.hdlr.decode = function(e, t, n) {
                        return e = e.slice(t), {
                            handlerType: e.toString("ascii", 4, 8),
                            name: l(e, 20, n)
                        }
                    }, n.hdlr.encodingLength = function(e) {
                        return 21 + (e.name || "").length
                    }, n.mehd = {}, n.mehd.encode = function(e, r, o) {
                        return r = r ? r.slice(o) : new t(4), r.writeUInt32BE(e.fragmentDuration || 0, 0), n.mehd.encode.bytes = 4, r
                    }, n.mehd.decode = function(e, t) {
                        return e = e.slice(t), {
                            fragmentDuration: e.readUInt32BE(0)
                        }
                    }, n.mehd.encodingLength = function(e) {
                        return 4
                    }, n.trex = {}, n.trex.encode = function(e, r, o) {
                        return r = r ? r.slice(o) : new t(20), r.writeUInt32BE(e.trackId || 0, 0), r.writeUInt32BE(e.defaultSampleDescriptionIndex || 0, 4), r.writeUInt32BE(e.defaultSampleDuration || 0, 8), r.writeUInt32BE(e.defaultSampleSize || 0, 12), r.writeUInt32BE(e.defaultSampleFlags || 0, 16), n.trex.encode.bytes = 20, r
                    }, n.trex.decode = function(e, t) {
                        return e = e.slice(t), {
                            trackId: e.readUInt32BE(0),
                            defaultSampleDescriptionIndex: e.readUInt32BE(4),
                            defaultSampleDuration: e.readUInt32BE(8),
                            defaultSampleSize: e.readUInt32BE(12),
                            defaultSampleFlags: e.readUInt32BE(16)
                        }
                    }, n.trex.encodingLength = function(e) {
                        return 20
                    }, n.mfhd = {}, n.mfhd.encode = function(e, r, o) {
                        return r = r ? r.slice(o) : new t(4), r.writeUInt32BE(e.sequenceNumber || 0, 0), n.mfhd.encode.bytes = 4, r
                    }, n.mfhd.decode = function(e, t) {
                        return {
                            sequenceNumber: e.readUint32BE(0)
                        }
                    }, n.mfhd.encodingLength = function(e) {
                        return 4
                    }, n.tfhd = {}, n.tfhd.encode = function(e, r, o) {
                        return r = r ? r.slice(o) : new t(4), r.writeUInt32BE(e.trackId, 0), n.tfhd.encode.bytes = 4, r
                    }, n.tfhd.decode = function(e, t) {}, n.tfhd.encodingLength = function(e) {
                        return 4
                    }, n.tfdt = {}, n.tfdt.encode = function(e, r, o) {
                        return r = r ? r.slice(o) : new t(4), r.writeUInt32BE(e.baseMediaDecodeTime || 0, 0), n.tfdt.encode.bytes = 4, r
                    }, n.tfdt.decode = function(e, t) {}, n.tfdt.encodingLength = function(e) {
                        return 4
                    }, n.trun = {}, n.trun.encode = function(e, r, o) {
                        r = r ? r.slice(o) : new t(8 + 16 * e.entries.length), r.writeUInt32BE(e.entries.length, 0), r.writeInt32BE(e.dataOffset, 4);
                        for (var i = 8, s = 0; s < e.entries.length; s++) {
                            var a = e.entries[s];
                            r.writeUInt32BE(a.sampleDuration, i), i += 4, r.writeUInt32BE(a.sampleSize, i), i += 4, r.writeUInt32BE(a.sampleFlags, i), i += 4, r.writeUInt32BE(a.sampleCompositionTimeOffset, i), i += 4
                        }
                        n.trun.encode.bytes = i
                    }, n.trun.decode = function(e, t) {}, n.trun.encodingLength = function(e) {
                        return 8 + 16 * e.entries.length
                    }, n.mdat = {}, n.mdat.encode = function(e, t, r) {
                        e.buffer ? (e.buffer.copy(t, r), n.mdat.encode.bytes = e.buffer.length) : n.mdat.encode.bytes = n.mdat.encodingLength(e)
                    }, n.mdat.decode = function(e, n, r) {
                        return {
                            buffer: new t(e.slice(n, r))
                        }
                    }, n.mdat.encodingLength = function(e) {
                        return e.buffer ? e.buffer.length : e.contentLength
                    }
                }).call(this, e("buffer").Buffer)
            }, {
                "./descriptor": 117,
                "./index": 118,
                buffer: 25
            }
        ],
        117: [
            function(e, t, n) {
                (function(e) {
                    var t = {
                        3: "ESDescriptor",
                        4: "DecoderConfigDescriptor",
                        5: "DecoderSpecificInfo",
                        6: "SLConfigDescriptor"
                    };
                    n.Descriptor = {}, n.Descriptor.decode = function(r, o, i) {
                        var s, a = r.readUInt8(o),
                            c = o + 1,
                            u = 0;
                        do s = r.readUInt8(c++), u = u << 7 | 127 & s; while (128 & s);
                        var f, d = t[a];
                        return f = n[d] ? n[d].decode(r, c, i) : {
                            buffer: new e(r.slice(c, c + u))
                        }, f.tag = a, f.tagName = d, f.length = c - o + u, f.contentsLen = u, f
                    }, n.DescriptorArray = {}, n.DescriptorArray.decode = function(e, r, o) {
                        for (var i = r, s = {}; o >= i + 2;) {
                            var a = n.Descriptor.decode(e, i, o);
                            i += a.length;
                            var c = t[a.tag] || "Descriptor" + a.tag;
                            s[c] = a
                        }
                        return s
                    }, n.ESDescriptor = {}, n.ESDescriptor.decode = function(e, t, r) {
                        var o = e.readUInt8(t + 2),
                            i = t + 3;
                        if (128 & o && (i += 2), 64 & o) {
                            var s = e.readUInt8(i);
                            i += s + 1
                        }
                        return 32 & o && (i += 2), n.DescriptorArray.decode(e, i, r)
                    }, n.DecoderConfigDescriptor = {}, n.DecoderConfigDescriptor.decode = function(e, t, r) {
                        var o = e.readUInt8(t),
                            i = n.DescriptorArray.decode(e, t + 13, r);
                        return i.oti = o, i
                    }
                }).call(this, e("buffer").Buffer)
            }, {
                buffer: 25
            }
        ],
        118: [
            function(e, t, n) {
                (function(t) {
                    var r = e("uint64be"),
                        o = e("./boxes"),
                        i = 4294967295,
                        s = n,
                        a = n.containers = {
                            moov: ["mvhd", "meta", "traks", "mvex"],
                            trak: ["tkhd", "tref", "trgr", "edts", "meta", "mdia", "udta"],
                            edts: ["elst"],
                            mdia: ["mdhd", "hdlr", "elng", "minf"],
                            minf: ["vmhd", "smhd", "hmhd", "sthd", "nmhd", "dinf", "stbl"],
                            dinf: ["dref"],
                            stbl: ["stsd", "stts", "ctts", "cslg", "stsc", "stsz", "stz2", "stco", "co64", "stss", "stsh", "padb", "stdp", "sdtp", "sbgps", "sgpds", "subss", "saizs", "saios"],
                            mvex: ["mehd", "trexs", "leva"],
                            moof: ["mfhd", "meta", "trafs"],
                            traf: ["tfhd", "trun", "sbgps", "sgpds", "subss", "saizs", "saios", "tfdt", "meta"]
                        };
                    s.encode = function(e, n, r) {
                        return s.encodingLength(e), r = r || 0, n = n || new t(e.length), s._encode(e, n, r)
                    }, s._encode = function(e, t, n) {
                        var c = e.type,
                            u = e.length;
                        u > i && (u = 1), t.writeUInt32BE(u, n), t.write(e.type, n + 4, 4, "ascii");
                        var f = n + 8;
                        if (1 === u && (r.encode(e.length, t, f), f += 8), o.fullBoxes[c] && (t.writeUInt32BE(e.flags || 0, f), t.writeUInt8(e.version || 0, f), f += 4), a[c]) {
                            var d = a[c];
                            d.forEach(function(n) {
                                if (5 === n.length) {
                                    var r = e[n] || [];
                                    n = n.substr(0, 4), r.forEach(function(e) {
                                        s._encode(e, t, f), f += s.encode.bytes
                                    })
                                } else e[n] && (s._encode(e[n], t, f), f += s.encode.bytes)
                            }), e.otherBoxes && e.otherBoxes.forEach(function(e) {
                                s._encode(e, t, f), f += s.encode.bytes
                            })
                        } else if (o[c]) {
                            var h = o[c].encode;
                            h(e, t, f), f += h.bytes
                        } else {
                            if (!e.buffer) throw new Error("Either `type` must be set to a known type (not'" + c + "') or `buffer` must be set");
                            var l = e.buffer;
                            l.copy(t, f), f += e.buffer.length
                        }
                        return s.encode.bytes = f - n, t
                    }, s.readHeaders = function(e, t, n) {
                        if (t = t || 0, n = n || e.length, 8 > n - t) return 8;
                        var i = e.readUInt32BE(t),
                            s = e.toString("ascii", t + 4, t + 8),
                            a = t + 8;
                        if (1 === i) {
                            if (16 > n - t) return 16;
                            i = r.decode(e, a), a += 8
                        }
                        var c, u;
                        return o.fullBoxes[s] && (c = e.readUInt8(a), u = 16777215 & e.readUInt32BE(a), a += 4), {
                            length: i,
                            headersLen: a - t,
                            contentLen: i - (a - t),
                            type: s,
                            version: c,
                            flags: u
                        }
                    }, s.decode = function(e, t, n) {
                        t = t || 0, n = n || e.length;
                        var r = s.readHeaders(e, t, n);
                        if (!r || r.length > n - t) throw new Error("Data too short");
                        return s.decodeWithoutHeaders(r, e, t + r.headersLen, t + r.length)
                    }, s.decodeWithoutHeaders = function(e, n, r, i) {
                        r = r || 0, i = i || n.length;
                        var c = e.type,
                            u = {};
                        if (a[c]) {
                            u.otherBoxes = [];
                            for (var f = a[c], d = r; i - d >= 8;) {
                                var h = s.decode(n, d, i);
                                if (d += h.length, f.indexOf(h.type) >= 0) u[h.type] = h;
                                else if (f.indexOf(h.type + "s") >= 0) {
                                    var l = h.type + "s",
                                        p = u[l] = u[l] || [];
                                    p.push(h)
                                } else u.otherBoxes.push(h)
                            }
                        } else if (o[c]) {
                            var m = o[c].decode;
                            u = m(n, r, i)
                        } else u.buffer = new t(n.slice(r, i));
                        return u.length = e.length, u.contentLen = e.contentLen, u.type = e.type, u.version = e.version, u.flags = e.flags, u
                    }, s.encodingLength = function(e) {
                        var t = e.type,
                            n = 8;
                        if (o.fullBoxes[t] && (n += 4), a[t]) {
                            var r = a[t];
                            r.forEach(function(t) {
                                if (5 === t.length) {
                                    var r = e[t] || [];
                                    t = t.substr(0, 4), r.forEach(function(e) {
                                        e.type = t, n += s.encodingLength(e)
                                    })
                                } else if (e[t]) {
                                    var o = e[t];
                                    o.type = t, n += s.encodingLength(o)
                                }
                            }), e.otherBoxes && e.otherBoxes.forEach(function(e) {
                                n += s.encodingLength(e)
                            })
                        } else if (o[t]) n += o[t].encodingLength(e);
                        else {
                            if (!e.buffer) throw new Error("Either `type` must be set to a known type (not'" + t + "') or `buffer` must be set");
                            n += e.buffer.length
                        }
                        return n > i && (n += 8), e.length = n, n
                    }
                }).call(this, e("buffer").Buffer)
            }, {
                "./boxes": 116,
                buffer: 25,
                uint64be: 119
            }
        ],
        119: [
            function(e, t, n) {
                (function(e) {
                    var t = 4294967295;
                    n.encodingLength = function() {
                        return 8
                    }, n.encode = function(n, r, o) {
                        r || (r = new e(8)), o || (o = 0);
                        var i = Math.floor(n / t),
                            s = n - i * t;
                        return r.writeUInt32BE(i, o), r.writeUInt32BE(s, o + 4), r
                    }, n.decode = function(n, r) {
                        r || (r = 0), n || (n = new e(4)), r || (r = 0);
                        var o = n.readUInt32BE(r),
                            i = n.readUInt32BE(r + 4);
                        return o * t + i
                    }, n.encode.bytes = 8, n.decode.bytes = 8
                }).call(this, e("buffer").Buffer)
            }, {
                buffer: 25
            }
        ],
        120: [
            function(e, t, n) {
                (function(n) {
                    function r() {
                        return this instanceof r ? (i.Writable.call(this), this.destroyed = !1, this._pending = 0, this._missing = 0, this._buf = null, this._str = null, this._cb = null, this._ondrain = null, this._writeBuffer = null, this._writeCb = null, this._ondrain = null, void this._kick()) : new r
                    }

                    function o(e) {
                        this._parent = e, this.destroyed = !1, i.PassThrough.call(this)
                    }
                    var i = e("readable-stream"),
                        s = e("inherits"),
                        a = e("next-event"),
                        c = e("mp4-box-encoding"),
                        u = new n(0);
                    t.exports = r, s(r, i.Writable), r.prototype.destroy = function(e) {
                        this.destroyed || (this.destroyed = !0, e && this.emit("error", e), this.emit("close"))
                    }, r.prototype._write = function(e, t, n) {
                        if (!this.destroyed) {
                            for (var r = !this._str || !this._str._writableState.needDrain; e.length && !this.destroyed;) {
                                if (!this._missing) return this._writeBuffer = e, void(this._writeCb = n);
                                var o = e.length < this._missing ? e.length : this._missing;
                                if (this._buf ? e.copy(this._buf, this._buf.length - this._missing) : this._str && (r = this._str.write(o === e.length ? e : e.slice(0, o))), this._missing -= o, !this._missing) {
                                    var i = this._buf,
                                        s = this._cb,
                                        a = this._str;
                                    this._buf = this._cb = this._str = this._ondrain = null, r = !0, a && a.end(), s && s(i)
                                }
                                e = o === e.length ? u : e.slice(o)
                            }
                            return this._pending && !this._missing ? (this._writeBuffer = e, void(this._writeCb = n)) : void(r ? n() : this._ondrain(n))
                        }
                    }, r.prototype._buffer = function(e, t) {
                        this._missing = e, this._buf = new n(e), this._cb = t
                    }, r.prototype._stream = function(e, t) {
                        var n = this;
                        return this._missing = e, this._str = new o(this), this._ondrain = a(this._str, "drain"), this._pending++, this._str.on("end", function() {
                            n._pending--, n._kick()
                        }), this._cb = t, this._str
                    }, r.prototype._readBox = function() {
                        function e(r, o) {
                            t._buffer(r, function(r) {
                                o = o ? n.concat(o, r) : r;
                                var i = c.readHeaders(o);
                                "number" == typeof i ? e(i - o.length, o) : (t._pending++, t._headers = i, t.emit("box", i))
                            })
                        }
                        var t = this;
                        e(8)
                    }, r.prototype.stream = function() {
                        var e = this;
                        if (!e._headers) throw new Error("this function can only be called once after 'box' is emitted");
                        var t = e._headers;
                        return e._headers = null, e._stream(t.contentLen, null)
                    }, r.prototype.decode = function(e) {
                        var t = this;
                        if (!t._headers) throw new Error("this function can only be called once after 'box' is emitted");
                        var n = t._headers;
                        t._headers = null, t._buffer(n.contentLen, function(r) {
                            var o = c.decodeWithoutHeaders(n, r);
                            e(o), t._pending--, t._kick()
                        })
                    }, r.prototype.ignore = function() {
                        var e = this;
                        if (!e._headers) throw new Error("this function can only be called once after 'box' is emitted");
                        var t = e._headers;
                        e._headers = null, this._missing = t.contentLen, this._cb = function() {
                            e._pending--, e._kick()
                        }
                    }, r.prototype._kick = function() {
                        if (!this._pending && (this._buf || this._str || this._readBox(), this._writeBuffer)) {
                            var e = this._writeCb,
                                t = this._writeBuffer;
                            this._writeBuffer = null, this._writeCb = null, this._write(t, null, e)
                        }
                    }, s(o, i.PassThrough), o.prototype.destroy = function(e) {
                        this.destroyed || (this.destroyed = !0, this._parent.destroy(e), e && this.emit("error", e), this.emit("close"))
                    }
                }).call(this, e("buffer").Buffer)
            }, {
                buffer: 25,
                inherits: 76,
                "mp4-box-encoding": 118,
                "next-event": 123,
                "readable-stream": 106
            }
        ],
        121: [
            function(e, t, n) {
                (function(n, r) {
                    function o() {}

                    function i() {
                        function e() {
                            n._want && (n._want = !1, n._read())
                        }

                        function t() {
                            n._stream = null
                        }
                        if (!(this instanceof i)) return new i;
                        a.Readable.call(this), this.destroyed = !1, this._reading = !1, this._stream = null, this._drain = null, this._want = !1, this._onreadable = e, this._onend = t;
                        var n = this
                    }

                    function s(e) {
                        this._parent = e, this.destroyed = !1, a.PassThrough.call(this)
                    }
                    var a = e("readable-stream"),
                        c = e("inherits"),
                        u = e("mp4-box-encoding");
                    t.exports = i, c(i, a.Readable), i.prototype.mediaData = i.prototype.mdat = function(e, t) {
                        var n = new s(this);
                        return this.box({
                            type: "mdat",
                            contentLength: e,
                            encodeBufferLen: 8,
                            stream: n
                        }, t), n
                    }, i.prototype.box = function(e, t) {
                        if (t || (t = o), this.destroyed) return t(new Error("Encoder is destroyed"));
                        var i;
                        if (e.encodeBufferLen && (i = new r(e.encodeBufferLen)), e.stream) e.buffer = null, i = u.encode(e, i), this.push(i), this._stream = e.stream, this._stream.on("readable", this._onreadable), this._stream.on("end", this._onend), this._stream.on("end", t), this._forward();
                        else {
                            i = u.encode(e, i);
                            var s = this.push(i);
                            if (s) return n.nextTick(t);
                            this._drain = t
                        }
                    }, i.prototype.destroy = function(e) {
                        if (!this.destroyed) {
                            if (this.destroyed = !0, this._stream && this._stream.destroy && this._stream.destroy(), this._stream = null, this._drain) {
                                var t = this._drain;
                                this._drain = null, t(e)
                            }
                            e && this.emit("error", e), this.emit("close")
                        }
                    }, i.prototype.finalize = function() {
                        this.push(null)
                    }, i.prototype._forward = function() {
                        if (this._stream)
                            for (; !this.destroyed;) {
                                var e = this._stream.read();
                                if (!e) return void(this._want = !! this._stream);
                                if (!this.push(e)) return
                            }
                    }, i.prototype._read = function() {
                        if (!this._reading && !this.destroyed) {
                            if (this._reading = !0, this._stream && this._forward(), this._drain) {
                                var e = this._drain;
                                this._drain = null, e()
                            }
                            this._reading = !1
                        }
                    }, c(s, a.PassThrough), s.prototype.destroy = function(e) {
                        this.destroyed || (this.destroyed = !0, this._parent.destroy(e), e && this.emit("error", e), this.emit("close"))
                    }
                }).call(this, e("_process"), e("buffer").Buffer)
            }, {
                _process: 33,
                buffer: 25,
                inherits: 76,
                "mp4-box-encoding": 118,
                "readable-stream": 106
            }
        ],
        122: [
            function(e, t, n) {
                n.decode = e("./decode"), n.encode = e("./encode")
            }, {
                "./decode": 120,
                "./encode": 121
            }
        ],
        123: [
            function(e, t, n) {
                function r(e, t) {
                    var n = null;
                    return e.on(t, function(e) {
                        if (n) {
                            var t = n;
                            n = null, t(e)
                        }
                    }),
                    function(e) {
                        n = e
                    }
                }
                t.exports = r
            }, {}
        ],
        124: [
            function(e, t, n) {
                function r(e) {
                    var t = this;
                    return t instanceof r ? (i.Writable.call(t), t.destroyed = !1, t._queue = [], t._position = e || 0, t._cb = null, t._buffer = null, void(t._out = null)) : new r(e)
                }
                var o = e("inherits"),
                    i = e("readable-stream");
                t.exports = r, o(r, i.Writable), r.prototype._write = function(e, t, n) {
                    for (var r = this, o = !0;;) {
                        if (r.destroyed) return;
                        if (0 === r._queue.length) return r._buffer = e, void(r._cb = n);
                        r._buffer = null;
                        var i = r._queue[0],
                            s = Math.max(i.start - r._position, 0),
                            a = i.end - r._position;
                        if (s >= e.length) return r._position += e.length, n(null);
                        var c;
                        if (a > e.length) {
                            r._position += e.length, c = 0 === s ? e : e.slice(s), o = i.stream.write(c) && o;
                            break
                        }
                        r._position += a, c = 0 === s && a === e.length ? e : e.slice(s, a), o = i.stream.write(c) && o, i.last && i.stream.end(), e = e.slice(a), r._queue.shift()
                    }
                    o ? n(null) : i.stream.once("drain", n.bind(null, null))
                }, r.prototype.slice = function(e) {
                    var t = this;
                    if (t.destroyed) return null;
                    e instanceof Array || (e = [e]);
                    var n = new i.PassThrough;
                    return e.forEach(function(r, o) {
                        t._queue.push({
                            start: r.start,
                            end: r.end,
                            stream: n,
                            last: o === e.length - 1
                        })
                    }), t._buffer && t._write(t._buffer, null, t._cb), n
                }, r.prototype.destroy = function(e) {
                    var t = this;
                    t.destroyed || (t.destroyed = !0, e && t.emit("error", e))
                }
            }, {
                inherits: 76,
                "readable-stream": 106
            }
        ],
        125: [
            function(e, t, n) {
                function r(e, t, n) {
                    var i = this;
                    return this instanceof r ? (n = n || {}, i._elem = t, i._elemWrapper = new o(t), i._waitingFired = !1, i._trackMeta = null, i._file = e, i._tracks = null, "none" !== i._elem.preload && i._createMuxer(), i._onError = function(e) {
                        i.destroy()
                    }, i._onWaiting = function() {
                        i._waitingFired = !0, i._muxer ? i._tracks && i._pump() : i._createMuxer()
                    }, i._elem.addEventListener("waiting", i._onWaiting), void i._elem.addEventListener("error", i._onError)) : new r(e, t, n)
                }
                var o = e("mediasource"),
                    i = e("pump"),
                    s = e("./mp4-remuxer");
                t.exports = r, r.prototype._createMuxer = function() {
                    var e = this;
                    e._muxer = new s(e._file), e._muxer.on("ready", function(t) {
                        e._tracks = t.map(function(t) {
                            var n = e._elemWrapper.createWriteStream(t.mime);
                            return n.on("error", function(t) {
                                e._elemWrapper.error(t)
                            }), n.write(t.init), {
                                muxed: null,
                                mediaSource: n
                            }
                        }), (e._waitingFired || "auto" === e._elem.preload) && e._pump()
                    }), e._muxer.on("error", function(t) {
                        e._elemWrapper.error(t)
                    })
                }, r.prototype._pump = function() {
                    var e = this,
                        t = e._muxer.seek(e._elem.currentTime, !e._tracks);
                    e._tracks.forEach(function(n, r) {
                        n.muxed && (n.muxed.destroy(), n.mediaSource = e._elemWrapper.createWriteStream(n.mediaSource), n.mediaSource.on("error", function(t) {
                            e._elemWrapper.error(t)
                        })), n.muxed = t[r], i(n.muxed, n.mediaSource)
                    })
                }, r.prototype.destroy = function() {
                    var e = this;
                    e.destroyed || (e.destroyed = !0, e._elem.removeEventListener("waiting", e._onWaiting), e._elem.removeEventListener("error", e._onError), e._tracks && e._tracks.forEach(function(e) {
                        e.muxed.destroy()
                    }), e._elem.src = "")
                }
            }, {
                "./mp4-remuxer": 114,
                mediasource: 112,
                pump: 89
            }
        ],
        126: [
            function(e, t, n) {
                (function(e) {
                    t.exports = function(t, n, r) {
                        function o(t) {
                            function n() {
                                r && r(t, s), r = null
                            }
                            d ? e.nextTick(n) : n()
                        }

                        function i(e, n, r) {
                            if (s[e] = r, n && (f = !0), 0 === --c || n) o(n);
                            else if (!f && a > h) {
                                var d;
                                u ? (d = u[h], h += 1, t[d](i.bind(void 0, d))) : (d = h, h += 1, t[d](i.bind(void 0, d)))
                            }
                        }
                        if ("number" != typeof n) throw new Error("second argument must be a Number");
                        var s, a, c, u, f, d = !0;
                        Array.isArray(t) ? (s = [], c = a = t.length) : (u = Object.keys(t), s = {}, c = a = u.length);
                        var h = n;
                        c ? u ? u.some(function(e, r) {
                            return t[e](i.bind(void 0, e)), r === n - 1 ? !0 : void 0
                        }) : t.some(function(e, t) {
                            return e(i.bind(void 0, t)), t === n - 1 ? !0 : void 0
                        }) : o(null), d = !1
                    }
                }).call(this, e("_process"))
            }, {
                _process: 33
            }
        ],
        127: [
            function(e, t, n) {
                (function(e) {
                    t.exports = function(t, n) {
                        function r(t) {
                            function r() {
                                n && n(t, i), n = null
                            }
                            c ? e.nextTick(r) : r()
                        }

                        function o(e, t, n) {
                            i[e] = n, (0 === --s || t) && r(t)
                        }
                        var i, s, a, c = !0;
                        Array.isArray(t) ? (i = [], s = t.length) : (a = Object.keys(t), i = {}, s = a.length), s ? a ? a.forEach(function(e) {
                            t[e](o.bind(void 0, e))
                        }) : t.forEach(function(e, t) {
                            e(o.bind(void 0, t))
                        }) : r(null), c = !1
                    }
                }).call(this, e("_process"))
            }, {
                _process: 33
            }
        ],
        128: [
            function(e, t, n) {
                (function(n) {
                    function r(e, t) {
                        e = "string" == typeof e ? {
                            url: e
                        } : i(e), t = c(t), e.url && o(e), null == e.headers && (e.headers = {}), null == e.maxRedirects && (e.maxRedirects = 10);
                        var n = e.body;
                        e.body = void 0, n && !e.method && (e.method = "POST");
                        var f = Object.keys(e.headers).some(function(e) {
                            return "accept-encoding" === e.toLowerCase()
                        });
                        f || (e.headers["accept-encoding"] = "gzip, deflate");
                        var d = "https:" === e.protocol ? a : s,
                            h = d.request(e, function(n) {
                                return n.statusCode >= 300 && n.statusCode < 400 && "location" in n.headers ? (e.url = n.headers.location, o(e), n.resume(), e.maxRedirects -= 1, void(e.maxRedirects > 0 ? r(e, t) : t(new Error("too many redirects")))) : void t(null, "function" == typeof u ? u(n) : n)
                            });
                        return h.on("error", t), h.end(n), h
                    }

                    function o(e) {
                        var t = f.parse(e.url);
                        t.hostname && (e.hostname = t.hostname), t.port && (e.port = t.port), t.protocol && (e.protocol = t.protocol), e.path = t.path, delete e.url
                    }
                    t.exports = r;
                    var i = e("xtend"),
                        s = e("http"),
                        a = e("https"),
                        c = e("once"),
                        u = e("unzip-response"),
                        f = e("url");
                    t.exports.concat = function(e, t) {
                        return r(e, function(e, r) {
                            if (e) return t(e);
                            var o = [];
                            r.on("data", function(e) {
                                o.push(e)
                            }), r.on("end", function() {
                                t(null, r, n.concat(o))
                            })
                        })
                    }, ["get", "post", "put", "patch", "head", "delete"].forEach(function(e) {
                        t.exports[e] = function(t, n) {
                            return "string" == typeof t && (t = {
                                url: t
                            }), t.method = e.toUpperCase(), r(t, n)
                        }
                    })
                }).call(this, e("buffer").Buffer)
            }, {
                buffer: 25,
                http: 39,
                https: 30,
                once: 130,
                "unzip-response": 24,
                url: 45,
                xtend: 152
            }
        ],
        129: [
            function(e, t, n) {
                arguments[4][20][0].apply(n, arguments)
            }, {
                dup: 20
            }
        ],
        130: [
            function(e, t, n) {
                arguments[4][21][0].apply(n, arguments)
            }, {
                dup: 21,
                wrappy: 129
            }
        ],
        131: [
            function(e, t, n) {
                (function(n) {
                    function r(e) {
                        var t = this;
                        if (!(t instanceof r)) return new r(e);
                        if (t._debug("new peer %o", e), e || (e = {}), e.allowHalfOpen = !1, null == e.highWaterMark && (e.highWaterMark = 1048576), f.Duplex.call(t, e), t.initiator = e.initiator || !1, t.channelConfig = e.channelConfig || r.channelConfig, t.channelName = e.initiator ? e.channelName || a(160) : null, t.config = e.config || r.config, t.constraints = e.constraints || r.constraints, t.offerConstraints = e.offerConstraints, t.answerConstraints = e.answerConstraints, t.reconnectTimer = e.reconnectTimer || !1, t.sdpTransform = e.sdpTransform || function(e) {
                            return e
                        }, t.stream = e.stream || !1, t.trickle = void 0 !== e.trickle ? e.trickle : !0, t.destroyed = !1, t.connected = !1, t.remoteAddress = void 0, t.remoteFamily = void 0, t.remotePort = void 0, t.localAddress = void 0, t.localPort = void 0, t._isWrtc = !! e.wrtc, t._wrtc = e.wrtc || s(), !t._wrtc) throw "undefined" == typeof window ? new Error("No WebRTC support: Specify `opts.wrtc` option in this environment") : new Error("No WebRTC support: Not a supported browser");
                        t._maxBufferedAmount = e.highWaterMark, t._pcReady = !1, t._channelReady = !1, t._iceComplete = !1, t._channel = null, t._pendingCandidates = [], t._chunk = null, t._cb = null, t._interval = null, t._reconnectTimeout = null, t._pc = new t._wrtc.RTCPeerConnection(t.config, t.constraints), t._pc.oniceconnectionstatechange = t._onIceConnectionStateChange.bind(t), t._pc.onsignalingstatechange = t._onSignalingStateChange.bind(t), t._pc.onicecandidate = t._onIceCandidate.bind(t), t.stream && t._pc.addStream(t.stream), t._pc.onaddstream = t._onAddStream.bind(t), t.initiator ? (t._setupData({
                            channel: t._pc.createDataChannel(t.channelName, t.channelConfig)
                        }), t._pc.onnegotiationneeded = u(t._createOffer.bind(t)), "undefined" != typeof window && window.webkitRTCPeerConnection || t._pc.onnegotiationneeded()) : t._pc.ondatachannel = t._setupData.bind(t), t.on("finish", function() {
                            t.connected ? setTimeout(function() {
                                t._destroy()
                            }, 100) : t.once("connect", function() {
                                setTimeout(function() {
                                    t._destroy()
                                }, 100)
                            })
                        })
                    }

                    function o() {}
                    t.exports = r;
                    var i = e("debug")("simple-peer"),
                        s = e("get-browser-rtc"),
                        a = e("hat"),
                        c = e("inherits"),
                        u = e("once"),
                        f = e("readable-stream");
                    c(r, f.Duplex), r.WEBRTC_SUPPORT = !! s(), r.config = {
                        iceServers: [{
                            url: "stun:23.21.150.121",
                            urls: "stun:23.21.150.121"
                        }]
                    }, r.constraints = {}, r.channelConfig = {}, Object.defineProperty(r.prototype, "bufferSize", {
                        get: function() {
                            var e = this;
                            return e._channel && e._channel.bufferedAmount || 0
                        }
                    }), r.prototype.address = function() {
                        var e = this;
                        return {
                            port: e.localPort,
                            family: "IPv4",
                            address: e.localAddress
                        }
                    }, r.prototype.signal = function(e) {
                        function t(e) {
                            try {
                                n._pc.addIceCandidate(new n._wrtc.RTCIceCandidate(e), o, n._onError.bind(n))
                            } catch (t) {
                                n._destroy(new Error("error adding candidate: " + t.message))
                            }
                        }
                        var n = this;
                        if (n.destroyed) throw new Error("cannot signal after peer is destroyed");
                        if ("string" == typeof e) try {
                            e = JSON.parse(e)
                        } catch (r) {
                            e = {}
                        }
                        n._debug("signal()"), e.sdp && n._pc.setRemoteDescription(new n._wrtc.RTCSessionDescription(e), function() {
                            n.destroyed || ("offer" === n._pc.remoteDescription.type && n._createAnswer(), n._pendingCandidates.forEach(t), n._pendingCandidates = [])
                        }, n._onError.bind(n)), e.candidate && (n._pc.remoteDescription ? t(e.candidate) : n._pendingCandidates.push(e.candidate)), e.sdp || e.candidate || n._destroy(new Error("signal() called with invalid signal data"))
                    }, r.prototype.send = function(e) {
                        var t = this;
                        n.isBuffer(e) && t._isWrtc && (e = new Uint8Array(e));
                        var r = e.length || e.byteLength || e.size;
                        t._channel.send(e), t._debug("write: %d bytes", r)
                    }, r.prototype.destroy = function(e) {
                        var t = this;
                        t._destroy(null, e)
                    }, r.prototype._destroy = function(e, t) {
                        var n = this;
                        if (!n.destroyed) {
                            if (t && n.once("close", t), n._debug("destroy (error: %s)", e && e.message), n.readable = n.writable = !1, n._readableState.ended || n.push(null), n._writableState.finished || n.end(), n.destroyed = !0, n.connected = !1, n._pcReady = !1, n._channelReady = !1, n._chunk = null, n._cb = null, clearInterval(n._interval), clearTimeout(n._reconnectTimeout), n._pc) {
                                try {
                                    n._pc.close()
                                } catch (e) {}
                                n._pc.oniceconnectionstatechange = null, n._pc.onsignalingstatechange = null, n._pc.onicecandidate = null
                            }
                            if (n._channel) {
                                try {
                                    n._channel.close()
                                } catch (e) {}
                                n._channel.onmessage = null, n._channel.onopen = null, n._channel.onclose = null
                            }
                            n._pc = null, n._channel = null, e && n.emit("error", e), n.emit("close")
                        }
                    }, r.prototype._setupData = function(e) {
                        var t = this;
                        t._channel = e.channel, t.channelName = t._channel.label, t._channel.binaryType = "arraybuffer", t._channel.onmessage = t._onChannelMessage.bind(t), t._channel.onopen = t._onChannelOpen.bind(t), t._channel.onclose = t._onChannelClose.bind(t)
                    }, r.prototype._read = function() {}, r.prototype._write = function(e, t, n) {
                        var r = this;
                        if (r.destroyed) return n(new Error("cannot write after peer is destroyed"));
                        if (r.connected) {
                            try {
                                r.send(e)
                            } catch (o) {
                                return r._onError(o)
                            }
                            r._channel.bufferedAmount > r._maxBufferedAmount ? (r._debug("start backpressure: bufferedAmount %d", r._channel.bufferedAmount), r._cb = n) : n(null)
                        } else r._debug("write before connect"), r._chunk = e, r._cb = n
                    }, r.prototype._createOffer = function() {
                        var e = this;
                        e.destroyed || e._pc.createOffer(function(t) {
                            if (!e.destroyed) {
                                t.sdp = e.sdpTransform(t.sdp), e._pc.setLocalDescription(t, o, e._onError.bind(e));
                                var n = function() {
                                    var n = e._pc.localDescription || t;
                                    e._debug("signal"), e.emit("signal", {
                                        type: n.type,
                                        sdp: n.sdp
                                    })
                                };
                                e.trickle || e._iceComplete ? n() : e.once("_iceComplete", n)
                            }
                        }, e._onError.bind(e), e.offerConstraints)
                    }, r.prototype._createAnswer = function() {
                        var e = this;
                        e.destroyed || e._pc.createAnswer(function(t) {
                            if (!e.destroyed) {
                                t.sdp = e.sdpTransform(t.sdp), e._pc.setLocalDescription(t, o, e._onError.bind(e));
                                var n = function() {
                                    var n = e._pc.localDescription || t;
                                    e._debug("signal"), e.emit("signal", {
                                        type: n.type,
                                        sdp: n.sdp
                                    })
                                };
                                e.trickle || e._iceComplete ? n() : e.once("_iceComplete", n)
                            }
                        }, e._onError.bind(e), e.answerConstraints)
                    }, r.prototype._onIceConnectionStateChange = function() {
                        var e = this;
                        if (!e.destroyed) {
                            var t = e._pc.iceGatheringState,
                                n = e._pc.iceConnectionState;
                            e._debug("iceConnectionStateChange %s %s", t, n), e.emit("iceConnectionStateChange", t, n), "connected" !== n && "completed" !== n || (clearTimeout(e._reconnectTimeout), e._pcReady = !0, e._maybeReady()), "disconnected" === n && (e.reconnectTimer ? (clearTimeout(e._reconnectTimeout), e._reconnectTimeout = setTimeout(function() {
                                e._destroy()
                            }, e.reconnectTimer)) : e._destroy()), "failed" === n && e._destroy(), "closed" === n && e._destroy()
                        }
                    }, r.prototype.getStats = function(e) {
                        var t = this;
                        t._pc.getStats ? "undefined" != typeof window && window.mozRTCPeerConnection ? t._pc.getStats(null, function(t) {
                            var n = [];
                            t.forEach(function(e) {
                                n.push(e)
                            }), e(n)
                        }, t._onError.bind(t)) : t._pc.getStats(function(t) {
                            var n = [];
                            t.result().forEach(function(e) {
                                var t = {};
                                e.names().forEach(function(n) {
                                    t[n] = e.stat(n)
                                }), t.id = e.id, t.type = e.type, t.timestamp = e.timestamp, n.push(t)
                            }), e(n)
                        }) : e([])
                    }, r.prototype._maybeReady = function() {
                        var e = this;
                        e._debug("maybeReady pc %s channel %s", e._pcReady, e._channelReady), !e.connected && !e._connecting && e._pcReady && e._channelReady && (e._connecting = !0, e.getStats(function(t) {
                            function n(t) {
                                var n = o[t.localCandidateId],
                                    i = r[t.remoteCandidateId];
                                n ? (e.localAddress = n.ipAddress, e.localPort = Number(n.portNumber)) : "string" == typeof t.googLocalAddress && (n = t.googLocalAddress.split(":"), e.localAddress = n[0], e.localPort = Number(n[1])), e._debug("connect local: %s:%s", e.localAddress, e.localPort), i ? (e.remoteAddress = i.ipAddress, e.remotePort = Number(i.portNumber), e.remoteFamily = "IPv4") : "string" == typeof t.googRemoteAddress && (i = t.googRemoteAddress.split(":"), e.remoteAddress = i[0], e.remotePort = Number(i[1]), e.remoteFamily = "IPv4"), e._debug("connect remote: %s:%s", e.remoteAddress, e.remotePort)
                            }
                            e._connecting = !1, e.connected = !0;
                            var r = {}, o = {};
                            if (t.forEach(function(e) {
                                "remotecandidate" === e.type && (r[e.id] = e), "localcandidate" === e.type && (o[e.id] = e)
                            }), t.forEach(function(e) {
                                var t = "googCandidatePair" === e.type && "true" === e.googActiveConnection || "candidatepair" === e.type && e.selected;
                                t && n(e)
                            }), e._chunk) {
                                try {
                                    e.send(e._chunk)
                                } catch (i) {
                                    return e._onError(i)
                                }
                                e._chunk = null, e._debug('sent chunk from "write before connect"');
                                var s = e._cb;
                                e._cb = null, s(null)
                            }
                            e._interval = setInterval(function() {
                                if (e._cb && e._channel && !(e._channel.bufferedAmount > e._maxBufferedAmount)) {
                                    e._debug("ending backpressure: bufferedAmount %d", e._channel.bufferedAmount);
                                    var t = e._cb;
                                    e._cb = null, t(null)
                                }
                            }, 150), e._interval.unref && e._interval.unref(), e._debug("connect"), e.emit("connect")
                        }))
                    }, r.prototype._onSignalingStateChange = function() {
                        var e = this;
                        e.destroyed || (e._debug("signalingStateChange %s", e._pc.signalingState), e.emit("signalingStateChange", e._pc.signalingState))
                    }, r.prototype._onIceCandidate = function(e) {
                        var t = this;
                        t.destroyed || (e.candidate && t.trickle ? t.emit("signal", {
                            candidate: {
                                candidate: e.candidate.candidate,
                                sdpMLineIndex: e.candidate.sdpMLineIndex,
                                sdpMid: e.candidate.sdpMid
                            }
                        }) : e.candidate || (t._iceComplete = !0, t.emit("_iceComplete")))
                    }, r.prototype._onChannelMessage = function(e) {
                        var t = this;
                        if (!t.destroyed) {
                            var r = e.data;
                            t._debug("read: %d bytes", r.byteLength || r.length), r instanceof ArrayBuffer && (r = new n(r)), t.push(r)
                        }
                    }, r.prototype._onChannelOpen = function() {
                        var e = this;
                        e.connected || e.destroyed || (e._debug("on channel open"), e._channelReady = !0, e._maybeReady())
                    }, r.prototype._onChannelClose = function() {
                        var e = this;
                        e.destroyed || (e._debug("on channel close"), e._destroy())
                    }, r.prototype._onAddStream = function(e) {
                        var t = this;
                        t.destroyed || (t._debug("on add stream"), t.emit("stream", e.stream))
                    }, r.prototype._onError = function(e) {
                        var t = this;
                        t.destroyed || (t._debug("error %s", e.message || e), t._destroy(e))
                    }, r.prototype._debug = function() {
                        var e = this,
                            t = [].slice.call(arguments),
                            n = e.channelName && e.channelName.substring(0, 7);
                        t[0] = "[" + n + "] " + t[0], i.apply(null, t)
                    }
                }).call(this, e("buffer").Buffer)
            }, {
                buffer: 25,
                debug: 68,
                "get-browser-rtc": 132,
                hat: 74,
                inherits: 76,
                once: 134,
                "readable-stream": 106
            }
        ],
        132: [
            function(e, t, n) {
                t.exports = function() {
                    if ("undefined" == typeof window) return null;
                    var e = {
                        RTCPeerConnection: window.RTCPeerConnection || window.mozRTCPeerConnection || window.webkitRTCPeerConnection,
                        RTCSessionDescription: window.RTCSessionDescription || window.mozRTCSessionDescription || window.webkitRTCSessionDescription,
                        RTCIceCandidate: window.RTCIceCandidate || window.mozRTCIceCandidate || window.webkitRTCIceCandidate
                    };
                    return e.RTCPeerConnection ? e : null
                }
            }, {}
        ],
        133: [
            function(e, t, n) {
                arguments[4][20][0].apply(n, arguments)
            }, {
                dup: 20
            }
        ],
        134: [
            function(e, t, n) {
                arguments[4][21][0].apply(n, arguments)
            }, {
                dup: 21,
                wrappy: 133
            }
        ],
        135: [
            function(e, t, n) {
                function r(e, t) {
                    return u ? ("string" == typeof e && (e = o(e)), void u.digest({
                        name: "sha-1"
                    }, e).then(function(e) {
                        t(i(new Uint8Array(e)))
                    }, function(n) {
                        t(f(e))
                    })) : void setTimeout(t, 0, f(e))
                }

                function o(e) {
                    for (var t = e.length, n = new Uint8Array(t), r = 0; t > r; r++) n[r] = e.charCodeAt(r);
                    return n
                }

                function i(e) {
                    for (var t = e.length, n = [], r = 0; t > r; r++) {
                        var o = e[r];
                        n.push((o >>> 4).toString(16)), n.push((15 & o).toString(16))
                    }
                    return n.join("")
                }
                var s = e("rusha"),
                    a = new s,
                    c = window.crypto || window.msCrypto || {}, u = c.subtle || c.webkitSubtle,
                    f = a.digest.bind(a);
                try {
                    u.digest({
                        name: "sha-1"
                    }, new Uint8Array)["catch"](function() {
                        u = !1
                    })
                } catch (d) {
                    u = !1
                }
                t.exports = r, t.exports.sync = f
            }, {
                rusha: 136
            }
        ],
        136: [
            function(e, t, n) {
                (function(e) {
                    ! function() {
                        function n(e) {
                            "use strict";
                            var t = {
                                fill: 0
                            }, i = function(e) {
                                    for (e += 9; e % 64 > 0; e += 1);
                                    return e
                                }, s = function(e, t) {
                                    for (var n = t >> 2; n < e.length; n++) e[n] = 0
                                }, a = function(e, t, n) {
                                    e[t >> 2] |= 128 << 24 - (t % 4 << 3), e[((t >> 2) + 2 & -16) + 14] = n >> 29, e[((t >> 2) + 2 & -16) + 15] = n << 3
                                }, c = function(e, t, n, r, o) {
                                    var i, s = this,
                                        a = o % 4,
                                        c = r % 4,
                                        u = r - c;
                                    if (u > 0) switch (a) {
                                        case 0:
                                            e[o + 3 | 0] = s.charCodeAt(n);
                                        case 1:
                                            e[o + 2 | 0] = s.charCodeAt(n + 1);
                                        case 2:
                                            e[o + 1 | 0] = s.charCodeAt(n + 2);
                                        case 3:
                                            e[0 | o] = s.charCodeAt(n + 3)
                                    }
                                    for (i = a; u > i; i = i + 4 | 0) t[o + i >> 2] = s.charCodeAt(n + i) << 24 | s.charCodeAt(n + i + 1) << 16 | s.charCodeAt(n + i + 2) << 8 | s.charCodeAt(n + i + 3);
                                    switch (c) {
                                        case 3:
                                            e[o + u + 1 | 0] = s.charCodeAt(n + u + 2);
                                        case 2:
                                            e[o + u + 2 | 0] = s.charCodeAt(n + u + 1);
                                        case 1:
                                            e[o + u + 3 | 0] = s.charCodeAt(n + u)
                                    }
                                }, u = function(e, t, n, r, o) {
                                    var i, s = this,
                                        a = o % 4,
                                        c = r % 4,
                                        u = r - c;
                                    if (u > 0) switch (a) {
                                        case 0:
                                            e[o + 3 | 0] = s[n];
                                        case 1:
                                            e[o + 2 | 0] = s[n + 1];
                                        case 2:
                                            e[o + 1 | 0] = s[n + 2];
                                        case 3:
                                            e[0 | o] = s[n + 3]
                                    }
                                    for (i = 4 - a; u > i; i = i += 4) t[o + i >> 2] = s[n + i] << 24 | s[n + i + 1] << 16 | s[n + i + 2] << 8 | s[n + i + 3];
                                    switch (c) {
                                        case 3:
                                            e[o + u + 1 | 0] = s[n + u + 2];
                                        case 2:
                                            e[o + u + 2 | 0] = s[n + u + 1];
                                        case 1:
                                            e[o + u + 3 | 0] = s[n + u]
                                    }
                                }, f = function(e, t, n, r, i) {
                                    var s, a = this,
                                        c = i % 4,
                                        u = r % 4,
                                        f = r - u,
                                        d = new Uint8Array(o.readAsArrayBuffer(a.slice(n, n + r)));
                                    if (f > 0) switch (c) {
                                        case 0:
                                            e[i + 3 | 0] = d[0];
                                        case 1:
                                            e[i + 2 | 0] = d[1];
                                        case 2:
                                            e[i + 1 | 0] = d[2];
                                        case 3:
                                            e[0 | i] = d[3]
                                    }
                                    for (s = 4 - c; f > s; s = s += 4) t[i + s >> 2] = d[s] << 24 | d[s + 1] << 16 | d[s + 2] << 8 | d[s + 3];
                                    switch (u) {
                                        case 3:
                                            e[i + f + 1 | 0] = d[f + 2];
                                        case 2:
                                            e[i + f + 2 | 0] = d[f + 1];
                                        case 1:
                                            e[i + f + 3 | 0] = d[f]
                                    }
                                }, d = function(e) {
                                    switch (r.getDataType(e)) {
                                        case "string":
                                            return c.bind(e);
                                        case "array":
                                            return u.bind(e);
                                        case "buffer":
                                            return u.bind(e);
                                        case "arraybuffer":
                                            return u.bind(new Uint8Array(e));
                                        case "view":
                                            return u.bind(new Uint8Array(e.buffer, e.byteOffset, e.byteLength));
                                        case "blob":
                                            return f.bind(e)
                                    }
                                }, h = function(e) {
                                    var t, n, r = "0123456789abcdef",
                                        o = [],
                                        i = new Uint8Array(e);
                                    for (t = 0; t < i.length; t++) n = i[t], o[t] = r.charAt(n >> 4 & 15) + r.charAt(n >> 0 & 15);
                                    return o.join("")
                                }, l = function(e) {
                                    var t;
                                    if (65536 >= e) return 65536;
                                    if (16777216 > e)
                                        for (t = 1; e > t; t <<= 1);
                                    else
                                        for (t = 16777216; e > t; t += 16777216);
                                    return t
                                }, p = function(e) {
                                    if (e % 64 > 0) throw new Error("Chunk size must be a multiple of 128 bit");
                                    t.maxChunkLen = e, t.padMaxChunkLen = i(e), t.heap = new ArrayBuffer(l(t.padMaxChunkLen + 320 + 20)), t.h32 = new Int32Array(t.heap), t.h8 = new Int8Array(t.heap), t.core = new n._core({
                                        Int32Array: Int32Array,
                                        DataView: DataView
                                    }, {}, t.heap), t.buffer = null
                                };
                            p(e || 65536);
                            var m = function(e, t) {
                                var n = new Int32Array(e, t + 320, 5);
                                n[0] = 1732584193, n[1] = -271733879, n[2] = -1732584194, n[3] = 271733878, n[4] = -1009589776
                            }, g = function(e, n) {
                                    var r = i(e),
                                        o = new Int32Array(t.heap, 0, r >> 2);
                                    return s(o, e), a(o, e, n), r
                                }, y = function(e, n, r) {
                                    d(e)(t.h8, t.h32, n, r, 0)
                                }, _ = function(e, n, r, o, i) {
                                    var s = r;
                                    i && (s = g(r, o)), y(e, n, r), t.core.hash(s, t.padMaxChunkLen)
                                }, v = function(e, t) {
                                    var n = new Int32Array(e, t + 320, 5),
                                        r = new Int32Array(5),
                                        o = new DataView(r.buffer);
                                    return o.setInt32(0, n[0], !1), o.setInt32(4, n[1], !1), o.setInt32(8, n[2], !1), o.setInt32(12, n[3], !1), o.setInt32(16, n[4], !1), r
                                }, b = this.rawDigest = function(e) {
                                    var n = e.byteLength || e.length || e.size || 0;
                                    m(t.heap, t.padMaxChunkLen);
                                    var r = 0,
                                        o = t.maxChunkLen;
                                    for (r = 0; n > r + o; r += o) _(e, r, o, n, !1);
                                    return _(e, r, n - r, n, !0), v(t.heap, t.padMaxChunkLen)
                                };
                            this.digest = this.digestFromString = this.digestFromBuffer = this.digestFromArrayBuffer = function(e) {
                                return h(b(e).buffer)
                            }
                        }
                        var r = {
                            getDataType: function(t) {
                                if ("string" == typeof t) return "string";
                                if (t instanceof Array) return "array";
                                if ("undefined" != typeof e && e.Buffer && e.Buffer.isBuffer(t)) return "buffer";
                                if (t instanceof ArrayBuffer) return "arraybuffer";
                                if (t.buffer instanceof ArrayBuffer) return "view";
                                if (t instanceof Blob) return "blob";
                                throw new Error("Unsupported data type.")
                            }
                        };
                        if (n._core = function s(e, t, n) {
                            "use asm";
                            var r = new e.Int32Array(n);

                            function o(e, t) {
                                e = e | 0;
                                t = t | 0;
                                var n = 0,
                                    o = 0,
                                    i = 0,
                                    s = 0,
                                    a = 0,
                                    c = 0,
                                    u = 0,
                                    f = 0,
                                    d = 0,
                                    h = 0,
                                    l = 0,
                                    p = 0,
                                    m = 0,
                                    g = 0;
                                i = r[t + 320 >> 2] | 0;
                                a = r[t + 324 >> 2] | 0;
                                u = r[t + 328 >> 2] | 0;
                                d = r[t + 332 >> 2] | 0;
                                l = r[t + 336 >> 2] | 0;
                                for (n = 0;
                                    (n | 0) < (e | 0); n = n + 64 | 0) {
                                    s = i;
                                    c = a;
                                    f = u;
                                    h = d;
                                    p = l;
                                    for (o = 0;
                                        (o | 0) < 64; o = o + 4 | 0) {
                                        g = r[n + o >> 2] | 0;
                                        m = ((i << 5 | i >>> 27) + (a & u | ~a & d) | 0) + ((g + l | 0) + 1518500249 | 0) | 0;
                                        l = d;
                                        d = u;
                                        u = a << 30 | a >>> 2;
                                        a = i;
                                        i = m;
                                        r[e + o >> 2] = g
                                    }
                                    for (o = e + 64 | 0;
                                        (o | 0) < (e + 80 | 0); o = o + 4 | 0) {
                                        g = (r[o - 12 >> 2] ^ r[o - 32 >> 2] ^ r[o - 56 >> 2] ^ r[o - 64 >> 2]) << 1 | (r[o - 12 >> 2] ^ r[o - 32 >> 2] ^ r[o - 56 >> 2] ^ r[o - 64 >> 2]) >>> 31;
                                        m = ((i << 5 | i >>> 27) + (a & u | ~a & d) | 0) + ((g + l | 0) + 1518500249 | 0) | 0;
                                        l = d;
                                        d = u;
                                        u = a << 30 | a >>> 2;
                                        a = i;
                                        i = m;
                                        r[o >> 2] = g
                                    }
                                    for (o = e + 80 | 0;
                                        (o | 0) < (e + 160 | 0); o = o + 4 | 0) {
                                        g = (r[o - 12 >> 2] ^ r[o - 32 >> 2] ^ r[o - 56 >> 2] ^ r[o - 64 >> 2]) << 1 | (r[o - 12 >> 2] ^ r[o - 32 >> 2] ^ r[o - 56 >> 2] ^ r[o - 64 >> 2]) >>> 31;
                                        m = ((i << 5 | i >>> 27) + (a ^ u ^ d) | 0) + ((g + l | 0) + 1859775393 | 0) | 0;
                                        l = d;
                                        d = u;
                                        u = a << 30 | a >>> 2;
                                        a = i;
                                        i = m;
                                        r[o >> 2] = g
                                    }
                                    for (o = e + 160 | 0;
                                        (o | 0) < (e + 240 | 0); o = o + 4 | 0) {
                                        g = (r[o - 12 >> 2] ^ r[o - 32 >> 2] ^ r[o - 56 >> 2] ^ r[o - 64 >> 2]) << 1 | (r[o - 12 >> 2] ^ r[o - 32 >> 2] ^ r[o - 56 >> 2] ^ r[o - 64 >> 2]) >>> 31;
                                        m = ((i << 5 | i >>> 27) + (a & u | a & d | u & d) | 0) + ((g + l | 0) - 1894007588 | 0) | 0;
                                        l = d;
                                        d = u;
                                        u = a << 30 | a >>> 2;
                                        a = i;
                                        i = m;
                                        r[o >> 2] = g
                                    }
                                    for (o = e + 240 | 0;
                                        (o | 0) < (e + 320 | 0); o = o + 4 | 0) {
                                        g = (r[o - 12 >> 2] ^ r[o - 32 >> 2] ^ r[o - 56 >> 2] ^ r[o - 64 >> 2]) << 1 | (r[o - 12 >> 2] ^ r[o - 32 >> 2] ^ r[o - 56 >> 2] ^ r[o - 64 >> 2]) >>> 31;
                                        m = ((i << 5 | i >>> 27) + (a ^ u ^ d) | 0) + ((g + l | 0) - 899497514 | 0) | 0;
                                        l = d;
                                        d = u;
                                        u = a << 30 | a >>> 2;
                                        a = i;
                                        i = m;
                                        r[o >> 2] = g
                                    }
                                    i = i + s | 0;
                                    a = a + c | 0;
                                    u = u + f | 0;
                                    d = d + h | 0;
                                    l = l + p | 0
                                }
                                r[t + 320 >> 2] = i;
                                r[t + 324 >> 2] = a;
                                r[t + 328 >> 2] = u;
                                r[t + 332 >> 2] = d;
                                r[t + 336 >> 2] = l
                            }
                            return {
                                hash: o
                            }
                        }, "undefined" != typeof t ? t.exports = n : "undefined" != typeof window && (window.Rusha = n), "undefined" != typeof FileReaderSync) {
                            var o = new FileReaderSync,
                                i = new n(4194304);
                            self.onmessage = function(e) {
                                var t, n = e.data.data;
                                try {
                                    t = i.digest(n), self.postMessage({
                                        id: e.data.id,
                                        hash: t
                                    })
                                } catch (r) {
                                    self.postMessage({
                                        id: e.data.id,
                                        error: r.name
                                    })
                                }
                            }
                        }
                    }()
                }).call(this, "undefined" != typeof global ? global : "undefined" != typeof self ? self : "undefined" != typeof window ? window : {})
            }, {}
        ],
        137: [
            function(e, t, n) {
                var r = 1,
                    o = 65535,
                    i = 4,
                    s = function() {
                        r = r + 1 & o
                    }, a = setInterval(s, 1e3 / i | 0);
                a.unref && a.unref(), t.exports = function(e) {
                    var t = i * (e || 5),
                        n = [0],
                        s = 1,
                        a = r - 1 & o;
                    return function(e) {
                        var c = r - a & o;
                        for (c > t && (c = t), a = r; c--;) s === t && (s = 0), n[s] = n[0 === s ? t - 1 : s - 1], s++;
                        e && (n[s - 1] += e);
                        var u = n[s - 1],
                            f = n.length < t ? 0 : n[s === t ? 0 : s];
                        return n.length < i ? u : (u - f) * i / n.length
                    }
                }
            }, {}
        ],
        138: [
            function(e, t, n) {
                var r = e("once");
                t.exports = function(e, t, n) {
                    n = r(n);
                    var o = [];
                    e.on("data", function(e) {
                        o.push(e)
                    }).on("end", function() {
                        var e = t ? new Blob(o, {
                            type: t
                        }) : new Blob(o),
                            r = URL.createObjectURL(e);
                        n(null, r)
                    }).on("error", n)
                }
            }, {
                once: 140
            }
        ],
        139: [
            function(e, t, n) {
                arguments[4][20][0].apply(n, arguments)
            }, {
                dup: 20
            }
        ],
        140: [
            function(e, t, n) {
                arguments[4][21][0].apply(n, arguments)
            }, {
                dup: 21,
                wrappy: 139
            }
        ],
        141: [
            function(e, t, n) {
                (function(n) {
                    var r = e("once");
                    t.exports = function(e, t, o) {
                        o = r(o);
                        var i = new n(t),
                            s = 0;
                        e.on("data", function(e) {
                            e.copy(i, s), s += e.length
                        }).on("end", function() {
                            o(null, i)
                        }).on("error", o)
                    }
                }).call(this, e("buffer").Buffer)
            }, {
                buffer: 25,
                once: 143
            }
        ],
        142: [
            function(e, t, n) {
                arguments[4][20][0].apply(n, arguments)
            }, {
                dup: 20
            }
        ],
        143: [
            function(e, t, n) {
                arguments[4][21][0].apply(n, arguments)
            }, {
                dup: 21,
                wrappy: 142
            }
        ],
        144: [
            function(e, t, n) {
                (function(n, r) {
                    function o(e) {
                        function t(e, t) {
                            i._internalDHT = !0;
                            var n = new s(t);
                            return d(n, i, ["warning", "error"]), n.listen(e), n
                        }

                        function r(e, t) {
                            t.toString("hex") === i.infoHash && i.emit("peer", e.host + ":" + e.port)
                        }
                        var i = this;
                        if (!(i instanceof o)) return new o(e);
                        if (a.call(i), i.peerId = e.peerId, i.port = e.port || 0, !i.peerId) throw new Error("peerId required");
                        if (!n.browser && !i.port) throw new Error("port required");
                        i.announce = e.announce || [], i._intervalMs = e.intervalMs || 9e5, i.destroyed = !1, i.infoHash = null, i.infoHashBuffer = null, i.torrent = null, i._dhtAnnouncing = !1, i._dhtTimeout = !1, i._internalDHT = !1, e.tracker === !1 ? i.tracker = !1 : (i.tracker = !0, i._trackerOpts = e.tracker || {}), e.dht === !1 || "function" != typeof s ? i.dht = !1 : e.dht && "function" == typeof e.dht.announce && "function" == typeof e.dht.addNode ? i.dht = e.dht : "object" == typeof e.dht ? i.dht = t(e.dhtPort, e.dht) : i.dht = t(e.dhtPort), i.dht && i.dht.on("peer", r)
                    }
                    t.exports = o;
                    var i = e("debug")("torrent-discovery"),
                        s = e("bittorrent-dht/client"),
                        a = e("events").EventEmitter,
                        c = e("xtend"),
                        u = e("inherits"),
                        f = e("run-parallel"),
                        d = e("re-emitter"),
                        h = e("bittorrent-tracker/client");
                    u(o, a), o.prototype.setTorrent = function(e) {
                        var t = this;
                        if (t.infoHash || "string" != typeof e && !r.isBuffer(e)) {
                            if (t.torrent || !e || !e.infoHash) return;
                            t.torrent = e, t.infoHash = "string" == typeof e.infoHash ? e.infoHash : e.infoHash.toString("hex")
                        } else t.infoHash = "string" == typeof e ? e : e.toString("hex");
                        t.infoHashBuffer = new r(t.infoHash, "hex"), i("setTorrent %s", t.infoHash), t.tracker && t.tracker !== !0 ? t.tracker.torrentLength = e.length : t._createTracker(), t._dhtAnnounce()
                    }, o.prototype.updatePort = function(e) {
                        var t = this;
                        e !== t.port && (t.port = e, t._dhtAnnounce(), t.tracker && t.tracker !== !0 && (t.tracker.stop(), t.tracker.destroy(function() {
                            t._createTracker()
                        })))
                    }, o.prototype.stop = function(e) {
                        var t = this;
                        t.destroyed = !0, clearTimeout(t._dhtTimeout);
                        var n = [];
                        t.tracker && t.tracker !== !0 && (t.tracker.stop(), n.push(function(e) {
                            t.tracker.destroy(e)
                        })), t._internalDHT && n.push(function(e) {
                            t.dht.destroy(e)
                        }), f(n, e)
                    }, o.prototype._createTracker = function() {
                        function e(e) {
                            t.emit("trackerAnnounce", e)
                        }
                        var t = this;
                        if (t.tracker) {
                            var n = t.torrent ? c({
                                announce: []
                            }, t.torrent) : {
                                infoHash: t.infoHash,
                                announce: []
                            };
                            t.announce && (n.announce = n.announce.concat(t.announce)), t.tracker = new h(t.peerId, t.port, n, t._trackerOpts), d(t.tracker, t, ["peer", "warning", "error"]), t.tracker.setInterval(t._intervalMs), t.tracker.on("update", e), t.tracker.start()
                        }
                    }, o.prototype._dhtAnnounce = function() {
                        function e() {
                            return t._intervalMs + Math.floor(Math.random() * t._intervalMs / 5)
                        }
                        var t = this;
                        t.port && t.infoHash && t.dht && !t._dhtAnnouncing && (i("dht announce"), t._dhtAnnouncing = !0, clearTimeout(t._dhtTimeout), t.dht.announce(t.infoHash, t.port, function(n) {
                            t._dhtAnnouncing = !1, i("dht announce complete"), n && t.emit("warning", n), t.emit("dhtAnnounce"), t.destroyed || (t._dhtTimeout = setTimeout(function() {
                                t._dhtAnnounce()
                            }, e()))
                        }))
                    }
                }).call(this, e("_process"), e("buffer").Buffer)
            }, {
                _process: 33,
                "bittorrent-dht/client": 24,
                "bittorrent-tracker/client": 16,
                buffer: 25,
                debug: 68,
                events: 29,
                inherits: 76,
                "re-emitter": 93,
                "run-parallel": 127,
                xtend: 152
            }
        ],
        145: [
            function(e, t, n) {
                (function(e) {
                    function n(e) {
                        return this instanceof n ? (this.length = e, this.missing = e, this.sources = null, this._chunks = Math.ceil(e / r), this._remainder = e % r || r, this._buffered = 0, this._buffer = null, this._cancellations = null, this._reservations = 0, void(this._flushed = !1)) : new n(e)
                    }
                    t.exports = n;
                    var r = 16384;
                    n.BLOCK_LENGTH = r, n.prototype.chunkLength = function(e) {
                        return e === this._chunks - 1 ? this._remainder : r
                    }, n.prototype.chunkLengthRemaining = function(e) {
                        return this.length - e * r
                    }, n.prototype.chunkOffset = function(e) {
                        return e * r
                    }, n.prototype.reserve = function() {
                        return this.init() ? this._cancellations.length ? this._cancellations.pop() : this._reservations < this._chunks ? this._reservations++ : -1 : -1
                    }, n.prototype.reserveRemaining = function() {
                        if (!this.init()) return -1;
                        if (this._reservations < this._chunks) {
                            var e = this._reservations;
                            return this._reservations = this._chunks, e
                        }
                        return -1
                    }, n.prototype.cancel = function(e) {
                        this.init() && this._cancellations.push(e)
                    }, n.prototype.cancelRemaining = function(e) {
                        this.init() && (this._reservations = e)
                    }, n.prototype.get = function(e) {
                        return this.init() ? this._buffer[e] : null
                    }, n.prototype.set = function(e, t, n) {
                        if (!this.init()) return !1;
                        for (var o = t.length, i = Math.ceil(o / r), s = 0; i > s; s++)
                            if (!this._buffer[e + s]) {
                                var a = s * r,
                                    c = t.slice(a, a + r);
                                this._buffered++, this._buffer[e + s] = c, this.missing -= c.length, -1 === this.sources.indexOf(n) && this.sources.push(n)
                            }
                        return this._buffered === this._chunks
                    }, n.prototype.flush = function() {
                        if (!this._buffer || this._chunks !== this._buffered) return null;
                        var t = e.concat(this._buffer, this.length);
                        return this._buffer = null, this._cancellations = null, this.sources = null, this._flushed = !0, t
                    }, n.prototype.init = function() {
                        return this._flushed ? !1 : this._buffer ? !0 : (this._buffer = new Array(this._chunks), this._cancellations = [], this.sources = [], !0)
                    }
                }).call(this, e("buffer").Buffer)
            }, {
                buffer: 25
            }
        ],
        146: [
            function(e, t, n) {
                "use strict";

                function r(e, t) {
                    for (var n = 1, r = e.length, o = e[0], i = e[0], s = 1; r > s; ++s)
                        if (i = o, o = e[s], t(o, i)) {
                            if (s === n) {
                                n++;
                                continue
                            }
                            e[n++] = o
                        }
                    return e.length = n, e
                }

                function o(e) {
                    for (var t = 1, n = e.length, r = e[0], o = e[0], i = 1; n > i; ++i, o = r)
                        if (o = r, r = e[i], r !== o) {
                            if (i === t) {
                                t++;
                                continue
                            }
                            e[t++] = r
                        }
                    return e.length = t, e
                }

                function i(e, t, n) {
                    return 0 === e.length ? e : t ? (n || e.sort(t), r(e, t)) : (n || e.sort(), o(e))
                }
                t.exports = i
            }, {}
        ],
        147: [
            function(e, t, n) {
                (function(n) {
                    var r = e("bencode"),
                        o = e("bitfield"),
                        i = e("debug")("ut_metadata"),
                        s = e("events").EventEmitter,
                        a = e("inherits"),
                        c = e("simple-sha1"),
                        u = 1e7,
                        f = 1e3,
                        d = 16384;
                    t.exports = function(e) {
                        function t(t) {
                            s.call(this), this._wire = t, this._metadataComplete = !1, this._metadataSize = null, this._remainingRejects = null, this._fetching = !1, this._bitfield = new o(0, {
                                grow: f
                            }), n.isBuffer(e) && this.setMetadata(e)
                        }
                        return a(t, s), t.prototype.name = "ut_metadata", t.prototype.onHandshake = function(e, t, n) {
                            this._infoHash = e
                        }, t.prototype.onExtendedHandshake = function(e) {
                            return e.m && e.m.ut_metadata ? e.metadata_size ? e.metadata_size > u ? this.emit("warning", new Error("Peer gave maliciously large metadata size")) : (this._metadataSize = e.metadata_size, this._numPieces = Math.ceil(this._metadataSize / d), this._remainingRejects = 2 * this._numPieces, void(this._fetching && this._requestPieces())) : this.emit("warning", new Error("Peer does not have metadata")) : this.emit("warning", new Error("Peer does not support ut_metadata"))
                        }, t.prototype.onMessage = function(e) {
                            var t, n;
                            try {
                                var o = e.toString(),
                                    i = o.indexOf("ee") + 2;
                                t = r.decode(o.substring(0, i)), n = e.slice(i)
                            } catch (s) {
                                return
                            }
                            switch (t.msg_type) {
                                case 0:
                                    this._onRequest(t.piece);
                                    break;
                                case 1:
                                    this._onData(t.piece, n, t.total_size);
                                    break;
                                case 2:
                                    this._onReject(t.piece)
                            }
                        }, t.prototype.fetch = function() {
                            this._metadataComplete || (this._fetching = !0, this._metadataSize && this._requestPieces())
                        }, t.prototype.cancel = function() {
                            this._fetching = !1
                        }, t.prototype.setMetadata = function(e) {
                            if (this._metadataComplete) return !0;
                            i("set metadata");
                            try {
                                var t = r.decode(e).info;
                                t && (e = r.encode(t))
                            } catch (n) {}
                            return this._infoHash && this._infoHash !== c.sync(e) ? !1 : (this.cancel(), this.metadata = e, this._metadataComplete = !0, this._metadataSize = this.metadata.length, this._wire.extendedHandshake.metadata_size = this._metadataSize, this.emit("metadata", r.encode({
                                info: r.decode(this.metadata)
                            })), !0)
                        }, t.prototype._send = function(e, t) {
                            var o = r.encode(e);
                            n.isBuffer(t) && (o = n.concat([o, t])), this._wire.extended("ut_metadata", o)
                        }, t.prototype._request = function(e) {
                            this._send({
                                msg_type: 0,
                                piece: e
                            })
                        }, t.prototype._data = function(e, t, n) {
                            var r = {
                                msg_type: 1,
                                piece: e
                            };
                            "number" == typeof n && (r.total_size = n), this._send(r, t)
                        }, t.prototype._reject = function(e) {
                            this._send({
                                msg_type: 2,
                                piece: e
                            })
                        }, t.prototype._onRequest = function(e) {
                            if (!this._metadataComplete) return void this._reject(e);
                            var t = e * d,
                                n = t + d;
                            n > this._metadataSize && (n = this._metadataSize);
                            var r = this.metadata.slice(t, n);
                            this._data(e, r, this._metadataSize)
                        }, t.prototype._onData = function(e, t, n) {
                            t.length > d || (t.copy(this.metadata, e * d), this._bitfield.set(e), this._checkDone())
                        }, t.prototype._onReject = function(e) {
                            this._remainingRejects > 0 && this._fetching ? (this._request(e), this._remainingRejects -= 1) : this.emit("warning", new Error('Peer sent "reject" too much'))
                        }, t.prototype._requestPieces = function() {
                            this.metadata = new n(this._metadataSize);
                            for (var e = 0; e < this._numPieces; e++) this._request(e)
                        }, t.prototype._checkDone = function() {
                            for (var e = !0, t = 0; t < this._numPieces; t++)
                                if (!this._bitfield.get(t)) {
                                    e = !1;
                                    break
                                }
                            if (e) {
                                var n = this.setMetadata(this.metadata);
                                n || this._failedMetadata()
                            }
                        }, t.prototype._failedMetadata = function() {
                            this._bitfield = new o(0, {
                                grow: f
                            }), this._remainingRejects -= this._numPieces, this._remainingRejects > 0 ? this._requestPieces() : this.emit("warning", new Error("Peer sent invalid metadata"))
                        }, t
                    }
                }).call(this, e("buffer").Buffer)
            }, {
                bencode: 148,
                bitfield: 7,
                buffer: 25,
                debug: 68,
                events: 29,
                inherits: 76,
                "simple-sha1": 135
            }
        ],
        148: [
            function(e, t, n) {
                arguments[4][12][0].apply(n, arguments)
            }, {
                "./lib/decode": 149,
                "./lib/encode": 151,
                dup: 12
            }
        ],
        149: [
            function(e, t, n) {
                arguments[4][13][0].apply(n, arguments)
            }, {
                "./dict": 150,
                buffer: 25,
                dup: 13
            }
        ],
        150: [
            function(e, t, n) {
                arguments[4][14][0].apply(n, arguments)
            }, {
                dup: 14
            }
        ],
        151: [
            function(e, t, n) {
                arguments[4][15][0].apply(n, arguments)
            }, {
                buffer: 25,
                dup: 15
            }
        ],
        152: [
            function(e, t, n) {
                function r() {
                    for (var e = {}, t = 0; t < arguments.length; t++) {
                        var n = arguments[t];
                        for (var r in n) o.call(n, r) && (e[r] = n[r])
                    }
                    return e
                }
                t.exports = r;
                var o = Object.prototype.hasOwnProperty
            }, {}
        ],
        153: [
            function(e, t, n) {
                function r(e) {
                    for (var t = 1; t < arguments.length; t++) {
                        var n = arguments[t];
                        for (var r in n) o.call(n, r) && (e[r] = n[r])
                    }
                    return e
                }
                t.exports = r;
                var o = Object.prototype.hasOwnProperty
            }, {}
        ],
        154: [
            function(e, t, n) {
                t.exports = function r(e, t, n) {
                    return void 0 === t ? function(t, n) {
                        return r(e, t, n)
                    } : (void 0 === n && (n = "0"), e -= t.toString().length, e > 0 ? new Array(e + (/\./.test(t) ? 2 : 1)).join(n) + t : t + "")
                }
            }, {}
        ],
        155: [
            function(e, t, n) {
                t.exports = {
                    version: "0.85.1"
                }
            }, {}
        ],
        156: [
            function(e, t, n) {
                (function(n, r, o) {
                    function i(e) {
                        function t() {
                            s.destroyed || (s.ready = !0, s.emit("ready"))
                        }
                        var s = this;
                        return s instanceof i ? (f.call(s), e || (e = {}), c.enabled || s.setMaxListeners(0), s.destroyed = !1, s.torrentPort = e.torrentPort || 0, s.tracker = void 0 !== e.tracker ? e.tracker : !0, s._rtcConfig = e.rtcConfig, s._wrtc = e.wrtc || r.WRTC, s.torrents = [], s._downloadSpeed = v(), s._uploadSpeed = v(), s.maxConns = e.maxConns, s.peerId = "string" == typeof e.peerId ? e.peerId : (e.peerId || new o(S + h(48))).toString("hex"), s.peerIdBuffer = new o(s.peerId, "hex"), s.nodeId = "string" == typeof e.nodeId ? e.nodeId : e.nodeId && e.nodeId.toString("hex") || h(160), s.nodeIdBuffer = new o(s.nodeId, "hex"), e.dht !== !1 && "function" == typeof u ? (s.dht = new u(d({
                            nodeId: s.nodeId
                        }, e.dht)), s.dht.once("error", function(e) {
                            s.emit("error", e), s.destroy()
                        }), s.dht.listen(e.dhtPort)) : s.dht = !1, c("new webtorrent (peerId %s, nodeId %s)", s.peerId, s.nodeId), void("function" == typeof p ? p(e.blocklist, {
                            headers: {
                                "user-agent": "WebTorrent/" + k + " (http://webtorrent.io)"
                            }
                        }, function(e, n) {
                            return e ? s.error("Failed to load blocklist: " + e.message) : (s.blocked = n, void t())
                        }) : n.nextTick(t))) : new i(e)
                    }

                    function s(e) {
                        return "object" == typeof e && null != e && "function" == typeof e.pipe
                    }
                    t.exports = i;
                    var a = e("create-torrent"),
                        c = e("debug")("webtorrent"),
                        u = e("bittorrent-dht/client"),
                        f = e("events").EventEmitter,
                        d = e("xtend"),
                        h = e("hat"),
                        l = e("inherits"),
                        p = e("load-ip-set"),
                        m = e("run-parallel"),
                        g = e("parse-torrent"),
                        y = e("path"),
                        _ = e("simple-peer"),
                        v = e("speedometer"),
                        b = e("zero-fill"),
                        w = e("./lib/concat-stream"),
                        E = e("./lib/torrent");
                    t.exports.WEBRTC_SUPPORT = _.WEBRTC_SUPPORT;
                    var k = e("./package.json").version,
                        x = k.match(/([0-9]+)/g).slice(0, 2).map(b(2)).join(""),
                        S = "-WW" + x + "-";
                    l(i, f), Object.defineProperty(i.prototype, "downloadSpeed", {
                        get: function() {
                            return this._downloadSpeed()
                        }
                    }), Object.defineProperty(i.prototype, "uploadSpeed", {
                        get: function() {
                            return this._uploadSpeed()
                        }
                    }), Object.defineProperty(i.prototype, "progress", {
                        get: function() {
                            var e = this.torrents.filter(function(e) {
                                return 1 !== e.progress
                            }),
                                t = e.reduce(function(e, t) {
                                    return e + t.downloaded
                                }, 0),
                                n = e.reduce(function(e, t) {
                                    return e + (t.length || 0)
                                }, 0) || 1;
                            return t / n
                        }
                    }), Object.defineProperty(i.prototype, "ratio", {
                        get: function() {
                            var e = this.torrents.reduce(function(e, t) {
                                return e + t.uploaded
                            }, 0),
                                t = this.torrents.reduce(function(e, t) {
                                    return e + t.downloaded
                                }, 0) || 1;
                            return e / t
                        }
                    }), i.prototype.get = function(e) {
                        var t = this;
                        if (e instanceof E) return e;
                        var n;
                        try {
                            n = g(e)
                        } catch (r) {}
                        if (!n) return null;
                        if (!n.infoHash) throw new Error("Invalid torrent identifier");
                        for (var o = 0, i = t.torrents.length; i > o; o++) {
                            var s = t.torrents[o];
                            if (s.infoHash === n.infoHash) return s
                        }
                        return null
                    }, i.prototype.add = i.prototype.download = function(e, t, r) {
                        function o() {
                            c("on torrent"), "function" == typeof r && r(s), i.emit("torrent", s)
                        }
                        var i = this;
                        if (i.destroyed) throw new Error("client is destroyed");
                        if ("function" == typeof t) return i.add(e, null, t);
                        c("add"), t = t ? d(t) : {};
                        var s = i.get(e);
                        return s ? s.ready ? n.nextTick(o) : s.once("ready", o) : (s = new E(e, i, t), i.torrents.push(s), s.once("error", function(e) {
                            i.emit("error", e, s), i.remove(s)
                        }), s.once("listening", function(e) {
                            i.emit("listening", e, s)
                        }), s.once("ready", o)), s
                    }, i.prototype.seed = function(e, t, n) {
                        function r(e) {
                            var t = [
                                function(t) {
                                    e.load(u, t)
                                }
                            ];
                            i.dht && t.push(function(t) {
                                e.once("dhtAnnounce", t)
                            }), m(t, function(t) {
                                return i.destroyed ? void 0 : t ? i.emit("error", t, e) : void o(e)
                            })
                        }

                        function o(e) {
                            c("on seed"), "function" == typeof n && n(e), i.emit("seed", e)
                        }
                        var i = this;
                        if (i.destroyed) throw new Error("client is destroyed");
                        if ("function" == typeof t) return i.seed(e, null, t);
                        c("seed"), t = t ? d(t) : {}, "string" == typeof e && (t.path = y.dirname(e)), t.createdBy || (t.createdBy = "WebTorrent/" + x), i.tracker || (t.announce = []);
                        var u, f = i.add(null, t, r);
                        return Array.isArray(e) || (e = [e]), m(e.map(function(e) {
                            return function(t) {
                                s(e) ? w(e, t) : t(null, e)
                            }
                        }), function(e, n) {
                            return e ? i.emit("error", e, f) : void(i.destroyed || a.parseInput(n, t, function(e, r) {
                                return e ? i.emit("error", e, f) : void(i.destroyed || (u = r.map(function(e) {
                                    return e.getStream
                                }), a(n, t, function(e, t) {
                                    if (e) return i.emit("error", e, f);
                                    if (!i.destroyed) {
                                        var n = i.get(t);
                                        n ? (f.destroy(), o(n)) : f._onTorrentId(t)
                                    }
                                })))
                            }))
                        }), f
                    }, i.prototype.remove = function(e, t) {
                        var n = this;
                        c("remove");
                        var r = n.get(e);
                        if (!r) throw new Error("No torrent with id " + e);
                        n.torrents.splice(n.torrents.indexOf(r), 1), r.destroy(t)
                    }, i.prototype.address = function() {
                        var e = this;
                        return {
                            address: "0.0.0.0",
                            family: "IPv4",
                            port: e.torrentPort
                        }
                    }, i.prototype.destroy = function(e) {
                        var t = this;
                        if (t.destroyed) throw new Error("client already destroyed");
                        t.destroyed = !0, c("destroy");
                        var n = t.torrents.map(function(e) {
                            return function(n) {
                                t.remove(e, n)
                            }
                        });
                        t.dht && n.push(function(e) {
                            t.dht.destroy(e)
                        }), m(n, e)
                    }
                }).call(this, e("_process"), "undefined" != typeof global ? global : "undefined" != typeof self ? self : "undefined" != typeof window ? window : {}, e("buffer").Buffer)
            }, {
                "./lib/concat-stream": 1,
                "./lib/torrent": 5,
                "./package.json": 155,
                _process: 33,
                "bittorrent-dht/client": 24,
                buffer: 25,
                "create-torrent": 51,
                debug: 68,
                events: 29,
                hat: 74,
                inherits: 76,
                "load-ip-set": 24,
                "parse-torrent": 79,
                path: 32,
                "run-parallel": 127,
                "simple-peer": 131,
                speedometer: 137,
                xtend: 152,
                "zero-fill": 154
            }
        ]
    }, {}, [156])(156)
});