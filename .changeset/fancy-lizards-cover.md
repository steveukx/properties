---
"properties-reader": major
---

### Enhancements since v2:

- Reading properties is now streamlined to optimise inbound processing
  performance, where v2 prepared the internal props store for use in output
  formats (getRaw/path etc) which v3 will now lazily evaluate on read.

- Properties in the return from `props.path()` are lazily evaluated and
  enumerable, allowing the use of `JSON.stringify` etc.

- Generators and iterators used throughout to improve performance when
  reading and writing large properties files.

- TypeScript types now bundled with the package.

### New APIs since v2:

- `props.entries()`
  New preferred means of iterating on all properties, use in `for/of`
  loops as you would with standard `Map` or `Object.entries` objects.

- `props.entries({ parsed: true })`
  New preferred means of iterating on all properties with
  boolean and number property values parsed.

- `props.out()`
  Gets an iterator for the generated output for use in `for/of` loops or
  in an `Array.from()` etc.

### Deprecated APIs since v2:

- `props.bindToExpress`
  Switch to using the separate `bindToExpress(...)` function.

- `props.each`
  Prefer use of `props.entries()` for iterating on the raw values in the reader.

- `props.getAllProperties` 
  Prefer use of `Object.fromEntries( props.entries() )`

### Breaking changes since v2:

- `props.save(filePath): Promise<void>`
   - no longer returns the generated output string, to iterate on the generated
     file content use the new `props.out()` iterator.
   - appends a trailing carriage return to the output file


