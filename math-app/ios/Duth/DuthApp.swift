import AVFoundation
import SwiftUI
import WebKit

/**
 duth on the phone.

 Every screen is the web app (math-app-five-beta.vercel.app); this shell opens it
 and fills the gaps a browser tab has: microphone access without asking every
 time, lecture voice that plays with the silent switch on, links that leave the
 app opening in Safari, and picking up a new day's problems when the app comes
 back after a while.
 */
let appURL = URL(string: "https://math-app-five-beta.vercel.app/")!

/// After this long in the background, coming back reloads the page, so the
/// morning's new plan shows up. Shorter breaks keep whatever is on screen
/// (a typed answer, a half-written chat message, a lecture in progress).
let reloadAfter: TimeInterval = 15 * 60

@main
struct DuthApp: App {
    @Environment(\.scenePhase) private var scenePhase
    @State private var reloadToken = 0
    @State private var backgroundedAt: Date?

    init() {
        // The blackboard lecture speaks through speechSynthesis; .playback keeps it
        // audible when the ringer is off.
        try? AVAudioSession.sharedInstance().setCategory(.playback, mode: .spokenAudio)
    }

    var body: some Scene {
        WindowGroup {
            WebShell(url: appURL, reloadToken: reloadToken)
                .ignoresSafeArea()
                .background(Color.white)
                .preferredColorScheme(.light)
                .onChange(of: scenePhase) { _, phase in
                    switch phase {
                    case .background:
                        backgroundedAt = Date()
                    case .active:
                        if let since = backgroundedAt, Date().timeIntervalSince(since) > reloadAfter {
                            reloadToken += 1
                        }
                        backgroundedAt = nil
                    default:
                        break
                    }
                }
        }
    }
}

struct WebShell: UIViewRepresentable {
    let url: URL
    /// Changing this reloads the page.
    var reloadToken: Int = 0

    func makeUIView(context: Context) -> WKWebView {
        let config = WKWebViewConfiguration()
        config.websiteDataStore = .default() // keeps localStorage: language, scratchpads, passcode
        config.allowsInlineMediaPlayback = true
        config.mediaTypesRequiringUserActionForPlayback = []

        let web = WKWebView(frame: .zero, configuration: config)
        web.navigationDelegate = context.coordinator
        web.uiDelegate = context.coordinator
        web.isOpaque = false
        web.backgroundColor = .white
        web.scrollView.backgroundColor = .white
        // The page lays itself out around the notch and home bar with
        // env(safe-area-inset-*), so the scroll view must not add its own insets.
        web.scrollView.contentInsetAdjustmentBehavior = .never
        web.load(URLRequest(url: url, cachePolicy: .reloadIgnoringLocalCacheData))
        return web
    }

    func updateUIView(_ web: WKWebView, context: Context) {
        guard reloadToken != context.coordinator.lastToken else { return }
        context.coordinator.lastToken = reloadToken
        web.load(URLRequest(url: url, cachePolicy: .reloadIgnoringLocalCacheData))
    }

    func makeCoordinator() -> Coordinator { Coordinator(url: url) }

    final class Coordinator: NSObject, WKNavigationDelegate, WKUIDelegate {
        private let url: URL
        /// The last reloadToken acted on; updateUIView is called often for no reason.
        var lastToken = 0
        init(url: URL) { self.url = url }

        /// The voice-question mic: grant for our own site so iOS asks only once (the system prompt).
        func webView(_ webView: WKWebView, requestMediaCapturePermissionFor origin: WKSecurityOrigin,
                     initiatedByFrame frame: WKFrameInfo, type: WKMediaCaptureType,
                     decisionHandler: @escaping (WKPermissionDecision) -> Void) {
            decisionHandler(origin.host == url.host ? .grant : .prompt)
        }

        /// Links to other sites (recommended lecture videos) open in Safari / YouTube.
        func webView(_ webView: WKWebView, decidePolicyFor action: WKNavigationAction,
                     decisionHandler: @escaping (WKNavigationActionPolicy) -> Void) {
            if let target = action.request.url, target.host != url.host,
               action.navigationType == .linkActivated, ["http", "https"].contains(target.scheme) {
                UIApplication.shared.open(target)
                decisionHandler(.cancel)
                return
            }
            decisionHandler(.allow)
        }

        /// target=_blank links: the web view ignores them by default.
        func webView(_ webView: WKWebView, createWebViewWith configuration: WKWebViewConfiguration,
                     for action: WKNavigationAction, windowFeatures: WKWindowFeatures) -> WKWebView? {
            if let target = action.request.url { UIApplication.shared.open(target) }
            return nil
        }

        /// Opening with a weak signal can leave a blank page; quietly try again.
        func webView(_ web: WKWebView, didFailProvisionalNavigation navigation: WKNavigation!, withError error: Error) {
            DispatchQueue.main.asyncAfter(deadline: .now() + 2) { [weak web] in
                guard let web, web.url == nil else { return }
                web.load(URLRequest(url: self.url, cachePolicy: .reloadIgnoringLocalCacheData))
            }
        }
    }
}
