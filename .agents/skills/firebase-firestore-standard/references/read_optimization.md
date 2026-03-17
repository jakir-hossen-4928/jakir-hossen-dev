# Firestore Data Read Optimization

Optimizing read operations in Cloud Firestore is critical for both performance and cost-efficiency. Since you are billed per read, unnecessary queries can drive up costs significantly.

## Limit Returned Documents

Always use `limit()` to restrict the number of documents returned by a query, especially for large collections.

```javascript
import { collection, query, limit, getDocs } from "firebase/firestore";

// Get only the top 10 results
const q = query(collection(db, "posts"), limit(10));
const querySnapshot = await getDocs(q);
```

## Pagination

Use cursors (`startAt`, `startAfter`, `endAt`, `endBefore`) to paginate through large datasets instead of fetching everything at once.

```javascript
import { collection, query, orderBy, startAfter, limit, getDocs } from "firebase/firestore";

// Initial query
const firstQuery = query(collection(db, "posts"), orderBy("createdAt"), limit(10));
const documentSnapshots = await getDocs(firstQuery);

// Get the last visible document
const lastVisible = documentSnapshots.docs[documentSnapshots.docs.length-1];

// Construct a new query starting at this document
const nextQuery = query(collection(db, "posts"), orderBy("createdAt"), startAfter(lastVisible), limit(10));
const nextDocs = await getDocs(nextQuery);
```

## Data Structuring for Reads

*   **Denormalization**: Sometimes it's better to duplicate data across documents rather than performing multiple joins (since Firestore doesn't support joins).
*   **Data Aggregation**: If you frequently need summary data (e.g., a count of items, average rating), consider computing and storing this aggregation ahead of time in a separate document or field, rather than querying and calculating it on the fly.
*   **Subcollections vs. Top-level Collections**: Use subcollections when the data is inherently tied to a parent document but can grow unbounded (e.g., comments on a post). Use top-level collections when you need to query across all items (e.g., querying all comments by a specific user across all posts).

## Local Caching and Offline Persistence

Enable offline persistence to cache data locally. This avoids making network requests for data that hasn't changed, significantly reducing data reads.

```javascript
// Web SDK example
import { enableIndexedDbPersistence } from "firebase/firestore";

enableIndexedDbPersistence(db).catch((err) => {
  if (err.code == 'failed-precondition') {
    // Multiple tabs open, persistence can only be enabled in one tab at a a time.
  } else if (err.code == 'unimplemented') {
    // The current browser does not support all of the features required to enable persistence
  }
});
```

## Field Selection (Projections) - Advanced

While REST and Admin SDKs support `select` to specify exactly which fields to return, the Web and Mobile Client SDKs **always download the entire document**.

To optimize payload size on clients:
1.  Keep documents small.
2.  If you have large fields (long text blocks, large arrays) that are only needed occasionally, move them into a separate subcollection or document that is only queried when explicitly required.
