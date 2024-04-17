## Unit Test for MutexEventEmit Class

### Test Case 1: Lock and Unlock

**Test Description:** This test case checks if the `lock` and `unlock` methods work correctly.

**Test Steps:**
1. Create an instance of `MutexEventEmit`.
2. Call the `lock` method.
3. Assert that the `isLocked` property is `true`.
4. Call the `unlock` method.
5. Assert that the `isLocked` property is `false`.

**Expected Output:**
- `isLocked` property should be `true` after calling `lock` method.
- `isLocked` property should be `false` after calling `unlock` method.

### Test Case 2: Lock and Unlock with Queue

**Test Description:** This test case checks if the `lock` and `unlock` methods work correctly when there is a queue of locked functions.

**Test Steps:**
1. Create an instance of `MutexEventEmit`.
2. Call the `lock` method twice.
3. Call the `unlock` method once.
4. Assert that the `isLocked` property is `true`.
5. Call the `unlock` method again.
6. Assert that the `isLocked` property is `false`.

**Expected Output:**
- `isLocked` property should be `true` after calling `lock` method twice.
- `isLocked` property should be `false` after calling `unlock` method twice.

### Test Case 3: Execute Locked Function

**Test Description:** This test case checks if the `execute` method correctly locks and unlocks the provided function.

**Test Steps:**
1. Create an instance of `MutexEventEmit`.
2. Create a mock function that returns a promise.
3. Call the `execute` method with the mock function.
4. Assert that the `isLocked` property is `true` during the execution of the mock function.
5. Assert that the `isLocked` property is `false` after the execution of the mock function.

**Expected Output:**
- `isLocked` property should be `true` during the execution of the locked function.
- `isLocked` property should be `false` after the execution of the locked function.