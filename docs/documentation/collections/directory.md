---
description: Collection stored in directory
---

# Directory

This is a collection of documents stored in a directory on disk. Each document in the collection will be stored in its own file inside the directory. Name of each file will correspond to the ID of the document it contains.

A directory-based collection can be created using its factory.

```typescript
database.createCollection('posts', directory({
  path: 'content/posts',
  extension: 'md',
  serializer: yaml({
    frontMatter: true,
    contentKey: 'text'
  })
});
```



