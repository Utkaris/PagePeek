import asyncio
import ipaddress
import socket
from pathlib import Path
from urllib.parse import urlsplit
from uuid import uuid4

from playwright.async_api import async_playwright

from app.core.config import settings


async def is_safe_request_url(url: str) -> bool:
    """
    Validate every URL requested by the browser,
    including redirects and subresources.
    """
    try:
        parsed = urlsplit(url)

        if parsed.scheme in {"data", "blob"}:
            return True

        if parsed.scheme not in {"http", "https"}:
            return False

        hostname = parsed.hostname

        if not hostname:
            return False

        if parsed.username is not None or parsed.password is not None:
            return False

        hostname = hostname.rstrip(".").lower()

        if (
            hostname == "localhost"
            or hostname.endswith((".localhost", ".local", ".internal"))
        ):
            return False

        try:
            port = parsed.port
        except ValueError:
            return False

        if port is not None and port not in {80, 443}:
            return False

        try:
            ipaddress.ip_address(hostname)
            addresses = [hostname]
        except ValueError:
            loop = asyncio.get_running_loop()
            results = await loop.getaddrinfo(
                hostname,
                port or (443 if parsed.scheme == "https" else 80),
                type=socket.SOCK_STREAM,
            )
            addresses = list({result[4][0] for result in results})

        if not addresses:
            return False

        return all(ipaddress.ip_address(ip).is_global for ip in addresses)

    except (ValueError, socket.gaierror, OSError):
        return False


async def capture_screenshot(url: str, user_id: int) -> str:
    """
    Capture a website screenshot and save it
    inside the authenticated user's directory.

    Returns the relative screenshot path.
    """
    base_dir = Path(settings.SCREENSHOT_DIR).resolve()
    user_dir = (base_dir / str(user_id)).resolve()

    if not user_dir.is_relative_to(base_dir):
        raise ValueError("Invalid screenshot directory.")

    user_dir.mkdir(parents=True, exist_ok=True)

    filename = f"{uuid4().hex}.png"
    screenshot_path = user_dir / filename

    async with async_playwright() as playwright:
        browser = await playwright.chromium.launch(
            headless=True,
            args=["--no-sandbox", "--disable-setuid-sandbox"],
        )

        try:
            context = await browser.new_context(
                viewport={"width": 1440, "height": 900},
                ignore_https_errors=False,
            )

            page = await context.new_page()

            async def check_request(route):
                request_url = route.request.url

                if await is_safe_request_url(request_url):
                    await route.continue_()
                else:
                    await route.abort()

            await page.route("**/*", check_request)

            page.set_default_navigation_timeout(25000)

            await page.goto(
                url,
                wait_until="domcontentloaded",
                timeout=25000,
            )

            await page.wait_for_timeout(1000)

            await page.screenshot(
                path=str(screenshot_path),
                full_page=False,
                type="png",
            )

            await context.close()

        except Exception:
            screenshot_path.unlink(missing_ok=True)
            raise

        finally:
            await browser.close()

    return str(screenshot_path.relative_to(base_dir))
