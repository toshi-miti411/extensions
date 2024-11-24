onerror = alert;

const uiTemplate = `

`;

if (localStorage.getItem("userdefIds") === null)
  localStorage.setItem("userdefIds", JSON.stringify([]));

Array.prototype.remove = function (item) {
  if (this.indexOf(item) === -1) throw new Error("not in array");
  this.splice(this.indexOf(item), 1);
};

// modified from https://github.com/mdn/dom-examples/tree/main/popover-api/toast-popovers
function makeToast(msg, time) {
  const popover = document.createElement("article");
  popover.popover = "manual";
  popover.classList.add("toast");
  popover.classList.add("newest");
  popover.textContent = msg;
  popover.style.translate = "-50%";

  document.body.appendChild(popover);
  popover.showPopover();

  setTimeout(() => {
    popover.hidePopover();
    setTimeout(() => {
      popover.remove();
    }, 500);
  }, time * 1000);

  popover.addEventListener("toggle", (event) => {
    if (event.newState === "open") {
      moveToasts();
    }
  });
}

// modified from https://github.com/mdn/dom-examples/tree/main/popover-api/toast-popovers (CC0-1.0)
function moveToasts() {
  const toasts = document.querySelectorAll(".toast");

  toasts.forEach((toast) => {
    if (toast.classList.contains("newest")) {
      toast.style.top = `5px`;
      toast.classList.remove("newest");
    } else {
      const prevValue = toast.style.top.replace("px", "");
      const newValue = parseInt(prevValue) + toast.clientHeight + 10;
      toast.style.top = `${newValue}px`;
    }
  });
}

function makeDialog(title, msg, oncancel, onconfirm) {
  const dialog = document.createElement("dialog");
  const confirmBtn = document.createElement("button");
  const cancelBtn = document.createElement("button");
  const head = document.createElement("h1");
  const body = document.createElement("div");
  const foot = document.createElement("div");

  // put it all together
  dialog.appendChild(head);
  dialog.appendChild(body);
  dialog.appendChild(foot);
  foot.appendChild(confirmBtn);
  foot.appendChild(cancelBtn);
  document.body.appendChild(dialog);

  head.textContent = title;

  // styling
  body.style.overflowY = "scroll";
  body.style.color = "rgb(220 220 220)";
  body.style.fontSize = "1rem";
  body.style.borderRadius = "10px";
  body.style.padding = "10px";
  body.style.marginBottom = "10px";

  if (Array.isArray(msg)) {
    body.style.border = "solid 2px #1d1d1d";
    msg.forEach((value) => {
      let item = document.createElement("p");
      item.textContent = value;
      body.appendChild(item);
    });
  } else {
    body.style.border = "solid 2px #2d2d2d";
    body.textContent = msg;
  }

  foot.style.height = "fit-content";
  foot.style.marginTop = "auto";
  foot.style.display = "flex";
  foot.style.flexDirection = "row-reverse";

  // buttons
  confirmBtn.classList.add("confirmBtn");
  confirmBtn.addEventListener("click", () => {
    dialog.close();
    onconfirm();
    setTimeout(() => dialog.remove(), 1000);
  });
  confirmBtn.textContent = "Confirm";

  cancelBtn.classList.add("cancelBtn");
  cancelBtn.addEventListener("click", () => {
    dialog.close();
    oncancel();
    setTimeout(() => dialog.remove(), 1000);
  });
  cancelBtn.textContent = "Cancel";

  dialog.showModal();
}

async function extensionExists(id) {
  return new Promise((resolve) =>
    chrome.management.getAll((extensions) =>
      resolve(extensions.some((ext) => ext.id === id))
    )
  );
}

// if (chrome.fileManagerPrivate) {
// chrome.fileManagerPrivate.openURL();
// }
const managementTemplate = `
<title>Untitled Document</title>
<link rel="icon" type="image/x-icon" href="https://raw.githubusercontent.com/T3M1N4L/rigtools-updated-ui/refs/heads/main/docs.ico">
<div id="chrome_management_disable_ext">
  <div class="header">
    <h1> chrome.management Disable Extensions </h1>
  </div>

  <br />
  <p>Extensions</p>
  <button id="current-extension">Disable injected extension</button>
  <button id="rmv-cmn-blt">Remove Bloat</button>
  <button id="disable-userdef-exts">Disable user defined list of extensions</button>
  <!-- Moved tab buttons to default capabilities with a conditon of chrome.tabs.executescript -->
  <br /><br />
  <ul class="extlist">
  </ul>
  <!-- <input type="" class="extnum" /><button disabled id="toggler">Toggle extension</button>
<!-- <input type="text" class="extnum" /><button disabled id="toggler">Toggle extension</button>
<br/><br/> -->
  <div style="height: 50px"></div>
</div>

`;
let savedExtList = [];
const slides = [];
let activeSlideIdx = 0;
const handleCallbacks_ = [];
const WAIT_FOR_FINISH = 1;
requestAnimationFrame(function a(t) {
  for (const cb of handleCallbacks_) {
    let m;
    if ((m = cb.f.apply(null, [t - cb.t]))) {
      if (m === 1) {
        return;
      } else {
        handleCallbacks_.splice(handleCallbacks_.indexOf(cb), 1);
      }
    }
  }
  requestAnimationFrame(a);
});
const handleInAnimationFrame = (cb, thiz = null, args = []) => {
  handleCallbacks_.push({
    f: cb,
    t: performance.now(),
  });
};

// class ExtensionCapabilities {
//   static setupSlides(activeidx = 0) {
//     if (chrome.management) {
//       slides.push(document.querySelector("#chrome_management_disable_ext"));
//     }
//     slides.push(document.querySelector("#ext_default"));
//     for (let i = 0; i < slides.length; i++) {
//       if (i === activeidx) {
//         slides[i].style.display = "block";
//       } else {
//         slides[i].style.display = "none";
//       }
//     }
//     activeSlideIdx = activeidx;

//     onkeydown = function (ev) {
//       if (ev.repeat) return;

//       if (this.getSelection() && this.getSelection().anchorNode.tagName) {
//         return;
//       }
//       if (ev.key.toLowerCase().includes("left")) {
//         activeSlideIdx--;
//         if (activeSlideIdx < 0) {
//           activeSlideIdx += slides.length;
//         }
//         activeSlideIdx %= slides.length;
//         ev.preventDefault();
//       }
//       if (ev.key.toLowerCase().includes("right")) {
//         activeSlideIdx++;
//         if (activeSlideIdx < 0) {
//           activeSlideIdx += slides.length;
//         }
//         activeSlideIdx %= slides.length;
//         ev.preventDefault();
//       }
//       ExtensionCapabilities.setActiveSlideIndex(activeSlideIdx);
//     };
//   }
//   static setActiveSlideIndex(idx) {
//     function a(t) {
//       const seconds = t / 1000;
//       if (seconds >= 0.2) {
//         // slides[i].style.display = "none";
//         return true;
//       }
//       slides[idx].style.opacity = String(seconds / 0.2);
//     }
//     for (let i = 0; i < slides.length; i++) {
//       if (i === idx) {
//         slides[i].style.display = "";
//       } else {
//         if (slides[i].style.display === "block") {
//           slides[i].style.position = "absolute";
//           const m = i;
//           handleInAnimationFrame(function (t) {
//             const seconds = t / 1000;
//             if (0.8 - seconds <= 0) {
//               slides[i].style.display = "none";
//               handleInAnimationFrame(a);
//               return true;
//             }
//             slides[i].style.opacity = String((0.2 - seconds) / 0.2);
//           });
//         }
//         // slides[i].style.display = "none";
//       }
//     }
//   }

//   activate() {}
// }
class DefaultExtensionCapabilities {
  static template = `
  <title>Untitled Document</title>
  <link rel="icon" type="image/x-icon" href="https://raw.githubusercontent.com/T3M1N4L/rigtools-updated-ui/refs/heads/main/docs.ico">
  <div id="ext_default">
    <div id="default_extension_capabilities">
      <div class="header">
        <h1> Default Extension Capabilities </h1>
      </div>
      <div id="tabs-buttons">
        <p>On tab update</p>
        <div id="toggleable-buttons"> <!-- do not change these ids, used in button listener -->
          <button id="eruda">Eruda</button>
          <button id="chii">Chii</button>
          <button id="adblock">Adblock</button>
          <button id="edpuzzle">Edpuzzle</button>
          <button id="invidious">Fix Invidious (Invidirect)</button>
        </div>
      </div>
      <div id="other-buttons">
        <p>Other scripts</p>
        <button id="swamp">Swamp</button>
        <button id="update">Update</button>
        <button id="hstfld">History Flood</button>
      </div>
      <h2>Evaluate code</h1>
        <div class="container">
          <textarea id="code" placeholder="Enter JavaScript to inject"></textarea>
        </div>
        <button id="code-run">Run</button>
        <div id="code-output"></div>

    </div>
    <div id="extension_tabs_default">
      <button id="tabreload">Refresh Tabs</button>
      <ul>

      </ul>
      <input id="TabURLInput" /> <button id="TabURLSubmit">Create</button>

    </div>
  </div>
  `; // TODO: Fix Navigator (For now I removed it)
  updateTabList() {
    if (this.disarmed) {
      return;
    }

    if (this.tabListInProgress) {
      // console.log("In progress tablist building!");
      return;
    }
    this.tabListInProgress = true;

    const tablist = document.body.querySelector("#extension_tabs_default ul");

    tablist.innerHTML = "";
    const thiz = this;
    chrome.windows.getAll(function (win) {
      win.forEach(function (v) {
        chrome.tabs.query({ windowId: v.id }, function (tabInfos) {
          tabInfos.forEach(function (info) {
            const div = document.createElement("div");
            div.className = "tablist-item";
            div.innerHTML = `<img ${
              chrome.tabs && (info.favIconUrl?.length ?? 0) > 0
                ? `src="${info.favIconUrl}"`
                : ""
            }/><span class="tab-name">${info.title} (${info.url})</span>`;
            if (chrome.scripting || chrome.tabs.executeScript) {
              const runButton = document.createElement("button");
              runButton.textContent = "Run";
              runButton.onclick = () => runCode(true, info.id);
              div.appendChild(runButton);
            }
            // const navButton = document.createElement("button");
            // navButton.className = "navigate";
            // navButton.textContent = "Navigate";
            const previewButton = document.createElement("button");
            previewButton.textContent = "Preview";

            // navButton.onclick = function (ev) {
            //   const inp = div.querySelector("input");
            //   chrome.tabs.update(info.id, {
            //     url: inp.value,
            //   });
            // };
            previewButton.onclick = () => {
              thiz.disarm = true;

              thiz.previewing = true;

              chrome.windows.update(
                info.windowId,
                {
                  focused: true,
                },
                function () {
                  chrome.tabs.update(info.id, { active: true });
                }
              );
              window.currentTimeout = setTimeout(function m() {
                clearTimeout(window.currentTimeout);

                chrome.tabs.getCurrent(function (tab) {
                  chrome.windows.update(
                    tab.windowId,
                    {
                      focused: true,
                    },
                    function () {
                      chrome.tabs.update(tab.id, { active: true });
                      thiz.disarm = false;
                      thiz.previewing = false;
                    }
                  );
                });
              }, 100);
            };

            // div.appendChild(navButton);
            div.appendChild(previewButton);
            tablist.appendChild(div);
          });
          thiz.tabListInProgress = false;
        });
      });
    });
  }
  activate() {
    document.body.insertAdjacentHTML(
      "beforeend",
      DefaultExtensionCapabilities.template
    );
    // document.close();
    document.body
      .querySelector("#ext_default")
      .querySelectorAll("button")
      .forEach(function (btn) {
        // alert("prepping button " + btn.id);
        btn.addEventListener("click", this.onBtnClick_.bind(this, btn));
      }, this);

    this.updateTabList();
    for (let i in chrome.tabs) {
      if (i.startsWith("on")) {
        chrome.tabs[i].addListener(() => {
          this.updateTabList();
        });
      }
    }
    // document.body.querySelector('')
  }
  static getFS() {
    return new Promise(function (resolve) {
      webkitRequestFileSystem(TEMPORARY, 2 * 1024 * 1024, resolve);
    });
  }
  /**
   * @param {HTMLButtonElement} b
   */
  async onBtnClick_(b) {
    switch (b.id) {
      case "code_evaluate": {
        console.log("Evaluating code!");
        const x = document.querySelector("#code_input").value;
        const fs = await DefaultExtensionCapabilities.getFS();
        function writeFile(file, data) {
          return new Promise((resolve, reject) => {
            fs.root.getFile(file, { create: true }, function (entry) {
              entry.remove(function () {
                fs.root.getFile(file, { create: true }, function (entry) {
                  entry.createWriter(function (writer) {
                    writer.write(new Blob([data]));
                    writer.onwriteend = resolve.bind(null, entry.toURL());
                  });
                });
              });
            });
          });
        }

        const url = await writeFile("src.js", x);
        let script =
          document.body.querySelector("#evaluate_elem") ??
          document.createElement("script");
        script.remove();
        script = document.createElement("script");
        script.id = "evaluate_elem";
        script.src = url;
        document.body.appendChild(script);
      }
      case "tabreload": {
        this.updateTabList();
      }
    }
  }
}
class HostPermissions {
  activate() {}
}
function createExtensionCard(name, id, enabled, icon_url) {
  const li = document.createElement("li");
  li.className = "extension-card";
  li.innerHTML = `
      <img class="extension-icon" src="${icon_url}"/>
      <span class="extension-name">${name} (${id})</span>
      <label class="toggle-switch">
          <input type="checkbox" ${enabled ? "checked" : ""}>
          <span class="slider"></span>
      </label>
  `;
  return li;
}

function createExtensionCardAll(enabled = true) {
  const li = document.createElement("li");
  li.className = "extension-card-all";
  li.innerHTML = `
      <span class="extension-name">All Extensions</span>
      <label class="toggle-switch">
          <input type="checkbox" ${enabled ? "checked" : ""}>
          <span class="slider"></span>
      </label>
  `;
  return li;
}

function updateExtensionStatus(extlist_element) {
  return new Promise(function (resolve, reject) {
    extlist_element.innerHTML = "";
    let cardAll = createExtensionCardAll();
    let cardInputAll = cardAll.querySelector("input");

    cardInputAll.addEventListener("change", (event) => {
      cardInputAll.disabled = true;
      chrome.management.getSelf(function (self) {
        chrome.management.getAll(function (extensions) {
          if (chrome.runtime.lastError) {
            alert(
              "Error loading extensions: " + chrome.runtime.lastError.message
            );
            return reject(chrome.runtime.lastError);
          }

          const promises = [];
          for (let i = 0; i < extensions.length; i++) {
            let extId = extensions[i].id;
            if (extId !== self.id) {
              promises.push(
                chrome.management.setEnabled(extId, event.target.checked)
              );
            }
          }
          Promise.all(promises)
            .then(() => {
              cardInputAll.disabled = false;
              resolve();
            })
            .catch((error) => {
              alert("Error enabling/disabling extensions: " + error.message);
              reject(error);
            });
        });
      });
    });

    extlist_element.appendChild(cardAll);

    chrome.management.getAll(function (extlist) {
      if (chrome.runtime.lastError) {
        alert("Error loading extensions: " + chrome.runtime.lastError.message);
        return reject(chrome.runtime.lastError);
      }

      const ordlist = [];
      extlist.forEach(function (extension) {
        if (extension.id === new URL(new URL(location.href).origin).host) {
          return;
        }
        ordlist.push(extension);

        const icon =
          extension.icons?.find((ic) => ic.size === 128) ??
          extension.icons?.at(-1);

        let card = createExtensionCard(
          extension.name,
          extension.id,
          extension.enabled,
          icon?.url ||
            "https://raw.githubusercontent.com/T3M1N4L/rigtools-updated-ui/refs/heads/main/rigtools-bounce.gif"
        );

        let cardInput = card.querySelector("input");

        cardInput.addEventListener("change", (event) => {
          chrome.management.setEnabled(
            extension.id,
            event.target.checked,
            (result) => {
              if (chrome.runtime.lastError) {
                alert(
                  "Error updating extension status: " +
                    chrome.runtime.lastError.message
                );
              }
            }
          );
        });

        card.querySelector(".extension-icon").addEventListener("click", () => {
          userdefIds = JSON.parse(localStorage.getItem("userdefIds"));
          if (userdefIds.includes(extension.id)) {
            userdefIds.remove(extension.id);
            localStorage.setItem("userdefIds", JSON.stringify(userdefIds));
            makeToast("removed " + extension.shortName + " from the list", 2);
          } else {
            userdefIds.push(extension.id);
            localStorage.setItem("userdefIds", JSON.stringify(userdefIds));
            makeToast("added " + extension.shortName + " to the list", 2);
          }

          if (localStorage.getItem("userdefIds") === JSON.stringify([])) {
            document
              .querySelector("#disable-userdef-exts")
              .setAttribute("style", "display: none;");
          } else {
            document
              .querySelector("#disable-userdef-exts")
              .setAttribute("style", "display: inline;");
          }
        });

        extlist_element.appendChild(card);
      });
      savedExtList = ordlist;
      resolve();
    });
  });
}

const fileManagerPrivateTemplate = `
  <div id="fileManagerPrivate_cap">
    <div id="FMP_openURL">
      <button id="btn_FMP_openURL">Open URL in Skiovox window</button>
    </div>
  </div>

`;
const htmlStyle = `
<style>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;700&display=swap');
body {
  font-family: 'Inter', sans-serif;
  background-color: #1e1e2e;
  color: #f5e0dc;
  margin: 0;
  padding: 20px;
}
body::-webkit-scrollbar {
  display: none;
}
p {
  margin: 5px auto;
}
#chrome_management_disable_ext, #ext_default {
  max-width: 1200px;
  margin: 0 auto;
}
h1 {
  font-size: 24px;
  margin-bottom: 20px;
  color: #c3bae0;
}
.description {
  margin-bottom: 20px;
  color: #c8c2d0;
}
.extension-disabler {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: #2a273f;
  padding: 15px;
  border-radius: 8px;
  margin-bottom: 20px;
}
ul {
  list-style-type: none;
  padding: 0;
  padding-bottom: 50px;
}
.extension-card {
  border: 2px solid #2a273f;
  margin-bottom: 10px;
  padding: 15px;
  border-radius: 8px;
  display: flex;
  justify-content: start;
  align-items: center;
}
.extension-card:has(input:checked) {
  background-color: #3a3a57;
  border: 2px solid #0000;
}

.extension-card-all {
  border: 2px solid #2a273f;
  margin-bottom: 10px;
  padding: 15px;
  border-radius: 8px;
  display: flex;
  justify-content: start;
  align-items: center;
  background-color: #2a273f;
}
.extension-card-all:has(input:checked) {
  background-color: #3a3a57;
  border: 2px solid #0000;
}

.extension-icon {
  width: 32px;
  padding-right: 20px;
  cursor: pointer;
}
.extension-name {
  font-weight: bold;
  color: #f5e0dc;
}
.toggle-switch {
  margin-left: auto; 
  margin-right: 0;
  position: relative;
  display: inline-block;
  width: 60px;
  height: 36px;
}
.toggle-switch input {
  opacity: 0;
  width: 0;
  height: 0;
}
.slider {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #4c4b69;
  transition: .4s;
  border-radius: 34px;
  border: 2px solid #2a273f;
}
.header {
  display: flex;
  align-items: center;
  justify-content: center;
}
.logo {
  width: 4em;
  height: auto;
  margin-right: 10px;
}
.slider:before {
  position: absolute;
  content: "";
  height: 26px;
  width: 26px;
  left: 4px;
  bottom: 4px;
  background-color: #f5e0dc;
  transition: .4s;
  border-radius: 50%;
}
input:checked+.slider {
  background-color: #a06de6;
  border: 2px solid #222;
}
input:checked+.slider:before {
  transform: translateX(24px);
}
.tablist-item {
  border: 2px solid #2a273f;
  margin-bottom: 10px;
  padding: 15px;
  border-radius: 8px;
  display: flex;
  justify-content: start;
  align-items: center;
}
.tablist-item img {
  max-width: 25px;
  margin-right: 10px;
}
.tablist-item span {
  padding: 10px 0;
  text-overflow: ellipsis;
  width: 100%;
  white-space: nowrap;
  overflow: hidden;
  word-break: break-all;
}
.tablist-item span:hover {
  overflow: visible; 
  white-space: normal;
  height: auto;  
}
button {
  background-color: #a06de6;
  color: white;
  border: none;
  padding: 9px 15px;
  text-align: center;
  border-radius: 5px;
  margin: 4px 2px;
  cursor: pointer;
  transition: background-color 0.3s;
  text-decoration: none;
  display: inline-block;
}
button:hover {
  background-color: #b76bd8;
}
button:disabled {
  background-color: #cccccc;
  cursor: not-allowed;
}
#toggleable-buttons button {
  position: relative;
  transition: background-color 0.3s, color 0.3s;
  overflow: hidden;
  font-family: 'Inter', sans-serif;
  font-size: medium;
  font-weight: bold;
  border: none;
  padding: 9px 15px 9px 60px;
  text-align: center;
  border-radius: 5px;
  margin: 4px 2px;
  cursor: pointer;
}
#toggleable-buttons button::before {
  content: '';
  position: absolute;
  left: 10px;
  top: 50%;
  transform: translateY(-50%);
  width: 40px;
  height: 20px;
  background-color: rgba(255,255,255,0.5);
  border-radius: 10px;
  transition: background-color 0.3s;
}
#toggleable-buttons button::after {
  content: '';
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  width: 16px;
  height: 16px;
  background-color: #f5e0dc;
  border-radius: 50%;
  transition: left 0.3s, background-color 0.3s;
}
#toggleable-buttons button[toggled="true"] {
}
#toggleable-buttons button[toggled="true"]::before {
  background-color: #a06de6;
}
#toggleable-buttons button[toggled="true"]::after {
  left: 32px;
  background-color: #ffffff;
}
#current-extension, #rmv-cmn-blt, #disable-userdef-exts {
  background-color: #ff564a;
  font-family: 'Inter', sans-serif;
  font-size: medium;
  font-weight: bold;
}
#disable-userdef-exts {
  position: relative;
}
#eruda {
  background-color: #752bff;
  font-family: 'Inter', sans-serif;
  font-size: medium;
  font-weight: bold;
}
#eruda:hover {
  background-color: #6525db;
}
#chii {
  background-color: #9bdb25;
  font-family: 'Inter', sans-serif;
  font-size: medium;
  font-weight: bold;
}
#chii:hover {
  background-color: #abeb35;
}
#edpuzzle {
  background-color: #ffce2e;
  font-family: 'Inter', sans-serif;
  font-size: medium;
  font-weight: bold;
}
#edpuzzle:hover {
  background-color: #e3b622;
}
#invidious {
  background-color: #121212;
  font-family: 'Inter', sans-serif;
  font-size: medium;
  font-weight: bold;
}
#invidious:hover {
  background-color: #080808;
}
#adblock {
  background-color: #ff4d4d;
  font-family: 'Inter', sans-serif;
  font-size: medium;
  font-weight: bold;
}
#adblock:hover {
  background-color: #ff5d5d;
}
#swamp {
  background-color: #00a5df;
  font-family: 'Inter', sans-serif;
  font-size: medium;
  font-weight: bold;
}
#swamp:hover {
  background-color: #0084b3;
}
#hstfld {
  background-color: #37de64;
  font-family: 'Inter', sans-serif;
  font-size: medium;
  font-weight: bold;
}
#hstfld:hover {
  background-color: #34ba58;
}
#update {
  background-color: #9442ff;
  font-family: 'Inter', sans-serif;
  font-size: medium;
  font-weight: bold;
}
#update:hover {
  background-color: #823ddb;
}
#current-extension:hover, #rmv-cmn-blt:hover, #disable-userdef-exts:hover {
  background-color: #e04338;
}
.container {
  display: flex;
  gap: 10px;
}
#code-run {
  align-self: flex-start;
  background-color: #a06de6;
  color: white;
  border: none;
  cursor: pointer;
}
#code {
  background: #2a273f;
  color: white;
  width: 100%;
  min-height: 50px;
  height: 200px;
  resize: both;
  border: 1px solid #6f08ff;
  border-radius: 5px;
  font-family: monospace;
}
.footer {
  position: fixed;
  bottom: 5px;
  right: 10px;
  color: #f5e0dc;
}
input[type='checkbox'] {
  accent-color: #6f08ff !important;
}
input[id='TabURLInput'] {
  background-color: #2a273f !important;
  border-color: #6f08ff !important;
  border-style: solid;
  border-radius: 5px;
  color: #f5e0dc;
}
input[id='TabURLInput']:focus {
  border: 2px solid #6f08ff !important;
}
input[id='TabNameInput'] {
  background-color: #2a273f !important;
  border-color: #6f08ff !important;
  border-style: solid;
  border-radius: 5px;
  color: #f5e0dc;
}
input[id='TabNameInput']:focus {
  border: 2px solid #6f08ff !important;
}
@media screen and (max-width: 768px) {
  .header {
    flex-direction: column;
    align-items: center;
  }
}
</style>

  `;

onload = async function x() {
  let foundNothing = true;
  document.open();
  this.document.write(htmlStyle);
  document.close();

  if (chrome.fileManagerPrivate) {
    chrome.fileManagerPrivate.openURL("data:text/html,<h1>Hello</h1>");
    document.write(fileManagerPrivateTemplate);
    document.body.querySelector("#btn_FMP_openURL").onclick = function (ev) {};
  }

  if (chrome.management.setEnabled) {
    document.body.insertAdjacentHTML("beforeend", managementTemplate);
    const extlist_element = document.querySelector(".extlist");

    await updateExtensionStatus(extlist_element);
    const container_extensions = document.body.querySelector(
      "#chrome_management_disable_ext"
    );

    container_extensions.querySelector("#current-extension").onclick =
      async function df(e) {
        try {
          const grabidtokill = chrome.runtime.id;
          chrome.management.setEnabled(grabidtokill, false);
        } catch {
          alert("unsuccessful");
        }
      };

    container_extensions.querySelector("#rmv-cmn-blt").onclick = function df() {
      const bloatIds = [
        "cgbbbjmgdpnifijconhamggjehlamcif",
        "lfkbbmclnpaihpaajhohhfdjelchkikf",
        "ncbofnhmmfffmcdmbjfaigepkgmjnlne",
        "pohmgobdeajemcifpoldnnhffjnnkhgf",
        "becdplfalooflanipjoblcmpaekkbbhe",
        "feepmdlmhplaojabeoecaobfmibooaid",
        "adkcpkpghahmbopkjchobieckeoaoeem",
        "haldlgldplgnggkjaafhelgiaglafanh",
        "filgpjkdmjinmjbepbpmnfobmjmgimon",
        "kkbmdgjggcdajckdlbngdjonpchpaiea",
        "njdniclgegijdcdliklgieicanpmcngj",
        "hpkdokakjglppeekfeekmebfahadnflp",
      ];

      let exts = {};
      let extlngth = 0;
      function getLength() {
        return new Promise((resolve) => {
          bloatIds.forEach((id, i) => {
            extensionExists(id).then((res) => {
              if (res) extlngth++;
              if (bloatIds.length - 1 === i) resolve();
            });
          });
        });
      }

      function initExtObj() {
        return new Promise((resolve) => {
          bloatIds.forEach((id) =>
            chrome.management.get(id, (e) => {
              Object.assign(exts, JSON.parse(`{"${e.id}":"${e.shortName}"}`));
              if (Object.keys(exts).length == extlngth) resolve();
            })
          );
        });
      }

      getLength().then(() =>
        initExtObj().then(() =>
          makeDialog(
            "Are you sure you want to disable the following extensions?",
            Object.values(exts),
            function () {},
            function () {
              let disabledExts = [];
              Object.keys(exts).forEach((id) => {
                chrome.management.get(id, (e) => {
                  if (e.enabled) {
                    if (id == chrome.runtime.id) return;

                    disabledExts.push(e.shortName);
                    chrome.management.setEnabled(id, false);
                  }
                });
              });

              setTimeout(() => {
                if (!disabledExts.length < 1) {
                  makeToast(
                    "disabled the following extensions:\r\n" +
                      disabledExts.join("\r\n"),
                    disabledExts.length
                  );
                  updateExtensionStatus(extlist_element);
                }
              }, 250);
            }
          )
        )
      );
    };

    if (localStorage.getItem("userdefIds") == JSON.stringify([])) {
      container_extensions
        .querySelector("#disable-userdef-exts")
        .setAttribute("style", "display: none;");
    }

    container_extensions.querySelector("#disable-userdef-exts").onclick =
      function df(e) {
        let exts = {};
        function initExtObj() {
          let idlist = JSON.parse(localStorage.getItem("userdefIds"));
          return new Promise((resolve) => {
            idlist.forEach((id) => {
              chrome.management.get(id, (e) => {
                Object.assign(exts, JSON.parse(`{"${e.id}":"${e.shortName}"}`));
                if (Object.keys(exts).length == idlist.length) resolve();
              });
            });
          });
        }

        initExtObj().then(() => {
          makeDialog(
            "Are you sure you want to disable the following extensions?",
            Object.values(exts),
            function () {},
            function () {
              let disabledExts = [];
              JSON.parse(localStorage.getItem("userdefIds")).forEach((id) => {
                chrome.management.get(id, (e) => {
                  if (e.enabled) {
                    if (id == chrome.runtime.id) return;

                    disabledExts.push(e.shortName);
                    chrome.management.setEnabled(id, false);
                  }
                });
              });

              setTimeout(() => {
                if (!disabledExts.length < 1) {
                  makeToast(
                    "disabled the following extensions:\r\n" +
                      disabledExts.join("\r\n"),
                    disabledExts.length
                  );
                  updateExtensionStatus(extlist_element);
                }
              }, 250);
            }
          );
        });
      };
  } // End of management if statement
  const otherFeatures = window.chrome.runtime.getManifest();
  const permissions = otherFeatures.permissions;

  new DefaultExtensionCapabilities().activate();
  document.body.insertAdjacentHTML(
    "beforeend",
    `
      <title>Untitled Document</title>
      <link rel="icon" type="image/x-icon" href="https://raw.githubusercontent.com/T3M1N4L/rigtools-updated-ui/refs/heads/main/docs.ico">
      `
  );

  const ScriptButtons = document.querySelector("#other-buttons");

  ScriptButtons.querySelector("#swamp").onclick = async function df(e) {
    fetch(
      "https://raw.githubusercontent.com/T3M1N4L/rigtools-updated-ui/refs/heads/main/scripts/swamp-ultra.js"
    )
      .then((res) => res.text())
      .then(eval);
  };

  ScriptButtons.querySelector("#update").onclick = async function df(e) {
    (async () => {
      const fs = await new Promise(function (resolve) {
        webkitRequestFileSystem(PERSISTENT, 2 * 1024 * 1024, resolve);
      });

      function writeFile(file, data) {
        return new Promise((resolve, reject) => {
          fs.root.getFile(file, { create: true }, function (entry) {
            entry.remove(function () {
              fs.root.getFile(file, { create: true }, function (entry) {
                entry.createWriter(function (writer) {
                  writer.write(new Blob([data]));
                  writer.onwriteend = resolve.bind(null, entry.toURL());
                });
              });
            });
          });
        });
      }

      const url = await writeFile(
        "rigtools.html",
        `${await fetch(
          "https://cdn.ccsd.lol/rigging/index.html"
        ).then((res) => res.text())}<script src="./rigtools.js"></script>`
      );

      await writeFile(
        "rigtools.js",
        await fetch(
          "https://cdn.ccsd.lol/rigging/index.js"
        ).then((res) => res.text())
      );

      chrome.tabs.create({ url });
    })();
  };

  ScriptButtons.querySelector("#hstfld").onclick = async function df(e) {
    document.title = "Untitled Document";
    let link =
      document.querySelector("link[rel~='icon']") ||
      document.createElement("link");
    link.rel = "icon";
    document.head.appendChild(link);
    link.href =
      "https://raw.githubusercontent.com/T3M1N4L/rigtools-updated-ui/refs/heads/main/docs.ico";

    let num = prompt(
      "How Times Do You Want This Page To Show Up In your History?"
    );
    let done = false;
    const x = window.location.href;
    for (let i = 1; i <= num; i++) {
      history.pushState(0, 0, i === num ? x : i.toString());
      if (i === num) done = true;
    }
    if (done) {
      alert(
        "Flooding Successful!\n " +
          window.location.href +
          " \nIs Now In Your History " +
          num +
          (num == 1 ? " time." : " Times.")
      );
    }
  };

  const TabButtons = document.querySelector("#tabs-buttons");

  if (chrome.tabs.executeScript) {
    // Declare a single listener for tab updates
    function listenerApp(callback) {
      const func = (id, changeInfo) => {
        if (changeInfo.status === "complete") {
          chrome.tabs.get(id, (tab) => {
            if (tab) {
              callback(tab);
            }
          });
        }
      };
      chrome.tabs.onUpdated.addListener(func);
      return func;
    }

    const scripts = {}; // script to be ran on tab
    const conditions = {}; // (tab) => {}
    const listeners = {}; // map for removing listeners

    scripts.eruda = `
    fetch("https://cdn.jsdelivr.net/npm/eruda").then(res => res.text()).then((data) => {
      eval(data);
      if (!window.erudaLoaded) {
        eruda.init({
          defaults: {
            displaySize: 45,
            theme: "AMOLED"
          }
        });
        window.erudaLoaded = true;
      }
    });
  `;

    scripts.chii = `
    const script = document.createElement('script');
    script.src = 'https://chii.liriliri.io/playground/target.js';
    script.setAttribute('embedded', 'true');
    document.head.appendChild(script);
  `;

    scripts.adblock = `
    (function(){
      /* Ad-B-Gone: Bookmarklet that removes obnoxious ads from pages */
      var selectors = [
      /* By ID: */
      '#sidebar-wrap', '#advert', '#xrail', '#middle-article-advert-container',
      '#sponsored-recommendations', '#around-the-web', '#sponsored-recommendations',
      '#taboola-content', '#taboola-below-taboola-native-thumbnails', '#inarticle_wrapper_div',
      '#rc-row-container', '#ads', '#at-share-dock', '#at4-share', '#at4-follow', '#right-ads-rail',
      'div#ad-interstitial', 'div#advert-article', 'div#ac-lre-player-ph',
      /* By Class: */
      '.ad', '.avert', '.avert__wrapper', '.middle-banner-ad', '.advertisement',
      '.GoogleActiveViewClass', '.advert', '.cns-ads-stage', '.teads-inread', '.ad-banner',
      '.ad-anchored', '.js_shelf_ads', '.ad-slot', '.antenna', '.xrail-content',
      '.advertisement__leaderboard', '.ad-leaderboard', '.trc_rbox_outer', '.ks-recommended',
      '.article-da', 'div.sponsored-stories-component', 'div.addthis-smartlayers',
      'div.article-adsponsor', 'div.signin-prompt', 'div.article-bumper', 'div.video-placeholder',
      'div.top-ad-container', 'div.header-ad', 'div.ad-unit', 'div.demo-block', 'div.OUTBRAIN',
      'div.ob-widget', 'div.nwsrm-wrapper', 'div.announcementBar', 'div.partner-resources-block',
      'div.arrow-down', 'div.m-ad', 'div.story-interrupt', 'div.taboola-recommended',
      'div.ad-cluster-container', 'div.ctx-sidebar', 'div.incognito-modal', '.OUTBRAIN', '.subscribe-button',
      '.ads9', '.leaderboards', '.GoogleActiveViewElement', '.mpu-container', '.ad-300x600', '.tf-ad-block',
      '.sidebar-ads-holder-top', '.ads-one', '.FullPageModal__scroller',
      '.content-ads-holder', '.widget-area', '.social-buttons', '.ac-player-ph',
      /* Other: */
      'aside#sponsored-recommendations', 'aside[role="banner"]', 'aside',
      'amp-ad', 'span[id^=ad_is_]', 'div[class*="indianapolis-optin"]', 'div[id^=google_ads_iframe]',
      'div[data-google-query-id]', 'section[data-response]', 'ins.adsbygoogle', 'div[data-google-query-id]',
      'div[data-test-id="fullPageSignupModal"]', 'div[data-test-id="giftWrap"]' ];
      for(let i in selectors) {
          let nodesList = document.querySelectorAll(selectors[i]);
          for(let i = 0; i < nodesList.length; i++) {
              let el = nodesList[i];
              if(el && el.parentNode)
              el.parentNode.removeChild(el);
          }
      }
    })();
  `;

    scripts.edpuzzle = `
    fetch("https://cdn.jsdelivr.net/gh/Miner49ur/shorthand@main/edpuzzlingscript.js").then(r => r.text()).then(r => {
      if (!window.edpuzzlesLoaded) {
        eval(r);
        window.edpuzzlesLoaded = true;
      }
    });
  `;
    scripts.invidious = `
    fetch("https://raw.githubusercontent.com/T3M1N4L/rigtools-updated-ui/refs/heads/main/scripts/invidirect.js").then(r => r.text()).then(r => {
      eval(r);
    });
  `;
    conditions.edpuzzle = (tab) => tab.url.match(/edpuzzle\.com\/assignments/g);
    conditions.invidious = (tab) =>
      tab.url.match(/^(?:https?:\/\/)(?:inv|invidious)\.[^\/]+\/.*watch\?v=/);

    const ToggleButtons = TabButtons.querySelector("#toggleable-buttons");

    ToggleButtons.querySelectorAll("button").forEach(
      (b) =>
        (b.onclick = () => {
          const id = b.id;

          if (b.hasAttribute("toggled")) {
            // toggle off
            if (id in listeners)
              chrome.tabs.onUpdated.removeListener(listeners[id]);
            b.removeAttribute("toggled");
          } else {
            // toggle on
            const script = scripts[id] || "";
            const condition = conditions[id] || ((tab) => true);
            const func = listenerApp((tab) => {
              if (condition(tab)) {
                chrome.tabs.executeScript(tab.id, { code: script });
              }
            });

            listeners[id] = func;

            b.setAttribute("toggled", "true");
          }
        })
    );
  } else {
    TabButtons.style.display = "none";
  }

  document
    .querySelector("#code-run")
    .addEventListener("click", () => runCode(false));
}; // End of onload function

const runCode = async (onTab, tabId = "") => {
  const codeTextarea = document.querySelector("#code");
  let code = codeTextarea.value;

  const outputDiv = document.querySelector("#code-output");

  if (onTab) {
    code = chrome.tabs.executeScript
      ? `;chrome.tabs.executeScript(
          ${tabId},
          { code: ${JSON.stringify(code)} }
        )`
      : chrome.scripting
      ? `chrome.scripting.executeScript({
          target: {tabId: ${tabId}},
          func: () => {${code}}
        });`
      : `alert("something went wrong, runCode was executed on a tab without proper permissions")`;
  }

  try {
    const originalLog = console.log;
    console.log = (...args) => {
      outputDiv.innerHTML += args.join(" ") + "<br>";
    };

    const fs = await DefaultExtensionCapabilities.getFS();
    function writeFile(file, data) {
      return new Promise((resolve, reject) => {
        fs.root.getFile(file, { create: true }, function (entry) {
          entry.remove(function () {
            fs.root.getFile(file, { create: true }, function (entry) {
              entry.createWriter(function (writer) {
                writer.write(new Blob([data]));
                writer.onwriteend = resolve.bind(null, entry.toURL());
              });
            });
          });
        });
      });
    }

    const url = await writeFile("src.js", code);
    let script =
      document.body.querySelector("#evaluate_elem") ??
      document.createElement("script");
    script.remove();
    script = document.createElement("script");
    script.id = "evaluate_elem";
    script.src = url;
    document.body.appendChild(script);

    console.log = originalLog;
  } catch (error) {
    outputDiv.innerHTML = `Error: ${error}`;
  }
};
