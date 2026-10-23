var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);
var videojs_video_element_exports = {};
__export(videojs_video_element_exports, {
  default: () => videojs_video_element_default
});
module.exports = __toCommonJS(videojs_video_element_exports);
var import_super_media_element = require("super-media-element");
var import_media_tracks = require("media-tracks");
var _a, _b;
const templateShadowDOM = (_a = globalThis.document) == null ? void 0 : _a.createElement("template");
if (templateShadowDOM) {
  templateShadowDOM.innerHTML = /*html*/
  `
  <style>
    :host {
      display: inline-block;
      min-width: 300px;
      min-height: 150px;
      position: relative;
    }
    video {
      max-width: 100%;
      max-height: 100%;
      min-width: 100%;
      min-height: 100%;
    }
    div.video-js {
      position: absolute;
      top: 0;
      left: 0;
      bottom: 0;
      right: 0;
    }
  </style>
  <slot name="video">
    <video></video>
  </slot>
  <slot></slot>
  `;
}
class VideojsVideoElement extends (((_b = import_media_tracks.MediaTracksMixin) == null ? void 0 : _b(import_super_media_element.SuperVideoElement ?? class {
})) ?? class {
}) {
  static template = templateShadowDOM;
  static skipAttributes = ["src", "controls", "poster"];
  static get observedAttributes() {
    return [...import_super_media_element.SuperVideoElement.observedAttributes, "stylesheet"];
  }
  #apiInit;
  get nativeEl() {
    return this.querySelector(":scope > [slot=video]") ?? this.shadowRoot.querySelector("video");
  }
  async load() {
    const options = {
      autoplay: this.autoplay,
      preload: this.preload ?? "metadata",
      playsinline: this.playsInline,
      controls: this.controls,
      muted: this.defaultMuted,
      loop: this.loop,
      html5: {
        nativeTextTracks: true
      }
    };
    if (!this.controls) {
      options.children = ["mediaLoader"];
    }
    if (!this.#apiInit) {
      this.#apiInit = true;
      const video = this.nativeEl;
      video.classList.add("video-js", ...this.classList);
      let videojs = globalThis.videojs;
      if (!videojs) {
        const scriptUrl = `https://cdn.jsdelivr.net/npm/video.js@${this.version}/dist/video.min.js`;
        videojs = await loadScript(scriptUrl, "videojs");
      }
      this.api = videojs(video, options);
      if (this.src) this.api.src(this.src);
      this.api.audioTracks().on("addtrack", ({ track }) => {
        if (this.audioTracks.getTrackById(track.id)) return;
        const audioTrack = this.addAudioTrack(track.kind, track.label, track.language);
        audioTrack.id = `${track.id}`;
        audioTrack.enabled = track.enabled;
      });
      this.api.audioTracks().on("removetrack", ({ track }) => {
        const audioTrack = this.audioTracks.getTrackById(track.id);
        if (audioTrack) this.removeAudioTrack(audioTrack);
      });
      this.audioTracks.addEventListener("change", () => {
        const audioTracks = this.api.audioTracks();
        for (let i = 0; i < audioTracks.length; i++) {
          const audioTrack = audioTracks[i];
          audioTrack.enabled = this.audioTracks.getTrackById(audioTrack.id).enabled;
        }
      });
      const qualityLevels = this.api.qualityLevels();
      qualityLevels.on("addqualitylevel", (event) => {
        let videoTrack = this.videoTracks[0];
        if (!videoTrack) {
          videoTrack = this.addVideoTrack("main");
          videoTrack.selected = true;
        }
        const qualityLevel = event.qualityLevel;
        const videoRendition = videoTrack.addRendition(
          qualityLevel.id,
          qualityLevel.width,
          qualityLevel.height,
          void 0,
          qualityLevel.bitrate
        );
        videoRendition.id = `${qualityLevel.id}`;
      });
      const switchRendition = ({ target: renditions }) => {
        const isAuto = renditions.selectedIndex === -1;
        for (let rendition of renditions) {
          const qualityLevel = qualityLevels.getQualityLevelById(rendition.id);
          qualityLevel.enabled = isAuto || rendition.selected;
        }
      };
      this.videoRenditions.addEventListener("change", switchRendition);
      const removeAllMediaTracks = () => {
        for (const videoTrack of this.videoTracks) {
          this.removeVideoTrack(videoTrack);
        }
        for (const audioTrack of this.audioTracks) {
          this.removeAudioTrack(audioTrack);
        }
      };
      this.api.on("emptied", removeAllMediaTracks);
      this.api.on("loadstart", removeAllMediaTracks);
    } else {
      this.api.src(this.src);
    }
    this.api.ready(() => {
      this.loadComplete.resolve();
    });
  }
  connectedCallback() {
    super.connectedCallback();
    if (this.querySelector("source")) {
      this.load();
    }
    if (this.controls) {
      const link = createElement("link", {
        href: `https://cdn.jsdelivr.net/npm/video.js@${this.version}/dist/video-js.min.css`,
        rel: "stylesheet",
        crossorigin: ""
      });
      this.shadowRoot.prepend(link);
      link.onload = () => {
        [...this.shadowRoot.styleSheets[0].cssRules].filter(({ cssText }) => cssText.startsWith("@font-face")).forEach(({ cssText }) => {
          document.head.append(createElement("style", {}, cssText));
        });
      };
    }
  }
  async attributeChangedCallback(attr, oldValue, newValue) {
    var _a2;
    if (attr === "stylesheet") {
      (_a2 = this.shadowRoot.querySelector("#stylesheet")) == null ? void 0 : _a2.remove();
      if (newValue) {
        this.shadowRoot.prepend(
          createElement("link", {
            id: "stylesheet",
            href: newValue,
            rel: "stylesheet",
            crossorigin: ""
          })
        );
      }
      return;
    }
    if (attr === "controls") {
      await this.loadComplete;
      this.api.controls(newValue != null);
      return;
    }
    if (attr === "poster") {
      await this.loadComplete;
      this.api.poster(newValue);
      return;
    }
    super.attributeChangedCallback(attr, oldValue, newValue);
  }
  // Override all methods for video.js so it calls its API directly.
  call(name, ...args) {
    var _a2, _b2;
    return (_b2 = (_a2 = this.api) == null ? void 0 : _a2[name]) == null ? void 0 : _b2.call(_a2, ...args);
  }
  get(prop) {
    var _a2;
    return (_a2 = this.nativeEl) == null ? void 0 : _a2[prop];
  }
  set(prop, val) {
    var _a2, _b2;
    (_b2 = (_a2 = this.api) == null ? void 0 : _a2[prop]) == null ? void 0 : _b2.call(_a2, val);
  }
  get version() {
    return this.getAttribute("version") ?? "8";
  }
}
const loadScriptCache = {};
async function loadScript(src, globalName) {
  if (!globalName) return import(
    /* webpackIgnore: true */
    src
  );
  if (loadScriptCache[src]) return loadScriptCache[src];
  if (self[globalName]) return self[globalName];
  return loadScriptCache[src] = new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.defer = true;
    script.src = src;
    script.onload = () => resolve(self[globalName]);
    script.onerror = reject;
    document.head.append(script);
  });
}
function createElement(tag, attrs = {}, ...children) {
  const el = document.createElement(tag);
  Object.keys(attrs).forEach((name) => attrs[name] != null && el.setAttribute(name, attrs[name]));
  el.append(...children);
  return el;
}
if (globalThis.customElements && !globalThis.customElements.get("videojs-video")) {
  globalThis.customElements.define("videojs-video", VideojsVideoElement);
}
var videojs_video_element_default = VideojsVideoElement;
