#!/usr/bin/env python3
"""Block agent access to .env files (read or write)."""

from __future__ import annotations

import json
import os
import re
import sys

DENY_MESSAGE = (
    "Access to .env files is blocked by project policy. "
    "Use .env.example for documentation and set secrets manually."
)

ENV_TOKEN_RE = re.compile(r"(?:^|[\s'\"`=])(\.env(?:\.[A-Za-z0-9_.-]+)?)")

ALLOWED_ENV_SUFFIXES = (".example", ".template", ".sample")


def is_env_file(file_path: str | None) -> bool:
    if not file_path:
        return False

    name = os.path.basename(file_path)
    if name == ".env":
        return True

    if not name.startswith(".env."):
        return False

    return not any(name.endswith(suffix) for suffix in ALLOWED_ENV_SUFFIXES)


def command_touches_env(command: str | None) -> bool:
    if not command:
        return False

    for match in ENV_TOKEN_RE.finditer(command):
        token = match.group(1)
        if is_env_file(f"/{token}"):
            return True

    return False


def deny() -> None:
    payload = {
        "permission": "deny",
        "user_message": DENY_MESSAGE,
        "agent_message": DENY_MESSAGE,
    }
    print(json.dumps(payload))
    sys.exit(2)


def allow() -> None:
    print(json.dumps({"permission": "allow"}))
    sys.exit(0)


def tool_path(payload: dict) -> str | None:
    tool_input = payload.get("tool_input")
    if not isinstance(tool_input, dict):
        return None

    for key in ("path", "target_notebook", "file_path"):
        value = tool_input.get(key)
        if isinstance(value, str):
            return value

    return None


def main() -> None:
    try:
        payload = json.load(sys.stdin)
    except json.JSONDecodeError:
        deny()

    file_path = payload.get("file_path")
    if isinstance(file_path, str) and is_env_file(file_path):
        deny()

    attachments = payload.get("attachments")
    if isinstance(attachments, list):
        for attachment in attachments:
            if not isinstance(attachment, dict):
                continue
            attachment_path = attachment.get("file_path")
            if isinstance(attachment_path, str) and is_env_file(attachment_path):
                deny()

    command = payload.get("command")
    if isinstance(command, str) and command_touches_env(command):
        deny()

    path = tool_path(payload)
    if path and is_env_file(path):
        deny()

    allow()


if __name__ == "__main__":
    main()
