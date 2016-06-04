all: clean build test jshint jscs

clean:
	rm -rf dist

build: node_modules/webpack/bin/webpack
	./node_modules/webpack/bin/webpack.js 

build-test: node_modules/webpack/bin/webpack
	./node_modules/webpack/bin/webpack.js --config test/test.webpack.config.js

test: build build-test
	npm test

test-unit: build build-test
	npm run test-unit

test-client: build-test
	npm run test-client

publish: build
	npm publish --access=public

runserver: build
	npm run serve

jshint: node_modules/jshint/bin/jshint
	./node_modules/jshint/bin/jshint --config=.jshintrc src test

jscs: node_modules/jscs/bin/jscs
	./node_modules/jscs/bin/jscs src test

node_modules/jshint/bin/jshint: build
	npm install jshint --prefix .

node_modules/jscs/bin/jscs: build
	npm install jscs --prefix .

node_modules/webpack/bin/webpack:
	npm install
