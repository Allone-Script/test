package com.fikus.dolabypass;

import android.annotation.SuppressLint;
import android.app.Activity;
import android.graphics.Bitmap;
import android.os.Bundle;
import android.view.KeyEvent;
import android.view.Window;
import android.view.WindowManager;
import android.webkit.CookieManager;
import android.webkit.WebChromeClient;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;

import java.io.BufferedReader;
import java.io.InputStream;
import java.io.InputStreamReader;

public class MainActivity extends Activity {

    private WebView mWebView;
    private String mInjectJs = "";
    private String mDurationJs = "";
    private String mSplashJs = "";
    private String mSitePolishJs = "";
    private String mMobileHudJs = "";

    @Override
    @SuppressLint("SetJavaScriptEnabled")
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        // Immersive dark status bar
        requestWindowFeature(Window.FEATURE_NO_TITLE);
        getWindow().addFlags(WindowManager.LayoutParams.FLAG_DRAWS_SYSTEM_BAR_BACKGROUNDS);
        getWindow().setStatusBarColor(0xFF07060D);
        getWindow().setNavigationBarColor(0xFF07060D);
        getWindow().getDecorView().setBackgroundColor(0xFF07060D);

        // Preload bypass and HUD scripts from assets
        mInjectJs = loadAssetScript("inject.js");
        mDurationJs = loadAssetScript("duration-page-bridge.js");
        mSplashJs = loadAssetScript("dola-splash.js");
        mSitePolishJs = loadAssetScript("site-polish.js");
        mMobileHudJs = loadAssetScript("mobile-hud.js");

        mWebView = new WebView(this);
        setContentView(mWebView);

        WebSettings settings = mWebView.getSettings();
        settings.setJavaScriptEnabled(true);
        settings.setDomStorageEnabled(true);
        settings.setDatabaseEnabled(true);
        settings.setUseWideViewPort(true);
        settings.setLoadWithOverviewMode(true);
        settings.setSupportZoom(false);
        settings.setBuiltInZoomControls(false);
        settings.setMediaPlaybackRequiresUserGesture(false);
        settings.setMixedContentMode(WebSettings.MIXED_CONTENT_ALWAYS_ALLOW);
        settings.setUserAgentString("Mozilla/5.0 (Linux; Android 14; Mobile) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Mobile Safari/537.36");

        // Allow Cookies and Cross-site tokens
        CookieManager.getInstance().setAcceptCookie(true);
        CookieManager.getInstance().setAcceptThirdPartyCookies(mWebView, true);

        mWebView.setWebChromeClient(new WebChromeClient());
        mWebView.setWebViewClient(new WebViewClient() {
            @Override
            public void onPageStarted(WebView view, String url, Bitmap favicon) {
                super.onPageStarted(view, url, favicon);
                injectEarlyScripts(view);
            }

            @Override
            public void onPageFinished(WebView view, String url) {
                super.onPageFinished(view, url);
                injectFullScripts(view);
            }
        });

        // Load Dola
        mWebView.loadUrl("https://dola.com");
    }

    private void injectEarlyScripts(WebView view) {
        if (!mDurationJs.isEmpty()) {
            view.evaluateJavascript(mDurationJs, null);
        }
        if (!mInjectJs.isEmpty()) {
            view.evaluateJavascript(mInjectJs, null);
        }
    }

    private void injectFullScripts(WebView view) {
        injectEarlyScripts(view);
        if (!mSitePolishJs.isEmpty()) {
            view.evaluateJavascript(mSitePolishJs, null);
        }
        if (!mMobileHudJs.isEmpty()) {
            view.evaluateJavascript(mMobileHudJs, null);
        }
        if (!mSplashJs.isEmpty()) {
            view.evaluateJavascript(mSplashJs, null);
        }
    }

    private String loadAssetScript(String filename) {
        try {
            InputStream is = getAssets().open(filename);
            BufferedReader reader = new BufferedReader(new InputStreamReader(is, "UTF-8"));
            StringBuilder sb = new StringBuilder();
            String line;
            while ((line = reader.readLine()) != null) {
                sb.append(line).append("\n");
            }
            reader.close();
            return sb.toString();
        } catch (Exception e) {
            return "";
        }
    }

    @Override
    public boolean onKeyDown(int keyCode, KeyEvent event) {
        if ((keyCode == KeyEvent.KEYCODE_BACK) && mWebView.canGoBack()) {
            mWebView.goBack();
            return true;
        }
        return super.onKeyDown(keyCode, event);
    }
}
