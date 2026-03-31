---
title: Python Errors
description: This documentation provides details to help investigate user errors in Python code
slug: /user-guide/troubleshooting/python-errors
---

import Img from '@site/src/components/Img';

---

## GRPC shutdown timeout error

```bash
WARNING: All log messages before absl::InitializeLog() is called are written to STDERR
E0000 00:00:1742649420.528891 20723313 init.cc:229] grpc_wait_for_shutdown_with_timeout() timed out.
```

This issue is related to `grpico` library bug which came with version `1.68.1`. This is fixed in latest version of `grpcio` library.
