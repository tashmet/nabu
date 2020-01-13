---
description: Collection stored in a single file
---

# File

This is a collection of documents stored in a single file on disk. The file will contain an object with key-value pairs where the key is the ID of the document and the value its content.

A file-based collection can be created using its factory.

```typescript
database.createCollection('authors', file({
  path: 'content/authors.yaml',
  serializer: yaml()
});
```



