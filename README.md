# Node.js Coverage BRDA Bug Reproduction

This repository demonstrates a bug/limitation in Node.js built-in test coverage where `/* node:coverage ignore next */` comments exclude lines from DA (line coverage) but leave BRDA (branch coverage) entries intact.

## The Problem

When using Node.js native test coverage with ignore comments:

- **DA (Data/Line Coverage)**: Lines are correctly excluded from coverage reporting
- **BRDA (Branch Coverage)**: Branch entries remain in the lcov output, showing as uncovered

This causes misleading coverage reports where ignored code paths still negatively impact branch coverage percentages.

## Reproduction

### Prerequisites

- Node.js v18+ (tested on v24.13.0)

### Steps

1. Clone this repository
2. Install dependencies:

```bash
npm install
```

3. Run the tests with coverage:

```bash
npm run test
```

4. Compare the generated coverage files:
   - `coverage/lcov-native.info` - Node.js native (has the bug)
   - `coverage/lcov.info` - c8 (works correctly)

### Expected Behavior

The `/* node:coverage ignore next */` comment on line 5 of `src/example.js` should exclude **both**:
- The DA entry for line 6 (`return 'falsy';`)
- The BRDA entry for the else branch

### Actual Behavior

- DA for line 6 is excluded (not present in lcov-native.info)
- BRDA entry remains: `BRDA:4,2,0,0` (branch 2 at line 4, taken 0 times)

## File Structure

```
.
├── src/
│   ├── example.js          # Node.js native (node:coverage ignore)
│   └── example-c8.js       # c8 version (c8 ignore)
├── test/
│   ├── example.test.js     # Test for Node.js native
│   └── example-c8.test.js  # Test for c8
├── coverage/
│   ├── lcov-native.info    # Node.js native output (has bug)
│   └── lcov.info           # c8 output (correct)
├── package.json
├── .gitignore
└── README.md
```

## Source Code

**src/example.js** (Node.js native):
```javascript
function getValue(condition) {
  if (condition) {
    return 'truthy';
  }
  /* node:coverage ignore next */
  return 'falsy';
}

module.exports = { getValue };
```

**src/example-c8.js** (c8):
```javascript
function getValue(condition) {
  if (condition) {
    return 'truthy';
  }
  /* c8 ignore next */
  return 'falsy';
}

module.exports = { getValue };
```

## Comparison: Node.js Native vs c8

### Test Commands

```bash
# Run both (recommended)
npm run test

# Node.js native only
npm run test:native

# c8 only
npm run test:c8
```

### Results Comparison

| Aspect | Node.js Native | c8 |
|--------|----------------|-----|
| Ignore comment | `/* node:coverage ignore next */` | `/* c8 ignore next */` |
| Output file | `coverage/lcov-native.info` | `coverage/lcov.info` |
| DA (line) handling | Excluded from report | Marked as covered |
| BRDA (branch) handling | **Remains as uncovered** | Marked as covered |
| Branch coverage | 66.66% (2/3) | 100% (3/3) |

### Node.js Native lcov-native.info (bug)

```
BRDA:1,0,0,1
BRDA:1,1,0,1
BRDA:4,2,0,0    <-- Branch remains as UNCOVERED
BRF:3
BRH:2           <-- Only 2 of 3 branches hit
DA:1,1
DA:2,1
DA:3,1
DA:4,1
DA:5,0
DA:7,1          <-- DA:6 is missing (correctly excluded)
...
```

### c8 lcov.info (correct behavior)

```
DA:1,1
...
DA:5,1          <-- Line marked as covered (ignored)
DA:6,1          <-- Line marked as covered (ignored)
...
BRDA:1,0,0,1
BRDA:1,1,0,1
BRDA:5,2,0,1    <-- Branch marked as covered (ignored)
BRF:3
BRH:3           <-- All 3 branches "hit"
```

## Impact

This bug affects projects that:
- Use Node.js native test runner with `--experimental-test-coverage`
- Use lcov format for coverage reporting
- Have intentionally ignored code paths (error handlers, edge cases, etc.)
- Enforce branch coverage thresholds in CI/CD pipelines

## Workaround

**Recommended**: Use `c8` instead of Node.js native coverage.

```bash
npm install --save-dev c8
npx c8 node --test test/*.test.js
```

Other alternatives:
- Adjust branch coverage thresholds to account for this limitation
- Avoid using ignore comments and test all branches

## Environment

- Node.js: v24.13.0
- OS: macOS (Darwin 24.6.0)
- Coverage flags: `--experimental-test-coverage --test-reporter=lcov`

## Related

- [Node.js Test Runner Documentation](https://nodejs.org/api/test.html)
- [Node.js Coverage Ignore Comments](https://nodejs.org/api/test.html#coverage-reporters)

## License

ISC
