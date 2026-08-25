#!/usr/bin/env python3
"""Run test/index.html in a real Chrome browser via Playwright and report results.

This script does not install anything. It expects Playwright's Python package
to already be installed in the active Python environment, and it auto-detects
a local Chrome executable (defaulting to the standard Windows install path).
"""
import pathlib
import sys


def find_chrome():
    candidates = [
        r"C:\Program Files\Google\Chrome\Application\chrome.exe",
        r"C:\Program Files (x86)\Google\Chrome\Application\chrome.exe",
    ]
    for candidate in candidates:
        if pathlib.Path(candidate).exists():
            return candidate
    return None


def main():
    if hasattr(sys.stdout, "reconfigure"):
        sys.stdout.reconfigure(encoding="utf-8", errors="replace")
        sys.stderr.reconfigure(encoding="utf-8", errors="replace")

    try:
        from playwright.sync_api import sync_playwright
    except ImportError:
        print("Playwright is not installed in this Python environment.", file=sys.stderr)
        return 1

    test_page = (pathlib.Path(__file__).resolve().parent / "index.html").as_uri()
    chrome_path = find_chrome()

    with sync_playwright() as p:
        launch_kwargs = {}
        if chrome_path:
            launch_kwargs["executable_path"] = chrome_path
        else:
            launch_kwargs["channel"] = "chrome"
        browser = p.chromium.launch(**launch_kwargs)
        page = browser.new_page()
        errors = []
        page.on("pageerror", lambda exc: errors.append(str(exc)))
        page.on("console", lambda msg: errors.append(msg.text) if msg.type == "error" else None)
        page.goto(test_page)
        page.wait_for_function("document.querySelector('#test-summary').textContent.indexOf('passed') >= 0")

        summary = page.text_content("#test-summary")
        items = page.query_selector_all("#test-output li")
        results = []
        for item in items:
            class_name = item.get_attribute("class") or ""
            results.append((class_name.strip(), item.text_content()))

        browser.close()

    print(summary)
    for class_name, text in results:
        if class_name != "pass":
            print(text)
    if errors:
        print("Console/page errors:")
        for error in errors:
            print(error)

    return 0 if summary and "0 failed" in summary else 1


if __name__ == "__main__":
    sys.exit(main())
