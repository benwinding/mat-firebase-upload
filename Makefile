deploy-lib:
	yarn build-lib;
	cp -r ./projects/mat-firebase-upload/src/assets dist/mat-firebase-upload;
	cp ./README.md dist/mat-firebase-upload;
	cd ./dist/mat-firebase-upload && npm publish;

deploy-demo:
	yarn build-demo;
	./node_modules/.bin/gh-pages -d ./dist/mat-firebase-upload-demo;
