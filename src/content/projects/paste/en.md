---
title: 'Paste'
tagline: 'A native macOS menu bar clipboard manager: summon it with Cmd+Shift+V, pick an entry, paste it'
date: 2026-06-22
stack: ['SwiftUI', 'macOS', 'TypeScript']
status: 'Released'
links:
  repo: 'https://github.com/leesun1729/Paste'
  release: 'https://github.com/leesun1729/Paste/releases/latest'
featured: true
order: 1
---

The thing you copied is usually gone by the time you need it again. The system clipboard holds exactly one item, but writing code, reading docs and assembling notes means shuttling a command, a link or a screenshot between apps all day. Paste is a clipboard manager that lives in the macOS menu bar, keeps a running history of what you copy, and puts that history one global keystroke away so you can pick an entry and drop it straight at the cursor. It is built for people who spend their day on the keyboard and would rather not install a desktop app that ships an entire browser engine to do it.

## Capabilities

- Automatic capture with type detection. Copy text, code, a link, an email address, JSON, a color value or an image and it lands in the history, filed under one of seven categories: Text, Code, URL, Email, JSON, Color, Image.
- Image history. Screenshots and copied images are stored in full, previewable in the panel, and pasteable back out.
- Global summon. Press `Cmd+Shift+V` in any app to bring up the quick paste panel, move with `↑↓`, paste at the cursor with `Enter`, dismiss with `Esc`.
- Favorites and pinning. Frequently used entries can be favorited and pinned to the top so later copies cannot push them down.
- Search and filtering. The left sidebar filters by category, including an image-only view; the search field filters by keyword.
- Local storage with configurable limits. History caps at 500, 1,000, 2,000 or 5,000 items, and retention is set to 7, 14, 30 or 90 days or forever. Items beyond either limit are cleaned up automatically.
- Audio feedback. Summoning the panel and pasting both play a system sound, so an action has an audible receipt.
- Synchronized panels. The main panel and the quick paste panel read the same data, so deleting, favoriting or pinning on one side is already reflected on the other.
- Settings in one place. Theme is light, dark or system; capacity and retention are adjusted from the Settings entry in the main panel's sidebar.

## Interaction model

The main path is three steps: summon, choose, paste. All of it happens on the keyboard and none of it interrupts the app you were typing in.

`Cmd+Shift+V` is intercepted system-wide through a CGEvent Tap, so it does not depend on which app is in front and you never have to click the menu bar icon first. The panel appears as an `NSPanel` floating above the current window. `↑↓` moves the selection, `Enter` pastes, `Esc` dismisses. The paste itself is a synthesized `Cmd+V` sent via CGEvent into whatever field currently has focus, which is why Paste never needs to become the frontmost app and why you never have to switch windows by hand.

Both panels are backed by the same store. The main panel is the full view: browse the entire history, delete, favorite, pin, change settings. The quick paste panel is the lightweight view used on summon, responsible only for choosing and pasting. They are not two copies kept in step by a sync step; they read the same state, so an entry you delete in the main panel is simply absent the next time you summon the popup, with no refresh or reload involved.

One detail worth recording: the popup panel could not accept Chinese input under an IME until it was changed to a `KeyablePanel`. That class of problem is the part you sign up for when you build on native windows, and it is the reason this route is more work than wrapping a WebView.

## Technical decisions

**Pure SwiftUI, no Electron and no WebView.** This is the decision that shapes everything else. A clipboard manager is a small always-running background utility, and an Electron build would ask the user to pay a few hundred megabytes of RAM and a full browser runtime, permanently, in exchange for remembering copy history. Building on SwiftUI and AppKit means implementing all the UI and window behavior directly and giving up any hope of running elsewhere. What it buys is a fast launch, a memory footprint in the same range as any native app, and direct access to `NSPasteboard` and `CGEvent` with no intermediary layer in between.

**Data stays on the machine; there is no cloud sync.** Passwords, private keys and internal hostnames end up in a clipboard history sooner or later, and once that history is on a server, the blast radius stops being something the user controls. Paste writes its records into local UserDefaults using JSON encoding, and bounds the growth with a configurable item cap and retention window. The cost is straightforward: moving to a new machine or reinstalling does not carry the history over, and there is no synchronization between devices. For this kind of data the project treats that as the right trade.

**Paste injection requires the Accessibility permission.** Synthesizing `Cmd+V` means injecting keyboard events into other applications, which macOS only permits for a process holding the Accessibility permission. There is no way around it, so Paste guides the user to System Settings on first run. The side effect is that the grant is invalidated whenever the app bundle is rebuilt or replaced, which means re-adding it; if the hotkey stops working, this is the first thing to check.

**Type detection uses a fixed set of categories rather than free-form tags.** Filing entries under Text, Code, URL, Email, JSON, Color and Image keeps the filter sidebar stable, so you know where to look after one glance. The cost is that the boundaries are genuinely fuzzy: a snippet that reads as both prose and code has to land in exactly one bucket. The project accepts that fuzziness instead of adding editable tags or a heavier inference step, because either would make an interface whose only job is finding things considerably more complicated.

**AppKit for windows, SwiftUI for views.** The menu bar icon, the global hotkey and the floating panel all need finer window control than SwiftUI exposes, so that layer lives in `AppDelegate` and `NSWindow` / `NSPanel`, while the content inside those windows is rendered by SwiftUI.

## Install and requirements

macOS 14 or later is required.

Download the latest `Paste.dmg` from [Releases](https://github.com/leesun1729/Paste/releases/latest) and drag the app into `/Applications/`.

On first launch, grant the Accessibility permission: open **System Settings → Privacy & Security → Accessibility**, click `+`, and select `/Applications/Paste.app`. Without it, `Cmd+Shift+V` will still open the panel, but the paste will not land.

To build it yourself instead, install the Xcode Command Line Tools (`xcode-select --install`), then clone the repository, run the packaging script and copy the result into Applications:

```bash
git clone https://github.com/leesun1729/Paste.git
cd Paste
./package.sh
cp -R Paste.app /Applications/
```

A locally built bundle needs the same Accessibility grant. Uninstalling is a matter of deleting `/Applications/Paste.app`.

## License

Paste is open source under the MIT license, with the source at [leesun1729/Paste](https://github.com/leesun1729/Paste).
