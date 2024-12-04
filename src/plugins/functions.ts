import md from "./rules";
import mdEmail from "./rulesEmail";
import { Platform, useAppStore } from "@/store/app.store";
import {
  Chat,
  Message,
  PartialUserFriend,
  User,
  UserStatus,
  UserStoredStatus
} from "@/gql/graphql";
import colors from "vuetify/util/colors";

export default {
  fileSize(size: number): string {
    if (size === 0) return "0KB";

    let i = -1;
    const byteUnits = ["KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"];
    do {
      size = size / 1024;
      i++;
    } while (size > 1024);

    return Math.max(size, 0.1).toFixed(1) + byteUnits[i];
  },
  copy(text: string): void {
    navigator.clipboard.writeText(text);
  },
  doSinglePulse(type: string, other: object, timeOnPage?: number) {
    window.tpuInternals.pulse.emit("pulse", {
      action: type,
      timeSpent: timeOnPage || 0,
      route: window.location.pathname,
      device: navigator.platform,
      sysInfo: {
        ua: navigator.userAgent
      },
      name: null,
      other
    });
  },
  avatar(chat?: Chat | User | PartialUserFriend) {
    const app = useAppStore();
    if (!chat) return undefined;
    if ("username" in chat) {
      if (chat.avatar && chat.avatar.length > 20) {
        return "https://colubrina.troplo.com/usercontent/" + chat.avatar;
      } else if (chat.avatar) {
        return app.domain + chat.avatar;
      } else {
        return undefined;
      }
    }
    if (chat.type === "direct" && chat.recipient?.avatar) {
      return app.domain + chat.recipient.avatar;
    } else if (chat.type === "group" && chat.icon?.length > 20) {
      return "https://colubrina.troplo.com/usercontent/" + chat.icon;
    } else if (chat.type === "group" && chat.icon) {
      return app.domain + chat.icon;
    } else {
      return undefined;
    }
  },
  richMessage(content: string, message?: Message | null) {
    const regex = /\\?&lt;(@\d+)&gt;/g;
    const mentions = content.match(regex);
    const regexEmoji = content.match(/:([^:]+):([\w-]+):/g);
    if (import.meta.env.DEV)
      console.warn(`Rich message re-rendered: ${message?.id ?? "no object"}`);
    if (regexEmoji) {
      const isOnlyEmojis =
        content
          .replaceAll("\n", "")
          .replace(/<\/?[^>]+(>|$)/g, "")
          .replace(/:([\w~-]+)(?::([\w~-]+))?:(?!\w)/g, "")
          .replaceAll(" ", "") === "";
      for (const emoji of regexEmoji) {
        const find = message?.emoji?.find((e) => e.id === emoji.split(":")[2]);
        if (!find) continue;
        const bind = `emoji-bind-${message.id}-${Math.random()
          .toString(36)
          .substring(2, 10)}`;
        content = content.replace(
          emoji,
          `<span class="pointer" id="${bind}" onclick="tpuInternals.openEmoji('${
            find.id
          }', '${find.name}', '${find.icon}', ${find.chatId}, ${
            message.id
          }, '${bind}')"><img class="undraggable v-img__img--contain emoji${
            isOnlyEmojis ? " emoji-large" : ""
          }" src="/i/${find.icon}"></span>`
        );
      }
    }
    if (mentions) {
      for (const mention of mentions) {
        const userId = mention.match(/&lt;@(\d+)&gt;/)![1];
        const user = window.tpuInternals.lookupUser(parseInt(userId));
        if (user.id) {
          content = content.replace(
            mention,
            `<span class="pointer unselectable mention" onclick="window.tpuInternals.openUser(${user.id})"><i class="mdi-at mdi v-icon notranslate v-icon--size-small" aria-hidden="true"></i>${user.username}</span>`
          );
        } else {
          content = content.replace(
            mention,
            `<span class="unselectable mention"><i class="mdi-at mdi v-icon notranslate v-icon--size-small" aria-hidden="true"></i>${user.username}</span>`
          );
        }
      }
    }
    const channels = content.match(/\\?&lt;#\d+&gt;/g);
    if (channels) {
      for (const channel of channels) {
        const channelId = channel.match(/&lt;#(\d+)&gt;/)![1];
        const channelData = window.tpuInternals.lookupChat(parseInt(channelId));
        if (channelData.id) {
          content = content.replace(
            channel,
            `<span class="pointer unselectable mention" onclick="window.tpuInternals.setChat(${channelData?.association?.id})"><i class="mdi-pound mdi v-icon notranslate v-icon--size-small" aria-hidden="true"></i>${channelData.name}</span>`
          );
        } else {
          content = content.replace(
            channel,
            `<span class="unselectable mention"><i class="mdi-pound mdi v-icon notranslate v-icon--size-small" aria-hidden="true"></i>${channelData.name}</span>`
          );
        }
      }
    }
    const collections = content.match(/\\?&lt;&amp;\d+&gt;/g);
    if (collections) {
      for (const collection of collections) {
        const collectionId = collection.match(/&lt;&amp;(\d+)&gt;/)![1];
        const collectionData = window.tpuInternals.lookupCollection(
          parseInt(collectionId)
        );
        if (collectionData.id) {
          content = content.replace(
            collection,
            `<span class="pointer unselectable mention" onclick="window.tpuInternals.openCollection(${collectionData.id})"><i class="mdi-folder-multiple-image mdi v-icon notranslate v-icon--size-small" aria-hidden="true"></i> ${collectionData.name}</span>`
          );
        } else {
          content = content.replace(
            collection,
            `<span class="unselectable mention"><i class="mdi-folder-multiple-image mdi v-icon notranslate v-icon--size-small" aria-hidden="true"></i> No Permission</span>`
          );
        }
      }
    }
    return content;
  },
  /** Should be used alongside v-memo or v-once to prevent unwanted re-renders */
  markdown(text: string, message?: Message | null): any {
    return this.richMessage(md.render(text), message);
  },
  /** Should be used alongside v-memo or v-once to prevent unwanted re-renders */
  markdownEmail(text: string): any {
    return mdEmail.render(text);
  },
  userStatus(status: UserStatus | UserStoredStatus) {
    switch (status) {
      case UserStoredStatus.Online:
        return {
          color: "#4caf50",
          text: "Online"
        };
      case UserStoredStatus.Idle:
        return {
          color: "#ff9800",
          text: "Idle"
        };
      case UserStoredStatus.Busy:
        return {
          color: "#f44336",
          text: "Do not disturb"
        };
      case UserStoredStatus.Invisible:
        return {
          color: "grey",
          text: "Invisible"
        };
      default:
        return {
          color: "grey",
          text: "Offline"
        };
    }
  },
  base64ToFile(base64: string, fileName: string = "file.png") {
    // Split the base64 string into two parts
    const parts = base64.split(";base64,");

    // Create a byte array from the base64 data
    const byteCharacters = atob(parts[1]);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);

    // Create a Blob object from the byte array and file type
    const blob = new Blob([byteArray], { type: parts[0].split(":")[1] });

    // Create a File object from the Blob and file name
    return new File([blob], fileName, { type: blob.type });
  },
  checkScope(
    requiredScope: string | undefined | string[],
    scope: string | undefined
  ) {
    if (!scope || !requiredScope) {
      return true;
    }
    if (scope === "*") {
      return true;
    }
    // scope is the current session scope, and requiredScope is the scope required for the route, formatted like user.read or user.write
    // check if the required scope is contained in the current scope, comma separated
    const scopes = scope.split(",");
    for (const scope of scopes) {
      if (typeof requiredScope === "string") {
        if (scope === requiredScope) {
          return true;
        } else if (scope?.split(".")[0] === requiredScope) {
          return true;
        }
      } else {
        if (requiredScope.includes(scope)) {
          return true;
        } else if (requiredScope.includes(scope?.split(".")[0])) {
          return true;
        }
      }
    }
    return false;
  },
  uuid() {
    try {
      return self.crypto.randomUUID();
    } catch {
      // If self.crypto.randomUUID() is not supported
      return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(
        /[xy]/g,
        function (c) {
          const r = (Math.random() * 16) | 0,
            v = c == "x" ? r : (r & 0x3) | 0x8;
          return v.toString(16);
        }
      );
    }
  },
  charUp(str: string) {
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  },
  contrast(hex: string) {
    const r = parseInt(hex.substr(1, 2), 16);
    const g = parseInt(hex.substr(3, 2), 16);
    const b = parseInt(hex.substr(5, 2), 16);
    const yiq = (r * 299 + g * 587 + b * 114) / 1000;
    return yiq >= 100;
  },
  getPlatform() {
    if (navigator.userAgent.indexOf("Win") != -1) {
      return "Windows";
    } else if (navigator.userAgent.indexOf("Android") != -1) {
      return "Android";
    } else if (navigator.userAgent.indexOf("iOS") != -1) {
      return "iOS";
    } else if (navigator.userAgent.indexOf("iPhone") != -1) {
      return "iOS";
    } else if (navigator.userAgent.indexOf("iPad") != -1) {
      return "iOS";
    } else if (navigator.userAgent.indexOf("iPod") != -1) {
      return "iOS";
    } else if (navigator.userAgent.indexOf("Mac") != -1) {
      return "Mac";
    } else if (navigator.userAgent.indexOf("Linux") != -1) {
      return "Linux";
    } else if (navigator.userAgent.indexOf("X11") != -1) {
      return "Linux";
    }
  },
  platformIcon(platform?: "Windows" | "Mac" | "Linux") {
    const app = useAppStore();
    return `mdi-${
      app.platform === Platform.LINUX || platform === "Linux"
        ? "linux"
        : app.platform === Platform.MAC || platform === "Mac"
          ? "apple"
          : "microsoft"
    }
    `;
  },
  randomColorGenerator(index) {
    const approvedColors = [
      "blue",
      "green",
      "yellow",
      "indigo",
      "red",
      "orange",
      "purple",
      "amber",
      "lightGreen",
      "deepPurple",
      "teal",
      "cyan",
      "pink",
      "lime",
      "grey",
      "deepOrange",
      "blueGrey"
    ];
    const randomColor = colors[approvedColors[index % approvedColors.length]];
    return randomColor.base;
  }
};
