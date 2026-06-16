---
name: hello
description: A demo slash command that greets the user
---

# /my-test-plugin:hello

Greets the user with a friendly message.

## Usage

```
/my-test-plugin:hello [name]
```

## Behavior

When invoked, respond with:

> Hello, [name]! Welcome to my-test-plugin. This is a demo command to verify plugin loading.

If no name is provided, default to "World".
