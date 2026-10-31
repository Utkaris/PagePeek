import asyncio
import ipaddress
import socket
from urllib.parse import urlsplit

from fastapi import HTTPException, status


async def validate_url(url: str) -> str:
    """
    Validate a URL before allowing the screenshot service to visit it.
    Rejects unsafe schemes, local hosts and private IP addresses.
    """

    url = url.strip()

    if not url or len(url) > 2048:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="URL is empty or too long.",
        )

    try:
        parsed = urlsplit(url)
        scheme = parsed.scheme.lower()
        hostname = parsed.hostname
        port = parsed.port
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid URL.",
        )

    if scheme not in {"http", "https"}:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Only HTTP and HTTPS URLs are allowed.",
        )

    if not hostname:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="URL must contain a valid hostname.",
        )

    if parsed.username is not None or parsed.password is not None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="URLs containing credentials are not allowed.",
        )

    hostname = hostname.rstrip(".").lower()

    blocked_suffixes = (
        ".localhost",
        ".local",
        ".internal",
    )

    if (
        hostname == "localhost"
        or hostname.endswith(blocked_suffixes)
    ):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Local and internal hostnames are not allowed.",
        )

    allowed_ports = {80, 443}

    if port is not None and port not in allowed_ports:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Only ports 80 and 443 are allowed.",
        )

    try:
        ipaddress.ip_address(hostname)
        addresses = [hostname]
    except ValueError:
        try:
            loop = asyncio.get_running_loop()

            results = await loop.getaddrinfo(
                hostname,
                port or (443 if scheme == "https" else 80),
                type=socket.SOCK_STREAM,
            )

            addresses = list({
                result[4][0]
                for result in results
            })

        except (socket.gaierror, OSError):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Could not resolve the URL hostname.",
            )

    if not addresses:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="The hostname has no valid IP address.",
        )

    for address in addresses:
        ip = ipaddress.ip_address(address)

        if not ip.is_global:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="URLs pointing to private or reserved IP addresses are not allowed.",
            )

    return url