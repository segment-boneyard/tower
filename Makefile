
test:
	duo test/index.js && mocha build/test/index.js

.PHONY: test